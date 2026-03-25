"use client";

import { useCallback, useRef } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  MarkerType,
  useReactFlow,
  ReactFlowProvider,
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useFSCStore } from "@/store/fsc-store";
import ProcessNodeComponent from "./ProcessNode";
import { AlignVerticalSpaceBetween, Plus, Pencil, Eye, Save, PanelRightClose, PanelRight } from "lucide-react";
import { cn } from "@/lib/utils";

const nodeTypes = {
  processNode: ProcessNodeComponent,
};

const defaultEdgeOptions = {
  markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16 },
  style: { strokeWidth: 2 },
};

const btnClass =
  "px-3 py-1.5 bg-surface border border-border rounded-md text-xs text-text-secondary hover:bg-surface-hover shadow-sm";

function FlowCanvasInner() {
  const nodes = useFSCStore((s) => s.nodes);
  const edges = useFSCStore((s) => s.edges);
  const onNodesChange = useFSCStore((s) => s.onNodesChange);
  const onEdgesChange = useFSCStore((s) => s.onEdgesChange);
  const onConnect = useFSCStore((s) => s.onConnect);
  const setSelectedNodeId = useFSCStore((s) => s.setSelectedNodeId);
  const addNode = useFSCStore((s) => s.addNode);
  const editMode = useFSCStore((s) => s.editMode);
  const setEditMode = useFSCStore((s) => s.setEditMode);
  const saveSnapshot = useFSCStore((s) => s.saveSnapshot);
  const canEdit = useFSCStore((s) => s.canEdit);
  const canManage = useFSCStore((s) => s.canManage);
  const detailPanelOpen = useFSCStore((s) => s.detailPanelOpen);
  const setDetailPanelOpen = useFSCStore((s) => s.setDetailPanelOpen);
  const selectedNodeId = useFSCStore((s) => s.selectedNodeId);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importJSON = useFSCStore((s) => s.importJSON);
  const exportJSON = useFSCStore((s) => s.exportJSON);
  const currentProcessName = useFSCStore((s) => s.currentProcessName);
  const autoLayout = useFSCStore((s) => s.autoLayout);
  const { fitView } = useReactFlow();

  const handleAutoLayout = useCallback(() => {
    autoLayout();
    setTimeout(() => fitView({ padding: 0.3 }), 50);
  }, [autoLayout, fitView]);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      setSelectedNodeId(node.id);
    },
    [setSelectedNodeId]
  );

  const selectedEdgeId = useFSCStore((s) => s.selectedEdgeId);
  const setSelectedEdgeId = useFSCStore((s) => s.setSelectedEdgeId);
  const updateEdgeLabel = useFSCStore((s) => s.updateEdgeLabel);

  const onEdgeClick = useCallback(
    (_: React.MouseEvent, edge: { id: string }) => {
      setSelectedEdgeId(edge.id);
      setSelectedNodeId(null);
    },
    [setSelectedEdgeId, setSelectedNodeId]
  );

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
  }, [setSelectedNodeId, setSelectedEdgeId]);

  const deleteNode = useFSCStore((s) => s.deleteNode);
  const onNodesDelete = useCallback(
    (deleted: Node[]) => {
      if (!editMode) return;
      deleted.forEach((n) => deleteNode(n.id));
    },
    [editMode, deleteNode]
  );

  const handleExport = useCallback(() => {
    const data = exportJSON();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fsc-${currentProcessName}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [exportJSON, currentProcessName]);

  const handleImport = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const json = JSON.parse(ev.target?.result as string);
          if (json.nodes && json.edges) {
            importJSON(json);
          }
        } catch {
          alert("JSON 格式錯誤");
        }
      };
      reader.readAsText(file);
      e.target.value = "";
    },
    [importJSON]
  );

  return (
    <>
      {/* Toolbar */}
      <div className="absolute top-3 left-3 z-10 flex gap-2">
        {/* Edit mode toggle - only for editor/admin */}
        {canEdit() && (
          <button
            onClick={() => setEditMode(!editMode)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs shadow-sm border",
              editMode
                ? "bg-blue-500 text-white border-blue-500 hover:bg-blue-600"
                : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            )}
          >
            {editMode ? <><Pencil className="w-3.5 h-3.5" /> 編輯中</> : <><Eye className="w-3.5 h-3.5" /> 檢視</>}
          </button>
        )}

        {editMode && canEdit() && (
          <>
            <button onClick={addNode} className={`${btnClass} flex items-center gap-1.5`}>
              <Plus className="w-3.5 h-3.5" /> 新增節點
            </button>
            {canManage() && (
              <button onClick={() => saveSnapshot()} className={`${btnClass} flex items-center gap-1.5`}>
                <Save className="w-3.5 h-3.5" /> 存版本
              </button>
            )}
          </>
        )}

        <button onClick={handleAutoLayout} className={`${btnClass} flex items-center gap-1.5`} title="自動排版">
          <AlignVerticalSpaceBetween className="w-3.5 h-3.5" /> 排版
        </button>
        {canManage() && (
          <>
            <button onClick={handleExport} className={btnClass}>匯出 JSON</button>
            <button onClick={() => fileInputRef.current?.click()} className={btnClass}>匯入 JSON</button>
            <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
          </>
        )}
      </div>

      {/* Panel toggle */}
      {selectedNodeId && (
        <div className="absolute top-3 right-3 z-10">
          <button
            onClick={() => setDetailPanelOpen(!detailPanelOpen)}
            className={`${btnClass} flex items-center gap-1.5`}
            title={detailPanelOpen ? "收合面板" : "展開面板"}
          >
            {detailPanelOpen ? <PanelRightClose className="w-3.5 h-3.5" /> : <PanelRight className="w-3.5 h-3.5" />}
            {detailPanelOpen ? "收合" : "展開"}
          </button>
        </div>
      )}

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        onNodesDelete={onNodesDelete}
        deleteKeyCode={editMode ? "Delete" : null}
        nodesDraggable={editMode}
        nodesConnectable={editMode}
        edgesFocusable={editMode}
        elementsSelectable
        fitView
        fitViewOptions={{ padding: 0.3 }}
        className="bg-background"
      >
        <Background gap={20} size={1} color="#e5e7eb" className="dark:[&_circle]:fill-slate-700" />
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

export default function FlowCanvas() {
  return (
    <div className="flex-1 relative">
      <ReactFlowProvider>
        <FlowCanvasInner />
      </ReactFlowProvider>
    </div>
  );
}
