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

import math

def tower_score(PD, RA, CP):
    """
    Calculate tower score based on population density, coverage radius, and capacity parameters.
    
    Parameters:
    PD (float): Population Density (people per sq km)
    RA (float): Coverage Radius (km)
    CP (float): Capacity Parameter (maximum number of users the tower can serve)
    
    """
    EP = PD * (math.pi * RA ** 2)  # Estimated Population in coverage area
    UR = EP / CP  # Utilization Ratio
    
    if 0.5 <= UR <= 1.0:
        score = 100 * UR
    elif UR < 0.5:
        score = 80 * UR
    else:
        score = 100 - 50 * (UR - 1.0)
    
    return max(0, min(100, round(score, 2)))

def get_top_sites(df, subdistrict=None, n=10, min_distance=3.0):
    print(f"Received request for {n} sites in {subdistrict}")  # Debug line
    
    # Import water detection module
    from water_detection import is_in_water, get_nearest_land_point
    
    if subdistrict:
        filtered_df = df[df['Subdistrict'] == subdistrict].copy()
    else:
        filtered_df = df.copy()

    print(f"Found {len(filtered_df)} sites in {subdistrict}")  # Debug line
    
    if len(filtered_df) == 0:
        return pd.DataFrame()
        
    # Pre-calculate all site-specific data that should persist
    for idx, row in filtered_df.iterrows():
        # Calculate CAPEX and OPEX estimates
        capex_data = calculate_capex_estimate(row.to_dict())
        opex_data = calculate_opex_estimate(row.to_dict())
        
        # Get tower recommendations
        tower_data = get_tower_recommendations(row.to_dict())
        
        # Get installation checklist
        checklist = get_installation_checklist(row.to_dict(), tower_data['recommendations'][0]['tower_type'])
        
        # Calculate building height and recommended tower height
        avg_building_height = 24.0  # Default value for urban areas
        if row['Terrain'] == 'Rural':
            avg_building_height = 12.0
        elif row['Terrain'] == 'Semi-urban':
            avg_building_height = 18.0
        elif row['Terrain'] == 'Hilly':
            avg_building_height = 15.0
        
        # Recommended tower height is typically 5m above average building height
        recommended_tower_height = avg_building_height + 5.0
        
        # Store all calculated data
        filtered_df.at[idx, 'capex_data'] = str(capex_data)
        filtered_df.at[idx, 'opex_data'] = str(opex_data)
        filtered_df.at[idx, 'tower_recommendations'] = str(tower_data)
        filtered_df.at[idx, 'installation_checklist'] = str(checklist)
        filtered_df.at[idx, 'avg_building_height'] = avg_building_height
        filtered_df.at[idx, 'recommended_tower_height'] = recommended_tower_height
    
    # Calculate enhanced score incorporating population density
    # Assume standard coverage radius and capacity parameters
    coverage_radius = 2.0  # 2 km radius
    capacity_parameter = 5000  # Can serve 5000 users
    
    # Calculate enhanced score for each site
    filtered_df['Enhanced_Score'] = filtered_df.apply(
        lambda row: (
            # Base score (70% weight)
            0.7 * row['Total_Score'] + 
            # Population density score (30% weight)
            0.3 * tower_score(row['Population_Density'], coverage_radius, capacity_parameter)
        ),
        axis=1
    )
    
    # Check for water bodies and adjust coordinates if needed
    water_locations = []
    for idx, row in filtered_df.iterrows():
        if is_in_water(row['Latitude'], row['Longitude']):
            print(f"Site {row['Site_ID']} is in water. Finding nearest land point...")
            new_lat, new_lon = get_nearest_land_point(row['Latitude'], row['Longitude'])
            
            if (new_lat, new_lon) != (row['Latitude'], row['Longitude']):
                # Found a land point nearby, update coordinates
                filtered_df.at[idx, 'Latitude'] = new_lat
                filtered_df.at[idx, 'Longitude'] = new_lon
                # Mark as relocated for frontend display and cost calculations
                filtered_df.at[idx, 'Relocated'] = True
                # Apply a small score penalty for relocated sites (more expensive to build)
                filtered_df.at[idx, 'Enhanced_Score'] = max(0, filtered_df.at[idx, 'Enhanced_Score'] - 0.5)
                print(f"Moved site to land at {new_lat}, {new_lon}")
            else:
                # Couldn't find a nearby land point, mark for removal
                water_locations.append(idx)
                print(f"Could not find nearby land for site {row['Site_ID']}. Will be excluded.")
    
    # Remove sites that are in water and couldn't be relocated
    if water_locations:
        filtered_df = filtered_df.drop(water_locations)
        print(f"Removed {len(water_locations)} sites that were in water bodies")
        
    # If we've removed too many sites, we might need to expand our search area
    if len(filtered_df) < n * 1.5:  # Ensure we have at least 1.5x the requested number of sites
        print(f"Not enough sites after water filtering. Expanding search area...")
        # This would be a good place to implement a more sophisticated search strategy
        # For now, we'll just continue with what we have
    
    # Sort by Enhanced_Score in descending order
    filtered_df = filtered_df.sort_values('Enhanced_Score', ascending=False)
    
    # Get top n sites, ensuring we have enough after water filtering
    top_sites = filtered_df.head(n)
    
    # If we don't have enough sites after filtering water locations,
    # we might need to get more sites from other areas
    if len(top_sites) < n and len(filtered_df) < n:
        print(f"Warning: Only found {len(top_sites)} valid sites after water filtering")
    
    print(f"Returning {len(top_sites)} sites with persistent calculations")  # Debug line
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
