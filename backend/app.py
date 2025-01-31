from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Allows frontend to call API

@app.route('/')
def home():
    return jsonify({"message": "Flask backend is running!"})

@app.route('/api/data')
def get_data():
    return jsonify({"data": "Some data"})

if __name__ == '__main__':
    app.run(debug=True)  # Only needed for local testing