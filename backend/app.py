import os
import secrets
import flask
from flask import Flask, redirect, url_for, session, jsonify, request
from flask_session import Session
from flask_cors import CORS
from authlib.integrations.flask_client import OAuth
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(
    app,
    supports_credentials=True,
    origins=["http://localhost:3000", "https://pj-timewise.netlify.app"],  
    methods=["GET", "POST", "OPTIONS", "DELETE", "PUT"], 
    allow_headers=["Content-Type", "Authorization"], 
)
IS_PRODUCTION = os.getenv("FLASK_ENV") == "production"

# Secure Session Config
app.config.update(
    SECRET_KEY=os.getenv("SECRET_KEY", "fallback-secret-key"),
    SESSION_TYPE="filesystem",
    SESSION_PERMANENT=True,
    SESSION_USE_SIGNER=True,
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE="None",
    SESSION_COOKIE_SECURE=IS_PRODUCTION,  # Secure only in production
)
Session(app)

# OAuth Config
oauth = OAuth(app)
google = oauth.register(
    name="google",
    client_id=os.getenv("GOOGLE_CLIENT_ID"),
    client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    client_kwargs={"scope": "openid email profile"},
)

@app.route("/")
def home():
    return jsonify({"message": "Flask backend is running!"})


@app.route("/login")
def login():
    session["oauth_nonce"] = secrets.token_urlsafe(16)
    session["oauth_state"] = secrets.token_hex(16)

    # Dynamically set scheme based on environment
    redirect_uri = url_for(
        "callback", _external=True, _scheme="https" if IS_PRODUCTION else "http"
    )

    return google.authorize_redirect(
        redirect_uri, nonce=session["oauth_nonce"], state=session["oauth_state"]
    )


@app.route("/login/callback")
def callback():
    try:
        if session.pop("oauth_state", None) != request.args.get("state"):
            return jsonify({"error": "CSRF Warning! State does not match."}), 400

        token = google.authorize_access_token()
        nonce = session.pop("oauth_nonce", None)
        if not nonce:
            return jsonify({"error": "Invalid login attempt: nonce missing"}), 400

        user_info = google.parse_id_token(token, nonce=nonce)

        # ✅ Store only the necessary user details
        session["user"] = {
            "first_name": user_info.get("given_name", ""),
            "last_name": user_info.get("family_name", ""),
            "email": user_info.get("email", ""),
        }

        session.modified = True  # ✅ Ensure session is saved

        # ✅ Redirect to frontend
        response = redirect("http://localhost:3000" if not IS_PRODUCTION else "https://pj-timewise.netlify.app")

        # ✅ Force Flask to correctly set the session cookie
        response.set_cookie(
            "session",
            request.cookies.get("session"),  # ✅ Retrieve the existing session cookie
            httponly=True,
            secure=IS_PRODUCTION,  # Secure only in production
            samesite="None",  # ✅ Required for cross-origin authentication
            domain="",  # ✅ Let Flask dynamically determine the correct domain
        )

        return response

    except Exception as e:
        print("OAuth Error:", str(e))
        return jsonify({"error": "OAuth login failed", "details": str(e)}), 500

@app.route("/get-user")
def get_user():
    print("Session Data:", session)  # Debugging
    print("Request Cookies:", request.cookies)  # Debug cookies from request
    user = session.get("user")
    if user:
        return jsonify(user)
    return jsonify({"error": "User not logged in"}), 401

@app.route("/logout")
def logout():
    session.clear()
    return jsonify({"message": "Logged out successfully"})


if __name__ == "__main__":
    app.run(debug=not IS_PRODUCTION)