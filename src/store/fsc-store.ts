import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  type Node,
  type Edge,
  applyNodeChanges,
  applyEdgeChanges,
  type OnNodesChange,
  type OnEdgesChange,
  type Connection,
  addEdge,
  MarkerType,
} from "@xyflow/react";
import Dagre from "@dagrejs/dagre";
import type {
  ProcessNodeData,
  DetailPreferences,
  Role,
  Comment,
} from "@/types/fsc";
import { DEFAULT_DETAIL_PREFERENCES, ROLE_PERMISSIONS } from "@/types/fsc";

// --- Operation Log ---
export interface OperationLog {
  id: string;
  timestamp: number;
  action: string;       // e.g. "node.update", "node.add", "node.delete", "flow.import", "flow.save"
  detail: string;       // human-readable description
  nodeId?: string;
  changes?: { field: string; from: string; to: string }[];
}

// --- Version Snapshot ---
export interface FlowSnapshot {
  id: string;
  timestamp: number;
  label: string;
  nodes: Node<ProcessNodeData>[];
  edges: Edge[];
}

// Auto-layout with dagre
function getLayoutedElements(nodes: Node[], edges: Edge[]) {
  const nodeWidth = 220;
  const nodeHeight = 100;
  const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: "TB", nodesep: 60, ranksep: 80 });

  nodes.forEach((node) => {
    g.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });

  Dagre.layout(g);

  const layoutedNodes = nodes.map((node) => {
    const pos = g.node(node.id);
    return {
      ...node,
      position: { x: pos.x - nodeWidth / 2, y: pos.y - nodeHeight / 2 },
    };
  });

  return { nodes: layoutedNodes, edges };
}

const defaultEdgeOptions = {
  markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16 },
  style: { strokeWidth: 2 },
};

// Demo data
const DEMO_NODES: Node<ProcessNodeData>[] = [
  {
    id: "1",
    type: "processNode",
    position: { x: 100, y: 100 },
    data: {
      label: "請購申請",
      nodeType: "start",
      operatingSystem: "採購模組",
      signMethod: "system_sign",
      status: { vacant: false, unsigned: false, paperSign: false, other: "" },
      controlPoints: ["確認預算餘額", "檢核請購規格"],
      keyPoints: ["需附需求說明書"],
      risks: ["未經核准逕行採購"],
      relatedForms: ["請購單"],
      approvalAuthorities: [
        { id: "a1", level: "承辦", levelPerson: "林小華", action: "initiate", isNA: false },
        { id: "a2", level: "主管", levelPerson: "陳大明", action: "review", isNA: false },
      ],
      personnel: [
        { id: "p1", role: "需求單位承辦", department: "業務部", currentHolder: "林小華", deputy: "張小美" },
      ],
      reports: [],
    },
  },
  {
    id: "2",
    type: "processNode",
    position: { x: 100, y: 300 },
    data: {
      label: "核決審批",
      nodeType: "decision",
      operatingSystem: "簽核系統",
      signMethod: "paper_sign",
      status: { vacant: true, unsigned: false, paperSign: true, other: "" },
      controlPoints: ["請購金額與預算比對", "非預算項目需專案簽核"],
      keyPoints: ["需比對預算餘額", "超過10萬需處長簽核"],
      risks: ["超額核決", "代簽未留紀錄"],
      relatedForms: ["請購單", "預算對照表"],
      approvalAuthorities: [
        { id: "a3", level: "部門主管", levelPerson: "王小明", amountMax: 100000, action: "approve", isNA: false },
        { id: "a4", level: "處長", levelPerson: "張美玲", amountMin: 100000, amountMax: 1000000, action: "approve", isNA: false },
        { id: "a5", level: "副總", levelPerson: "李大華", amountMin: 1000000, action: "approve", isNA: false },
      ],
      personnel: [
        { id: "p2", role: "部門主管", department: "採購部", currentHolder: "王小明", deputy: "李大華" },
        { id: "p3", role: "處長", department: "管理處", currentHolder: "張美玲", deputy: "陳志偉" },
      ],
      reports: [
        { id: "r1", reportName: "採購金額月報", reportType: "management", frequency: "monthly", deadline: "每月5日前", outputFormat: "Excel", recipient: "財務長" },
      ],
    },
  },
  {
    id: "3",
    type: "processNode",
    position: { x: 100, y: 500 },
    data: {
      label: "採購執行",
      nodeType: "task",
      operatingSystem: "採購模組",
      signMethod: "system_sign",
      status: { vacant: false, unsigned: false, paperSign: false, other: "" },
      controlPoints: ["詢比議價至少三家", "合約條款審查"],
      keyPoints: ["需附比價單"],
      risks: ["圍標", "未依合約付款條件"],
      relatedForms: ["採購單", "比價單", "合約"],
      approvalAuthorities: [
        { id: "a6", level: "採購主管", levelPerson: "趙小剛", action: "approve", isNA: false },
      ],
      personnel: [
        { id: "p4", role: "採購人員", department: "採購部", currentHolder: "趙小剛" },
      ],
      reports: [],
    },
  },
  {
    id: "4",
    type: "processNode",
    position: { x: 100, y: 700 },
    data: {
      label: "進入驗收流程",
      nodeType: "end",
      operatingSystem: undefined,
      signMethod: undefined,
      status: { vacant: false, unsigned: false, paperSign: false, other: "" },
      controlPoints: [],
      keyPoints: [],
      risks: [],
      relatedForms: [],
      approvalAuthorities: [],
      personnel: [],
      reports: [],
    },
  },
];

