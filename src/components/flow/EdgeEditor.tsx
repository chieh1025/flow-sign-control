"use client";

import { useFSCStore } from "@/store/fsc-store";
import type { ProcessNodeData } from "@/types/fsc";
import { X, GitCommitHorizontal } from "lucide-react";
import { useState, useEffect } from "react";
import CommentSection from "./CommentSection";

export default function EdgeEditor() {
  const selectedEdgeId = useFSCStore((s) => s.selectedEdgeId);
  const setSelectedEdgeId = useFSCStore((s) => s.setSelectedEdgeId);
  const edges = useFSCStore((s) => s.edges);
  const nodes = useFSCStore((s) => s.nodes);
  const editMode = useFSCStore((s) => s.editMode);
  const updateEdgeLabel = useFSCStore((s) => s.updateEdgeLabel);

  const edge = edges.find((e) => e.id === selectedEdgeId);
  const [label, setLabel] = useState("");

  useEffect(() => {
    setLabel(typeof edge?.label === "string" ? edge.label : "");
  }, [edge?.id, edge?.label]);

  if (!selectedEdgeId || !edge) return null;

  const sourceNode = nodes.find((n) => n.id === edge.source);
  const targetNode = nodes.find((n) => n.id === edge.target);
  const sourceName = sourceNode ? (sourceNode.data as unknown as ProcessNodeData).label : edge.source;
  const targetName = targetNode ? (targetNode.data as unknown as ProcessNodeData).label : edge.target;

  return (
    <div className="w-80 border-l border-border bg-surface flex-shrink-0 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border-light">
        <div className="flex items-center gap-2">
          <GitCommitHorizontal className="w-4 h-4 text-text-muted" />
          <h3 className="font-bold text-sm text-text">連線設定</h3>
        </div>
        <button onClick={() => setSelectedEdgeId(null)} className="p-1 rounded hover:bg-surface-hover">
          <X className="w-4 h-4 text-text-muted" />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* From → To */}
        <div className="text-sm">
          <div className="text-text-muted text-xs mb-1">路徑</div>
          <div className="flex items-center gap-2 text-text">
            <span className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 rounded text-blue-700 dark:text-blue-400 font-medium">{sourceName}</span>
            <span className="text-text-muted">→</span>
            <span className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 rounded text-blue-700 dark:text-blue-400 font-medium">{targetName}</span>
          </div>
        </div>

        {/* Condition label */}
        <div>
          <label className="text-xs font-medium text-text-secondary block mb-1">條件標籤</label>
          {editMode ? (
            <div className="space-y-2">
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="例：金額>10萬、是、否、通過、退回..."
                className="w-full text-sm px-3 py-2 border border-border bg-surface rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-text"
              />
              <button
                onClick={() => updateEdgeLabel(selectedEdgeId, label)}
                className="px-3 py-1.5 bg-blue-500 text-white text-xs rounded-lg hover:bg-blue-600"
              >
                套用
              </button>
            </div>
          ) : (
            <div className="text-sm text-text">
              {typeof edge.label === "string" && edge.label ? edge.label : <span className="text-text-muted">（無條件）</span>}
            </div>
          )}
        </div>

        {/* Quick presets */}
        {editMode && (
          <div>
            <label className="text-xs font-medium text-text-secondary block mb-1.5">常用條件</label>
            <div className="flex flex-wrap gap-1.5">
              {["是", "否", "通過", "退回", "金額≤10萬", "金額>10萬", "金額>100萬", "核准", "駁回"].map((preset) => (
                <button
                  key={preset}
                  onClick={() => { setLabel(preset); updateEdgeLabel(selectedEdgeId, preset); }}
                  className="px-2 py-1 text-xs bg-surface-hover text-text-secondary rounded hover:bg-surface-hover"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Comments on edge */}
      <CommentSection targetId={selectedEdgeId} targetType="edge" />
    </div>
  );
}
