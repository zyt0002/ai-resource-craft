
import { BookOpen, Sparkles, FolderKanban, Users, Settings, Database } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";
import { useIsAdmin } from "@/hooks/useIsAdmin";

const navItems = [
  { title: "工作台", path: "/", icon: BookOpen },
  { title: "创建资源", path: "/ai-generator", icon: Sparkles },
  { title: "资源管理", path: "/resources", icon: FolderKanban },
  { title: "知识库", path: "/knowledge-base", icon: Database },
  { title: "分类管理", path: "/categories", icon: Users },
  { title: "协作空间", path: "/collaborate", icon: Users },
  { title: "系统设置", path: "/settings", icon: Settings },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const isItemActive = (item: any) => {
    return location.pathname === item.path;
  };

  return (
    <aside
      className={cn(
        "transition-all h-[calc(100vh-4rem)] z-30 flex flex-col",
        collapsed ? "w-16" : "w-56",
        // 统一支持暗色/浅色主题
        "bg-card dark:bg-zinc-900 border-r border-gray-200 shadow-none overflow-hidden rounded-tr-xl rounded-br-xl"
      )}
    >
      <div className="flex flex-col mt-6 flex-1 gap-2">
        {navItems.map((item, idx) => {
          const isActive = isItemActive(item);
          
          return (
            <div key={item.title}>
              <Link
                to={item.path}
                className={cn(
                  "group flex items-center gap-3 px-5 py-2.5 rounded-lg text-gray-600 hover:text-blue-500 font-medium transition-all",
                  collapsed && "justify-center px-2",
                  isActive
                    ? "bg-blue-100 text-blue-600 shadow animate-fade-in"
                    : "hover:bg-gray-100"
                )}
                style={{
                  marginBottom: idx !== navItems.length - 1 ? 3 : undefined
                }}
              >
                <item.icon className={cn(
                  "w-6 h-6 transition drop-shadow-sm",
                  isActive ? "text-blue-500" : "text-gray-400 group-hover:text-blue-400"
                )} />
                {!collapsed && <span className="ml-1">{item.title}</span>}
              </Link>
            </div>
          );
        })}
      </div>
      <button
        className={cn(
          "mx-auto my-6 bg-blue-100 rounded-full px-3 py-1 shadow transition text-blue-500 hover:bg-blue-200 font-bold text-lg"
        )}
        onClick={() => setCollapsed((c) => !c)}
        title={collapsed ? "展开侧边栏" : "收起侧边栏"}
      >
        {collapsed ? "⮞" : "⮜"}
      </button>
    </aside>
  );
}

