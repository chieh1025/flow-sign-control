"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  GitBranch,
  Shield,
  AlertTriangle,
  Settings,
  Lock,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useFSCStore } from "@/store/fsc-store";

const menuItems = [
  { href: "/", label: "儀表板", icon: LayoutDashboard, exact: true },
  { href: "/flow", label: "流程管理", icon: GitBranch, exact: false },
  { href: "/approval", label: "核決權限", icon: Shield, exact: false },
  { href: "/alerts", label: "警示中心", icon: AlertTriangle, exact: false },
  { href: "/settings", label: "基本設定", icon: Settings, exact: false },
  { href: "/admin", label: "後台管理", icon: Lock, exact: false },
];

export default function Sidebar() {
  const pathname = usePathname();
  const collapsed = useFSCStore((s) => s.sidebarCollapsed);
  const setCollapsed = useFSCStore((s) => s.setSidebarCollapsed);

  return (
    <div
      className={cn(
        "flex flex-col border-r border-gray-200 bg-white transition-all duration-200",
        collapsed ? "w-16" : "w-52"
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-14 px-4 border-b border-gray-100">
        {!collapsed && (
          <span className="font-bold text-base text-gray-800 tracking-tight">FSC</span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400"
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
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className={cn("w-4 h-4 flex-shrink-0", isActive && "text-blue-600")} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="px-4 py-3 border-t border-gray-100 text-[10px] text-gray-400">
          FSC v0.1
        </div>
      )}
    </div>
  );
}
