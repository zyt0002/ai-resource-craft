import { UserCircle2, BookOpen, Sparkles, FolderKanban, Users, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { title: "仪表盘", path: "/", icon: BookOpen },
  { title: "AI生成", path: "/ai-generator", icon: Sparkles },
  { title: "资源管理", path: "/resources", icon: FolderKanban },
  { title: "分类管理", path: "/categories", icon: Users },
  { title: "实时协作", path: "/collaborate", icon: Users },
  { title: "系统设置", path: "/settings", icon: Settings },
];

export default function Navbar() {
  return (
    <header className={cn("w-full h-16 px-8 flex items-center justify-between border-b bg-background shadow-sm z-40")}>
      <div className="flex items-center gap-4">
        <span className="font-bold text-2xl text-primary tracking-tight">
          <span className="text-blue-600">EduGen</span>
          <span className="text-gray-700 ml-2 text-base font-light">教育资源生成平台</span>
        </span>
        <nav className="ml-8 flex gap-2">
          {navItems.map((item) => (
            <a
              key={item.title}
              href={item.path}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-accent transition text-sm text-muted-foreground hover:text-primary font-medium"
            >
              <item.icon className="w-5 h-5 mr-1" /> {item.title}
            </a>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent hover:bg-primary transition font-semibold text-primary-foreground">
          <UserCircle2 className="w-6 h-6" /> 登录
        </button>
      </div>
    </header>
  );
}
