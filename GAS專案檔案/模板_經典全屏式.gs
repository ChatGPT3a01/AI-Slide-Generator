/**
 * ==========================================================================
 * 模板_經典全屏式.gs
 * ==========================================================================
 * 經典的全屏簡報風格
 * 特色：
 * - 全屏展示
 * - 簡潔大方
 * - 適合學術報告、演講簡報
 * - 支援滑鼠點擊和鍵盤導航
 * ==========================================================================
 */

/**
 * generateClassicTemplate - 生成經典全屏式模板
 *
 * @param {Object} data - 簡報資訊
 * @param {Object} aiContent - AI 生成的內容
 * @return {String} HTML 字串
 */
function generateClassicTemplate(data, aiContent) {
  const slides = aiContent.slides || [];
  const author = data.author || '曾慶良（阿亮老師）';
  const colorTheme = getColorTheme(data.colorTheme);

  // 生成投影片內容
  let slidesHTML = '';
  slides.forEach((slide, index) => {
    const isActive = index === 0 ? ' active' : '';
    slidesHTML += generateClassicSlide(slide, index, isActive, colorTheme, data);
  });

  return `<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(data.topic)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@300;400;500;700;900&display=swap" rel="stylesheet">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Noto Sans TC', sans-serif;
      overflow: hidden;
      background-color: #f5f5f5;
    }

    .slide {
      width: 100vw;
      height: 100vh;
      display: none;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem;
      text-align: center;
      position: relative;
    }

    .slide.active {
      display: flex;
      animation: fadeIn 0.8s ease-in-out;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* 封面頁樣式 */
    .cover-slide {
      background: linear-gradient(135deg, ${colorTheme.primary}, ${colorTheme.secondary});
      color: white;
    }

    .cover-slide h1 {
      font-size: 4.5em;
      font-weight: 900;
      margin-bottom: 1rem;
      line-height: 1.2;
      text-shadow: 0 4px 8px rgba(0,0,0,0.3);
    }

    .cover-slide .subtitle {
      font-size: 2em;
      font-weight: 300;
      margin-bottom: 3rem;
      opacity: 0.9;
    }

    .cover-slide .author-info {
      font-size: 1.3em;
      margin-top: 2rem;
    }

    .cover-slide .social-links {
      margin-top: 1.5rem;
      font-size: 1em;
      opacity: 0.8;
    }

    .cover-slide .social-links a {
      color: white;
      text-decoration: none;
      margin: 0 1rem;
      padding: 0.5rem 1rem;
      border: 2px solid rgba(255,255,255,0.5);
      border-radius: 25px;
      transition: all 0.3s;
      display: inline-block;
    }

    .cover-slide .social-links a:hover {
      background: white;
      color: ${colorTheme.primary};
      transform: translateY(-2px);
    }

    /* 內容頁樣式 */
    .content-slide {
      background: white;
    }

    .content-slide h2 {
      font-size: 3.5em;
      font-weight: 700;
      color: ${colorTheme.primary};
      margin-bottom: 2rem;
      border-bottom: 4px solid ${colorTheme.accent};
      padding-bottom: 1rem;
      display: inline-block;
    }

    .content-slide .main-content {
      font-size: 1.8em;
      max-width: 900px;
      line-height: 1.8;
      color: #333;
      margin-bottom: 2rem;
    }

    .content-slide ul {
      font-size: 1.5em;
      text-align: left;
      max-width: 900px;
      list-style: none;
    }

    .content-slide ul li {
      margin: 1.5rem 0;
      padding-left: 3rem;
      position: relative;
      animation: slideInLeft 0.5s ease-out forwards;
      opacity: 0;
    }

    .content-slide ul li:nth-child(1) { animation-delay: 0.1s; }
    .content-slide ul li:nth-child(2) { animation-delay: 0.2s; }
    .content-slide ul li:nth-child(3) { animation-delay: 0.3s; }
    .content-slide ul li:nth-child(4) { animation-delay: 0.4s; }
    .content-slide ul li:nth-child(5) { animation-delay: 0.5s; }

    .content-slide ul li::before {
      content: '●';
      position: absolute;
      left: 0;
      color: ${colorTheme.primary};
      font-size: 1.5em;
    }

    @keyframes slideInLeft {
      from {
        opacity: 0;
        transform: translateX(-30px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    /* 結論頁樣式 */
    .conclusion-slide {
      background: linear-gradient(135deg, #1f2937, #374151);
      color: white;
    }

    .conclusion-slide h2 {
      font-size: 4em;
      font-weight: 900;
      margin-bottom: 2rem;
      color: #fbbf24;
    }

    .conclusion-slide .main-content {
      font-size: 2em;
      margin-bottom: 2rem;
      opacity: 0.9;
    }

    .conclusion-slide ul li {
      color: white;
    }

    .conclusion-slide .thank-you {
      font-size: 2.5em;
      margin-top: 3rem;
      font-weight: 300;
    }

    /* 頁碼指示器 */
    .page-indicator {
      position: fixed;
      bottom: 2rem;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.7);
      color: white;
      padding: 0.8rem 1.5rem;
      border-radius: 25px;
      font-size: 1.2em;
      z-index: 100;
    }

    /* 導航提示 */
    .nav-hint {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      background: rgba(0, 0, 0, 0.6);
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 15px;
      font-size: 0.9em;
      opacity: 0;
      animation: fadeInOut 3s ease-in-out;
      z-index: 99;
    }

    @keyframes fadeInOut {
      0%, 100% { opacity: 0; }
      10%, 90% { opacity: 1; }
    }

    /* 響應式設計 */
    @media (max-width: 768px) {
      .cover-slide h1 { font-size: 3em; }
      .cover-slide .subtitle { font-size: 1.5em; }
      .content-slide h2 { font-size: 2.5em; }
      .content-slide .main-content { font-size: 1.3em; }
      .content-slide ul { font-size: 1.2em; }
      .slide { padding: 2rem; }
    }
  </style>
</head>
<body>

  ${slidesHTML}

  <!-- 頁碼指示器 -->
  <div class="page-indicator" id="pageIndicator">1 / ${slides.length}</div>

  <!-- 導航提示 -->
  <div class="nav-hint">
    ← → 或點擊螢幕左右兩側切換
  </div>

  <script>
    const slides = document.querySelectorAll('.slide');
    const totalSlides = slides.length;
    let currentSlide = 0;
    const pageIndicator = document.getElementById('pageIndicator');

    function showSlide(n) {
      // 移除所有 active class
      slides.forEach(slide => slide.classList.remove('active'));

      // 確保索引在有效範圍內
      currentSlide = (n + totalSlides) % totalSlides;

      // 顯示當前投影片
      slides[currentSlide].classList.add('active');

      // 更新頁碼指示器
      pageIndicator.textContent = (currentSlide + 1) + ' / ' + totalSlides;
    }

    // 鍵盤導航
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') {
        showSlide(currentSlide + 1);
      } else if (e.key === 'ArrowLeft') {
        showSlide(currentSlide - 1);
      } else if (e.key === 'Home') {
        showSlide(0);
      } else if (e.key === 'End') {
        showSlide(totalSlides - 1);
      }
    });

    // 滑鼠點擊導航
    document.addEventListener('click', (e) => {
      if (e.clientX > window.innerWidth / 2) {
        // 點擊右半邊 - 下一頁
        showSlide(currentSlide + 1);
      } else {
        // 點擊左半邊 - 上一頁
        showSlide(currentSlide - 1);
      }
    });

    // 觸控滑動支援（手機/平板）
    let touchStartX = 0;
    let touchEndX = 0;

    document.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    });

    document.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    });

    function handleSwipe() {
      if (touchEndX < touchStartX - 50) {
        // 向左滑動 - 下一頁
        showSlide(currentSlide + 1);
      }
      if (touchEndX > touchStartX + 50) {
        // 向右滑動 - 上一頁
        showSlide(currentSlide - 1);
      }
    }

    // 初始化
    showSlide(0);
  </script>

</body>
</html>`;
}