const DEMO_EDGES: Edge[] = [
  { id: "e1-2", source: "1", target: "2", ...defaultEdgeOptions },
  { id: "e2-3", source: "2", target: "3", ...defaultEdgeOptions },
  { id: "e3-4", source: "3", target: "4", ...defaultEdgeOptions },
];

interface FSCState {
  // Flow
  nodes: Node<ProcessNodeData>[];
  edges: Edge[];
  currentProcessName: string;
  onNodesChange: OnNodesChange<Node<ProcessNodeData>>;
  onEdgesChange: OnEdgesChange;
  onConnect: (connection: Connection) => void;
  setCurrentProcessName: (name: string) => void;

  // Selection
  selectedNodeId: string | null;
  setSelectedNodeId: (id: string | null) => void;
  selectedEdgeId: string | null;
  setSelectedEdgeId: (id: string | null) => void;
  updateEdgeLabel: (edgeId: string, label: string) => void;

  // Detail panel
  detailPreferences: DetailPreferences;
  setDetailPreferences: (prefs: Partial<DetailPreferences>) => void;
  detailPanelOpen: boolean;
  setDetailPanelOpen: (open: boolean) => void;

  // Edit mode
  editMode: boolean;
  setEditMode: (on: boolean) => void;
  editDraft: Partial<ProcessNodeData> | null;  // unsaved changes for selected node
  setEditDraft: (draft: Partial<ProcessNodeData> | null) => void;
  saveEditDraft: () => void;
  discardEditDraft: () => void;

  // Sidebar
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;

  // Node operations
  updateNodeData: (nodeId: string, data: Partial<ProcessNodeData>) => void;
  addNode: () => void;
  deleteNode: (nodeId: string) => void;

  // Layout
  autoLayout: () => void;

  // Operation log
  operationLogs: OperationLog[];
  addLog: (action: string, detail: string, nodeId?: string, changes?: OperationLog["changes"]) => void;
  clearLogs: () => void;
  loggingEnabled: boolean;
  setLoggingEnabled: (enabled: boolean) => void;

  // Version snapshots
  snapshots: FlowSnapshot[];
  saveSnapshot: (label?: string) => void;
  restoreSnapshot: (id: string) => void;
  deleteSnapshot: (id: string) => void;

  // Import/Export
  importJSON: (json: { nodes: Node<ProcessNodeData>[]; edges: Edge[]; processName?: string }) => void;
  exportJSON: () => { nodes: Node<ProcessNodeData>[]; edges: Edge[]; processName: string };

  // Role
  currentRole: Role;
  setCurrentRole: (role: Role) => void;
  canEdit: () => boolean;
  canComment: () => boolean;
  canManage: () => boolean;

  // Comments
  comments: Comment[];
  addComment: (targetId: string, targetType: "node" | "edge", content: string) => void;
  deleteComment: (commentId: string) => void;
  getComments: (targetId: string) => Comment[];
}

