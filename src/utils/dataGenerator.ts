import { FlightRecord, TelemetryRecord, DAXFormula, DataDictionaryField } from "../types";

const HUBS = ["Colaba", "Bandra", "Dadar", "Juhu", "Kurla", "Andheri", "Nariman Point", "Thane"] as const;
const AIR_LANES = ["Lane-A1", "Lane-Express", "Lane-Coastal", "Lane-Suburban", "Lane-Vidhani", "Lane-HighAltitude"] as const;

export function generateInitialFlights(count: number): FlightRecord[] {
  const list: FlightRecord[] = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const origin = HUBS[Math.floor(Math.random() * HUBS.length)];
    let dest = HUBS[Math.floor(Math.random() * HUBS.length)];
    while (dest === origin) {
      dest = HUBS[Math.floor(Math.random() * HUBS.length)];
    }

    const dist = Math.round((5 + Math.random() * 35) * 10) / 10; // 5 to 40 km
    const dTime = new Date(now.getTime() - Math.random() * 4 * 3600 * 1000); // within last 4 hours
    const duration = Math.round(dist * 1.5 + Math.random() * 5); // 1.5 mins per km + buffer
    const aTime = new Date(dTime.getTime() + duration * 60 * 1000);

    const passengerCount = Math.floor(Math.random() * 5) + 1; // 1 to 5 passengers
    const averageAltitude = Math.round(150 + Math.random() * 450); // 150m to 600m
    const energyConsumed = Math.round(dist * 3.2 * passengerCount * 10) / 10; // MJ consumed

    list.push({
      flightID: `FL-2045-${10000 + i}`,
      vehicleID: `VTOL-${2000 + Math.floor(Math.random() * 3000)}`,
      pilotMode: Math.random() > 0.85 ? "Manual" : "AI",
      originHub: origin,
      destinationHub: dest,
      departureTime: dTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      arrivalTime: aTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      flightDuration: duration,
      distance: dist,
      passengerCount,
      airLaneUsed: AIR_LANES[Math.floor(Math.random() * AIR_LANES.length)],
      averageAltitude,
      energyConsumed,
      status: Math.random() > 0.95 ? "delayed" : Math.random() > 0.96 ? "diverted" : "completed",
    });
  }
  return list;
}

export function generateInitialTelemetry(count: number): TelemetryRecord[] {
  const telemetry: TelemetryRecord[] = [];
  for (let i = 0; i < count; i++) {
    const batteryHealth = Math.round(65 + Math.random() * 35); // 65-100%
    const temp = Math.round(45 + Math.random() * 40); // 45-85 C
    const sensorStatus = batteryHealth < 75 || temp > 80 
      ? (Math.random() > 0.5 ? "Degraded" : "Anomalous")
      : "Optimal";

    telemetry.push({
      vehicleID: `VTOL-${2000 + i}`,
      batteryHealth,
      motorTemp: temp,
      sensorStatus,
      aiConfidence: Math.round(92 + Math.random() * 7.9 * 10) / 10, // 92-99.9%
      signalStrength: -Math.round(45 + Math.random() * 40), // -45 to -85 dBm
      maintenanceNeeded: batteryHealth < 70 || temp > 82 || sensorStatus !== "Optimal",
      rul: Math.round(batteryHealth * 8.5 - (temp * 0.4)), // Estimated Remaining flight cycles
    });
  }
  return telemetry;
}

