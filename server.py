from flask import Flask, request, jsonify
from flask_cors import CORS
import base64

app = Flask(__name__)
CORS(app) # Cho phép React gọi API từ port khác

@app.route('/api/generate-code', methods=['POST'])
def generate_code():
    data = request.json
    user_id = data.get('id')
    password = data.get('password')

    if not user_id or not password:
        return jsonify({"message": "Thiếu dữ liệu"}), 400

    # Logic tạo mã đặc biệt
    raw_string = f"ID:{user_id}|PASS:{password}|FROM:PYTHON_SERVER"
    special_code = base64.b64encode(raw_string.encode()).decode()

    return jsonify({
        "success": True,
        "code": f"PY-LOCAL-{special_code[:20]}"
    })

if __name__ == '__main__':
    print("Server Python đang chạy tại http://127.0.0.1:5000")
    app.run(port=5000, debug=True)