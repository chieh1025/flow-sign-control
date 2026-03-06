"use client";

import { useFSCStore } from "@/store/fsc-store";
import type { ProcessNodeData, SignMethod, NodeType } from "@/types/fsc";
import { X, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-gray-500">{label}</label>
      {children}
    </div>
  );
}

function StringListEditor({
  items,
  onChange,
  placeholder,
}: {
  items: string[];
  onChange: (items: string[]) => void;
  placeholder: string;
}) {
  const [newItem, setNewItem] = useState("");

  return (
    <div className="space-y-1">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-1 group">
          <span className="flex-1 text-sm text-gray-700 bg-gray-50 px-2 py-1 rounded">{item}</span>
          <button
            onClick={() => onChange(items.filter((_, idx) => idx !== i))}
            className="opacity-0 group-hover:opacity-100 p-0.5 text-gray-400 hover:text-red-500"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}
      <div className="flex gap-1">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && newItem.trim()) {
              onChange([...items, newItem.trim()]);
              setNewItem("");
            }
          }}
          placeholder={placeholder}
          className="flex-1 text-sm px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
        />
        <button
          onClick={() => {
            if (newItem.trim()) {
              onChange([...items, newItem.trim()]);
              setNewItem("");
            }
          }}
          className="p-1 text-blue-500 hover:text-blue-600"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function NodeEditor() {
  const selectedNodeId = useFSCStore((s) => s.selectedNodeId);
  const nodes = useFSCStore((s) => s.nodes);
  const updateNodeData = useFSCStore((s) => s.updateNodeData);
  const editingNodeId = useFSCStore((s) => s.editingNodeId);
  const setEditingNodeId = useFSCStore((s) => s.setEditingNodeId);
  const deleteNode = useFSCStore((s) => s.deleteNode);

  if (!editingNodeId) return null;

  const node = nodes.find((n) => n.id === editingNodeId);
  if (!node) return null;

  const d = node.data as unknown as ProcessNodeData;

  const update = (partial: Partial<ProcessNodeData>) => {
    updateNodeData(editingNodeId, partial);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-xl shadow-xl w-[560px] max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white rounded-t-xl">
          <h3 className="font-bold text-lg text-gray-800">編輯節點</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (confirm("確定刪除此節點？")) {
                  deleteNode(editingNodeId);
                  setEditingNodeId(null);
                }
              }}
              className="p-1.5 rounded hover:bg-red-50 text-red-400 hover:text-red-600"
              title="刪除節點"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setEditingNodeId(null)}
              className="p-1.5 rounded hover:bg-gray-100"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="p-4 space-y-4">
          {/* Row 1: Label + NodeType */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <Field label="節點名稱">
                <input
                  type="text"
                  value={d.label}
                  onChange={(e) => update({ label: e.target.value })}
                  className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400"
                />
              </Field>
            </div>
            <Field label="節點類型">
              <select
                value={d.nodeType}
                onChange={(e) => update({ nodeType: e.target.value as NodeType })}
                className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400"
              >
                {NODE_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </Field>
          </div>

          {/* Row 2: System + Sign Method */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="操作系統">
              <select
                value={d.operatingSystem || ""}
                onChange={(e) => update({ operatingSystem: e.target.value || undefined })}
                className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400"
              >
                <option value="">（無）</option>
                {SYSTEMS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </Field>
            <Field label="簽核方式">
              <select
                value={d.signMethod || ""}
                onChange={(e) => update({ signMethod: (e.target.value || undefined) as SignMethod | undefined })}
                className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400"
              >
                <option value="">（無）</option>
                {SIGN_METHODS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </Field>
          </div>

          {/* Status */}
          <Field label="現況">
            <div className="flex flex-wrap gap-3">
              {[
                { key: "vacant", label: "缺人" },
                { key: "unsigned", label: "未簽" },
                { key: "paperSign", label: "紙本簽" },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-1.5 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={(d.status as unknown as Record<string, boolean | string>)[key] as boolean}
                    onChange={(e) =>
                      update({ status: { ...d.status, [key]: e.target.checked } })
                    }
                    className="rounded border-gray-300 w-3.5 h-3.5"
                  />
                  {label}
                </label>
              ))}
              <div className="flex items-center gap-1.5">
                <span className="text-sm text-gray-500">其他:</span>
                <input
                  type="text"
                  value={d.status.other}
                  onChange={(e) => update({ status: { ...d.status, other: e.target.value } })}
                  className="text-sm px-2 py-1 border border-gray-200 rounded w-24 focus:outline-none focus:ring-1 focus:ring-blue-400"
                  placeholder="自填"
                />
              </div>
            </div>
          </Field>

          {/* Key Points */}
          <Field label="作業重點">
            <StringListEditor
              items={d.keyPoints}
              onChange={(items) => update({ keyPoints: items })}
              placeholder="新增作業重點..."
            />
          </Field>

          {/* Control Points */}
          <Field label="內控重點">
            <StringListEditor
              items={d.controlPoints}
              onChange={(items) => update({ controlPoints: items })}
              placeholder="新增內控重點..."
            />
          </Field>

          {/* Risks */}
          <Field label="風險">
            <StringListEditor
              items={d.risks}
              onChange={(items) => update({ risks: items })}
              placeholder="新增風險..."
            />
          </Field>

          {/* Related Forms */}
          <Field label="相關文件">
            <StringListEditor
              items={d.relatedForms}
              onChange={(items) => update({ relatedForms: items })}
              placeholder="新增相關文件..."
            />
          </Field>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-4 border-t">
          <button
            onClick={() => setEditingNodeId(null)}
            className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600"
          >
            完成
          </button>
        </div>
      </div>
    </div>
  );
}
