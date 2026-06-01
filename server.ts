import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Lazy initialization of Gemini API client
let aiInstance: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiInstance) {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key.includes("MY_GEMINI_API_KEY") || key === "") {
      throw new Error("GEMINI_API_KEY environment variable is missing or empty.");
    }
    aiInstance = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiInstance;
}

// Simulated automated real-time alerts
const SMART_ALERTS = [
  {
    id: "alert-1",
    severity: "critical",
    category: "Air Traffic",
    message: "High density bottleneck formed over Bandra-Worli Sea Link Air Corridor. Diverting flights to Route B.",
    timestamp: "Just Now",
  },
  {
    id: "alert-2",
    severity: "warning",
    category: "Battery Health",
    message: "Vehicle VTOL-4029 reports cell thermal abnormality. Auto-routing to nearest recharge nest in Kurla East.",
    timestamp: "2 mins ago",
  },
  {
    id: "alert-3",
    severity: "info",
    category: "Weather Alert",
    message: "Monsoon microburst predicted near Colaba coastal lane in 15 mins. Imposing temporary ceiling restrictions (altitude max 120m).",
    timestamp: "5 mins ago",
  },
  {
    id: "alert-4",
    severity: "success",
    category: "Profit Optimization",
    message: "Dynamic Pricing Surge unlocked for Dadar Central Hub (1.4x multiplier activated due to high corporate passenger outflow).",
    timestamp: "10 mins ago",
  },
];

// Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Smart Alerts endpoint
app.get("/api/alerts", (req, res) => {
  res.json({ alerts: SMART_ALERTS });
});

