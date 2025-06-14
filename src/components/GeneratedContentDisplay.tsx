
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface GeneratedContentDisplayProps {
  generatedContent: string;
  generatedImageBase64: string | null;
  title: string;
  description: string;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
  onSaveAsResource: () => void;
}

export function GeneratedContentDisplay({
  generatedContent,
  generatedImageBase64,
  title,
  description,
  onTitleChange,
  onDescriptionChange,
  onSaveAsResource,
}: GeneratedContentDisplayProps) {
  if (generatedImageBase64) {
    return (
      <div className="space-y-4">
        <div>
          <Label>生成图片</Label>
          <div className="flex justify-center items-center p-4 bg-gray-50 rounded-lg">
            <img src={generatedImageBase64} alt="AI生成图片" className="max-w-full max-h-64 rounded" />
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
          <div className="bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto">
            <pre className="whitespace-pre-wrap text-sm">{generatedContent}</pre>
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
