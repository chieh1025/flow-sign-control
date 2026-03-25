"use client";

import { useCallback } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useReactFlow,
  ReactFlowProvider,
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useOrgStore } from "@/store/org-store";
import OrgNodeComponent from "./OrgNode";
import { AlignVerticalSpaceBetween, Plus, Pencil, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

const nodeTypes = { orgNode: OrgNodeComponent };

function OrgCanvasInner() {
  const nodes = useOrgStore((s) => s.nodes);
  const edges = useOrgStore((s) => s.edges);
  const onNodesChange = useOrgStore((s) => s.onNodesChange);
  const onEdgesChange = useOrgStore((s) => s.onEdgesChange);
  const setSelectedNodeId = useOrgStore((s) => s.setSelectedNodeId);
  const selectedNodeId = useOrgStore((s) => s.selectedNodeId);
  const editMode = useOrgStore((s) => s.editMode);
  const setEditMode = useOrgStore((s) => s.setEditMode);
  const addNode = useOrgStore((s) => s.addNode);
  const deleteNode = useOrgStore((s) => s.deleteNode);
  const autoLayout = useOrgStore((s) => s.autoLayout);
  const { fitView } = useReactFlow();

  const handleAutoLayout = useCallback(() => {
    autoLayout();
    setTimeout(() => fitView({ padding: 0.2 }), 50);
  }, [autoLayout, fitView]);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => setSelectedNodeId(node.id),
    [setSelectedNodeId]
  );

  const onPaneClick = useCallback(() => setSelectedNodeId(null), [setSelectedNodeId]);

  const onNodesDelete = useCallback(
    (deleted: Node[]) => {
      if (!editMode) return;
      deleted.forEach((n) => deleteNode(n.id));
    },
    [editMode, deleteNode]
  );

  return (
    <>
      {/* Toolbar */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 p-1.5 rounded-xl bg-surface/70 backdrop-blur-md border border-border/60 shadow-lg">
        <button
          onClick={() => setEditMode(!editMode)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer",
            editMode
              ? "bg-primary text-white shadow-sm hover:opacity-90"
              : "text-text-secondary hover:bg-surface-hover hover:text-text"
          )}
        >
          {editMode ? <><Pencil className="w-3.5 h-3.5" /> 編輯中</> : <><Eye className="w-3.5 h-3.5" /> 檢視</>}
        </button>

        {editMode && selectedNodeId && (
          <>
            <div className="w-px h-5 bg-border" />
            <button onClick={() => addNode(selectedNodeId)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-text-secondary hover:bg-surface-hover hover:text-text transition-all duration-150 cursor-pointer">
              <Plus className="w-3.5 h-3.5" /> 新增子部門
            </button>
          </>
        )}

        <div className="w-px h-5 bg-border" />
        <button onClick={handleAutoLayout} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-text-secondary hover:bg-surface-hover hover:text-text transition-all duration-150 cursor-pointer" title="自動排版">
          <AlignVerticalSpaceBetween className="w-3.5 h-3.5" /> 排版
        </button>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onNodesDelete={onNodesDelete}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        deleteKeyCode={editMode ? "Delete" : null}
        nodesDraggable={editMode}
        nodesConnectable={editMode}
        elementsSelectable
        fitView
        fitViewOptions={{ padding: 0.2 }}
        className="bg-background"
      >
        <Background gap={20} size={1} color="var(--border)" />
        <Controls position="bottom-right" />
        <MiniMap
          position="bottom-left"
          nodeStrokeWidth={2}
          className="!bg-surface/80 !backdrop-blur-sm !border-border !rounded-lg !shadow-lg"
          maskColor="rgba(0,0,0,0.08)"
        />
      </ReactFlow>
    </>
  );
}

export default function OrgCanvas() {
  return (
    <div className="flex-1 relative">
      <ReactFlowProvider>
        <OrgCanvasInner />
      </ReactFlowProvider>
    </div>
  );
}
