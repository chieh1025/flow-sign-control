"use client";

import { useFSCStore } from "@/store/fsc-store";
import type { ProcessNodeData, ApprovalAuthority, DetailPreferences } from "@/types/fsc";
import { X, Settings2, ChevronDown, ChevronRight, ArrowUp, ArrowDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

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

function Section({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 dark:border-gray-800 last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 w-full py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
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
        <tr className="text-gray-400 border-b dark:border-gray-700">
          <th className="text-left py-1.5 font-medium">金額</th>
          <th className="text-left py-1.5 font-medium">職級</th>
          <th className="text-left py-1.5 font-medium">人員</th>
          <th className="text-center py-1.5 font-medium">動作</th>
        </tr>
      </thead>
      <tbody>
        {authorities.map((a) => (
          <tr key={a.id} className="border-b border-gray-50 dark:border-gray-800">
            <td className="py-2 text-gray-600 dark:text-gray-400">
              {a.isNA
                ? "N/A"
                : a.amountMin && a.amountMax
                  ? `${formatAmount(a.amountMin)}~${formatAmount(a.amountMax)}`
                  : a.amountMax
                    ? `<= ${formatAmount(a.amountMax)}`
                    : a.amountMin
                      ? `> ${formatAmount(a.amountMin)}`
                      : "-"}
            </td>
            <td className="py-2 text-gray-700 dark:text-gray-300 font-medium">{a.level}</td>
            <td className="py-2 text-gray-600 dark:text-gray-400">{a.levelPerson}</td>
            <td className="py-2 text-center">
              <span
                className={cn(
                  "inline-block px-2 py-0.5 rounded text-xs font-bold",
                  a.action === "approve" && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
                  a.action === "review" && "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
                  a.action === "initiate" && "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                )}
              >
                {approvalActionLabel(a.action)}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

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

function PreferencesToggle({
  sectionOrder,
  onReorder,
}: {
  sectionOrder: SectionKey[];
  onReorder: (order: SectionKey[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const prefs = useFSCStore((s) => s.detailPreferences);
  const setPrefs = useFSCStore((s) => s.setDetailPreferences);

  const orderedItems = sectionOrder.map((key) => ALL_SECTIONS.find((s) => s.key === key)!).filter(Boolean);

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newOrder = [...sectionOrder];
    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
    onReorder(newOrder);
  };

  const moveDown = (index: number) => {
    if (index === sectionOrder.length - 1) return;
    const newOrder = [...sectionOrder];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    onReorder(newOrder);
  };

  return (
    <div className="mb-3">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
      >
        <Settings2 className="w-4 h-4" />
        顯示項目設定
      </button>
      {open && (
        <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-1">
          {orderedItems.map((item, index) => (
            <div key={item.key} className="flex items-center gap-2 py-1">
              <div className="flex gap-0.5">
                <button
                  onClick={() => moveUp(index)}
                  className="p-0.5 text-gray-300 hover:text-gray-600 dark:hover:text-gray-300"
                  disabled={index === 0}
                >
                  <ArrowUp className="w-3 h-3" />
                </button>
                <button
                  onClick={() => moveDown(index)}
                  className="p-0.5 text-gray-300 hover:text-gray-600 dark:hover:text-gray-300"
                  disabled={index === orderedItems.length - 1}
                >
                  <ArrowDown className="w-3 h-3" />
                </button>
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer flex-1">
                <input
                  type="checkbox"
                  checked={prefs[item.key]}
                  onChange={(e) => setPrefs({ [item.key]: e.target.checked })}
                  className="rounded border-gray-300 w-3.5 h-3.5"
                />
                {item.label}
              </label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const signMethodLabels: Record<string, string> = {
  system_sign: "系統簽",
  paper_sign: "紙本簽",
  both: "系統+紙本",
};

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
  const [sectionOrder, setSectionOrder] = useState<SectionKey[]>(DEFAULT_ORDER);

  if (!detailPanelOpen || !selectedNodeId) return null;

  const node = nodes.find((n) => n.id === selectedNodeId);
  if (!node) return null;

  const d = node.data as unknown as ProcessNodeData;

  const renderSection = (key: SectionKey) => {
    switch (key) {
      case "operatingSystem":
        if (!prefs.operatingSystem || !d.operatingSystem) return null;
        return (
          <Section key={key} title="操作系統">
            <span className="inline-flex items-center px-2.5 py-1 rounded bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm font-medium">
              {d.operatingSystem}
            </span>
          </Section>
        );
      case "signMethod":
        if (!prefs.signMethod || !d.signMethod) return null;
        return (
          <Section key={key} title="簽核方式">
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {signMethodLabels[d.signMethod] || d.signMethod}
            </span>
          </Section>
        );
      case "currentStatus":
        if (!prefs.currentStatus) return null;
        return (
          <Section key={key} title="現況">
            <div className="flex flex-wrap gap-1.5">
              {d.status.vacant && <span className="px-2.5 py-1 rounded bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm">缺人</span>}
              {d.status.unsigned && <span className="px-2.5 py-1 rounded bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 text-sm">未簽</span>}
              {d.status.paperSign && <span className="px-2.5 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-sm">紙本簽</span>}
              {d.status.other && <span className="px-2.5 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-sm">{d.status.other}</span>}
              {!d.status.vacant && !d.status.unsigned && !d.status.paperSign && !d.status.other && (
                <span className="text-sm text-gray-400">正常</span>
              )}
            </div>
          </Section>
        );
      case "approvalAuthority":
        if (!prefs.approvalAuthority) return null;
        return (
          <Section key={key} title="核決權限">
            <ApprovalTable authorities={d.approvalAuthorities} />
          </Section>
        );
      case "keyPoints":
        if (!prefs.keyPoints || d.keyPoints.length === 0) return null;
        return (
          <Section key={key} title="作業重點">
            <ul className="space-y-1.5">
              {d.keyPoints.map((p, i) => (
                <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex gap-2">
                  <span className="text-blue-400 mt-0.5">-</span> {p}
                </li>
              ))}
            </ul>
          </Section>
        );
      case "risks":
        if (!prefs.risks || d.risks.length === 0) return null;
        return (
          <Section key={key} title="風險">
            <ul className="space-y-1.5">
              {d.risks.map((r, i) => (
                <li key={i} className="text-sm text-red-600 dark:text-red-400 flex gap-2">
                  <span className="mt-0.5">!</span> {r}
                </li>
              ))}
            </ul>
          </Section>
        );
      case "personnel":
        if (!prefs.personnel || d.personnel.length === 0) return null;
        return (
          <Section key={key} title="簽核人/經手人">
            <div className="space-y-2.5">
              {d.personnel.map((p) => (
                <div key={p.id} className="text-sm">
                  <div className="font-medium text-gray-700 dark:text-gray-300">{p.role}（{p.department}）</div>
                  <div className="text-gray-500 dark:text-gray-400 mt-0.5">
                    現任：{p.currentHolder}
                    {p.deputy && ` / 代理：${p.deputy}`}
                  </div>
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
              {d.reports.map((r) => (
                <div key={r.id} className="text-sm">
                  <div className="font-medium text-gray-700 dark:text-gray-300">{r.reportName}</div>
                  <div className="text-gray-500 dark:text-gray-400 mt-0.5">
                    {r.frequency === "monthly" ? "月報" : r.frequency} / {r.deadline || "-"} / {r.recipient || "-"}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        );
      case "relatedForms":
        if (!prefs.relatedForms || d.relatedForms.length === 0) return null;
        return (
          <Section key={key} title="相關文件">
            <div className="flex flex-wrap gap-1.5">
              {d.relatedForms.map((f, i) => (
                <span key={i} className="px-2.5 py-1 rounded bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-sm">
                  {f}
                </span>
              ))}
            </div>
          </Section>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-96 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-y-auto flex-shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
        <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100">{d.label}</h3>
        <button
          onClick={() => {
            setDetailPanelOpen(false);
            setSelectedNodeId(null);
          }}
          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-0">
        <PreferencesToggle sectionOrder={sectionOrder} onReorder={setSectionOrder} />

        {sectionOrder.map((key) => renderSection(key))}

        {/* Always show control points */}
        {d.controlPoints.length > 0 && (
          <Section title="內控重點">
            <ul className="space-y-1.5">
              {d.controlPoints.map((c, i) => (
                <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex gap-2">
                  <span className="text-purple-400 mt-0.5">-</span> {c}
                </li>
              ))}
            </ul>
          </Section>
        )}
      </div>
    </div>
  );
}
