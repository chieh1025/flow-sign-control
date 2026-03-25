"use client";

import Sidebar from "@/components/layout/Sidebar";
import { useFSCStore } from "@/store/fsc-store";
import type { ProcessNodeData } from "@/types/fsc";
import { AlertTriangle, UserX, FileX, Shield } from "lucide-react";

interface Alert {
  type: "error" | "warning";
  icon: React.ReactNode;
  title: string;
  detail: string;
  nodeId?: string;
}

export default function AlertsPage() {
  const nodes = useFSCStore((s) => s.nodes);

  const alerts: Alert[] = [];

  nodes.forEach((node) => {
    const d = node.data as unknown as ProcessNodeData;

    // Skip start/end nodes
    if (d.nodeType === "start" || d.nodeType === "end") return;

    // No approval authority
    const hasApproval = d.approvalAuthorities.length > 0;
    const allNA = d.approvalAuthorities.every((a) => a.isNA);
    if (!hasApproval) {
      alerts.push({
        type: "error",
        icon: <Shield className="w-4 h-4" />,
        title: `"${d.label}" 未設定核決權限`,
        detail: "此節點沒有任何核決權限設定，請設定核決分級或標記為 N/A",
        nodeId: node.id,
      });
    }

    // Approval with no person
    d.approvalAuthorities.forEach((a) => {
      if (!a.isNA && !a.levelPerson) {
        alerts.push({
          type: "error",
          icon: <UserX className="w-4 h-4" />,
          title: `"${d.label}" 的 ${a.level} 未指定人員`,
          detail: `核決分級 ${a.level} 已設定但未指定實際人員`,
          nodeId: node.id,
        });
      }
    });

    // Vacant status
    if (d.status.vacant) {
      alerts.push({
        type: "error",
        icon: <UserX className="w-4 h-4" />,
        title: `"${d.label}" 缺人`,
        detail: "此節點目前標記為缺人狀態",
        nodeId: node.id,
      });
    }

    // Unsigned status
    if (d.status.unsigned) {
      alerts.push({
        type: "warning",
        icon: <FileX className="w-4 h-4" />,
        title: `"${d.label}" 未簽`,
        detail: "此節點目前有未完成的簽核",
        nodeId: node.id,
      });
    }
  });

  // Check orphan authorities (levels with no flow nodes)
  const allLevels = new Set<string>();
  const usedLevels = new Set<string>();
  nodes.forEach((node) => {
    const d = node.data as unknown as ProcessNodeData;
    d.approvalAuthorities.forEach((a) => {
      allLevels.add(a.level);
      if (d.nodeType !== "start" && d.nodeType !== "end") {
        usedLevels.add(a.level);
      }
    });
  });

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-y-auto p-6 bg-background">
        <h1 className="text-xl font-bold text-text mb-6">
          警示中心
          {alerts.length > 0 && (
            <span className="ml-2 text-sm font-normal text-red-500 dark:text-red-400">
              ({alerts.length} 個問題)
            </span>
          )}
        </h1>

        {alerts.length === 0 ? (
          <div className="text-center py-16 text-text-muted">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-text-muted" />
            <p className="text-lg">沒有警示</p>
            <p className="text-sm mt-1">所有流程節點的核決權限設定正常</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 p-4 rounded-lg border ${
                  alert.type === "error"
                    ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                    : "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"
                }`}
              >
                <div
                  className={`mt-0.5 ${
                    alert.type === "error" ? "text-red-500 dark:text-red-400" : "text-yellow-500 dark:text-yellow-400"
                  }`}
                >
                  {alert.icon}
                </div>
                <div>
                  <h3
                    className={`text-sm font-semibold ${
                      alert.type === "error" ? "text-red-700 dark:text-red-400" : "text-yellow-700 dark:text-yellow-400"
                    }`}
                  >
                    {alert.title}
                  </h3>
                  <p
                    className={`text-xs mt-0.5 ${
                      alert.type === "error" ? "text-red-600 dark:text-red-400" : "text-yellow-600 dark:text-yellow-400"
                    }`}
                  >
                    {alert.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
