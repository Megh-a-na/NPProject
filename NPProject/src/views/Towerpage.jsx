import React, { useState } from 'react';
import SimpleDropdown from '../components/Tower-visualization/Localitydropdown';
import EntryBox from '../components/Tower-visualization/Towerentry';
import MyForm from '../components/Tower-visualization/SubmitButton';
import MyFormClear from '../components/Tower-visualization/cleartower';
import TowerPlacementMap from '../components/Tower-visualization/TowerPlacementMap';

function Towerpagefn() {
    const [dropdownvalue, setDropDownValue] = useState("");
    const [towervalue, setTowerValue] = useState("");
    const [towerLocations, setTowerLocations] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [generatedLocations, setGeneratedLocations] = useState({}); // Store generated locations

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!dropdownvalue || !towervalue) {
            alert("Please select a location and enter the number of towers");
            return;
        }
        
        const numTowers = parseInt(towervalue);
        const key = `${dropdownvalue}-${numTowers}`; // Unique key for subdistrict and tower count

        // Check if locations are already generated
        if (generatedLocations[key]) {
            setTowerLocations(generatedLocations[key]);
            console.log("Reusing previously generated tower locations");
            return;
        }

        setIsLoading(true);

        try {
            const testData = [];
            const baseCoordinates = {
                "Whitefield": { lat: 12.97, lng: 77.73 },
                "Andheri": { lat: 19.11, lng: 72.87 },
                "Gurgaon": { lat: 28.46, lng: 77.03 },
                "Salt Lake": { lat: 22.58, lng: 88.41 },
                "Koramangala": {lat: 12.9352, lng: 77.6245},
                "Bandra": {lat: 19.0667, lng: 72.8333},
                "South Extension": {lat: 28.5941, lng: 77.1996},
                "Banjara Hills": {lat: 17.4249, lng: 78.4747},
                "Anna Nagar": {lat: 13.1044, lng: 80.2107},
                "Viman Nagar": {lat: 18.5196, lng: 73.8987},
                "Lajpat Nagar": {lat: 28.5512, lng: 77.2348},
                "Indiranagar": {lat: 12.9781, lng: 77.6407},
                "Sector 18": {lat: 28.5703, lng: 77.3200},
                "Jayanagar": {lat: 12.9250, lng: 77.5938},
                "Malleshwaram": {lat: 13.0021, lng: 77.5606},
                "Hebbal": {lat: 13.0500, lng: 77.5970},
                "HSR Layout": {lat: 12.9141, lng: 77.6498},
                "Jubilee Hills": {lat: 17.4239, lng: 78.4228},
                "Secunderabad": {lat: 17.4399, lng: 78.4983},
                "Dwarka": {lat: 28.5951, lng: 77.0412},
                "Rohini": {lat: 28.7220, lng: 77.1000},
                "Connaught Place": {lat: 28.6315, lng: 77.2167},
                "Chandni Chowk": {lat: 28.6562, lng: 77.2300},
                "Noida Sector 18": {lat: 28.5707, lng: 77.3176},
                "Greater Kailash": {lat: 28.5235, lng: 77.2080},
                "Banashankari": {lat: 12.9200, lng: 77.5750},
                "BTM Layout": {lat: 12.9202, lng: 77.6133},
                "Khar": {lat: 19.0588, lng: 72.8258},
                "Parel": {lat: 19.0040, lng: 72.8459},
                "Mulund": {lat: 19.1862, lng: 72.9500},
                "Vashi": {lat: 19.0330, lng: 73.0160},
                "Dadar": {lat: 19.0176, lng: 72.8463},
                "Colaba": {lat: 18.9180, lng: 72.8323}
            };

            const base = baseCoordinates[dropdownvalue];
            
            for (let i = 0; i < numTowers; i++) {
                const latOffset = (Math.random() - 0.5) * 0.05;
                const lngOffset = (Math.random() - 0.5) * 0.05;

                testData.push({
                    latitude: base.lat + latOffset,
                    longitude: base.lng + lngOffset,
                    siteID: `Test-${i + 1}`,
                    score: 8.5 - (i * 0.2),
                    source: "API"
                });
            }

            console.log(`Created ${testData.length} test towers`);
            setTowerLocations(testData);

            // Save generated locations
            setGeneratedLocations((prev) => ({
                ...prev,
                [key]: testData
            }));
        } catch (error) {
            console.error("Error:", error);
            alert("An error occurred. Please check the console for details.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleClear = (e) => {
        e.preventDefault();
        setTowerValue("");
        setDropDownValue("");
        setTowerLocations([]);
        console.log("Tower value cleared");
    };

    return (
      <>
        <form
        style={{
            margin: '10vh auto',          // Center the form with margin
            width: '90vw',               // container width is 90% of viewport width
            maxWidth: '600px',           // limit maximum width
            display: 'flex',
            flexDirection: 'column',     // stack elements vertically
            alignItems: 'center',
            gap: '5px'                  // fixed gap between elements (50px)
        }}
    >
      <SimpleDropdown 
        value={dropdownvalue}
        onChange={(e) => setDropDownValue(e.target.value)} 
      />
      <EntryBox 
        value={towervalue}
        onChange={(e) => setTowerValue(e.target.value)}
      />
      <div
      style={{display: 'flex',
      flexDirection: 'row'}}
      >
        <MyForm
            onClick={handleSubmit}
            disabled={isLoading}
        />
        <MyFormClear
            onClick={handleClear}
            disabled={isLoading}
        />
      </div>
      {isLoading && (
          <div style={{ 
              margin: '20px auto', 
              textAlign: 'center',
              color: '#015498'
          }}>
              <p>Optimizing tower placement... Please wait.</p>
              {/* You could add a spinner here if desired */}
          </div>
      )}
      <TowerPlacementMap towerLocations={towerLocations} />
    </form>
    </>
    );
}

export default Towerpagefn;