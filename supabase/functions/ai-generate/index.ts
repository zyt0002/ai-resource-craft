
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const SILICONFLOW_API_KEY = Deno.env.get('SILICONFLOW_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
  "Kwai-Kolors/Kolors",
];

const multimodalModels = [
  "Qwen/Qwen2.5-VL-32B-Instruct",
];

// 检查文件是否为图片
function isImageFile(contentType: string, fileName: string): boolean {
  if (contentType.includes('image/')) return true;
  // 通过文件扩展名判断
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
  return imageExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
}

// 检查文件是否为文本文件
function isTextFile(contentType: string, fileName: string): boolean {
  // 直接通过Content-Type判断
  if (contentType.includes('text/')) return true;
  if (contentType.includes('application/json')) return true;
  if (contentType.includes('application/xml')) return true;
  
  // 通过文件扩展名判断常见的文本文件
  const textExtensions = ['.txt', '.md', '.markdown', '.json', '.xml', '.csv', '.log', '.yml', '.yaml', '.ini', '.cfg', '.conf'];
  return textExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
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

// 将图片 URL 下载并转为 base64
async function fetchImageBase64FromUrl(url: string): Promise<string | null> {
  try {
    const resp = await fetch(url);
    if (!resp.ok) return null;
    const buf = await resp.arrayBuffer();
    const mime = resp.headers.get('content-type') || 'image/jpeg';
    const b64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
    return `data:${mime};base64,${b64}`;
  } catch (e) {
    console.error('下载图片转 base64 失败:', e);
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
    
    // 从URL中提取文件名
    const urlParts = fileUrl.split('/');
    const fileName = urlParts[urlParts.length - 1] || '';
    console.log('文件名:', fileName);
    
    // 优先通过文件扩展名和内容类型判断是否为文本文件
    if (isTextFile(contentType, fileName)) {
      const textContent = await response.text();
      console.log('成功读取文本文件，内容长度:', textContent.length);
      return textContent;
    }
    
    // 对于其他类型的文件，返回详细的错误信息和建议
    const arrayBuffer = await response.arrayBuffer();
    const fileSize = arrayBuffer.byteLength;
    
    console.log('文件大小:', fileSize, 'bytes');
    
    // 根据文件类型提供不同的处理信息
    if (contentType.includes('application/pdf') || fileName.toLowerCase().endsWith('.pdf')) {
      return `检测到PDF文件（${fileSize}字节），但当前系统无法直接解析PDF内容。建议：
1. 将PDF内容复制粘贴到输入框中
2. 或者描述PDF的主要内容，我可以根据你的描述生成相关资料
3. 如果是文字较少的PDF，可以截图上传`;
    } else if (contentType.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document') || 
               contentType.includes('application/msword') ||
               fileName.toLowerCase().endsWith('.docx') ||
               fileName.toLowerCase().endsWith('.doc')) {
      return `检测到Word文档（${fileSize}字节），但当前系统无法直接解析Word文档内容。建议：
1. 打开Word文档，复制文字内容并粘贴到输入框中
2. 或者告诉我文档的主题和要点，我可以据此生成相关教学资料
3. 如果文档包含重要图表，可以截图上传`;
    } else if (contentType.includes('application/vnd.ms-excel') || 
               contentType.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') ||
               fileName.toLowerCase().endsWith('.xlsx') ||
               fileName.toLowerCase().endsWith('.xls')) {
      return `检测到Excel文件（${fileSize}字节），但当前系统无法直接解析Excel内容。建议：
1. 将Excel中的关键数据复制粘贴到输入框中
2. 或者描述表格的结构和主要数据，我可以生成相关的教学内容
3. 如果需要保持表格格式，可以截图上传`;
    } else if (isImageFile(contentType, fileName)) {
      return `这是一个图片文件（${fileSize}字节）。如果选择了支持视觉的多模态模型（如Qwen2.5-VL），可以直接分析图片内容。`;
    } else {
      return `检测到${contentType || '未知'}类型文件（${fileSize}字节）。当前系统暂不支持直接解析此类文件。建议：
1. 如果是文本内容，请复制粘贴到输入框中
2. 或者描述文件的主要内容，我可以根据描述生成相关资料`;
    }
    
  } catch (error) {
    console.error('获取文件内容失败:', error);
    return `文件访问失败：${error.message}。请确认：
1. 文件链接是否有效
2. 文件是否可以正常访问
3. 或者将文件内容直接复制粘贴到输入框中`;
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

    // ======================= 图片生成功能 ======================
    if (generationType === "image") {
      const imageModel = "Kwai-Kolors/Kolors";
      console.log(`[AI-Generate] 使用图片生成功能: ${imageModel}`);
      const resp = await fetch("https://api.siliconflow.cn/v1/images/generations", {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${SILICONFLOW_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: imageModel,
          prompt: prompt,
          image_size: "1024x1024",
          batch_size: 1,
          num_inference_steps: 20,
        }),
      });

      if (!resp.ok) {
        console.error('图片生成API返回异常:', resp.status, await resp.text());
        throw new Error(`图片生成失败: ${resp.statusText}`);
      }

      const imageResData = await resp.json();

      let imageBase64: string | null = null;

      // 只关注 data[0].b64_json 或 data[0].url
      if (imageResData?.data?.[0]?.b64_json) {
        imageBase64 = `data:image/png;base64,${imageResData.data[0].b64_json}`;
        console.log('直接获取到 b64_json');
      } else if (imageResData?.data?.[0]?.url) {
        // 新版 API 形式
        console.log('通过 data[0].url 获取图片');
        imageBase64 = await fetchImageBase64FromUrl(imageResData.data[0].url);
      } else {
        console.error("未能识别图片API返回的数据结构:", JSON.stringify(imageResData));
      }

      if (!imageBase64) {
        throw new Error("图片API未返回有效图片。返回内容: " + JSON.stringify(imageResData));
      }

      console.log('图片生成成功，返回base64长度:', imageBase64.length);

      return new Response(JSON.stringify({
        success: true,
        model: imageModel,
        generationType,
        imageBase64: imageBase64,
        content: "",
        fileProcessed: false,
        multimodalUsed: false
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // =============== 文本生成逻辑 ================
    const targetModel = supportedModels.includes(model) ? model : "Qwen/Qwen2.5-7B-Instruct";

    // 系统提示
    const systemPrompts = {
      courseware: "你是专业的教学内容生成助手。请根据用户提供的信息和文件内容，生成高质量的教学课件内容。如果用户上传了文件但系统无法解析，请根据用户的描述和需求生成相应内容。",
      image: "你是AI图像内容建议助手。请以用户需求为主，可适当补充优化建议。",
      document: "你是教学文档生成助手。请根据用户的需求和提供的材料，生成结构清晰、内容丰富的教学文档。",
      video: "你是视频脚本生成助手。请根据用户需求生成适合的视频脚本内容。",
      audio: "你是音频内容生成助手。请根据用户需求生成适合的音频脚本内容。",
    };

    // 构建消息数组
    const messages = [
      {
        role: 'system',
        content: systemPrompts[generationType as keyof typeof systemPrompts] || "你是AI内容生成助手，请根据用户的输入和文件内容生成相应内容。"
      }
    ];

    // 处理用户消息和文件
    if (fileUrl && multimodalModels.includes(targetModel)) {
      console.log('使用多模态模型处理文件:', targetModel);
      const response = await fetch(fileUrl, { method: 'HEAD' });
      const contentType = response.headers.get('content-type') || '';
      
      // 从URL中提取文件名
      const urlParts = fileUrl.split('/');
      const fileName = urlParts[urlParts.length - 1] || '';
      
      if (isImageFile(contentType, fileName)) {
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
          const fileContent = await getFileContent(fileUrl);
          messages.push({
            role: 'user',
            content: prompt + `\n\n文件处理信息:\n${fileContent}\n\n请根据上述信息和用户需求生成相关内容。`
          });
        }
      } else {
        // 非图片文件，获取文件信息
        const fileContent = await getFileContent(fileUrl);
        messages.push({
          role: 'user',
          content: prompt + `\n\n文件内容:\n${fileContent}\n\n请根据上述文件内容和用户需求生成相关内容。`
        });
      }
    } else if (fileUrl) {
      // 非多模态模型，获取文件信息
      const fileContent = await getFileContent(fileUrl);
      messages.push({
        role: 'user',
        content: prompt + `\n\n文件内容:\n${fileContent}\n\n请根据上述文件内容和用户需求生成相关内容。`
      });
    } else {
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
