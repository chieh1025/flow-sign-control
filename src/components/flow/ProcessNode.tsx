"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { ProcessNodeData } from "@/types/fsc";
import { cn } from "@/lib/utils";
import { useFSCStore } from "@/store/fsc-store";
import { MessageSquare } from "lucide-react";

// ── Left stripe color by node type ──
const stripeColor: Record<string, string> = {
  start: "border-l-emerald-500",
  end: "border-l-orange-500",
  task: "border-l-blue-500",
  decision: "border-l-violet-500",
  connector: "border-l-amber-500",
};

// ── Shape by node type ──
const shapeClass: Record<string, string> = {
  start: "rounded-2xl",
  end: "rounded-2xl",
  task: "rounded-lg",
  decision: "rounded-lg",
  connector: "rounded-full",
};

const signMethodLabel: Record<string, string> = {
  system_sign: "系統簽",
  paper_sign: "紙本簽",
  both: "系統+紙本",
};

const handleClass = "!w-2 !h-2 !bg-slate-300 dark:!bg-slate-600 hover:!bg-blue-500 !border-[1.5px] !border-white dark:!border-slate-800 transition-colors";

function ProcessNodeComponent({ id, data, selected }: NodeProps) {
  const nodeData = data as unknown as ProcessNodeData;
  const selectedNodeId = useFSCStore((s) => s.selectedNodeId);
  const commentCount = useFSCStore((s) => s.comments.filter((c) => c.targetId === id).length);
  const isSelected = selectedNodeId === id || selected;

  const topApproval = nodeData.approvalAuthorities.find((a) => a.action === "approve");
  const stripe = stripeColor[nodeData.nodeType] || stripeColor.task;
  const shape = shapeClass[nodeData.nodeType] || shapeClass.task;

  // Collect status tags
  const tags: string[] = [];
  if (nodeData.operatingSystem) tags.push(nodeData.operatingSystem);
  if (nodeData.signMethod && signMethodLabel[nodeData.signMethod]) tags.push(signMethodLabel[nodeData.signMethod]);
  if (nodeData.status.vacant) tags.push("缺人");
  if (nodeData.status.unsigned) tags.push("未簽");
  if (nodeData.status.paperSign) tags.push("紙本簽");
  if (nodeData.status.other) tags.push(nodeData.status.other);

  return (
    <>
      {/* Target handles */}
      {nodeData.nodeType !== "start" && (
        <>
          <Handle id="target-top" type="target" position={Position.Top} className={handleClass} />
          <Handle id="target-left" type="target" position={Position.Left} className={handleClass} />
          <Handle id="target-right" type="target" position={Position.Right} className={handleClass} />
        </>
      )}

      <div
        className={cn(
          // Base card
          "relative w-[220px] bg-white dark:bg-slate-800 cursor-pointer transition-all duration-150",
          // Left stripe
          "border-l-4", stripe,
          // Other borders
          "border-t border-r border-b border-slate-200 dark:border-slate-700",
          // Shape
          shape,
          // Shadow elevation
          "shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.06)]",
          "dark:shadow-[0_2px_6px_rgba(0,0,0,0.3),0_1px_3px_rgba(0,0,0,0.2)]",
          // Hover
          "hover:shadow-[0_4px_12px_rgba(0,0,0,0.1),0_2px_4px_rgba(0,0,0,0.06)]",
          "dark:hover:shadow-[0_6px_20px_rgba(0,0,0,0.4),0_2px_6px_rgba(0,0,0,0.3)]",
          "hover:border-slate-300 dark:hover:border-slate-600",
          // Selected
          isSelected && "ring-2 ring-blue-500 dark:ring-blue-400 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 shadow-[0_4px_12px_rgba(59,130,246,0.15)] dark:shadow-[0_4px_16px_rgba(96,165,250,0.2)]"
        )}
      >
        <div className="px-3 py-2">
          {/* Node name */}
          <div className="font-medium text-[13px] text-slate-800 dark:text-slate-100 leading-tight">
            {nodeData.label}
          </div>

          {/* Approval summary */}
          {topApproval && (
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
              {topApproval.amountMax ? `≤ ${(topApproval.amountMax / 10000).toFixed(0)}萬 ` : ""}
              {topApproval.level}（{topApproval.levelPerson}）
            </div>
          )}

          {/* Status tags — simple dot + text, no colored badges */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-1">
              {tags.map((tag, i) => (
                <span key={i} className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500">
                  <span className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    tag === "缺人" ? "bg-red-500" :
                    tag === "未簽" ? "bg-amber-500" :
                    "bg-slate-300 dark:bg-slate-600"
                  )} />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Comment indicator */}
        {commentCount > 0 && (
          <div className="absolute -top-1.5 -right-1.5 flex items-center gap-0.5 px-1 py-0.5 bg-blue-500 text-white rounded-full text-[9px] font-bold shadow">
            <MessageSquare className="w-2 h-2" />
            {commentCount}
          </div>
        )}
      </div>

      {/* Source handles */}
      {nodeData.nodeType !== "end" && (
        <>
          <Handle id="source-bottom" type="source" position={Position.Bottom} className={handleClass} />
          <Handle id="source-left" type="source" position={Position.Left} className={handleClass} style={{ top: "40%" }} />
          <Handle id="source-right" type="source" position={Position.Right} className={handleClass} style={{ top: "40%" }} />
          <Handle id="source-top" type="source" position={Position.Top} className={handleClass} />
        </>
      )}
    </>
  );
}

export default memo(ProcessNodeComponent);
