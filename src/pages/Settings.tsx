
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserSettings from "@/components/settings/UserSettings";
import ApiSettings from "@/components/settings/ApiSettings";
import PlatformSettings from "@/components/settings/PlatformSettings";
import PermissionSettings from "@/components/settings/PermissionSettings";
import { User, Settings as SettingsIcon, Palette, Shield } from "lucide-react";

export default function Settings() {
  return (
    <div className="w-full max-w-6xl mx-auto mt-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">系统设置</h2>
        <p className="text-muted-foreground">管理您的平台配置、用户权限和个人偏好设置</p>
      </div>
      
      <Tabs defaultValue="user" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="user" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            个人设置
          </TabsTrigger>
          <TabsTrigger value="api" className="flex items-center gap-2">
            <SettingsIcon className="w-4 h-4" />
            API配置
          </TabsTrigger>
          <TabsTrigger value="platform" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            平台自定义
          </TabsTrigger>
          <TabsTrigger value="permissions" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            权限管理
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="user">
            <UserSettings />
          </TabsContent>
          
          <TabsContent value="api">
            <ApiSettings />
          </TabsContent>
          
          <TabsContent value="platform">
            <PlatformSettings />
          </TabsContent>
          
          <TabsContent value="permissions">
            <PermissionSettings />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
