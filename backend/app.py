import os
from flask import Flask, redirect, url_for, session, jsonify, request
from flask_cors import CORS
from authlib.integrations.flask_client import OAuth
from flask_session import Session
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# Secure Session Config
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'fallback-secret-key')
app.config['SESSION_TYPE'] = 'filesystem'
app.config['SESSION_FILE_DIR'] = './flask_session'
app.config['SESSION_PERMANENT'] = False
app.config['SESSION_USE_SIGNER'] = True
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = "Lax"
app.config['SESSION_COOKIE_SECURE'] = False  # Set to True if using HTTPS
Session(app)

# OAuth Config
oauth = OAuth(app)
google = oauth.register(
    name='google',
    client_id=os.getenv('GOOGLE_CLIENT_ID'),
    client_secret=os.getenv('GOOGLE_CLIENT_SECRET'),
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration', 
    client_kwargs={'scope': 'openid email profile'},
)

@app.route('/')
def home():
    return jsonify({"message": "Flask backend is running!"})

@app.route('/login')
def login():
    redirect_uri = url_for('callback', _external=True)
    return google.authorize_redirect(redirect_uri)

@app.route('/login/callback')
def callback():
    try:
        token = google.authorize_access_token()
        user_info = google.parse_id_token(token)
        session['user'] = user_info
        return jsonify({"message": "Login successful", "user": user_info})
    except Exception as e:
        print("OAuth Error:", str(e))
        return jsonify({"error": "OAuth login failed", "details": str(e)}), 500

@app.route('/logout')
def logout():
    session.clear()
    return redirect('/')

if __name__ == '__main__':
    app.run(debug=True)
