"use client";

import Sidebar from "@/components/layout/Sidebar";
import { useFSCStore, type OperationLog, type FlowSnapshot } from "@/store/fsc-store";
import { useState } from "react";
import { Trash2, RotateCcw, Clock, History } from "lucide-react";

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

export default function AdminPage() {
  const [apiEnabled, setApiEnabled] = useState(false);
  const [jsonImportEnabled, setJsonImportEnabled] = useState(true);
  const [manualFlowEnabled, setManualFlowEnabled] = useState(true);
  const loggingEnabled = useFSCStore((s) => s.loggingEnabled);
  const setLoggingEnabled = useFSCStore((s) => s.setLoggingEnabled);
  const logs = useFSCStore((s) => s.operationLogs);
  const clearLogs = useFSCStore((s) => s.clearLogs);
  const snapshots = useFSCStore((s) => s.snapshots);
  const restoreSnapshot = useFSCStore((s) => s.restoreSnapshot);
  const deleteSnapshot = useFSCStore((s) => s.deleteSnapshot);

  const [tab, setTab] = useState<"settings" | "logs" | "versions">("settings");

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-y-auto p-6">
        <h1 className="text-xl font-bold text-gray-800 mb-6">後台管理</h1>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-gray-200">
          {([
            { key: "settings", label: "系統設定" },
            { key: "logs", label: "操作紀錄", count: logs.length },
            { key: "versions", label: "版本控制", count: snapshots.length },
          ] as const).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                tab === t.key
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {t.label}
              {"count" in t && t.count > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 text-[10px]">{t.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* Settings */}
        {tab === "settings" && (
          <div className="max-w-2xl space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 text-sm mb-4">功能開關</h3>
              <div className="space-y-3">
                <Toggle label="操作紀錄" desc="記錄所有節點編輯、匯入匯出等操作" checked={loggingEnabled} onChange={setLoggingEnabled} />
                <Toggle label="AI API" desc="啟用後可直接呼叫 AI 產生流程圖" checked={apiEnabled} onChange={setApiEnabled} />
                <Toggle label="JSON 匯入" desc="允許匯入 JSON 檔案建立流程圖" checked={jsonImportEnabled} onChange={setJsonImportEnabled} />
                <Toggle label="手動建流程" desc="允許在畫布上手動拖拉建立節點" checked={manualFlowEnabled} onChange={setManualFlowEnabled} />
              </div>
            </div>

            {apiEnabled && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 text-sm mb-4">AI 設定</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-600 block mb-1">Provider</label>
                    <select className="w-full text-sm px-3 py-2 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-400">
                      <option>Claude</option>
                      <option>OpenAI GPT</option>
                      <option>Ollama (本地)</option>
                      <option>Gemini</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 block mb-1">API Key</label>
                    <input type="password" placeholder="sk-..." className="w-full text-sm px-3 py-2 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-400" />
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 text-sm mb-4">角色權限</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-gray-400">
                    <th className="text-left py-2 font-medium">角色</th>
                    <th className="text-center py-2 font-medium">檢視</th>
                    <th className="text-center py-2 font-medium">編輯</th>
                    <th className="text-center py-2 font-medium">管理</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-50">
                    <td className="py-2 text-gray-700 font-medium">Admin</td>
                    <td className="py-2 text-center text-green-600">v</td>
                    <td className="py-2 text-center text-green-600">v</td>
                    <td className="py-2 text-center text-green-600">v</td>
                  </tr>
                  <tr className="border-b border-gray-50">
                    <td className="py-2 text-gray-700 font-medium">Manager</td>
                    <td className="py-2 text-center text-green-600">v</td>
                    <td className="py-2 text-center text-orange-500">限本部門</td>
                    <td className="py-2 text-center text-red-400">x</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-gray-700 font-medium">Viewer</td>
                    <td className="py-2 text-center text-green-600">v</td>
                    <td className="py-2 text-center text-red-400">x</td>
                    <td className="py-2 text-center text-red-400">x</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Operation Logs */}
        {tab === "logs" && (
          <div className="max-w-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <History className="w-4 h-4" />
                共 {logs.length} 筆紀錄
              </div>
              {logs.length > 0 && (
                <button onClick={() => { if (confirm("確定清除所有紀錄？")) clearLogs(); }} className="text-xs text-red-500 hover:text-red-600">
                  清除全部
                </button>
              )}
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              {logs.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">尚無操作紀錄</p>
              ) : (
                <div className="divide-y-0">
                  {logs.map((log) => <LogEntry key={log.id} log={log} />)}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Version Control */}
        {tab === "versions" && (
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              共 {snapshots.length} 個版本
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              {snapshots.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">
                  尚無版本快照<br />
                  <span className="text-xs">在流程圖編輯模式點「存版本」建立</span>
                </p>
              ) : (
                snapshots.map((snap) => (
                  <SnapshotRow
                    key={snap.id}
                    snap={snap}
                    onRestore={() => { if (confirm(`還原到「${snap.label}」？目前未存檔的修改會遺失。`)) restoreSnapshot(snap.id); }}
                    onDelete={() => { if (confirm("刪除此版本？")) deleteSnapshot(snap.id); }}
                  />
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
