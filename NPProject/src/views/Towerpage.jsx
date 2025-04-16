import React, { useState } from 'react';
import SimpleDropdown from '../components/Tower-visualization/Localitydropdown';
import EntryBox from '../components/Tower-visualization/Towerentry';
import MyForm from '../components/Tower-visualization/SubmitButton';
import MyFormClear from '../components/Tower-visualization/cleartower';
import DownloadReportButton from '../components/Tower-visualization/DownloadReportButton';
import TowerPlacementMap from '../components/Tower-visualization/TowerPlacementMap';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Add the fetchIndianLocationData function
const fetchIndianLocationData = async (latitude, longitude) => {
    // Mock data for testing
    return {
        landUse: 'Urban',
        populationDensity: Math.floor(Math.random() * 10000) + 1000,
        avgBuildingHeight: Math.floor(Math.random() * 20) + 5,
        recommendedHeight: Math.floor(Math.random() * 30) + 20,
        isWater: Math.random() > 0.8,
        relocated: Math.random() > 0.9
    };
};

// Add the fetchCostEstimates function
const fetchCostEstimates = async (siteData) => {
    // Base costs from the popup
    const baseTowerCost = 50000;
    const baseEquipmentCost = 30000;
    const baseInstallationCost = 20000;
    const baseBackhaulCost = 15000;
    
    const baseLeaseCost = 12000;
    const baseMaintenanceCost = 8000;
    const basePowerCost = 6000;
    const baseBackhaulOpex = 10000;
    
    // Terrain multipliers from the popup
    const terrainMultiplier = {
        'urban': 1.0,
        'suburban': 1.1,
        'rural': 1.2,
        'flat': 1.0,
        'hilly': 1.2,
        'mountainous': 1.5
    };
    
    // Accessibility multipliers from the popup
    const accessibilityMultiplier = {
        'easy': 1.0,
        'moderate': 1.1,
        'difficult': 1.3
    };
    
    // Get terrain and accessibility from site data
    const terrain = siteData.Terrain?.toLowerCase() || 'urban';
    const accessibility = siteData.Accessibility?.toLowerCase() || 'moderate';
    
    // Calculate CAPEX (same as popup)
    const towerCost = baseTowerCost * terrainMultiplier[terrain];
    const equipmentCost = baseEquipmentCost;
    const installationCost = baseInstallationCost * accessibilityMultiplier[accessibility];
    const backhaulCost = baseBackhaulCost;
    
    const totalCapex = towerCost + equipmentCost + installationCost + backhaulCost;
    
    // Calculate OPEX (same as popup)
    const leaseCost = baseLeaseCost;
    const maintenanceCost = baseMaintenanceCost * terrainMultiplier[terrain];
    const powerCost = basePowerCost;
    const backhaulOpex = baseBackhaulOpex;
    
    const totalOpex = leaseCost + maintenanceCost + powerCost + backhaulOpex;
    
    // Calculate total first year cost (same as popup)
    const totalFirstYearCost = totalCapex + totalOpex;
    
    return {
        capex: {
            breakdown: {
                tower_cost: towerCost,
                equipment_cost: equipmentCost,
                installation_cost: installationCost,
                backhaul_cost: backhaulCost
            },
            total_capex: totalCapex
        },
        opex: {
            breakdown: {
                lease_cost: leaseCost,
                maintenance_cost: maintenanceCost,
                power_cost: powerCost,
                backhaul_cost: backhaulOpex
            },
            total_opex: totalOpex
        },
        total_first_year_cost: totalFirstYearCost
    };
};

