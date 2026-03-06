# FSC - Flow Sign Control
# 企業營運流程簽核控制系統

## 專案定位

- 企業內控流程視覺化 + 核決權限管理 + 交叉勾稽
- 先包進 MOS（米哥營運系統），之後獨立拆出販賣
- 使用者：米哥（管理員）、部門主管（編輯）、一般同仁（檢視）

---

## 技術棧

| 層 | 技術 |
|---|---|
| 前端 | Next.js + shadcn/ui + React Flow (Dagre 自動佈局) |
| 後端 | FastAPI (Python) |
| 資料庫 | PostgreSQL (JSONB) |
| AI | 內建 prompt 模板，不綁定特定 LLM |
| 部署 | Zeabur |

### 前端選型理由
- React Flow 原生 React，節點就是 React 元件
- shadcn/ui 可完全客製，現代風格
- Next.js 生態大，FSC 獨立賣時直接帶走
- MOS 的 CRUD 頁面也用 Next.js + shadcn，統一維護

### 後端選型理由
- FastAPI 與 MOS/DOS 共用，一個後端
- Python 文件解析生態最強（pdfplumber, pymupdf）
- Claude/GPT Python SDK 最成熟
- 未來 RAG (pgvector) 工具鏈完整

---

## 畫面佈局（三區域，右側可收合）

```
+----------+-------------------------+--------------+
|          |                         |              |
| 功能選單  |       主內容區           |  詳情面板     |
|          |                         | （可收合）    |
| > 儀表板  |  流程圖畫布 / 權限表格    |  核決權限     |
| > 流程管理 |  / 設定表單              |  控制重點     |
| > 核決權限 |                         |  簽核人      |
| > 警示中心 |                         |  現況        |
| > 基本設定 |                         |  ...        |
| > 後台管理 |                         |              |
+----------+-------------------------+--------------+
```

- 流程圖頁面：三區域（左選單 + 中間畫布 + 右側節點詳情）
- 核決權限頁面：三區域（左選單 + 中間表格 + 右側展開）
- 基本設定頁面：兩區域（右側收起）
- 功能選單：後台可設定名稱、順序、顯示/隱藏

---

## 功能選單（預設）

| 順序 | 名稱 | 說明 |
|------|------|------|
| 1 | 儀表板 | 循環總覽、警示摘要 |
| 2 | 流程管理 | 循環 > 流程 > 畫布編輯 |
| 3 | 核決權限 | 權限分級總表 + 交叉勾稽 |
| 4 | 人員對照 | 角色 > 實際簽核人 |
| 5 | 報表時程 | 日曆視圖 |
| 6 | 警示中心 | 所有勾稽異常 |
| 7 | 基本設定 | 部門/人員/職稱/系統清單/核決金額級距 |
| 8 | 後台管理 | 權限/API 開關/匯入匯出/選單設定 |

---

## 資料模型

### 層級結構
```
Cycle（循環）
  > Process（流程）
    > ProcessNode（節點）
      > ApprovalAuthority（核決權限）
      > PersonnelAssignment（簽核人/經手人）
      > ReportSchedule（對應報表時程）
    > Connector（流程間跳轉）
```

### Cycle 循環
| 欄位 | 型別 | 說明 |
|------|------|------|
| id | UUID | 主鍵 |
| name | string | "採購及付款循環" |
| description | text | 循環說明 |
| order | int | 排序 |
| status | enum | active / archived |

### Process 流程
| 欄位 | 型別 | 說明 |
|------|------|------|
| id | UUID | 主鍵 |
| cycle_id | FK | > Cycle |
| name | string | "請購流程" |
| order | int | 在循環中的順序 |
| version | int | 版本號 |
| layout_data | JSON | React Flow viewport 狀態 |

### ProcessNode 流程節點
| 欄位 | 型別 | 說明 |
|------|------|------|
| id | UUID | 主鍵 |
| process_id | FK | > Process |
| name | string | "核決審批" |
| type | enum | start / end / task / decision / connector |
| position_x | float | 畫布座標 |
| position_y | float | 畫布座標 |
| operating_system | string | 操作系統（從基本設定選） |
| sign_method | enum | system_sign / paper_sign / both |
| control_points | text[] | 內控重點（多筆） |
| key_points | text[] | 作業重點 |
| risks | text[] | 風險說明 |
| related_forms | text[] | 相關表單 |
| source_doc_refs | JSON | AI 抽取時的原文出處 |

### ProcessNode 現況（多選）
| 欄位 | 型別 | 說明 |
|------|------|------|
| status_vacant | boolean | 缺人 |
| status_unsigned | boolean | 未簽 |
| status_paper | boolean | 紙本簽 |
| status_other | string | 其他（自填） |

### ApprovalAuthority 核決權限
| 欄位 | 型別 | 說明 |
|------|------|------|
| id | UUID | 主鍵 |
| node_id | FK | > ProcessNode |
| level | string | "部門主管" |
| level_person | string | "王小明"（實際人員） |
| amount_min | decimal | 金額下限 |
| amount_max | decimal | 金額上限 |
| action | enum | initiate(立) / review(審) / approve(決) |
| conditions | text | 特殊條件 |
| is_na | boolean | 不適用（設為 N/A） |