// Gemini AI Co-Pilot endpoint
app.post("/api/gemini/copilot", async (req, res) => {
  const { query, currentState } = req.body;

  if (!query) {
    return res.status(400).json({ error: "Query is required" });
  }

  const stateContext = currentState 
    ? `Current Operational State (Mumbai SkyGrid 2045):
- Active Flights: ${currentState.activeFlights || 1420}
- Fleet Utilization: ${currentState.fleetUtilization || "88.4"}%
- Average Wait Time: ${currentState.avgWaitTime || "4.2"} mins
- Passenger Congestion Safety Score: ${currentState.safetyScore || 99.8}%
- Dynamic Surge Pricing: ${currentState.surgeMultiplier || 1.2}x average
- Main Target Sector Peak Lane: ${currentState.peakSector || "Bandra-Worli Transit"}
- Weather Status: ${currentState.weather || "Heavy Monsoon Overcast"}
- Carbon Off-set Savings: ${currentState.co2Savings || "14.2"} tons today`
    : "State data currently offline.";

  try {
    const ai = getGeminiClient();
    const systemPrompt = `You are the chief operations AI Co-Pilot for "Mumbai SkyGrid 2045", a premium, state-of-the-art anti-gravity flying taxi network.
Your tone is professional, futuristic, authoritative, analytical, and supportive of smart city operators.
You are talking to an urban mobility executive or fleet manager.

Use the provided current operational state to contextualize your analytics responses:
${stateContext}

Make your responses incredibly engaging. Integrate technical Smart City transportation jargon appropriately (e.g., VTOL, anti-gravity inductors, microburst wind corridors, quantum air lanes, Bandra-Juhu transit vectors, charge density nodes). Keep your insights highly actionable, structuring them with bold metrics, Bullet points, or clean sections.

If requested or highly relevant to flight operations, passenger analytics, revenue, safety, or fleet performance, you MUST generate and include:
1. DAX Measures: Encapsulate DAX measures strictly within a block starting with \`\`\`dax and ending with \`\`\`. Example:
\`\`\`dax
// Cumulative Passenger Load
TotalCommuterLoad = SUM(FactPassengerTraffic[Commuters])
\`\`\`

2. Power BI Visual configurations: Code-blocks starting with \`\`\`pbi-visual and ending with \`\`\`. It must be valid JSON matching this schema:
{
  "visualType": "Clustered Column Chart" | "Donut Chart" | "KPI Card" | "Line Chart" | "Area Chart" | "Gauge Chart",
  "title": "A descriptive title",
  "tablesAndFields": { "Axis/X-Axis": "Table[Field]", "Values": "Table[Field]" },
  "formatting": ["Directive 1", "Directive 2"],
  "description": "What this visual communicates about Mumbai SkyGrid."
}

Return well-formatted Markdown. Keep text summaries to 3 dense paragraphs max alongside code blocks.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: query,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      },
    });

    const reply = response.text || "No insights generated from SkyGrid Systems.";
    res.json({ text: reply, realAI: true });
  } catch (error: any) {
    console.warn("Gemini API call failed, running rule-based fallback co-pilot. Error:", error.message);
    
    // Fallback Mock Copilot Response
    const lowerQuery = query.toLowerCase();
    let fallbackText = "";

    if (lowerQuery.includes("passenger") || lowerQuery.includes("commuter") || lowerQuery.includes("wait") || lowerQuery.includes("density")) {
      fallbackText = `### 👥 Passenger Analytics Intelligence (Simulation Backup)
Historical commute indices reveal peak density surges over south-east terminals. Here is a telemetry breakdown to optimize your passenger routing metrics.

#### Key Insight
Average wait times are currently hovering at **${currentState?.avgWaitTime || "4.2"} minutes** during the active monsoon corridor limit. Dadar Hub maintains a **86.4% load factor**, with terminal discharge rates operating at peak throughput.

\`\`\`pbi-visual
{
  "visualType": "Clustered Column Chart",
  "title": "Passenger Congestion Indexes by SkyGrid Hub Node",
  "tablesAndFields": {
    "X-Axis/Hub": "DimSkyNodes[HubName]",
    "Values/Commuters": "FactPassengerTraffic[ActiveCommuters]",
    "Legend": "DimSkyNodes[TerminalSector]"
  },
  "formatting": [
    "Theme: Neon Cyan & Cobalt Blue gradients",
    "Enable tooltips for real-time corridor congestion indexes",
    "Sort descend by total passenger load counts"
  ],
  "description": "This visual illustrates current passenger density distribution across Dadar, Bandra, Colaba, Juhu, and Kurla East hubs to alert operators where to route emergency VTOL backup assets."
}
\`\`\`

#### Optimized DAX Indicator
Use this DAX measure to calculate 30-day rolling passenger congestion trends in Power BI desktop:

\`\`\`dax
// 30-Day Rolling Passenger Load Factor
30DayAvgCommuterCount = 
AVERAGEX(
  DATESINPERIOD(
    DimCalendar[Date], 
    LASTDATE(DimCalendar[Date]), 
    -30, 
    DAY
  ),
  CALCULATE(
    SUM(FactPassengerTraffic[ActiveCommuters])
  )
)
\`\`\`

*Recommendation: Deploy 14 extra high-capacity tactical VTOL cruisers to Juhu-Dadar radial vector to absorb the evening outflow surge.*`;

    } else if (lowerQuery.includes("revenue") || lowerQuery.includes("profit") || lowerQuery.includes("pricing") || lowerQuery.includes("cost") || lowerQuery.includes("charge")) {
      fallbackText = `### 📊 SkyGrid Revenue Intelligence Advice
Corridor pricing yields are solid, averaging a **${currentState?.surgeMultiplier || 1.25}x surge multiplier** under current rain index constraints. 

#### Key Revenue Drivers
The Bandra to Nariman Point trans-coastal lane is generating a high net margin of **44.2%** under solar grid backup systems, while the Dadar central terminal is experiencing a strong rise in high-value business class bookings.

\`\`\`pbi-visual
{
  "visualType": "Line Chart",
  "title": "Hourly Surge Multiplier vs Dynamic Revenue Yield",
  "tablesAndFields": {
    "Axis/TimeHour": "DimCalendar[HourOfDay]",
    "Values/NetIncome": "FactRevenue[TotalRevenueINR]",
    "SecondaryValues/Surge": "FactRevenue[AverageSurgeFactor]"
  },
  "formatting": [
    "Primary axis: Revenue (Millions INR, formatted in ₹)",
    "Secondary axis: Surge Multiplier (decimals, rounded 2pt)",
    "Color scheme: Emerald Green for revenue, Cyber Yellow for surge ticks"
  ],
  "description": "Depicts high-value commuter correlation plots under dynamic surges. Helps executives justify solar runway tariff adjustments."
}
\`\`\`

#### Advanced DAX Surge Measure
Configure this DAX measure to compute dynamic pricing margins across sectors:

\`\`\`dax
// Net Surge Revenue Premium Yield
NetSurgePremiumINR = 
SUMX(
  FactRevenue,
  FactRevenue[BaseRevenueINR] * (FactRevenue[AverageSurgeFactor] - 1.0)
)
\`\`\`

*Strategy: Increase Dadar central pricing floors by 15% manually to restrict line queue overlaps.*`;

    } else if (lowerQuery.includes("safety") || lowerQuery.includes("incident") || lowerQuery.includes("weather") || lowerQuery.includes("alert")) {
      fallbackText = `### 🛡️ Fleet & Airspace Safety Advisor
Your current safety index remains robust at **${currentState?.safetyScore || "99.81"}%**. Fleet auto-pilot overrides are mitigating monsoon crosswinds near Colaba air routes.

#### Safety Indicators
Battery thermal cell abnormalities on eVTOL-4029 have been resolved with zero delay. All autonomous sensor suites report healthy confidence levels.

\`\`\`pbi-visual
{
  "visualType": "Gauge Chart",
  "title": "Quantum Auto-Pilot Confidence Index",
  "tablesAndFields": {
    "KPIValue": "FactSafetyLogs[AverageAIConfidence]",
    "TargetValue": "FactSafetyLogs[RegulatorySafetyBenchmark]"
  },
  "formatting": [
    "Min value: 50%, Max value: 100%",
    "Target line configured at 98.4% (Bureau of Anti-Gravity Civil Aviation threshold)",
    "Color bandings: Red (50-80%), Yellow (80-95%), Green (95-100%)"
  ],
  "description": "Displays state-mandated autonomous driving trust boundaries. Currently functioning safely above regulation requirements."
}
\`\`\`

#### DAX Safety Rating Measure
This formula allows Power BI dashboards to track cumulative safety events per 10,000 trips:

\`\`\`dax
// Incident Rates per 10k Flights
IncidentRatePer10k = 
DIVIDE(
  COUNT(FactSafetyLogs[IncidentID]) * 10000,
  COUNT(FactPassengerTraffic[TripID]),
  0
)
\`\`\`

*Action Plan: Impose a brief 120m altitude buffer ceiling over the Colaba coastal vector to avoid rain microburst micro-deviations.*`;

    } else if (lowerQuery.includes("fleet") || lowerQuery.includes("performance") || lowerQuery.includes("vtol") || lowerQuery.includes("battery") || lowerQuery.includes("rul")) {
      fallbackText = `### 🛸 Fleet Performance Diagnostics
Our eVTOL taxi fleet shows a sturdy **${currentState?.fleetUtilization || "88.4"}% utilization index** across Mumbai's 8 central landing pads. 

#### Fleet Health Metrics
Battery cycle degradation is within predictable boundaries, and motor temperatures remain stable under continuous heavy loading.

\`\`\`pbi-visual
{
  "visualType": "Donut Chart",
  "title": "Fleet Health Distribution Status",
  "tablesAndFields": {
    "Legend": "DimVehicles[DiagnosticsRating]",
    "Values": "DimVehicles[VehicleID]"
  },
  "formatting": [
    "Colors: Teal for Optimal, Amber for Degraded, Red for Anomalous",
    "Show data labels as percentages of total operational fleet"
  ],
  "description": "Provides instant visibility into active eVTOL maintenance states to help garage heads sequence daily battery pack replacements."
}
\`\`\`

#### Advanced Predictive DAX Measure
This formula forecasts remaining useful life cycles (RUL) for active batteries:

\`\`\`dax
// Average Remaining Useful Life (RUL) Cycles
AverageRemainingRULCycles = 
AVERAGEX(
  DimVehicles,
  DimVehicles[CurrentRULCycles]
)
\`\`\`

*Action items: Schedule periodic rotor-inductor diagnostic sweeps at Colaba parking garages during low commute blocks (01:00-04:00).*`;

    } else {
      fallbackText = `### 🤖 Mumbai SkyGrid 2045 Operations Dispatch
Received General Analytics Directive. Mumbai SkyGrid is running efficiently. Here is a baseline operational visualization plan.

\`\`\`pbi-visual
{
  "visualType": "KPI Card",
  "title": "Airborne Flights Volume Index",
  "tablesAndFields": {
    "Indicator": "FactFlights[ActiveFlightsVolume]",
    "Target": "FactFlights[PlannedFlightsBenchmark]"
  },
  "formatting": [
    "Increase indicator font to 45pt bold cyan",
    "Comparison trend text: green overlay"
  ],
  "description": "Displays active high-altitude hover units in real-time. Represents total sky congestion pressure."
}
\`\`\`

#### DAX Operations Measure
\`\`\`dax
// Combined Fleet Utilization Ratio
FleetUtilizationRatio = 
DIVIDE(
  COUNTROWS(FILTER(DimVehicles, DimVehicles[CurrentStatus] = "In Flight")),
  COUNTROWS(DimVehicles),
  0
)
\`\`\`

*operator guidance: You can query specific metrics. Type: 'passenger', 'revenue', 'safety', 'fleet', or 'dax formulas' for customized dashboards.*`;
    }

    res.json({ 
      text: fallbackText, 
      realAI: false,
      warning: "Running cloud simulation model. Connect your Gemini API Key in the Secrets Panel for customized LLM reasoning."
    });
  }
});

// Vite & Static file hosting for Production/Development
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Mumbai SkyGrid] Command Center ready at http://localhost:${PORT}`);
  });
}

startServer();
