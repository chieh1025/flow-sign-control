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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useFSCStore } from "@/store/fsc-store";
import { ROLE_LABELS, type Role } from "@/types/fsc";

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
          <div className="flex flex-col leading-tight">
            <span className="font-bold text-sm text-gray-800 tracking-tight">FSC 流程核決控制平台</span>
            <span className="text-[9px] text-gray-400 tracking-wider">Flow & Sign & Control</span>
          </div>
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

      {/* Role + Theme toggle + Footer */}
      <div className="border-t border-gray-100">
        {/* Role selector */}
        {!collapsed ? (
          <div className="px-4 py-2.5 border-b border-gray-100">
            <label className="text-[10px] text-gray-400 block mb-1">目前角色</label>
            <select
              value={currentRole}
              onChange={(e) => setCurrentRole(e.target.value as Role)}
              className="w-full text-xs px-2 py-1.5 border border-gray-200 rounded bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400"
            >
              {(Object.keys(ROLE_LABELS) as Role[]).map((r) => (
                <option key={r} value={r}>{ROLE_LABELS[r]}</option>
              ))}
            </select>
          </div>
        ) : (
          <div className="flex justify-center py-2.5 border-b border-gray-100" title={`角色: ${ROLE_LABELS[currentRole]}`}>
            <span className="text-[10px] font-medium text-gray-500">{ROLE_LABELS[currentRole]}</span>
          </div>
        )}
        {!collapsed && (
          <div className="px-4 py-3 text-[10px] text-gray-400">
            <div>FSC v0.1</div>
            <div className="mt-0.5">by YC Chen</div>
          </div>
        )}
      </div>
    </div>
  );
}
