"use client";

import { useFSCStore } from "@/store/fsc-store";
import type { ProcessNodeData, ApprovalAuthority, DetailPreferences, SignMethod, NodeType } from "@/types/fsc";
import { X, Settings2, ChevronDown, ChevronRight, ArrowUp, ArrowDown, Pencil, Eye, Save, Undo2, Trash2, Plus } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import CommentSection from "./CommentSection";

// --- Helpers ---

function formatAmount(amount?: number) {
  if (!amount) return "";
  if (amount >= 10000) return `${(amount / 10000).toFixed(0)}萬`;
  return `${amount.toLocaleString()}`;
}

function approvalActionLabel(action: string) {
  switch (action) {
    case "initiate": return "立";
    case "review": return "審";
    case "approve": return "決";
    default: return action;
  }
}

const signMethodLabels: Record<string, string> = {
  system_sign: "系統簽",
  paper_sign: "紙本簽",
  both: "系統+紙本",
};

const SYSTEMS = [
  "採購模組", "庫存模組", "總帳模組", "成本模組", "固資模組",
  "簽核系統", "POS", "生管模組", "銷售模組", "人資模組", "品管模組", "紙本", "其他",
];

const NODE_TYPES: { value: NodeType; label: string }[] = [
  { value: "start", label: "起始" },
  { value: "task", label: "作業" },
  { value: "decision", label: "決策" },
  { value: "connector", label: "連接" },
  { value: "end", label: "結束" },
];

const SIGN_METHODS: { value: SignMethod; label: string }[] = [
  { value: "system_sign", label: "系統簽" },
  { value: "paper_sign", label: "紙本簽" },
  { value: "both", label: "系統+紙本" },
];

// --- Components ---

function Section({ title, defaultOpen = true, children }: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 w-full py-2.5 text-sm font-semibold text-gray-700 hover:text-gray-900"
      >
        {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        {title}
      </button>
      {open && <div className="pb-3">{children}</div>}
    </div>
  );
}

