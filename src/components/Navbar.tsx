
import { UserCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Navbar() {
  return (
    <header className={cn("w-full h-16 px-8 flex items-center justify-between border-b bg-background shadow-sm z-40")}>
      <div className="flex items-center gap-4">
        <span className="font-bold text-2xl text-primary tracking-tight">
          <span className="text-blue-600">EduGen</span>
          <span className="text-gray-700 ml-2 text-base font-light">教育资源生成平台</span>
        </span>
        {/* 移除了顶部导航 tab */}
      </div>
      <div className="flex items-center gap-4">
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent hover:bg-primary transition font-semibold text-primary-foreground">
          <UserCircle2 className="w-6 h-6" /> 登录
        </button>
      </div>
    </header>
  );
}
