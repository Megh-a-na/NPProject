import numpy as np
import pandas as pd
import os 

DATA_FILE = 'site_data.csv'

def generate_site_data(num_sites=50):
    """Generate a dataset of network tower locations."""
    np.random.seed(42)

    subdistricts = {
        'Whitefield': {'district': 'Bangalore Urban', 'lat': 12.97, 'lon': 77.73},
        'Andheri': {'district': 'Mumbai Suburban', 'lat': 19.11, 'lon': 72.87},
        'Gurgaon': {'district': 'Delhi NCR', 'lat': 28.46, 'lon': 77.03},
        'Salt Lake': {'district': 'Kolkata', 'lat': 22.58, 'lon': 88.41}
    }

    data = []
    sites_per_subdistrict = num_sites // len(subdistricts) 

    for subdistrict, info in subdistricts.items():
        for _ in range(sites_per_subdistrict):
            aqi_value = np.clip(np.random.normal(150, 50), 50, 400)

            lat = info['lat'] + np.random.uniform(-0.045, 0.045)
            lon = info['lon'] + np.random.uniform(-0.045, 0.045)

            site = {
                'District': info['district'],
                'Subdistrict': subdistrict,
                'Site_ID': f"{subdistrict[:3].upper()}{np.random.randint(1000, 9999)}",
                'Latitude': lat,
                'Longitude': lon,
                'AQI': aqi_value,
                'Distance_km': np.random.uniform(0.5, 15.0),
                'Accessibility': np.random.randint(1, 11),
                'Terrain': np.random.choice(['Urban', 'Semi-urban', 'Rural', 'Hilly'], 
                                       p=[0.4, 0.3, 0.2, 0.1]),
                'Environmental_Interference': np.random.randint(1, 11)
            }
            data.append(site)

    df = pd.DataFrame(data)

    weights = {
        'AQI': 0.2,
        'Distance_km': 0.25,
        'Accessibility': 0.3,
        'Environmental_Interference': 0.25
    }

    df['AQI_Score'] = (500 - df['AQI']) / 500 * 10
    df['Distance_Score'] = (15 - df['Distance_km']) / 15 * 10
    df['Accessibility_Score'] = df['Accessibility']
    df['Environmental_Score'] = (11 - df['Environmental_Interference'])

    df['Total_Score'] = (
        df['AQI_Score'] * weights['AQI'] +
        df['Distance_Score'] * weights['Distance_km'] +
        df['Accessibility_Score'] * weights['Accessibility'] +
        df['Environmental_Score'] * weights['Environmental_Interference']
    )

    return df
