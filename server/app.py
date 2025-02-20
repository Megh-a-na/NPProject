from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import random
import math
from typing import List, Dict, Any

app = Flask(__name__)
CORS(app)

# Store towers in memory
towers: List[Dict[str, Any]] = []
current_id = 1

# Indian localities data from schema.ts
INDIAN_LOCALITIES = {
    "pune_city": {
        "name": "Pune City Area, Maharashtra",
        "center": {"lat": 18.5204, "lng": 73.8567},
        "bounds": {
            "north": 18.6213,
            "south": 18.4221,
            "east": 73.9696,
            "west": 73.7458,
            "polygon": [
                [73.7458, 18.4821],
                [73.7958, 18.4221],
                [73.8567, 18.4321],
                [73.9196, 18.4521],
                [73.9696, 18.4921],
                [73.9596, 18.5421],
                [73.9396, 18.5821],
                [73.9096, 18.6213],
                [73.8567, 18.6113],
                [73.8067, 18.5913],
                [73.7658, 18.5421],
                [73.7458, 18.4821]
            ]
        }
    }
    # Add other localities here...
}

def calculate_terrain_favorability(lat: float, lng: float, locality_info: dict) -> float:
    """Calculate terrain favorability score."""
    center = locality_info["center"]
    distance_from_center = math.sqrt(
        (lat - center["lat"])**2 + (lng - center["lng"])**2
    ) * 111  # Convert to km

    # Base favorability decreases with distance from center
    base_favorability = 100 - (distance_from_center * 10)
    # Add a small deterministic variation based on coordinates
    variation = (math.sin(lat * 100) + math.cos(lng * 100)) * 5
    
    return max(50, min(100, base_favorability + variation))

def calculate_environmental_interference(lat: float, lng: float, locality_info: dict) -> float:
    """Calculate environmental interference score."""
    center = locality_info["center"]
    bounds = locality_info["bounds"]
    
    # Calculate distances
    distance_from_center = math.sqrt(
        (lat - center["lat"])**2 + (lng - center["lng"])**2
    ) * 111

    # Use coordinate-based deterministic calculation
    interference = (
        20 * math.exp(-distance_from_center/2) +  # Urban density effect
        15 * math.sin(lat * 100) * math.cos(lng * 100)  # Terrain variation
    )
    
    return max(0, min(50, interference))

def calculate_accessibility(lat: float, lng: float, locality_info: dict) -> float:
    """Calculate accessibility score."""
    center = locality_info["center"]
    distance_from_center = math.sqrt(
        (lat - center["lat"])**2 + (lng - center["lng"])**2
    ) * 111

    # Base accessibility decreases with distance from center
    base_accessibility = 90 - (distance_from_center * 5)
    # Add deterministic variation based on coordinates
    variation = (math.cos(lat * 50) + math.sin(lng * 50)) * 10
    
    return max(50, min(100, base_accessibility + variation))

def compute_performance_score(site: dict) -> float:
    """Compute performance score using consistent weights."""
    # Use fixed weights from schema
    weights = {
        "terrain": 0.4,
        "accessibility": 0.3,
        "distance": 0.2,
        "environment": 0.1
    }
    
    score = (
        weights["terrain"] * site["terrain"] +
        weights["accessibility"] * site["accessibility"] -
        weights["distance"] * (site["distance"] * 5) -
        weights["environment"] * site["environment"]
    )
    
    return score

def generate_candidate_sites(locality: str, num_sites: int = 20) -> List[Dict[str, Any]]:
    """Generate candidate sites with consistent scoring."""
    locality_info = INDIAN_LOCALITIES[locality]
    sites = []
    bounds = locality_info["bounds"]
    
    # Generate a grid of points
    lat_step = (bounds["north"] - bounds["south"]) / (int(math.sqrt(num_sites)) + 1)
    lng_step = (bounds["east"] - bounds["west"]) / (int(math.sqrt(num_sites)) + 1)
    
    for i in range(int(math.sqrt(num_sites))):
        for j in range(int(math.sqrt(num_sites))):
            lat = bounds["south"] + lat_step * (i + 1)
            lng = bounds["west"] + lng_step * (j + 1)
            
            # Calculate distance from center
            distance = math.sqrt(
                (lat - locality_info["center"]["lat"])**2 + 
                (lng - locality_info["center"]["lng"])**2
            ) * 111
            
            # Calculate site characteristics
            terrain = calculate_terrain_favorability(lat, lng, locality_info)
            environment = calculate_environmental_interference(lat, lng, locality_info)
            accessibility = calculate_accessibility(lat, lng, locality_info)
            
            site = {
                "latitude": lat,
                "longitude": lng,
                "terrain": terrain,
                "environment": environment,
                "accessibility": accessibility,
                "distance": distance
            }
            
            site["score"] = compute_performance_score(site)
            sites.append(site)
    
    # Sort by score
    return sorted(sites, key=lambda x: x["score"], reverse=True)

@app.route('/api/towers', methods=['GET'])
def get_towers():
    return jsonify(towers)

@app.route('/api/towers', methods=['POST'])
def create_tower():
    global current_id
    data = request.json
    
    # Create new tower with auto-incrementing ID
    tower = {
        "id": current_id,
        "name": data["name"],
        "locality": data["locality"],
        "height": str(data["height"]),
        "transmissionPower": str(data["transmissionPower"]),
        "frequency": str(data["frequency"]),
        "antennaGain": str(data["antennaGain"]),
        "latitude": str(data["latitude"]),
        "longitude": str(data["longitude"])
    }
    
    towers.append(tower)
    current_id += 1
    return jsonify(tower), 201

@app.route('/api/towers/<int:tower_id>', methods=['DELETE'])
def delete_tower(tower_id):
    global towers
    towers = [t for t in towers if t["id"] != tower_id]
    return '', 204

@app.route('/api/optimize', methods=['POST'])
def optimize_placement():
    data = request.json
    locality = data["locality"]
    num_towers = data["numTowers"]
    
    candidates = generate_candidate_sites(locality, num_towers * 4)
    best_sites = candidates[:num_towers]
    
    return jsonify([{
        "latitude": site["latitude"],
        "longitude": site["longitude"],
        "score": site["score"],
        "details": {
            "terrain": site["terrain"],
            "environment": site["environment"],
            "accessibility": site["accessibility"],
            "distance": site["distance"]
        }
    } for site in best_sites])

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
