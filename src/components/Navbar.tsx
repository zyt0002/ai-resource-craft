import { UserCircle2, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePlatformSettings } from "@/hooks/usePlatformSettings";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const { profile, signOut } = useAuth();
  const { data: platform, isLoading } = usePlatformSettings();

  return (
    <header
      className={cn(
        "w-full h-16 px-8 flex items-center justify-between border-b border-gray-200 z-40 shadow-none bg-white dark:bg-background dark:border-gray-700"
      )}
    >
      <div className="flex items-center gap-4">
        <span className="font-extrabold text-2xl tracking-tight flex items-end select-none">
          <span className="text-blue-500">{isLoading ? "..." : platform?.platformName || "EduGen"}</span>
          <span className="ml-2 text-base font-light text-gray-600 dark:text-gray-300">
            {isLoading ? "加载中..." : platform?.platformDescription || "智能教学资源生成系统"}
          </span>
        </span>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        {/* 保持原有头像下拉菜单 */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="flex items-center gap-2 rounded-full px-3 py-1 shadow-none border border-gray-200 dark:border-gray-700 focus:ring-blue-300 bg-white text-gray-800 hover:bg-gray-100 dark:bg-background dark:text-gray-200 dark:hover:bg-neutral-800 transition"
            >
              <UserCircle2 className="w-6 h-6 text-blue-400" />
              <span className="font-medium">{profile?.full_name || profile?.username || "用户"}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-white dark:bg-background shadow-xl border border-gray-100 dark:border-gray-700">
            <DropdownMenuItem onClick={signOut} className="text-red-600 font-semibold hover:bg-red-50 dark:hover:bg-red-900/30">
              <LogOut className="w-4 h-4 mr-2" />
              退出登录
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
