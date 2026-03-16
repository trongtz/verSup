from flask import Flask, request, jsonify
from flask_cors import CORS
import base64

app = Flask(__name__)
CORS(app)

@app.route('/api/generate-code', methods=['POST'])
def generate_code():
    data = request.json
    user_id = data.get('id')
    password = data.get('password')

    if not user_id or not password:
        return jsonify({"success": False, "message": "Missing data"}), 400

    # Logic tạo mã
    raw_string = f"ID:{user_id}|PASS:{password}|VERCEL:PYTHON"
    special_code = base64.b64encode(raw_string.encode()).decode()

    return jsonify({
        "success": True,
        "code": f"SIG-{special_code[:20]}"
    })

# Không cần app.run() vì Vercel sẽ tự quản lý