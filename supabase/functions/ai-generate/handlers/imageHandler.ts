
import { corsHeaders } from "../utils/cors.ts";

export async function handleImageGeneration(prompt: string, apiKey: string) {
  const imageModel = "Kwai-Kolors/Kolors";
  console.log(`[AI-Generate] 使用图片生成功能: ${imageModel}`);
  
  const resp = await fetch("https://api.siliconflow.cn/v1/images/generations", {
    method: "POST",
    headers: {
      'Authorization': `Bearer ${apiKey}`,
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
  let imageUrl: string | null = null;

  if (imageResData?.data?.[0]?.b64_json) {
    imageBase64 = `data:image/png;base64,${imageResData.data[0].b64_json}`;
    console.log('直接获取到 b64_json');
  } else if (imageResData?.data?.[0]?.url) {
    imageUrl = imageResData.data[0].url;
    console.log('使用 data[0].url，直接返回图片url');
  } else if (imageResData?.images?.[0]?.url) {
    imageUrl = imageResData.images[0].url;
    console.log('使用 images[0].url，直接返回图片url');
  } else {
    console.error("未能识别图片API返回的数据结构:", JSON.stringify(imageResData));
  }

  if (!imageBase64 && !imageUrl) {
    throw new Error("图片API未返回有效图片。返回内容: " + JSON.stringify(imageResData));
  }

  console.log('图片生成成功，imageBase64:', !!imageBase64, 'imageUrl:', imageUrl);

  return new Response(JSON.stringify({
    success: true,
    model: imageModel,
    generationType: "image",
    imageBase64: imageBase64,
    imageUrl: imageUrl,
    content: "",
    fileProcessed: false,
    multimodalUsed: false
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
