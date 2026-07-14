/**
 * ==========================================================================
 * 模板_現代雙欄式.gs
 * ==========================================================================
 * 參考範本1.html 的精美漸層設計
 * 特色：
 * - 精美的漸層背景
 * - 雙欄式內容呈現
 * - 卡片式設計
 * - 動畫效果
 * - 響應式設計
 * ==========================================================================
 */

/**
 * generateModernTemplate - 生成現代雙欄式模板
 *
 * @param {Object} data - 簡報資訊
 * @param {Object} aiContent - AI 生成的內容
 * @return {String} HTML 字串
 */
function generateModernTemplate(data, aiContent) {
  const slides = aiContent.slides || [];
  const author = data.author || '曾慶良（阿亮老師）';
  const colorTheme = getColorTheme(data.colorTheme);

  // 生成投影片內容
  let slidesHTML = '';
  slides.forEach((slide, index) => {
    slidesHTML += generateModernSlide(slide, index, colorTheme, data);
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
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700;900&display=swap" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        body {
            font-family: 'Noto Sans TC', sans-serif;
        }

        .gradient-bg {
            background: linear-gradient(135deg, ${colorTheme.primary} 0%, ${colorTheme.secondary} 100%);
        }

        .slide {
            display: none;
            min-height: 100vh;
            animation: fadeIn 0.6s ease-in-out;
        }

        .slide.active {
            display: block;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .card-hover {
            transition: all 0.3s ease;
        }

        .card-hover:hover {
            transform: translateY(-10px);
            box-shadow: 0 20px 40px rgba(0,0,0,0.2);
        }

        .pulse {
            animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: .7; }
        }

        .nav-btn {
            transition: all 0.3s ease;
        }

        .nav-btn:hover {
            transform: scale(1.05);
            box-shadow: 0 10px 20px rgba(0,0,0,0.2);
        }
    </style>
</head>
<body class="bg-gray-50">

    ${slidesHTML}

    <!-- Navigation -->
    <div class="fixed bottom-8 left-1/2 transform -translate-x-1/2 flex items-center space-x-4 bg-white px-6 py-3 rounded-full shadow-lg z-50">
        <button id="prev-btn" class="nav-btn bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            <i class="fas fa-chevron-left"></i>
        </button>
        <span id="slide-counter" class="text-gray-700 font-semibold"></span>
        <button id="next-btn" class="nav-btn bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-2 px-4 rounded-full transition-all hover:from-blue-600 hover:to-purple-700">
            <i class="fas fa-chevron-right"></i>
        </button>
    </div>

    <script>
        const slides = document.querySelectorAll('.slide');
        const totalSlides = slides.length;
        let currentSlide = 0;

        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        const slideCounter = document.getElementById('slide-counter');

        function showSlide(index) {
            slides.forEach(slide => slide.classList.remove('active'));
            slides[index].classList.add('active');
            currentSlide = index;

            // Update navigation
            prevBtn.disabled = index === 0;
            nextBtn.disabled = index === totalSlides - 1;
            slideCounter.textContent = \`\${index + 1} / \${totalSlides}\`;

            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        prevBtn.addEventListener('click', () => {
            if (currentSlide > 0) {
                showSlide(currentSlide - 1);
            }
        });

        nextBtn.addEventListener('click', () => {
            if (currentSlide < totalSlides - 1) {
                showSlide(currentSlide + 1);
            }
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight' && currentSlide < totalSlides - 1) {
                showSlide(currentSlide + 1);
            } else if (e.key === 'ArrowLeft' && currentSlide > 0) {
                showSlide(currentSlide - 1);
            }
        });

        // Initialize
        showSlide(0);
    </script>

</body>
</html>`;
}

/**
 * generateModernSlide - 生成現代雙欄式投影片
 *
 * @param {Object} slide - 投影片資料
 * @param {Number} index - 投影片索引
 * @param {Object} colorTheme - 色彩主題
 * @param {Object} data - 簡報資訊
 * @return {String} HTML 字串
 */
function generateModernSlide(slide, index, colorTheme, data) {
  const isFirstSlide = index === 0;
  const isLastSlide = index === (data.pageCount - 1);
  const title = slide.title || `投影片 ${index + 1}`;
  const content = slide.content || '';
  const points = slide.points || [];

  if (isFirstSlide) {
    // 首頁 - Hero Section
    return `
    <div class="slide${index === 0 ? ' active' : ''}">
        <section class="gradient-bg text-white min-h-screen flex items-center justify-center py-20">
            <div class="container mx-auto px-4 text-center">
                <div class="max-w-4xl mx-auto">
                    <div class="mb-8">
                        <i class="fas fa-rocket text-6xl pulse"></i>
                    </div>
                    <h1 class="text-5xl md:text-6xl font-black mb-6">
                        ${escapeHtml(data.topic)}
                    </h1>
                    <p class="text-xl md:text-2xl mb-8 opacity-90">
                        ${escapeHtml(data.purpose || content)}
                    </p>
                    <div class="flex flex-wrap justify-center gap-4 mb-12">
                        <span class="bg-white/20 backdrop-blur-sm px-6 py-2 rounded-full text-lg">
                            <i class="fas fa-users"></i> ${escapeHtml(data.audience)}
                        </span>
                        <span class="bg-white/20 backdrop-blur-sm px-6 py-2 rounded-full text-lg">
                            <i class="fas fa-file-alt"></i> ${data.pageCount} 頁
                        </span>
                    </div>
                    <div class="text-center text-white/80 text-sm">
                        <p>建置者：${escapeHtml(data.author || '曾慶良（阿亮老師）')}</p>
                        <div class="flex justify-center space-x-4 mt-2">
                            <a href="https://www.facebook.com/iddmail" target="_blank" class="hover:text-yellow-300">
                                <i class="fab fa-facebook-square text-xl"></i> Facebook
                            </a>
                            <a href="https://www.youtube.com/@Liang-yt02" target="_blank" class="hover:text-yellow-300">
                                <i class="fab fa-youtube text-xl"></i> YouTube
                            </a>
                            <a href="https://thisnote.space/" target="_blank" class="hover:text-yellow-300">
                                <i class="fas fa-link text-xl"></i> AI 小幫手
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </div>`;
  } else if (isLastSlide) {
    // 尾頁 - 結論
    return `
    <div class="slide">
        <section class="gradient-bg text-white min-h-screen flex items-center justify-center py-20">
            <div class="container mx-auto px-4 text-center">
                <div class="max-w-4xl mx-auto">
                    <div class="mb-8">
                        <i class="fas fa-trophy text-8xl text-yellow-300"></i>
                    </div>
                    <h2 class="text-4xl md:text-5xl font-black mb-6">
                        ${escapeHtml(title)}
                    </h2>
                    <p class="text-xl mb-8 opacity-90">
                        ${escapeHtml(content)}
                    </p>
                    ${points.length > 0 ? `
                    <div class="bg-white/20 backdrop-blur-sm rounded-2xl p-8 mb-8">
                        <div class="space-y-4">
                            ${points.map(point => `
                            <div class="flex items-start text-left">
                                <i class="fas fa-check-circle text-green-300 text-2xl mr-4 mt-1"></i>
                                <p class="text-lg">${escapeHtml(point)}</p>
                            </div>
                            `).join('')}
                        </div>
                    </div>
                    ` : ''}
                    <p class="text-lg opacity-90">感謝您的觀看！</p>
                </div>
            </div>
        </section>
    </div>`;
  } else {
    // 內容頁 - 雙欄式
    return `
    <div class="slide">
        <section class="py-20 bg-gradient-to-b from-gray-50 to-white min-h-screen">
            <div class="container mx-auto px-4">
                <div class="max-w-6xl mx-auto">
                    <h2 class="text-4xl md:text-5xl font-black text-gray-800 mb-12 text-center">
                        ${escapeHtml(title)}
                    </h2>

                    <div class="grid md:grid-cols-2 gap-8">
                        <!-- 左欄 - 說明 -->
                        <div class="card-hover bg-white rounded-2xl shadow-xl p-8 border-t-4" style="border-color: ${colorTheme.primary}">
                            <div class="prose prose-lg">
                                <p class="text-gray-700 leading-relaxed mb-6">
                                    ${escapeHtml(content)}
                                </p>
                            </div>
                        </div>

                        <!-- 右欄 - 重點 -->
                        <div class="card-hover bg-white rounded-2xl shadow-xl p-8">
                            <h3 class="text-2xl font-bold text-gray-800 mb-6">
                                <i class="fas fa-lightbulb" style="color: ${colorTheme.accent}"></i> 重點整理
                            </h3>
                            <div class="space-y-4">
                                ${points.map((point, i) => `
                                <div class="flex items-start">
                                    <div class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-sm" style="background-color: ${colorTheme.primary}">
                                        ${i + 1}
                                    </div>
                                    <p class="ml-4 text-gray-700">${escapeHtml(point)}</p>
                                </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </div>`;
  }
}
