"use client";

import Sidebar from "@/components/layout/Sidebar";
import { useFSCStore } from "@/store/fsc-store";
import type { ProcessNodeData, ApprovalAuthority } from "@/types/fsc";

function formatAmount(amount?: number) {
  if (!amount) return "-";
  if (amount >= 10000) return `${(amount / 10000).toFixed(0)}萬`;
  return amount.toLocaleString();
}

function actionLabel(action: string) {
  switch (action) {
    case "initiate": return "立";
    case "review": return "審";
    case "approve": return "決";
    default: return action;
  }
}

export default function ApprovalPage() {
  const nodes = useFSCStore((s) => s.nodes);

  // Collect all approval authorities grouped by level
  const levelMap = new Map<string, { authority: ApprovalAuthority; nodeName: string; nodeId: string }[]>();

  nodes.forEach((node) => {
    const d = node.data as unknown as ProcessNodeData;
    d.approvalAuthorities.forEach((a) => {
      const key = `${a.level}`;
      if (!levelMap.has(key)) levelMap.set(key, []);
      levelMap.get(key)!.push({ authority: a, nodeName: d.label, nodeId: node.id });
    });
  });

  // Warnings
  const warnings: string[] = [];
  nodes.forEach((node) => {
    const d = node.data as unknown as ProcessNodeData;
    if (d.nodeType === "start" || d.nodeType === "end") return;
    const hasApproval = d.approvalAuthorities.some((a) => a.action === "approve");
    const allNA = d.approvalAuthorities.length > 0 && d.approvalAuthorities.every((a) => a.isNA);
    if (!hasApproval && !allNA && d.approvalAuthorities.length === 0) {
      warnings.push(`"${d.label}" 未設定核決人員`);
    }
  });

  // Orphan check
  const usedLevels = new Set<string>();
  nodes.forEach((node) => {
    const d = node.data as unknown as ProcessNodeData;
    d.approvalAuthorities.forEach((a) => usedLevels.add(a.level));
  });

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-y-auto p-6">
        <h1 className="text-xl font-bold text-gray-800 mb-6">核決權限總表</h1>

        {/* Warnings */}
        {warnings.length > 0 && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="text-sm font-semibold text-red-700 mb-2">警示</h3>
            {warnings.map((w, i) => (
              <p key={i} className="text-sm text-red-600">- {w}</p>
            ))}
          </div>
        )}

        {/* Approval table per node */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left px-4 py-3 font-medium text-gray-500">流程節點</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">金額範圍</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">職級</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">人員</th>
                <th className="text-center px-4 py-3 font-medium text-gray-500">動作</th>
              </tr>
            </thead>
            <tbody>
              {nodes.map((node) => {
                const d = node.data as unknown as ProcessNodeData;
                if (d.approvalAuthorities.length === 0) return null;
                return d.approvalAuthorities.map((a, i) => (
                  <tr key={`${node.id}-${a.id}`} className="border-b border-gray-50 hover:bg-gray-50">
                    {i === 0 && (
                      <td
                        className="px-4 py-2.5 font-medium text-gray-800"
                        rowSpan={d.approvalAuthorities.length}
                      >
                        {d.label}
                      </td>
                    )}
                    <td className="px-4 py-2.5 text-gray-600">
                      {a.isNA
                        ? "N/A"
                        : a.amountMin && a.amountMax
                          ? `${formatAmount(a.amountMin)} ~ ${formatAmount(a.amountMax)}`
                          : a.amountMax
                            ? `<= ${formatAmount(a.amountMax)}`
                            : a.amountMin
                              ? `> ${formatAmount(a.amountMin)}`
                              : "-"}
                    </td>
                    <td className="px-4 py-2.5 text-gray-700 font-medium">{a.level}</td>
                    <td className="px-4 py-2.5 text-gray-600">{a.levelPerson}</td>
                    <td className="px-4 py-2.5 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
                          a.action === "approve"
                            ? "bg-red-100 text-red-700"
                            : a.action === "review"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {actionLabel(a.action)}
                      </span>
                    </td>
                  </tr>
                ));
              })}
            </tbody>
          </table>
        </div>

        {/* By Level View */}
        <h2 className="text-lg font-bold text-gray-800 mt-8 mb-4">依核決分級檢視</h2>
        <div className="space-y-4">
          {Array.from(levelMap.entries()).map(([level, items]) => (
            <div key={level} className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">
                {level}
                <span className="text-gray-400 text-sm font-normal ml-2">
                  ({items.length} 個節點)
                </span>
              </h3>
              <div className="space-y-1">
                {items.map((item, i) => (
                  <div key={i} className="text-sm text-gray-600 flex gap-2">
                    <span className="text-gray-400">-</span>
                    <span>{item.nodeName}</span>
                    <span className="text-gray-400">/ {item.authority.levelPerson}</span>
                    <span
                      className={`px-1.5 py-0 rounded text-[10px] font-bold ${
                        item.authority.action === "approve"
                          ? "bg-red-100 text-red-700"
                          : item.authority.action === "review"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {actionLabel(item.authority.action)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
