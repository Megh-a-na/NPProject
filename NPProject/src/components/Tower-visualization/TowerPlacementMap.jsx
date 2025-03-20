import { useState, useEffect } from "react";
import Map from "react-map-gl";
import { Marker, Popup } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import * as d3 from "d3";

const MAPBOX_TOKEN = "pk.eyJ1IjoibXVnaGlsMTI4IiwiYSI6ImNtN2JqM2ZzcDBjZXQycXNlNTl5Z3hhZXgifQ.WawhRrQHkBkav9rwGGUXUw";
const API_URL = "http://127.0.0.1:5000";

export default function TowerPlacementMap({ towerLocations }) {
    const [csvLocations, setCsvLocations] = useState([]);
    const [apiLocations, setApiLocations] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState(null);
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
                        onClick={(e) => {
                            e.originalEvent?.stopPropagation();
                            setSelectedLocation(location);
                        }}
                    >
                        <div style={{ 
                            fontSize: "24px", 
                            cursor: "pointer",
                            color: location.source === "CSV" ? "#1E88E5" : "#E53935" 
                        }}>
                            {location.source === "CSV" ? "🔹" : "📍"}
                        </div>
                    </Marker>
                ))}
                
                {selectedLocation && (
                    <Popup
                        longitude={selectedLocation.longitude}
                        latitude={selectedLocation.latitude}
                        anchor="bottom"
                        onClose={() => setSelectedLocation(null)}
                        closeButton={true}
                        closeOnClick={false}
                    >
                        <div style={{ padding: '10px' }}>
                            <h3>{selectedLocation.siteID || "Tower Location"}</h3>
                            <p>Latitude: {selectedLocation.latitude.toFixed(6)}</p>
                            <p>Longitude: {selectedLocation.longitude.toFixed(6)}</p>
                            {selectedLocation.source === "API" && selectedLocation.score && (
                                <p>Optimization Score: {selectedLocation.score.toFixed(2)}</p>
                            )}
                            <p>Source: {selectedLocation.source}</p>
                            {selectedLocation.address && (
                                <p>Address: {selectedLocation.address}</p>
                            )}
                        </div>
                    </Popup>
                )}
            </Map>
            
            <div style={{ textAlign: "center", margin: "10px auto", width: "80%" }}>
                <p>
                    Displaying {allLocations.length} locations
                </p>
                <div style={{ display: "flex", justifyContent: "center", gap: "20px" }}>
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <span style={{ fontSize: "24px", color: "#E53935", marginRight: "5px" }}>📍</span>
                        <span>Optimised Tower Placement</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <span style={{ fontSize: "24px", color: "#1E88E5", marginRight: "5px" }}>🔹</span>
                        <span>CSV Sites</span>
                    </div>
                </div>
            </div>
        </div>
    );
}