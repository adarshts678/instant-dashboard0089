from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Allow requests from frontend

@app.route('/generate', methods=['POST'])
def generate():
    content = request.json
    data = content.get('data')
    prompt = content.get('prompt')
    # Here, call your AI API and generate HTML based on data and prompt
    # For now, return a placeholder
    html = f"<div><h2>{data.get('report_title', 'Dashboard')}</h2><p>{prompt}</p></div>"
    return jsonify({'html': html})

if __name__ == '__main__':
    app.run(port=5000)