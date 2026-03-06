"use client";

import Sidebar from "@/components/layout/Sidebar";
import { useState } from "react";
import { Plus, X, ChevronRight, ChevronDown } from "lucide-react";

interface ListItem {
  id: string;
  name: string;
}

interface DeptNode {
  id: string;
  name: string;
  children: DeptNode[];
}

function EditableList({
  title,
  items,
  onAdd,
  onRemove,
}: {
  title: string;
  items: ListItem[];
  onAdd: (name: string) => void;
  onRemove: (id: string) => void;
}) {
  const [newItem, setNewItem] = useState("");

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h3 className="font-semibold text-gray-800 text-sm mb-3">{title}</h3>
      <div className="space-y-1 mb-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded group"
          >
            <span className="flex-1 text-sm text-gray-700">{item.name}</span>
            <button
              onClick={() => onRemove(item.id)}
              className="opacity-0 group-hover:opacity-100 p-0.5 text-gray-400 hover:text-red-500 transition-opacity"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && newItem.trim()) {
              onAdd(newItem.trim());
              setNewItem("");
            }
          }}
          placeholder="新增..."
          className="flex-1 text-sm px-3 py-1.5 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
        />
        <button
          onClick={() => {
            if (newItem.trim()) {
              onAdd(newItem.trim());
              setNewItem("");
            }
          }}
          className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// --- Hierarchical Department Tree ---

function DeptTreeItem({
  node,
  depth,
  onAdd,
  onRemove,
}: {
  node: DeptNode;
  depth: number;
  onAdd: (parentId: string, name: string) => void;
  onRemove: (id: string) => void;
}) {
  const [open, setOpen] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const hasChildren = node.children.length > 0;

  return (
    <div>
      <div
        className="flex items-center gap-1 group py-1 hover:bg-gray-50 rounded"
        style={{ paddingLeft: `${depth * 20 + 8}px` }}
      >
        <button
          onClick={() => setOpen(!open)}
          className="w-5 h-5 flex items-center justify-center text-gray-400"
        >
          {hasChildren ? (
            open ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />
          ) : (
            <span className="w-3.5 h-3.5 flex items-center justify-center text-gray-300">·</span>
          )}
        </button>
        <span className="flex-1 text-sm text-gray-700">{node.name}</span>
        <button
          onClick={() => setAdding(true)}
          className="opacity-0 group-hover:opacity-100 p-0.5 text-gray-400 hover:text-blue-500"
          title="新增子部門"
        >
          <Plus className="w-3 h-3" />
        </button>
        <button
          onClick={() => onRemove(node.id)}
          className="opacity-0 group-hover:opacity-100 p-0.5 text-gray-400 hover:text-red-500 mr-2"
          title="刪除"
        >
          <X className="w-3 h-3" />
        </button>
      </div>

      {adding && (
        <div className="flex gap-1 py-1" style={{ paddingLeft: `${(depth + 1) * 20 + 8}px` }}>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && newName.trim()) {
                onAdd(node.id, newName.trim());
                setNewName("");
                setAdding(false);
              }
              if (e.key === "Escape") setAdding(false);
            }}
            placeholder="子部門名稱..."
            autoFocus
            className="flex-1 text-sm px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
          <button
            onClick={() => {
              if (newName.trim()) {
                onAdd(node.id, newName.trim());
                setNewName("");
                setAdding(false);
              }
            }}
            className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
          >
            確定
          </button>
          <button
            onClick={() => setAdding(false)}
            className="px-2 py-1 text-gray-500 text-xs rounded hover:bg-gray-100"
          >
            取消
          </button>
        </div>
      )}

      {open &&
        node.children.map((child) => (
          <DeptTreeItem
            key={child.id}
            node={child}
            depth={depth + 1}
            onAdd={onAdd}
            onRemove={onRemove}
          />
        ))}
    </div>
  );
}

