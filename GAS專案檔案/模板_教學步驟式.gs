/**
 * ==========================================================================
 * 模板_教學步驟式.gs
 * ==========================================================================
 * 參考範本.html 的精美設計風格
 * 特色：
 * - 進度指示器（圓形數字導航）
 * - 流暢的動畫效果
 * - 精美的卡片式設計
 * - 色彩豐富的區塊
 * - 完整的作者資訊和連結
 * ==========================================================================
 */

/**
 * generateTutorialTemplate - 生成教學步驟式模板
 *
 * @param {Object} data - 簡報資訊
 * @param {Object} aiContent - AI 生成的內容
 * @return {String} HTML 字串
 */
function generateTutorialTemplate(data, aiContent) {
  const slides = aiContent.slides || [];
  const author = data.author || '曾慶良（阿亮老師）';
  const organization = data.organization || '';

  // 生成投影片內容
  let slidesHTML = '';
  slides.forEach((slide, index) => {
    const isActive = index === 0 ? ' active' : '';
    slidesHTML += generateTutorialSlide(slide, index + 1, isActive, data);
  });

  return `<!DOCTYPE html>
<html lang="zh-Hant">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(data.topic)}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Noto Sans TC', sans-serif;
            background-color: #f0f4f8;
        }
        .slide {
            display: none;
            animation: fadeIn 0.5s ease-in-out;
        }
        .slide.active {
            display: block;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .step-indicator {
            transition: all 0.3s ease;
            cursor: pointer;
        }
        .step-indicator.active {
            background-color: #1e40af;
            color: white;
            transform: scale(1.1);
        }
        .step-indicator.completed {
            background-color: #3b82f6;
            color: white;
        }
        .key-item {
            background-color: #f1f5f9;
            border-left: 4px solid #3b82f6;
            padding: 0.75rem 1rem;
            border-radius: 0.25rem;
            font-family: 'Courier New', Courier, monospace;
            font-weight: bold;
            color: #1e3a8a;
        }
    </style>
</head>
<body class="antialiased text-slate-800">

    <div class="container mx-auto p-4 md:p-8 max-w-5xl">

        <!-- Header -->
        <header class="text-center mb-8">
            <h1 class="text-3xl md:text-4xl font-bold text-slate-900">${escapeHtml(data.topic)}</h1>
            <p class="text-slate-600 mt-4">
                ${escapeHtml(data.purpose || '完整的教學引導')}
            </p>
            <p class="text-slate-500 mt-4 text-sm">
                建置人：${escapeHtml(author)}
                ${organization ? '<br>' + escapeHtml(organization) : ''}
                <div class="flex justify-center space-x-4 mt-2">
                    <a href="https://www.facebook.com/iddmail" target="_blank" class="text-blue-600 hover:underline">Facebook</a>
                    <span>|</span>
                    <a href="https://www.youtube.com/@Liang-yt02" target="_blank" class="text-red-600 hover:underline">YouTube</a>
                    <span>|</span>
                    <a href="https://thisnote.space/" target="_blank" class="text-green-600 hover:underline">AI 小幫手</a>
                </div>
            </p>
        </header>

        <!-- Progress Bar -->
        <div id="progress-bar" class="flex justify-center items-center space-x-2 md:space-x-4 mb-8 flex-wrap">
            <!-- Step indicators will be injected here by JS -->
        </div>

        <!-- Slides Container -->
        <main id="slides-container" class="bg-white rounded-xl shadow-lg p-6 md:p-10 min-h-[450px]">
            ${slidesHTML}
        </main>

        <!-- Navigation Buttons -->
        <footer class="flex justify-between items-center mt-8">
            <button id="prev-btn" class="bg-slate-300 hover:bg-slate-400 text-slate-800 font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                上一頁
            </button>
            <div id="slide-counter" class="text-sm text-slate-500"></div>
            <button id="next-btn" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                下一頁
            </button>
        </footer>

    </div>

    <script>
        const slides = document.querySelectorAll('.slide');
        const totalSlides = slides.length;
        let currentSlide = 1;

        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        const slideCounter = document.getElementById('slide-counter');
        const progressBar = document.getElementById('progress-bar');

        // Create progress bar indicators
        for (let i = 0; i < totalSlides; i++) {
            const step = document.createElement('div');
            step.className = 'step-indicator w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-sm md:text-base cursor-pointer mt-2 bg-slate-300 text-slate-600';
            step.textContent = i + 1;
            step.dataset.slide = i + 1;
            progressBar.appendChild(step);
            step.addEventListener('click', () => {
                currentSlide = i + 1;
                showSlide(currentSlide);
            });
        }
        const stepIndicators = document.querySelectorAll('.step-indicator');

        function showSlide(slideNumber) {
            slides.forEach(slide => slide.classList.remove('active'));
            const newSlide = document.getElementById(\`slide-\${slideNumber}\`);
            if (newSlide) {
                newSlide.classList.add('active');
            }

            updateNavigation();
        }

        function updateNavigation() {
            // Update buttons
            prevBtn.disabled = currentSlide === 1;
            nextBtn.disabled = currentSlide === totalSlides;
            if (currentSlide === totalSlides) {
                nextBtn.textContent = '教學結束';
            } else {
                nextBtn.textContent = '下一頁';
            }

            // Update counter
            slideCounter.textContent = \`第 \${currentSlide} / \${totalSlides} 頁\`;

            // Update progress bar
            stepIndicators.forEach((indicator, index) => {
                const slideNum = index + 1;
                indicator.classList.remove('active', 'completed');
                if (slideNum < currentSlide) {
                    indicator.classList.add('completed');
                    indicator.classList.remove('bg-slate-300', 'text-slate-600');
                } else if (slideNum === currentSlide) {
                    indicator.classList.add('active');
                    indicator.classList.remove('bg-slate-300', 'text-slate-600');
                } else {
                    indicator.classList.add('bg-slate-300', 'text-slate-600');
                }
            });

            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        prevBtn.addEventListener('click', () => {
            if (currentSlide > 1) {
                currentSlide--;
                showSlide(currentSlide);
            }
        });

        nextBtn.addEventListener('click', () => {
            if (currentSlide < totalSlides) {
                currentSlide++;
                showSlide(currentSlide);
            }
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight' && currentSlide < totalSlides) {
                currentSlide++;
                showSlide(currentSlide);
            } else if (e.key === 'ArrowLeft' && currentSlide > 1) {
                currentSlide--;
                showSlide(currentSlide);
            }
        });

        // Initial setup
        showSlide(currentSlide);
    </script>

</body>
</html>`;
}