export function getDAXFormulas(): DAXFormula[] {
  return [
    {
      name: "Total Flights",
      category: "KPI",
      expression: "Total Flights = COUNTROWS('Fact_Flight_Operations')",
      description: "Calculates the absolute number of drone/VTOL journeys logged in the SkyGrid operational matrices.",
    },
    {
      name: "Total Revenue (Surge Grounded)",
      category: "Operational",
      expression: "Total Revenue = \nSUMX(\n  'Fact_Flight_Operations', \n  'Fact_Flight_Operations'[Base_Fare] * 'Fact_Flight_Operations'[Surge_Multiplier]\n)",
      description: "Aggregates revenue directly incorporating dynamic pricing surges calculated per minute per hub.",
    },
    {
      name: "Surge Multiplier Factor",
      category: "Operational",
      expression: "Surge Multiplier Factor = \nDIVIDE(\n  [Total Revenue], \n  SUM('Fact_Flight_Operations'[Base_Fare]),\n  1\n)",
      description: "Measures overall economic leverage achieved by the real-time grid congestion pricing model.",
    },
    {
      name: "Fleet Utilization Rate",
      category: "Operational",
      expression: "Fleet Utilization % = \nDIVIDE(\n  DISTINCTCOUNT('Fact_Flight_Operations'[Vehicle_ID]),\n  COUNTA('Dim_Fleet_Assets'[Vehicle_ID]),\n  0\n)",
      description: "Percentage of total active VTOL fleet currently airborne or pre-booked in general flight pools.",
    },
    {
      name: "Passenger Volume MoM",
      category: "Time Intelligence",
      expression: "Commuter Vol MoM % = \nVAR CurrentMonth = [Total Passengers]\nVAR PrevMonth = CALCULATE([Total Passengers], DATEADD('Dim_Calendar'[Date], -1, MONTH))\nRETURN\nDIVIDE(CurrentMonth - PrevMonth, PrevMonth, 0)",
      description: "Month-over-month passenger growth tracking for strategic hub development campaigns.",
    },
    {
      name: "RUL Prediction (AI Grounded)",
      category: "AI Forecasting",
      expression: "Remaining Useful Life (RUL) Cycles = \nCOALESCE(\n  AVERAGE('Dim_Fleet_Assets'[Model_Predicted_RUL_Cycles]),\n  0\n)",
      description: "The AI Copilot calculated number of safe flight segments remaining before mandatory stator/inductor replacement.",
    },
    {
      name: "Risk Score Index",
      category: "AI Forecasting",
      expression: "Air Corridor Risk Index = \nAVERAGEX(\n  'Fact_Flight_Operations',\n  RELATED('Dim_Safety_Incidents'[Weather_Severity_Index]) * 0.4 + \n  'Fact_Flight_Operations'[Manual_Steering_Time_Ratio] * 0.6\n)",
      description: "Weighted evaluation of flight lane exposure. Manual overrides heavily increase systemic risk score indexes.",
    },
    {
      name: "Dynamic Forecasted Revenue (12-Mo Slider)",
      category: "AI Forecasting",
      expression: "Revenue Forecast Mo = \nVAR MonthIndex = MIN('Prediction_Slider'[Value])\nVAR BaselineRevenues = [Total Revenue]\nVAR ProjGrowth = 0.045\nRETURN \nBaselineRevenues * POWER(1 + ProjGrowth, MonthIndex)",
      description: "Calculates forecasted revenues using a dynamic parameter slider to project futuristic smart city growth rates.",
    },
  ];
}

export function getDataDictionary(): DataDictionaryField[] {
  return [
    {
      tableName: "Fact_Flight_Operations",
      fieldName: "Flight_ID",
      dataType: "Text (GUID)",
      description: "Primary key. Unique operational trace ID for every airborne anti-gravity cycle.",
      sampleValue: "FL-2045-14209",
    },
    {
      tableName: "Fact_Flight_Operations",
      fieldName: "Pilot_Mode",
      dataType: "Text",
      description: "Mode of navigation: 'AI' (Grid-controlled) or 'Manual' (Human operator override).",
      sampleValue: "AI",
    },
    {
      tableName: "Fact_Flight_Operations",
      fieldName: "Origin_Hub_ID",
      dataType: "Text (FK)",
      description: "Foreign key linking back to Dim_Hubs representing the flight embarkation point.",
      sampleValue: "HUB-BANDRA",
    },
    {
      tableName: "Dim_Fleet_Assets",
      fieldName: "Battery_Health_Pct",
      dataType: "Decimal Percentage",
      description: "Live state-of-charge capacity factor of the quantum lithium-graphene power cell.",
      sampleValue: "94.2%",
    },
    {
      tableName: "Dim_Fleet_Assets",
      fieldName: "Predicted_RUL_Cycles",
      dataType: "Integer",
      description: "Model-calculated remaining flights before mandatory anti-gravity stator overhaul.",
      sampleValue: "782 cycles",
    },
    {
      tableName: "Fact_Passenger_Intelligence",
      fieldName: "Satisfaction_Score",
      dataType: "Integer (1-5)",
      description: "Post-flight service score submitted by luxury or micro-subscription commuters.",
      sampleValue: "5",
    },
    {
      tableName: "Dim_Safety_Incidents",
      fieldName: "Risk_Severity",
      dataType: "Text",
      description: "Incident urgency classifications: 'Minor' (yaw drift), 'Moderate' (GPS sync gap), or 'Critical' (Inductor surge).",
      sampleValue: "Moderate",
    }
  ];
}

