"""
Data generation module for simulating 5G tower site conditions.
Includes scoring based on AQI, distance, accessibility, and environmental interference.
"""

import numpy as np
import pandas as pd
import os 

DATA_FILE = 'site_data.csv'

#Generate realistic data for analysis of different sites
def generate_site_data(num_sites=100):
    """
    Simulates environmental and demographic data for multiple tower sites.
    Returns a DataFrame with computed suitability scores.
    """
    np.random.seed(42)
    # Define subdistricts with base lat/lon values for site placement
    subdistricts = {
        'Whitefield': {'district': 'Bangalore Urban', 'lat': 12.97, 'lon': 77.73},
        'Andheri': {'district': 'Mumbai Suburban', 'lat': 19.11, 'lon': 72.87},
        'Gurgaon': {'district': 'Delhi NCR', 'lat': 28.46, 'lon': 77.03},
        'Salt Lake': {'district': 'Kolkata', 'lat': 22.58, 'lon': 88.41},
        'Koramangala': {'district': 'Bangalore Urban', 'lat': 12.9352, 'lon': 77.6245},
        'Bandra': {'district': 'Mumbai Suburban', 'lat': 19.0667, 'lon': 72.8333},
        'South Extension': {'district': 'New Delhi', 'lat': 28.5941, 'lon': 77.1996},
        'Banjara Hills': {'district': 'Hyderabad', 'lat': 17.4249, 'lon': 78.4747},
        'Anna Nagar': {'district': 'Chennai', 'lat': 13.1044, 'lon': 80.2107},
        'Viman Nagar': {'district': 'Pune', 'lat': 18.5196, 'lon': 73.8987},
        'Lajpat Nagar': {'district': 'New Delhi', 'lat': 28.5512, 'lon': 77.2348},
        'Indiranagar': {'district': 'Bangalore Urban', 'lat': 12.9781, 'lon': 77.6407},
        'Sector 18': {'district': 'Gautam Buddha Nagar', 'lat': 28.5703, 'lon': 77.3200},
        'Jayanagar': {'district': 'Bangalore Urban', 'lat': 12.9250, 'lon': 77.5938},
        'Malleshwaram': {'district': 'Bangalore Urban', 'lat': 13.0021, 'lon': 77.5606},
        'Hebbal': {'district': 'Bangalore Urban', 'lat': 13.0500, 'lon': 77.5970},
        'HSR Layout': {'district': 'Bangalore Urban', 'lat': 12.9141, 'lon': 77.6498},
        'Jubilee Hills': {'district': 'Hyderabad', 'lat': 17.4239, 'lon': 78.4228},
        'Secunderabad': {'district': 'Hyderabad', 'lat': 17.4399, 'lon': 78.4983},
        'Dwarka': {'district': 'New Delhi', 'lat': 28.5951, 'lon': 77.0412},
        'Rohini': {'district': 'New Delhi', 'lat': 28.7220, 'lon': 77.1000},
        'Connaught Place': {'district': 'New Delhi', 'lat': 28.6315, 'lon': 77.2167},
        'Chandni Chowk': {'district': 'New Delhi', 'lat': 28.6562, 'lon': 77.2300},
        'Noida Sector 18': {'district': 'Noida', 'lat': 28.5707, 'lon': 77.3176},
        'Greater Kailash': {'district': 'New Delhi', 'lat': 28.5235, 'lon': 77.2080},
        'Banashankari': {'district': 'Bangalore Urban', 'lat': 12.9200, 'lon': 77.5750},
        'BTM Layout': {'district': 'Bangalore Urban', 'lat': 12.9202, 'lon': 77.6133},
        'Khar': {'district': 'Mumbai Suburban', 'lat': 19.0588, 'lon': 72.8258},
        'Parel': {'district': 'Mumbai City', 'lat': 19.0040, 'lon': 72.8459},
        'Mulund': {'district': 'Mumbai Suburban', 'lat': 19.1862, 'lon': 72.9500},
        'Vashi': {'district': 'Navi Mumbai', 'lat': 19.0330, 'lon': 73.0160},
        'Dadar': {'district': 'Mumbai City', 'lat': 19.0176, 'lon': 72.8463},
        'Colaba': {'district': 'Mumbai City', 'lat': 18.9180, 'lon': 72.8323}
    }

    # Base population density per subdistrict, used to generate simulated values
    population_density_base = {
        'Whitefield': 12000,
        'Andheri': 25000,
        'Gurgaon': 11000,
        'Salt Lake': 15000,
        'Koramangala': 18000,
        'Bandra': 23000,
        'South Extension': 20000,
        'Banjara Hills': 17000,
        'Anna Nagar': 16000,
        'Viman Nagar': 14000,
        'Lajpat Nagar': 21000,
        'Indiranagar': 17500,
        'Sector 18': 13000,
        'Jayanagar': 15000,
        'Malleshwaram': 14500,
        'Hebbal': 13500,
        'HSR Layout': 15500,
        'Jubilee Hills': 16500,
        'Secunderabad': 12500,
        'Dwarka': 12000,
        'Rohini': 19000,
        'Connaught Place': 22000,
        'Chandni Chowk': 24000,
        'Noida Sector 18': 12500,
        'Greater Kailash': 18500,
        'Banashankari': 14000,
        'BTM Layout': 15000,
        'Khar': 21000,
        'Parel': 24500,
        'Mulund': 16000,
        'Vashi': 13000,
        'Dadar': 25000,
        'Colaba': 20000
    }



    data = []
    sites_per_subdistrict = num_sites // len(subdistricts)

    for subdistrict, info in subdistricts.items():
        
        for _ in range(sites_per_subdistrict):
            aqi_value = np.clip(np.random.normal(150, 50), 50, 400)
            lat = info['lat'] + np.random.uniform(-0.045, 0.045)
            lon = info['lon'] + np.random.uniform(-0.045, 0.045)
            base_density = population_density_base[subdistrict]
            density = np.random.normal(base_density, base_density * 0.1)  # ±10%

            site_data = {
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
                'Environmental_Interference': np.random.randint(1, 11),
                'Population_Density': round(density)
            }
            data.append(site_data)


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


if __name__ == "__main__":
    df = generate_site_data(100)
    print(df.head())

