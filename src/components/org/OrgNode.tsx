"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { OrgNodeData } from "@/store/org-store";
import { useOrgStore } from "@/store/org-store";
import { cn } from "@/lib/utils";

const typeStyles: Record<string, string> = {
  root: "border-indigo-500 bg-indigo-50",
  division: "border-blue-500 bg-blue-50",
  department: "border-emerald-500 bg-white",
  section: "border-gray-400 bg-gray-50",
  position: "border-amber-500 bg-amber-50",
};

function OrgNodeComponent({ id, data, selected }: NodeProps) {
  const d = data as unknown as OrgNodeData;
  const selectedNodeId = useOrgStore((s) => s.selectedNodeId);
  const isSelected = selectedNodeId === id || selected;
  const style = typeStyles[d.nodeType] || typeStyles.department;

  return (
    <>
      <Handle type="target" position={Position.Top} className="!w-2.5 !h-2.5 !bg-gray-400 hover:!bg-blue-500 !border-2 !border-white" />

      <div className={cn(
        "border-2 px-5 py-3 w-[200px] rounded-lg shadow-sm transition-all text-center",
        style,
        isSelected && "ring-2 ring-blue-400 ring-offset-1"
      )}>
        <div className="font-semibold text-base text-gray-800">{d.label}</div>
        {d.holder && (
          <div className="text-sm text-gray-500 mt-0.5">{d.holder}</div>
        )}
        {d.title && (
          <div className="text-sm text-gray-400 mt-0.5">{d.title}</div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="!w-2.5 !h-2.5 !bg-gray-400 hover:!bg-blue-500 !border-2 !border-white" />
    </>
  );
}

export default memo(OrgNodeComponent);
