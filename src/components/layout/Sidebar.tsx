"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  GitBranch,
  Shield,
  Settings,
  Lock,
  PanelLeftClose,
  PanelLeft,
  Sun,
  Moon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useFSCStore } from "@/store/fsc-store";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const menuItems = [
  { href: "/", label: "儀表板", icon: LayoutDashboard, exact: true },
  { href: "/settings", label: "基本設定", icon: Settings, exact: false },
  { href: "/approval", label: "核決權限", icon: Shield, exact: false },
  { href: "/flow", label: "流程管理", icon: GitBranch, exact: false },
  { href: "/admin", label: "後台管理", icon: Lock, exact: false },
];

export default function Sidebar() {
  const pathname = usePathname();
  const collapsed = useFSCStore((s) => s.sidebarCollapsed);
  const setCollapsed = useFSCStore((s) => s.setSidebarCollapsed);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div
      className={cn(
        "flex flex-col border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 transition-all duration-200",
        collapsed ? "w-16" : "w-52"
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-14 px-4 border-b border-gray-100 dark:border-gray-800">
        {!collapsed && (
          <div className="flex flex-col leading-tight">
            <span className="font-bold text-sm text-gray-800 dark:text-gray-100 tracking-tight">FSC</span>
            <span className="text-[9px] text-gray-400 dark:text-gray-500 tracking-wider">Flow & Sign & Control</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400"
        >
          {collapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>
      </div>

      {/* Menu */}
      <nav className="flex-1 py-2 px-2 space-y-0.5">
        {menuItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                isActive
                  ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200"
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className={cn("w-4 h-4 flex-shrink-0", isActive && "text-blue-600 dark:text-blue-400")} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Theme toggle + Footer */}
      <div className="border-t border-gray-100 dark:border-gray-800">
        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className={cn(
              "flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors",
              collapsed && "justify-center px-0"
            )}
            title={theme === "dark" ? "切換亮色模式" : "切換暗色模式"}
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {!collapsed && <span>{theme === "dark" ? "亮色模式" : "暗色模式"}</span>}
          </button>
        )}
        {!collapsed && (
          <div className="px-4 py-3 text-[10px] text-gray-400 dark:text-gray-600">
            FSC v0.1
          </div>
        )}
      </div>
    </div>
  );
}
