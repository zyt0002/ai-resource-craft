
import { corsHeaders } from "../utils/cors.ts";

export async function handleSpeechToText(
  fileUrl: string | null,
  model: string,
  SILICONFLOW_API_KEY: string
) {
  console.log('开始处理语音转文字请求');
  
  if (!fileUrl) {
    console.error('没有提供音频文件URL');
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: '请上传音频文件' 
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    console.log('开始下载音频文件:', fileUrl);
    
    // 下载音频文件
    const audioResponse = await fetch(fileUrl);
    if (!audioResponse.ok) {
      throw new Error(`下载音频文件失败: ${audioResponse.status}`);
    }
    
    const audioBlob = await audioResponse.blob();
    console.log('音频文件下载完成，大小:', audioBlob.size);

    // 准备FormData
    const formData = new FormData();
    formData.append("file", audioBlob, "audio.wav");
    formData.append("model", model);

    console.log('开始调用SiliconFlow语音转文字API');
    console.log('使用模型:', model);

    // 调用SiliconFlow语音转文字API
    const response = await fetch('https://api.siliconflow.cn/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SILICONFLOW_API_KEY}`,
      },
      body: formData,
    });

    console.log('SiliconFlow API响应状态:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('SiliconFlow API错误响应:', errorText);
      throw new Error(`SiliconFlow API请求失败: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('语音转文字成功:', result);

    return new Response(
      JSON.stringify({ 
        success: true, 
        content: result.text,
        model: model
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('语音转文字处理错误:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: `语音转文字失败: ${error.message}` 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
}
