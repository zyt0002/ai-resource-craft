
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const SILICONFLOW_API_KEY = Deno.env.get('SILICONFLOW_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// 支持的模型白名单
const supportedModels = [
  "Qwen/Qwen2.5-7B-Instruct",
  "Tongyi-Zhiwen/QwenLong-L1-32B",
  "Qwen/Qwen3-32B",
  "THUDM/GLM-Z1-32B-0414",
  "Qwen/Qwen2.5-VL-32B-Instruct",
  "Qwen/QwQ-32B",
  "deepseek-ai/DeepSeek-R1-Distill-Qwen-32B",
  "Qwen/Qwen2.5-Coder-32B-Instruct",
  "Qwen/Qwen2.5-32B-Instruct",
  "THUDM/GLM-4-32B-0414",
  "THUDM/GLM-Z1-Rumination-32B-0414",
  "Qwen/Qwen3-14B",
  "Qwen/Qwen2.5-14B-Instruct",
  "deepseek-ai/DeepSeek-R1-Distill-Qwen-14B",
];

// 多模态支持的模型
const multimodalModels = [
  "Qwen/Qwen2.5-VL-32B-Instruct",
  "THUDM/GLM-Z1-32B-0414",
  "THUDM/GLM-Z1-Rumination-32B-0414",
];

// 检查文件是否为图片
function isImageFile(contentType: string): boolean {
  return contentType.includes('image/');
}

// 将图片转换为base64
async function imageToBase64(fileUrl: string): Promise<string | null> {
  try {
    const response = await fetch(fileUrl);
    if (!response.ok) return null;
    
    const arrayBuffer = await response.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    
    return `data:${contentType};base64,${base64}`;
  } catch (error) {
    console.error('图片转换失败:', error);
    return null;
  }
}

// 从URL获取文件内容
async function getFileContent(fileUrl: string): Promise<string> {
  try {
    console.log('正在获取文件内容:', fileUrl);
    const response = await fetch(fileUrl);
    
    if (!response.ok) {
      throw new Error(`获取文件失败: ${response.status} ${response.statusText}`);
    }
    
    const contentType = response.headers.get('content-type') || '';
    console.log('文件类型:', contentType);
    
    // 对于文本文件，直接读取文本内容
    if (contentType.includes('text/')) {
      const textContent = await response.text();
      console.log('文本文件内容长度:', textContent.length);
      return textContent;
    }
    
    // 对于其他类型的文件，返回文件信息
    const arrayBuffer = await response.arrayBuffer();
    const fileSize = arrayBuffer.byteLength;
    
    console.log('文件大小:', fileSize, 'bytes');
    
    // 根据文件类型提供不同的处理信息
    if (contentType.includes('application/pdf')) {
      return `这是一个PDF文件，大小为${fileSize}字节。由于技术限制，无法直接读取PDF内容，请用户提供文件的关键信息或将内容复制到提示中。`;
    } else if (contentType.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document') || 
               contentType.includes('application/msword')) {
      return `这是一个Word文档(.docx/.doc)，大小为${fileSize}字节。由于技术限制，无法直接读取Word文档内容，请用户将文档内容复制到提示中，或者提供文档的主要内容概要。`;
    } else if (contentType.includes('image/')) {
      return `这是一个图片文件，大小为${fileSize}字节。请根据用户的描述或要求来生成相关的教学内容。`;
    } else {
      return `这是一个${contentType}类型的文件，大小为${fileSize}字节。由于技术限制，无法直接读取此类型文件的内容。`;
    }
    
  } catch (error) {
    console.error('获取文件内容失败:', error);
    return `无法获取文件内容，错误: ${error.message}。请确认文件是否可以正常访问，或者将文件内容直接复制到提示中。`;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, generationType, model, fileUrl } = await req.json();
    console.log('收到请求:', { prompt, generationType, model, fileUrl });
    
    if (!SILICONFLOW_API_KEY) throw new Error('硅基流动 API 密钥未配置');

    // 统一兼容未选择/不支持时 fallback
    const targetModel = supportedModels.includes(model) ? model : "Qwen/Qwen2.5-7B-Instruct";

    const systemPrompts = {
      courseware: "你是一个专业的教学课件生成助手。请根据用户提供的主题和要求，生成结构化的课件内容，包括标题、要点、详细说明等。",
      image: "你是一个图像描述生成助手。请根据用户需求生成详细的图像描述，用于教学插图或图表。",
      document: "你是一个教学文档生成助手。请根据用户要求生成完整的教学文档，包括教案、练习题等。",
      video: "你是一个视频脚本生成助手。请根据用户需求生成教学视频的脚本内容。",
      audio: "你是一个音频内容生成助手。请根据用户需求生成音频教学内容的文本稿。",
    };

    // 构建消息数组
    const messages = [
      {
        role: 'system',
        content: systemPrompts[generationType as keyof typeof systemPrompts] || systemPrompts.document
      }
    ];

    // 处理用户消息和文件
    if (fileUrl && multimodalModels.includes(targetModel)) {
      console.log('使用多模态模型处理文件:', targetModel);
      
      // 检查文件类型
      const response = await fetch(fileUrl, { method: 'HEAD' });
      const contentType = response.headers.get('content-type') || '';
      
      if (isImageFile(contentType)) {
        // 对于图片，使用多模态格式
        console.log('处理图片文件，使用多模态格式');
        const imageBase64 = await imageToBase64(fileUrl);
        
        if (imageBase64) {
          messages.push({
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt + '\n\n请分析上传的图片内容，并根据图片生成相关的教学资源。'
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageBase64
                }
              }
            ]
          });
        } else {
          // 图片处理失败，回退到文本模式
          const fileContent = await getFileContent(fileUrl);
          messages.push({
            role: 'user',
            content: prompt + `\n\n用户上传的文件信息:\n${fileContent}\n\n请根据上述信息来生成相关的教学资源。`
          });
        }
      } else {
        // 对于非图片文件，获取内容并以文本形式处理
        console.log('处理非图片文件');
        const fileContent = await getFileContent(fileUrl);
        messages.push({
          role: 'user',
          content: prompt + `\n\n用户上传的文件内容或信息:\n${fileContent}\n\n请根据上述文件内容来生成相关的教学资源。`
        });
      }
    } else if (fileUrl) {
      // 非多模态模型，使用文本描述
      console.log('使用文本模型处理文件');
      const fileContent = await getFileContent(fileUrl);
      messages.push({
        role: 'user',
        content: prompt + `\n\n用户上传的文件内容或信息:\n${fileContent}\n\n请根据上述文件内容来生成相关的教学资源。`
      });
    } else {
      // 没有文件，直接使用提示
      messages.push({
        role: 'user',
        content: prompt
      });
    }

    console.log('发送到API的消息:', JSON.stringify(messages, null, 2));

    const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SILICONFLOW_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: targetModel,
        messages: messages,
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`硅基流动 API 错误: ${response.statusText}`);
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;

    console.log('生成完成:', { model: targetModel, contentLength: generatedContent.length });

    return new Response(
      JSON.stringify({ 
        success: true,
        content: generatedContent,
        model: targetModel,
        generationType: generationType,
        fileProcessed: !!fileUrl,
        multimodalUsed: fileUrl && multimodalModels.includes(targetModel)
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('AI生成错误:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
