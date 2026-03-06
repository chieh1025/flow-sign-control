"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { ProcessNodeData } from "@/types/fsc";
import { cn } from "@/lib/utils";
import { useFSCStore } from "@/store/fsc-store";

const nodeTypeStyles: Record<string, string> = {
  start: "rounded-full border-green-500 bg-green-50 dark:bg-green-950",
  end: "rounded-full border-orange-500 bg-orange-50 dark:bg-orange-950",
  task: "rounded-lg border-blue-500 bg-white dark:bg-gray-800",
  decision: "rounded-lg border-purple-500 bg-purple-50 dark:bg-purple-950 rotate-0",
  connector: "rounded-full border-amber-500 bg-amber-50 dark:bg-amber-950",
};

const signMethodLabel: Record<string, { text: string; color: string }> = {
  system_sign: { text: "系統簽", color: "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400" },
  paper_sign: { text: "紙本簽", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-400" },
  both: { text: "系統+紙本", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400" },
};

function StatusBadge({ label, color }: { label: string; color: string }) {
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-xs font-medium", color)}>
      {label}
    </span>
  );
}

function ProcessNodeComponent({ id, data, selected }: NodeProps) {
  const nodeData = data as unknown as ProcessNodeData;
  const selectedNodeId = useFSCStore((s) => s.selectedNodeId);
  const isSelected = selectedNodeId === id || selected;

  const topApproval = nodeData.approvalAuthorities.find((a) => a.action === "approve");
  const style = nodeTypeStyles[nodeData.nodeType] || nodeTypeStyles.task;

  return (
    <>
      {nodeData.nodeType !== "start" && (
        <Handle type="target" position={Position.Top} className="!w-2 !h-2 !bg-gray-400 dark:!bg-gray-500" />
      )}

      <div
        className={cn(
          "border-2 px-4 py-3 w-[260px] shadow-sm transition-all",
          style,
          isSelected && "ring-2 ring-blue-400 ring-offset-1 dark:ring-offset-gray-900"
        )}
      >
        {/* Badges */}
        <div className="flex flex-wrap gap-1 mb-1.5">
          {nodeData.operatingSystem && (
            <StatusBadge label={nodeData.operatingSystem} color="bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400" />
          )}
          {nodeData.signMethod && signMethodLabel[nodeData.signMethod] && (
            <StatusBadge
              label={signMethodLabel[nodeData.signMethod].text}
              color={signMethodLabel[nodeData.signMethod].color}
            />
          )}
          {nodeData.status.vacant && (
            <StatusBadge label="缺人" color="bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400" />
          )}
          {nodeData.status.unsigned && (
            <StatusBadge label="未簽" color="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-400" />
          )}
          {nodeData.status.paperSign && (
            <StatusBadge label="紙本簽" color="bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300" />
          )}
          {nodeData.status.other && (
            <StatusBadge label={nodeData.status.other} color="bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300" />
          )}
        </div>

        {/* Node name */}
        <div className="font-semibold text-base text-gray-800 dark:text-gray-100">{nodeData.label}</div>

        {/* Top approval summary */}
        {topApproval && (
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {topApproval.amountMax
              ? `<= ${(topApproval.amountMax / 10000).toFixed(0)}萬`
              : ""}
            {" "}
            {topApproval.level}（{topApproval.levelPerson}）
          </div>
        )}

        {/* Connector label */}
        {nodeData.nodeType === "end" && (
          <div className="text-sm text-orange-600 dark:text-orange-400 mt-1 font-medium">
            {nodeData.label}
          </div>
        )}
      </div>

      {nodeData.nodeType !== "end" && (
        <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-gray-400 dark:!bg-gray-500" />
      )}
    </>
  );
}

export default memo(ProcessNodeComponent);
