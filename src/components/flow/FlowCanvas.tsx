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
import NodeEditor from "./NodeEditor";
import { AlignVerticalSpaceBetween, Plus } from "lucide-react";

const nodeTypes = {
  processNode: ProcessNodeComponent,
};

const defaultEdgeOptions = {
  markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16 },
  style: { strokeWidth: 2 },
};

const btnClass =
  "px-3 py-1.5 bg-white border border-gray-200 rounded-md text-xs text-gray-600 hover:bg-gray-50 shadow-sm";

function FlowCanvasInner() {
  const nodes = useFSCStore((s) => s.nodes);
  const edges = useFSCStore((s) => s.edges);
  const onNodesChange = useFSCStore((s) => s.onNodesChange);
  const onEdgesChange = useFSCStore((s) => s.onEdgesChange);
  const onConnect = useFSCStore((s) => s.onConnect);
  const setSelectedNodeId = useFSCStore((s) => s.setSelectedNodeId);
  const setEditingNodeId = useFSCStore((s) => s.setEditingNodeId);
  const addNode = useFSCStore((s) => s.addNode);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importJSON = useFSCStore((s) => s.importJSON);
  const exportJSON = useFSCStore((s) => s.exportJSON);
  const currentProcessName = useFSCStore((s) => s.currentProcessName);
  const autoLayout = useFSCStore((s) => s.autoLayout);
  const { fitView } = useReactFlow();

  const handleAutoLayout = useCallback(() => {
    autoLayout();
    // fitView after a tick so React Flow picks up new positions
    setTimeout(() => fitView({ padding: 0.3 }), 50);
  }, [autoLayout, fitView]);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      setSelectedNodeId(node.id);
    },
    [setSelectedNodeId]
  );

  const onNodeDoubleClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      setEditingNodeId(node.id);
    },
    [setEditingNodeId]
  );

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, [setSelectedNodeId]);

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
        <button onClick={addNode} className={`${btnClass} flex items-center gap-1.5`}>
          <Plus className="w-3.5 h-3.5" />
          新增節點
        </button>
        <button
          onClick={handleAutoLayout}
          className={`${btnClass} flex items-center gap-1.5`}
          title="自動排版"
        >
          <AlignVerticalSpaceBetween className="w-3.5 h-3.5" />
          排版
        </button>
        <button onClick={handleExport} className={btnClass}>
          匯出 JSON
        </button>
        <button onClick={() => fileInputRef.current?.click()} className={btnClass}>
          匯入 JSON
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
        />
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onNodeDoubleClick={onNodeDoubleClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        className="bg-gray-50"
      >
        <Background gap={20} size={1} color="#e5e7eb" />
        <Controls position="bottom-right" />
        <MiniMap
          position="bottom-left"
          nodeStrokeWidth={2}
          className="!bg-white !border-gray-200"
          maskColor="rgba(0,0,0,0.08)"
        />
      </ReactFlow>

      {/* Node editor modal */}
      <NodeEditor />
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
