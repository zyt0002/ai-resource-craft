
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type PlatformSettings = {
  platformName: string;
  platformDescription?: string;
  theme?: string;
  language?: string;
  enableRegistration?: boolean;
  enableFileUpload?: boolean;
  maxFileSize?: string;
  supportedFileTypes?: string;
  welcomeMessage?: string;
  footerText?: string;
};

const DEFAULT_PLATFORM: PlatformSettings = {
  platformName: "EduGen",
  platformDescription: "教育资源生成平台",
  theme: "light",
  language: "zh-CN",
  enableRegistration: true,
  enableFileUpload: true,
  maxFileSize: "10",
  supportedFileTypes: ".pdf,.docx,.txt,.md",
  welcomeMessage: "欢迎使用EduGen教育资源生成平台！",
  footerText: "© 2024 EduGen. All rights reserved.",
};

export function usePlatformSettings() {
  return useQuery<PlatformSettings>({
    queryKey: ["platformSettings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("platform_settings")
        .select("value")
        .eq("key", "main")
        .maybeSingle();
      if (data && typeof data.value === "object" && data.value !== null) {
        return { ...DEFAULT_PLATFORM, ...data.value };
      } else {
        return DEFAULT_PLATFORM;
      }
    },
    staleTime: 1000 * 60 * 10, // 10分钟缓存
  });
}

// 提供一个刷新平台设置的 hook（用于设置保存后刷新本地缓存）
export function useRefreshPlatformSettings() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ["platformSettings"] });
}
