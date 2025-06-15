
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// BAAI/bge-m3 向量模型API配置
const BGE_M3_API_URL = 'https://api.siliconflow.cn/v1/embeddings'

interface DatabaseRecord {
  id: string
  title: string
  content: string
  summary?: string
  category?: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { query } = await req.json()

    if (!query) {
      throw new Error('Query is required')
    }

    console.log('收到RAG查询:', query)

    // 创建Supabase客户端
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    // 首先检查数据库中有多少文档
    const { data: totalArticles, error: countError } = await supabaseClient
      .from('knowledge_base_articles')
      .select('id, title')
      .eq('status', 'active')

    if (countError) {
      console.error('检查文档数量错误:', countError)
    } else {
      console.log(`数据库中共有 ${totalArticles?.length || 0} 篇活跃文档`)
      if (totalArticles && totalArticles.length > 0) {
        console.log('文档标题列表:', totalArticles.map(a => a.title))
      }
    }

    // 1. 尝试多种搜索策略
    let searchResults: any[] = []

    // 策略1: 使用全文搜索 (websearch)
    const { data: websearchResults, error: websearchError } = await supabaseClient
      .from('knowledge_base_articles')
      .select('id, title, content, summary, category')
      .eq('status', 'active')
      .textSearch('search_vector', query, {
        type: 'websearch',
        config: 'simple'
      })
      .limit(10)

    if (!websearchError && websearchResults && websearchResults.length > 0) {
      console.log(`全文搜索找到 ${websearchResults.length} 个结果`)
      searchResults = websearchResults
    } else {
      console.log('全文搜索未找到结果，尝试其他策略')
      
      // 策略2: 使用plainto_tsquery (更简单的文本搜索)
      const { data: plainResults, error: plainError } = await supabaseClient
        .from('knowledge_base_articles')
        .select('id, title, content, summary, category')
        .eq('status', 'active')
        .textSearch('search_vector', query, {
          type: 'plain',
          config: 'simple'
        })
        .limit(10)

      if (!plainError && plainResults && plainResults.length > 0) {
        console.log(`简单文本搜索找到 ${plainResults.length} 个结果`)
        searchResults = plainResults
      } else {
        console.log('简单文本搜索也未找到结果，尝试模糊匹配')
        
        // 策略3: 使用LIKE进行模糊匹配
        const { data: likeResults, error: likeError } = await supabaseClient
          .from('knowledge_base_articles')
          .select('id, title, content, summary, category')
          .eq('status', 'active')
          .or(`title.ilike.%${query}%, content.ilike.%${query}%`)
          .limit(10)

        if (!likeError && likeResults && likeResults.length > 0) {
          console.log(`模糊匹配找到 ${likeResults.length} 个结果`)
          searchResults = likeResults
        } else {
          console.log('所有搜索策略都未找到结果')
          
          // 策略4: 如果还是没有结果，返回所有文档（用于测试）
          const { data: allResults, error: allError } = await supabaseClient
            .from('knowledge_base_articles')
            .select('id, title, content, summary, category')
            .eq('status', 'active')
            .limit(5)

          if (!allError && allResults && allResults.length > 0) {
            console.log(`作为后备，获取前 ${allResults.length} 个文档`)
            searchResults = allResults
          }
        }
      }
    }

