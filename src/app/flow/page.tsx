"use client";

import Sidebar from "@/components/layout/Sidebar";
import FlowCanvas from "@/components/flow/FlowCanvas";
import DetailPanel from "@/components/flow/DetailPanel";
import EdgeEditor from "@/components/flow/EdgeEditor";

export default function FlowPage() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <FlowCanvas />
      <DetailPanel />
      <EdgeEditor />
    </div>
  );
}
