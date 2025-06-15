
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { handleImageGeneration } from "./handlers/imageHandler.ts";
import { handleVideoGeneration } from "./handlers/videoHandler.ts";
import { handleTextGeneration } from "./handlers/textHandler.ts";
import { handleAudioGeneration } from "./handlers/audioHandler.ts";
import { handleSpeechToText } from "./handlers/speechToTextHandler.ts";
import { corsHeaders } from "./utils/cors.ts";

const SILICONFLOW_API_KEY = Deno.env.get('SILICONFLOW_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, generationType, model, fileUrl, voice } = await req.json();
    console.log('收到请求:', { prompt, generationType, model, fileUrl, voice });
    
    if (!SILICONFLOW_API_KEY) {
      console.error('硅基流动 API 密钥未配置');
      throw new Error('硅基流动 API 密钥未配置');
    }

    console.log('API密钥状态:', SILICONFLOW_API_KEY ? '已配置' : '未配置');
    console.log('API密钥前缀:', SILICONFLOW_API_KEY ? SILICONFLOW_API_KEY.substring(0, 10) + '...' : 'N/A');

    // 根据生成类型路由到不同的处理器
    switch (generationType) {
      case "image":
        console.log('路由到图像生成处理器');
        return await handleImageGeneration(prompt, SILICONFLOW_API_KEY);
      
      case "video-generation":
        console.log('路由到视频生成处理器');
        return await handleVideoGeneration(prompt, model, fileUrl, SILICONFLOW_API_KEY);
      
      case "audio":
        console.log('路由到音频生成处理器');
        return await handleAudioGeneration(prompt, voice, SILICONFLOW_API_KEY);
      
      case "speech-to-text":
        console.log('路由到语音转文字处理器');
        return await handleSpeechToText(fileUrl, model, SILICONFLOW_API_KEY);
      
      default:
        console.log('路由到文本生成处理器');
        return await handleTextGeneration(prompt, generationType, model, fileUrl, SILICONFLOW_API_KEY);
    }
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
