
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Save } from "lucide-react";
import { useIsAdmin } from "@/hooks/useIsAdmin";

const DEFAULT_PLATFORM = {
  platformName: "EduGen",
  platformDescription: "教育资源生成平台",
  theme: "light",
  language: "zh-CN",
  enableRegistration: true,
  enableFileUpload: true,
  maxFileSize: "10",
  supportedFileTypes: ".pdf,.docx,.txt,.md",
  welcomeMessage: "欢迎使用EduGen教育资源生成平台！",
  footerText: "© 2024 EduGen. All rights reserved."
};

export default function PlatformSettings() {
  const { toast } = useToast();
  const isAdmin = useIsAdmin();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState(DEFAULT_PLATFORM);

  // 获取平台设置
  useEffect(() => {
    async function fetchSettings() {
      const { data, error } = await supabase
        .from("platform_settings")
        .select("value")
        .eq("key", "main")
        .maybeSingle();
      if (data && typeof data.value === "object" && data.value !== null) {
        setSettings({ ...DEFAULT_PLATFORM, ...data.value });
      } else {
        setSettings(DEFAULT_PLATFORM);
      }
    }
    fetchSettings();
    // eslint-disable-next-line
  }, []);

  const handleSave = async () => {
    if (!isAdmin) {
      toast({ title: "无权限", description: "只有管理员可以更改平台设置", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase
        .from("platform_settings")
        .upsert([
          {
            key: "main",
            value: settings,
            updated_at: new Date().toISOString(),
          }
        ], { onConflict: "key" });
      if (error) throw error;
      toast({
        title: "平台设置已保存",
        description: "配置更新成功",
      });
    } catch (error) {
      toast({
        title: "保存失败",
        description: "请稍后重试",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>平台自定义</CardTitle>
        <CardDescription>自定义平台外观和功能设置</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="platformName">平台名称</Label>
            <Input
              id="platformName"
              value={settings.platformName}
              onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
              placeholder="EduGen"
              disabled={!isAdmin}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="language">默认语言</Label>
            <Select value={settings.language} onValueChange={(value) => setSettings({ ...settings, language: value })} disabled={!isAdmin}>
              <SelectTrigger>
                <SelectValue placeholder="选择语言" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="zh-CN">中文(简体)</SelectItem>
                <SelectItem value="zh-TW">中文(繁体)</SelectItem>
                <SelectItem value="en-US">English</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="platformDescription">平台描述</Label>
          <Input
            id="platformDescription"
            value={settings.platformDescription}
            onChange={(e) => setSettings({ ...settings, platformDescription: e.target.value })}
            placeholder="教育资源生成平台"
            disabled={!isAdmin}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="theme">主题设置</Label>
          <Select value={settings.theme} onValueChange={(value) => setSettings({ ...settings, theme: value })} disabled={!isAdmin}>
            <SelectTrigger>
              <SelectValue placeholder="选择主题" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">浅色主题</SelectItem>
              <SelectItem value="dark">深色主题</SelectItem>
              <SelectItem value="auto">自动切换</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-medium">功能设置</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label>用户注册</Label>
                <p className="text-sm text-muted-foreground">允许新用户注册账户</p>
              </div>
              <Switch
                checked={settings.enableRegistration}
                onCheckedChange={(checked) => setSettings({ ...settings, enableRegistration: checked })}
                disabled={!isAdmin}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>文件上传</Label>
                <p className="text-sm text-muted-foreground">允许用户上传文件</p>
              </div>
              <Switch
                checked={settings.enableFileUpload}
                onCheckedChange={(checked) => setSettings({ ...settings, enableFileUpload: checked })}
                disabled={!isAdmin}
              />
            </div>
          </div>
        </div>

        {settings.enableFileUpload && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maxFileSize">最大文件大小 (MB)</Label>
              <Input
                id="maxFileSize"
                type="number"
                value={settings.maxFileSize}
                onChange={(e) => setSettings({ ...settings, maxFileSize: e.target.value })}
                placeholder="10"
                disabled={!isAdmin}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supportedFileTypes">支持的文件类型</Label>
              <Input
                id="supportedFileTypes"
                value={settings.supportedFileTypes}
                onChange={(e) => setSettings({ ...settings, supportedFileTypes: e.target.value })}
                placeholder=".pdf,.docx,.txt,.md"
                disabled={!isAdmin}
              />
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="welcomeMessage">欢迎消息</Label>
          <Textarea
            id="welcomeMessage"
            value={settings.welcomeMessage}
            onChange={(e) => setSettings({ ...settings, welcomeMessage: e.target.value })}
            placeholder="输入欢迎消息..."
            className="min-h-[80px]"
            disabled={!isAdmin}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="footerText">页脚文本</Label>
          <Input
            id="footerText"
            value={settings.footerText}
            onChange={(e) => setSettings({ ...settings, footerText: e.target.value })}
            placeholder="© 2024 EduGen. All rights reserved."
            disabled={!isAdmin}
          />
        </div>

        {isAdmin && (
          <Button onClick={handleSave} disabled={loading} className="w-full md:w-auto">
            <Save className="w-4 h-4 mr-2" />
            {loading ? "保存中..." : "保存设置"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// 文件已超过230行，如需进一步优化可考虑拆分子组件提升可维护性。
