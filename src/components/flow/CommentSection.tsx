"use client";

import { useState } from "react";
import { useFSCStore } from "@/store/fsc-store";
import { MessageSquare, Send, Trash2 } from "lucide-react";

interface CommentSectionProps {
  targetId: string;
  targetType: "node" | "edge";
}

export default function CommentSection({ targetId, targetType }: CommentSectionProps) {
  const comments = useFSCStore((s) => s.comments.filter((c) => c.targetId === targetId));
  const addComment = useFSCStore((s) => s.addComment);
  const deleteComment = useFSCStore((s) => s.deleteComment);
  const canComment = useFSCStore((s) => s.canComment);
  const canManage = useFSCStore((s) => s.canManage);
  const [text, setText] = useState("");

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    addComment(targetId, targetType, trimmed);
    setText("");
  };

  return (
    <div className="border-t border-gray-100 dark:border-gray-800">
      <div className="px-4 py-2.5 flex items-center gap-1.5">
        <MessageSquare className="w-3.5 h-3.5 text-gray-400" />
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
          意見 ({comments.length})
        </span>
      </div>

      {/* Comment list */}
      {comments.length > 0 && (
        <div className="px-4 pb-2 space-y-2 max-h-48 overflow-y-auto">
          {comments.map((c) => (
            <div key={c.id} className="group bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-300">{c.author}</span>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-gray-400">
                    {new Date(c.timestamp).toLocaleString("zh-TW", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </span>
                  {canManage() && (
                    <button
                      onClick={() => deleteComment(c.id)}
                      className="opacity-0 group-hover:opacity-100 p-0.5 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap">{c.content}</p>
            </div>
          ))}
        </div>
      )}

      {/* Input */}
      {canComment() && (
        <div className="px-4 pb-3 flex gap-1.5">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
            placeholder="新增意見..."
            className="flex-1 text-sm px-2.5 py-1.5 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400 placeholder:text-gray-300 dark:placeholder:text-gray-600"
          />
          <button
            onClick={handleSubmit}
            disabled={!text.trim()}
            className="p-1.5 text-blue-500 hover:text-blue-600 disabled:text-gray-300 dark:disabled:text-gray-600"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
