
import { SidebarProvider } from "@/components/ui/sidebar";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import React from "react";

// children: 页面主内容
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen w-full flex flex-col bg-background">
        <Navbar />
        <div className="flex flex-1 w-full">
          <Sidebar />
          <main className="flex-1 bg-gradient-to-br from-[rgba(246,248,250,0.96)] to-[rgba(225,238,255,0.7)] px-6 py-8">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
