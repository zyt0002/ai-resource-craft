
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Shield, Save } from "lucide-react";

interface Permission {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

interface UserRole {
  id: string;
  username: string;
  email: string;
  role: "admin" | "editor" | "viewer";
  lastActive: string;
}

export default function PermissionSettings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [permissions, setPermissions] = useState<Permission[]>([
    { id: "create_content", name: "创建内容", description: "允许创建新的教育资源", enabled: true },
    { id: "edit_content", name: "编辑内容", description: "允许编辑现有内容", enabled: true },
    { id: "delete_content", name: "删除内容", description: "允许删除内容", enabled: false },
    { id: "manage_users", name: "用户管理", description: "允许管理其他用户", enabled: false },
    { id: "view_analytics", name: "查看分析", description: "允许查看使用统计", enabled: true },
    { id: "export_data", name: "导出数据", description: "允许导出平台数据", enabled: false },
  ]);

  const [users] = useState<UserRole[]>([
    { id: "1", username: "admin", email: "admin@example.com", role: "admin", lastActive: "2024-01-15" },
    { id: "2", username: "teacher1", email: "teacher1@example.com", role: "editor", lastActive: "2024-01-14" },
    { id: "3", username: "student1", email: "student1@example.com", role: "viewer", lastActive: "2024-01-13" },
  ]);

  const handlePermissionChange = (permissionId: string, enabled: boolean) => {
    setPermissions(prev => 
      prev.map(permission => 
        permission.id === permissionId ? { ...permission, enabled } : permission
      )
    );
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // 这里可以添加保存权限设置的逻辑
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

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin": return "destructive";
      case "editor": return "default";
      case "viewer": return "secondary";
      default: return "outline";
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case "admin": return "管理员";
      case "editor": return "编辑者";
      case "viewer": return "查看者";
      default: return role;
    }
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>用户名</TableHead>
                <TableHead>邮箱</TableHead>
                <TableHead>角色</TableHead>
                <TableHead>最后活动</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(user.role)}>
                      {getRoleText(user.role)}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.lastActive}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      <Shield className="w-4 h-4 mr-1" />
                      管理
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
