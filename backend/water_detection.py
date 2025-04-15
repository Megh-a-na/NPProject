# water_detection.py
# Module for detecting water bodies and finding nearest land points

import math
import requests
import numpy as np
from functools import lru_cache

# Cache results to avoid repeated API calls for the same coordinates
@lru_cache(maxsize=1000)
def is_in_water(latitude, longitude):
    """
    Determine if a given coordinate is in water (ocean, lake, river).
    
    Args:
        latitude (float): Latitude coordinate
        longitude (float): Longitude coordinate
        
    Returns:
        bool: True if location is in water, False otherwise
    """
    # Method 1: Check against known water body boundaries
    # Major coastal areas in India
    
    # Arabian Sea (West Coast)
    if longitude < 72.8 and latitude > 8.0 and latitude < 23.0:
        return True
        
    # Bay of Bengal (East Coast)
    if longitude > 80.2 and latitude > 8.0 and latitude < 22.0:
        return True
    
    # Major lakes and rivers
    water_bodies = [
        # Format: [name, min_lat, max_lat, min_lon, max_lon]
        ["Chilika Lake", 19.5, 19.9, 85.1, 85.5],
        ["Dal Lake", 34.0, 34.1, 74.8, 74.9],
        ["Wular Lake", 34.3, 34.4, 74.5, 74.6],
        ["Loktak Lake", 24.5, 24.6, 93.8, 93.9],
        ["Bhimtal Lake", 29.3, 29.4, 79.5, 79.6],
        ["Vembanad Lake", 9.5, 10.2, 76.2, 76.5],
        ["Pulicat Lake", 13.4, 13.6, 80.1, 80.3],
        ["Hussain Sagar", 17.4, 17.5, 78.4, 78.5],
        ["Powai Lake", 19.1, 19.2, 72.9, 73.0],
        # Major rivers with approximate bounding boxes
        ["Ganges Delta", 21.5, 23.0, 88.0, 91.0],
        ["Brahmaputra", 26.0, 27.5, 91.0, 95.0],
        ["Yamuna Delhi", 28.5, 28.8, 77.2, 77.4],
        ["Godavari", 16.5, 17.0, 81.7, 82.2],
        ["Krishna", 15.8, 16.2, 80.8, 81.2],
        ["Narmada", 21.8, 22.0, 73.0, 74.0],
        ["Kaveri", 10.8, 11.2, 78.7, 79.2],
    ]
    
    for body in water_bodies:
        if (latitude >= body[1] and latitude <= body[2] and 
            longitude >= body[3] and longitude <= body[4]):
            return True
    
    # Method 2: Try to use OpenStreetMap data via Nominatim API
    # This is a fallback and might not be 100% accurate for water detection
    try:
        url = f"https://nominatim.openstreetmap.org/reverse?format=json&lat={latitude}&lon={longitude}&zoom=18&addressdetails=1"
        headers = {"User-Agent": "TowerPlacementOptimizer/1.0"}
        response = requests.get(url, headers=headers, timeout=3)
        
        if response.status_code == 200:
            data = response.json()
            # Check if any water-related terms are in the response
            response_str = str(data).lower()
            water_terms = ["ocean", "sea", "lake", "river", "water", "bay", "pond", "reservoir"]
            
            for term in water_terms:
                if term in response_str:
                    return True
    except Exception as e:
        print(f"Error checking location via API: {e}")
    
    return False

def get_nearest_land_point(latitude, longitude, search_radius=0.05, steps=10):
    """
    Find the nearest land point to a given water location.
    
    Args:
        latitude (float): Latitude of the water location
        longitude (float): Longitude of the water location
        search_radius (float): Maximum search radius in degrees
        steps (int): Number of steps to search in each direction
        
    Returns:
        tuple: (latitude, longitude) of nearest land point, or original coordinates if no land found
    """
    # If the point is already on land, return it
    if not is_in_water(latitude, longitude):
        return (latitude, longitude)
    
    # Search in expanding circles
    for radius in np.linspace(0.001, search_radius, steps):
        # Try 8 directions (N, NE, E, SE, S, SW, W, NW)
        for angle in range(0, 360, 45):
            rad_angle = math.radians(angle)
            new_lat = latitude + radius * math.cos(rad_angle)
            new_lon = longitude + radius * math.sin(rad_angle)
            
            if not is_in_water(new_lat, new_lon):
                return (new_lat, new_lon)
    
    # If no land found within search radius, return original coordinates
    return (latitude, longitude)