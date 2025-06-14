
import { BookOpen, Sparkles, FolderKanban, Users, Settings } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { title: "仪表盘", path: "/", icon: BookOpen },
  { title: "AI生成", path: "/ai-generator", icon: Sparkles },
  { title: "资源管理", path: "/resources", icon: FolderKanban },
  { title: "分类管理", path: "/categories", icon: Users },
  { title: "实时协作", path: "/collaborate", icon: Users },
  { title: "系统设置", path: "/settings", icon: Settings },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <aside className={cn("transition-all h-[calc(100vh-4rem)] z-30 border-r bg-sidebar flex flex-col", collapsed ? "w-16" : "w-56")}>
      <div className="flex flex-col mt-4 flex-1">
        {navItems.map((item) => (
          <a
            key={item.title}
            href={item.path}
            className={cn(
              "flex items-center gap-3 px-5 py-2 my-1 rounded-md text-muted-foreground hover:text-primary font-medium hover:bg-accent transition text-base",
              collapsed && "justify-center px-2"
            )}
          >
            <item.icon className="w-5 h-5" />
            {!collapsed && <span>{item.title}</span>}
          </a>
        ))}
      </div>
      <button
        className="mx-auto my-4 bg-accent px-2 py-1 rounded hover:bg-primary hover:text-primary-foreground transition"
        onClick={() => setCollapsed((c) => !c)}
      >
        {collapsed ? "⮞" : "⮜"}
      </button>
    </aside>
  );
}
