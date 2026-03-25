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

// ── Toolbar button styles ──
const btnBase = "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer";
const btnDefault = `${btnBase} bg-surface/80 backdrop-blur-sm border border-border text-text-secondary hover:bg-surface-hover hover:text-text shadow-sm`;

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
      {/* ── Floating Toolbar ── */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 p-1.5 rounded-xl bg-surface/70 backdrop-blur-md border border-border/60 shadow-lg">
        {/* Edit mode toggle */}
        {canEdit() && (
          <button
            onClick={() => setEditMode(!editMode)}
            className={cn(
              btnBase,
              editMode
                ? "bg-primary text-white shadow-sm hover:opacity-90"
                : "text-text-secondary hover:bg-surface-hover hover:text-text"
            )}
          >
            {editMode ? <><Pencil className="w-3.5 h-3.5" /> 編輯中</> : <><Eye className="w-3.5 h-3.5" /> 檢視</>}
          </button>
        )}

        {/* Separator */}
        {canEdit() && <div className="w-px h-5 bg-border" />}

        {editMode && canEdit() && (
          <>
            <button onClick={addNode} className={`${btnBase} text-text-secondary hover:bg-surface-hover hover:text-text`}>
              <Plus className="w-3.5 h-3.5" /> 新增
            </button>
            {canManage() && (
              <button onClick={() => saveSnapshot()} className={`${btnBase} text-text-secondary hover:bg-surface-hover hover:text-text`}>
                <Save className="w-3.5 h-3.5" /> 存版本
              </button>
            )}
            <div className="w-px h-5 bg-border" />
          </>
        )}

        <button onClick={handleAutoLayout} className={`${btnBase} text-text-secondary hover:bg-surface-hover hover:text-text`} title="自動排版">
          <AlignVerticalSpaceBetween className="w-3.5 h-3.5" /> 排版
        </button>

        {canManage() && (
          <>
            <div className="w-px h-5 bg-border" />
            <button onClick={handleExport} className={`${btnBase} text-text-secondary hover:bg-surface-hover hover:text-text`}>匯出</button>
            <button onClick={() => fileInputRef.current?.click()} className={`${btnBase} text-text-secondary hover:bg-surface-hover hover:text-text`}>匯入</button>
            <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
          </>
        )}
      </div>

      {/* ── Panel toggle ── */}
      {selectedNodeId && (
        <div className="absolute top-3 right-3 z-10">
          <button
            onClick={() => setDetailPanelOpen(!detailPanelOpen)}
            className={btnDefault}
            title={detailPanelOpen ? "收合面板" : "展開面板"}
          >
            {detailPanelOpen ? <PanelRightClose className="w-3.5 h-3.5" /> : <PanelRight className="w-3.5 h-3.5" />}
            {detailPanelOpen ? "收合" : "展開"}
          </button>
        </div>
      )}

      {/* ── Edit mode indicator ── */}
      {editMode && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[11px] font-medium backdrop-blur-sm">
          編輯模式 — 可拖曳節點、新增連線
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
        className={cn("bg-background transition-colors duration-300", editMode && "bg-primary-bg/30")}
      >
        <Background
          gap={20}
          size={editMode ? 1.5 : 1}
          color={editMode ? "var(--primary)" : "var(--border)"}
          style={{ opacity: editMode ? 0.15 : 1 }}
        />
        <Controls position="bottom-right" />
        <MiniMap
          position="bottom-left"
          nodeStrokeWidth={2}
          className="!bg-surface/80 !backdrop-blur-sm !border-border !rounded-lg !shadow-lg"
          maskColor="rgba(0,0,0,0.1)"
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
