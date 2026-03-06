"use client";

import Sidebar from "@/components/layout/Sidebar";
import { useFSCStore } from "@/store/fsc-store";
import type { ProcessNodeData } from "@/types/fsc";
import { GitBranch, Shield, AlertTriangle, ArrowRight, MessageSquare } from "lucide-react";
import Link from "next/link";
import type { Comment } from "@/types/fsc";

export default function Home() {
  const nodes = useFSCStore((s) => s.nodes);
  const edges = useFSCStore((s) => s.edges);
  const comments = useFSCStore((s) => s.comments);
  const currentProcessName = useFSCStore((s) => s.currentProcessName);

  // Stats
  const totalNodes = nodes.filter((n) => {
    const d = n.data as unknown as ProcessNodeData;
    return d.nodeType !== "start" && d.nodeType !== "end";
  }).length;

  const vacantCount = nodes.filter((n) => {
    const d = n.data as unknown as ProcessNodeData;
    return d.status.vacant;
  }).length;

  const noApprovalCount = nodes.filter((n) => {
    const d = n.data as unknown as ProcessNodeData;
    return d.nodeType !== "start" && d.nodeType !== "end" && d.approvalAuthorities.length === 0;
  }).length;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-y-auto p-8 bg-gray-50 dark:bg-gray-950">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-8">FSC 儀表板</h1>

        {/* Current flow */}
        <div className="mb-8 max-w-3xl">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">流程圖</h2>
          <Link
            href="/flow"
            className="flex items-center justify-between p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-300 dark:hover:border-blue-600 transition-colors group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                <GitBranch className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <div className="font-semibold text-gray-800 dark:text-gray-100">{currentProcessName}</div>
                <div className="text-sm text-gray-400">{totalNodes} 個作業節點</div>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500 transition-colors" />
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8 max-w-3xl">
          <Link href="/flow" className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-5 hover:border-blue-300 dark:hover:border-blue-600 transition-colors">
            <div className="flex items-center gap-3 mb-2">
              <GitBranch className="w-5 h-5 text-blue-500" />
              <span className="text-sm text-gray-500 dark:text-gray-400">流程節點</span>
            </div>
            <div className="text-3xl font-bold text-gray-800 dark:text-gray-100">{totalNodes}</div>
          </Link>

          <Link href="/approval" className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-5 hover:border-blue-300 dark:hover:border-blue-600 transition-colors">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-5 h-5 text-purple-500" />
              <span className="text-sm text-gray-500 dark:text-gray-400">未設核決權限</span>
            </div>
            <div className={`text-3xl font-bold ${noApprovalCount > 0 ? "text-red-500" : "text-green-600"}`}>
              {noApprovalCount}
            </div>
          </Link>

          <Link href="/alerts" className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-5 hover:border-blue-300 dark:hover:border-blue-600 transition-colors">
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              <span className="text-sm text-gray-500 dark:text-gray-400">缺人節點</span>
            </div>
            <div className={`text-3xl font-bold ${vacantCount > 0 ? "text-red-500" : "text-green-600"}`}>
              {vacantCount}
            </div>
          </Link>
        </div>

        {/* Quick links */}
        <div className="max-w-3xl">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">快速操作</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/flow"
              className="flex items-center gap-3 p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
            >
              <GitBranch className="w-5 h-5 text-blue-500" />
              <div>
                <div className="font-medium text-gray-800 dark:text-gray-100">流程圖編輯</div>
                <div className="text-sm text-gray-400">檢視與編輯流程節點</div>
              </div>
            </Link>
            <Link
              href="/approval"
              className="flex items-center gap-3 p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-300 dark:hover:border-purple-600 transition-colors"
            >
              <Shield className="w-5 h-5 text-purple-500" />
              <div>
                <div className="font-medium text-gray-800 dark:text-gray-100">核決權限總表</div>
                <div className="text-sm text-gray-400">檢視權限分級與交叉勾稽</div>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent comments */}
        {comments.length > 0 && (
          <div className="mt-8 max-w-3xl">
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-amber-500" />
              最新意見
            </h2>
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg divide-y divide-gray-100 dark:divide-gray-800">
              {comments.slice(0, 8).map((c: Comment) => {
                const targetNode = nodes.find((n) => n.id === c.targetId);
                const targetEdge = edges.find((e) => e.id === c.targetId);
                const targetLabel = c.targetType === "node"
                  ? (targetNode?.data as unknown as ProcessNodeData | undefined)?.label || c.targetId
                  : targetEdge
                    ? `${(nodes.find((n) => n.id === targetEdge.source)?.data as unknown as ProcessNodeData | undefined)?.label || "?"} → ${(nodes.find((n) => n.id === targetEdge.target)?.data as unknown as ProcessNodeData | undefined)?.label || "?"}`
                    : c.targetId;

                return (
                  <Link
                    key={c.id}
                    href="/flow"
                    className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-300">{c.author}</span>
                        <span className="text-[10px] text-gray-400">
                          {new Date(c.timestamp).toLocaleString("zh-TW", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-500 rounded">
                          {c.targetType === "node" ? "節點" : "連線"}：{targetLabel}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-200 truncate">{c.content}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
