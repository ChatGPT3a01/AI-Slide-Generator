/**
 * ==========================================================================
 * AI 簡報生成系統 - Google Apps Script 主程式
 * ==========================================================================
 * 版本：4.0（模組化架構，精美模板設計）
 * 建置者：曾慶良（阿亮老師）
 *
 * 功能：
 * 1. 接收 Flask 的簡報需求
 * 2. 呼叫 AI API（Gemini 或 OpenAI）生成內容
 * 3. 提供三種精美模板：教學步驟式、現代雙欄式、經典全屏式
 * 4. 記錄所有生成記錄到 Google Sheets
 *
 * GAS 專案結構：
 * - 主程式.gs（本檔案）- 主要邏輯和入口
 * - AI處理.gs - AI API 呼叫處理
 * - 模板_教學步驟式.gs - 教學步驟式模板
 * - 模板_現代雙欄式.gs - 現代雙欄式模板
 * - 模板_經典全屏式.gs - 經典全屏式模板
 * - 工具函數.gs - 共用工具函數
 * ==========================================================================
 */

// ========================================================================
// 全域設定
// ========================================================================

/**
 * Google Sheets 記錄 ID（請替換成您自己的 Sheets ID）
 * 取得方式：開啟 Google Sheets，網址中的一長串英數字就是 ID
 * 範例：https://docs.google.com/spreadsheets/d/[這裡就是ID]/edit
 */
const SHEET_ID = "請替換成您的Google_Sheets_ID";

// ========================================================================
// 主要處理函數
// ========================================================================

/**
 * doPost - 處理來自 Flask 的 POST 請求
 * 這是整個系統的入口函數
 *
 * @param {Object} e - 事件物件，包含 POST 請求的資料
 * @return {TextOutput} JSON 格式的回應
 */
function doPost(e) {
  try {
    // ========== 步驟 1: 解析接收到的資料 ==========
    let data = {};
    if (e && e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else {
      throw new Error("無法取得資料");
    }

    Logger.log("收到請求資料: " + JSON.stringify(data));

    // ========== 步驟 2: 記錄到 Google Sheets ==========
    logToSheet(data);

    // ========== 步驟 3: 根據生成模式處理 ==========
    const generationMode = data.generationMode || 'ai-full';
    let result = { status: "success" };

    if (generationMode === 'ai-full') {
      // 模式 A: 完全由 AI 生成
      const aiHtml = generateWithAI(data);
      result.html_content = aiHtml;

    } else if (generationMode === 'template') {
      // 模式 B: 使用模板（根據使用者選擇的風格）
      const aiContent = getAIContent(data);
      const templateStyle = data.templateStyle || 'modern';

      if (templateStyle === 'tutorial') {
        // 教學步驟式模板（參考範本.html 的精美設計）
        result.html_content = generateTutorialTemplate(data, aiContent);
      } else if (templateStyle === 'classic') {
        // 經典全屏式模板
        result.html_content = generateClassicTemplate(data, aiContent);
      } else {
        // 現代雙欄式模板（預設）
        result.html_content = generateModernTemplate(data, aiContent);
      }

    } else if (generationMode === 'both') {
      // 模式 C: 兩種都生成
      const aiHtml = generateWithAI(data);
      const aiContent = getAIContent(data);

      // 模板版本根據使用者選擇
      const templateStyle = data.templateStyle || 'modern';
      let templateHtml;

      if (templateStyle === 'tutorial') {
        templateHtml = generateTutorialTemplate(data, aiContent);
      } else if (templateStyle === 'classic') {
        templateHtml = generateClassicTemplate(data, aiContent);
      } else {
        templateHtml = generateModernTemplate(data, aiContent);
      }

      result.ai_html = aiHtml;
      result.template_html = templateHtml;
    }

    // ========== 步驟 4: 回傳結果給 Flask ==========
    Logger.log("成功生成簡報");
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log("錯誤: " + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * doGet - 處理 GET 請求（測試用）
 * 可以用瀏覽器直接訪問 GAS 網址來測試是否部署成功
 */
function doGet() {
  return ContentService.createTextOutput(JSON.stringify({
    status: "success",
    message: "AI 簡報生成系統 API 運作正常",
    version: "4.0",
    author: "曾慶良（阿亮老師）",
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

// ========================================================================
// 資料記錄函數
// ========================================================================

/**
 * logToSheet - 將簡報生成記錄儲存到 Google Sheets
 *
 * @param {Object} data - 包含簡報資訊的物件
 */
function logToSheet(data) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getActiveSheet();

    // 如果是第一次使用，建立表頭
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        '時間',
        '主題',
        '對象',
        '頁數',
        '類型',
        '風格',
        '色彩主題',
        'AI 服務',
        '模型',
        '生成模式',
        '模板風格',
        '作者',
        '組織'
      ]);
    }

    // 記錄資料
    sheet.appendRow([
      new Date(),
      data.topic || '',
      data.audience || '',
      data.pageCount || '',
      data.presentationType || '',
      data.style || '',
      data.colorTheme || '',
      data.aiService || '',
      data.model || '',
      data.generationMode || '',
      data.templateStyle || '',
      data.author || '',
      data.organization || ''
    ]);

    Logger.log("成功記錄到 Google Sheets");
  } catch (error) {
    // 記錄失敗不影響主要功能
    Logger.log("記錄到 Sheets 失敗: " + error.toString());
  }
}

// ========================================================================
// AI 內容生成函數（呼叫 AI處理.gs 中的函數）
// ========================================================================

/**
 * generateWithAI - 完全由 AI 生成 HTML
 * 根據選擇的 AI 服務呼叫對應的 API
 *
 * @param {Object} data - 包含簡報資訊的物件
 * @return {String} AI 生成的 HTML 內容
 */
function generateWithAI(data) {
  if (data.aiService === "gemini") {
    return generateWithGemini(data);
  } else {
    return generateWithOpenAI(data);
  }
}

// ========================================================================
// 測試函數
// ========================================================================

/**
 * testGeneration - 測試簡報生成功能
 * 在 GAS 編輯器中執行此函數來測試
 */
function testGeneration() {
  const testData = {
    aiService: "gemini",
    apiKey: "測試用_請替換成真實的API_Key",
    model: "gemini-3.5-flash",
    generationMode: "template",
    templateStyle: "tutorial",
    topic: "AI 在教育的應用",
    audience: "教師和學生",
    keywords: "AI, 教育, 創新, 科技",
    purpose: "介紹 AI 如何改變教育方式",
    pageCount: 8,
    presentationType: "education",
    style: "professional",
    colorTheme: "blue",
    includeImages: true,
    author: "曾慶良（阿亮老師）",
    organization: "3A科技實驗室",
    notes: "測試用簡報"
  };

  const mockEvent = {
    postData: {
      contents: JSON.stringify(testData)
    }
  };

  const result = doPost(mockEvent);
  Logger.log(result.getContent());
}
