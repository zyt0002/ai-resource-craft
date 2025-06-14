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
  "FLUX.1 Schnell",
  "SD 3.5 Large",
  "black-forest-labs/FLUX.1-schnell", // 新增
];

const fluxLikeModels = [
  "FLUX.1 Schnell",
  "black-forest-labs/FLUX.1-schnell",
  "SD 3.5 Large",
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

    // ======================= 图片生成功能 优化 ======================
    if (generationType === "image") {
      // 优先 FLUX/SD 等直接调用硅基流动图片API，兼容黑森林FLUX.1
      let imageModel = "black-forest-labs/FLUX.1-schnell";
      if (model && fluxLikeModels.includes(model)) {
        imageModel = "black-forest-labs/FLUX.1-schnell";
      } else if (model && model === "Kwai-Kolors/Kolors") {
        imageModel = "Kwai-Kolors/Kolors";
      } else if (model && model === "SD 3.5 Large") {
        imageModel = "SD 3.5 Large";
      }

      // black-forest-labs/FLUX.1-schnell 及 SD 3.5、Kolors 走统一图片生成 API
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

      // 处理所有可能返回结构优先级
      if (imageResData?.data?.[0]?.b64_json) {
        imageBase64 = `data:image/png;base64,${imageResData.data[0].b64_json}`;
        console.log('直接获取到 b64_json');
      } else if (imageResData?.data?.[0]?.url) {
        // 新版 API 形式
        console.log('通过 data[0].url 获取图片');
        imageBase64 = await fetchImageBase64FromUrl(imageResData.data[0].url);
      } else if (imageResData?.images?.[0]?.url) {
        // 某些模型会返回 images 字段
        console.log('通过 images[0].url 获取图片');
        imageBase64 = await fetchImageBase64FromUrl(imageResData.images[0].url);
      } else {
        // 均无结果
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

    // =============== 其余原有文本/多模态等逻辑不变 ================
    const targetModel = supportedModels.includes(model) ? model : "Qwen/Qwen2.5-7B-Instruct";

    // 精简弱化后的 system prompt，只作为补充，不做硬性结构要求
    const systemPrompts = {
      courseware: "你是专业支持教学内容的AI助手。请优先参考用户输入指令，补充专业建议即可。",
      image: "你是AI图像内容建议助手。请以用户需求为主，可适当补充优化建议。",
      document: "你是教辅AI助手。请以用户指令为主生成教学文本，补充合理性建议即可。",
      video: "你是脚本AI助手，输出风格与内容以用户指令为主。",
      audio: "你是音频内容辅助助手，请将输出风格以用户意图为准。",
    };

    // 构建消息数组，system prompt 仅作补充
    const messages = [
      {
        role: 'system',
        content: systemPrompts[generationType as keyof typeof systemPrompts] || "你是AI内容生成助手，请以用户输入为主要依据。"
      }
    ];

    // 处理用户消息和文件
    if (fileUrl && multimodalModels.includes(targetModel)) {
      console.log('使用多模态模型处理文件:', targetModel);
      const response = await fetch(fileUrl, { method: 'HEAD' });
      const contentType = response.headers.get('content-type') || '';
      
      if (isImageFile(contentType)) {
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
            content: prompt + `\n\n用户上传的文件信息:\n${fileContent}\n\n请根据上述信息来生成相关内容。`
          });
        }
      } else {
        // 非图片文件仍然走文本描述
        const fileContent = await getFileContent(fileUrl);
        messages.push({
          role: 'user',
          content: prompt + `\n\n用户上传的文件内容或信息:\n${fileContent}\n\n请根据上述文件内容来生成相关内容。`
        });
      }
    } else if (fileUrl) {
      // 非多模态模型，仍然拼接文件信息到 user prompt
      const fileContent = await getFileContent(fileUrl);
      messages.push({
        role: 'user',
        content: prompt + `\n\n用户上传的文件内容或信息:\n${fileContent}\n\n请结合上述内容生成相关资源。`
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
