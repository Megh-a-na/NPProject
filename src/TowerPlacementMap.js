import { useState, useEffect } from 'react';
import Map from 'react-map-gl/mapbox';
import { Marker, Popup } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';


import * as d3 from 'd3'; // Using d3 to read CSV

const MAPBOX_TOKEN = "pk.eyJ1IjoibXVnaGlsMTI4IiwiYSI6ImNtN2JqM2ZzcDBjZXQycXNlNTl5Z3hhZXgifQ.WawhRrQHkBkav9rwGGUXUw";

export default function TowerPlacementMap() {
    const [locations, setLocations] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState(null);

    useEffect(() => {
        d3.csv("/coordinates.csv").then(data => {
            const parsedData = data.map(d => {
                let lat = parseFloat(d.Latitude.replace(/[^0-9.-]/g, "")); // Remove °N, °E, etc.
                let lon = parseFloat(d.Longitude.replace(/[^0-9.-]/g, "")); 
        
                return {
                    siteID: d["Site ID"],
                    latitude: lat,
                    longitude: lon,
                    address: d["Site Address"],
                    cgi: d["Cell Global Identity (CGI)"]
                };
            });
        
            console.log(parsedData); // Debugging - check the output
            setLocations(parsedData);
        });
        
    }, []);

    return (
        <Map
            initialViewState={{
                longitude: 80.2705,
                latitude: 13.0843,
                zoom: 5,
                bearing: 0,
                pitch: 0
            }}
        
            style={{
                width: "80%",  
                height: "500px",  
                margin: "20px auto",  
                border: "3px solid",  
                borderRadius: "15px",  
                boxShadow: "0px 8px 16px rgba(0, 0, 0, 0.2)",  
                overflow: "hidden",
                display: "block",
            }} 

            mapStyle="mapbox://styles/mapbox/streets-v11"
            mapboxAccessToken={MAPBOX_TOKEN}
        >
            {locations.map((location, index) => (
                <Marker
                    key={index}
                    longitude={location.longitude}
                    latitude={location.latitude}
                    anchor="bottom" // Ensures the marker stays correctly aligned
                >
                    <div style={{ fontSize: "20px", color: "red" }}>📍</div> 
                </Marker>
            ))}

            {selectedLocation && (
                <Popup
                    longitude={selectedLocation.longitude}
                    latitude={selectedLocation.latitude}
                    onClose={() => setSelectedLocation(null)}
                >
                    <div>
                        <h4>Site ID: {selectedLocation.siteID}</h4>
                        <p><b>Address:</b> {selectedLocation.address}</p>
                        <p><b>CGI:</b> {selectedLocation.cgi}</p>
                    </div>
                </Popup>
            )}
        </Map>
    );
}

