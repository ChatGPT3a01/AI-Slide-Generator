/**
 * ==========================================================================
 * AI 簡報生成系統 - Google Apps Script 完整程式碼
 * ==========================================================================
 * 版本：3.0（支援三種模板風格）
 * 功能：
 * 1. 接收 Flask 的簡報需求
 * 2. 呼叫 AI API（Gemini 或 OpenAI）生成內容
 * 3. 提供三種模板風格：現代雙欄式、教學步驟式、經典全屏式
 * 4. 記錄所有生成記錄到 Google Sheets
 * ==========================================================================
 */

// ========================================================================
// 主要處理函數
// ========================================================================

/**
 * doPost - 處理來自 Flask 的 POST 請求
 * 這是整個系統的入口函數
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

    // ========== 步驟 2: 記錄到 Google Sheets ==========
    logToSheet(data);

    // ========== 步驟 3: 根據生成模式處理 ==========
    const generationMode = data.generationMode || 'ai-full';
    let result = { status: "success" };

    if (generationMode === 'ai-full') {
      // 模式 A: 完全由 AI 生成
      const aiHtml = data.aiService === "gemini" ?
        generateWithGemini(data) : generateWithOpenAI(data);
      result.html_content = aiHtml;

    } else if (generationMode === 'template') {
      // 模式 B: 使用模板（根據使用者選擇的風格）
      const aiContent = getAIContent(data);
      const templateStyle = data.templateStyle || 'modern';

      if (templateStyle === 'tutorial') {
        // 教學步驟式模板
        result.html_content = generateTutorialTemplate(data, aiContent);
      } else if (templateStyle === 'classic') {
        // 經典全屏式模板
        result.html_content = generateClassicTemplate(data, aiContent);
      } else {
        // 現代雙欄式模板（預設）
        result.html_content = generateWithTemplate(data, aiContent);
      }

    } else if (generationMode === 'both') {
      // 模式 C: 兩種都生成
      const aiHtml = data.aiService === "gemini" ?
        generateWithGemini(data) : generateWithOpenAI(data);
      const aiContent = getAIContent(data);

      // 模板版本根據使用者選擇
      const templateStyle = data.templateStyle || 'modern';
      let templateHtml;

      if (templateStyle === 'tutorial') {
        templateHtml = generateTutorialTemplate(data, aiContent);
      } else if (templateStyle === 'classic') {
        templateHtml = generateClassicTemplate(data, aiContent);
      } else {
        templateHtml = generateWithTemplate(data, aiContent);
      }

      result.ai_html = aiHtml;
      result.template_html = templateHtml;
    }

    // ========== 步驟 4: 回傳結果給 Flask ==========
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
 * logToSheet - 將簡報生成記錄儲存到 Google Sheets
 * @param {Object} data - 包含簡報資訊的物件
 */
function logToSheet(data) {
  try {
    const sheetName = "簡報記錄";
    let spreadsheet;

    try {
      spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    } catch (e) {
      spreadsheet = SpreadsheetApp.create("AI簡報生成記錄");
    }

    let sheet = spreadsheet.getSheetByName(sheetName);

    if (!sheet) {
      sheet = spreadsheet.insertSheet(sheetName);
      sheet.appendRow([
        "時間", "AI服務", "模板風格", "主題", "對象", "頁數",
        "類型", "風格", "色彩", "作者", "組織"
      ]);
    }

    sheet.appendRow([
      new Date(),
      data.aiService,
      data.templateStyle || 'N/A',
      data.topic,
      data.audience,
      data.pageCount,
      data.presentationType,
      data.style,
      data.colorTheme,
      data.author || "",
      data.organization || ""
    ]);
  } catch (error) {
    Logger.log("記錄失敗: " + error.toString());
  }
}

/**
 * generateWithGemini - 使用 Google Gemini API 生成簡報
 * @param {Object} data - 簡報需求資料
 * @return {string} - 生成的 HTML 程式碼
 */
function generateWithGemini(data) {
  const apiKey = data.apiKey;
  const model = data.model || "gemini-3.5-flash";
  const prompt = buildPrompt(data);

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });

  const result = JSON.parse(response.getContentText());
  let htmlContent = result.candidates[0].content.parts[0].text;
  htmlContent = htmlContent.replace(/```html\n?/g, '').replace(/```\n?/g, '').trim();

  return htmlContent;
}

