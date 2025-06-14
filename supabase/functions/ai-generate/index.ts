
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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, generationType, model } = await req.json();
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

    const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SILICONFLOW_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: targetModel,
        messages: [
          {
            role: 'system',
            content: systemPrompts[generationType as keyof typeof systemPrompts] || systemPrompts.document
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`硅基流动 API 错误: ${response.statusText}`);
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ 
        success: true,
        content: generatedContent,
        model: targetModel,
        generationType: generationType 
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
