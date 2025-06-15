
import { corsHeaders } from "../utils/cors.ts";
import { getFileContent, imageToBase64, isImageFile } from "../utils/fileUtils.ts";

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

const multimodalModels = [
  "Qwen/Qwen2.5-VL-32B-Instruct",
];

export async function handleTextGeneration(
  prompt: string, 
  generationType: string, 
  model: string, 
  fileUrl: string | null, 
  apiKey: string
) {
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
      const fileContent = await getFileContent(fileUrl);
      messages.push({
        role: 'user',
        content: prompt + `\n\n文件内容:\n${fileContent}\n\n请根据上述文件内容和用户需求生成相关内容。`
      });
    }
  } else if (fileUrl) {
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
      'Authorization': `Bearer ${apiKey}`,
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
}
