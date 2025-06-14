
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
    <header className={cn("w-full h-16 px-8 flex items-center justify-between border-b bg-background shadow-sm z-40")}>
      <div className="flex items-center gap-4">
        <span className="font-bold text-2xl text-primary tracking-tight">
          <span className="text-blue-600">EduGen</span>
          <span className="text-gray-700 ml-2 text-base font-light">教育资源生成平台</span>
        </span>
      </div>
      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2">
              <UserCircle2 className="w-6 h-6" />
              <span>{profile?.full_name || profile?.username || "用户"}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={signOut} className="text-red-600">
              <LogOut className="w-4 h-4 mr-2" />
              退出登录
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
