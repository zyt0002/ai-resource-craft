
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Save } from "lucide-react";
import { useUploadToSupabase } from "@/hooks/useUploadToSupabase";

export default function UserSettings() {
  const { profile, user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: profile?.full_name || "",
    username: profile?.username || "",
    email: user?.email || "",
    avatarUrl: profile?.avatar_url || "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFile, uploading } = useUploadToSupabase("avatars"); // 存储到 avatars bucket

  // 回显最新 profile
  useEffect(() => {
    setFormData({
      fullName: profile?.full_name || "",
      username: profile?.username || "",
      email: user?.email || "",
      avatarUrl: profile?.avatar_url || "",
    });
  }, [profile, user]);

  // 选择本地图片并上传到 Supabase Storage
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({
        title: "不支持的图片格式",
        description: "请选择 JPG/PNG/JPEG/GIF 格式的图片",
        variant: "destructive",
      });
      return;
    }
    try {
      const publicUrl = await uploadFile(file);
      if (publicUrl) {
        setFormData((prev) => ({ ...prev, avatarUrl: publicUrl }));
        toast({
          title: "头像上传成功",
          description: "新头像即将保存到个人资料",
        });
        // 自动保存头像变化
        saveAvatarUrl(publicUrl);
      }
    } catch (error) {
      toast({
        title: "上传头像失败",
        description: "请重试其他图片",
        variant: "destructive",
      });
    }
  };

  // 更新头像字段
  const saveAvatarUrl = async (avatarUrl: string) => {
    if (!profile?.id) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ avatar_url: avatarUrl, updated_at: new Date().toISOString() })
        .eq("id", profile.id);
      if (error) throw error;

      toast({
        title: "头像已更新",
        description: "个人头像已保存",
      });
      window.location.reload();
    } catch (error) {
      toast({
        title: "头像保存失败",
        description: "请稍后重试",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile?.id) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: formData.fullName.trim(),
          username: formData.username.trim(),
          avatar_url: formData.avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id);
      if (error) throw error;

      toast({
        title: "设置已保存",
        description: "用户信息更新成功",
      });
      window.location.reload();
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
        <CardTitle>个人信息</CardTitle>
        <CardDescription>管理您的个人资料和账户设置</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center space-x-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={formData.avatarUrl || ""} />
            <AvatarFallback className="text-lg">
              {formData.fullName?.charAt(0) || formData.username?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleAvatarChange}
              disabled={uploading || loading}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || loading}
            >
              <Upload className="w-4 h-4 mr-2" />
              {uploading ? "上传中..." : "上传头像"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">姓名</Label>
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="输入您的姓名"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">用户名</Label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="输入用户名"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">邮箱地址</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            disabled
            className="bg-muted"
          />
          <p className="text-sm text-muted-foreground">邮箱地址无法修改</p>
        </div>

        <Button onClick={handleSave} disabled={loading} className="w-full md:w-auto">
          <Save className="w-4 h-4 mr-2" />
          {loading ? "保存中..." : "保存设置"}
        </Button>
      </CardContent>
    </Card>
  );
}
