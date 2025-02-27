from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import os
import pandas as pd
from data_generator import generate_site_data
import analysis

app = Flask(__name__, static_folder="../frontend/build", static_url_path="")
CORS(app)  # Allow frontend to fetch data

DATA_FILE = "site_data.csv"

# Ensure data file exists
if not os.path.exists(DATA_FILE):
    df = generate_site_data()
    df.to_csv(DATA_FILE, index=False)


@app.route("/")
def serve_react():
    """Serve the React frontend."""
    return send_from_directory(app.static_folder, "index.html")


@app.route("/generate-sites", methods=["GET"])
def generate_sites():
    """Generate a dataset based on user inputs."""
    subdistrict = request.args.get("subdistrict", default=None, type=str)
    num_sites = request.args.get("num", default=10, type=int)

    df = generate_site_data(num_sites)  # Generate sites based on number
    if subdistrict:
        df = df[df["Subdistrict"] == subdistrict]  # Filter by subdistrict

    df.to_csv(DATA_FILE, index=False)  # Save to CSV for later use
    return jsonify(df.to_dict(orient="records"))


@app.route("/top-sites/<subdistrict>/<int:n>", methods=["GET"])
def get_top_sites(subdistrict, n):
    """Return the top N sites for a given subdistrict."""
    df = pd.read_csv(DATA_FILE)
    top_sites = analysis.get_top_sites(df, subdistrict, n)
    return jsonify(top_sites.to_dict(orient="records"))


if __name__ == "__main__":
    app.run(debug=True, port=5000)
