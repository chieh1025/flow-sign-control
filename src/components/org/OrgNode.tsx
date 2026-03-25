"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { OrgNodeData } from "@/store/org-store";
import { useOrgStore } from "@/store/org-store";
import { cn } from "@/lib/utils";

// ── Left stripe color by org level ──
const stripeColor: Record<string, string> = {
  root: "border-l-indigo-500",
  division: "border-l-blue-500",
  department: "border-l-emerald-500",
  section: "border-l-slate-400 dark:border-l-slate-500",
  position: "border-l-amber-500",
};

const handleClass = "!w-2 !h-2 !bg-slate-300 dark:!bg-slate-600 hover:!bg-blue-500 !border-[1.5px] !border-white dark:!border-slate-800 transition-colors";

function OrgNodeComponent({ id, data, selected }: NodeProps) {
  const d = data as unknown as OrgNodeData;
  const selectedNodeId = useOrgStore((s) => s.selectedNodeId);
  const isSelected = selectedNodeId === id || selected;
  const stripe = stripeColor[d.nodeType] || stripeColor.department;

  return (
    <>
      <Handle type="target" position={Position.Top} className={handleClass} />

      <div className={cn(
        // Base card
        "w-[200px] bg-white dark:bg-slate-800 rounded-lg cursor-pointer transition-all duration-150 text-center",
        // Left stripe
        "border-l-4", stripe,
        // Other borders
        "border-t border-r border-b border-slate-200 dark:border-slate-700",
        // Shadow elevation
        "shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.06)]",
        "dark:shadow-[0_2px_6px_rgba(0,0,0,0.3),0_1px_3px_rgba(0,0,0,0.2)]",
        // Hover
        "hover:shadow-[0_4px_12px_rgba(0,0,0,0.1),0_2px_4px_rgba(0,0,0,0.06)]",
        "dark:hover:shadow-[0_6px_20px_rgba(0,0,0,0.4),0_2px_6px_rgba(0,0,0,0.3)]",
        "hover:border-slate-300 dark:hover:border-slate-600",
        // Selected
        isSelected && "ring-2 ring-blue-500 dark:ring-blue-400 ring-offset-2 ring-offset-white dark:ring-offset-slate-900"
      )}>
        <div className="px-4 py-2.5">
          <div className="font-medium text-[13px] text-slate-800 dark:text-slate-100">{d.label}</div>
          {d.holder && (
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{d.holder}</div>
          )}
          {d.title && (
            <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{d.title}</div>
          )}
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className={handleClass} />
    </>
  );
}

export default memo(OrgNodeComponent);
