
import { BookOpen, Sparkles, FolderKanban, Users, Settings } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";
import { useIsAdmin } from "@/hooks/useIsAdmin";

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
  const location = useLocation();

  return (
    <aside
      className={cn(
        "transition-all h-[calc(100vh-4rem)] z-30 flex flex-col",
        collapsed ? "w-16" : "w-60",
        "bg-gradient-to-b from-emerald-100 via-sky-100 to-orange-50 dark:from-slate-900 dark:via-slate-800 dark:to-emerald-800 border-r shadow-xl overflow-hidden"
      )}
      style={{ minHeight: "auto" }}
    >
      <div className="flex flex-col mt-6 flex-1 gap-2">
        {navItems.map((item, idx) => (
          <Link
            key={item.title}
            to={item.path}
            className={cn(
              "group flex items-center gap-3 px-5 py-2.5 rounded-xl text-muted-foreground hover:scale-105 hover:text-primary font-medium transition-all",
              collapsed && "justify-center px-2",
              location.pathname === item.path
                ? "bg-gradient-to-r from-emerald-300 via-sky-200 to-orange-200 dark:from-emerald-700 dark:to-fuchsia-900 text-primary shadow-card animate-fade-pop"
                : "hover:bg-gradient-to-r hover:from-sky-100 hover:to-fuchsia-100 dark:hover:from-slate-900 dark:hover:to-fuchsia-900"
            )}
            style={{
              marginBottom: idx !== navItems.length - 1 ? 3 : undefined,
              boxShadow:
                location.pathname === item.path
                  ? "0 6px 20px 0 rgba(16,185,129,0.12)"
                  : undefined,
            }}
          >
            <item.icon className="w-6 h-6 group-hover:text-fuchsia-500 transition filter drop-shadow-sm" />
            {!collapsed && <span className="ml-1">{item.title}</span>}
          </Link>
        ))}
      </div>
      <button
        className={cn(
          "mx-auto my-6 bg-gradient-to-r from-orange-400 to-fuchsia-300 rounded-full px-3 py-1 shadow hover:shadow-card text-white font-bold text-xl transition hover:scale-110 animate-fade-pop"
        )}
        onClick={() => setCollapsed((c) => !c)}
        title={collapsed ? "展开侧边栏" : "收起侧边栏"}
      >
        {collapsed ? "⮞" : "⮜"}
      </button>
    </aside>
  );
}