/**
 * generateClassicSlide - 生成單個經典全屏投影片
 *
 * @param {Object} slide - 投影片資料
 * @param {Number} index - 投影片索引
 * @param {String} isActive - 是否為啟動狀態
 * @param {Object} colorTheme - 色彩主題
 * @param {Object} data - 簡報資訊
 * @return {String} HTML 字串
 */
function generateClassicSlide(slide, index, isActive, colorTheme, data) {
  const title = slide.title || `投影片 ${index + 1}`;
  const content = slide.content || '';
  const points = slide.points || [];
  const isFirstSlide = index === 0;
  const isLastSlide = index === (data.pageCount - 1);

  if (isFirstSlide) {
    // 封面頁
    return `
  <div class="slide cover-slide${isActive}">
    <h1>${escapeHtml(data.topic)}</h1>
    <div class="subtitle">${escapeHtml(data.purpose || content)}</div>
    <div class="author-info">
      <div>${escapeHtml(data.author || '曾慶良（阿亮老師）')}</div>
      ${data.organization ? `<div>${escapeHtml(data.organization)}</div>` : ''}
    </div>
    <div class="social-links">
      <a href="https://www.facebook.com/iddmail" target="_blank">Facebook</a>
      <a href="https://www.youtube.com/@Liang-yt02" target="_blank">YouTube</a>
      <a href="https://thisnote.space/" target="_blank">AI 小幫手</a>
    </div>
  </div>`;
  } else if (isLastSlide) {
    // 結論頁
    return `
  <div class="slide conclusion-slide">
    <h2>${escapeHtml(title)}</h2>
    <div class="main-content">${escapeHtml(content)}</div>
    ${points.length > 0 ? `
    <ul>
      ${points.map(point => `<li>${escapeHtml(point)}</li>`).join('')}
    </ul>
    ` : ''}
    <div class="thank-you">感謝您的參與！</div>
  </div>`;
  } else {
    // 內容頁
    return `
  <div class="slide content-slide">
    <h2>${escapeHtml(title)}</h2>
    <div class="main-content">${escapeHtml(content)}</div>
    ${points.length > 0 ? `
    <ul>
      ${points.map(point => `<li>${escapeHtml(point)}</li>`).join('')}
    </ul>
    ` : ''}
  </div>`;
  }
}
