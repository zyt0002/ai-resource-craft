
import { SidebarProvider } from "@/components/ui/sidebar";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import React from "react";

// children: 页面主内容
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen w-full flex flex-col bg-gradient-to-br from-sky-50 via-orange-50 to-fuchsia-50 dark:from-slate-900 dark:via-slate-950 dark:to-fuchsia-950 relative">
        <Navbar />
        <div className="flex flex-1 w-full">
          <Sidebar />
          <main className="flex-1 bg-gradient-to-br from-[rgba(246,248,250,0.91)] to-[rgba(225,238,255,0.6)] px-6 py-8 transition-all animate-fade-in rounded-3xl mt-4 mx-4 shadow-soft">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
