"use client";

import Sidebar from "@/components/layout/Sidebar";
import FlowCanvas from "@/components/flow/FlowCanvas";
import DetailPanel from "@/components/flow/DetailPanel";

export default function FlowPage() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <FlowCanvas />
      <DetailPanel />
    </div>
  );
}
