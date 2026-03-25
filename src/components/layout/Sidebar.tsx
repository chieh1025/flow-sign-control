"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  GitBranch,
  Shield,
  Lock,
  Network,
  PanelLeftClose,
  PanelLeft,
  Sun,
  Moon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useFSCStore } from "@/store/fsc-store";
import { ROLE_LABELS, type Role } from "@/types/fsc";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const menuItems = [
  { href: "/", label: "儀表板", icon: LayoutDashboard, exact: true },
  { href: "/approval", label: "核決權限", icon: Shield, exact: false },
  { href: "/flow", label: "流程管理", icon: GitBranch, exact: false },
  { href: "/org", label: "組織架構", icon: Network, exact: false },
  { href: "/admin", label: "後台管理", icon: Lock, exact: false },
];

export default function Sidebar() {
  const pathname = usePathname();
  const collapsed = useFSCStore((s) => s.sidebarCollapsed);
  const setCollapsed = useFSCStore((s) => s.setSidebarCollapsed);
  const currentRole = useFSCStore((s) => s.currentRole);
  const setCurrentRole = useFSCStore((s) => s.setCurrentRole);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <div
      className={cn(
        "flex flex-col border-r border-border bg-sidebar transition-all duration-200",
        collapsed ? "w-16" : "w-52"
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-14 px-4 border-b border-border-light">
        {!collapsed && (
          <div className="flex flex-col leading-tight">
            <span className="font-bold text-sm text-text tracking-tight">FSC 流程核決控制平台</span>
            <span className="text-[9px] text-text-muted tracking-wider">Flow & Sign & Control</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-md hover:bg-surface-hover text-text-muted transition-colors"
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
                  ? "bg-primary-bg text-primary font-medium"
                  : "text-text-secondary hover:bg-surface-hover hover:text-text"
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className={cn("w-4 h-4 flex-shrink-0", isActive && "text-primary")} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Role + Theme toggle + Footer */}
      <div className="border-t border-border-light">
        {/* Theme toggle */}
        {mounted && (
          <div className={cn("flex items-center border-b border-border-light", collapsed ? "justify-center py-2.5" : "px-4 py-2.5")}>
            {!collapsed && <span className="text-[10px] text-text-muted mr-auto">主題</span>}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-1.5 rounded-md hover:bg-surface-hover text-text-muted transition-colors"
              title={theme === "dark" ? "切換亮色" : "切換暗色"}
            >
              {theme === "dark" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}

        {/* Role selector */}
        {!collapsed ? (
          <div className="px-4 py-2.5 border-b border-border-light">
            <label className="text-[10px] text-text-muted block mb-1">目前角色</label>
            <select
              value={currentRole}
              onChange={(e) => setCurrentRole(e.target.value as Role)}
              className="w-full text-xs px-2 py-1.5 border border-border rounded bg-surface text-text focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {(Object.keys(ROLE_LABELS) as Role[]).map((r) => (
                <option key={r} value={r}>{ROLE_LABELS[r]}</option>
              ))}
            </select>
          </div>
        ) : (
          <div className="flex justify-center py-2.5 border-b border-border-light" title={`角色: ${ROLE_LABELS[currentRole]}`}>
            <span className="text-[10px] font-medium text-text-muted">{ROLE_LABELS[currentRole]}</span>
          </div>
        )}
        {!collapsed && (
          <div className="px-4 py-3 text-[10px] text-text-muted">
            <div>FSC v0.1</div>
            <div className="mt-0.5">by YC Chen</div>
          </div>
        )}
      </div>
    </div>
  );
}
