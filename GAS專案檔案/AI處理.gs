/**
 * ==========================================================================
 * AI處理.gs
 * ==========================================================================
 * 處理所有 AI API 的呼叫
 * 支援 Google Gemini 和 OpenAI GPT
 * ==========================================================================
 */

/**
 * generateWithGemini - 使用 Google Gemini API 生成簡報
 *
 * @param {Object} data - 簡報需求資料
 * @return {String} 生成的 HTML 程式碼
 */
function generateWithGemini(data) {
  const apiKey = data.apiKey;
  const model = data.model || "gemini-3.5-flash";
  const prompt = buildPrompt(data);

  const url = 'https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent?key=' + apiKey;

  try {
    const response = UrlFetchApp.fetch(url, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const result = JSON.parse(response.getContentText());
    let htmlContent = result.candidates[0].content.parts[0].text;

    // 清除 markdown 標記
    htmlContent = htmlContent.replace(/```html\n?/g, '').replace(/```\n?/g, '').trim();

    Logger.log("Gemini API 呼叫成功");
    return htmlContent;

  } catch (error) {
    Logger.log("Gemini API 錯誤: " + error.toString());
    throw new Error("Gemini API 呼叫失敗: " + error.toString());
  }
}

/**
 * generateWithOpenAI - 使用 OpenAI API 生成簡報
 *
 * @param {Object} data - 簡報需求資料
 * @return {String} 生成的 HTML 程式碼
 */
function generateWithOpenAI(data) {
  const apiKey = data.apiKey;
  const model = data.model || "gpt-5.6-terra";
  const prompt = buildPrompt(data);

  const url = "https://api.openai.com/v1/chat/completions";

  try {
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

    // 清除 markdown 標記
    htmlContent = htmlContent.replace(/```html\n?/g, '').replace(/```\n?/g, '').trim();

    Logger.log("OpenAI API 呼叫成功");
    return htmlContent;

  } catch (error) {
    Logger.log("OpenAI API 錯誤: " + error.toString());
    throw new Error("OpenAI API 呼叫失敗: " + error.toString());
  }
}

/**
 * buildPrompt - 建立給 AI 的提示詞
 *
 * @param {Object} data - 簡報需求資料
 * @return {String} 完整的提示詞
 */
function buildPrompt(data) {
  const colors = getColorTheme(data.colorTheme);

  var prompt = '請生成一個專業且美觀的互動式 HTML 簡報。\n\n';
  prompt += '【簡報資訊】\n';
  prompt += '- 主題：' + data.topic + '\n';
  prompt += '- 對象：' + data.audience + '\n';
  prompt += '- 關鍵字：' + data.keywords + '\n';
  prompt += '- 目的：' + data.purpose + '\n';
  prompt += '- 頁數：' + data.pageCount + ' 頁\n';
  prompt += '- 類型：' + data.presentationType + '\n';
  prompt += '- 風格：' + data.style + '\n';
  prompt += '- 主色：' + colors.primary + '\n';
  prompt += '- 次色：' + colors.secondary + '\n';
  prompt += '- 作者：' + (data.author || '未提供') + '\n';
  prompt += '- 組織：' + (data.organization || '未提供') + '\n\n';
  prompt += '【技術要求】\n';
  prompt += '1. 使用 HTML + CSS + JavaScript\n';
  prompt += '2. 實現左右鍵切換頁面\n';
  prompt += '3. 包含頁碼指示器\n';
  prompt += '4. 每頁都有進場動畫\n';
  prompt += '5. 響應式設計（支援手機、平板、電腦）\n';
  prompt += '6. 使用 Tailwind CSS 或內聯 CSS\n';
  prompt += '7. 包含作者資訊和社群連結（Facebook、YouTube、AI 小幫手）\n\n';
  prompt += '【重要】\n';
  prompt += '- 請直接輸出完整的 HTML 程式碼\n';
  prompt += '- 不要有 markdown 標記\n';
  prompt += '- 確保程式碼可以直接在瀏覽器中執行\n';
  prompt += '- 首頁要有標題和作者資訊\n';
  prompt += '- 最後一頁要有感謝頁面';

  return prompt;
}

/**
 * getAIContent - 取得 AI 生成的簡報內容大綱（用於模板填充）
 *
 * @param {Object} data - 簡報需求資料
 * @return {Object} 包含投影片內容的物件
 */
function getAIContent(data) {
  var prompt = '請為以下簡報生成詳細的內容大綱（JSON 格式）：\n\n';
  prompt += '主題：' + data.topic + '\n';
  prompt += '對象：' + data.audience + '\n';
  prompt += '關鍵字：' + data.keywords + '\n';
  prompt += '目的：' + data.purpose + '\n';
  prompt += '頁數：' + data.pageCount + '\n';
  prompt += '類型：' + data.presentationType + '\n\n';
  prompt += '請回傳 JSON 格式：\n';
  prompt += '{\n';
  prompt += '  "slides": [\n';
  prompt += '    {\n';
  prompt += '      "title": "投影片標題",\n';
  prompt += '      "content": "主要內容描述（1-2 句話）",\n';
  prompt += '      "points": ["重點1", "重點2", "重點3"]\n';
  prompt += '    }\n';
  prompt += '  ]\n';
  prompt += '}\n\n';
  prompt += '要求：\n';
  prompt += '1. 第一頁是首頁（歡迎頁），標題就是簡報主題\n';
  prompt += '2. 最後一頁是結論頁\n';
  prompt += '3. 中間頁面根據關鍵字和主題展開\n';
  prompt += '4. 每個投影片要有 3-5 個重點\n';
  prompt += '5. 內容要具體、實用、有深度\n';
  prompt += '6. 只回傳 JSON，不要其他文字或 markdown 標記';

  try {
    const apiKey = data.apiKey;
    let model = data.model || "gemini-3.5-flash";

    // 確保使用 Gemini 模型（因為 OpenAI 的 JSON mode 設定不同）
    if (!model.includes('gemini')) {
      model = "gemini-3.5-flash";
    }

    const url = 'https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent?key=' + apiKey;

    const response = UrlFetchApp.fetch(url, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const result = JSON.parse(response.getContentText());
    let text = result.candidates[0].content.parts[0].text;

    // 清除 markdown 標記
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    const content = JSON.parse(text);

    Logger.log("AI 內容大綱生成成功，共 " + content.slides.length + " 頁");
    return content;

  } catch (error) {
    Logger.log("AI 內容生成失敗: " + error.toString());

    // 返回預設結構
    return generateDefaultContent(data);
  }
}

/**
 * generateDefaultContent - 生成預設的內容結構（當 AI 失敗時使用）
 *
 * @param {Object} data - 簡報需求資料
 * @return {Object} 預設的內容物件
 */
function generateDefaultContent(data) {
  const keywords = parseKeywords(data.keywords);
  const slides = [];

  // 首頁
  slides.push({
    title: data.topic,
    content: data.purpose || '歡迎參加本次簡報',
    points: [
      '對象：' + data.audience,
      '類型：' + data.presentationType,
      '關鍵字：' + keywords.join('、')
    ]
  });

  // 內容頁（根據關鍵字）
  keywords.forEach((keyword, index) => {
    slides.push({
      title: keyword,
      content: '深入探討' + keyword + '的核心概念與實際應用',
      points: [
        keyword + '的定義與重要性',
        keyword + '的實際應用案例',
        keyword + '的最佳實踐',
        keyword + '的未來發展趨勢'
      ]
    });
  });

  // 結論頁
  slides.push({
    title: '總結',
    content: '感謝您對' + data.topic + '的關注',
    points: [
      '回顧本次簡報的重點',
      '實際應用的建議',
      '持續學習的方向',
      '歡迎交流與討論'
    ]
  });

  // 確保頁數符合要求
  while (slides.length < data.pageCount) {
    const randomKeyword = keywords[slides.length % keywords.length];
    slides.push({
      title: '關於' + randomKeyword,
      content: '更多' + randomKeyword + '的相關內容',
      points: [
        randomKeyword + '的進階應用',
        '相關技術與工具',
        '成功案例分享',
        '常見問題解答'
      ]
    });
  }

  // 限制頁數
  return { slides: slides.slice(0, data.pageCount) };
}
