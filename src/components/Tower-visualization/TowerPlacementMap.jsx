import { useState, useEffect } from "react";
import Map from "react-map-gl";
import { Marker, Popup } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import * as d3 from "d3";

const MAPBOX_TOKEN = "pk.eyJ1IjoibXVnaGlsMTI4IiwiYSI6ImNtN2JqM2ZzcDBjZXQycXNlNTl5Z3hhZXgifQ.WawhRrQHkBkav9rwGGUXUw";
const API_URL = "http://127.0.0.1:5000";

export default function TowerPlacementMap() {
    const [csvLocations, setCsvLocations] = useState([]);
    const [apiLocations, setApiLocations] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [location, setLocation] = useState("Salt Lake");
    const [siteCount, setSiteCount] = useState(10);
    const [availableLocations, setAvailableLocations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [apiResponse, setApiResponse] = useState(null);
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

    const fallbackLocations = ["Whitefield", "Andheri", "Gurgaon", "Salt Lake"];

    useEffect(() => {
        setLoading(true);
        fetch(`${API_URL}/available-locations`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log("Available locations:", data);
                if (Array.isArray(data) && data.length > 0) {
                    setAvailableLocations(data);
                } else {
                    console.warn("Received empty or invalid locations array, using fallback");
                    setAvailableLocations(fallbackLocations);
                }
                setLoading(false);
            })
            .catch(error => {
                console.error("Error fetching available locations:", error);
                setAvailableLocations(fallbackLocations);
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        if (!location) return;
        
        setLoading(true);
        setError(null);
        setApiResponse(null);
        
        const endpoint = `${API_URL}/top-sites/${encodeURIComponent(location)}/${siteCount}`;
        console.log("Fetching from endpoint:", endpoint);
        
        fetch(endpoint)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log("API response for", location, ":", data);
                setApiResponse(data); 
                
                if (!Array.isArray(data)) {
                    throw new Error(`Expected array but got ${typeof data}`);
                }
                
                if (data.length === 0) {
                    console.warn(`No data returned for location: ${location}`);
                }
                
                const formattedData = data.map(d => {
                    if (!d.Latitude || !d.Longitude) {
                        console.warn("Item missing coordinates:", d);
                        return null;
                    }
                    
                    return {
                        siteID: d.Site_ID || "Unknown",
                        latitude: parseFloat(d.Latitude),
                        longitude: parseFloat(d.Longitude),
                        address: `${d.Subdistrict || ''}, ${d.District || ''}`,
                        cgi: `AQI: ${(d.AQI_Score || 0).toFixed(2)} | Total: ${(d.Total_Score || 0).toFixed(2)}`,
                        source: "API",
                        rawData: d 
                    };
                }).filter(item => item !== null && !isNaN(item.latitude) && !isNaN(item.longitude));
                
                setApiLocations(formattedData);
                
                if (formattedData.length > 0) {
                    setViewState({
                        longitude: formattedData[0].longitude,
                        latitude: formattedData[0].latitude,
                        zoom: 12
                    });
                }
                
                setLoading(false);
            })
            .catch(error => {
                console.error(`Error fetching data for ${location}:`, error);
                setError(`Failed to load data for ${location}: ${error.message}`);
                setApiLocations([]);
                setLoading(false);
            });
    }, [location, siteCount]);

    const allLocations = [...csvLocations, ...apiLocations];

    const handleLocationChange = (e) => {
        setLocation(e.target.value);
    };

    const handleSiteCountChange = (e) => {
        setSiteCount(parseInt(e.target.value, 10));
    };

    return (
        <div>
            <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                flexWrap: "wrap",
                width: "90vw", 
                margin: "20px auto",
                padding: "15px",
                backgroundColor: "#f5f5f5",
                borderRadius: "8px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
            }}>
                <div style={{ marginBottom: "10px" }}>
                    <label htmlFor="location" style={{ fontWeight: "bold", marginRight: "8px" }}>Location: </label>
                    <select 
                        id="location" 
                        value={location} 
                        onChange={handleLocationChange}
                        style={{
                            padding: "8px",
                            borderRadius: "4px",
                            border: "1px solid #ddd",
                            marginRight: "15px"
                        }}
                    >
                        {availableLocations.map((loc) => (
                            <option key={loc} value={loc}>{loc}</option>
                        ))}
                    </select>
                </div>
                
                <div style={{ marginBottom: "10px" }}>
                    <label htmlFor="siteCount" style={{ fontWeight: "bold", marginRight: "8px" }}>Number of Sites: </label>
                    <select 
                        id="siteCount" 
                        value={siteCount} 
                        onChange={handleSiteCountChange}
                        style={{
                            padding: "8px",
                            borderRadius: "4px",
                            border: "1px solid #ddd",
                            marginRight: "15px"
                        }}
                    >
                        {[5, 10, 20, 50, 100].map((count) => (
                            <option key={count} value={count}>{count}</option>
                        ))}
                    </select>
                </div>
            </div>
            
            {loading && (
                <div style={{ 
                    textAlign: "center", 
                    margin: "10px auto",
                    padding: "10px",
                    backgroundColor: "#e3f2fd",
                    borderRadius: "4px",
                    width: "80%"
                }}>
                    Loading sites data for {location}...
                </div>
            )}
            
            {error && (
                <div style={{ 
                    textAlign: "center", 
                    margin: "10px auto",
                    padding: "10px",
                    backgroundColor: "#ffebee",
                    color: "#c62828",
                    borderRadius: "4px",
                    width: "80%"
                }}>
                    <strong>Error:</strong> {error}
                </div>
            )}
            
            {!loading && !error && apiLocations.length === 0 && (
                <div style={{ 
                    textAlign: "center", 
                    margin: "10px auto",
                    padding: "10px",
                    backgroundColor: "#fff9c4",
                    borderRadius: "4px",
                    width: "80%"
                }}>
                    <strong>No API data found for {location}.</strong> Check that this location exists in your database or API.
                </div>
            )}
            
            <Map
                {...viewState}
                onMove={evt => setViewState(evt.viewState)}
                style={{ 
                    width: "80%", 
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
                        anchor="top"
                        closeOnClick={false}
                        onClose={() => setSelectedLocation(null)}
                    >
                        <div style={{ padding: "5px" }}>
                            <h4 style={{ margin: "0 0 8px 0" }}>Site ID: {selectedLocation.siteID}</h4>
                            <p style={{ margin: "5px 0" }}><b>Address:</b> {selectedLocation.address}</p>
                            <p style={{ margin: "5px 0" }}><b>Info:</b> {selectedLocation.cgi}</p>
                            <p style={{ margin: "5px 0" }}><b>Source:</b> {selectedLocation.source}</p>
                            <p style={{ margin: "5px 0", fontSize: "0.8em" }}>
                                <b>Coordinates:</b> {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
                            </p>
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