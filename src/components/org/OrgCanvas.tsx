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

const btnClass =
  "px-3 py-1.5 bg-surface border border-border rounded-md text-xs text-text-secondary hover:bg-surface-hover shadow-sm";

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
      <div className="absolute top-3 left-3 z-10 flex gap-2">
        <button
          onClick={() => setEditMode(!editMode)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs shadow-sm border",
            editMode
              ? "bg-blue-500 text-white border-blue-500 hover:bg-blue-600"
              : "bg-surface border-border text-text-secondary hover:bg-surface-hover"
          )}
        >
          {editMode ? <><Pencil className="w-3.5 h-3.5" /> 編輯中</> : <><Eye className="w-3.5 h-3.5" /> 檢視</>}
        </button>

        {editMode && selectedNodeId && (
          <button onClick={() => addNode(selectedNodeId)} className={`${btnClass} flex items-center gap-1.5`}>
            <Plus className="w-3.5 h-3.5" /> 新增子部門
          </button>
        )}

        <button onClick={handleAutoLayout} className={`${btnClass} flex items-center gap-1.5`} title="自動排版">
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
        <Background gap={20} size={1} color="#e5e7eb" />
        <Controls position="bottom-right" />
        <MiniMap
          position="bottom-left"
          nodeStrokeWidth={2}
          className="!bg-surface !border-border"
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
