
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

    // 创建Supabase客户端
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    // 1. 首先使用PostgreSQL全文检索获取相关文档
    const { data: searchResults, error: searchError } = await supabaseClient
      .from('knowledge_base_articles')
      .select('id, title, content, summary, category')
      .eq('status', 'active')
      .textSearch('search_vector', query, {
        type: 'websearch',
        config: 'simple'
      })
      .limit(10)

    if (searchError) {
      throw new Error(`Search error: ${searchError.message}`)
    }

    if (!searchResults || searchResults.length === 0) {
      return new Response(
        JSON.stringify({
          answer: '抱歉，我在知识库中没有找到相关信息来回答您的问题。',
          sources: [],
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    // 2. 获取查询向量（使用BAAI/bge-m3模型）
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

    if (!queryEmbeddingResponse.ok) {
      console.warn('Vector embedding failed, using text search results only')
    }

    let queryEmbedding = null
    try {
      const embeddingData = await queryEmbeddingResponse.json()
      queryEmbedding = embeddingData.data[0].embedding
    } catch (e) {
      console.warn('Failed to parse embedding response:', e)
    }

    // 3. 计算相似度（如果有向量）并排序
    let rankedResults = searchResults
    
    if (queryEmbedding) {
      // 为每个文档计算向量（这里简化处理，实际应该预先计算并存储）
      const documentsWithScores = await Promise.all(
        searchResults.map(async (doc: DatabaseRecord) => {
          try {
            const docEmbeddingResponse = await fetch(BGE_M3_API_URL, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${Deno.env.get('SILICONFLOW_API_KEY')}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model: 'BAAI/bge-m3',
                input: doc.content.substring(0, 2000), // 限制长度
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
            console.warn('Failed to get embedding for document:', doc.id, e)
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

    // 4. 构建上下文
    const context = rankedResults
      .map(doc => `标题: ${doc.title}\n内容: ${doc.content}`)
      .join('\n\n---\n\n')

    // 5. 调用OpenAI生成答案
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `你是一个基于知识库的智能助手。请根据提供的上下文信息回答用户问题。

规则：
1. 只基于提供的上下文信息回答问题
2. 如果上下文中没有相关信息，请明确说明
3. 回答要准确、简洁、有帮助
4. 可以适当引用具体的文档标题

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

    if (!openaiResponse.ok) {
      throw new Error('OpenAI API request failed')
    }

    const openaiData = await openaiResponse.json()
    const answer = openaiData.choices[0].message.content

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
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    console.error('RAG query error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
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
