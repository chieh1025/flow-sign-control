// FSC 核心資料型別

export type SignMethod = "system_sign" | "paper_sign" | "both";
export type NodeType = "start" | "end" | "task" | "decision" | "connector";
export type ApprovalAction = "initiate" | "review" | "approve";
export type ReportType = "management" | "statutory" | "internal_form";
export type Frequency = "realtime" | "daily" | "weekly" | "monthly" | "quarterly" | "yearly";

export interface NodeStatus {
  vacant: boolean;      // 缺人
  unsigned: boolean;    // 未簽
  paperSign: boolean;   // 紙本簽
  other: string;        // 其他（自填）
}

export interface ApprovalAuthority {
  id: string;
  level: string;          // "部門主管"
  levelPerson: string;    // "王小明"
  amountMin?: number;
  amountMax?: number;
  action: ApprovalAction; // 立/審/決
  conditions?: string;
  isNA: boolean;
}

export interface PersonnelAssignment {
  id: string;
  role: string;           // "採購主管"
  department: string;
  currentHolder: string;  // "王小明"
  deputy?: string;        // "李大華"
  contactInfo?: string;
  effectiveDate?: string;
}

export interface ReportSchedule {
  id: string;
  reportName: string;     // "採購金額月報"
  reportType: ReportType;
  frequency: Frequency;
  deadline?: string;      // "每月5日前"
  outputFormat?: string;  // "Excel"
  recipient?: string;     // "財務長"
}

export interface ProcessNodeData {
  [key: string]: unknown;
  label: string;
  nodeType: NodeType;
  operatingSystem?: string;   // 操作系統（從基本設定選）
  signMethod?: SignMethod;
  status: NodeStatus;
  controlPoints: string[];    // 內控重點
  keyPoints: string[];        // 作業重點
  risks: string[];
  relatedForms: string[];
  approvalAuthorities: ApprovalAuthority[];
  personnel: PersonnelAssignment[];
  reports: ReportSchedule[];
  sourceDocRefs?: string;
}

export interface Connector {
  id: string;
  fromProcessId: string;
  fromNodeId: string;
  toProcessId: string;
  toNodeId: string;
  label: string;
}

export interface Process {
  id: string;
  cycleId: string;
  name: string;
  order: number;
  version: number;
}

export interface Cycle {
  id: string;
  name: string;
  description?: string;
  order: number;
  status: "active" | "archived";
  processes: Process[];
}

// --- Roles ---
export type Role = "viewer" | "editor" | "commenter" | "admin";

export interface RolePermissions {
  canView: boolean;
  canEdit: boolean;
  canComment: boolean;
  canManage: boolean;  // admin: logs, snapshots, import/export, role config
}

export const ROLE_PERMISSIONS: Record<Role, RolePermissions> = {
  viewer:    { canView: true,  canEdit: false, canComment: false, canManage: false },
  commenter: { canView: true,  canEdit: false, canComment: true,  canManage: false },
  editor:    { canView: true,  canEdit: true,  canComment: true,  canManage: false },
  admin:     { canView: true,  canEdit: true,  canComment: true,  canManage: true  },
};

export const ROLE_LABELS: Record<Role, string> = {
  viewer: "檢視",
  commenter: "意見",
  editor: "編輯",
  admin: "管理",
};

// --- Comments ---
export interface Comment {
  id: string;
  targetId: string;           // node id or edge id
  targetType: "node" | "edge";
  author: string;
  content: string;
  timestamp: number;
}

// 詳情面板顯示偏好
export interface DetailPreferences {
  operatingSystem: boolean;
  signMethod: boolean;
  approvalAuthority: boolean;
  keyPoints: boolean;
  currentStatus: boolean;
  risks: boolean;
  personnel: boolean;
  reports: boolean;
  relatedForms: boolean;
}

export const DEFAULT_DETAIL_PREFERENCES: DetailPreferences = {
  operatingSystem: true,
  signMethod: true,
  approvalAuthority: true,
  keyPoints: true,
  currentStatus: true,
  risks: false,
  personnel: false,
  reports: false,
  relatedForms: false,
};
