
// 支持接收 multipart/form-data，并转发到硅基流动语音转文字API
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SILICONFLOW_API_KEY = Deno.env.get('SILICONFLOW_API_KEY');

function getBoundary(contentType: string) {
  const match = contentType.match(/boundary=([^\s;]+)/i);
  return match ? match[1] : undefined;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 解析 multipart/form-data
    const contentType = req.headers.get("content-type") || "";
    const boundary = getBoundary(contentType);
    if (!boundary) throw new Error("No multipart boundary found.");

    const formData = await req.formData();
    const audioFile = formData.get("file") as File | null;

    if (!audioFile) {
      return new Response(JSON.stringify({ error: "Missing file" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 构造要发送的 form
    const sfForm = new FormData();
    sfForm.append("model", "FunAudioLLM/SenseVoiceSmall");
    sfForm.append("file", audioFile, audioFile.name);

    // 转发到硅基流动API
    const sfRes = await fetch("https://api.siliconflow.cn/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${SILICONFLOW_API_KEY}`,
        // 不要设置 Content-Type，会自动生成
      },
      body: sfForm,
    });

    const sfOut = await sfRes.json();

    if (!sfRes.ok) {
      console.error("[Voice2Text] API Error:", sfOut);
      return new Response(JSON.stringify({
        error: sfOut?.error || "识别失败",
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 返回文本
    return new Response(JSON.stringify({ text: sfOut.text || sfOut.data || "" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[Voice2Text] Handler error:", err);
    return new Response(JSON.stringify({ error: err?.message || "服务内部错误" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
