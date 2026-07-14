# 📦 GAS 專案檔案說明

這個資料夾包含了 Google Apps Script (GAS) 專案的所有程式碼檔案，已經過模組化重構，更易於管理和維護。

---

## 📁 檔案結構

```
GAS專案檔案/
├── 主程式.gs (7.7KB)           # 主要邏輯和入口函數 ✅
├── AI處理.gs (7.6KB)          # AI API 呼叫處理 ✅
├── 模板_教學步驟式.gs (11KB)   # 教學步驟式模板（參考範本.html）✅
├── 模板_現代雙欄式.gs (12KB)   # 現代雙欄式模板（參考範本1.html）✅
├── 模板_經典全屏式.gs (11KB)   # 經典全屏式模板 ✅
├── 工具函數.gs (3.5KB)        # 共用工具函數 ✅
└── README.md (4.3KB)         # 本文件
```

**🎉 所有檔案已完成！共 7 個檔案，總計約 57KB**

---

## 🚀 部署步驟

### 步驟 1：建立 Google Apps Script 專案

1. 前往 [Google Apps Script](https://script.google.com/)
2. 點擊「新專案」建立新的 Apps Script 專案
3. 將專案命名為「AI簡報生成系統」

### 步驟 2：上傳程式碼檔案

Google Apps Script 支援多個 `.gs` 檔案，請按照以下順序上傳：

1. 點擊專案中的「+」→「指令碼」
2. 將檔案內容複製貼上，並命名對應的檔案名稱（不含 `.gs`）：
   - `主程式`
   - `AI處理`
   - `模板_教學步驟式`
   - `模板_現代雙欄式`
   - `模板_經典全屏式`
   - `工具函數`

**注意：** 檔案名稱不能包含空格，GAS 會自動處理中文檔名

### 步驟 3：設定 Google Sheets（記錄用）

1. 建立一個新的 Google Sheets
2. 複製 Sheets 的 ID（在網址列中）
   ```
   https://docs.google.com/spreadsheets/d/[這裡就是ID]/edit
   ```
3. 在 `主程式.gs` 中，將 `SHEET_ID` 替換成您的 Sheets ID：
   ```javascript
   const SHEET_ID = "您的Google_Sheets_ID";
   ```

### 步驟 4：部署為網頁應用程式

1. 點擊「部署」→「新增部署作業」
2. 選擇「網頁應用程式」
3. 設定：
   - **執行身分：**我
   - **具有存取權的使用者：**任何人
4. 點擊「部署」
5. **複製產生的「網頁應用程式網址」**

### 步驟 5：更新 Flask 應用程式

編輯 `app.py` 檔案，將 GAS 網址填入：

```python
GAS_URL = "https://script.google.com/macros/s/YOUR_ID/exec"
```

---

## 🎨 模板特色

### 1. 教學步驟式模板
- 參考：範本.html
- 特色：進度指示器、流暢動畫、卡片式設計
- 適合：教學簡報、操作指南

### 2. 現代雙欄式模板
- 參考：範本1.html
- 特色：漸層背景、雙欄佈局、響應式設計
- 適合：商務簡報、產品介紹

### 3. 經典全屏式模板
- 特色：全屏展示、簡潔大方
- 適合：學術報告、演講簡報

---

## ⚙️ 設定說明

### API Key 設定

在 Flask 前端輸入您的 AI API Key：
- **Gemini API：** 前往 [Google AI Studio](https://aistudio.google.com/app/apikey) 取得
- **OpenAI API：** 前往 [OpenAI Platform](https://platform.openai.com/api-keys) 取得

### 色彩主題

系統提供 5 種色彩主題：
- `blue` - 藍色系（預設）
- `warm` - 暖色系
- `corporate` - 企業色
- `dark` - 深色系
- `bright` - 亮色系

---

## 🧪 測試

在 GAS 編輯器中執行 `testGeneration` 函數來測試：

1. 在 `主程式.gs` 中找到 `testGeneration` 函數
2. 更新測試資料中的 `apiKey`
3. 點擊「執行」→ 選擇 `testGeneration`
4. 檢查「執行記錄」查看結果

---

## 📝 注意事項

1. **API Key 安全：** 請勿將 API Key 公開到網路上
2. **GAS 限制：** Google Apps Script 有執行時間限制（6分鐘）
3. **檔案大小：** 生成的 HTML 檔案不應超過 50MB
4. **更新部署：** 修改程式碼後，需要重新部署才會生效

---

## 🔄 更新部署

當您修改程式碼後：

1. 點擊「部署」→「管理部署作業」
2. 點擊現有部署旁的編輯圖示
3. 在「版本」下拉選單選擇「新版本」
4. 點擊「部署」

---

## 👨‍💻 作者資訊

**建置者：曾慶良（阿亮老師）**

- 🔗 [Facebook](https://www.facebook.com/iddmail)
- 📺 [YouTube](https://www.youtube.com/@Liang-yt02)
- 🌐 [AI 小幫手](https://thisnote.space/)

---

## 📄 授權

本專案為開源專案，歡迎自由使用、修改和分享。

---

## 🙏 致謝

感謝所有使用本系統的朋友們！如果這個專案對您有幫助，歡迎分享給更多人使用。
