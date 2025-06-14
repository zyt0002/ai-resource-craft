
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Save, TestTube } from "lucide-react";

export default function ApiSettings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [settings, setSettings] = useState({
    defaultModel: "qwen-max",
    apiKey: "",
    baseUrl: "https://api.siliconflow.cn/v1",
    maxTokens: "4000",
    temperature: "0.7",
    systemPrompt: "你是一个专业的教育资源生成助手，请根据用户需求生成高质量的教育内容。",
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      // 这里可以添加保存API设置的逻辑
      toast({
        title: "API设置已保存",
        description: "配置信息更新成功",
      });
    } catch (error) {
      toast({
        title: "保存失败",
        description: "请检查配置信息后重试",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTest = async () => {
    setLoading(true);
    try {
      // 这里可以添加测试API连接的逻辑
      toast({
        title: "连接测试成功",
        description: "API配置正常",
      });
    } catch (error) {
      toast({
        title: "连接测试失败",
        description: "请检查API密钥和配置",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>API配置</CardTitle>
        <CardDescription>配置AI模型和API相关设置</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="defaultModel">默认模型</Label>
            <Select value={settings.defaultModel} onValueChange={(value) => setSettings({ ...settings, defaultModel: value })}>
              <SelectTrigger>
                <SelectValue placeholder="选择默认模型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="qwen-max">Qwen Max</SelectItem>
                <SelectItem value="qwen-plus">Qwen Plus</SelectItem>
                <SelectItem value="deepseek-chat">DeepSeek Chat</SelectItem>
                <SelectItem value="glm-4-plus">GLM-4 Plus</SelectItem>
                <SelectItem value="step-1v">Step-1V</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="baseUrl">API基础URL</Label>
            <Input
              id="baseUrl"
              value={settings.baseUrl}
              onChange={(e) => setSettings({ ...settings, baseUrl: e.target.value })}
              placeholder="https://api.siliconflow.cn/v1"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="apiKey">API密钥</Label>
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <Input
                id="apiKey"
                type={showApiKey ? "text" : "password"}
                value={settings.apiKey}
                onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
                placeholder="输入您的API密钥"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
            <Button variant="outline" onClick={handleTest} disabled={loading || !settings.apiKey}>
              <TestTube className="w-4 h-4 mr-2" />
              测试连接
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="maxTokens">最大令牌数</Label>
            <Input
              id="maxTokens"
              type="number"
              value={settings.maxTokens}
              onChange={(e) => setSettings({ ...settings, maxTokens: e.target.value })}
              placeholder="4000"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="temperature">温度值</Label>
            <Input
              id="temperature"
              type="number"
              step="0.1"
              min="0"
              max="2"
              value={settings.temperature}
              onChange={(e) => setSettings({ ...settings, temperature: e.target.value })}
              placeholder="0.7"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="systemPrompt">系统提示词</Label>
          <Textarea
            id="systemPrompt"
            value={settings.systemPrompt}
            onChange={(e) => setSettings({ ...settings, systemPrompt: e.target.value })}
            placeholder="输入系统提示词..."
            className="min-h-[100px]"
          />
        </div>

        <Button onClick={handleSave} disabled={loading} className="w-full md:w-auto">
          <Save className="w-4 h-4 mr-2" />
          {loading ? "保存中..." : "保存设置"}
        </Button>
      </CardContent>
    </Card>
  );
}
