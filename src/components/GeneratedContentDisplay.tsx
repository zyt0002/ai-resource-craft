
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface GeneratedContentDisplayProps {
  generatedContent: string;
  generatedImageBase64: string | null;
  generatedImageUrl?: string | null;
  generatedVideoUrl?: string | null;
  generatedAudioBase64?: string | null;
  title: string;
  description: string;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
  onSaveAsResource: () => void;
}

// 检测内容是否为 Markdown，根据标题后缀或内容特征
function isMarkdown(title: string, content: string) {
  if (/\.md$/i.test(title)) return true;
  if (content && (/^# /.test(content.trim()) || /[*_`~-]/.test(content))) return true;
  return false;
}

export function GeneratedContentDisplay({
  generatedContent,
  generatedImageBase64,
  generatedImageUrl,
  generatedVideoUrl,
  generatedAudioBase64,
  title,
  description,
  onTitleChange,
  onDescriptionChange,
  onSaveAsResource,
}: GeneratedContentDisplayProps) {
  
  // 添加调试信息
  console.log("GeneratedContentDisplay 接收到的 props:", {
    generatedContent: !!generatedContent,
    generatedImageBase64: !!generatedImageBase64,
    generatedImageUrl: !!generatedImageUrl,
    generatedVideoUrl: generatedVideoUrl,
    generatedAudioBase64: !!generatedAudioBase64
  });

  // 音频生成结果渲染
  if (generatedAudioBase64) {
    console.log("渲染音频组件");
    const audioUrl = `data:audio/mp3;base64,${generatedAudioBase64}`;
    return (
      <div className="space-y-4">
        <div>
          <Label>生成语音</Label>
          <div className="flex justify-center items-center p-4 bg-gray-50 rounded-lg">
            <audio
              src={audioUrl}
              controls
              className="w-full max-w-md"
              preload="metadata"
              onError={(e) => {
                console.error("音频加载失败:", e);
              }}
              onLoadStart={() => {
                console.log("开始加载音频");
              }}
              onCanPlay={() => {
                console.log("音频可以播放");
              }}
            >
              您的浏览器不支持音频播放。
            </audio>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="title">资源标题</Label>
          <Input
            id="title"
            placeholder="为生成的语音起个标题"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">资源描述</Label>
          <Input
            id="description"
            placeholder="简单描述这个语音资源"
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
          />
        </div>
        <Button onClick={onSaveAsResource} className="w-full">
          保存为资源
        </Button>
      </div>
    );
  }

  // 视频生成结果渲染
  if (generatedVideoUrl) {
    console.log("渲染视频组件，URL:", generatedVideoUrl);
    return (
      <div className="space-y-4">
        <div>
          <Label>生成视频</Label>
          <div className="flex justify-center items-center p-4 bg-gray-50 rounded-lg">
            <video
              src={generatedVideoUrl}
              controls
              className="max-w-full max-h-64 rounded"
              preload="metadata"
              onError={(e) => {
                console.error("视频加载失败:", e);
                console.error("视频 URL:", generatedVideoUrl);
              }}
              onLoadStart={() => {
                console.log("开始加载视频:", generatedVideoUrl);
              }}
              onCanPlay={() => {
                console.log("视频可以播放");
              }}
            >
              您的浏览器不支持视频播放。
            </video>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="title">资源标题</Label>
          <Input
            id="title"
            placeholder="为生成的视频起个标题"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">资源描述</Label>
          <Input
            id="description"
            placeholder="简单描述这个视频资源"
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
          />
        </div>
        <Button onClick={onSaveAsResource} className="w-full">
          保存为资源
        </Button>
      </div>
    );
  }

  // 只要有图片（base64或url），优先渲染图片，不再只判断generatedImageBase64
  if (generatedImageBase64 || generatedImageUrl) {
    return (
      <div className="space-y-4">
        <div>
          <Label>生成图片</Label>
          <div className="flex justify-center items-center p-4 bg-gray-50 rounded-lg">
            <img
              src={generatedImageBase64 || generatedImageUrl || ""}
              alt="AI生成图片"
              className="max-w-full max-h-64 rounded"
              draggable={false}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="title">资源标题</Label>
          <Input
            id="title"
            placeholder="为生成的内容起个标题"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">资源描述</Label>
          <Input
            id="description"
            placeholder="简单描述这个资源"
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
          />
        </div>
        <Button onClick={onSaveAsResource} className="w-full">
          保存为资源
        </Button>
      </div>
    );
  }

  if (generatedContent) {
    const renderAsMarkdown = isMarkdown(title, generatedContent);

    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">资源标题</Label>
          <Input
            id="title"
            placeholder="为生成的内容起个标题"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">资源描述</Label>
          <Input
            id="description"
            placeholder="简单描述这个资源"
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>生成内容</Label>
          <div className="bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto text-sm prose prose-neutral prose-p:my-1">
            {renderAsMarkdown ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{generatedContent}</ReactMarkdown>
            ) : (
              <pre className="whitespace-pre-wrap">{generatedContent}</pre>
            )}
          </div>
        </div>
        <Button onClick={onSaveAsResource} className="w-full">
          保存为资源
        </Button>
      </div>
    );
  }

  return (
    <div className="text-center text-gray-500 py-8">
      请在左侧输入提示并点击生成
    </div>
  );
}
