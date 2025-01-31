import os
import secrets
from flask import Flask, redirect, url_for, session, jsonify, request
from flask_session import Session
from flask_cors import CORS
from authlib.integrations.flask_client import OAuth
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app, supports_credentials=True, origins=["http://localhost:3000", "https://pj-timewise.netlify.app"])
IS_PRODUCTION = os.getenv("FLASK_ENV") == "production"

# Secure Session Config
app.config.update(
    SECRET_KEY=os.getenv('SECRET_KEY', 'fallback-secret-key'),
    SESSION_TYPE="filesystem",
    SESSION_PERMANENT=False,
    SESSION_USE_SIGNER=True,
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE="Lax",
    SESSION_COOKIE_SECURE=IS_PRODUCTION, # Secure only in production
)
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
    session['oauth_nonce'] = secrets.token_urlsafe(16)
    session['oauth_state'] = secrets.token_hex(16)

    # Dynamically set scheme based on environment
    redirect_uri = url_for('callback', _external=True, _scheme="https" if IS_PRODUCTION else "http")

    return google.authorize_redirect(redirect_uri, nonce=session['oauth_nonce'], state=session['oauth_state'])

@app.route('/login/callback')
def callback():
    try:
        if session.pop('oauth_state', None) != request.args.get('state'):
            return jsonify({"error": "CSRF Warning! State does not match."}), 400

        token = google.authorize_access_token()
        nonce = session.pop('oauth_nonce', None)
        if not nonce:
            return jsonify({"error": "Invalid login attempt: nonce missing"}), 400

        session['user'] = google.parse_id_token(token, nonce=nonce)

        # Redirect to frontend with login success
        frontend_url = "http://localhost:3000" if not IS_PRODUCTION else "https://pj-timewise.netlify.app"
        return redirect(f"{frontend_url}/")  

    except Exception as e:
        print("OAuth Error:", str(e))
        return jsonify({"error": "OAuth login failed", "details": str(e)}), 500

@app.route('/get-user')
def get_user():
    user = session.get('user')
    return jsonify({"user": user})

@app.route('/logout')
def logout():
    session.clear()
    return jsonify({"message": "Logged out successfully"})

if __name__ == '__main__':
    app.run(debug=not IS_PRODUCTION)