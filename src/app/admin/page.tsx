"use client";

import Sidebar from "@/components/layout/Sidebar";
import { useState } from "react";

export default function AdminPage() {
  const [apiEnabled, setApiEnabled] = useState(false);
  const [jsonImportEnabled, setJsonImportEnabled] = useState(true);
  const [manualFlowEnabled, setManualFlowEnabled] = useState(true);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-y-auto p-6">
        <h1 className="text-xl font-bold text-gray-800 mb-6">後台管理</h1>

        <div className="max-w-2xl space-y-6">
          {/* Feature toggles */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 text-sm mb-4">功能開關</h3>
            <div className="space-y-3">
              <label className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-700">AI API</div>
                  <div className="text-xs text-gray-400">啟用後可直接呼叫 AI 產生流程圖</div>
                </div>
                <input
                  type="checkbox"
                  checked={apiEnabled}
                  onChange={(e) => setApiEnabled(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300"
                />
              </label>
              <label className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-700">JSON 匯入</div>
                  <div className="text-xs text-gray-400">允許匯入 JSON 檔案建立流程圖</div>
                </div>
                <input
                  type="checkbox"
                  checked={jsonImportEnabled}
                  onChange={(e) => setJsonImportEnabled(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300"
                />
              </label>
              <label className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-700">手動建流程</div>
                  <div className="text-xs text-gray-400">允許在畫布上手動拖拉建立節點</div>
                </div>
                <input
                  type="checkbox"
                  checked={manualFlowEnabled}
                  onChange={(e) => setManualFlowEnabled(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300"
                />
              </label>
            </div>
          </div>

          {/* AI Provider */}
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
                  <input
                    type="password"
                    placeholder="sk-..."
                    className="w-full text-sm px-3 py-2 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Roles */}
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
      </div>
    </div>
  );
}