export const useFSCStore = create<FSCState>()(
  persist(
    (set, get) => ({
      nodes: DEMO_NODES,
      edges: DEMO_EDGES,
      currentProcessName: "採購循環-請購至驗收",

      onNodesChange: (changes) => {
        set({ nodes: applyNodeChanges(changes, get().nodes) as Node<ProcessNodeData>[] });
      },
      onEdgesChange: (changes) => {
        set({ edges: applyEdgeChanges(changes, get().edges) });
      },
      onConnect: (connection) => {
        set({
          edges: addEdge(
            { ...connection, ...defaultEdgeOptions },
            get().edges
          ),
        });
      },
      setCurrentProcessName: (name) => set({ currentProcessName: name }),

      selectedNodeId: null,
      setSelectedNodeId: (id) => set({
        selectedNodeId: id,
        selectedEdgeId: null,
        detailPanelOpen: id !== null,
        editDraft: null,
      }),
      selectedEdgeId: null,
      setSelectedEdgeId: (id) => set({ selectedEdgeId: id, selectedNodeId: null, detailPanelOpen: false }),
      updateEdgeLabel: (edgeId, label) =>
        set((state) => ({
          edges: state.edges.map((e) =>
            e.id === edgeId ? { ...e, label: label || undefined } : e
          ),
        })),

      detailPreferences: DEFAULT_DETAIL_PREFERENCES,
      setDetailPreferences: (prefs) =>
        set((state) => ({
          detailPreferences: { ...state.detailPreferences, ...prefs },
        })),
      detailPanelOpen: false,
      setDetailPanelOpen: (open) => set({ detailPanelOpen: open }),

      // Edit mode
      editMode: false,
      setEditMode: (on) => set({ editMode: on, editDraft: null }),
      editDraft: null,
      setEditDraft: (draft) => set({ editDraft: draft }),

      saveEditDraft: () => {
        const { selectedNodeId, editDraft, nodes, loggingEnabled } = get();
        if (!selectedNodeId || !editDraft) return;

        const node = nodes.find((n) => n.id === selectedNodeId);
        if (!node) return;
        const oldData = node.data as unknown as ProcessNodeData;

        // Compute changes for log
        const changes: OperationLog["changes"] = [];
        for (const key of Object.keys(editDraft) as (keyof ProcessNodeData)[]) {
          const oldVal = JSON.stringify(oldData[key]);
          const newVal = JSON.stringify(editDraft[key]);
          if (oldVal !== newVal) {
            changes.push({
              field: String(key),
              from: typeof oldData[key] === "object" ? oldVal : String(oldData[key] ?? ""),
              to: typeof editDraft[key] === "object" ? newVal : String(editDraft[key] ?? ""),
            });
          }
        }

        if (changes.length === 0) {
          set({ editDraft: null });
          return;
        }

        // Apply
        set((state) => ({
          nodes: state.nodes.map((n) =>
            n.id === selectedNodeId ? { ...n, data: { ...n.data, ...editDraft } } : n
          ),
          editDraft: null,
        }));

        // Log
        if (loggingEnabled) {
          get().addLog(
            "node.update",
            `更新節點「${oldData.label}」：${changes.map((c) => c.field).join("、")}`,
            selectedNodeId,
            changes
          );
        }
      },

      discardEditDraft: () => set({ editDraft: null }),

      sidebarCollapsed: false,
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

      updateNodeData: (nodeId, data) =>
        set((state) => ({
          nodes: state.nodes.map((n) =>
            n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n
          ),
        })),

      addNode: () => {
        const id = String(Date.now());
        const newNode: Node<ProcessNodeData> = {
          id,
          type: "processNode",
          position: { x: 200, y: 200 },
          data: {
            label: "新節點",
            nodeType: "task",
            status: { vacant: false, unsigned: false, paperSign: false, other: "" },
            controlPoints: [],
            keyPoints: [],
            risks: [],
            relatedForms: [],
            approvalAuthorities: [],
            personnel: [],
            reports: [],
          },
        };
        set((state) => ({
          nodes: [...state.nodes, newNode],
          selectedNodeId: id,
          detailPanelOpen: true,
          editMode: true,
          editDraft: { label: "新節點" },
        }));

        if (get().loggingEnabled) {
          get().addLog("node.add", "新增節點", id);
        }
      },

      deleteNode: (nodeId) => {
        const node = get().nodes.find((n) => n.id === nodeId);
        const label = node ? (node.data as unknown as ProcessNodeData).label : nodeId;

        set((state) => ({
          nodes: state.nodes.filter((n) => n.id !== nodeId),
          edges: state.edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
          selectedNodeId: state.selectedNodeId === nodeId ? null : state.selectedNodeId,
          detailPanelOpen: state.selectedNodeId === nodeId ? false : state.detailPanelOpen,
          editDraft: null,
        }));

        if (get().loggingEnabled) {
          get().addLog("node.delete", `刪除節點「${label}」`, nodeId);
        }
      },

      autoLayout: () => {
        const { nodes, edges } = get();
        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(nodes, edges);
        set({ nodes: layoutedNodes as Node<ProcessNodeData>[], edges: layoutedEdges });
      },

      // Operation logs
      operationLogs: [],
      loggingEnabled: true,

      addLog: (action, detail, nodeId, changes) => {
        const log: OperationLog = {
          id: String(Date.now()) + Math.random().toString(36).slice(2, 6),
          timestamp: Date.now(),
          action,
          detail,
          nodeId,
          changes,
        };
        set((state) => ({
          operationLogs: [log, ...state.operationLogs].slice(0, 200), // keep last 200
        }));
      },
      clearLogs: () => set({ operationLogs: [] }),
      setLoggingEnabled: (enabled) => set({ loggingEnabled: enabled }),

      // Version snapshots
      snapshots: [],

      saveSnapshot: (label) => {
        const { nodes, edges, currentProcessName } = get();
        const snap: FlowSnapshot = {
          id: String(Date.now()),
          timestamp: Date.now(),
          label: label || `${currentProcessName} - ${new Date().toLocaleString("zh-TW")}`,
          nodes: JSON.parse(JSON.stringify(nodes)),
          edges: JSON.parse(JSON.stringify(edges)),
        };
        set((state) => ({ snapshots: [snap, ...state.snapshots].slice(0, 50) }));

        if (get().loggingEnabled) {
          get().addLog("flow.snapshot", `建立版本快照「${snap.label}」`);
        }
      },

      restoreSnapshot: (id) => {
        const snap = get().snapshots.find((s) => s.id === id);
        if (!snap) return;
        set({
          nodes: JSON.parse(JSON.stringify(snap.nodes)),
          edges: JSON.parse(JSON.stringify(snap.edges)),
          selectedNodeId: null,
          detailPanelOpen: false,
          editDraft: null,
        });

        if (get().loggingEnabled) {
          get().addLog("flow.restore", `還原版本「${snap.label}」`);
        }
      },

      deleteSnapshot: (id) =>
        set((state) => ({ snapshots: state.snapshots.filter((s) => s.id !== id) })),

      importJSON: (json) => {
        set({
          nodes: json.nodes,
          edges: json.edges,
          ...(json.processName ? { currentProcessName: json.processName } : {}),
        });
        if (get().loggingEnabled) {
          get().addLog("flow.import", "匯入 JSON 流程圖");
        }
      },
      exportJSON: () => ({
        nodes: get().nodes,
        edges: get().edges,
        processName: get().currentProcessName,
      }),

      // Role
      currentRole: "admin" as Role,
      setCurrentRole: (role) => set({ currentRole: role }),
      canEdit: () => ROLE_PERMISSIONS[get().currentRole].canEdit,
      canComment: () => ROLE_PERMISSIONS[get().currentRole].canComment,
      canManage: () => ROLE_PERMISSIONS[get().currentRole].canManage,

      // Comments
      comments: [],
      addComment: (targetId, targetType, content) => {
        const comment: Comment = {
          id: String(Date.now()) + Math.random().toString(36).slice(2, 6),
          targetId,
          targetType,
          author: get().currentRole === "admin" ? "管理員" : "使用者",
          content,
          timestamp: Date.now(),
        };
        set((state) => ({ comments: [comment, ...state.comments] }));

        if (get().loggingEnabled) {
          get().addLog(
            "comment.add",
            `在${targetType === "node" ? "節點" : "連線"}新增意見：${content.slice(0, 30)}`,
            targetType === "node" ? targetId : undefined
          );
        }
      },
      deleteComment: (commentId) =>
        set((state) => ({ comments: state.comments.filter((c) => c.id !== commentId) })),
      getComments: (targetId) => get().comments.filter((c) => c.targetId === targetId),
    }),
    {
      name: "fsc-store",
      version: 2,
      migrate: (persisted, version) => {
        const state = persisted as Record<string, unknown>;
        if (version < 2) {
          // Add fields introduced in v2
          if (!state.currentRole) state.currentRole = "admin";
          if (!state.comments) state.comments = [];
        }
        return state as unknown as FSCState;
      },
      partialize: (state) => ({
        nodes: state.nodes,
        edges: state.edges,
        currentProcessName: state.currentProcessName,
        detailPreferences: state.detailPreferences,
        sidebarCollapsed: state.sidebarCollapsed,
        operationLogs: state.operationLogs,
        snapshots: state.snapshots,
        loggingEnabled: state.loggingEnabled,
        currentRole: state.currentRole,
        comments: state.comments,
      }),
      storage: {
        getItem: (name) => {
          try { const v = localStorage.getItem(name); return v ? JSON.parse(v) : null; }
          catch { return null; }
        },
        setItem: (name, value) => {
          try { localStorage.setItem(name, JSON.stringify(value)); }
          catch { /* ignore */ }
        },
        removeItem: (name) => {
          try { localStorage.removeItem(name); }
          catch { /* ignore */ }
        },
      },
    }
  )
);
