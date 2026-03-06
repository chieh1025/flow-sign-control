"use client";

import { useOrgStore, type OrgNodeData } from "@/store/org-store";
import { cn } from "@/lib/utils";

const nodeTypeLabels: Record<string, string> = {
  root: "最高層級",
  division: "中心/處",
  department: "部門",
  section: "課/組",
  position: "職位",
};

const nodeTypeOptions: OrgNodeData["nodeType"][] = [
  "root",
  "division",
  "department",
  "section",
  "position",
];

export default function OrgDetailPanel() {
  const nodes = useOrgStore((s) => s.nodes);
  const edges = useOrgStore((s) => s.edges);
  const selectedNodeId = useOrgStore((s) => s.selectedNodeId);
  const editMode = useOrgStore((s) => s.editMode);
  const updateNodeData = useOrgStore((s) => s.updateNodeData);
  const deleteNode = useOrgStore((s) => s.deleteNode);
  const setSelectedNodeId = useOrgStore((s) => s.setSelectedNodeId);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);
  const data = selectedNode?.data as unknown as OrgNodeData | undefined;

  // Find parent and children
  const parentEdge = edges.find((e) => e.target === selectedNodeId);
  const parentNode = parentEdge
    ? nodes.find((n) => n.id === parentEdge.source)
    : null;
  const childEdges = edges.filter((e) => e.source === selectedNodeId);
  const childNodes = childEdges
    .map((e) => nodes.find((n) => n.id === e.target))
    .filter(Boolean);

  if (!selectedNode || !data) {
    return (
      <div className="w-72 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex items-center justify-center">
        <p className="text-sm text-gray-400 dark:text-gray-500">
          點選節點查看詳情
        </p>
      </div>
    );
  }

  return (
    <div className="w-72 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-y-auto">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <h3 className="font-semibold text-sm text-gray-800 dark:text-gray-100">
          {data.label}
        </h3>
        <span className="text-xs text-gray-400 dark:text-gray-500">
          {nodeTypeLabels[data.nodeType] || data.nodeType}
        </span>
      </div>

      {/* Fields */}
      <div className="px-4 py-3 space-y-3">
        {/* Label */}
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            名稱
          </label>
          {editMode ? (
            <input
              type="text"
              value={data.label}
              onChange={(e) =>
                updateNodeData(selectedNode.id, { label: e.target.value })
              }
              className="w-full px-2 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          ) : (
            <p className="text-sm text-gray-800 dark:text-gray-100">
              {data.label}
            </p>
          )}
        </div>

        {/* Node Type */}
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            類型
          </label>
          {editMode ? (
            <select
              value={data.nodeType}
              onChange={(e) =>
                updateNodeData(selectedNode.id, {
                  nodeType: e.target.value as OrgNodeData["nodeType"],
                })
              }
              className="w-full px-2 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-400"
            >
              {nodeTypeOptions.map((t) => (
                <option key={t} value={t}>
                  {nodeTypeLabels[t]}
                </option>
              ))}
            </select>
          ) : (
            <p className="text-sm text-gray-800 dark:text-gray-100">
              {nodeTypeLabels[data.nodeType]}
            </p>
          )}
        </div>

        {/* Title */}
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            職稱
          </label>
          {editMode ? (
            <input
              type="text"
              value={data.title || ""}
              onChange={(e) =>
                updateNodeData(selectedNode.id, {
                  title: e.target.value || undefined,
                })
              }
              placeholder="如：廠長、副總"
              className="w-full px-2 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder:text-gray-300 dark:placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          ) : (
            <p className="text-sm text-gray-800 dark:text-gray-100">
              {data.title || "-"}
            </p>
          )}
        </div>

        {/* Holder */}
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            現任
          </label>
          {editMode ? (
            <input
              type="text"
              value={data.holder || ""}
              onChange={(e) =>
                updateNodeData(selectedNode.id, {
                  holder: e.target.value || undefined,
                })
              }
              placeholder="如：王小明"
              className="w-full px-2 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder:text-gray-300 dark:placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          ) : (
            <p className="text-sm text-gray-800 dark:text-gray-100">
              {data.holder || "-"}
            </p>
          )}
        </div>

        {/* Headcount */}
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            編制人數
          </label>
          {editMode ? (
            <input
              type="number"
              min={0}
              value={data.headcount ?? ""}
              onChange={(e) =>
                updateNodeData(selectedNode.id, {
                  headcount: e.target.value
                    ? parseInt(e.target.value)
                    : undefined,
                })
              }
              placeholder="0"
              className="w-full px-2 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder:text-gray-300 dark:placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          ) : (
            <p className="text-sm text-gray-800 dark:text-gray-100">
              {data.headcount ?? "-"}
            </p>
          )}
        </div>
      </div>

      {/* Relationships */}
      <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 space-y-2">
        <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400">
          關係
        </h4>

        {parentNode && (
          <div>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              上層：
            </span>
            <button
              onClick={() => setSelectedNodeId(parentNode.id)}
              className="text-xs text-blue-500 hover:underline"
            >
              {(parentNode.data as unknown as OrgNodeData).label}
            </button>
          </div>
        )}

        {childNodes.length > 0 && (
          <div>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              下層 ({childNodes.length})：
            </span>
            <div className="flex flex-wrap gap-1 mt-1">
              {childNodes.map(
                (child) =>
                  child && (
                    <button
                      key={child.id}
                      onClick={() => setSelectedNodeId(child.id)}
                      className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                    >
                      {(child.data as unknown as OrgNodeData).label}
                    </button>
                  )
              )}
            </div>
          </div>
        )}
      </div>

      {/* Delete */}
      {editMode && (
        <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={() => {
              if (confirm(`確定刪除「${data.label}」？其下屬連結也會一併移除。`)) {
                deleteNode(selectedNode.id);
              }
            }}
            className={cn(
              "w-full px-3 py-1.5 text-xs rounded-md",
              "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400",
              "border border-red-200 dark:border-red-800",
              "hover:bg-red-100 dark:hover:bg-red-900/40"
            )}
          >
            刪除此節點
          </button>
        </div>
      )}
    </div>
  );
}
