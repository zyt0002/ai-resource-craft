
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileAudio } from "lucide-react";

export default function VoiceToTextPanel() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [recognizeLoading, setRecognizeLoading] = useState(false);
  const [resultText, setResultText] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setAudioFile(null);
    setResultText("");
    setErrorMsg(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  // 上传音频并调用后端进行识别
  const handleRecognize = async () => {
    if (!audioFile) {
      setErrorMsg("请选择音频文件");
      return;
    }
    setErrorMsg(null);
    setRecognizeLoading(true);
    setResultText("");
    try {
      const formData = new FormData();
      formData.append("file", audioFile);

      const res = await fetch("/functions/v1/voice-to-text", {
        method: "POST",
        body: formData,
      });

      // 新增：先判断 content-type 是否为 json
      const respContentType = res.headers.get("content-type") || "";
      if (!respContentType.includes("application/json")) {
        const text = await res.text();
        setErrorMsg(`服务响应异常（不是JSON）：${text}`);
        return;
      }

      const result = await res.json();
      if (res.ok && result.text) {
        setResultText(result.text);
      } else {
        setErrorMsg(result.error || "识别失败");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "网络错误");
    } finally {
      setRecognizeLoading(false);
    }
  };

  return (
    <div className="space-y-4 overflow-auto p-2">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <FileAudio className="w-5 h-5" />
        语音转文字（ASR）
      </h3>
      <Label>选择音频文件</Label>
      <Input
        ref={inputRef}
        type="file"
        accept="audio/*"
        disabled={recognizeLoading}
        onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
      />
      {audioFile && (
        <div className="text-sm text-muted-foreground line-clamp-1">
          文件: {audioFile.name}（{(audioFile.size / 1024).toFixed(2)} KB）
        </div>
      )}

      <div className="flex gap-2">
        <Button
          onClick={handleRecognize}
          disabled={!audioFile || recognizeLoading}
          className="flex-1"
        >
          <Upload className="w-4 h-4 mr-1" />
          {recognizeLoading ? "识别中..." : "上传识别"}
        </Button>
        <Button
          onClick={reset}
          variant="outline"
          type="button"
          disabled={recognizeLoading}
        >
          重置
        </Button>
      </div>

      {errorMsg && (
        <div className="text-sm text-destructive">{errorMsg}</div>
      )}
      {resultText && (
        <div className="space-y-2 mt-2">
          <Label>识别结果</Label>
          <div className="p-3 bg-gray-50 rounded text-sm break-words max-h-40 overflow-y-auto border border-gray-200">
            {resultText}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              navigator.clipboard.writeText(resultText);
            }}
          >
            复制识别内容
          </Button>
        </div>
      )}
      <div className="text-xs text-muted-foreground mt-4">
        支持多种主流音频格式（如 mp3, wav, m4a, webm 等），推荐文件不超过30MB。
      </div>
    </div>
  );
}