function ApprovalTable({ authorities }: { authorities: ApprovalAuthority[] }) {
  if (!authorities.length) return <p className="text-gray-400 text-sm">無核決權限</p>;
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-gray-400 border-b">
          <th className="text-left py-1.5 font-medium">金額</th>
          <th className="text-left py-1.5 font-medium">職級</th>
          <th className="text-left py-1.5 font-medium">人員</th>
          <th className="text-center py-1.5 font-medium">動作</th>
        </tr>
      </thead>
      <tbody>
        {authorities.map((a) => (
          <tr key={a.id} className="border-b border-gray-50">
            <td className="py-2 text-gray-600">
              {a.isNA ? "N/A" : a.amountMin && a.amountMax ? `${formatAmount(a.amountMin)}~${formatAmount(a.amountMax)}` : a.amountMax ? `<= ${formatAmount(a.amountMax)}` : a.amountMin ? `> ${formatAmount(a.amountMin)}` : "-"}
            </td>
            <td className="py-2 text-gray-700 font-medium">{a.level}</td>
            <td className="py-2 text-gray-600">{a.levelPerson}</td>
            <td className="py-2 text-center">
              <span className={cn("inline-block px-2 py-0.5 rounded text-xs font-bold",
                a.action === "approve" && "bg-red-100 text-red-700",
                a.action === "review" && "bg-yellow-100 text-yellow-700",
                a.action === "initiate" && "bg-blue-100 text-blue-700"
              )}>{approvalActionLabel(a.action)}</span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// --- Editable String List ---
function EditableStringList({ items, onChange, placeholder }: { items: string[]; onChange: (items: string[]) => void; placeholder: string }) {
  const [newItem, setNewItem] = useState("");
  return (
    <div className="space-y-1">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-1 group">
          <span className="flex-1 text-sm text-gray-700 bg-gray-50 px-2 py-1 rounded">{item}</span>
          <button onClick={() => onChange(items.filter((_, idx) => idx !== i))} className="opacity-0 group-hover:opacity-100 p-0.5 text-gray-400 hover:text-red-500">
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}
      <div className="flex gap-1">
        <input type="text" value={newItem} onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && newItem.trim()) { onChange([...items, newItem.trim()]); setNewItem(""); } }}
          placeholder={placeholder} className="flex-1 text-sm px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-400" />
        <button onClick={() => { if (newItem.trim()) { onChange([...items, newItem.trim()]); setNewItem(""); } }} className="p-1 text-blue-500 hover:text-blue-600">
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// --- Diff Preview Modal ---
function DiffPreview({ original, draft, onConfirm, onCancel }: {
  original: ProcessNodeData;
  draft: Partial<ProcessNodeData>;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const changes: { field: string; label: string; from: string; to: string }[] = [];
  const fieldLabels: Record<string, string> = {
    label: "節點名稱", nodeType: "節點類型", operatingSystem: "操作系統",
    signMethod: "簽核方式", status: "現況", keyPoints: "作業重點",
    controlPoints: "內控重點", risks: "風險", relatedForms: "相關文件",
    approvalAuthorities: "核決權限", personnel: "簽核人/經手人", reports: "對應報表",
  };

  for (const key of Object.keys(draft) as (keyof ProcessNodeData)[]) {
    const oldVal = JSON.stringify(original[key]);
    const newVal = JSON.stringify(draft[key]);
    if (oldVal !== newVal) {
      const display = (val: unknown) => {
        if (Array.isArray(val)) return val.length === 0 ? "（空）" : typeof val[0] === "string" ? val.join("、") : `${val.length} 筆`;
        if (typeof val === "object" && val !== null) return JSON.stringify(val);
        return String(val ?? "（無）");
      };
      const k = String(key);
      changes.push({
        field: k,
        label: fieldLabels[k] || k,
        from: display(original[key]),
        to: display(draft[key]),
      });
    }
  }

  if (changes.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
        <div className="bg-white rounded-xl shadow-xl p-6 max-w-md">
          <p className="text-gray-600 text-sm mb-4">沒有修改內容</p>
          <button onClick={onCancel} className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200">關閉</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-xl shadow-xl w-[480px] max-h-[80vh] overflow-y-auto">
        <div className="p-4 border-b">
          <h3 className="font-bold text-lg text-gray-800">確認修改</h3>
          <p className="text-sm text-gray-500 mt-1">以下欄位將被更新：</p>
        </div>
        <div className="p-4 space-y-3">
          {changes.map((c) => (
            <div key={c.field} className="text-sm">
              <div className="font-medium text-gray-700 mb-1">{c.label}</div>
              <div className="grid grid-cols-2 gap-2">
                <div className="px-2 py-1.5 bg-red-50 rounded border border-red-100">
                  <span className="text-[10px] text-red-400 block mb-0.5">修改前</span>
                  <span className="text-red-700 text-xs break-all">{c.from}</span>
                </div>
                <div className="px-2 py-1.5 bg-green-50 rounded border border-green-100">
                  <span className="text-[10px] text-green-400 block mb-0.5">修改後</span>
                  <span className="text-green-700 text-xs break-all">{c.to}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-2 p-4 border-t">
          <button onClick={onCancel} className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200">取消</button>
          <button onClick={onConfirm} className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600">確認儲存</button>
        </div>
      </div>
    </div>
  );
}

// --- Preferences Toggle ---
type SectionKey = keyof DetailPreferences;

const ALL_SECTIONS: { key: SectionKey; label: string }[] = [
  { key: "operatingSystem", label: "操作系統" },
  { key: "signMethod", label: "簽核方式" },
  { key: "approvalAuthority", label: "核決權限" },
  { key: "keyPoints", label: "作業重點" },
  { key: "currentStatus", label: "現況" },
  { key: "risks", label: "風險" },
  { key: "personnel", label: "簽核人/經手人" },
  { key: "reports", label: "對應報表" },
  { key: "relatedForms", label: "相關文件" },
];

function PreferencesToggle({ sectionOrder, onReorder }: { sectionOrder: SectionKey[]; onReorder: (order: SectionKey[]) => void }) {
  const [open, setOpen] = useState(false);
  const prefs = useFSCStore((s) => s.detailPreferences);
  const setPrefs = useFSCStore((s) => s.setDetailPreferences);
  const orderedItems = sectionOrder.map((key) => ALL_SECTIONS.find((s) => s.key === key)!).filter(Boolean);

  const moveUp = (i: number) => { if (i === 0) return; const o = [...sectionOrder]; [o[i - 1], o[i]] = [o[i], o[i - 1]]; onReorder(o); };
  const moveDown = (i: number) => { if (i === sectionOrder.length - 1) return; const o = [...sectionOrder]; [o[i], o[i + 1]] = [o[i + 1], o[i]]; onReorder(o); };

  return (
    <div className="mb-3">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600">
        <Settings2 className="w-4 h-4" /> 顯示項目設定
      </button>
      {open && (
        <div className="mt-2 p-3 bg-gray-50 rounded-lg space-y-1">
          {orderedItems.map((item, index) => (
            <div key={item.key} className="flex items-center gap-2 py-1">
              <div className="flex gap-0.5">
                <button onClick={() => moveUp(index)} className="p-0.5 text-gray-300 hover:text-gray-600" disabled={index === 0}><ArrowUp className="w-3 h-3" /></button>
                <button onClick={() => moveDown(index)} className="p-0.5 text-gray-300 hover:text-gray-600" disabled={index === orderedItems.length - 1}><ArrowDown className="w-3 h-3" /></button>
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer flex-1">
                <input type="checkbox" checked={prefs[item.key]} onChange={(e) => setPrefs({ [item.key]: e.target.checked })} className="rounded border-gray-300 w-3.5 h-3.5" />
                {item.label}
              </label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// --- Main ---
const DEFAULT_ORDER: SectionKey[] = [
  "operatingSystem", "signMethod", "approvalAuthority", "keyPoints",
  "currentStatus", "risks", "personnel", "reports", "relatedForms",
];

export default function DetailPanel() {
  const selectedNodeId = useFSCStore((s) => s.selectedNodeId);
  const nodes = useFSCStore((s) => s.nodes);
  const detailPanelOpen = useFSCStore((s) => s.detailPanelOpen);
  const setDetailPanelOpen = useFSCStore((s) => s.setDetailPanelOpen);
  const setSelectedNodeId = useFSCStore((s) => s.setSelectedNodeId);
  const prefs = useFSCStore((s) => s.detailPreferences);
  const editMode = useFSCStore((s) => s.editMode);
  const setEditMode = useFSCStore((s) => s.setEditMode);
  const editDraft = useFSCStore((s) => s.editDraft);
  const setEditDraft = useFSCStore((s) => s.setEditDraft);
  const saveEditDraft = useFSCStore((s) => s.saveEditDraft);
  const discardEditDraft = useFSCStore((s) => s.discardEditDraft);
  const deleteNode = useFSCStore((s) => s.deleteNode);
  const canEdit = useFSCStore((s) => s.canEdit);

  const [sectionOrder, setSectionOrder] = useState<SectionKey[]>(DEFAULT_ORDER);
  const [showDiff, setShowDiff] = useState(false);

  if (!detailPanelOpen || !selectedNodeId) return null;

  const node = nodes.find((n) => n.id === selectedNodeId);
  if (!node) return null;

  const d = node.data as unknown as ProcessNodeData;
  // Merged view: show draft values when editing
  const v = editDraft ? { ...d, ...editDraft } : d;

  const updateDraft = (partial: Partial<ProcessNodeData>) => {
    setEditDraft({ ...(editDraft || {}), ...partial });
  };

  const inputClass = "w-full text-sm px-2 py-1.5 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-400";
  const selectClass = inputClass;

  // Highlight changed fields
  const isChanged = (field: keyof ProcessNodeData) => {
    if (!editDraft || !(field in editDraft)) return false;
    return JSON.stringify(d[field]) !== JSON.stringify(editDraft[field]);
  };

  const renderSection = (key: SectionKey) => {
    switch (key) {
      case "operatingSystem":
        if (!prefs.operatingSystem) return null;
        if (!editMode && !d.operatingSystem) return null;
        return (
          <Section key={key} title="操作系統">
            {editMode ? (
              <div className={isChanged("operatingSystem") ? "ring-2 ring-orange-300 rounded" : ""}>
                <select value={v.operatingSystem || ""} onChange={(e) => updateDraft({ operatingSystem: e.target.value || undefined })} className={selectClass}>
                  <option value="">（無）</option>
                  {SYSTEMS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            ) : (
              <span className="inline-flex items-center px-2.5 py-1 rounded bg-blue-50 text-blue-700 text-sm font-medium">{d.operatingSystem}</span>
            )}
          </Section>
        );

      case "signMethod":
        if (!prefs.signMethod) return null;
        if (!editMode && !d.signMethod) return null;
        return (
          <Section key={key} title="簽核方式">
            {editMode ? (
              <div className={isChanged("signMethod") ? "ring-2 ring-orange-300 rounded" : ""}>
                <select value={v.signMethod || ""} onChange={(e) => updateDraft({ signMethod: (e.target.value || undefined) as SignMethod | undefined })} className={selectClass}>
                  <option value="">（無）</option>
                  {SIGN_METHODS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
            ) : (
              <span className="text-sm text-gray-700">{signMethodLabels[d.signMethod!] || d.signMethod}</span>
            )}
          </Section>
        );

      case "currentStatus":
        if (!prefs.currentStatus) return null;
        return (
          <Section key={key} title="現況">
            {editMode ? (
              <div className={cn("flex flex-wrap gap-3", isChanged("status") && "ring-2 ring-orange-300 rounded p-1")}>
                {(["vacant", "unsigned", "paperSign"] as const).map((k) => (
                  <label key={k} className="flex items-center gap-1.5 text-sm text-gray-700 cursor-pointer">
                    <input type="checkbox" checked={(v.status as unknown as Record<string, boolean>)[k]} onChange={(e) => updateDraft({ status: { ...v.status, [k]: e.target.checked } })} className="rounded border-gray-300 w-3.5 h-3.5" />
                    {k === "vacant" ? "缺人" : k === "unsigned" ? "未簽" : "紙本簽"}
                  </label>
                ))}
                <input type="text" value={v.status.other} onChange={(e) => updateDraft({ status: { ...v.status, other: e.target.value } })} placeholder="其他" className="text-sm px-2 py-1 border border-gray-200 rounded w-20 focus:outline-none focus:ring-1 focus:ring-blue-400" />
              </div>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {d.status.vacant && <span className="px-2.5 py-1 rounded bg-red-50 text-red-600 text-sm">缺人</span>}
                {d.status.unsigned && <span className="px-2.5 py-1 rounded bg-yellow-50 text-yellow-600 text-sm">未簽</span>}
                {d.status.paperSign && <span className="px-2.5 py-1 rounded bg-gray-100 text-gray-600 text-sm">紙本簽</span>}
                {d.status.other && <span className="px-2.5 py-1 rounded bg-gray-100 text-gray-600 text-sm">{d.status.other}</span>}
                {!d.status.vacant && !d.status.unsigned && !d.status.paperSign && !d.status.other && <span className="text-sm text-gray-400">正常</span>}
              </div>
            )}
          </Section>
        );

      case "approvalAuthority":
        if (!prefs.approvalAuthority) return null;
        return (
          <Section key={key} title="核決權限">
            <ApprovalTable authorities={v.approvalAuthorities} />
          </Section>
        );

      case "keyPoints":
        if (!prefs.keyPoints) return null;
        if (!editMode && d.keyPoints.length === 0) return null;
        return (
          <Section key={key} title="作業重點">
            {editMode ? (
              <div className={isChanged("keyPoints") ? "ring-2 ring-orange-300 rounded p-1" : ""}>
                <EditableStringList items={v.keyPoints} onChange={(items) => updateDraft({ keyPoints: items })} placeholder="新增作業重點..." />
              </div>
            ) : (
              <ul className="space-y-1.5">
                {d.keyPoints.map((p, i) => <li key={i} className="text-sm text-gray-600 flex gap-2"><span className="text-blue-400 mt-0.5">-</span> {p}</li>)}
              </ul>
            )}
          </Section>
        );

      case "risks":
        if (!prefs.risks) return null;
        if (!editMode && d.risks.length === 0) return null;
        return (
          <Section key={key} title="風險">
            {editMode ? (
              <div className={isChanged("risks") ? "ring-2 ring-orange-300 rounded p-1" : ""}>
                <EditableStringList items={v.risks} onChange={(items) => updateDraft({ risks: items })} placeholder="新增風險..." />
              </div>
            ) : (
              <ul className="space-y-1.5">
                {d.risks.map((r, i) => <li key={i} className="text-sm text-red-600 flex gap-2"><span className="mt-0.5">!</span> {r}</li>)}
              </ul>
            )}
          </Section>
        );

      case "personnel":
        if (!prefs.personnel || d.personnel.length === 0) return null;
        return (
          <Section key={key} title="簽核人/經手人">
            <div className="space-y-2.5">
              {v.personnel.map((p) => (
                <div key={p.id} className="text-sm">
                  <div className="font-medium text-gray-700">{p.role}（{p.department}）</div>
                  <div className="text-gray-500 mt-0.5">現任：{p.currentHolder}{p.deputy && ` / 代理：${p.deputy}`}</div>
                </div>
              ))}
            </div>
          </Section>
        );

      case "reports":
        if (!prefs.reports || d.reports.length === 0) return null;
        return (
          <Section key={key} title="對應報表">
            <div className="space-y-2.5">
              {v.reports.map((r) => (
                <div key={r.id} className="text-sm">
                  <div className="font-medium text-gray-700">{r.reportName}</div>
                  <div className="text-gray-500 mt-0.5">{r.frequency === "monthly" ? "月報" : r.frequency} / {r.deadline || "-"} / {r.recipient || "-"}</div>
                </div>
              ))}
            </div>
          </Section>
        );

      case "relatedForms":
        if (!prefs.relatedForms) return null;
        if (!editMode && d.relatedForms.length === 0) return null;
        return (
          <Section key={key} title="相關文件">
            {editMode ? (
              <div className={isChanged("relatedForms") ? "ring-2 ring-orange-300 rounded p-1" : ""}>
                <EditableStringList items={v.relatedForms} onChange={(items) => updateDraft({ relatedForms: items })} placeholder="新增相關文件..." />
              </div>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {d.relatedForms.map((f, i) => <span key={i} className="px-2.5 py-1 rounded bg-gray-50 text-gray-600 text-sm">{f}</span>)}
              </div>
            )}
          </Section>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <div className="w-96 border-l border-gray-200 bg-white overflow-y-auto flex-shrink-0">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex-1 min-w-0">
            {editMode ? (
              <input
                type="text"
                value={v.label}
                onChange={(e) => updateDraft({ label: e.target.value })}
                className={cn("font-bold text-lg text-gray-800 w-full px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-400", isChanged("label") && "ring-2 ring-orange-300")}
              />
            ) : (
              <h3 className="font-bold text-lg text-gray-800 truncate">{d.label}</h3>
            )}
          </div>
          <div className="flex items-center gap-1 ml-2">
            {canEdit() && (
              <button
                onClick={() => setEditMode(!editMode)}
                className={cn("p-1.5 rounded", editMode ? "bg-blue-50 text-blue-600" : "hover:bg-gray-100 text-gray-400")}
                title={editMode ? "檢視模式" : "編輯模式"}
              >
                {editMode ? <Eye className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
              </button>
            )}
            <button onClick={() => { setDetailPanelOpen(false); setSelectedNodeId(null); }} className="p-1 rounded hover:bg-gray-100">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Edit mode toolbar */}
        {editMode && (
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border-b border-blue-100">
            <span className="text-xs text-blue-600 font-medium flex-1">編輯模式</span>
            {editMode && (
              <div className="flex items-center gap-1">
                {editDraft && (
                  <>
                    <button onClick={() => setShowDiff(true)} className="flex items-center gap-1 px-2.5 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600">
                      <Save className="w-3 h-3" /> 儲存
                    </button>
                    <button onClick={discardEditDraft} className="flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded hover:bg-gray-200">
                      <Undo2 className="w-3 h-3" /> 放棄
                    </button>
                  </>
                )}
                <button
                  onClick={() => { if (confirm("確定刪除此節點？")) { deleteNode(selectedNodeId); } }}
                  className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"
                  title="刪除節點"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Node type (edit mode only) */}
        {editMode && (
          <div className="px-4 pt-3 pb-1">
            <div className={cn("", isChanged("nodeType") && "ring-2 ring-orange-300 rounded")}>
              <label className="text-xs font-medium text-gray-500 mb-1 block">節點類型</label>
              <select value={v.nodeType} onChange={(e) => updateDraft({ nodeType: e.target.value as NodeType })} className={selectClass}>
                {NODE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-4 space-y-0">
          {!editMode && <PreferencesToggle sectionOrder={sectionOrder} onReorder={setSectionOrder} />}
          {sectionOrder.map((key) => renderSection(key))}

          {/* Control Points */}
          {(editMode || d.controlPoints.length > 0) && (
            <Section title="內控重點">
              {editMode ? (
                <div className={isChanged("controlPoints") ? "ring-2 ring-orange-300 rounded p-1" : ""}>
                  <EditableStringList items={v.controlPoints} onChange={(items) => updateDraft({ controlPoints: items })} placeholder="新增內控重點..." />
                </div>
              ) : (
                <ul className="space-y-1.5">
                  {d.controlPoints.map((c, i) => <li key={i} className="text-sm text-gray-600 flex gap-2"><span className="text-purple-400 mt-0.5">-</span> {c}</li>)}
                </ul>
              )}
            </Section>
          )}
        </div>

        {/* Comments */}
        <CommentSection targetId={selectedNodeId} targetType="node" />
      </div>

      {/* Diff preview modal */}
      {showDiff && editDraft && (
        <DiffPreview
          original={d}
          draft={editDraft}
          onConfirm={() => { saveEditDraft(); setShowDiff(false); }}
          onCancel={() => setShowDiff(false)}
        />
      )}
    </>
  );
}
