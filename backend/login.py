import sqlite3
import hashlib
import os

# Database file path
DB_FILE = 'user_database.db'

def initialize_database():
    """Create database and tables if they don't exist."""
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    
    # Create users table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        full_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    
    conn.commit()
    conn.close()
    print(f"Database initialized: {DB_FILE}")

def hash_password(password):
    """Hash a password for storing."""
    # In a real application, use a more secure method with salt
    return hashlib.sha256(password.encode()).hexdigest()

def register_user(full_name, email, password):
    """Register a new user in the SQLite database."""
    # Initialize database if not exists
    initialize_database()
    
    try:
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        
        # Check if email already exists
        cursor.execute("SELECT email FROM users WHERE email = ?", (email,))
        if cursor.fetchone():
            conn.close()
            return {"success": False, "message": "Email already registered"}
        
        # Insert new user
        cursor.execute(
            "INSERT INTO users (full_name, email, password_hash) VALUES (?, ?, ?)",
            (full_name, email, hash_password(password))
        )
        
        conn.commit()
        conn.close()
        
        return {"success": True, "message": "User registered successfully"}
    
    except sqlite3.Error as e:
        print(f"Database error: {e}")
        return {"success": False, "message": f"Database error: {str(e)}"}

def verify_login(email, password):
    """Verify user login credentials from SQLite database."""
    # Initialize database if not exists
    initialize_database()
    
    try:
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        
        # Get user by email and password hash
        cursor.execute(
            "SELECT full_name FROM users WHERE email = ? AND password_hash = ?",
            (email, hash_password(password))
        )
        
        user = cursor.fetchone()
        conn.close()
        
        if user:
            return {"success": True, "user": {"email": email, "full_name": user[0]}}
        else:
            return {"success": False, "message": "Invalid email or password"}
    
    except sqlite3.Error as e:
        print(f"Database error: {e}")
        return {"success": False, "message": f"Database error: {str(e)}"} 