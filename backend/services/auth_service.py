"""Small SQLite-backed farmer account service using salted PBKDF2 password hashes."""
import hashlib
import hmac
import secrets
import sqlite3
import time
from pathlib import Path

DB_PATH = Path(__file__).resolve().parent.parent / "farmer_accounts.db"
ITERATIONS = 310_000
SESSION_SECONDS = 60 * 60 * 24 * 30


def _connect():
    conn = sqlite3.connect(DB_PATH, timeout=10)
    conn.row_factory = sqlite3.Row
    return conn


def init_auth_db():
    with _connect() as conn:
        conn.execute("""CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            full_name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE COLLATE NOCASE,
            password_hash TEXT NOT NULL,
            password_salt TEXT NOT NULL,
            district TEXT NOT NULL DEFAULT '',
            village TEXT NOT NULL DEFAULT '',
            preferred_language TEXT NOT NULL DEFAULT 'en',
            created_at INTEGER NOT NULL
        )""")
        conn.execute("""CREATE TABLE IF NOT EXISTS sessions (
            token_hash TEXT PRIMARY KEY,
            user_id INTEGER NOT NULL,
            expires_at INTEGER NOT NULL,
            created_at INTEGER NOT NULL,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        )""")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id)")


def _public_user(row):
    return {"id": row["id"], "full_name": row["full_name"], "email": row["email"],
            "district": row["district"], "village": row["village"],
            "preferred_language": row["preferred_language"], "created_at": row["created_at"]}


def _hash_password(password, salt):
    return hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), bytes.fromhex(salt), ITERATIONS).hex()


def create_user(full_name, email, password, district="", village="", preferred_language="en"):
    full_name = " ".join(full_name.strip().split())
    email = email.strip().lower()
    if len(full_name) < 2 or len(full_name) > 80:
        raise ValueError("Enter a name between 2 and 80 characters.")
    if len(password) < 8 or len(password) > 128:
        raise ValueError("Password must be between 8 and 128 characters.")
    if "@" not in email or len(email) > 254 or email.startswith("@") or email.endswith("@"):
        raise ValueError("Enter a valid email address.")
    salt = secrets.token_hex(16)
    password_hash = _hash_password(password, salt)
    now = int(time.time())
    with _connect() as conn:
        try:
            cursor = conn.execute(
                "INSERT INTO users (full_name,email,password_hash,password_salt,district,village,preferred_language,created_at) VALUES (?,?,?,?,?,?,?,?)",
                (full_name, email, password_hash, salt, district.strip()[:80], village.strip()[:100], preferred_language if preferred_language in {"en", "hi", "mr"} else "en", now),
            )
        except sqlite3.IntegrityError:
            raise ValueError("An account with this email already exists. Please sign in instead.")
        row = conn.execute("SELECT * FROM users WHERE id = ?", (cursor.lastrowid,)).fetchone()
    return _public_user(row)


def login(email, password):
    with _connect() as conn:
        row = conn.execute("SELECT * FROM users WHERE email = ? COLLATE NOCASE", (email.strip().lower(),)).fetchone()
        if not row or not hmac.compare_digest(_hash_password(password, row["password_salt"]), row["password_hash"]):
            raise ValueError("Email or password is incorrect.")
        token = secrets.token_urlsafe(40)
        now = int(time.time())
        conn.execute("DELETE FROM sessions WHERE expires_at < ?", (now,))
        conn.execute("INSERT INTO sessions (token_hash,user_id,expires_at,created_at) VALUES (?,?,?,?)",
                     (hashlib.sha256(token.encode()).hexdigest(), row["id"], now + SESSION_SECONDS, now))
    return token, _public_user(row)


def get_user_for_token(token):
    if not token:
        return None
    token_hash = hashlib.sha256(token.encode()).hexdigest()
    now = int(time.time())
    with _connect() as conn:
        row = conn.execute("""SELECT users.* FROM users JOIN sessions ON sessions.user_id = users.id
            WHERE sessions.token_hash = ? AND sessions.expires_at > ?""", (token_hash, now)).fetchone()
    return _public_user(row) if row else None


def revoke_token(token):
    if token:
        with _connect() as conn:
            conn.execute("DELETE FROM sessions WHERE token_hash = ?", (hashlib.sha256(token.encode()).hexdigest(),))