/**
 * generateWithOpenAI - 使用 OpenAI API 生成簡報
 * @param {Object} data - 簡報需求資料
 * @return {string} - 生成的 HTML 程式碼
 */
function generateWithOpenAI(data) {
  const apiKey = data.apiKey;
  const model = data.model || "gpt-5.6-terra";
  const prompt = buildPrompt(data);

  const url = "https://api.openai.com/v1/chat/completions";

  const response = UrlFetchApp.fetch(url, {
    method: 'post',
    headers: {
      'Authorization': 'Bearer ' + apiKey,
      'Content-Type': 'application/json'
    },
    payload: JSON.stringify({
      model: model,
      messages: [
        {
          role: "system",
          content: "你是一個專業的簡報設計師，擅長使用 HTML/CSS/JavaScript 創建互動式簡報。"
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7
    })
  });

  const result = JSON.parse(response.getContentText());
  let htmlContent = result.choices[0].message.content;
  htmlContent = htmlContent.replace(/```html\n?/g, '').replace(/```\n?/g, '').trim();

  return htmlContent;
}

/**
 * buildPrompt - 建立給 AI 的提示詞
 * @param {Object} data - 簡報需求資料
 * @return {string} - 完整的提示詞
 */
function buildPrompt(data) {
  const colorMap = {
    'blue': { primary: '#2563eb', secondary: '#3b82f6', accent: '#60a5fa', bg: '#eff6ff' },
    'warm': { primary: '#F9A826', secondary: '#f59e0b', accent: '#fbbf24', bg: '#FFFBF5' },
    'corporate': { primary: '#1e40af', secondary: '#059669', accent: '#0891b2', bg: '#ecfdf5' },
    'dark': { primary: '#1f2937', secondary: '#374151', accent: '#6b7280', bg: '#111827' },
    'bright': { primary: '#ec4899', secondary: '#8b5cf6', accent: '#06b6d4', bg: '#fdf4ff' }
  };

  const colors = colorMap[data.colorTheme] || colorMap['blue'];

  return `請生成一個專業且美觀的互動式 HTML 簡報。

【簡報資訊】
- 主題：${data.topic}
- 對象：${data.audience}
- 關鍵字：${data.keywords}
- 目的：${data.purpose}
- 頁數：${data.pageCount} 頁
- 類型：${data.presentationType}
- 風格：${data.style}
- 主色：${colors.primary}
- 作者：${data.author || '未提供'}
- 組織：${data.organization || '未提供'}

【技術要求】
1. 使用 HTML + CSS + JavaScript
2. 實現左右鍵切換頁面
3. 包含頁碼指示器
4. 每頁都有進場動畫
5. 響應式設計

請直接輸出完整的 HTML 程式碼，不要有 markdown 標記。`;
}

/**
 * getAIContent - 取得 AI 生成的簡報內容大綱（用於模板填充）
 * @param {Object} data - 簡報需求資料
 * @return {Object} - 包含頁面內容的物件
 */
function getAIContent(data) {
  const prompt = `請為以下簡報生成內容大綱（JSON 格式）：
主題：${data.topic}
關鍵字：${data.keywords}
頁數：${data.pageCount}

請回傳 JSON 格式：
{
  "pages": [
    {"title": "頁面標題", "content": "頁面內容描述"}
  ]
}

只回傳 JSON，不要其他文字。`;

  try {
    const apiKey = data.apiKey;
    const model = data.model || "gemini-3.5-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const response = UrlFetchApp.fetch(url, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const result = JSON.parse(response.getContentText());
    let text = result.candidates[0].content.parts[0].text;
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    return JSON.parse(text);
  } catch (error) {
    Logger.log("AI 內容生成失敗: " + error);
    return { pages: [] };
  }
}

// ========================================================================
// 模板生成函數（三種風格）
// ========================================================================

/**
 * ========== 模板 1：現代雙欄式（預設） ==========
 * 適合：商務報告、產品介紹、專業演講
 * 特色：左右分欄、視覺豐富、專業感強
 */
function generateWithTemplate(data, aiContent) {
  const colorMap = {
    'blue': { primary: '#2563eb', secondary: '#3b82f6', accent: '#60a5fa', bg: '#eff6ff' },
    'warm': { primary: '#F9A826', secondary: '#f59e0b', accent: '#fbbf24', bg: '#FFFBF5' },
    'corporate': { primary: '#1e40af', secondary: '#059669', accent: '#0891b2', bg: '#ecfdf5' },
    'dark': { primary: '#1f2937', secondary: '#374151', accent: '#6b7280', bg: '#111827' },
    'bright': { primary: '#ec4899', secondary: '#8b5cf6', accent: '#06b6d4', bg: '#fdf4ff' }
  };

  const colors = colorMap[data.colorTheme] || colorMap['blue'];
  const keywords = data.keywords.split(/[,，]/).map(k => k.trim());

  return `<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.topic}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@300;400;500;700;900&display=swap');

    :root {
      --theme-color: ${colors.primary};
      --bg-color: ${colors.bg};
      --secondary-color: ${colors.secondary};
      --accent-color: ${colors.accent};
    }

    body { margin: 0; padding: 0; overflow: hidden; font-family: 'Noto Sans TC', sans-serif; }

    .slide {
      width: 100vw;
      height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      position: absolute;
      top: 0;
      left: 0;
      transition: transform 0.8s ease-in-out, opacity 0.8s ease-in-out;
      opacity: 0;
      transform: translateX(100%);
      padding: 4rem;
      box-sizing: border-box;
      background-color: var(--bg-color);
    }

    .slide.active { opacity: 1; transform: translateX(0); }
    .slide:not(.active) { pointer-events: none; }

    .content-card {
      background: white;
      border-radius: 1.5rem;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
      width: 90%;
      max-width: 1200px;
      padding: 3rem 4rem;
      min-height: 70vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      animation: fadeIn 1s ease-out;
    }

    .cover-slide {
      background: linear-gradient(135deg, var(--theme-color), var(--secondary-color));
      color: white;
      text-shadow: 0 2px 4px rgba(0,0,0,0.3);
    }

    .end-slide { background: linear-gradient(135deg, #1f2937, #374151); color: white; }

    .content-slide-layout {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 3rem;
      align-items: center;
      width: 100%;
    }

    .theme-border-left { border-left: 4px solid var(--theme-color); }

    .point-item {
      display: flex;
      align-items: flex-start;
      margin-bottom: 1.5rem;
      animation: slideInLeft 0.5s ease-out forwards;
      opacity: 0;
    }

    .point-icon {
      color: var(--theme-color);
      font-size: 1.5rem;
      line-height: 1.5;
      margin-right: 1rem;
      flex-shrink: 0;
    }

    @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes slideInLeft { from { opacity: 0; transform: translateX(-50px); } to { opacity: 1; transform: translateX(0); } }

    .nav-btn {
      position: fixed;
      top: 50%;
      transform: translateY(-50%);
      background-color: rgba(0, 0, 0, 0.3);
      color: white;
      padding: 1rem;
      border-radius: 50%;
      cursor: pointer;
      z-index: 100;
      border: none;
      transition: background-color 0.3s;
      width: 60px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .nav-btn:hover { background-color: rgba(0, 0, 0, 0.6); }
    #prev-btn { left: 20px; }
    #next-btn { right: 20px; }
    .icon-svg { width: 32px; height: 32px; stroke-width: 2.5; }
  </style>
</head>
<body>
  ${generateSlides(data, aiContent, keywords, colors)}

  <button id="prev-btn" class="nav-btn">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" class="icon-svg">
      <path d="m15 18-6-6 6-6"/>
    </svg>
  </button>

  <button id="next-btn" class="nav-btn">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" class="icon-svg">
      <path d="m9 18 6-6-6-6"/>
    </svg>
  </button>

  <script>
    document.addEventListener('DOMContentLoaded', () => {
      const slides = document.querySelectorAll('.slide');
      const totalSlides = slides.length;
      let currentSlideIndex = 0;
      const prevBtn = document.getElementById('prev-btn');
      const nextBtn = document.getElementById('next-btn');

      if (totalSlides === 0) return;

      function updateSlideVisibility() {
        slides.forEach((slide, index) => {
          slide.classList.remove('active');
          if (index === currentSlideIndex) slide.classList.add('active');
        });

        prevBtn.disabled = (currentSlideIndex === 0);
        nextBtn.disabled = (currentSlideIndex === totalSlides - 1);
      }

      function goToSlide(index) {
        currentSlideIndex = Math.max(0, Math.min(index, totalSlides - 1));
        updateSlideVisibility();
      }

      function nextSlide() { goToSlide(currentSlideIndex + 1); }
      function prevSlide() { goToSlide(currentSlideIndex - 1); }

      nextBtn.addEventListener('click', nextSlide);
      prevBtn.addEventListener('click', prevSlide);

      document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') nextSlide();
        else if (e.key === 'ArrowLeft') prevSlide();
      });

      updateSlideVisibility();
    });
  </script>
</body>
</html>`;
}

/**
 * ========== 模板 2：教學步驟式 ==========
 * 適合：操作教學、步驟說明、培訓課程
 * 特色：進度球導航、步驟清晰、互動性好
 */
function generateTutorialTemplate(data, aiContent) {
  const colorMap = {
    'blue': { primary: '#1e40af', secondary: '#3b82f6', accent: '#60a5fa', bg: '#f0f4f8' },
    'warm': { primary: '#dc2626', secondary: '#f59e0b', accent: '#fbbf24', bg: '#fef3c7' },
    'corporate': { primary: '#1e40af', secondary: '#059669', accent: '#0891b2', bg: '#ecfdf5' },
    'dark': { primary: '#1f2937', secondary: '#374151', accent: '#6b7280', bg: '#111827' },
    'bright': { primary: '#ec4899', secondary: '#8b5cf6', accent: '#06b6d4', bg: '#fdf4ff' }
  };

  const colors = colorMap[data.colorTheme] || colorMap['blue'];
  const keywords = data.keywords.split(/[,，]/).map(k => k.trim());

  return `<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.topic}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Noto Sans TC', sans-serif; background-color: ${colors.bg}; }
    .slide { display: none; animation: fadeIn 0.5s ease-in-out; }
    .slide.active { display: block; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    .step-indicator {
      transition: all 0.3s ease;
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      cursor: pointer;
      background-color: #e2e8f0;
      color: #64748b;
    }
    .step-indicator.active { background-color: ${colors.primary}; color: white; transform: scale(1.2); }
    .step-indicator.completed { background-color: ${colors.secondary}; color: white; }
  </style>
</head>
<body>
  <div class="container mx-auto p-4 md:p-8 max-w-5xl">
    <header class="text-center mb-8">
      <h1 class="text-3xl md:text-4xl font-bold" style="color: ${colors.primary};">${data.topic}</h1>
      <p class="text-gray-600 mt-4">${data.purpose}</p>
      ${data.author ? `<p class="text-sm mt-2">主講人：${data.author}</p>` : ''}
      ${data.organization ? `<p class="text-sm">${data.organization}</p>` : ''}
    </header>

    <div id="progress-bar" class="flex justify-center items-center space-x-2 md:space-x-4 mb-8 flex-wrap">
      ${generateProgressIndicators(parseInt(data.pageCount))}
    </div>

    <main id="slides-container" class="bg-white rounded-xl shadow-lg p-6 md:p-10 min-h-[450px]">
      ${generateTutorialSlides(data, aiContent, keywords, colors)}
    </main>

    <footer class="flex justify-between items-center mt-8">
      <button id="prev-btn" class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
        上一頁
      </button>
      <div id="slide-counter" class="text-sm text-gray-500"></div>
      <button id="next-btn" class="font-bold py-2 px-4 rounded-lg transition-colors" style="background-color: ${colors.primary}; color: white;">
        下一頁
      </button>
    </footer>
  </div>

  <script>${getTutorialScript()}</script>
</body>
</html>`;
}

/**
 * ========== 模板 3：經典全屏式 ==========
 * 適合：傳統演講、學術報告、正式場合
 * 特色：全屏顯示、簡潔大方、易於閱讀
 */
function generateClassicTemplate(data, aiContent) {
  const colorMap = {
    'blue': { primary: '#2563eb', secondary: '#3b82f6', bg: '#eff6ff' },
    'warm': { primary: '#dc2626', secondary: '#f59e0b', bg: '#fef3c7' },
    'corporate': { primary: '#1e40af', secondary: '#059669', bg: '#ecfdf5' },
    'dark': { primary: '#1f2937', secondary: '#374151', bg: '#111827' },
    'bright': { primary: '#ec4899', secondary: '#8b5cf6', bg: '#fdf4ff' }
  };

  const colors = colorMap[data.colorTheme] || colorMap['blue'];
  const keywords = data.keywords.split(/[,，]/).map(k => k.trim());

  return `<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.topic}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Microsoft JhengHei', sans-serif; overflow: hidden; }
    .slide {
      width: 100vw;
      height: 100vh;
      display: none;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem;
      text-align: center;
      background: ${colors.bg};
    }
    .slide.active { display: flex; animation: fadeIn 0.8s; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .slide h1 { font-size: 4em; color: ${colors.primary}; margin-bottom: 1rem; }
    .slide h2 { font-size: 3em; color: ${colors.secondary}; margin-bottom: 2rem; }
    .slide p { font-size: 1.5em; max-width: 800px; line-height: 1.8; color: #333; }
    .slide ul { font-size: 1.5em; text-align: left; max-width: 800px; }
    .slide ul li { margin: 1rem 0; }
    .cover { background: linear-gradient(135deg, ${colors.primary}, ${colors.secondary}); color: white; }
    .cover h1 { color: white; }
    .cover p { color: white; opacity: 0.9; }
  </style>
</head>
<body>
  ${generateClassicSlides(data, aiContent, keywords, colors)}
  <script>
    const slides = document.querySelectorAll('.slide');
    let current = 0;
    function show(n) {
      slides.forEach(s => s.classList.remove('active'));
      current = (n + slides.length) % slides.length;
      slides[current].classList.add('active');
    }
    document.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight' || e.key === ' ') show(current + 1);
      if (e.key === 'ArrowLeft') show(current - 1);
    });
    document.addEventListener('click', e => {
      if (e.clientX > window.innerWidth / 2) show(current + 1);
      else show(current - 1);
    });
    show(0);
  </script>
</body>
</html>`;
}

// ========================================================================
// 輔助函數（用於生成各模板的內容）
// ========================================================================

/**
 * generateSlides - 生成現代雙欄式的投影片內容
 */
function generateSlides(data, aiContent, keywords, colors) {
  let slides = '';

  // 封面頁
  slides += `
  <div class="slide cover-slide active">
    <div class="z-10 text-center">
      <h1 class="text-7xl font-extrabold mb-6">${data.topic}</h1>
      <p class="text-3xl font-light opacity-90">${data.purpose}</p>
      ${data.author ? `<p class="mt-12 text-xl">主講人：${data.author}</p>` : ''}
      ${data.organization ? `<p class="text-xl">${data.organization}</p>` : ''}
    </div>
  </div>`;

  // 內容頁
  if (aiContent && aiContent.pages && aiContent.pages.length > 0) {
    for (let i = 0; i < Math.min(aiContent.pages.length, parseInt(data.pageCount) - 2); i++) {
      const page = aiContent.pages[i];
      slides += `
  <div class="slide">
    <div class="content-card">
      <div class="content-slide-layout">
        <div class="flex flex-col justify-center">
          <h2 class="text-4xl font-bold text-gray-800 mb-6 theme-border-left pl-4">${page.title}</h2>
          <p class="text-lg text-gray-600">${page.content}</p>
        </div>
        <div class="flex flex-col justify-center h-full">
          <div>
            ${generatePointItems(page.points || [page.content])}
          </div>
        </div>
      </div>
    </div>
  </div>`;
    }
  } else {
    for (let i = 0; i < Math.min(keywords.length, parseInt(data.pageCount) - 2); i++) {
      slides += `
  <div class="slide">
    <div class="content-card">
      <div class="content-slide-layout">
        <div class="flex flex-col justify-center">
          <h2 class="text-4xl font-bold text-gray-800 mb-6 theme-border-left pl-4">${keywords[i]}</h2>
          <p class="text-lg text-gray-600">深入探討 ${keywords[i]} 的核心概念與實際應用</p>
        </div>
        <div class="flex flex-col justify-center h-full">
          <div>
            <div class="point-item" style="animation-delay: 0s;">
              <span class="point-icon">✨</span>
              <p class="text-xl text-gray-800 font-medium">${keywords[i]} 的核心概念與重要性</p>
            </div>
            <div class="point-item" style="animation-delay: 0.2s;">
              <span class="point-icon">✨</span>
              <p class="text-xl text-gray-800 font-medium">實際應用案例與成功經驗</p>
            </div>
            <div class="point-item" style="animation-delay: 0.4s;">
              <span class="point-icon">✨</span>
              <p class="text-xl text-gray-800 font-medium">未來發展趨勢與展望</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>`;
    }
  }

  // 結尾頁
  slides += `
  <div class="slide end-slide">
    <div class="z-10 text-center">
      <h2 class="text-6xl font-extrabold mb-6" style="color: var(--accent-color);">感謝您的參與！</h2>
      <p class="text-3xl font-light mb-8 opacity-90">${data.topic}</p>
      ${data.author ? `<p class="text-2xl mt-8">主講人：${data.author}</p>` : ''}
      ${data.organization ? `<p class="text-2xl">${data.organization}</p>` : ''}
    </div>
  </div>`;

  return slides;
}

/**
 * generatePointItems - 生成重點項目列表（用於現代雙欄式）
 * @param {Array} points - 重點陣列
 * @return {string} - HTML 字串
 */
function generatePointItems(points) {
  if (!Array.isArray(points)) points = [points];

  return points.map((point, index) => `
    <div class="point-item" style="animation-delay: ${index * 0.2}s;">
      <span class="point-icon">✨</span>
      <p class="text-xl text-gray-800 font-medium">${point}</p>
    </div>
  `).join('');
}

/**
 * generateProgressIndicators - 生成進度球指示器（用於教學步驟式）
 * @param {number} totalSlides - 總頁數
 * @return {string} - HTML 字串
 */
function generateProgressIndicators(totalSlides) {
  let html = '';
  for (let i = 1; i <= totalSlides; i++) {
    html += `<div class="step-indicator" data-slide="${i}">${i}</div>`;
  }
  return html;
}

/**
 * generateTutorialSlides - 生成教學步驟式的投影片內容
 */
function generateTutorialSlides(data, aiContent, keywords, colors) {
  let slides = '';

  // 封面頁
  slides += `
    <div id="slide-1" class="slide active">
      <h3 class="text-2xl font-bold mb-4" style="color: ${colors.primary};">歡迎：${data.topic}</h3>
      <p class="mb-4 text-lg">${data.purpose}</p>
      <p class="font-semibold text-xl mb-4">本次簡報流程：</p>
      <ul class="list-disc list-inside space-y-2">
        ${keywords.map((k, i) => `<li><strong style="color: ${colors.secondary};">步驟${i+1}：</strong>${k}</li>`).join('')}
      </ul>
    </div>
  `;

  // 內容頁
  if (aiContent && aiContent.pages && aiContent.pages.length > 0) {
    aiContent.pages.forEach((page, index) => {
      slides += `
        <div id="slide-${index + 2}" class="slide">
          <h3 class="text-2xl font-bold mb-4" style="color: ${colors.primary};">步驟${index + 1}：${page.title}</h3>
          <p class="mb-4">${page.content}</p>
          <div class="p-4 rounded-lg" style="background-color: ${colors.bg}; border-left: 4px solid ${colors.primary};">
            <p class="font-semibold">重點提示：</p>
            <p>${page.content}</p>
          </div>
        </div>
      `;
    });
  } else {
    keywords.forEach((keyword, index) => {
      slides += `
        <div id="slide-${index + 2}" class="slide">
          <h3 class="text-2xl font-bold mb-4" style="color: ${colors.primary};">步驟${index + 1}：${keyword}</h3>
          <p class="mb-4">關於 ${keyword} 的詳細說明</p>
          <div class="space-y-3">
            <div class="p-4 rounded-lg" style="background-color: ${colors.bg};">
              <p><strong>重點一：</strong>${keyword} 的核心概念</p>
            </div>
            <div class="p-4 rounded-lg" style="background-color: ${colors.bg};">
              <p><strong>重點二：</strong>實際應用方法</p>
            </div>
          </div>
        </div>
      `;
    });
  }

  // 結尾頁
  slides += `
    <div id="slide-${parseInt(data.pageCount)}" class="slide">
      <h3 class="text-2xl font-bold mb-4" style="color: ${colors.primary};">感謝您的參與！</h3>
      <p class="mb-4 text-lg">恭喜完成所有步驟</p>
      ${data.author ? `<p class="mt-8">主講人：${data.author}</p>` : ''}
      ${data.organization ? `<p>${data.organization}</p>` : ''}
    </div>
  `;

  return slides;
}

/**
 * getTutorialScript - 返回教學步驟式模板的 JavaScript 程式碼
 * 用於控制投影片切換和進度球互動
 */
function getTutorialScript() {
  return `
    const slides = document.querySelectorAll('.slide');
    const totalSlides = slides.length;
    let currentSlide = 1;
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const slideCounter = document.getElementById('slide-counter');
    const stepIndicators = document.querySelectorAll('.step-indicator');

    // 顯示指定的投影片
    function showSlide(slideNumber) {
      slides.forEach(slide => slide.classList.remove('active'));
      const newSlide = document.getElementById('slide-' + slideNumber);
      if (newSlide) newSlide.classList.add('active');
      updateNavigation();
    }

    // 更新導航按鈕和進度球狀態
    function updateNavigation() {
      prevBtn.disabled = currentSlide === 1;
      nextBtn.disabled = currentSlide === totalSlides;
      slideCounter.textContent = '第 ' + currentSlide + ' / ' + totalSlides + ' 頁';

      // 更新進度球樣式
      stepIndicators.forEach((indicator, index) => {
        const slideNum = index + 1;
        indicator.classList.remove('active', 'completed');
        if (slideNum < currentSlide) {
          indicator.classList.add('completed');
        } else if (slideNum === currentSlide) {
          indicator.classList.add('active');
        }
      });
    }

    // 上一頁按鈕
    prevBtn.addEventListener('click', () => {
      if (currentSlide > 1) {
        currentSlide--;
        showSlide(currentSlide);
      }
    });

    // 下一頁按鈕
    nextBtn.addEventListener('click', () => {
      if (currentSlide < totalSlides) {
        currentSlide++;
        showSlide(currentSlide);
      }
    });

    // 點擊進度球直接跳轉
    stepIndicators.forEach((indicator) => {
      indicator.addEventListener('click', () => {
        currentSlide = parseInt(indicator.dataset.slide);
        showSlide(currentSlide);
      });
    });

    // 初始化
    showSlide(currentSlide);
  `;
}

/**
 * generateClassicSlides - 生成經典全屏式的投影片內容
 */
function generateClassicSlides(data, aiContent, keywords, colors) {
  let slides = '';

  // 封面
  slides += `
    <div class="slide cover active">
      <h1>${data.topic}</h1>
      <p style="font-size: 1.8em; margin-top: 2rem;">${data.purpose}</p>
      ${data.author ? `<p style="margin-top: 3rem;">${data.author}</p>` : ''}
      ${data.organization ? `<p>${data.organization}</p>` : ''}
    </div>
  `;

  // 內容頁
  if (aiContent && aiContent.pages) {
    aiContent.pages.forEach(page => {
      slides += `
        <div class="slide">
          <h2>${page.title}</h2>
          <p>${page.content}</p>
        </div>
      `;
    });
  } else {
    keywords.forEach(keyword => {
      slides += `
        <div class="slide">
          <h2>${keyword}</h2>
          <ul>
            <li>${keyword} 的核心概念</li>
            <li>實際應用與案例</li>
            <li>未來發展趨勢</li>
          </ul>
        </div>
      `;
    });
  }

  // 結尾
  slides += `
    <div class="slide">
      <h1>Thank You</h1>
      ${data.author ? `<p style="margin-top: 3rem;">${data.author}</p>` : ''}
      ${data.organization ? `<p>${data.organization}</p>` : ''}
    </div>
  `;

  return slides;
}

// ========================================================================
// 測試函數
// ========================================================================

/**
 * doGet - 處理 GET 請求（測試用）
 * 可以在瀏覽器直接訪問 GAS 網址來測試是否正常運作
 */
function doGet() {
  return ContentService.createTextOutput(JSON.stringify({
    status: "ok",
    message: "GAS 運作正常",
    version: "3.0",
    templates: ["modern", "tutorial", "classic"]
  })).setMimeType(ContentService.MimeType.JSON);
}
