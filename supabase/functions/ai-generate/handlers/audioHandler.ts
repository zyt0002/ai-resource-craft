
import { corsHeaders } from "../utils/cors.ts";

export async function handleAudioGeneration(prompt: string, voice: string, apiKey: string) {
  console.log(`[AI-Generate] 使用文本转语音功能，模型: FunAudioLLM/CosyVoice2-0.5B`);
  console.log(`[AI-Generate] 音色: ${voice}`);
  console.log(`[AI-Generate] 文本内容: ${prompt}`);
  
  const audioModel = "FunAudioLLM/CosyVoice2-0.5B";
  
  const requestBody = {
    model: audioModel,
    input: prompt,
    voice: voice || "FunAudioLLM/CosyVoice2-0.5B:alex",
    response_format: "mp3",
    sample_rate: 32000,
    stream: false,
    speed: 1,
    gain: 0
  };

  console.log(`[AI-Generate] 请求体:`, JSON.stringify(requestBody, null, 2));

  try {
    console.log(`[AI-Generate] 发送音频生成请求到: https://api.siliconflow.cn/v1/audio/speech`);
    const response = await fetch("https://api.siliconflow.cn/v1/audio/speech", {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log(`[AI-Generate] 音频生成响应状态: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[AI-Generate] 音频生成请求失败: ${response.status} ${errorText}`);
      throw new Error(`音频生成请求失败: ${response.status} ${errorText}`);
    }
    
    // 获取音频数据
    const audioBuffer = await response.arrayBuffer();
    const base64Audio = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));
    
    console.log(`[AI-Generate] 音频生成成功，数据大小: ${audioBuffer.byteLength} bytes`);

    return new Response(JSON.stringify({
      success: true,
      model: audioModel,
      generationType: "audio",
      audioBase64: base64Audio,
      voice: voice,
      content: "",
      fileProcessed: false,
      multimodalUsed: false,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error(`[AI-Generate] 音频生成错误:`, error);
    return new Response(JSON.stringify({
      success: false,
      error: `音频生成失败: ${error.message}`,
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}
