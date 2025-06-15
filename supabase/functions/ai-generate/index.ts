
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { handleImageGeneration } from "./handlers/imageHandler.ts";
import { handleVideoGeneration } from "./handlers/videoHandler.ts";
import { handleTextGeneration } from "./handlers/textHandler.ts";
import { corsHeaders } from "./utils/cors.ts";

const SILICONFLOW_API_KEY = Deno.env.get('SILICONFLOW_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, generationType, model, fileUrl } = await req.json();
    console.log('收到请求:', { prompt, generationType, model, fileUrl });
    
    if (!SILICONFLOW_API_KEY) throw new Error('硅基流动 API 密钥未配置');

    // 根据生成类型路由到不同的处理器
    switch (generationType) {
      case "image":
        return await handleImageGeneration(prompt, SILICONFLOW_API_KEY);
      
      case "video-generation":
        return await handleVideoGeneration(prompt, model, fileUrl, SILICONFLOW_API_KEY);
      
      default:
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
