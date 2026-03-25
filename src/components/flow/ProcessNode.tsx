"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { ProcessNodeData } from "@/types/fsc";
import { cn } from "@/lib/utils";
import { useFSCStore } from "@/store/fsc-store";
import { MessageSquare } from "lucide-react";

// ── Node type visual config ──
const nodeTypeStyles: Record<string, string> = {
  start: "rounded-3xl border-emerald-400 dark:border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40",
  end: "rounded-3xl border-orange-400 dark:border-orange-500 bg-orange-50/80 dark:bg-orange-950/40",
  task: "rounded-lg border-border bg-surface",
  decision: "rounded-lg border-violet-400 dark:border-violet-500 bg-violet-50/60 dark:bg-violet-950/30 rotate-0",
  connector: "rounded-full border-amber-400 dark:border-amber-500 bg-amber-50/80 dark:bg-amber-950/40",
};

const signMethodLabel: Record<string, { text: string; color: string }> = {
  system_sign: { text: "系統簽", color: "bg-emerald-100/80 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
  paper_sign: { text: "紙本簽", color: "bg-orange-100/80 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
  both: { text: "系統+紙本", color: "bg-sky-100/80 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400" },
};

// ── Handle shared class ──
const handleClass = "!w-2 !h-2 !bg-text-muted hover:!bg-primary !border-[1.5px] !border-surface transition-colors";

function StatusBadge({ label, color }: { label: string; color: string }) {
  return (
    <span className={cn("inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium leading-none whitespace-nowrap", color)}>
      {label}
    </span>
  );
}

function ProcessNodeComponent({ id, data, selected }: NodeProps) {
  const nodeData = data as unknown as ProcessNodeData;
  const selectedNodeId = useFSCStore((s) => s.selectedNodeId);
  const commentCount = useFSCStore((s) => s.comments.filter((c) => c.targetId === id).length);
  const isSelected = selectedNodeId === id || selected;

  const topApproval = nodeData.approvalAuthorities.find((a) => a.action === "approve");
  const style = nodeTypeStyles[nodeData.nodeType] || nodeTypeStyles.task;

  const hasBadges = nodeData.operatingSystem || nodeData.signMethod || nodeData.status.vacant || nodeData.status.unsigned || nodeData.status.paperSign || nodeData.status.other;

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
          "relative border-2 px-3 py-2 w-[220px] transition-all duration-150",
          "shadow-sm hover:shadow-md hover:border-primary/40",
          "cursor-pointer",
          style,
          isSelected && "ring-2 ring-primary/60 ring-offset-1 ring-offset-background shadow-md"
        )}
      >
        {/* Badges row */}
        {hasBadges && (
          <div className="flex flex-wrap gap-1 mb-1">
            {nodeData.operatingSystem && (
              <StatusBadge label={nodeData.operatingSystem} color="bg-sky-100/80 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400" />
            )}
            {nodeData.signMethod && signMethodLabel[nodeData.signMethod] && (
              <StatusBadge
                label={signMethodLabel[nodeData.signMethod].text}
                color={signMethodLabel[nodeData.signMethod].color}
              />
            )}
            {nodeData.status.vacant && (
              <StatusBadge label="缺人" color="bg-red-100/80 text-red-700 dark:bg-red-900/30 dark:text-red-400" />
            )}
            {nodeData.status.unsigned && (
              <StatusBadge label="未簽" color="bg-amber-100/80 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" />
            )}
            {nodeData.status.paperSign && (
              <StatusBadge label="紙本簽" color="bg-surface-hover text-text-muted" />
            )}
            {nodeData.status.other && (
              <StatusBadge label={nodeData.status.other} color="bg-surface-hover text-text-muted" />
            )}
          </div>
        )}

        {/* Node name */}
        <div className="font-medium text-[13px] text-text leading-tight">{nodeData.label}</div>

        {/* Top approval summary */}
        {topApproval && (
          <div className="text-[11px] text-text-muted mt-0.5 leading-tight">
            {topApproval.amountMax
              ? `≤ ${(topApproval.amountMax / 10000).toFixed(0)}萬 `
              : ""}
            {topApproval.level}（{topApproval.levelPerson}）
          </div>
        )}

        {/* End node sublabel */}
        {nodeData.nodeType === "end" && (
          <div className="text-[11px] text-orange-600 dark:text-orange-400 mt-0.5 font-medium leading-tight">
            {nodeData.label}
          </div>
        )}

        {/* Comment indicator */}
        {commentCount > 0 && (
          <div className="absolute -top-1.5 -right-1.5 flex items-center gap-0.5 px-1 py-0.5 bg-amber-500 text-white rounded-full text-[9px] font-bold shadow">
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