    if (!searchResults || searchResults.length === 0) {
      console.log('最终未找到任何相关文档')
      return new Response(
        JSON.stringify({
          answer: '抱歉，我在知识库中没有找到相关信息来回答您的问题。',
          sources: [],
          debug: {
            totalDocuments: totalArticles?.length || 0,
            searchStrategiesUsed: ['websearch', 'plain', 'like', 'fallback'],
            query: query
          }
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    console.log(`最终找到 ${searchResults.length} 个相关文档`)

    // 2. 获取查询向量（使用BAAI/bge-m3模型）
    let queryEmbedding = null
    try {
      const queryEmbeddingResponse = await fetch(BGE_M3_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('SILICONFLOW_API_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'BAAI/bge-m3',
          input: query,
          encoding_format: 'float',
        }),
      })

      if (queryEmbeddingResponse.ok) {
        const embeddingData = await queryEmbeddingResponse.json()
        queryEmbedding = embeddingData.data[0].embedding
        console.log('成功获取查询向量')
      } else {
        console.warn('向量嵌入失败，使用文本搜索结果')
      }
    } catch (e) {
      console.warn('向量嵌入请求失败:', e)
    }

    // 3. 计算相似度（如果有向量）并排序
    let rankedResults = searchResults
    
    if (queryEmbedding) {
      // 为每个文档计算向量并计算相似度
      const documentsWithScores = await Promise.all(
        searchResults.map(async (doc: DatabaseRecord) => {
          try {
            // 限制内容长度以避免API限制
            const contentForEmbedding = doc.content.substring(0, 1500)
            
            const docEmbeddingResponse = await fetch(BGE_M3_API_URL, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${Deno.env.get('SILICONFLOW_API_KEY')}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model: 'BAAI/bge-m3',
                input: contentForEmbedding,
                encoding_format: 'float',
              }),
            })

            if (docEmbeddingResponse.ok) {
              const docEmbeddingData = await docEmbeddingResponse.json()
              const docEmbedding = docEmbeddingData.data[0].embedding
              
              // 计算余弦相似度
              const similarity = cosineSimilarity(queryEmbedding, docEmbedding)
              return { ...doc, relevanceScore: similarity }
            }
          } catch (e) {
            console.warn('获取文档向量失败:', doc.id, e)
          }
          
          return { ...doc, relevanceScore: 0.5 } // 默认分数
        })
      )

      rankedResults = documentsWithScores
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, 5) // 取前5个最相关的
    } else {
      // 如果没有向量，使用文本匹配分数
      rankedResults = searchResults.slice(0, 5).map(doc => ({
        ...doc,
        relevanceScore: 0.7 // 默认分数
      }))
    }

    console.log('排序后的结果数量:', rankedResults.length)

    // 4. 构建上下文
    const context = rankedResults
      .map(doc => `标题: ${doc.title}\n内容: ${doc.content.substring(0, 1000)}`)
      .join('\n\n---\n\n')

    console.log('构建的上下文长度:', context.length)

    // 5. 调用硅基流动生成答案
    const siliconFlowResponse = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SILICONFLOW_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
-        model: 'Qwen/Qwen2.5-7B-Instruct',
+        model: 'Qwen/Qwen2.5-32B-Instruct',
        messages: [
          {
            role: 'system',
            content: `你是一个基于知识库的智能助手。请根据提供的上下文信息回答用户问题。

规则：
1. 只基于提供的上下文信息回答问题
2. 如果上下文中没有相关信息，请明确说明
3. 回答要准确、简洁、有帮助
4. 可以适当引用具体的文档标题
5. 使用中文回答

上下文信息：
${context}`
          },
          {
            role: 'user',
            content: query
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    })

    if (!siliconFlowResponse.ok) {
      const errorText = await siliconFlowResponse.text()
      console.error('硅基流动API请求失败:', errorText)
      throw new Error('硅基流动API请求失败')
    }

    const siliconFlowData = await siliconFlowResponse.json()
    const answer = siliconFlowData.choices[0].message.content

    console.log('生成答案成功')

    // 6. 准备返回的来源信息
    const sources = rankedResults.map(doc => ({
      title: doc.title,
      summary: doc.summary,
      relevanceScore: doc.relevanceScore,
    }))

    return new Response(
      JSON.stringify({
        answer,
        sources,
        debug: {
          totalDocuments: totalArticles?.length || 0,
          searchResultsFound: searchResults.length,
          finalResultsUsed: rankedResults.length,
          hasEmbedding: !!queryEmbedding,
          contextLength: context.length
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    console.error('RAG查询错误:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        answer: '抱歉，系统暂时无法处理您的请求，请稍后再试。',
        sources: []
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})

// 余弦相似度计算函数
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length')
  }
  
  let dotProduct = 0
  let normA = 0
  let normB = 0
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}
