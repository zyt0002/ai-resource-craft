
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Shield, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// User role类型
type UserRole = "admin" | "teacher" | "student";

interface Permission {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  email?: string | null; // 将来可关联supabase user表
  role: UserRole | null;
  updated_at: string | null;
}

export default function PermissionSettings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // 权限数组
  const [permissions, setPermissions] = useState<Permission[]>([
    { id: "create_content", name: "创建内容", description: "允许创建新的教育资源", enabled: true },
    { id: "edit_content", name: "编辑内容", description: "允许编辑现有内容", enabled: true },
    { id: "delete_content", name: "删除内容", description: "允许删除内容", enabled: false },
    { id: "manage_users", name: "用户管理", description: "允许管理其他用户", enabled: false },
    { id: "view_analytics", name: "查看分析", description: "允许查看使用统计", enabled: true },
    { id: "export_data", name: "导出数据", description: "允许导出平台数据", enabled: false },
  ]);

  // ----------------- 用户列表加载 ------------------
  const { data: users, isLoading: usersLoading, error: usersError } = useQuery({
    queryKey: ["profiles"],
    queryFn: async (): Promise<Profile[]> => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  // 权限toggle变更
  const handlePermissionChange = (permissionId: string, enabled: boolean) => {
    setPermissions(prev =>
      prev.map(permission =>
        permission.id === permissionId ? { ...permission, enabled } : permission
      )
    );
  };

  // 权限保存事件
  const handleSave = async () => {
    setLoading(true);
    try {
      // 此处省略权限保存逻辑，实际项目可更新至数据库
      toast({
        title: "权限设置已保存",
        description: "权限配置更新成功",
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

  // 角色badge配色
  const getRoleBadgeVariant = (role: UserRole | null) => {
    switch (role) {
      case "admin": return "destructive";
      case "teacher": return "default";
      case "student": return "secondary";
      default: return "outline";
    }
  };

  // 角色显示文本
  const getRoleText = (role: UserRole | null) => {
    switch (role) {
      case "admin": return "管理员";
      case "teacher": return "教师";
      case "student": return "学生";
      default: return "-";
    }
  };

  // 格式化日期
  const formatDate = (d: string | null) => {
    if (!d) return "-";
    return new Date(d).toLocaleDateString() + " " + new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>权限管理</CardTitle>
          <CardDescription>配置系统权限和用户角色</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="text-sm font-medium mb-4">系统权限</h4>
            <div className="space-y-3">
              {permissions.map((permission) => (
                <div key={permission.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{permission.name}</div>
                    <div className="text-sm text-muted-foreground">{permission.description}</div>
                  </div>
                  <Switch
                    checked={permission.enabled}
                    onCheckedChange={(checked) => handlePermissionChange(permission.id, checked)}
                  />
                </div>
              ))}
            </div>
          </div>
          <Button onClick={handleSave} disabled={loading} className="w-full md:w-auto">
            <Save className="w-4 h-4 mr-2" />
            {loading ? "保存中..." : "保存权限设置"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>用户管理</CardTitle>
              <CardDescription>管理平台用户和角色分配</CardDescription>
            </div>
            <Button>
              <UserPlus className="w-4 h-4 mr-2" />
              邀请用户
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {usersLoading ? (
            <div className="text-center text-muted-foreground p-6">加载中...</div>
          ) : usersError ? (
            <div className="text-sm text-destructive p-6">获取用户失败！</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>姓名</TableHead>
                  <TableHead>用户名</TableHead>
                  <TableHead>角色</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users && users.length ? users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.full_name || "-"}</TableCell>
                    <TableCell>{user.username || "-"}</TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                        {getRoleText(user.role)}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(user.updated_at)}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        <Shield className="w-4 h-4 mr-1" />
                        管理
                      </Button>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      暂无用户
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
