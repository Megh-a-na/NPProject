
# Digital Twin-Based 5G Tower Site Planner

An industry-oriented simulation tool designed to simplify and optimize 5G tower placement. This project was developed as part of an academic-industry collaboration, inspired by a lecture on Nokia's role in telecommunications and aimed at solving a real-world deployment bottleneck.

---

## 🚀 Project Overview

The shift to 5G is hindered by the complexity of tower placement—especially when compared to 4G. Service providers face challenges due to environmental unpredictability, lack of terrain data, and the high cost of manual site evaluation.

This project addresses those pain points with a **digital twin simulation platform** that:
- Simulates environmental and logistical data.
- Uses geospatial calculations and configurable heuristics.
- Outputs ideal tower locations.
- Provides a rich frontend interface with interactive mapping.
- Includes cost analysis and site profiling.
- Enables PDF report generation for informed deployment planning.

We focused on building a practical MVP (Minimum Viable Product) for end users like **network operators**, **field engineers**, and **infrastructure planners**.

---

## 🎯 Core Features

### 1. Smart Tower Placement Using Haversine Formula
- Users input a **location** and specify the **number of towers**.
- The system simulates terrain and logistical data.
- Uses the **Haversine formula** and environmental filtering to determine optimal coordinates.

### 2. Interactive Map Visualization
- A **Mapbox-powered map** displays calculated tower sites.
- Pins are placed at each recommended coordinate.
- Hovering on pins reveals detailed site information including:
  - Latitude and Longitude
  - Optimization Score
  - Land Use Type
  - Estimated Population Density
  - Average Building Height
  - **Recommended Tower Height**

### 3. Cost Analysis
- For each selected site, a **cost breakdown** is computed:
  - **CAPEX (Initial Investment)**: Tower, equipment, installation, backhaul costs.
  - **OPEX (Annual Operating Cost)**: Lease, maintenance, power, and backhaul.
- The **total first-year cost** is calculated and included in reports.
- Cost analysis is shown alongside site performance details for complete transparency.

### 4. PDF Report Generation
- Downloadable report for all tower sites shown on the map.
- Report includes:
  - Location coordinates
  - Environmental and demographic analysis
  - Optimization score and tower height
  - Full cost breakdown (CAPEX, OPEX, first-year total)

### 5. Digital Twin Simulation for Deployment Planning
- Virtually evaluates different site layouts.
- Simulates installation logistics and planning risks.
- Designed to support decision-making and training for engineers and technicians.

### 6. Login Functionality
- Users are required to sign in through a **login interface**.
- Credentials are validated via the backend before accessing the simulation dashboard.
- Future versions could expand this to include role-based access and saved sessions.

---

## 💡 Use Cases
- **Site survey simulation** before expensive field operations.
- **Training module** for new field engineers.
- **Data-informed installation planning** for telecom service providers.
- **Prototype base** for future GIS-integrated systems.

---

## 🧱 Tech Stack

### Frontend
- **React + Vite**
- **TypeScript**
- **Mapbox GL JS** (for map rendering)

### Backend
- **Python with Flask**
- **Geospatial logic** using Haversine formula
- **Simulated environmental models** via Python scripts
- **Cost and performance analysis engine**

### Utilities
- **PDF Generation** for exporting tower reports
- **CSV and SQLite** used for local demo data handling
- **Basic authentication module** for login

---
## Screenshots

![image](https://github.com/user-attachments/assets/7b96b60c-2ae1-4c8b-a8d0-25724b6451a4)
![image](https://github.com/user-attachments/assets/5158afbb-c93f-4a8f-8e57-1c86813c0b25)
![image](https://github.com/user-attachments/assets/e2eab24b-8371-4e77-8e8c-4d5115585598)
![image](https://github.com/user-attachments/assets/6a037535-7d8b-4bd3-8243-e0712915652c)
![image](https://github.com/user-attachments/assets/1cb8eb34-f35b-4e6b-a9c6-6a3282055def)
![image](https://github.com/user-attachments/assets/38d30b8f-52cc-457b-94ef-ea3371d13670)

---

## 🗂️ Project Structure

```
project-root/
├── NPProject/           # Frontend (React + Vite + TS)
│   ├── src/
│   ├── public/
│   ├── index.html
│   └── vite.config.js
│
├── backend/             # Backend (Flask + Python logic)
│   ├── app.py           # Flask entrypoint
│   ├── analysis.py      # Performance and cost scoring
│   ├── data_generator.py# Simulation of tower data
│   ├── login.py         # User authentication
│   ├── requirements.txt
│   ├── site_data.csv    # Sample environmental data
│   └── user_database.db # User login data
│   └── water_detection.py # Prioritizes land based towers
```

---

## 🔮 Future Scope

- Real-time GIS data integration
- Terrain and obstruction layer modeling
- Machine Learning for site optimization
- 5G network slicing simulation
- Multi-objective planning algorithms (balancing cost, coverage, and interference)
- Role-based login and cloud deployment
- City-wide or national scale expansion

---

