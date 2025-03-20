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

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate inputs before sending request
        if (!dropdownvalue || !towervalue) {
            alert("Please select a location and enter the number of towers");
            return;
        }
        
        setIsLoading(true);
        
        console.log("Optimizing tower placement for:", dropdownvalue);
        console.log("Number of towers requested:", towervalue);

        try {
            // Create test data - 6 towers for testing
            const testData = [];
            const baseCoordinates = {
                "Whitefield": {lat: 12.97, lng: 77.73},
                "Andheri": {lat: 19.11, lng: 72.87},
                "Gurgaon": {lat: 28.46, lng: 77.03},
                "Salt Lake": {lat: 22.58, lng: 88.41}
            };
            
            const base = baseCoordinates[dropdownvalue];
            const numTowers = parseInt(towervalue);
            
            for (let i = 0; i < numTowers; i++) {
                // Add small random offsets to create different tower locations
                const latOffset = (Math.random() - 0.5) * 0.05;
                const lngOffset = (Math.random() - 0.5) * 0.05;
                
                testData.push({
                    latitude: base.lat + latOffset,
                    longitude: base.lng + lngOffset,
                    siteID: `Test-${i+1}`,
                    score: 8.5 - (i * 0.2),
                    source: "API"
                });
            }
            
            console.log(`Created ${testData.length} test towers`);
            setTowerLocations(testData);
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