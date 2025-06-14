
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

export default function Navbar() {
  const { profile, signOut } = useAuth();

  return (
    <header
      className={cn(
        "w-full h-16 px-8 flex items-center justify-between border-b z-40 shadow-sm",
        "bg-gradient-to-r from-sky-100 via-orange-100 to-fuchsia-100 dark:from-slate-800 dark:via-slate-900 dark:to-fuchsia-900",
        "relative"
      )}
      style={{ boxShadow: "0 2px 12px 0 rgba(34,197,94,.07)" }}
    >
      <div className="flex items-center gap-4">
        <span className="font-bold text-2xl tracking-tight flex items-end">
          <span className="bg-gradient-to-r from-emerald-400 via-sky-400 to-fuchsia-600 bg-clip-text text-transparent">EduGen</span>
          <span className="text-sky-800 ml-2 text-base font-light dark:text-sky-100">教育资源生成平台</span>
        </span>
      </div>
      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2 bg-gradient-to-r from-orange-100 to-fuchsia-100 dark:from-slate-700 dark:to-slate-900 rounded-full px-3 py-1 shadow hover:shadow-lg transition-all focus:ring-emerald-400"
              style={{ border: "1px solid rgba(16,185,129,0.12)" }}
            >
              <UserCircle2 className="w-6 h-6" />
              <span className="font-medium">{profile?.full_name || profile?.username || "用户"}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-background/95 shadow-xl border-2 border-sky-100 dark:border-sky-900 dark:bg-background/90">
            <DropdownMenuItem onClick={signOut} className="text-red-600 font-semibold hover:bg-red-50">
              <LogOut className="w-4 h-4 mr-2" />
              退出登录
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="absolute left-0 bottom-0 h-[2px] w-full bg-gradient-to-r from-fuchsia-200 via-orange-200 to-emerald-200 dark:from-fuchsia-700 dark:to-emerald-600"></div>
    </header>
  );
}
