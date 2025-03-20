import pandas as pd
from math import radians, sin, cos, sqrt, atan2
from data_generator import generate_site_data

def haversine_distance(lat1, lon1, lat2, lon2):
    R = 6371

    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1

    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * atan2(sqrt(a), sqrt(1-a))
    distance = R * c

    return distance

def get_top_sites(df, subdistrict=None, n=10, min_distance=3.0):
    print(f"Received request for {n} sites in {subdistrict}")  # Debug line
    
    if subdistrict:
        filtered_df = df[df['Subdistrict'] == subdistrict].copy()
    else:
        filtered_df = df.copy()

    print(f"Found {len(filtered_df)} sites in {subdistrict}")  # Debug line
    
    if len(filtered_df) == 0:
        return pd.DataFrame()

    # Sort by Total_Score in descending order
    filtered_df = filtered_df.sort_values('Total_Score', ascending=False)
    
    # Simplified approach: Just return the top n sites by score
    # This bypasses complex distance calculations for debugging
    top_sites = filtered_df.head(n)
    
    print(f"Returning {len(top_sites)} sites")  # Debug line
    return top_sites

def get_metrics_summary(df):
    summary = pd.DataFrame({
        'Mean Score': df.groupby('Subdistrict')['Total_Score'].mean(),
        'Max Score': df.groupby('Subdistrict')['Total_Score'].max(),
        'Min Score': df.groupby('Subdistrict')['Total_Score'].min(),
        'Sites Count': df.groupby('Subdistrict').size()
    }).round(2)

    return summary

def filter_sites(df, min_score=0, terrain=None, max_distance=None):
    filtered_df = df.copy()

    if min_score > 0:
        filtered_df = filtered_df[filtered_df['Total_Score'] >= min_score]

    if terrain:
        filtered_df = filtered_df[filtered_df['Terrain'] == terrain]

    if max_distance:
        filtered_df = filtered_df[filtered_df['Distance_km'] <= max_distance]

    return filtered_df


sites = generate_site_data()
print(get_top_sites(sites, 'Salt Lake',4))
