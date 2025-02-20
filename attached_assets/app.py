import os
import logging
from flask import Flask, jsonify, render_template
from flask_cors import CORS

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Create Flask app
app = Flask(__name__)

# Configure CORS
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Set secret key
app.secret_key = os.environ.get("SESSION_SECRET", "default-secret-key")

# Import routes after app creation to avoid circular imports
from routes.api import api_bp
app.register_blueprint(api_bp, url_prefix='/api')

@app.route('/map')
def map_view():
    return render_template('map.html')

# Error handlers
@app.errorhandler(404)
def not_found_error(error):
    return jsonify({"status": "error", "message": "Resource not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"status": "error", "message": "Internal server error"}), 500

# Root route
@app.route('/')
def index():
    return render_template('index.html')