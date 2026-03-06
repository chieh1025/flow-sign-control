import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  type Node,
  type Edge,
  applyNodeChanges,
  applyEdgeChanges,
  type OnNodesChange,
  type OnEdgesChange,
  MarkerType,
} from "@xyflow/react";
import Dagre from "@dagrejs/dagre";

// --- Types ---
export interface OrgNodeData {
  [key: string]: unknown;
  label: string;
  title?: string;       // 職稱 e.g. "廠長"
  holder?: string;      // 現任 e.g. "江廠長"
  headcount?: number;   // 編制人數
  nodeType: "root" | "division" | "department" | "section" | "position";
}

// --- Layout ---
function getOrgLayout(nodes: Node[], edges: Edge[]) {
  const nodeWidth = 200;
  const nodeHeight = 80;
  const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: "TB", nodesep: 40, ranksep: 80 });

  nodes.forEach((node) => {
    g.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });
  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });

  Dagre.layout(g);

  return nodes.map((node) => {
    const pos = g.node(node.id);
    return { ...node, position: { x: pos.x - nodeWidth / 2, y: pos.y - nodeHeight / 2 } };
  });
}

// --- Default edge style ---
const defaultEdgeOptions = {
  type: "smoothstep" as const,
  markerEnd: { type: MarkerType.ArrowClosed, width: 12, height: 12 },
  style: { strokeWidth: 1.5 },
};

// --- Demo data from 米哥食品 ---
function createNode(id: string, label: string, nodeType: OrgNodeData["nodeType"], extra?: Partial<OrgNodeData>): Node<OrgNodeData> {
  return { id, type: "orgNode", position: { x: 0, y: 0 }, data: { label, nodeType, ...extra } };
}

const DEMO_NODES: Node<OrgNodeData>[] = [
  createNode("chairman", "董事長", "root"),
  createNode("audit", "稽核室", "department"),
  createNode("gm", "總經理", "root"),
  createNode("ops", "營運管理中心", "division", { holder: "陳副總" }),
  createNode("prod", "生產中心", "division", { holder: "江廠長" }),
  createNode("bread", "麵包部", "department"),
  createNode("pastry", "西點部", "department"),
  createNode("pack", "包裝部", "department"),
  createNode("rd", "研發部", "department"),
  createNode("qc", "品管部", "department"),
  createNode("logistics", "物流倉儲部", "department"),
  createNode("biz", "營運部", "department"),
  createNode("training", "教育訓練課", "section"),
  createNode("supervisor", "區督導", "section"),
  createNode("dev", "開發部", "department"),
  createNode("eng", "工務課", "section"),
  createNode("design", "門市設計課", "section"),
  createNode("mkt", "行銷部", "department"),
  createNode("ad", "廣告設計課", "section"),
  createNode("pr", "公關客服課", "section"),
  createNode("hr", "人資部", "department"),
  createNode("doc", "文管課", "section"),
  createNode("finance", "財會部", "department"),
  createNode("acct", "會計", "section"),
  createNode("purchase", "採購課", "section"),
  createNode("ga", "總務", "section"),
  createNode("legal", "法務課", "department"),
];

const DEMO_EDGES: Edge[] = [
  { id: "e-ch-audit", source: "chairman", target: "audit", ...defaultEdgeOptions },
  { id: "e-ch-gm", source: "chairman", target: "gm", ...defaultEdgeOptions },
  { id: "e-gm-ops", source: "gm", target: "ops", ...defaultEdgeOptions },
  { id: "e-gm-prod", source: "gm", target: "prod", ...defaultEdgeOptions },
  // Operations (left side)
  { id: "e-ops-biz", source: "ops", target: "biz", ...defaultEdgeOptions },
  { id: "e-biz-training", source: "biz", target: "training", ...defaultEdgeOptions },
  { id: "e-biz-supervisor", source: "biz", target: "supervisor", ...defaultEdgeOptions },
  { id: "e-ops-dev", source: "ops", target: "dev", ...defaultEdgeOptions },
  { id: "e-dev-eng", source: "dev", target: "eng", ...defaultEdgeOptions },
  { id: "e-dev-design", source: "dev", target: "design", ...defaultEdgeOptions },
  { id: "e-ops-mkt", source: "ops", target: "mkt", ...defaultEdgeOptions },
  { id: "e-mkt-ad", source: "mkt", target: "ad", ...defaultEdgeOptions },
  { id: "e-mkt-pr", source: "mkt", target: "pr", ...defaultEdgeOptions },
  { id: "e-ops-hr", source: "ops", target: "hr", ...defaultEdgeOptions },
  { id: "e-hr-doc", source: "hr", target: "doc", ...defaultEdgeOptions },
  { id: "e-ops-finance", source: "ops", target: "finance", ...defaultEdgeOptions },
  { id: "e-finance-acct", source: "finance", target: "acct", ...defaultEdgeOptions },
  { id: "e-finance-purchase", source: "finance", target: "purchase", ...defaultEdgeOptions },
  { id: "e-finance-ga", source: "finance", target: "ga", ...defaultEdgeOptions },
  { id: "e-ops-legal", source: "ops", target: "legal", ...defaultEdgeOptions },
  // Production (right side)
  { id: "e-prod-bread", source: "prod", target: "bread", ...defaultEdgeOptions },
  { id: "e-prod-pastry", source: "prod", target: "pastry", ...defaultEdgeOptions },
  { id: "e-prod-pack", source: "prod", target: "pack", ...defaultEdgeOptions },
  { id: "e-prod-rd", source: "prod", target: "rd", ...defaultEdgeOptions },
  { id: "e-prod-qc", source: "prod", target: "qc", ...defaultEdgeOptions },
  { id: "e-prod-logistics", source: "prod", target: "logistics", ...defaultEdgeOptions },
];