function Towerpagefn() {
    const [dropdownvalue, setDropDownValue] = useState("");
    const [towervalue, setTowerValue] = useState("");
    const [towerLocations, setTowerLocations] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);
    const [generatedLocations, setGeneratedLocations] = useState({});
    const [selectedLocation, setSelectedLocation] = useState(null);

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
        // Close any open popup in the map
        setSelectedLocation(null);
        // Clear form values and tower locations
        setTowerValue("");
        setDropDownValue("");
        setTowerLocations([]);
        console.log("Tower value cleared and map popup closed");
    };

    const generatePDFReport = async (reportData) => {
        try {
            const doc = new jsPDF();
            doc.setFontSize(14);
            doc.setTextColor(41, 128, 185);

            // Title
            doc.text(`Tower Placement Report - ${dropdownvalue}`, 20, 20);
            doc.setFontSize(12);
            doc.setTextColor(0, 0, 0);
            doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);
            doc.text(`Number of Towers: ${towerLocations.length}`, 20, 40);

            let yPos = 60;

            // For each tower location
            for (const { siteData, costEstimates } of reportData) {
                // Site Information
                doc.setFontSize(13);
                doc.setTextColor(41, 128, 185);
                doc.text(`Site ID: ${siteData.siteID}`, 20, yPos);
                
                doc.setFontSize(11);
                doc.setTextColor(0, 0, 0);
                
                // Location Details
                doc.text(`Coordinates: ${siteData.latitude.toFixed(6)}°, ${siteData.longitude.toFixed(6)}°`, 25, yPos + 10);
                if (siteData.score) {
                    doc.text(`Optimization Score: ${siteData.score.toFixed(2)}`, 25, yPos + 20);
                }
                
                // Urban Data
                if (siteData.urbanData) {
                    doc.text(`Land Use: ${siteData.urbanData.landUse}`, 25, yPos + 30);
                    doc.text(`Population Density: ${siteData.urbanData.populationDensity}/km²`, 25, yPos + 40);
                    doc.text(`Average Building Height: ${siteData.urbanData.avgBuildingHeight}m`, 25, yPos + 50);
                    doc.text(`Recommended Tower Height: ${siteData.urbanData.recommendedHeight}m`, 25, yPos + 60);
                }

                // Cost Analysis
                if (costEstimates) {
                    doc.setFontSize(12);
                    doc.setTextColor(41, 128, 185);
                    doc.text('Cost Analysis', 20, yPos + 75);
                    
                    doc.setFontSize(11);
                    doc.setTextColor(0, 0, 0);

                    // CAPEX Table
                    const capexData = [
                        ['Component', 'Cost (₹)'],
                        ['Tower Cost', costEstimates.capex.breakdown.tower_cost.toLocaleString()],
                        ['Equipment Cost', costEstimates.capex.breakdown.equipment_cost.toLocaleString()],
                        ['Installation Cost', costEstimates.capex.breakdown.installation_cost.toLocaleString()],
                        ['Backhaul Cost', costEstimates.capex.breakdown.backhaul_cost.toLocaleString()],
                        ['Total CAPEX', costEstimates.capex.total_capex.toLocaleString()]
                    ];

                    autoTable(doc, {
                        startY: yPos + 80,
                        head: [['CAPEX Breakdown', 'Amount (₹)']],
                        body: capexData.slice(1),
                        theme: 'striped',
                        headStyles: { fillColor: [41, 128, 185] },
                        margin: { left: 25 },
                        width: 160
                    });

                    // OPEX Table
                    const opexData = [
                        ['Component', 'Cost (₹)'],
                        ['Lease Cost', costEstimates.opex.breakdown.lease_cost.toLocaleString()],
                        ['Maintenance Cost', costEstimates.opex.breakdown.maintenance_cost.toLocaleString()],
                        ['Power Cost', costEstimates.opex.breakdown.power_cost.toLocaleString()],
                        ['Backhaul Cost', costEstimates.opex.breakdown.backhaul_cost.toLocaleString()],
                        ['Total OPEX', costEstimates.opex.total_opex.toLocaleString()]
                    ];

                    autoTable(doc, {
                        startY: doc.lastAutoTable.finalY + 10,
                        head: [['Annual OPEX Breakdown', 'Amount (₹)']],
                        body: opexData.slice(1),
                        theme: 'striped',
                        headStyles: { fillColor: [41, 128, 185] },
                        margin: { left: 25 },
                        width: 160
                    });

                    // Total First Year Cost
                    doc.setFontSize(12);
                    doc.setTextColor(41, 128, 185);
                    doc.text(`Total First Year Cost: ₹${costEstimates.total_first_year_cost.toLocaleString()}`, 25, doc.lastAutoTable.finalY + 20);
                }

                // Special Notes
                if (siteData.isWater || siteData.relocated) {
                    doc.setFontSize(11);
                    doc.setTextColor(0, 0, 0);
                    let noteText = '';
                    if (siteData.isWater) {
                        noteText += '* This location is in or near water\n';
                    }
                    if (siteData.relocated) {
                        noteText += '* This tower was relocated from water to land';
                    }
                    doc.text(noteText, 25, doc.lastAutoTable.finalY + 30);
                }

                // Add a new page if there's another tower to document
                if (reportData.indexOf({ siteData, costEstimates }) < reportData.length - 1) {
                    doc.addPage();
                    yPos = 20;
                }
            }

            // Save the PDF
            doc.save(`tower_placement_report_${dropdownvalue}_${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (error) {
            console.error("Error generating PDF:", error);
            throw error;
        }
    };

    const handleDownloadReport = async () => {
        if (towerLocations.length === 0) {
            alert("No tower locations to generate report for");
            return;
        }

        setIsGeneratingReport(true);

        try {
            // Collect all site data and cost estimates using the same data as shown in the popup
            const reportData = await Promise.all(
                towerLocations.map(async (location) => {
                    // Get the urban data for this location
                    const urbanData = await fetchIndianLocationData(location.latitude, location.longitude);
                    
                    // Create the site data object using the exact same structure as in the popup
                    const siteData = {
                        ...location,
                        urbanData: urbanData,
                        Terrain: urbanData.landUse.toLowerCase(),
                        Accessibility: 'moderate'
                    };
                    
                    // Get cost estimates using the same function as the popup
                    const costEstimates = await fetchCostEstimates(siteData);
                    
                    return {
                        siteData,
                        costEstimates
                    };
                })
            );

            // Generate the PDF report with the collected data
            generatePDFReport(reportData);
        } catch (error) {
            console.error("Error generating report:", error);
            alert("An error occurred while generating the report. Please check the console for details.");
        } finally {
            setIsGeneratingReport(false);
        }
    };

    return (
        <>
            <form
                style={{
                    margin: '10vh auto',
                    width: '90vw',
                    maxWidth: '600px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '5px'
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
                <div style={{
                    display: 'flex',
                    flexDirection: 'row',
                    gap: '10px',
                    width: '100%',
                    justifyContent: 'center'
                }}>
                    <MyForm
                        onClick={handleSubmit}
                        disabled={isLoading}
                    />
                    <MyFormClear
                        onClick={handleClear}
                        disabled={isLoading}
                    />
                    <DownloadReportButton
                        onClick={handleDownloadReport}
                        disabled={isGeneratingReport || towerLocations.length === 0}
                    />
                </div>
                {isLoading && (
                    <div style={{ 
                        margin: '20px auto', 
                        textAlign: 'center',
                        color: '#015498'
                    }}>
                        <p>Optimizing tower placement... Please wait.</p>
                    </div>
                )}
                <TowerPlacementMap 
                    towerLocations={towerLocations} 
                    selectedLocation={selectedLocation}
                    setSelectedLocation={setSelectedLocation}
                />
            </form>
        </>
    );
}

export default Towerpagefn;