export function getPortfolioContent() {
  return {
    readme: `# Mumbai SkyGrid 2045 – Flying Vehicle Intelligence Platform

**"Revolutionizing Urban Air Mobility Monitoring through Futuristic Command Center Analytics."**

## 🌐 Objective
This repository hosts the **Mumbai SkyGrid 2045** intelligence suite—an executive-level, production-ready full-stack conceptual architecture. It simulates data pipes, telemetry aggregators, and dynamic risk projection engines designed to guide 12,000 active anti-gravity VTOL taxis operating over Mumbai's skies.

## 🛠️ Tech Stack & Model Specs
- **Analytics Interface:** Power BI Pro UI replication (developed using React 19, Recharts & Tailwind CSS).
- **Backend Broker:** Express.js proxy with full lazy-loaded **Gemini 3.5 Flash** server-side integrations for generative Air-Traffic Co-pilot queries.
- **Model Pattern:** Star Schema architecture (Optimized DAX hierarchies across dimensions like \`Dim_Calendar\`, \`Dim_Fleet_Assets\`, and \`Dim_Hubs\`).

## 📊 Business Metrics Impacted
- **Grid Safety Index:** Maintained high performance averages of \`99.8%\`.
- **Fleet Turnover:** Reduced vehicle downtime by 35% through predicted Remaining Useful Life (RUL) cycles.
- **Dynamic Yield Boost:** Improved corridor monetization indexes with customized surge pricing algorithms.`,

    caseStudy: `## 🏆 Recruiter Case Study: Mumbai Skies Optimized
### The Context
By 2045, Mumbai’s regional ground traffic was completely saturated. The transition to high-altitude anti-gravity VTOL fleets required an instantaneous command center capable of interpreting massive, multi-Gbps IoT telemetry streams.

### The Solution: Mumbai SkyGrid
We implemented an enterprise intelligence pipeline compiling:
1. **Fact_Flight_Operations (100,000+ virtual records):** For telemetry correlations.
2. **Predictive Analytics Lab:** Housing localized regressions projecting battery breakdown, passenger bottlenecks, and flight delays under torrential monsoons.
3. **AI Co-Pilot Panel:** Empowering urban planning executives with direct, zero-code, natural language inquiries on corridor capacity loads.

### Operational Returns
- **34.2 Tons of CO2 Offset Daily** compared to traditional grid networks.
- **Real-time dynamic surge algorithms** balancing operational fleet densities automatically across high demand zones.`,

    linkedin: `🚀 Thrilled to unveil "Mumbai SkyGrid 2045" — a state-of-the-art Flying Vehicle Intelligence Command Center!

As cities graduate from 2D arterial roads to 3D high-altitude airlanes, monitoring thousands of anti-gravity VTOL vehicles requires an executive-tier, responsive dashboard.

This platform bridges:
- **Comprehensive Star Schema Modeler:** Structured for high-performance Power BI DAX operations.
- **AI-Driven Predictive Lab:** Forecasting remaining useful service cycles (RUL) and airspace congestion levels.
- **Dynamic Telemetry & Digital Twins:** A simulation of Mumbai's live active grid.

Built with React, Express, and fully integrated with server-side Google Gemini for intelligent Co-Pilot guidance!

Check out the future of urban flight analytics! Let's talk about the future of transportation tech. 

#SmartCities #PowerBI #DataAnalytics #AviationTech #IoTData #FuturisticTech #BusinessIntelligence`
  };
}
