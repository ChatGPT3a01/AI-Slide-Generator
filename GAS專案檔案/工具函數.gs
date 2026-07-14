/**
 * ==========================================================================
 * 工具函數.gs
 * ==========================================================================
 * 提供共用的工具函數
 * ==========================================================================
 */

/**
 * escapeHtml - HTML 特殊字元轉義
 * 防止 XSS 攻擊
 *
 * @param {String} text - 要轉義的文字
 * @return {String} 轉義後的文字
 */
function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * getColorTheme - 取得色彩主題
 *
 * @param {String} themeName - 主題名稱
 * @return {Object} 色彩物件
 */
function getColorTheme(themeName) {
  const colorMap = {
    'blue': {
      primary: '#2563eb',
      secondary: '#3b82f6',
      accent: '#60a5fa',
      bg: '#eff6ff',
      text: '#1e40af'
    },
    'warm': {
      primary: '#F9A826',
      secondary: '#f59e0b',
      accent: '#fbbf24',
      bg: '#FFFBF5',
      text: '#92400e'
    },
    'corporate': {
      primary: '#1e40af',
      secondary: '#059669',
      accent: '#0891b2',
      bg: '#ecfdf5',
      text: '#065f46'
    },
    'dark': {
      primary: '#1f2937',
      secondary: '#374151',
      accent: '#6b7280',
      bg: '#111827',
      text: '#f9fafb'
    },
    'bright': {
      primary: '#ec4899',
      secondary: '#8b5cf6',
      accent: '#06b6d4',
      bg: '#fdf4ff',
      text: '#831843'
    }
  };

  return colorMap[themeName] || colorMap['blue'];
}

/**
 * formatDate - 格式化日期
 *
 * @param {Date} date - 日期物件
 * @return {String} 格式化後的日期字串
 */
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

/**
 * generateSlideId - 生成唯一的投影片 ID
 *
 * @return {String} 唯一 ID
 */
function generateSlideId() {
  return 'slide_' + new Date().getTime() + '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * parseKeywords - 解析關鍵字字串
 *
 * @param {String} keywordsString - 關鍵字字串（逗號分隔）
 * @return {Array} 關鍵字陣列
 */
function parseKeywords(keywordsString) {
  if (!keywordsString) return [];
  return keywordsString.split(/[,，]/).map(k => k.trim()).filter(k => k.length > 0);
}

/**
 * truncateText - 截斷文字
 *
 * @param {String} text - 原始文字
 * @param {Number} maxLength - 最大長度
 * @return {String} 截斷後的文字
 */
function truncateText(text, maxLength) {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * validateData - 驗證簡報資料
 *
 * @param {Object} data - 簡報資料
 * @return {Object} 驗證結果 {valid: boolean, errors: []}
 */
function validateData(data) {
  const errors = [];

  if (!data.topic || data.topic.trim() === '') {
    errors.push('簡報主題不能為空');
  }

  if (!data.apiKey || data.apiKey.trim() === '') {
    errors.push('API Key 不能為空');
  }

  if (!data.pageCount || data.pageCount < 5 || data.pageCount > 20) {
    errors.push('頁數必須在 5-20 之間');
  }

  return {
    valid: errors.length === 0,
    errors: errors
  };
}
