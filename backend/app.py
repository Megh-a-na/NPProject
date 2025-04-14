from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import os
import pandas as pd
from data_generator import generate_site_data
import analysis
import sqlite3
import login  # Our updated login module

app = Flask(__name__, static_folder="../frontend/build", static_url_path="")
CORS(app)  # Allow frontend to fetch data

DATA_FILE = os.path.join(os.path.dirname(__file__), "..", "site_data.csv")

# Ensure data file exists
if not os.path.exists(DATA_FILE):
    print ('1st time running, generating data...')
    df = generate_site_data()
    df.to_csv(DATA_FILE, index=False)
else:
    print ('Data file already exists, skipping generation.')


@app.route("/")
def serve_react():
    """Serve the React frontend."""
    return send_from_directory(app.static_folder, "index.html")


@app.route("/generate-sites", methods=["GET"])
def get_optimized_sites():
    """Generate optimized tower sites based on subdistrict and number of towers."""
    subdistrict = request.args.get("subdistrict")
    num_towers = request.args.get("num", default=5, type=int)
    
    print(f"Requested: subdistrict={subdistrict}, num_towers={num_towers}")  # Debug line
    
    if not subdistrict:
        return jsonify({"error": "Subdistrict parameter is required"}), 400
    
    try:
        # Load the CSV data
        df = pd.read_csv(DATA_FILE)
        
        # Calculate Total_Score if it doesn't exist
        if 'Total_Score' not in df.columns:
            # Calculate weighted score
            weights = {
                'AQI_Score': 0.2,
                'Distance_Score': 0.25,
                'Accessibility_Score': 0.3,
                'Environmental_Interference': 0.25
            }
            df['Total_Score'] = (df['AQI_Score'] * weights['AQI_Score'] + 
                                df['Distance_Score'] * weights['Distance_Score'] + 
                                df['Accessibility_Score'] * weights['Accessibility_Score'] + 
                                df['Environmental_Interference'] * weights['Environmental_Interference'])
        
        # Use the analysis module to get optimized sites
        optimized_sites = analysis.get_top_sites(df, subdistrict=subdistrict, n=num_towers)
        
        # Convert to a list of dictionaries for JSON response
        result = optimized_sites.to_dict(orient="records")
        
        print(f"Returning {len(result)} sites")  # Debug line
        return jsonify(result)
    except Exception as e:
        print(f"Error: {str(e)}")  # Debug line
        return jsonify({"error": str(e)}), 500


@app.route("/top-sites/<subdistrict>/<int:n>", methods=["GET"])
def get_top_sites(subdistrict, n):
    """Return the top N sites for a given subdistrict."""
    df = pd.read_csv(DATA_FILE)
    top_sites = analysis.get_top_sites(df, subdistrict, n)
    return jsonify(top_sites.to_dict(orient="records"))


@app.route("/available-locations", methods=["GET"])
def available_locations():
    """Return the available locations."""
    df = pd.read_csv(DATA_FILE)
    locations = df["Subdistrict"].unique().tolist()
    return jsonify(locations)


@app.route("/api/register", methods=["POST"])
def register():
    """Register a new user and return the status."""
    data = request.json
    full_name = data.get('fullName')
    email = data.get('email')
    password = data.get('password')
    
    if not all([full_name, email, password]):
        return jsonify({"success": False, "message": "Missing required fields"}), 400
    
    result = login.register_user(full_name, email, password)
    
    if result["success"]:
        return jsonify(result), 201
    else:
        return jsonify(result), 400


@app.route("/api/login", methods=["POST"])
def user_login():
    """Verify login credentials and return user info if valid."""
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    if not all([email, password]):
        return jsonify({"success": False, "message": "Missing email or password"}), 400
    
    result = login.verify_login(email, password)
    
    if result["success"]:
        return jsonify(result), 200
    else:
        return jsonify(result), 401


@app.route("/api/site-analysis/<int:site_id>", methods=["GET"])
def get_site_analysis(site_id):
    """Get detailed cost and logistics analysis for a specific site."""
    try:
        print(f"Loading data from: {os.path.abspath(DATA_FILE)}")  # Debug line
        df = pd.read_csv(DATA_FILE)
        print(f"Total sites loaded: {len(df)}")  # Debug line
        
        # Check if site_id is valid
        if site_id < 0 or site_id >= len(df):
            return jsonify({
                "error": f"Invalid site_id. Must be between 0 and {len(df)-1}",
                "total_sites": len(df),
                "data_file_path": os.path.abspath(DATA_FILE)
            }), 400
            
        # Reset index to make sure we can access by position
        df = df.reset_index(drop=True)
        site_data = df.iloc[site_id].to_dict()
        
        # Get tower recommendations
        tower_recommendations = analysis.get_tower_recommendations(site_data)
        
        # Get cost estimates for each recommended tower type
        cost_analysis = {}
        for rec in tower_recommendations['recommendations']:
            tower_type = rec['tower_type']
            capex = analysis.calculate_capex_estimate(site_data, tower_type)
            opex = analysis.calculate_opex_estimate(site_data)
            checklist = analysis.get_installation_checklist(site_data, tower_type)
            
            cost_analysis[tower_type] = {
                'capex': capex,
                'opex': opex,
                'installation_checklist': checklist
            }
        
        return jsonify({
            'site_data': site_data,
            'tower_recommendations': tower_recommendations,
            'cost_analysis': cost_analysis
        })
    except Exception as e:
        print(f"Error occurred: {str(e)}")  # Debug line
        return jsonify({
            "error": str(e),
            "message": "An error occurred while processing the site analysis",
            "data_file_path": os.path.abspath(DATA_FILE)
        }), 500


@app.route("/api/cost-estimate", methods=["POST"])
def get_cost_estimate():
    """Get cost estimate for a specific tower type and site characteristics."""
    try:
        data = request.json
        site_data = data.get('site_data', {})
        tower_type = data.get('tower_type', 'standard')
        
        capex = analysis.calculate_capex_estimate(site_data, tower_type)
        opex = analysis.calculate_opex_estimate(site_data)
        
        return jsonify({
            'capex': capex,
            'opex': opex,
            'total_first_year_cost': capex['total_capex'] + opex['total_opex']
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/installation-checklist", methods=["POST"])
def get_installation_checklist():
    """Get installation checklist for a specific tower type and site."""
    try:
        data = request.json
        site_data = data.get('site_data', {})
        tower_type = data.get('tower_type', 'standard')
        
        checklist = analysis.get_installation_checklist(site_data, tower_type)
        return jsonify(checklist)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, port=5000)
