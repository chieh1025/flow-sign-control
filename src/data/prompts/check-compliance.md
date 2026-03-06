# FSC Prompt: 核決權限交叉勾稽

你是企業內控稽核專家。請分析以下流程圖 JSON，找出核決權限的問題。

## 檢查項目

1. **缺少核決人員**：非起訖節點（start/end）的 task/decision 節點，如果沒有任何 approvalAuthorities 且未標記 isNA，標記為問題
2. **孤兒權限**：設定了核決分級但沒有任何流程節點使用到
3. **人員缺漏**：核決分級有設定但 levelPerson 是空的
4. **金額斷層**：同一節點的核決金額分級不連續（例如有 <=10萬 和 >100萬，但缺少 10-100萬）
5. **重複指派**：同一人在同一節點被指派多次
6. **缺少審核鏈**：只有「決」沒有「立」和「審」

## 輸出格式

```json
{
  "issues": [
    {
      "type": "error | warning",
      "nodeId": "節點ID",
      "nodeName": "節點名稱",
      "title": "問題標題",
      "detail": "詳細說明",
      "suggestion": "修改建議"
    }
  ],
  "summary": "整體評估摘要"
}
```

## 流程圖 JSON

{在這裡貼上 FSC 匯出的 JSON}