// Apply initial layout
const layoutedNodes = getOrgLayout(DEMO_NODES, DEMO_EDGES);

// --- Store ---
interface OrgState {
  nodes: Node<OrgNodeData>[];
  edges: Edge[];
  onNodesChange: OnNodesChange<Node<OrgNodeData>>;
  onEdgesChange: OnEdgesChange;
  selectedNodeId: string | null;
  setSelectedNodeId: (id: string | null) => void;
  editMode: boolean;
  setEditMode: (on: boolean) => void;
  updateNodeData: (nodeId: string, data: Partial<OrgNodeData>) => void;
  addNode: (parentId: string) => void;
  deleteNode: (nodeId: string) => void;
  autoLayout: () => void;
}

export const useOrgStore = create<OrgState>()(
  persist(
    (set, get) => ({
      nodes: layoutedNodes as Node<OrgNodeData>[],
      edges: DEMO_EDGES,

      onNodesChange: (changes) => {
        set({ nodes: applyNodeChanges(changes, get().nodes) as Node<OrgNodeData>[] });
      },
      onEdgesChange: (changes) => {
        set({ edges: applyEdgeChanges(changes, get().edges) });
      },

      selectedNodeId: null,
      setSelectedNodeId: (id) => set({ selectedNodeId: id }),

      editMode: false,
      setEditMode: (on) => set({ editMode: on }),

      updateNodeData: (nodeId, data) =>
        set((state) => ({
          nodes: state.nodes.map((n) =>
            n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n
          ),
        })),

      addNode: (parentId) => {
        const id = `org-${Date.now()}`;
        const parent = get().nodes.find((n) => n.id === parentId);
        const newNode: Node<OrgNodeData> = {
          id,
          type: "orgNode",
          position: { x: (parent?.position.x ?? 0) + 50, y: (parent?.position.y ?? 0) + 120 },
          data: { label: "新部門", nodeType: "department" },
        };
        const newEdge: Edge = {
          id: `e-${parentId}-${id}`,
          source: parentId,
          target: id,
          ...defaultEdgeOptions,
        };
        set((state) => ({
          nodes: [...state.nodes, newNode],
          edges: [...state.edges, newEdge],
          selectedNodeId: id,
        }));
      },

      deleteNode: (nodeId) =>
        set((state) => ({
          nodes: state.nodes.filter((n) => n.id !== nodeId),
          edges: state.edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
          selectedNodeId: state.selectedNodeId === nodeId ? null : state.selectedNodeId,
        })),

      autoLayout: () => {
        const { nodes, edges } = get();
        const layouted = getOrgLayout(nodes, edges);
        set({ nodes: layouted as Node<OrgNodeData>[] });
      },
    }),
    {
      name: "org-store",
      partialize: (state) => ({
        nodes: state.nodes,
        edges: state.edges,
      }),
      storage: {
        getItem: (name) => { try { const v = localStorage.getItem(name); return v ? JSON.parse(v) : null; } catch { return null; } },
        setItem: (name, value) => { try { localStorage.setItem(name, JSON.stringify(value)); } catch {} },
        removeItem: (name) => { try { localStorage.removeItem(name); } catch {} },
      },
    }
  )
);
