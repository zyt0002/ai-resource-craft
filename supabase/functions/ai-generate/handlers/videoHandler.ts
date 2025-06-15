
import { corsHeaders } from "../utils/cors.ts";

export async function handleVideoGeneration(prompt: string, model: string, fileUrl: string | null, apiKey: string) {
  console.log(`[AI-Generate] 使用新版视频生成功能，模型: ${model}`);
  console.log(`[AI-Generate] API密钥状态: ${apiKey ? '已配置' : '未配置'}`);
  console.log(`[AI-Generate] 提示词: ${prompt}`);
  console.log(`[AI-Generate] 文件URL: ${fileUrl}`);
  
  const videoModel = "Wan-AI/Wan2.1-T2V-14B";
  
  const postBody: Record<string, any> = {
    model: videoModel,
    prompt,
    image_size: "1280x720",
  };
  
  if (fileUrl) postBody.image = fileUrl;

  console.log(`[AI-Generate] 请求体:`, JSON.stringify(postBody, null, 2));

  // Step 1: 提交生成任务
  console.log(`[AI-Generate] 发送视频生成请求到: https://api.siliconflow.cn/v1/video/submit`);
  const submitResp = await fetch("https://api.siliconflow.cn/v1/video/submit", {
    method: "POST",
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(postBody),
  });

  console.log(`[AI-Generate] 提交响应状态: ${submitResp.status}`);
  
  if (!submitResp.ok) {
    const text = await submitResp.text();
    console.error(`[AI-Generate] 视频生成请求失败: ${submitResp.status} ${text}`);
    throw new Error(`视频生成请求失败: ${submitResp.status} ${text}`);
  }
  
  const submitData = await submitResp.json();
  console.log(`[AI-Generate] 提交响应数据:`, JSON.stringify(submitData, null, 2));
  const requestId = submitData.requestId;
  
  if (!requestId) {
    console.error("API未返回requestId:", submitData);
    throw new Error("视频生成API调用失败（未获取到requestId）");
  }
  
  console.log('已提交视频生成请求，requestId:', requestId);

  // Step 2: 轮询取视频链接（最多尝试8分钟，每10秒查询一次）
  let videoUrl: string | null = null;
  let attempts = 0;
  const maxAttempts = 48; // 8分钟 * 6次/分钟 = 48次
  const pollDelay = 10000; // 10秒
  let statusDetail: string = "";

  while (attempts < maxAttempts && !videoUrl) {
    attempts++;
    await new Promise(res => setTimeout(res, pollDelay));
    console.log(`[Poll] 查询视频状态, attempt ${attempts}/${maxAttempts}, 已等待 ${(attempts * pollDelay / 1000).toFixed(0)} 秒`);
    
    const statusResp = await fetch("https://api.siliconflow.cn/v1/video/status", {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ requestId })
    });
    
    console.log(`[Poll] 状态查询响应: ${statusResp.status}`);
    
    if (!statusResp.ok) {
      statusDetail = await statusResp.text();
      console.warn(`[Poll] 视频状态查询失败: ${statusResp.status}, 响应: ${statusDetail}`);
      continue;
    }
    
    const statData = await statusResp.json();
    console.log(`[Poll] 状态数据:`, JSON.stringify(statData, null, 2));
    
    if (statData.status === "success" && statData.videoUrl) {
      videoUrl = statData.videoUrl;
      console.log(`[Poll] 视频生成成功! URL: ${videoUrl}`);
      break;
    } else if (statData.status === "failed") {
      statusDetail = statData.message || "生成失败";
      console.error(`[Poll] 视频生成失败: ${statusDetail}`);
      break;
    } else {
      statusDetail = statData.status || "";
      console.log(`[Poll] 当前状态: ${statusDetail}`);
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
      ? `视频生成超时或失败，最后状态：${statusDetail}，已等待 ${(maxAttempts * pollDelay / 60000).toFixed(1)} 分钟`
      : `视频生成超时，已等待 ${(maxAttempts * pollDelay / 60000).toFixed(1)} 分钟未获取到视频地址`;
    console.error(`[AI-Generate] ${errMsg}`);
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
