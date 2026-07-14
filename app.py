from flask import Flask, render_template, request, jsonify, send_file
import requests
import json
import os
from datetime import datetime

app = Flask(__name__)

# 確保簡報儲存資料夾存在
PRESENTATION_DIR = os.path.join('static', 'presentations')
os.makedirs(PRESENTATION_DIR, exist_ok=True)

# 你的 Google Apps Script 網址（請更新）
GAS_URL = "https://script.google.com/macros/s/AKfycbxnwsKGY8T-3sdGdAsU4NGfdCTNlxDULZIIOa6ABVtnqyYBucJ2TgK4ye4D95Qei6t4/exec"

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/generate', methods=['POST'])
def generate():
    try:
        data = request.get_json()
        print(f"收到資料: {data}")

        # 傳送到 GAS
        response = requests.post(
            GAS_URL,
            json=data,
            headers={'Content-Type': 'application/json'}
        )

        print(f"GAS 回傳: {response.status_code}")
        print(f"GAS 回傳內容: {response.text[:500]}")  # 只顯示前500字元

        if response.status_code == 200:
            result = response.json()

            if result.get('status') == 'success':
                generation_mode = data.get('generationMode', 'ai-full')
                timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')

                if generation_mode == 'both':
                    # 儲存兩個版本
                    ai_filename = f"presentation_ai_{timestamp}.html"
                    ai_filepath = os.path.join(PRESENTATION_DIR, ai_filename)
                    with open(ai_filepath, 'w', encoding='utf-8') as f:
                        f.write(result['ai_html'])

                    template_filename = f"presentation_template_{timestamp}.html"
                    template_filepath = os.path.join(PRESENTATION_DIR, template_filename)
                    with open(template_filepath, 'w', encoding='utf-8') as f:
                        f.write(result['template_html'])

                    result['ai_url'] = f'/static/presentations/{ai_filename}'
                    result['template_url'] = f'/static/presentations/{template_filename}'
                    result['ai_filename'] = ai_filename
                    result['template_filename'] = template_filename

                else:
                    # 單一版本
                    filename = f"presentation_{timestamp}.html"
                    filepath = os.path.join(PRESENTATION_DIR, filename)

                    html_content = result.get('html_content') or result.get('ai_html') or result.get('template_html')
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(html_content)

                    result['local_url'] = f'/static/presentations/{filename}'
                    result['filename'] = filename

            return jsonify(result)
        else:
            return jsonify({
                "status": "error",
                "message": f"GAS 錯誤: {response.text}"
            })

    except Exception as e:
        print(f"錯誤: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            "status": "error",
            "message": str(e)
        })

@app.route('/preview/<filename>')
def preview(filename):
    filepath = os.path.join(PRESENTATION_DIR, filename)
    if os.path.exists(filepath):
        return send_file(filepath)
    return "檔案不存在", 404

if __name__ == '__main__':
    app.run(debug=True, port=5000)
