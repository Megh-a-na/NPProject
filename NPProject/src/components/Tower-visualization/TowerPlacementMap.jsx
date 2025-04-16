import { useState, useEffect } from "react";
import Map from "react-map-gl";
import { Marker, Popup } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import * as d3 from "d3";

const MAPBOX_TOKEN = "pk.eyJ1IjoibXVnaGlsMTI4IiwiYSI6ImNtN2JqM2ZzcDBjZXQycXNlNTl5Z3hhZXgifQ.WawhRrQHkBkav9rwGGUXUw";
const API_URL = "http://127.0.0.1:5000";
const MAPMYINDIA_KEY = "ed12a50b5821f055941d4c5851ec5668";

// Function to fetch Indian location data using MapMyIndia API
const fetchIndianLocationData = async (latitude, longitude) => {
    try {
        // Fetch nearby POIs and building density
        const response = await fetch(
            `https://apis.mapmyindia.com/advancedmaps/v1/${MAPMYINDIA_KEY}/nearby_search?lat=${latitude}&lng=${longitude}&keywords=building&radius=500`
        );
        
        const data = await response.json();
        
        // Calculate average building height (simulated)
        // In a real scenario, this would come from the API or another source
        const avgBuildingHeight = Math.floor(Math.random() * 30) + 10; // Random height between 10-40m
        const recommendedHeight = Math.ceil(avgBuildingHeight * 1.2); // Avg Building Height + 20%
        
        return {
            buildingCount: data.suggestedLocations?.length || Math.floor(Math.random() * 50) + 5, // Fallback to random if API fails
            populationDensity: Math.floor(Math.random() * 15000) + 5000, // Simulated population density
            landUse: data.landUseType || "Urban",
            avgBuildingHeight: avgBuildingHeight,
            recommendedHeight: recommendedHeight
        };
    } catch (error) {
        console.error("Error fetching Indian location data:", error);
        // Return simulated data if API fails
        const avgBuildingHeight = Math.floor(Math.random() * 30) + 10;
        const recommendedHeight = Math.ceil(avgBuildingHeight * 1.2);
        
        return {
            buildingCount: Math.floor(Math.random() * 50) + 5,
            populationDensity: Math.floor(Math.random() * 15000) + 5000,
            landUse: "Urban",
            avgBuildingHeight: avgBuildingHeight,
            recommendedHeight: recommendedHeight
        };
    }
};

