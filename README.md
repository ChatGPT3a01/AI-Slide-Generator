# 🎨 AI 簡報生成系統

一套完整的 AI 簡報自動生成解決方案，結合 Flask、Google Apps Script 和 AI API（Gemini / OpenAI），能夠根據使用者輸入的主題和需求，自動生成精美的互動式簡報。

---

## ✨ 主要功能

- ✅ **支援多種 AI 服務**：Google Gemini 和 OpenAI GPT
- 🎨 **三種模板風格**：現代雙欄式、教學步驟式、經典全屏式
- ⚙️ **完全自訂**：簡報風格、色彩主題、頁數完全由您決定
- 📱 **互動式簡報**：產生的 HTML 簡報支援鍵盤導航和動畫效果
- 📊 **自動記錄**：整合 Google Sheets 自動記錄生成歷史

---

## 🏗️ 系統架構

```
前端：HTML + CSS + JavaScript
  ↓
後端：Python Flask
  ↓
雲端服務：Google Apps Script
  ↓
AI 引擎：Gemini / OpenAI GPT
  ↓
資料庫：Google Sheets
```

---

## 📁 專案結構

```
AI_生成簡報系統/
│
├── app.py                    # Flask 主程式
├── requirements.txt          # Python 相依套件
├── GAS_code.js              # Google Apps Script 程式碼
│
├── templates/               # Flask 模板資料夾
│   └── index.html          # 主要網頁介面
│
├── static/                  # 靜態資源資料夾
│   ├── style.css           # 網頁樣式
│   └── presentations/      # 生成的簡報儲存位置
│
├── old/                     # 備份資料夾（保留舊版本）
│
├── 使用教學.html            # 完整使用教學（建議從這裡開始）
├── index.html              # 技術文件
└── README.md               # 本文件
```

---

## 🚀 快速開始

### 1. 環境準備

- Python 3.8 或以上版本
- Google 帳號（用於 Apps Script）
- AI API Key（Gemini 或 OpenAI）

### 2. 安裝相依套件

```bash
pip install -r requirements.txt
```

### 3. 設定 Google Apps Script

1. 前往 [Google Apps Script](https://script.google.com/)
2. 建立新專案，將 `GAS_code.js` 內容貼上
3. 部署為網頁應用程式（執行身分：我，存取權：任何人）
4. 複製產生的網址

### 4. 設定 Flask 應用程式

編輯 `app.py`，將 GAS 網址填入：

```python
GAS_URL = "你的GAS網址"  # 替換成您的 GAS 網址
```

### 5. 啟動系統

```bash
python app.py
```

開啟瀏覽器，前往 `http://localhost:5000`

---

## 📚 詳細教學

請開啟 **`使用教學.html`** 檔案，這是一份完整的互動式教學文件，包含：

- 🔧 環境準備
- 🔑 取得 API Key 的詳細步驟
- 💻 本地建置教學
- 📖 使用說明
- ☁️ 雲端部署指南
- ❓ 常見問題 FAQ

---

## 🎯 使用方式

1. **填寫表單**：輸入簡報主題、對象、關鍵字等資訊
2. **選擇 AI 服務**：Gemini（推薦免費）或 OpenAI
3. **選擇生成模式**：
   - 完全由 AI 生成
   - 使用模板（穩定美觀，推薦）
   - 兩種都生成（可比較）
4. **生成簡報**：等待 30-60 秒
5. **預覽/下載**：在瀏覽器中預覽或下載 HTML 檔案

---

## 🌐 雲端部署

### 推薦平台：Render.com（免費）

1. 註冊 [Render.com](https://render.com)
2. 連結 GitHub 帳號
3. 建立 Web Service
4. 設定：
   - Runtime: Python 3
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `python app.py`

### 其他平台

- Heroku（付費，$5/月起）
- PythonAnywhere（有免費方案）
- Railway（有免費額度）

---

## 🔑 API Key 取得

### Google Gemini（推薦）

- ✅ 提供免費額度（每分鐘 15 次請求）
- ✅ 支援繁體中文效果極佳
- 🔗 [前往取得](https://aistudio.google.com/app/apikey)

### OpenAI

- ⚠️ 需要付費使用
- 🔗 [前往取得](https://platform.openai.com/api-keys)

---

## 💡 技術亮點

### 前端技術
- **Tailwind CSS**：快速美觀的 UI 設計
- **JavaScript**：互動式簡報導航
- **響應式設計**：支援手機、平板、電腦

### 後端技術
- **Flask**：輕量級 Python Web 框架
- **RESTful API**：標準化的 API 設計
- **錯誤處理**：完整的異常捕捉機制

### 雲端整合
- **Google Apps Script**：無伺服器運算
- **Google Sheets**：自動記錄生成歷史
- **AI API 整合**：支援多種 AI 服務

---

## ❓ 常見問題

### Q: API Key 要錢嗎？
A: Google Gemini 提供免費額度（每分鐘 15 次請求），個人使用已足夠。OpenAI 需要付費。

### Q: 生成的簡報可以編輯嗎？
A: 可以！下載的 HTML 檔案可以用任何文字編輯器修改。

### Q: 簡報可以匯出成 PowerPoint 嗎？
A: 目前產生 HTML 格式。您可以使用瀏覽器的「列印」功能儲存為 PDF。

### Q: 為什麼生成失敗？
A: 可能原因：
- API Key 無效或過期
- API 額度用完
- 網路連線問題
- GAS 網址設定錯誤

### Q: 可以商業使用嗎？
A: 本專案為開源，您可以自由使用、修改和商業化。但使用 AI API 時需遵守各平台服務條款。

---

## 👨‍💻 作者資訊

**建置者：曾慶良（阿亮老師）**

- 🔗 [Facebook](https://www.facebook.com/iddmail)
- 📺 [YouTube](https://www.youtube.com/@Liang-yt02)
- 🌐 [AI 小幫手平台](https://thisnote.space/)

---

## 📄 授權

本專案為開源專案，歡迎自由使用、修改和分享。

---

## 🙏 致謝

感謝所有使用本系統的朋友們！如果這個專案對您有幫助，歡迎分享給更多人使用。

---

## 📞 技術支援

如需協助，請透過以下方式聯繫：

- 📧 訪問 [阿亮老師 Facebook](https://www.facebook.com/iddmail)
- 🎥 觀看 [YouTube 教學影片](https://www.youtube.com/@Liang-yt02)
- 📖 參考 `使用教學.html` 文件

---

**祝您使用愉快！🎉**
