
import { useAuth } from "@/hooks/useAuth";

/**
 * 判断当前用户是否为管理员
 */
export function useIsAdmin(): boolean {
  const { profile } = useAuth();
  return profile?.role === "admin";
}
