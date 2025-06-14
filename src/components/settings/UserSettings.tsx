
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Save } from "lucide-react";

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

  // 回显最新 profile
  useEffect(() => {
    setFormData({
      fullName: profile?.full_name || "",
      username: profile?.username || "",
      email: user?.email || "",
      avatarUrl: profile?.avatar_url || "",
    });
  }, [profile, user]);

  // 头像上传占位（可接入 Supabase Storage）
  const handleAvatarUpload = async () => {
    toast({
      title: "暂未实现",
      description: "头像上传功能请后续开发",
      variant: "default"
    });
  };

  const handleSave = async () => {
    if (!profile?.id) return;
    setLoading(true);
    try {
      // 更新 profiles 表
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: formData.fullName.trim(),
          username: formData.username.trim(),
          avatar_url: formData.avatarUrl,
          updated_at: new Date().toISOString()
        })
        .eq("id", profile.id);
      if (error) throw error;

      toast({
        title: "设置已保存",
        description: "用户信息更新成功",
      });
      // 提醒用户刷新/或自动刷新个人资料
      // 此处建议重新 fetch，也可页面刷新或全局态管理
      // 此处简单 reload
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
          <Button variant="outline" size="sm" onClick={handleAvatarUpload}>
            <Upload className="w-4 h-4 mr-2" />
            上传头像
          </Button>
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

