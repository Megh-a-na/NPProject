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

def calculate_capex_estimate(site_data, tower_type='standard'):
    """
    Calculate CAPEX estimate for a site based on various factors.
    Returns a dictionary with detailed cost breakdown.
    """
    base_costs = {
        'standard': {
            'tower_cost': 50000,
            'equipment_cost': 30000,
            'installation_cost': 20000,
            'backhaul_cost': 15000
        },
        'rooftop': {
            'tower_cost': 30000,
            'equipment_cost': 25000,
            'installation_cost': 15000,
            'backhaul_cost': 10000
        },
        'monopole': {
            'tower_cost': 40000,
            'equipment_cost': 28000,
            'installation_cost': 18000,
            'backhaul_cost': 12000
        }
    }
    
    costs = base_costs.get(tower_type, base_costs['standard'])
    
    # Adjust costs based on terrain and accessibility
    terrain_multiplier = {
        'flat': 1.0,
        'hilly': 1.2,
        'mountainous': 1.5
    }
    
    accessibility_multiplier = {
        'easy': 1.0,
        'moderate': 1.1,
        'difficult': 1.3
    }
    
    terrain = site_data.get('Terrain', 'flat')
    accessibility = site_data.get('Accessibility', 'easy')
    
    total_capex = sum(costs.values()) * terrain_multiplier.get(terrain, 1.0) * accessibility_multiplier.get(accessibility, 1.0)
    
    return {
        'total_capex': round(total_capex, 2),
        'breakdown': {
            'tower_cost': round(costs['tower_cost'] * terrain_multiplier.get(terrain, 1.0), 2),
            'equipment_cost': round(costs['equipment_cost'], 2),
            'installation_cost': round(costs['installation_cost'] * accessibility_multiplier.get(accessibility, 1.0), 2),
            'backhaul_cost': round(costs['backhaul_cost'], 2)
        }
    }

def calculate_opex_estimate(site_data):
    """
    Calculate annual OPEX estimate for a site.
    Returns a dictionary with detailed cost breakdown.
    """
    base_opex = {
        'lease_cost': 12000,  # Annual lease cost
        'maintenance_cost': 8000,  # Annual maintenance
        'power_cost': 6000,  # Annual power consumption
        'backhaul_cost': 10000  # Annual backhaul cost
    }
    
    # Adjust based on site characteristics
    terrain = site_data.get('Terrain', 'flat')
    terrain_multiplier = {
        'flat': 1.0,
        'hilly': 1.15,
        'mountainous': 1.3
    }
    
    total_opex = sum(base_opex.values()) * terrain_multiplier.get(terrain, 1.0)
    
    return {
        'total_opex': round(total_opex, 2),
        'breakdown': {
            'lease_cost': round(base_opex['lease_cost'], 2),
            'maintenance_cost': round(base_opex['maintenance_cost'] * terrain_multiplier.get(terrain, 1.0), 2),
            'power_cost': round(base_opex['power_cost'], 2),
            'backhaul_cost': round(base_opex['backhaul_cost'], 2)
        }
    }

def get_tower_recommendations(site_data):
    """
    Provide tower type recommendations based on site characteristics.
    Returns a dictionary with recommendations and rationale.
    """
    terrain = site_data.get('Terrain', 'flat')
    accessibility = site_data.get('Accessibility', 'easy')
    environmental_score = site_data.get('Environmental_Interference', 0)
    
    recommendations = {
        'standard': {
            'suitability': 0,
            'rationale': []
        },
        'rooftop': {
            'suitability': 0,
            'rationale': []
        },
        'monopole': {
            'suitability': 0,
            'rationale': []
        }
    }
    
    # Evaluate standard tower
    if terrain == 'flat' and accessibility == 'easy':
        recommendations['standard']['suitability'] += 2
        recommendations['standard']['rationale'].append('Ideal for flat terrain with good accessibility')
    if environmental_score > 0.7:
        recommendations['standard']['suitability'] += 1
        recommendations['standard']['rationale'].append('Good for areas with high environmental interference')
    
    # Evaluate rooftop tower
    if terrain == 'hilly' or terrain == 'mountainous':
        recommendations['rooftop']['suitability'] += 2
        recommendations['rooftop']['rationale'].append('Suitable for uneven terrain')
    if accessibility == 'difficult':
        recommendations['rooftop']['suitability'] += 1
        recommendations['rooftop']['rationale'].append('Good for difficult access areas')
    
    # Evaluate monopole
    if environmental_score < 0.3:
        recommendations['monopole']['suitability'] += 2
        recommendations['monopole']['rationale'].append('Minimal environmental impact')
    if accessibility == 'moderate':
        recommendations['monopole']['suitability'] += 1
        recommendations['monopole']['rationale'].append('Suitable for moderate accessibility')
    
    # Sort recommendations by suitability
    sorted_recommendations = sorted(
        recommendations.items(),
        key=lambda x: x[1]['suitability'],
        reverse=True
    )
    
    return {
        'recommendations': [
            {
                'tower_type': tower_type,
                'suitability_score': data['suitability'],
                'rationale': data['rationale']
            }
            for tower_type, data in sorted_recommendations
        ]
    }

def get_installation_checklist(site_data, tower_type):
    """
    Generate an installation checklist based on site characteristics and tower type.
    """
    base_checklist = {
        'pre_installation': [
            'Site survey and assessment',
            'Permit acquisition',
            'Environmental impact assessment',
            'Safety plan development'
        ],
        'equipment': [
            'Tower structure',
            'Antenna system',
            'Power supply unit',
            'Backhaul equipment',
            'Grounding system'
        ],
        'installation': [
            'Foundation preparation',
            'Tower assembly',
            'Equipment mounting',
            'Cable routing',
            'Power connection',
            'Backhaul connection'
        ],
        'post_installation': [
            'System testing',
            'Safety inspection',
            'Documentation completion',
            'Commissioning'
        ]
    }
    
    # Add terrain-specific items
    terrain = site_data.get('Terrain', 'flat')
    if terrain == 'mountainous':
        base_checklist['pre_installation'].append('Specialized transport arrangements')
        base_checklist['installation'].append('Additional safety measures for steep terrain')
    
    # Add tower-type specific items
    if tower_type == 'rooftop':
        base_checklist['pre_installation'].append('Roof structural assessment')
        base_checklist['installation'].append('Roof penetration sealing')
    
    return base_checklist

# sites = generate_site_data()
# print(get_top_sites(sites, 'Salt Lake',4))
