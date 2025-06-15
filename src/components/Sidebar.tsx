
import { BookOpen, Sparkles, FolderKanban, Users, Settings, Database } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";
import { useIsAdmin } from "@/hooks/useIsAdmin";

const navItems = [
  { title: "工作台", path: "/", icon: BookOpen },
  { title: "创建资源", path: "/ai-generator", icon: Sparkles },
  { 
    title: "资源管理", 
    path: "/resources", 
    icon: FolderKanban,
    subItems: [
      { title: "资源库", path: "/resources" },
      { title: "知识库", path: "/knowledge-base" }
    ]
  },
  { title: "分类管理", path: "/categories", icon: Users },
  { title: "协作空间", path: "/collaborate", icon: Users },
  { title: "系统设置", path: "/settings", icon: Settings },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const location = useLocation();

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  const isItemActive = (item: any) => {
    if (item.subItems) {
      return item.subItems.some((subItem: any) => location.pathname === subItem.path);
    }
    return location.pathname === item.path;
  };

  const isSubItemActive = (path: string) => location.pathname === path;

  return (
    <aside
      className={cn(
        "transition-all h-[calc(100vh-4rem)] z-30 flex flex-col",
        collapsed ? "w-16" : "w-56",
        "bg-white border-r border-gray-200 shadow-none overflow-hidden rounded-tr-xl rounded-br-xl"
      )}
    >
      <div className="flex flex-col mt-6 flex-1 gap-2">
        {navItems.map((item, idx) => {
          const isActive = isItemActive(item);
          const isExpanded = expandedItems.includes(item.title);
          
          return (
            <div key={item.title}>
              {item.subItems ? (
                <>
                  <button
                    onClick={() => toggleExpanded(item.title)}
                    className={cn(
                      "group flex items-center gap-3 px-5 py-2.5 rounded-lg text-gray-600 hover:text-blue-500 font-medium transition-all w-full text-left",
                      collapsed && "justify-center px-2",
                      isActive
                        ? "bg-blue-100 text-blue-600 shadow animate-fade-in"
                        : "hover:bg-gray-100"
                    )}
                    style={{
                      marginBottom: (!isExpanded && idx !== navItems.length - 1) ? 3 : 0
                    }}
                  >
                    <item.icon className={cn(
                      "w-6 h-6 transition drop-shadow-sm",
                      isActive ? "text-blue-500" : "text-gray-400 group-hover:text-blue-400"
                    )} />
                    {!collapsed && (
                      <>
                        <span className="ml-1 flex-1">{item.title}</span>
                        <span className={cn(
                          "transition-transform text-gray-400",
                          isExpanded ? "rotate-90" : "rotate-0"
                        )}>
                          ▶
                        </span>
                      </>
                    )}
                  </button>
                  {!collapsed && isExpanded && (
                    <div className="ml-4 mb-2">
                      {item.subItems.map((subItem: any) => (
                        <Link
                          key={subItem.title}
                          to={subItem.path}
                          className={cn(
                            "flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-all",
                            isSubItemActive(subItem.path)
                              ? "bg-blue-50 text-blue-600 border-l-2 border-blue-500"
                              : "text-gray-500 hover:text-blue-500 hover:bg-gray-50"
                          )}
                        >
                          <Database className="w-4 h-4" />
                          <span>{subItem.title}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
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
              )}
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
