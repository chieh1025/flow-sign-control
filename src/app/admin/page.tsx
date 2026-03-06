"use client";

import Sidebar from "@/components/layout/Sidebar";
import { useFSCStore, type OperationLog, type FlowSnapshot } from "@/store/fsc-store";
import { useState } from "react";
import { Trash2, RotateCcw, Clock, History, Save, Check, Plus, X, ChevronRight, ChevronDown } from "lucide-react";
import { ROLE_LABELS, ROLE_PERMISSIONS, type Role } from "@/types/fsc";

// --- Shared Components ---

function Toggle({ label, desc, checked, onChange }: { label: string; desc: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between">
      <div>
        <div className="text-sm font-medium text-gray-700">{label}</div>
        <div className="text-xs text-gray-400">{desc}</div>
      </div>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="w-4 h-4 rounded border-gray-300" />
    </label>
  );
}

function LogEntry({ log }: { log: OperationLog }) {
  const t = new Date(log.timestamp);
  return (
    <div className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-b-0">
      <div className="text-[10px] text-gray-400 mt-0.5 w-16 flex-shrink-0">
        {t.toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit" })}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm text-gray-700">{log.detail}</div>
        {log.changes && log.changes.length > 0 && (
          <div className="mt-1 space-y-0.5">
            {log.changes.map((c, i) => (
              <div key={i} className="text-xs text-gray-400">
                <span className="text-gray-500">{c.field}</span>：
                <span className="text-red-400 line-through">{c.from.slice(0, 30)}</span>
                {" → "}
                <span className="text-green-600">{c.to.slice(0, 30)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 flex-shrink-0">
        {log.action.split(".")[1]}
      </span>
    </div>
  );
}

function SnapshotRow({ snap, onRestore, onDelete }: { snap: FlowSnapshot; onRestore: () => void; onDelete: () => void }) {
  const t = new Date(snap.timestamp);
  return (
    <div className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-b-0 group">
      <Clock className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-sm text-gray-700 truncate">{snap.label}</div>
        <div className="text-xs text-gray-400">
          {t.toLocaleDateString("zh-TW")} {t.toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit" })}
          {" · "}{snap.nodes.length} 節點
        </div>
      </div>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={onRestore} className="p-1 text-blue-500 hover:bg-blue-50 rounded" title="還原此版本">
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
        <button onClick={onDelete} className="p-1 text-red-400 hover:bg-red-50 rounded" title="刪除">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// --- Editable List ---
interface ListItem { id: string; name: string }

function EditableList({ title, items, onAdd, onRemove }: {
  title: string; items: ListItem[];
  onAdd: (name: string) => void; onRemove: (id: string) => void;
}) {
  const [newItem, setNewItem] = useState("");
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h3 className="font-semibold text-gray-800 text-sm mb-3">{title}</h3>
      <div className="space-y-1 mb-3">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded group">
            <span className="flex-1 text-sm text-gray-700">{item.name}</span>
            <button onClick={() => onRemove(item.id)} className="opacity-0 group-hover:opacity-100 p-0.5 text-gray-400 hover:text-red-500">
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input type="text" value={newItem} onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && newItem.trim()) { onAdd(newItem.trim()); setNewItem(""); } }}
          placeholder="新增..." className="flex-1 text-sm px-3 py-1.5 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-400" />
        <button onClick={() => { if (newItem.trim()) { onAdd(newItem.trim()); setNewItem(""); } }}
          className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded hover:bg-blue-600">
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// --- Department Tree ---
interface DeptNode { id: string; name: string; children: DeptNode[] }

function DeptTreeItem({ node, depth, onAdd, onRemove }: {
  node: DeptNode; depth: number;
  onAdd: (parentId: string, name: string) => void; onRemove: (id: string) => void;
}) {
  const [open, setOpen] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const hasChildren = node.children.length > 0;

  return (
    <div>
      <div className="flex items-center gap-1 group py-1 hover:bg-gray-50 rounded" style={{ paddingLeft: `${depth * 20 + 8}px` }}>
        <button onClick={() => setOpen(!open)} className="w-5 h-5 flex items-center justify-center text-gray-400">
          {hasChildren ? (open ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />) : <span className="w-3.5 h-3.5 flex items-center justify-center text-gray-300">·</span>}
        </button>
        <span className="flex-1 text-sm text-gray-700">{node.name}</span>
        <button onClick={() => setAdding(true)} className="opacity-0 group-hover:opacity-100 p-0.5 text-gray-400 hover:text-blue-500" title="新增子部門"><Plus className="w-3 h-3" /></button>
        <button onClick={() => onRemove(node.id)} className="opacity-0 group-hover:opacity-100 p-0.5 text-gray-400 hover:text-red-500 mr-2" title="刪除"><X className="w-3 h-3" /></button>
      </div>
      {adding && (
        <div className="flex gap-1 py-1" style={{ paddingLeft: `${(depth + 1) * 20 + 8}px` }}>
          <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && newName.trim()) { onAdd(node.id, newName.trim()); setNewName(""); setAdding(false); } if (e.key === "Escape") setAdding(false); }}
            placeholder="子部門名稱..." autoFocus className="flex-1 text-sm px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-400" />
          <button onClick={() => { if (newName.trim()) { onAdd(node.id, newName.trim()); setNewName(""); setAdding(false); } }} className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600">確定</button>
          <button onClick={() => setAdding(false)} className="px-2 py-1 text-gray-500 text-xs rounded hover:bg-gray-100">取消</button>
        </div>
      )}
      {open && node.children.map((child) => <DeptTreeItem key={child.id} node={child} depth={depth + 1} onAdd={onAdd} onRemove={onRemove} />)}
    </div>
  );
}

// --- Personnel List ---
interface PersonnelItem { id: string; name: string; account: string; department: string; title: string; role: Role }

const TITLES = ["承辦", "主管", "部主管", "處主管", "總經理", "董事長", "董事會"];
const DEPARTMENTS = [
  "董事長室", "稽核室", "總經理室",
  "營運管理中心", "營運部", "教育訓練課", "區督導", "開發部", "工務課", "門市設計課",
  "行銷部", "廣告設計課", "公關客服課", "人資部", "文管課", "財會部", "會計", "採購課", "總務", "法務課",
  "生產中心", "麵包部", "西點部", "包裝部", "研發部", "品管部", "物流倉儲部",
];

function PersonnelList() {
  const [personnel, setPersonnel] = useState<PersonnelItem[]>([
    { id: "p1", name: "林小華", account: "lin.xh", department: "營運部", title: "承辦", role: "editor" },
    { id: "p2", name: "陳大明", account: "chen.dm", department: "營運部", title: "主管", role: "editor" },
    { id: "p3", name: "王小明", account: "wang.xm", department: "採購課", title: "部主管", role: "editor" },
    { id: "p4", name: "張美玲", account: "zhang.ml", department: "財會部", title: "處主管", role: "admin" },
    { id: "p5", name: "趙小剛", account: "zhao.xg", department: "採購課", title: "承辦", role: "commenter" },
    { id: "p6", name: "江廠長", account: "jiang.cz", department: "生產中心", title: "處主管", role: "admin" },
    { id: "p7", name: "陳副總", account: "chen.fz", department: "營運管理中心", title: "總經理", role: "admin" },
  ]);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<Omit<PersonnelItem, "id">>({ name: "", account: "", department: DEPARTMENTS[0], title: TITLES[0], role: "viewer" });
  const selectClass = "text-sm px-3 py-2 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white";

  const handleAdd = () => {
    if (!form.name.trim() || !form.account.trim()) return;
    setPersonnel([...personnel, { id: `p-${Date.now()}`, ...form }]);
    setForm({ name: "", account: "", department: DEPARTMENTS[0], title: TITLES[0], role: "viewer" });
    setAdding(false);
  };

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-gray-500">共 {personnel.length} 位人員</div>
        <button onClick={() => setAdding(!adding)} className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 text-white text-xs rounded hover:bg-blue-600">
          <Plus className="w-3.5 h-3.5" /> 新增人員
        </button>
      </div>

      {adding && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 grid grid-cols-5 gap-3">
          <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="姓名*" className={selectClass} />
          <input type="text" value={form.account} onChange={(e) => setForm({ ...form, account: e.target.value })} placeholder="帳號*" className={selectClass} />
          <select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className={selectClass}>
            {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <select value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={selectClass}>
            {TITLES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <div className="flex gap-2">
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as Role })} className={`flex-1 ${selectClass}`}>
              {(Object.keys(ROLE_LABELS) as Role[]).map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
            </select>
            <button onClick={handleAdd} className="px-3 py-2 bg-blue-500 text-white text-xs rounded hover:bg-blue-600">加入</button>
          </div>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50 text-gray-500">
              <th className="text-left py-2.5 px-4 font-medium">姓名</th>
              <th className="text-left py-2.5 px-4 font-medium">帳號</th>
              <th className="text-left py-2.5 px-4 font-medium">部門</th>
              <th className="text-left py-2.5 px-4 font-medium">職稱</th>
              <th className="text-left py-2.5 px-4 font-medium">權限</th>
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody>
            {personnel.map((p) => (
              <tr key={p.id} className="border-b border-gray-50 group hover:bg-gray-50">
                <td className="py-2.5 px-4 text-gray-800 font-medium">{p.name}</td>
                <td className="py-2.5 px-4 text-gray-500 font-mono text-xs">{p.account}</td>
                <td className="py-2.5 px-4 text-gray-600">{p.department}</td>
                <td className="py-2.5 px-4 text-gray-600">{p.title}</td>
                <td className="py-2.5 px-4">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    p.role === "admin" ? "bg-purple-100 text-purple-700" :
                    p.role === "editor" ? "bg-blue-100 text-blue-700" :
                    p.role === "commenter" ? "bg-amber-100 text-amber-700" :
                    "bg-gray-100 text-gray-600"
                  }`}>{ROLE_LABELS[p.role]}</span>
                </td>
                <td className="py-2.5 px-2">
                  <button onClick={() => setPersonnel(personnel.filter((x) => x.id !== p.id))} className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- Main ---

export default function AdminPage() {
  const [apiProvider, setApiProvider] = useState("claude");
  const [apiKey, setApiKey] = useState("");
  const [apiEndpoint, setApiEndpoint] = useState("");
  const [jsonImportEnabled, setJsonImportEnabled] = useState(true);
  const [manualFlowEnabled, setManualFlowEnabled] = useState(true);
  const [saved, setSaved] = useState(false);
  const loggingEnabled = useFSCStore((s) => s.loggingEnabled);
  const setLoggingEnabled = useFSCStore((s) => s.setLoggingEnabled);
  const logs = useFSCStore((s) => s.operationLogs);
  const clearLogs = useFSCStore((s) => s.clearLogs);
  const snapshots = useFSCStore((s) => s.snapshots);
  const restoreSnapshot = useFSCStore((s) => s.restoreSnapshot);
  const deleteSnapshot = useFSCStore((s) => s.deleteSnapshot);

  const [tab, setTab] = useState<"settings" | "basic" | "personnel" | "logs" | "versions">("settings");

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // --- Basic settings state (merged from settings page) ---
  const [titles, setTitles] = useState<ListItem[]>([
    { id: "1", name: "承辦" }, { id: "2", name: "主管" }, { id: "3", name: "部主管" },
    { id: "4", name: "處主管" }, { id: "5", name: "總經理" }, { id: "6", name: "董事長" }, { id: "7", name: "董事會" },
  ]);
  const [systems, setSystems] = useState<ListItem[]>([
    { id: "1", name: "採購模組" }, { id: "2", name: "庫存模組" }, { id: "3", name: "總帳模組" },
    { id: "4", name: "成本模組" }, { id: "5", name: "固資模組" }, { id: "6", name: "簽核系統" },
    { id: "7", name: "POS" }, { id: "8", name: "生管模組" }, { id: "9", name: "銷售模組" },
    { id: "10", name: "人資模組" }, { id: "11", name: "品管模組" }, { id: "12", name: "紙本" },
  ]);
  const [amountLevels, setAmountLevels] = useState<ListItem[]>([
    { id: "1", name: "5萬" }, { id: "2", name: "10萬" }, { id: "3", name: "50萬" },
    { id: "4", name: "100萬" }, { id: "5", name: "500萬" }, { id: "6", name: "1,000萬" },
  ]);

  let nextId = 100;
  const addItem = (setter: React.Dispatch<React.SetStateAction<ListItem[]>>, name: string) => {
    setter((prev) => [...prev, { id: String(nextId++), name }]);
  };
  const removeItem = (setter: React.Dispatch<React.SetStateAction<ListItem[]>>, id: string) => {
    setter((prev) => prev.filter((item) => item.id !== id));
  };

  // Department tree
  const [deptTree, setDeptTree] = useState<DeptNode[]>([
    { id: "d0", name: "董事長", children: [{ id: "d0-1", name: "稽核室", children: [] }] },
    { id: "d1", name: "總經理", children: [
      { id: "d2", name: "營運管理中心", children: [
        { id: "d3-1", name: "營運部", children: [{ id: "d3-1-1", name: "教育訓練課", children: [] }, { id: "d3-1-2", name: "區督導", children: [] }] },
        { id: "d3-2", name: "開發部", children: [{ id: "d3-2-1", name: "工務課", children: [] }, { id: "d3-2-2", name: "門市設計課", children: [] }] },
        { id: "d3-3", name: "行銷部", children: [{ id: "d3-3-1", name: "廣告設計課", children: [] }, { id: "d3-3-2", name: "公關客服課", children: [] }] },
        { id: "d3-4", name: "人資部", children: [{ id: "d3-4-1", name: "文管課", children: [] }] },
        { id: "d3-5", name: "財會部", children: [{ id: "d3-5-1", name: "會計", children: [] }, { id: "d3-5-2", name: "採購課", children: [] }, { id: "d3-5-3", name: "總務", children: [] }] },
        { id: "d3-6", name: "法務課", children: [] },
      ]},
      { id: "d3", name: "生產中心", children: [
        { id: "d2-1", name: "麵包部", children: [] }, { id: "d2-2", name: "西點部", children: [] },
        { id: "d2-3", name: "包裝部", children: [] }, { id: "d2-4", name: "研發部", children: [] },
        { id: "d2-5", name: "品管部", children: [] }, { id: "d2-6", name: "物流倉儲部", children: [] },
      ]},
    ]},
  ]);
  const [newRoot, setNewRoot] = useState("");

  const addDeptChild = (parentId: string, name: string) => {
    const id = `d-${Date.now()}`;
    const addToTree = (nodes: DeptNode[]): DeptNode[] =>
      nodes.map((n) => n.id === parentId ? { ...n, children: [...n.children, { id, name, children: [] }] } : { ...n, children: addToTree(n.children) });
    setDeptTree(addToTree(deptTree));
  };
  const removeDeptNode = (targetId: string) => {
    const removeFromTree = (nodes: DeptNode[]): DeptNode[] =>
      nodes.filter((n) => n.id !== targetId).map((n) => ({ ...n, children: removeFromTree(n.children) }));
    setDeptTree(removeFromTree(deptTree));
  };

  const tabs = [
    { key: "settings" as const, label: "系統設定" },
    { key: "basic" as const, label: "基本設定" },
    { key: "personnel" as const, label: "人員管理" },
    { key: "logs" as const, label: "操作紀錄", count: logs.length },
    { key: "versions" as const, label: "版本控制", count: snapshots.length },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-y-auto p-6">
        <h1 className="text-xl font-bold text-gray-800 mb-6">後台管理</h1>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-gray-200">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                tab === t.key ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {t.label}
              {"count" in t && t.count !== undefined && t.count > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 text-[10px]">{t.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* System Settings */}
        {tab === "settings" && (
          <div className="max-w-2xl space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 text-sm mb-4">功能開關</h3>
              <div className="space-y-3">
                <Toggle label="操作紀錄" desc="記錄所有節點編輯、匯入匯出等操作" checked={loggingEnabled} onChange={setLoggingEnabled} />
                <Toggle label="JSON 匯入" desc="允許匯入 JSON 檔案建立流程圖" checked={jsonImportEnabled} onChange={setJsonImportEnabled} />
                <Toggle label="手動建流程" desc="允許在畫布上手動拖拉建立節點" checked={manualFlowEnabled} onChange={setManualFlowEnabled} />
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 text-sm mb-4">API 管理</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-600 block mb-1">Provider</label>
                  <select value={apiProvider} onChange={(e) => setApiProvider(e.target.value)} className="w-full text-sm px-3 py-2 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-400">
                    <option value="claude">Claude (Anthropic)</option>
                    <option value="openai">OpenAI GPT</option>
                    <option value="ollama">Ollama (本地)</option>
                    <option value="gemini">Gemini (Google)</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-600 block mb-1">API Key</label>
                  <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="sk-..." className="w-full text-sm px-3 py-2 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-400" />
                </div>
                <div>
                  <label className="text-sm text-gray-600 block mb-1">Endpoint（選填）</label>
                  <input type="text" value={apiEndpoint} onChange={(e) => setApiEndpoint(e.target.value)} placeholder="https://api.anthropic.com/v1" className="w-full text-sm px-3 py-2 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-400" />
                  <p className="text-xs text-gray-400 mt-1">自架 Ollama 或 Proxy 時填寫</p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 text-sm mb-4">角色權限</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-gray-400">
                    <th className="text-left py-2 font-medium">角色</th>
                    <th className="text-center py-2 font-medium">檢視</th>
                    <th className="text-center py-2 font-medium">編輯</th>
                    <th className="text-center py-2 font-medium">意見</th>
                    <th className="text-center py-2 font-medium">管理</th>
                  </tr>
                </thead>
                <tbody>
                  {(Object.keys(ROLE_LABELS) as Role[]).map((role) => {
                    const perms = ROLE_PERMISSIONS[role];
                    const cell = (v: boolean) => (
                      <td className={`py-2 text-center ${v ? "text-green-600" : "text-red-400"}`}>{v ? "V" : "X"}</td>
                    );
                    return (
                      <tr key={role} className="border-b border-gray-50 last:border-b-0">
                        <td className="py-2 text-gray-700 font-medium">{ROLE_LABELS[role]}</td>
                        {cell(perms.canView)}{cell(perms.canEdit)}{cell(perms.canComment)}{cell(perms.canManage)}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end">
              <button onClick={handleSave} className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors shadow-sm">
                {saved ? <><Check className="w-4 h-4" /> 已儲存</> : <><Save className="w-4 h-4" /> 儲存設定</>}
              </button>
            </div>
          </div>
        )}

        {/* Basic Settings (merged from settings page) */}
        {tab === "basic" && (
          <div className="max-w-4xl space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {/* Department tree */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 text-sm mb-3">部門架構</h3>
                <div className="mb-3 max-h-[400px] overflow-y-auto">
                  {deptTree.map((node) => <DeptTreeItem key={node.id} node={node} depth={0} onAdd={addDeptChild} onRemove={removeDeptNode} />)}
                </div>
                <div className="flex gap-2">
                  <input type="text" value={newRoot} onChange={(e) => setNewRoot(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && newRoot.trim()) { setDeptTree([...deptTree, { id: `d-${Date.now()}`, name: newRoot.trim(), children: [] }]); setNewRoot(""); } }}
                    placeholder="新增頂層部門..." className="flex-1 text-sm px-3 py-1.5 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-400" />
                  <button onClick={() => { if (newRoot.trim()) { setDeptTree([...deptTree, { id: `d-${Date.now()}`, name: newRoot.trim(), children: [] }]); setNewRoot(""); } }}
                    className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"><Plus className="w-4 h-4" /></button>
                </div>
              </div>

              <EditableList title="職稱層級" items={titles} onAdd={(name) => addItem(setTitles, name)} onRemove={(id) => removeItem(setTitles, id)} />
              <EditableList title="操作系統清單" items={systems} onAdd={(name) => addItem(setSystems, name)} onRemove={(id) => removeItem(setSystems, id)} />
              <EditableList title="核決金額級距" items={amountLevels} onAdd={(name) => addItem(setAmountLevels, name)} onRemove={(id) => removeItem(setAmountLevels, id)} />
            </div>
          </div>
        )}

        {/* Personnel Management */}
        {tab === "personnel" && <PersonnelList />}

        {/* Operation Logs */}
        {tab === "logs" && (
          <div className="max-w-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <History className="w-4 h-4" /> 共 {logs.length} 筆紀錄
              </div>
              {logs.length > 0 && (
                <button onClick={() => { if (confirm("確定清除所有紀錄？")) clearLogs(); }} className="text-xs text-red-500 hover:text-red-600">清除全部</button>
              )}
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              {logs.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">尚無操作紀錄</p>
              ) : (
                <div className="divide-y-0">{logs.map((log) => <LogEntry key={log.id} log={log} />)}</div>
              )}
            </div>
          </div>
        )}

        {/* Version Control */}
        {tab === "versions" && (
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
              <Clock className="w-4 h-4" /> 共 {snapshots.length} 個版本
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              {snapshots.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">
                  尚無版本快照<br /><span className="text-xs">在流程圖編輯模式點「存版本」建立</span>
                </p>
              ) : (
                snapshots.map((snap) => (
                  <SnapshotRow key={snap.id} snap={snap}
                    onRestore={() => { if (confirm(`還原到「${snap.label}」？目前未存檔的修改會遺失。`)) restoreSnapshot(snap.id); }}
                    onDelete={() => { if (confirm("刪除此版本？")) deleteSnapshot(snap.id); }} />
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
