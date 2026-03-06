# FSC Prompt: 文字描述 → 流程圖 JSON

你是企業內控流程分析師。請將以下描述轉換為 FSC 系統可匯入的 JSON 格式。

## 輸出格式

```json
{
  "nodes": [
    {
      "id": "1",
      "type": "processNode",
      "position": { "x": 100, "y": 100 },
      "data": {
        "label": "節點名稱",
        "nodeType": "start | end | task | decision | connector",
        "operatingSystem": "操作系統名稱（如：採購模組、簽核系統、POS、紙本）",
        "signMethod": "system_sign | paper_sign | both",
        "status": {
          "vacant": false,
          "unsigned": false,
          "paperSign": false,
          "other": ""
        },
        "controlPoints": ["內控重點1", "內控重點2"],
        "keyPoints": ["作業重點1"],
        "risks": ["風險1"],
        "relatedForms": ["相關表單1"],
        "approvalAuthorities": [
          {
            "id": "a1",
            "level": "職級名稱",
            "levelPerson": "實際人員姓名",
            "amountMin": null,
            "amountMax": 100000,
            "action": "initiate | review | approve",
            "conditions": "",
            "isNA": false
          }
        ],
        "personnel": [
          {
            "id": "p1",
            "role": "制度角色",
            "department": "部門",
            "currentHolder": "現任人員",
            "deputy": "代理人",
            "contactInfo": ""
          }
        ],
        "reports": []
      }
    }
  ],
  "edges": [
    {
      "id": "e1-2",
      "source": "1",
      "target": "2",
      "animated": true
    }
  ]
}
```

## 規則

1. 第一個節點的 nodeType 設為 "start"
2. 最後一個節點的 nodeType 設為 "end"
3. 有判斷分支的節點設為 "decision"
4. position.y 每個節點間距 200
5. approvalAuthorities 的 action：提出申請=initiate、審核=review、最終核准=approve
6. 金額用數字（單位：元），例如 10萬 = 100000
7. 如果描述中沒有提到某個欄位，就留空陣列 [] 或空字串 ""

## 使用者描述

{在這裡貼上你的流程描述}