### PersonnelAssignment 簽核人/經手人
| 欄位 | 型別 | 說明 |
|------|------|------|
| id | UUID | 主鍵 |
| node_id | FK | > ProcessNode |
| role | string | 制度角色 "採購主管" |
| department | string | 部門 |
| current_holder | string | 實際人員 "王小明" |
| deputy | string | 代理人 "李大華" |
| contact_info | string | 分機 / email |
| effective_date | date | 生效日 |

### ReportSchedule 對應報表時程
| 欄位 | 型別 | 說明 |
|------|------|------|
| id | UUID | 主鍵 |
| node_id | FK | > ProcessNode |
| report_name | string | "採購金額月報" |
| report_type | enum | management / statutory / internal_form |
| frequency | enum | realtime / daily / weekly / monthly / quarterly / yearly |
| deadline | string | "每月5日前" |
| output_format | string | "Excel" / "ERP" / "紙本" |
| recipient | string | "財務長" / "稽核室" |

### Connector 流程間跳轉
| 欄位 | 型別 | 說明 |
|------|------|------|
| id | UUID | 主鍵 |
| from_process_id | FK | 來源流程 |
| from_node_id | FK | 來源節點（End Point） |
| to_process_id | FK | 目標流程 |
| to_node_id | FK | 目標節點（Start Point） |
| label | string | "> 進入驗收流程" |

### AuditLog 操作日誌
| 欄位 | 型別 | 說明 |
|------|------|------|
| id | UUID | 主鍵 |
| user_id | FK | 操作人 |
| entity_type | string | node / process / cycle |
| entity_id | UUID | 被操作對象 |
| action | enum | create / update / delete |
| diff | JSON | 變更前後差異 |
| timestamp | datetime | 操作時間 |

### ProcessVersion 版本控制
| 欄位 | 型別 | 說明 |
|------|------|------|
| id | UUID | 主鍵 |
| process_id | FK | > Process |
| version | int | 版本號 |
| snapshot | JSON | 整張流程圖完整快照 |
| change_summary | text | 變更摘要 |
| created_by | FK | 誰建立的版本 |
| created_at | datetime | 建立時間 |

---

## 節點 UI 設計

### 小標籤系統（Badge）
| 標籤 | 顏色 | 來源 |
|------|------|------|
| {操作系統名} | 藍色 | 操作系統欄位（採購模組/POS/...） |
| 系統簽 | 綠色 | 簽核方式 = system_sign |
| 紙本簽 | 橘色 | 簽核方式 = paper_sign |
| 缺人 | 紅色 | 現況.缺人 = true |
| 未簽 | 黃色 | 現況.未簽 = true |
| 紙本簽(現況) | 灰色 | 現況.紙本簽 = true |
| {其他} | 灰色 | 現況.其他 |

### 精簡模式（預設）
```
+------------------------------+
| [採購模組] [紙本簽] [缺人]     |
| 核決審批                       |
| > <=10萬 部門主管（王小明）     |
+------------------------------+
```

### 展開/側邊欄
```
核決審批

操作系統：採購模組
簽核方式：紙本簽
現況：    缺人、未簽

核決權限：
  <=10萬   部門主管（王小明）  立>審>決
  10-100萬 處長（張美玲）     立>審>決
  >100萬   副總（李大華）     立>審>決

作業重點：需比對預算餘額
風險：超額核決、代簽未留紀錄
```

### 詳情面板顯示項目（使用者可勾選）
```
偏好設定：
 [v] 操作系統
 [v] 簽核方式
 [v] 核決權限
 [v] 作業重點
 [v] 現況
 [ ] 風險
 [ ] 簽核人/經手人
 [ ] 對應報表
 [ ] 相關文件
```
偏好存在使用者帳號，下次登入維持。
勾選也連動節點上的小標籤顯示。

---

## 操作系統選項（基本設定可管理）

### 預設選項
- 採購模組
- 庫存模組
- 總帳模組
- 成本模組
- 固資模組
- 簽核系統
- POS
- 生管模組
- 銷售模組
- 人資模組
- 品管模組
- 配送系統
- 電商平台
- 紙本
- 其他

後台可新增/刪除/改名/排序。

---

## 簽核方式

| 選項 | 說明 |
|------|------|
| 系統簽 | 在 ERP/簽核系統內電子簽核 |
| 紙本簽 | 實體紙本簽核 |
| 兩者並行 | 系統簽 + 紙本簽都要 |

---

## 流程起始節點

不固定為申請人，使用者自訂。提供預設範本：

| 範本 | 起始節點 |
|------|----------|
| 一般簽核 | 申請人 |
| 系統觸發 | ERP 自動產生 |
| 外部來件 | 客戶/廠商 |
| 定期作業 | 排程觸發 |

---

## 警示 & 交叉勾稽

### 流程圖 > 核決權限
| 警示 | 說明 |
|------|------|
| 節點無核決人員 | 節點標紅，除非設為 N/A |
| 核決分級無對應人員 | ">100萬 副總" 但副總欄位是空的 |

