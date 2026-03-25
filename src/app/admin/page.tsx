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
        <div className="text-sm font-medium text-text">{label}</div>
        <div className="text-xs text-text-muted">{desc}</div>
      </div>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="w-4 h-4 rounded border-border" />
    </label>
  );
}

function LogEntry({ log }: { log: OperationLog }) {
  const t = new Date(log.timestamp);
  return (
    <div className="flex items-start gap-3 py-2 border-b border-border-light last:border-b-0">
      <div className="text-[10px] text-text-muted mt-0.5 w-16 flex-shrink-0">
        {t.toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit" })}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm text-text">{log.detail}</div>
        {log.changes && log.changes.length > 0 && (
          <div className="mt-1 space-y-0.5">
            {log.changes.map((c, i) => (
              <div key={i} className="text-xs text-text-muted">
                <span className="text-text-secondary">{c.field}</span>：
                <span className="text-red-400 line-through">{c.from.slice(0, 30)}</span>
                {" → "}
                <span className="text-green-600">{c.to.slice(0, 30)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-hover text-text-secondary flex-shrink-0">
        {log.action.split(".")[1]}
      </span>
    </div>
  );
}

function SnapshotRow({ snap, onRestore, onDelete }: { snap: FlowSnapshot; onRestore: () => void; onDelete: () => void }) {
  const t = new Date(snap.timestamp);
  return (
    <div className="flex items-center gap-3 py-2 border-b border-border-light last:border-b-0 group">
      <Clock className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-sm text-text truncate">{snap.label}</div>
        <div className="text-xs text-text-muted">
          {t.toLocaleDateString("zh-TW")} {t.toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit" })}
          {" · "}{snap.nodes.length} 節點
        </div>
      </div>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={onRestore} className="p-1 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded" title="還原此版本">
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
        <button onClick={onDelete} className="p-1 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded" title="刪除">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// --- Editable List ---
interface ListItem { id: string; name: string; code?: number }

function EditableList({ title, items, onAdd, onRemove, onUpdate, showCode }: {
  title: string; items: ListItem[];
  onAdd: (name: string) => void; onRemove: (id: string) => void;
  onUpdate: (id: string, field: "name" | "code", value: string | number) => void;
  showCode?: boolean;
}) {
  const [newItem, setNewItem] = useState("");
  return (
    <div className="bg-surface border border-border rounded-lg p-4">
      <h3 className="font-semibold text-text text-sm mb-3">{title}</h3>
      <div className="space-y-1 mb-3">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-2 px-1 py-0.5 bg-surface-hover rounded group">
            {showCode && (
              <input type="number" value={item.code ?? ""} onChange={(e) => onUpdate(item.id, "code", Number(e.target.value))}
                className="w-12 text-xs text-center px-1 py-1 rounded border border-transparent hover:border-border focus:border-primary focus:outline-none bg-transparent text-primary font-mono font-bold" />
            )}
            <input type="text" value={item.name} onChange={(e) => onUpdate(item.id, "name", e.target.value)}
              className="flex-1 text-sm px-2 py-1 rounded border border-transparent hover:border-border focus:border-primary focus:outline-none bg-transparent text-text" />
            <button onClick={() => onRemove(item.id)} className="opacity-0 group-hover:opacity-100 p-0.5 text-text-muted hover:text-red-500 dark:hover:text-red-400">
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input type="text" value={newItem} onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && newItem.trim()) { onAdd(newItem.trim()); setNewItem(""); } }}
          placeholder="新增..." className="flex-1 text-sm px-3 py-1.5 border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary" />
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

function DeptTreeItem({ node, depth, onAdd, onRemove, onRename }: {
  node: DeptNode; depth: number;
  onAdd: (parentId: string, name: string) => void; onRemove: (id: string) => void;
  onRename: (id: string, name: string) => void;
}) {
  const [open, setOpen] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const hasChildren = node.children.length > 0;
  const levelColors = ["bg-red-100 text-red-600", "bg-orange-100 text-orange-600", "bg-blue-100 text-blue-600", "bg-green-100 text-green-600", "bg-gray-100 text-text-secondary"];

  return (
    <div>
      <div className="flex items-center gap-1 group py-1 hover:bg-surface-hover rounded" style={{ paddingLeft: `${depth * 20 + 8}px` }}>
        <button onClick={() => setOpen(!open)} className="w-5 h-5 flex items-center justify-center text-text-muted">
          {hasChildren ? (open ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />) : <span className="w-3.5 h-3.5 flex items-center justify-center text-text-muted">·</span>}
        </button>
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${levelColors[Math.min(depth, levelColors.length - 1)]}`}>L{depth + 1}</span>
        <input type="text" value={node.name} onChange={(e) => onRename(node.id, e.target.value)}
          className="flex-1 text-sm px-2 py-0.5 rounded border border-transparent hover:border-border focus:border-primary focus:outline-none bg-transparent text-text" />
        <button onClick={() => setAdding(true)} className="opacity-0 group-hover:opacity-100 p-0.5 text-text-muted hover:text-blue-500" title="新增子部門"><Plus className="w-3 h-3" /></button>
        <button onClick={() => onRemove(node.id)} className="opacity-0 group-hover:opacity-100 p-0.5 text-text-muted hover:text-red-500 dark:hover:text-red-400 mr-2" title="刪除"><X className="w-3 h-3" /></button>
      </div>
      {adding && (
        <div className="flex gap-1 py-1" style={{ paddingLeft: `${(depth + 1) * 20 + 8}px` }}>
          <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && newName.trim()) { onAdd(node.id, newName.trim()); setNewName(""); setAdding(false); } if (e.key === "Escape") setAdding(false); }}
            placeholder="子部門名稱..." autoFocus className="flex-1 text-sm px-2 py-1 border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary" />
          <button onClick={() => { if (newName.trim()) { onAdd(node.id, newName.trim()); setNewName(""); setAdding(false); } }} className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600">確定</button>
          <button onClick={() => setAdding(false)} className="px-2 py-1 text-text-secondary text-xs rounded hover:bg-surface-hover">取消</button>
        </div>
      )}
      {open && node.children.map((child) => <DeptTreeItem key={child.id} node={child} depth={depth + 1} onAdd={onAdd} onRemove={onRemove} onRename={onRename} />)}
    </div>
  );
}

// --- Personnel List ---
interface PersonnelItem { id: string; name: string; account: string; password: string; department: string; title: string; role: Role }

const TITLES = ["承辦", "主管", "部主管", "處主管", "總經理", "董事長", "董事會"];
const DEPARTMENTS = [
  "董事長室", "稽核室", "總經理室",
  "營運管理中心", "營運部", "教育訓練課", "區督導", "開發部", "工務課", "門市設計課",
  "行銷部", "廣告設計課", "公關客服課", "人資部", "文管課", "財會部", "會計", "採購課", "總務", "法務課",
  "生產中心", "麵包部", "西點部", "包裝部", "研發部", "品管部", "物流倉儲部",
];

function PersonnelList() {
  const DEFAULT_PASSWORD = "89455989";
  const [personnel, setPersonnel] = useState<PersonnelItem[]>([
    { id: "p1", name: "林小華", account: "lin.xh", password: DEFAULT_PASSWORD, department: "營運部", title: "承辦", role: "editor" },
    { id: "p2", name: "陳大明", account: "chen.dm", password: DEFAULT_PASSWORD, department: "營運部", title: "主管", role: "editor" },
    { id: "p3", name: "王小明", account: "wang.xm", password: DEFAULT_PASSWORD, department: "採購課", title: "部主管", role: "editor" },
    { id: "p4", name: "張美玲", account: "zhang.ml", password: DEFAULT_PASSWORD, department: "財會部", title: "處主管", role: "admin" },
    { id: "p5", name: "趙小剛", account: "zhao.xg", password: DEFAULT_PASSWORD, department: "採購課", title: "承辦", role: "commenter" },
    { id: "p6", name: "江廠長", account: "jiang.cz", password: DEFAULT_PASSWORD, department: "生產中心", title: "處主管", role: "admin" },
    { id: "p7", name: "陳副總", account: "chen.fz", password: DEFAULT_PASSWORD, department: "營運管理中心", title: "總經理", role: "admin" },
  ]);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<Omit<PersonnelItem, "id">>({ name: "", account: "", password: DEFAULT_PASSWORD, department: DEPARTMENTS[0], title: TITLES[0], role: "commenter" });
  const cellInput = "w-full text-sm px-2 py-1 border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary bg-surface";
  const cellSelect = `${cellInput} appearance-auto`;

  const updatePerson = (id: string, field: keyof PersonnelItem, value: string) => {
    setPersonnel(personnel.map((p) => p.id === id ? { ...p, [field]: value } : p));
  };

  const handleAdd = () => {
    if (!form.name.trim()) return;
    setPersonnel([...personnel, { id: `p-${Date.now()}`, ...form }]);
    setForm({ name: "", account: "", password: DEFAULT_PASSWORD, department: DEPARTMENTS[0], title: TITLES[0], role: "commenter" });
    setAdding(false);
  };

  const roleBadge = (role: Role) => {
    const colors = role === "admin" ? "bg-purple-100 text-purple-700" : role === "editor" ? "bg-blue-100 text-blue-700" : role === "commenter" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-text-secondary";
    return <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors}`}>{ROLE_LABELS[role]}</span>;
  };

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-text-secondary">共 {personnel.length} 位人員</div>
        <button onClick={() => setAdding(!adding)} className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 text-white text-xs rounded hover:bg-blue-600">
          <Plus className="w-3.5 h-3.5" /> 新增人員
        </button>
      </div>

      {adding && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 grid grid-cols-3 gap-3">
          <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="姓名 *" className={cellInput} />
          <input type="text" value={form.account} onChange={(e) => setForm({ ...form, account: e.target.value })} placeholder="帳號（選填）" className={cellInput} />
          <input type="text" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="密碼" className={cellInput} />
          <select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className={cellSelect}>
            {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <select value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={cellSelect}>
            {TITLES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <div className="flex gap-2">
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as Role })} className={`flex-1 ${cellSelect}`}>
              {(Object.keys(ROLE_LABELS) as Role[]).map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
            </select>
            <button onClick={handleAdd} className="px-3 py-2 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 whitespace-nowrap">加入</button>
          </div>
        </div>
      )}

      <div className="bg-surface border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-surface-hover text-text-secondary">
              <th className="text-left py-2.5 px-3 font-medium">姓名</th>
              <th className="text-left py-2.5 px-3 font-medium">帳號</th>
              <th className="text-left py-2.5 px-3 font-medium w-20">密碼</th>
              <th className="text-left py-2.5 px-3 font-medium">部門</th>
              <th className="text-left py-2.5 px-3 font-medium">職稱</th>
              <th className="text-left py-2.5 px-3 font-medium">權限</th>
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody>
            {personnel.map((p) => (
              <tr key={p.id} className="border-b border-border-light group">
                <td className="py-1.5 px-3">
                  <input type="text" value={p.name} onChange={(e) => updatePerson(p.id, "name", e.target.value)}
                    className="w-full text-sm px-2 py-1 rounded border border-transparent hover:border-border focus:border-primary focus:outline-none bg-transparent font-medium text-text" />
                </td>
                <td className="py-1.5 px-3">
                  <input type="text" value={p.account} onChange={(e) => updatePerson(p.id, "account", e.target.value)}
                    placeholder="-" className="w-full text-sm px-2 py-1 rounded border border-transparent hover:border-border focus:border-primary focus:outline-none bg-transparent text-text-secondary font-mono text-xs" />
                </td>
                <td className="py-1.5 px-3">
                  <div className="flex items-center gap-1">
                    <span className="text-text-muted text-xs">{"••••"}</span>
                    <button onClick={() => { if (confirm(`重設「${p.name}」的密碼為預設值？`)) updatePerson(p.id, "password", DEFAULT_PASSWORD); }}
                      className="opacity-0 group-hover:opacity-100 text-[10px] text-blue-500 hover:underline">重設</button>
                  </div>
                </td>
                <td className="py-1.5 px-3">
                  <select value={p.department} onChange={(e) => updatePerson(p.id, "department", e.target.value)}
                    className="w-full text-sm px-1 py-1 rounded border border-transparent hover:border-border focus:border-primary focus:outline-none bg-transparent text-text-secondary cursor-pointer">
                    {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </td>
                <td className="py-1.5 px-3">
                  <select value={p.title} onChange={(e) => updatePerson(p.id, "title", e.target.value)}
                    className="w-full text-sm px-1 py-1 rounded border border-transparent hover:border-border focus:border-primary focus:outline-none bg-transparent text-text-secondary cursor-pointer">
                    {TITLES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </td>
                <td className="py-1.5 px-3">
                  <select value={p.role} onChange={(e) => updatePerson(p.id, "role", e.target.value)}
                    className="w-full text-sm px-1 py-1 rounded border border-transparent hover:border-border focus:border-primary focus:outline-none bg-transparent cursor-pointer">
                    {(Object.keys(ROLE_LABELS) as Role[]).map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                  </select>
                </td>
                <td className="py-1.5 px-2">
                  <button onClick={() => { if (confirm(`確定刪除「${p.name}」？`)) setPersonnel(personnel.filter((x) => x.id !== p.id)); }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-text-muted hover:text-red-500 dark:hover:text-red-400">
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
    { id: "1", name: "承辦", code: 10 }, { id: "2", name: "主管", code: 20 }, { id: "3", name: "部主管", code: 30 },
    { id: "4", name: "處主管", code: 40 }, { id: "5", name: "總經理", code: 50 }, { id: "6", name: "董事長", code: 60 }, { id: "7", name: "董事會", code: 70 },
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
  const updateItem = (setter: React.Dispatch<React.SetStateAction<ListItem[]>>, id: string, field: "name" | "code", value: string | number) => {
    setter((prev) => prev.map((item) => item.id === id ? { ...item, [field]: value } : item));
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
  const renameDeptNode = (targetId: string, newName: string) => {
    const renameInTree = (nodes: DeptNode[]): DeptNode[] =>
      nodes.map((n) => n.id === targetId ? { ...n, name: newName } : { ...n, children: renameInTree(n.children) });
    setDeptTree(renameInTree(deptTree));
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
      <div className="flex-1 overflow-y-auto p-6 bg-background">
        <h1 className="text-xl font-bold text-text mb-6">後台管理</h1>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-border">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                tab === t.key ? "border-blue-500 text-primary" : "border-transparent text-text-secondary hover:text-text"
              }`}
            >
              {t.label}
              {"count" in t && t.count !== undefined && t.count > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-surface-hover text-text-secondary text-[10px]">{t.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* System Settings */}
        {tab === "settings" && (
          <div className="max-w-2xl space-y-6">
            <div className="bg-surface border border-border rounded-lg p-4">
              <h3 className="font-semibold text-text text-sm mb-4">功能開關</h3>
              <div className="space-y-3">
                <Toggle label="操作紀錄" desc="記錄所有節點編輯、匯入匯出等操作" checked={loggingEnabled} onChange={setLoggingEnabled} />
                <Toggle label="JSON 匯入" desc="允許匯入 JSON 檔案建立流程圖" checked={jsonImportEnabled} onChange={setJsonImportEnabled} />
                <Toggle label="手動建流程" desc="允許在畫布上手動拖拉建立節點" checked={manualFlowEnabled} onChange={setManualFlowEnabled} />
              </div>
            </div>

            <div className="bg-surface border border-border rounded-lg p-4">
              <h3 className="font-semibold text-text text-sm mb-4">API 管理</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-text-secondary block mb-1">Provider</label>
                  <select value={apiProvider} onChange={(e) => setApiProvider(e.target.value)} className="w-full text-sm px-3 py-2 border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary">
                    <option value="claude">Claude (Anthropic)</option>
                    <option value="openai">OpenAI GPT</option>
                    <option value="ollama">Ollama (本地)</option>
                    <option value="gemini">Gemini (Google)</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-text-secondary block mb-1">API Key</label>
                  <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="sk-..." className="w-full text-sm px-3 py-2 border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
                <div>
                  <label className="text-sm text-text-secondary block mb-1">Endpoint（選填）</label>
                  <input type="text" value={apiEndpoint} onChange={(e) => setApiEndpoint(e.target.value)} placeholder="https://api.anthropic.com/v1" className="w-full text-sm px-3 py-2 border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary" />
                  <p className="text-xs text-text-muted mt-1">自架 Ollama 或 Proxy 時填寫</p>
                </div>
              </div>
            </div>

            <div className="bg-surface border border-border rounded-lg p-4">
              <h3 className="font-semibold text-text text-sm mb-4">角色權限</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-text-muted">
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
                      <tr key={role} className="border-b border-border-light last:border-b-0">
                        <td className="py-2 text-text font-medium">{ROLE_LABELS[role]}</td>
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
              <div className="bg-surface border border-border rounded-lg p-4">
                <h3 className="font-semibold text-text text-sm mb-3">部門架構</h3>
                <div className="mb-3 max-h-[400px] overflow-y-auto">
                  {deptTree.map((node) => <DeptTreeItem key={node.id} node={node} depth={0} onAdd={addDeptChild} onRemove={removeDeptNode} onRename={renameDeptNode} />)}
                </div>
                <div className="flex gap-2">
                  <input type="text" value={newRoot} onChange={(e) => setNewRoot(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && newRoot.trim()) { setDeptTree([...deptTree, { id: `d-${Date.now()}`, name: newRoot.trim(), children: [] }]); setNewRoot(""); } }}
                    placeholder="新增頂層部門..." className="flex-1 text-sm px-3 py-1.5 border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary" />
                  <button onClick={() => { if (newRoot.trim()) { setDeptTree([...deptTree, { id: `d-${Date.now()}`, name: newRoot.trim(), children: [] }]); setNewRoot(""); } }}
                    className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"><Plus className="w-4 h-4" /></button>
                </div>
              </div>

              <EditableList title="職稱層級" items={titles} showCode onAdd={(name) => addItem(setTitles, name)} onRemove={(id) => removeItem(setTitles, id)} onUpdate={(id, field, value) => updateItem(setTitles, id, field, value)} />
              <EditableList title="操作系統清單" items={systems} onAdd={(name) => addItem(setSystems, name)} onRemove={(id) => removeItem(setSystems, id)} onUpdate={(id, field, value) => updateItem(setSystems, id, field, value)} />
              <EditableList title="核決金額級距" items={amountLevels} onAdd={(name) => addItem(setAmountLevels, name)} onRemove={(id) => removeItem(setAmountLevels, id)} onUpdate={(id, field, value) => updateItem(setAmountLevels, id, field, value)} />
            </div>
          </div>
        )}

        {/* Personnel Management */}
        {tab === "personnel" && <PersonnelList />}

        {/* Operation Logs */}
        {tab === "logs" && (
          <div className="max-w-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <History className="w-4 h-4" /> 共 {logs.length} 筆紀錄
              </div>
              {logs.length > 0 && (
                <button onClick={() => { if (confirm("確定清除所有紀錄？")) clearLogs(); }} className="text-xs text-red-500 hover:text-red-600">清除全部</button>
              )}
            </div>
            <div className="bg-surface border border-border rounded-lg p-4">
              {logs.length === 0 ? (
                <p className="text-sm text-text-muted text-center py-8">尚無操作紀錄</p>
              ) : (
                <div className="divide-y-0">{logs.map((log) => <LogEntry key={log.id} log={log} />)}</div>
              )}
            </div>
          </div>
        )}

        {/* Version Control */}
        {tab === "versions" && (
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-4 text-sm text-text-secondary">
              <Clock className="w-4 h-4" /> 共 {snapshots.length} 個版本
            </div>
            <div className="bg-surface border border-border rounded-lg p-4">
              {snapshots.length === 0 ? (
                <p className="text-sm text-text-muted text-center py-8">
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