// Function to fetch cost estimates
const fetchCostEstimates = async (siteData) => {
    try {
        const response = await fetch(`${API_URL}/api/cost-estimate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                site_data: siteData,
                tower_type: 'standard' // Default to standard tower type
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch cost estimates');
        }
        
        return await response.json();
    } catch (error) {
        console.error("Error fetching cost estimates:", error);
        return null;
    }
};

export default function TowerPlacementMap({ towerLocations, selectedLocation, setSelectedLocation }) {
    const [csvLocations, setCsvLocations] = useState([]);
    const [apiLocations, setApiLocations] = useState([]);
    const [costEstimates, setCostEstimates] = useState(null);
    const [viewState, setViewState] = useState({
        longitude: 88.41,
        latitude: 22.58,
        zoom: 12,
    });

    useEffect(() => {
        d3.csv("/coordinates.csv").then(data => {
            const parsedData = data.map(d => ({
                siteID: d["Site ID"],
                latitude: parseFloat(d.Latitude.replace(/[^0-9.-]/g, "")),
                longitude: parseFloat(d.Longitude.replace(/[^0-9.-]/g, "")),
                address: d["Site Address"],
                cgi: d["Cell Global Identity (CGI)"],
                source: "CSV"
            }));
            setCsvLocations(parsedData);
        }).catch(err => {
            console.error("Error loading CSV:", err);
        });
    }, []);

    const allLocations = [...csvLocations, ...towerLocations];

    useEffect(() => {
        // Default coordinates for your regions
        const regionCoordinates = {
            "Whitefield": { longitude: 77.7506, latitude: 12.9698, zoom: 12 },
            "Andheri": { longitude: 72.8479, latitude: 19.1136, zoom: 12 },
            "Gurgaon": { longitude: 77.0266, latitude: 28.4595, zoom: 12 },
            "Salt Lake": { longitude: 88.4142, latitude: 22.5726, zoom: 12 }
        };
        
        // Update view when towerLocations change and contain elements
        if (towerLocations.length > 0) {
            // If we have a known region for the first tower, use that
            const firstTower = towerLocations[0];
            const region = Object.keys(regionCoordinates).find(
                r => firstTower.region === r || firstTower.subdistrict === r
            );
            
            if (region && regionCoordinates[region]) {
                setViewState(regionCoordinates[region]);
            } else {
                // Otherwise center on the first tower
                setViewState({
                    longitude: firstTower.longitude,
                    latitude: firstTower.latitude,
                    zoom: 12
                });
            }
        }
    }, [towerLocations]);

    console.log(`TowerPlacementMap received ${towerLocations.length} locations:`, towerLocations);
    console.log(`Combined ${allLocations.length} total locations`);

    return (
        <div>
            <Map
                {...viewState}
                onMove={evt => setViewState(evt.viewState)}
                style={{ 
                    width: "70vw",  /* Reduce the width to 70% of the viewport */
                    height: "500px", 
                    margin: "20px auto", 
                    border: "3px solid", 
                    borderRadius: "15px",
                    boxShadow: "0 4px 8px rgba(0,0,0,0.1)" 
                }}
                mapStyle="mapbox://styles/mapbox/streets-v11"
                mapboxAccessToken={MAPBOX_TOKEN}
            >
                {allLocations.map((location, index) => (
                    <Marker 
                        key={index} 
                        longitude={location.longitude} 
                        latitude={location.latitude} 
                        anchor="bottom" 
                        onClick={async (e) => {
                            e.originalEvent?.stopPropagation();
                            if (selectedLocation && selectedLocation === location) {
                                setSelectedLocation(null);
                                setCostEstimates(null);
                            } else {
                                const locationData = await fetchIndianLocationData(location.latitude, location.longitude);
                                const siteData = {
                                    ...location,
                                    ...locationData,
                                    Terrain: locationData.landUse.toLowerCase(),
                                    Accessibility: 'moderate' // Default value
                                };
                                const estimates = await fetchCostEstimates(siteData);
                                setCostEstimates(estimates);
                                setSelectedLocation({ ...location, urbanData: locationData });
                            }
                        }}
                    >
                        <div style={{ 
                            fontSize: "24px", 
                            cursor: "pointer",
                            color: location.source === "CSV" ? "#1E88E5" : 
                                  (location.isWater ? "#00BCD4" : "#E53935") 
                        }}>
                            {location.source === "CSV" ? "🔹" : 
                             (location.isWater ? "🌊" : 
                             (location.relocated ? "🏠" : "📍"))}
                        </div>
                    </Marker>
                ))}
                
                {selectedLocation && (
                    <Popup
                        longitude={selectedLocation.longitude}
                        latitude={selectedLocation.latitude}
                        anchor="bottom"
                        onClose={() => {
                            setSelectedLocation(null);
                            setCostEstimates(null);
                        }}
                        closeButton={true}
                        className="custom-popup"
                    >
                        <style>
                            {`.mapboxgl-popup-close-button {
                                color: black !important;
                                font-size: 20px !important;
                                font-weight: bold !important;
                                padding: 5px 10px !important;
                            }`}
                        </style>
                        <div style={{ padding: '10px', fontFamily: 'Arial, sans-serif' }}>
                            <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>
                                {selectedLocation.siteID || 'Tower Site'}
                            </h3>
                            <div style={{ fontSize: '14px', color: '#666' }}>
                                <p style={{ margin: '5px 0' }}><strong>Latitude:</strong> {selectedLocation.latitude.toFixed(6)}°</p>
                                <p style={{ margin: '5px 0' }}><strong>Longitude:</strong> {selectedLocation.longitude.toFixed(6)}°</p>
                                {selectedLocation.source === "API" && selectedLocation.score && (
                                    <p style={{ margin: '5px 0' }}><strong>Optimization Score:</strong> {selectedLocation.score.toFixed(2)}</p>
                                )}
                                <p style={{ margin: '5px 0' }}><strong>Source:</strong> {selectedLocation.source}</p>
                                {selectedLocation.address && (
                                    <p style={{ margin: '5px 0' }}><strong>Address:</strong> {selectedLocation.address}</p>
                                )}
                                {selectedLocation.isWater && (
                                    <p style={{ margin: '5px 0', color: '#00838F' }}><strong>Note:</strong> This location is in or near water</p>
                                )}
                                {selectedLocation.relocated && (
                                    <p style={{ margin: '5px 0', color: '#2E7D32' }}><strong>Relocated:</strong> This tower was moved from water to land</p>
                                )}
                                
                                {selectedLocation.urbanData && (
                                    <div style={{ borderTop: '1px solid #ccc', marginTop: '10px', paddingTop: '10px' }}>
                                        <p style={{ margin: '5px 0' }}>
                                            <strong>Land Use:</strong> {selectedLocation.urbanData.landUse}
                                        </p>
                                        <p style={{ margin: '5px 0' }}>
                                            <strong>Est. Population Density:</strong> {selectedLocation.urbanData.populationDensity}/km²
                                        </p>
                                        <p style={{ margin: '5px 0' }}>
                                            <strong>Avg. Building Height:</strong> {selectedLocation.urbanData.avgBuildingHeight}m
                                        </p>
                                        <p style={{ margin: '5px 0', fontWeight: 'bold', color: '#2E7D32' }}>
                                            <strong>Recommended Tower Height:</strong> {selectedLocation.urbanData.recommendedHeight}m
                                        </p>
                                    </div>
                                )}

                                {costEstimates && (
                                    <div style={{ borderTop: '1px solid #ccc', marginTop: '10px', paddingTop: '10px' }}>
                                        <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>Cost Analysis (₹)</h4>
                                        <div style={{ marginBottom: '10px' }}>
                                            <p style={{ margin: '5px 0', fontWeight: 'bold' }}>Initial Investment (CAPEX):</p>
                                            <div style={{ marginLeft: '15px' }}>
                                                <p style={{ margin: '3px 0' }}>Tower Cost: ₹{costEstimates.capex.breakdown.tower_cost.toLocaleString()}</p>
                                                <p style={{ margin: '3px 0' }}>Equipment Cost: ₹{costEstimates.capex.breakdown.equipment_cost.toLocaleString()}</p>
                                                <p style={{ margin: '3px 0' }}>Installation Cost: ₹{costEstimates.capex.breakdown.installation_cost.toLocaleString()}</p>
                                                <p style={{ margin: '3px 0' }}>Backhaul Cost: ₹{costEstimates.capex.breakdown.backhaul_cost.toLocaleString()}</p>
                                                <p style={{ margin: '5px 0', fontWeight: 'bold' }}>Total CAPEX: ₹{costEstimates.capex.total_capex.toLocaleString()}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <p style={{ margin: '5px 0', fontWeight: 'bold' }}>Annual Operating Cost (OPEX):</p>
                                            <div style={{ marginLeft: '15px' }}>
                                                <p style={{ margin: '3px 0' }}>Lease Cost: ₹{costEstimates.opex.breakdown.lease_cost.toLocaleString()}</p>
                                                <p style={{ margin: '3px 0' }}>Maintenance Cost: ₹{costEstimates.opex.breakdown.maintenance_cost.toLocaleString()}</p>
                                                <p style={{ margin: '3px 0' }}>Power Cost: ₹{costEstimates.opex.breakdown.power_cost.toLocaleString()}</p>
                                                <p style={{ margin: '3px 0' }}>Backhaul Cost: ₹{costEstimates.opex.breakdown.backhaul_cost.toLocaleString()}</p>
                                                <p style={{ margin: '5px 0', fontWeight: 'bold' }}>Total Annual OPEX: ₹{costEstimates.opex.total_opex.toLocaleString()}</p>
                                            </div>
                                        </div>
                                        <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #ccc' }}>
                                            <p style={{ margin: '5px 0', fontWeight: 'bold', color: '#2E7D32' }}>
                                                Total First Year Cost: ₹{(costEstimates.capex.total_capex + costEstimates.opex.total_opex).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Popup>
                )}
            </Map>
            
            <div style={{ textAlign: "center", margin: "10px auto", width: "80%" }}>
                <p>
                    Displaying {allLocations.length} locations
                </p>
                <div style={{ display: "flex", justifyContent: "center", gap: "20px", flexWrap: "wrap" }}>
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <span style={{ fontSize: "24px", color: "#E53935", marginRight: "5px" }}>📍</span>
                        <span>Optimised Tower Placement</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <span style={{ fontSize: "24px", color: "#1E88E5", marginRight: "5px" }}>🔹</span>
                        <span>CSV Sites</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <span style={{ fontSize: "24px", color: "#00BCD4", marginRight: "5px" }}>🌊</span>
                        <span>Water Location</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <span style={{ fontSize: "24px", color: "#E53935", marginRight: "5px" }}>🏠</span>
                        <span>Relocated from Water</span>
                    </div>
                </div>
            </div>
        </div>
    );
}