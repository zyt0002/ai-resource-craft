
import { corsHeaders } from "../utils/cors.ts";

export async function handleVideoGeneration(prompt: string, model: string, fileUrl: string | null, apiKey: string) {
  console.log(`[AI-Generate] 使用新版视频生成功能，模型: ${model}`);
  const videoModel = "Wan-AI/Wan2.1-T2V-14B";
  
  const postBody: Record<string, any> = {
    model: videoModel,
    prompt,
    image_size: "1280x720",
  };
  
  if (fileUrl) postBody.image = fileUrl;

  // Step 1: 提交生成任务
  const submitResp = await fetch("https://api.siliconflow.cn/v1/video/submit", {
    method: "POST",
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(postBody),
  });

  if (!submitResp.ok) {
    const text = await submitResp.text();
    throw new Error(`视频生成请求失败: ${submitResp.status} ${text}`);
  }
  
  const submitData = await submitResp.json();
  const requestId = submitData.requestId;
  
  if (!requestId) {
    console.error("API未返回requestId:", submitData);
    throw new Error("视频生成API调用失败（未获取到requestId）");
  }
  
  console.log('已提交视频生成请求，requestId:', requestId);

  // Step 2: 轮询取视频链接（最多尝试60秒）
  let videoUrl: string | null = null;
  let attempts = 0;
  const maxAttempts = 12;
  const pollDelay = 5000;
  let statusDetail: string = "";

  while (attempts < maxAttempts && !videoUrl) {
    attempts++;
    await new Promise(res => setTimeout(res, pollDelay));
    console.log(`[Poll] 查询视频状态, attempt ${attempts}/${maxAttempts}`);
    
    const statusResp = await fetch("https://api.siliconflow.cn/v1/video/status", {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ requestId })
    });
    
    if (!statusResp.ok) {
      statusDetail = await statusResp.text();
      console.warn(`[Poll] 视频状态查询失败: ${statusResp.status}`);
      continue;
    }
    
    const statData = await statusResp.json();
    
    if (statData.status === "success" && statData.videoUrl) {
      videoUrl = statData.videoUrl;
      break;
    } else if (statData.status === "failed") {
      statusDetail = statData.message || "生成失败";
      break;
    } else {
      statusDetail = statData.status || "";
    }
  }

  if (videoUrl) {
    console.log('视频生成成功，URL:', videoUrl);
    return new Response(JSON.stringify({
      success: true,
      model: videoModel,
      generationType: "video-generation",
      videoUrl,
      content: "",
      fileProcessed: !!fileUrl,
      multimodalUsed: false,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } else {
    const errMsg = statusDetail
      ? `视频生成超时或失败，最后状态：${statusDetail}`
      : "视频生成超时，未拿到视频地址";
    return new Response(JSON.stringify({
      success: false,
      error: errMsg,
      requestId,
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}
