"use client";

import Sidebar from "@/components/layout/Sidebar";
import OrgCanvas from "@/components/org/OrgCanvas";
import OrgDetailPanel from "@/components/org/OrgDetailPanel";

export default function OrgPage() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <OrgCanvas />
      <OrgDetailPanel />
    </div>
  );
}