### 核決權限 > 流程圖（反向勾稽）
| 警示 | 說明 |
|------|------|
| 孤兒權限 | 設了某分級但沒有流程節點用到 |
| 孤兒人員 | 設了某人為簽核人但沒有節點指派 |

### 核決分級展開檢視
每個分級可展開看有哪些流程節點掛在這個分級下。

---

## AI 整合（非必要，漸進式）

### 模式 A：免費（主要模式）
- 匯入 JSON + 手動建流程 + 手動微調
- 同仁日常使用零 AI 費用

### 模式 B：內建 prompt（省 token）
- FSC 內建 prompt 模板
- 使用者按「產生 Prompt」> 複製到 Web Claude / 貼給 Claude Code
- Claude 回傳 JSON > 貼回 FSC 匯入
- 或 Claude Code 直接讀 prompt 模板 + 寫入 JSON 檔
- 零 API 費用（用 Web Claude 月費 / Claude Code 現有訂閱）

### 模式 C：接 API（選配）
- 後台開關控制
- 支援多 provider（Claude / GPT / Ollama / Gemini）
- adapter 模式切換

### Prompt 模板
```
prompts/
  parse-flow.md           文字描述 > 流程圖 JSON
  parse-document.md       PDF 內容 > 流程圖 JSON
  check-compliance.md     比對核決權限 > 問題清單
  suggest-flow.md         建議流程改善
```

### JSON 匯入格式
```
fsc-data/
  cycles/
    procurement.json      採購到付款循環
  processes/
    purchase-request.json 請購流程
  prompts/
    parse-flow.md         prompt 模板
  templates/
    example.json          範例格式
```

不管誰產的 JSON，只要格式對，FSC 就能讀。

---

## 後台設定

### 基本設定
- 部門架構
- 人員名單
- 職稱層級
- 核決金額級距
- 操作系統清單

### 權限管理
- 角色定義（Admin / Manager / Viewer）
- 人員 > 角色指派
- 部門 > 可見範圍

### 進階設定
- AI API 開關（開/關）+ Provider + API Key
- JSON 匯入（開/關）
- 手動建流程（開/關）
- 功能選單設定（名稱/順序/顯示隱藏）

---

## 使用者操作旅程

### 管理員
1. 登入 > 後台設定 > 建部門架構 > 加人員/職稱 > 設核決金額級距
2. 建立流程圖（三種方式）
   - A. Claude Code 產 JSON > 匯入 FSC
   - B. Web Claude 複製 prompt > 貼回 JSON > 匯入
   - C. 畫布上手動拖拉建節點
3. 微調：點節點 > 側邊欄編輯 > 存檔
4. 發布版本（自動建快照）

### 部門主管
1. 登入 > 看到自己部門相關的流程圖
2. 精簡模式瀏覽 > 點節點看核決權限、簽核人
3. 編輯自己部門的節點（改簽核人/代理人）> 存檔

### 一般同仁
1. 登入 > 看到被授權的流程圖
2. 精簡模式瀏覽 > 點節點展開看詳情
3. 流程 A 結尾點 Connector > 跳到流程 B
4. 匯出 PDF

---

## 核決權限表參考（來自真實資料）

Excel 結構（9 大循環 x sheet）：
- 銷售及收款循環
- 採購及付款循環
- 生產循環
- 薪工循環
- 融資循環
- 不動產、廠房及設備資產循環
- 投資循環
- 電腦化資訊系統處理作業
- 管理控制作業

每個循環：編號 / 作業名稱 / 控制重點 / 權責單位 / 核決層級（立>審>決）

此結構直接對應 FSC 資料模型：
- Sheet（循環）> Cycle
- 作業名稱 > Process
- 控制重點 > ProcessNode
- 核決層級 > ApprovalAuthority
- 權責單位 > PersonnelAssignment

---

## 開發順序

### Phase 1：前端畫布（不需後端）
1. Next.js + shadcn/ui 專案骨架
2. React Flow 基本畫布 + 自定義節點
3. 節點標籤系統（操作系統/簽核方式/現況）
4. 精簡/展開模式切換
5. 側邊欄詳情面板（可勾選顯示項目）
6. JSON 匯入/匯出
7. 內建 prompt 模板
8. 資料暫存 localStorage

### Phase 2：後端 + 持久化
9. FastAPI 骨架 + PostgreSQL schema
10. 基本設定 CRUD（部門/人員/職稱/系統清單）
11. 流程圖 CRUD（Cycle/Process/Node）
12. 核決權限 CRUD + 交叉勾稽警示
13. JWT 登入 + 角色權限

### Phase 3：企業功能
14. 核決權限總表（表格 view，立>審>決 互動）
15. Connector 流程間跳轉
16. 操作日誌 (AuditLog)
17. 版本控制 (ProcessVersion)
18. 匯出 PDF/Word
19. 警示中心（彙整所有勾稽異常）

### Phase 4：AI + 進階
20. AI adapter（Claude/GPT/Ollama 切換）
21. 報表時程日曆視圖
22. 人員異動管理（統一對照表，自動同步）
23. RAG 向量檢索（pgvector）
24. AI Feedback Loop（修改時合規檢查）