function DepartmentTree() {
  const [tree, setTree] = useState<DeptNode[]>([
    {
      id: "d0",
      name: "董事長",
      children: [
        { id: "d0-1", name: "稽核室", children: [] },
      ],
    },
    {
      id: "d1",
      name: "總經理",
      children: [
        {
          id: "d2",
          name: "生產中心",
          children: [
            { id: "d2-1", name: "麵包部", children: [] },
            { id: "d2-2", name: "西點部", children: [] },
            { id: "d2-3", name: "包裝部", children: [] },
            { id: "d2-4", name: "研發部", children: [] },
            { id: "d2-5", name: "品管部", children: [] },
            { id: "d2-6", name: "物流倉儲部", children: [] },
          ],
        },
        {
          id: "d3",
          name: "營運管理中心",
          children: [
            {
              id: "d3-1",
              name: "營運部",
              children: [
                { id: "d3-1-1", name: "教育訓練課", children: [] },
                { id: "d3-1-2", name: "區督導", children: [] },
              ],
            },
            {
              id: "d3-2",
              name: "開發部",
              children: [
                { id: "d3-2-1", name: "工務課", children: [] },
                { id: "d3-2-2", name: "門市設計課", children: [] },
              ],
            },
            {
              id: "d3-3",
              name: "行銷部",
              children: [
                { id: "d3-3-1", name: "廣告設計課", children: [] },
                { id: "d3-3-2", name: "公關客服課", children: [] },
              ],
            },
            { id: "d3-4", name: "人資部", children: [
              { id: "d3-4-1", name: "文管課", children: [] },
            ] },
            { id: "d3-5", name: "財會部", children: [
              { id: "d3-5-1", name: "會計", children: [] },
              { id: "d3-5-2", name: "採購課", children: [] },
              { id: "d3-5-3", name: "總務", children: [] },
            ] },
            { id: "d3-6", name: "法務課", children: [] },
          ],
        },
      ],
    },
  ]);

  const [newRoot, setNewRoot] = useState("");

  let nextId = 1000;

  const addChild = (parentId: string, name: string) => {
    const id = `d-${nextId++}-${Date.now()}`;
    const addToTree = (nodes: DeptNode[]): DeptNode[] =>
      nodes.map((n) =>
        n.id === parentId
          ? { ...n, children: [...n.children, { id, name, children: [] }] }
          : { ...n, children: addToTree(n.children) }
      );
    setTree(addToTree(tree));
  };

  const removeNode = (targetId: string) => {
    const removeFromTree = (nodes: DeptNode[]): DeptNode[] =>
      nodes
        .filter((n) => n.id !== targetId)
        .map((n) => ({ ...n, children: removeFromTree(n.children) }));
    setTree(removeFromTree(tree));
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h3 className="font-semibold text-gray-800 text-sm mb-3">部門架構</h3>
      <div className="mb-3">
        {tree.map((node) => (
          <DeptTreeItem
            key={node.id}
            node={node}
            depth={0}
            onAdd={addChild}
            onRemove={removeNode}
          />
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={newRoot}
          onChange={(e) => setNewRoot(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && newRoot.trim()) {
              setTree([...tree, { id: `d-${Date.now()}`, name: newRoot.trim(), children: [] }]);
              setNewRoot("");
            }
          }}
          placeholder="新增頂層部門..."
          className="flex-1 text-sm px-3 py-1.5 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
        />
        <button
          onClick={() => {
            if (newRoot.trim()) {
              setTree([...tree, { id: `d-${Date.now()}`, name: newRoot.trim(), children: [] }]);
              setNewRoot("");
            }
          }}
          className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

let nextId = 100;

export default function SettingsPage() {
  const [titles, setTitles] = useState<ListItem[]>([
    { id: "1", name: "承辦" },
    { id: "2", name: "主管" },
    { id: "3", name: "部主管" },
    { id: "4", name: "處主管" },
    { id: "5", name: "總經理" },
    { id: "6", name: "董事長" },
    { id: "7", name: "董事會" },
  ]);

  const [systems, setSystems] = useState<ListItem[]>([
    { id: "1", name: "採購模組" },
    { id: "2", name: "庫存模組" },
    { id: "3", name: "總帳模組" },
    { id: "4", name: "成本模組" },
    { id: "5", name: "固資模組" },
    { id: "6", name: "簽核系統" },
    { id: "7", name: "POS" },
    { id: "8", name: "生管模組" },
    { id: "9", name: "銷售模組" },
    { id: "10", name: "人資模組" },
    { id: "11", name: "品管模組" },
    { id: "12", name: "紙本" },
  ]);

  const [amountLevels, setAmountLevels] = useState<ListItem[]>([
    { id: "1", name: "5萬" },
    { id: "2", name: "10萬" },
    { id: "3", name: "50萬" },
    { id: "4", name: "100萬" },
    { id: "5", name: "500萬" },
    { id: "6", name: "1,000萬" },
  ]);

  const addItem = (
    setter: React.Dispatch<React.SetStateAction<ListItem[]>>,
    name: string
  ) => {
    setter((prev) => [...prev, { id: String(nextId++), name }]);
  };

  const removeItem = (
    setter: React.Dispatch<React.SetStateAction<ListItem[]>>,
    id: string
  ) => {
    setter((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-y-auto p-6">
        <h1 className="text-xl font-bold text-gray-800 mb-6">基本設定</h1>
        <div className="grid grid-cols-2 gap-4 max-w-4xl">
          <DepartmentTree />
          <EditableList
            title="職稱層級"
            items={titles}
            onAdd={(name) => addItem(setTitles, name)}
            onRemove={(id) => removeItem(setTitles, id)}
          />
          <EditableList
            title="操作系統清單"
            items={systems}
            onAdd={(name) => addItem(setSystems, name)}
            onRemove={(id) => removeItem(setSystems, id)}
          />
          <EditableList
            title="核決金額級距"
            items={amountLevels}
            onAdd={(name) => addItem(setAmountLevels, name)}
            onRemove={(id) => removeItem(setAmountLevels, id)}
          />
        </div>
      </div>
    </div>
  );
}