/**
 * generateTutorialSlide - 生成單個教學步驟投影片
 *
 * @param {Object} slide - 投影片資料
 * @param {Number} index - 投影片索引
 * @param {String} isActive - 是否為啟動狀態
 * @param {Object} data - 簡報資訊
 * @return {String} HTML 字串
 */
function generateTutorialSlide(slide, index, isActive, data) {
  const title = slide.title || `步驟 ${index}`;
  const content = slide.content || '';
  const points = slide.points || [];

  // 根據投影片類型決定樣式
  let contentHTML = '';

  if (index === 1) {
    // 首頁 - 歡迎頁面
    contentHTML = `
      <h3 class="text-2xl font-bold text-slate-800 mb-4">${escapeHtml(title)}</h3>
      <p class="mb-4 text-lg">${escapeHtml(content)}</p>
      ${points.length > 0 ? `
      <p class="font-semibold text-xl mb-4">本次教學流程：</p>
      <ul class="list-disc list-inside space-y-2 text-slate-700">
        ${points.map((point, i) => `
          <li><strong class="text-blue-600">${i === points.length - 1 ? '最終目標：' : '步驟' + (i + 1) + '：'}</strong>${escapeHtml(point)}</li>
        `).join('')}
      </ul>
      ` : ''}
    `;
  } else {
    // 一般頁面
    contentHTML = `
      <h3 class="text-2xl font-bold text-slate-800 mb-4">${escapeHtml(title)}</h3>
      <p class="mb-4">${escapeHtml(content)}</p>
      ${points.length > 0 ? `
      <div class="space-y-4">
        ${points.map((point, i) => {
          // 判斷是否為重點提示
          if (point.includes('提示：') || point.includes('注意：') || point.includes('重要：')) {
            return `
              <div class="bg-yellow-50 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded-r-lg">
                <p class="font-bold">提示：</p>
                <p>${escapeHtml(point.replace(/^(提示：|注意：|重要：)/, ''))}</p>
              </div>
            `;
          } else if (point.includes('成功') || point.includes('完成') || point.includes('恭喜')) {
            return `
              <div class="p-4 bg-green-50 border border-green-300 rounded-lg">
                <p class="font-bold text-green-800">🎉 ${escapeHtml(point)}</p>
              </div>
            `;
          } else {
            return `
              <div class="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                <p class="text-blue-700">${escapeHtml(point)}</p>
              </div>
            `;
          }
        }).join('')}
      </div>
      ` : ''}
    `;
  }

  return `
    <div id="slide-${index}" class="slide${isActive}">
      ${contentHTML}
    </div>
  `;
}
