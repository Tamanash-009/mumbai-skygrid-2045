import React, { useState, useEffect, useRef } from "react";
import { 
  Compass, Zap, HelpCircle, Activity, Globe, EyeOff, Eye, Info,
  CloudRain, Wind, Sun, AlertTriangle, Play, RefreshCw, BarChart2,
  Sliders, Settings, MapPin, Database, Sparkles, Filter, Bookmark,
  TrendingUp, BarChart, ShieldAlert
} from "lucide-react";
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, 
  BarChart as RechartsBarChart, Bar, LineChart, Line, CartesianGrid, Legend, ComposedChart
} from "recharts";
import { FlightRecord } from "../types";

interface DigitalTwinViewProps {
  flights: FlightRecord[];
}

interface MovingVehicle {
  id: string;
  vehicleID: string;
  sourceHubName: string;
  targetHubName: string;
  srcX: number;
  srcY: number;
  dstX: number;
  dstY: number;
  currX: number;
  currY: number;
  progress: number; // 0 to 1
  speed: number;
  altitude: number;
  battery: number;
}

export default function DigitalTwinView({ flights }: DigitalTwinViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [selectedTaxi, setSelectedTaxi] = useState<MovingVehicle | null>(null);
  const [showAirLanes, setShowAirLanes] = useState<boolean>(true);
  const [movingVehicles, setMovingVehicles] = useState<MovingVehicle[]>([]);

  // Simulation Tabs: Map view vs Power BI custom visual view
  const [currentViewTab, setCurrentViewTab] = useState<"map" | "powerbi">("map");

  // Map Overlays Toggles (Live Air Traffic, Smart City districts, Predictive AI hotspots)
  const [layerLiveTraffic, setLayerLiveTraffic] = useState<boolean>(true);
  const [layerSmartCity, setLayerSmartCity] = useState<boolean>(true);
  const [layerPredictive, setLayerPredictive] = useState<boolean>(false);
  const [predictionTimeframe, setPredictionTimeframe] = useState<"30m" | "2h" | "24h">("30m");
  const [layerRiskHeatmap, setLayerRiskHeatmap] = useState<boolean>(true);

  // --- What-If Parameters State (Power BI style sliding controls) ---
  const [selectedSector, setSelectedSector] = useState<string>("All Sectors");
  const [fleetSize, setFleetSize] = useState<number>(1500); // base fleet size simulated
  const [passengerDemandBoost, setPassengerDemandBoost] = useState<number>(20); // % booster
  const [airspaceLaneConfig, setAirspaceLaneConfig] = useState<string>("Sectorized Mesh");
  const [weatherSeverity, setWeatherSeverity] = useState<number>(3); // 1 to 5 level

  // Coordinates of Hubs mapped to virtual canvas coordinates
  const HUBS_GEO: Record<string, { x: number; y: number; fullName: string; description: string }> = {
    "Colaba": { x: 190, y: 480, fullName: "Colaba Coastal Harbor Terminus", description: "Southern luxury gateway servicing elite maritime corporate investors." },
    "Nariman Point": { x: 230, y: 440, fullName: "Nariman Point Business Port", description: "Corporate density hub supporting high-altitude high-speed vectors." },
    "Dadar": { x: 280, y: 330, fullName: "Dadar Central Sky-Terminal", description: "Inter-regional sky transit core with 4 active fast-charging nests." },
    "Bandra": { x: 310, y: 250, fullName: "Bandra Business District (BKC)", description: "Ultimate corporate peak load congestion vector, grid autopilot mandated." },
    "Kurla": { x: 380, y: 270, fullName: "Kurla Industrial Logistics Complex", description: "Heavy freight VTOL distribution nest and rotor refitting yard." },
    "Juhu": { x: 270, y: 190, fullName: "Juhu Coastal Terminal", description: "Scenic residential bay lanes with strict altitude ceiling caps." },
    "Andheri": { x: 340, y: 140, fullName: "Andheri Commercial Link", description: "Media and cargo loading corridors tracing high-density suburban link roads." },
    "Thane": { x: 450, y: 60, fullName: "Thane Sky-Gateways", description: "Northern sub-terminal feeding long-distance regional fleets." }
  };

  // Weather parameters mapped to severity index (1-5)
  const getWeatherTelemetry = (level: number) => {
    switch (level) {
      case 1:
        return { name: "Clear Sunny Skies", windSpeed: 8, visibility: 9500, precipitation: 0, hoverTerm: "Optimal flight windows" };
      case 2:
        return { name: "Coastal Mist / Fog", windSpeed: 16, visibility: 6200, precipitation: 2, hoverTerm: "Visual flight restricted" };
      case 3:
        return { name: "Heavy Monsoon Overcast", windSpeed: 26, visibility: 3100, precipitation: 14, hoverTerm: "Rain corridors active" };
      case 4:
        return { name: "Severe Thunderstorm", windSpeed: 42, visibility: 1200, precipitation: 42, hoverTerm: "Speed ceiling capped" };
      case 5:
        return { name: "Extreme Coastal Cyclone", windSpeed: 64, visibility: 350, precipitation: 88, hoverTerm: "Manual flight forbidden" };
      default:
        return { name: "Heavy Monsoon", windSpeed: 25, visibility: 3000, precipitation: 12, hoverTerm: "Standard monsoon" };
    }
  };

  const currentClimate = getWeatherTelemetry(weatherSeverity);

  // --- What-If Dynamic Live Calculations Engine ---
  const calculateSimulatedStats = () => {
    // 1. Safe simulated Wait Time
    let waitWeight = 4.2;
    waitWeight += (weatherSeverity * 1.5); // storm delays
    waitWeight += (passengerDemandBoost * 0.12); // traffic overload
    waitWeight -= (fleetSize / 1100); // more taxis reduces wait

    if (airspaceLaneConfig === "Traditional Hub-Spoke") waitWeight += 2.2;
    else if (airspaceLaneConfig === "Sectorized Mesh") waitWeight -= 0.6;
    else if (airspaceLaneConfig === "High-Altitude Express") waitWeight -= 1.4;
    else if (airspaceLaneConfig === "Coastal Bypass Loop") waitWeight -= 0.9;

    const waitTime = Math.max(1.1, Math.round(waitWeight * 10) / 10);

    // 2. Airspace Congestion Index (Percentage)
    let congestionWeight = 32;
    congestionWeight += (passengerDemandBoost * 1.0);
    congestionWeight += (weatherSeverity * 14);
    congestionWeight += (fleetSize / 250);

    if (airspaceLaneConfig === "Traditional Hub-Spoke") congestionWeight += 18;
    else if (airspaceLaneConfig === "Sectorized Mesh") congestionWeight -= 6;
    else if (airspaceLaneConfig === "High-Altitude Express") congestionWeight -= 14;
    else if (airspaceLaneConfig === "Coastal Bypass Loop") congestionWeight -= 9;

    const congestion = Math.max(10, Math.min(99, Math.round(congestionWeight)));

    // 3. Simulated Hourly Revenue (₹)
    const baseTicketPrice = 3500;
    const loadFactor = Math.min(1.0, 0.4 + (passengerDemandBoost / 150) - (weatherSeverity * 0.08));
    const activeVesselCount = Math.min(fleetSize, Math.round(fleetSize * (1 - (congestion / 180))));
    const revenue = Math.round(activeVesselCount * baseTicketPrice * loadFactor * (1.0 + passengerDemandBoost / 80));

    // 4. Safety Jitter Score %
    let baseSafetyLoss = 0.02 + (weatherSeverity * 0.4) + (fleetSize / 15000) + (airspaceLaneConfig === "Traditional Hub-Spoke" ? 0.35 : -0.05);
    if (weatherSeverity === 5) baseSafetyLoss += 1.2; // severe cyclone hit safety score slightly
    const safetyScore = Math.max(92.1, Math.min(99.98, Math.round((100 - baseSafetyLoss) * 100) / 100));

    // 5. Total Simulated Flights Airborne
    const simFlightsCount = Math.round(fleetSize * 0.45 * (1 - (weatherSeverity * 0.09)));

    return {
      waitTime,
      congestion,
      revenue,
      safetyScore,
      simFlightsCount
    };
  };

  const simResult = calculateSimulatedStats();

  // --- Dynamic High-Resolution Risk Hotspots Calculation Engine ---
  const riskHotspots = React.useMemo(() => {
    const spots = [
      { id: "dadar-interchange", name: "Dadar Sky Interchange", x: 280, y: 330, baseRisk: 30, sector: "Central" },
      { id: "bkc-confluence", name: "Bandra BKC Core Confluence", x: 310, y: 250, baseRisk: 42, sector: "Bandra BKC Core" },
      { id: "nariman-point", name: "Nariman Point Business Port", x: 230, y: 440, baseRisk: 22, sector: "South" },
      { id: "andheri-gateway", name: "Andheri Commercial Link", x: 340, y: 140, baseRisk: 28, sector: "North" },
      { id: "colaba-approach", name: "Colaba Harbour Approach", x: 190, y: 480, baseRisk: 15, sector: "South" },
      { id: "kurla-cargo", name: "Kurla Heavy Cargo Corridor", x: 380, y: 270, baseRisk: 35, sector: "Central" },
    ];

    // Weather severity risk multiplier (scale factor)
    const weatherMultMap: Record<number, number> = {
      1: 0.60,  // Sunny: reduces accident probability
      2: 1.25,  // Fog: slight visibility hazard
      3: 2.10,  // Monsoon: wet conditions, high wind
      4: 3.80,  // Severe: thunderstorms, gust shear
      5: 6.20   // Cyclone: massive hazard level
    };
    const weatherMult = weatherMultMap[weatherSeverity] || 1.0;

    // Airspace lane config risk multiplier
    const laneConfigMap: Record<string, number> = {
      "Traditional Hub-Spoke": 1.45,   // High intersection bottleneck pressure
      "Sectorized Mesh": 0.80,         // Robust load dilution
      "High-Altitude Express": 0.95,   // Safe separation but faster transit speed
      "Coastal Bypass Loop": 0.85      // Bypasses core high-density sectors
    };
    const laneMult = laneConfigMap[airspaceLaneConfig] || 1.0;

    return spots.map((spot) => {
      // Calculate local air traffic density: count number of moving vehicles within 65px radius
      const activeCloseVehicles = movingVehicles.filter((v) => {
        const dx = v.currX - spot.x;
        const dy = v.currY - spot.y;
        return Math.sqrt(dx * dx + dy * dy) < 65;
      });
      const vehicleCount = activeCloseVehicles.length;

      // Dynamic density coefficient scaling with active fleet size and nearby crafts
      const densityCoefficient = 0.5 + (vehicleCount * 0.35);

      // Compute raw dynamic accident probability index
      const rawProb = spot.baseRisk * densityCoefficient * weatherMult * laneMult;

      // Bound between 0.8% and 98.4%
      const accidentProbability = Math.min(99.2, Math.max(0.8, Math.round(rawProb * 10) / 10));

      // Classify safety tiers and status indicators
      let tierColor = "#10b981"; // Low (cool emerald)
      let alertIconClass = "text-emerald-400";
      let textClass = "text-emerald-300";
      let borderBgClass = "bg-emerald-500/10 border-emerald-500/20 text-emerald-400";
      let riskGradId = `heatmap-grad-low-${spot.id}`;
      let riskLabel = "Optimal Safe Margin";

      if (accidentProbability >= 75) {
        tierColor = "#f43f5e"; // Critical (rose red)
        alertIconClass = "text-rose-400 animate-pulse";
        textClass = "text-rose-300 font-bold";
        borderBgClass = "bg-rose-500/10 border-rose-500/30 text-rose-400";
        riskGradId = `heatmap-grad-critical-${spot.id}`;
        riskLabel = "Severe Collision Threat";
      } else if (accidentProbability >= 45) {
        tierColor = "#f97316"; // Elevated (orange warning)
        alertIconClass = "text-orange-400";
        textClass = "text-orange-300 font-semibold";
        borderBgClass = "bg-orange-500/10 border-orange-500/20 text-orange-400";
        riskGradId = `heatmap-grad-elevated-${spot.id}`;
        riskLabel = "Elevated Traffic Pressure";
      } else if (accidentProbability >= 15) {
        tierColor = "#eab308"; // Caution (yellow)
        alertIconClass = "text-yellow-400";
        textClass = "text-yellow-300";
        borderBgClass = "bg-yellow-500/10 border-yellow-500/20 text-yellow-300";
        riskGradId = `heatmap-grad-caution-${spot.id}`;
        riskLabel = "Cautionary Vectoring";
      }

      // Heat signature glow diameter maps to both incident rating and actual craft counts
      const heatRadius = 35 + (vehicleCount * 6.5) + (weatherSeverity * 4);

      return {
        ...spot,
        vehicleCount,
        accidentProbability,
        tierColor,
        alertIconClass,
        textClass,
        borderBgClass,
        riskGradId,
        riskLabel,
        heatRadius,
      };
    });
  }, [movingVehicles, weatherSeverity, airspaceLaneConfig]);

  // --- Real-time Weather Aggregations and Demands Correlation Data sets ---
  const weatherCorrelations = [
    { severity: "Clear (L1)", rainfall: 0, delayedRatio: 1.5, demandSurgePct: 0, incidentProbability: 0.01 },
    { severity: "Coastal Fog (L2)", rainfall: 2, delayedRatio: 8.2, demandSurgePct: 15, incidentProbability: 0.05 },
    { severity: "Monsoon (L3)", rainfall: 14, delayedRatio: 26.0, demandSurgePct: 52, incidentProbability: 0.18 },
    { severity: "Thunderstorm (L4)", rainfall: 42, delayedRatio: 58.4, demandSurgePct: 98, incidentProbability: 0.54 },
    { severity: "Cyclone (L5)", rainfall: 88, delayedRatio: 92.1, demandSurgePct: 145, incidentProbability: 2.10 }
  ];

  // Rainfall floods ground lanes, boosting Air Grid commutes
  const urbanVulnerabilityCorrelation = [
    { name: "Sunny 0mm", groundFloodingCm: 0, surfaceCommuteMins: 22, skyCommuteMins: 8 },
    { name: "Mist 2mm", groundFloodingCm: 1.2, surfaceCommuteMins: 38, skyCommuteMins: 9 },
    { name: "Monsoon 14mm", groundFloodingCm: 18, surfaceCommuteMins: 95, skyCommuteMins: 11 },
    { name: "Severe 42mm", groundFloodingCm: 50, surfaceCommuteMins: 240, skyCommuteMins: 16 },
    { name: "Cyclone 88mm", groundFloodingCm: 120, surfaceCommuteMins: 600, skyCommuteMins: 24 }
  ];

  const simulationFlightFractions = [
    { name: "Colaba sector", baseline: 240, simulated: Math.round(240 * (fleetSize / 1500) * (selectedSector === "All Sectors" || selectedSector === "Colaba sector" ? 1.0 : 0.1)) },
    { name: "Bandra BKC core", baseline: 580, simulated: Math.round(585 * (fleetSize / 1500) * (selectedSector === "All Sectors" || selectedSector === "Bandra BKC core" ? 1.05 : 0.1)) },
    { name: "Juhu corridor", baseline: 320, simulated: Math.round(310 * (fleetSize / 1500) * (selectedSector === "All Sectors" || selectedSector === "Juhu corridor" ? 0.95 : 0.1)) },
    { name: "Thane regional", baseline: 280, simulated: Math.round(280 * (fleetSize / 1500) * (selectedSector === "All Sectors" || selectedSector === "Thane regional" ? 1.0 : 0.1)) }
  ];

  // Seed initial moving taxis based on active flights
  useEffect(() => {
    const list: MovingVehicle[] = [];
    flights.forEach((f, idx) => {
      const srcGeo = HUBS_GEO[f.originHub];
      const dstGeo = HUBS_GEO[f.destinationHub];
      if (srcGeo && dstGeo) {
        list.push({
          id: f.flightID,
          vehicleID: f.vehicleID,
          sourceHubName: f.originHub,
          targetHubName: f.destinationHub,
          srcX: srcGeo.x,
          srcY: srcGeo.y,
          dstX: dstGeo.x,
          dstY: dstGeo.y,
          currX: srcGeo.x,
          currY: srcGeo.y,
          progress: Math.random(), // randomize starting spots
          speed: 0.003 + Math.random() * 0.004,
          altitude: f.averageAltitude,
          battery: Math.round(55 + Math.random() * 45),
        });
      }
    });
    setMovingVehicles(list);
  }, [flights]);

  // Animation ticks ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setMovingVehicles((prev) => 
        prev.map((v) => {
          let nextProgress = v.progress + v.speed * (1.2 - (weatherSeverity * 0.15)); // slower speed in bad weather
          let batteryDecline = v.battery;
          
          if (nextProgress >= 1) {
            // Repath to a new destination hub target
            nextProgress = 0;
            const keys = Object.keys(HUBS_GEO);
            const currentHub = v.targetHubName;
            let nextHub = keys[Math.floor(Math.random() * keys.length)];
            while (nextHub === currentHub) {
              nextHub = keys[Math.floor(Math.random() * keys.length)];
            }
            
            const srcG = HUBS_GEO[currentHub];
            const dstG = HUBS_GEO[nextHub];
            batteryDecline = Math.round(85 + Math.random() * 15); // Recharged!
            
            return {
              ...v,
              sourceHubName: currentHub,
              targetHubName: nextHub,
              srcX: srcG.x,
              srcY: srcG.y,
              dstX: dstG.x,
              dstY: dstG.y,
              currX: srcG.x,
              currY: srcG.y,
              progress: 0,
              battery: batteryDecline,
            };
          }

          // Move along vector
          const currX = v.srcX + (v.dstX - v.srcX) * nextProgress;
          const currY = v.srcY + (v.dstY - v.srcY) * nextProgress;

          // Slowly deplete battery
          if (Math.random() > 0.9) {
            batteryDecline = Math.max(v.battery - 1, 12);
          }

          return {
            ...v,
            progress: nextProgress,
            currX,
            currY,
            battery: batteryDecline,
          };
        })
      );
    }, 45);

    return () => clearInterval(interval);
  }, [weatherSeverity]);

  // Reset parameters helper
  const handleResetSim = () => {
    setFleetSize(1500);
    setPassengerDemandBoost(20);
    setAirspaceLaneConfig("Sectorized Mesh");
    setWeatherSeverity(3);
    setSelectedSector("All Sectors");
    setSelectedNode(null);
    setSelectedTaxi(null);
    setLayerLiveTraffic(true);
    setLayerSmartCity(true);
    setLayerPredictive(false);
    setPredictionTimeframe("30m");
    setLayerRiskHeatmap(true);
  };

  return (
    <div className="space-y-6 text-white">
      <style>{`
        @keyframes fall {
          0% { transform: translateY(-20px) rotate(15deg); opacity: 0; }
          50% { opacity: 0.6; }
          100% { transform: translateY(550px) rotate(15deg); opacity: 0; }
        }
        @keyframes swirls {
          0% { transform: rotate(0deg); opacity: 0.1; }
          50% { opacity: 0.4; }
          100% { transform: rotate(360deg); opacity: 0.1; }
        }
        .animate-fall {
          animation-name: fall;
          animation-timing-function: linear;
        }
        .animate-swirls {
          animation-name: swirls;
          animation-timing-function: linear;
        }

        /* Power BI styling theme aesthetics */
        .pbi-report-bg {
          background-color: #0d1117;
          border: 1px solid #1f2937;
        }
        .pbi-grid-border {
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .pbi-accent-yellow {
          color: #f2c811;
        }
        .pbi-accent-blue {
          color: #118d95;
        }
      `}</style>

      {/* Dynamic Alert Banner based on current parameters */}
      <div className="z-10">
        {weatherSeverity >= 4 ? (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl text-xs flex items-center justify-between gap-3 animate-pulse">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4.5 h-4.5 text-rose-400 shrink-0" />
              <span>
                <strong>CRITICAL WEATHER DISRUPTION:</strong> Severe storm metrics triggered. Autopilot mandatory. Ceiling altitudes restricted to {weatherSeverity === 5 ? "100m" : "150m"} across Mumbai airways. Expect wait time degradation.
              </span>
            </div>
            <button 
              onClick={() => setWeatherSeverity(1)}
              className="text-[10px] uppercase font-mono px-2 py-0.5 bg-rose-500/20 border border-rose-500/30 text-rose-300 rounded hover:bg-rose-500/30 transition shrink-0"
            >
              Clear Strom
            </button>
          </div>
        ) : weatherSeverity === 3 ? (
          <div className="p-3 bg-amber-500/10 border border-amber-500/25 text-amber-300 rounded-xl text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <CloudRain className="w-4.5 h-4.5 text-amber-400 shrink-0" />
              <span>
                <strong>MONSOON TRAVEL WARPING:</strong> Ground transport flooding peaks at {currentClimate.precipitation}mm/hr. Air-taxi passenger demand spiked by {passengerDemandBoost}%. High performance corridor alerts active.
              </span>
            </div>
            <button 
              onClick={() => setWeatherSeverity(1)}
              className="text-[10px] uppercase font-mono px-2 py-0.5 bg-amber-500/20 border border-amber-500/30 text-amber-300 rounded hover:bg-amber-500/30 transition shrink-0"
            >
              Clear skies
            </button>
          </div>
        ) : (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
            <Sun className="w-4.5 h-4.5 text-emerald-400 shrink-0" />
            <span>
              <strong>WEATHER OPERATIONS NORMALIZED:</strong> Fair conditions at {currentClimate.windSpeed} knots. Visibility clear at {currentClimate.visibility}m. Flight corridor optimization algorithms yielding 99.8% safety score bounds.
            </span>
          </div>
        )}
      </div>

      {/* Intro Box & Tabs Header */}
      <div className="p-5 rounded-2xl glass-panel relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-cyan-400 font-mono tracking-wider uppercase">
            <Globe className="w-3.5 h-3.5" />
            MUMBAI AIRSPACE SPATIAL DATA INTEGRATION
          </div>
          <h2 className="text-xl font-display font-semibold text-white tracking-tight">Digital Twin Space & Power BI Sandbox</h2>
          <p className="text-xs text-white/60">
            Real-time weather feed correlations and dynamic operational "what-if" planning sandbox of Mumbai's VTOL network.
          </p>
        </div>

        {/* Navigation Tabs (Map vs Power BI Report) */}
        <div className="flex gap-1.5 p-1 bg-slate-900 rounded-lg border border-slate-800 self-stretch md:self-auto">
          <button
            onClick={() => setCurrentViewTab("map")}
            className={`flex-1 md:flex-none text-xs px-3.5 py-1.5 rounded font-mono transition font-bold uppercase flex items-center justify-center gap-2 cursor-pointer ${
              currentViewTab === "map" 
                ? "bg-slate-800 text-[#22d3ee] border border-[#22d3ee]/20" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            Live Digital Twin Map
          </button>
          <button
            onClick={() => setCurrentViewTab("powerbi")}
            className={`flex-1 md:flex-none text-xs px-3.5 py-1.5 rounded font-mono transition font-bold uppercase flex items-center justify-center gap-2 cursor-pointer ${
              currentViewTab === "powerbi" 
                ? "bg-slate-800 text-[#22d3ee] border border-[#22d3ee]/20" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            Embedded Power BI Reports
          </button>
        </div>
      </div>

      {/* Main Container Grid: Left What-If parameters / Right Sandbox Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Side: What-If simulation parameters controller (Always Visible to allow instant reactivity in both screens) */}
        <div className="lg:col-span-1 glass-panel p-5 rounded-3xl bg-white/5 border border-white/10 flex flex-col justify-between space-y-6">
          <div className="space-y-5">
            
            {/* Header */}
            <div className="pb-3 border-b border-white/10">
              <h3 className="font-display font-bold text-xs text-cyan-400 tracking-wider uppercase flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5" />
                What-If Planner
              </h3>
              <p className="text-[10px] text-white/40 mt-1 uppercase font-mono">Simulate airspace scenarios</p>
            </div>

            {/* Parameter 1: Fleet Size */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-white/60">Simulated Fleet Size</span>
                <span className="text-cyan-400 font-bold">{fleetSize} units</span>
              </div>
              <input
                id="fleet-size-slider"
                type="range"
                min="500"
                max="5000"
                step="100"
                value={fleetSize}
                onChange={(e) => setFleetSize(parseInt(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <div className="flex justify-between text-[8px] text-white/40 font-mono">
                <span>500 (Off-peak)</span>
                <span>5k (Max Capacity)</span>
              </div>
            </div>

            {/* Parameter 2: Dynamic Passenger Demand Boost */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-white/60">Passenger Demand Surge</span>
                <span className="text-emerald-400 font-bold">+{passengerDemandBoost}%</span>
              </div>
              <input
                id="demand-boost-slider"
                type="range"
                min="0"
                max="150"
                step="5"
                value={passengerDemandBoost}
                onChange={(e) => setPassengerDemandBoost(parseInt(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <div className="flex justify-between text-[8px] text-white/40 font-mono">
                <span>Standard</span>
                <span>+150% (Max Spillover)</span>
              </div>
            </div>

            {/* Parameter 3: Weather Overcast Storm Level */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-white/60">Weather severity</span>
                <span className="text-cyan-400 font-bold">Level {weatherSeverity} / 5</span>
              </div>
              <input
                id="weather-severity-slider"
                type="range"
                min="1"
                max="5"
                step="1"
                value={weatherSeverity}
                onChange={(e) => setWeatherSeverity(parseInt(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <div className="flex justify-between text-[9px] font-mono select-none px-0.5">
                <span className={weatherSeverity === 1 ? "text-emerald-400 font-bold" : "text-white/20"}>L1</span>
                <span className={weatherSeverity === 2 ? "text-cyan-400 font-bold" : "text-white/20"}>L2</span>
                <span className={weatherSeverity === 3 ? "text-amber-400 font-bold" : "text-white/20"}>L3</span>
                <span className={weatherSeverity === 4 ? "text-rose-400 font-bold" : "text-white/20"}>L4</span>
                <span className={weatherSeverity === 5 ? "text-rose-600 font-extrabold animate-pulse" : "text-white/20"}>L5</span>
              </div>
              <p className="text-[10px] text-white/40 leading-tight italic">
                Currently simulating: <span className="text-white/80">{currentClimate.name}</span> with wind speed of {currentClimate.windSpeed} knots.
              </p>
            </div>

            {/* Parameter 4: Air Lane Layout configurations */}
            <div className="space-y-2">
              <label className="text-xs text-white/60 font-mono uppercase block" htmlFor="air-lane-select">Air-Lane Topology</label>
              <select
                id="air-lane-select"
                value={airspaceLaneConfig}
                onChange={(e) => setAirspaceLaneConfig(e.target.value)}
                className="w-full bg-white/5 border border-white/10 text-xs rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
              >
                <option className="bg-[#05070a]" value="Traditional Hub-Spoke">Traditional Hub-Spoke</option>
                <option className="bg-[#05070a]" value="Sectorized Mesh">Sectorized Mesh Topology</option>
                <option className="bg-[#05070a]" value="High-Altitude Express">High-Altitude Express Lanes</option>
                <option className="bg-[#05070a]" value="Coastal Bypass Loop">Coastal Bypass Loop Channel</option>
              </select>
              <p className="text-[9px] text-white/40 leading-snug">
                {airspaceLaneConfig === "Traditional Hub-Spoke" && "Inefficient central loading prone to congestion bottlenecks."}
                {airspaceLaneConfig === "Sectorized Mesh" && "Balanced decentralized distribution vectors using real-time routing."}
                {airspaceLaneConfig === "High-Altitude Express" && "Rapid vector channels optimized for ultra-long regional commutes."}
                {airspaceLaneConfig === "Coastal Bypass Loop" && "Safe coastal bypass corridors avoiding downtown noise thresholds."}
              </p>
            </div>

          </div>

          <div className="pt-4 border-t border-white/10 space-y-2.5">
            <button
              id="reset-simulation-button"
              onClick={handleResetSim}
              className="w-full text-center text-xs bg-white/5 border border-white/10 hover:border-cyan-400 text-white/80 hover:text-white py-2 rounded-xl transition flex items-center justify-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset Parameters
            </button>
            <div className="flex items-center gap-2 justify-center text-[10px] text-white/40 font-mono">
              <Play className="w-3 h-3 fill-cyan-400 text-cyan-400" />
              SIMULATION KERNEL ACTIVE
            </div>
          </div>

        </div>

        {/* Right Side: Render content based on selected mode */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* TAB 1: LIVE 3D TWIN SPACE MAP */}
          {currentViewTab === "map" && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              
              {/* Maps simulation display Canvas */}
              <div ref={containerRef} className="xl:col-span-2 glass-panel p-0 rounded-3xl bg-white/5 border border-white/10 relative min-h-[500px] overflow-hidden flex flex-col justify-between">
                
                {/* Graphical Layers Control Bar */}
                <div className="p-3 bg-slate-950/80 border-b border-white/10 backdrop-blur flex flex-wrap items-center justify-between gap-3 z-25 relative">
                  <div className="flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="text-[10px] text-white/60 font-mono uppercase tracking-wider">Spatial Map Layers:</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setLayerLiveTraffic(!layerLiveTraffic)}
                      className={`px-2.5 py-1 rounded text-[10px] font-mono transition flex items-center gap-1 border ${
                        layerLiveTraffic 
                          ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/40 font-bold shadow-[0_0_8px_rgba(34,211,238,0.2)]" 
                          : "bg-white/5 text-white/40 border-transparent hover:text-white"
                      }`}
                    >
                      <Activity className="w-3 h-3" /> Traffic
                    </button>
                    <button
                      onClick={() => setLayerSmartCity(!layerSmartCity)}
                      className={`px-2.5 py-1 rounded text-[10px] font-mono transition flex items-center gap-1 border ${
                        layerSmartCity 
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/40 font-bold shadow-[0_0_8px_rgba(16,185,129,0.2)]" 
                          : "bg-white/5 text-white/40 border-transparent hover:text-white"
                      }`}
                    >
                      <Globe className="w-3 h-3" /> Smart City
                    </button>
                    <button
                      onClick={() => setLayerPredictive(!layerPredictive)}
                      className={`px-2.5 py-1 rounded text-[10px] font-mono transition flex items-center gap-1 border ${
                        layerPredictive 
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/40 font-bold shadow-[0_0_8px_rgba(245,158,11,0.2)]" 
                          : "bg-white/5 text-white/40 border-transparent hover:text-white"
                      }`}
                    >
                      <Sparkles className="w-3 h-3" /> Predictive AI
                    </button>

                    <button
                      onClick={() => setLayerRiskHeatmap(!layerRiskHeatmap)}
                      className={`px-2.5 py-1 rounded text-[10px] font-mono transition flex items-center gap-1 border ${
                        layerRiskHeatmap 
                          ? "bg-rose-500/10 text-rose-400 border-rose-500/40 font-bold shadow-[0_0_8px_rgba(244,63,94,0.3)]" 
                          : "bg-white/5 text-white/40 border-transparent hover:text-white"
                      }`}
                    >
                      <AlertTriangle className="w-3 h-3" /> 🔥 Risk Heatmap
                    </button>

                    {layerPredictive && (
                      <div className="flex items-center gap-1 bg-slate-900 border border-amber-500/30 p-0.5 rounded text-[9px] ml-1">
                        <button
                          onClick={() => setPredictionTimeframe("30m")}
                          className={`px-1.5 py-0.5 rounded transition font-medium ${predictionTimeframe === "30m" ? "bg-amber-400 text-black font-bold" : "text-white/50 hover:text-white"}`}
                        >
                          30m
                        </button>
                        <button
                          onClick={() => setPredictionTimeframe("2h")}
                          className={`px-1.5 py-0.5 rounded transition font-medium ${predictionTimeframe === "2h" ? "bg-amber-400 text-black font-bold" : "text-white/50 hover:text-white"}`}
                        >
                          2h
                        </button>
                        <button
                          onClick={() => setPredictionTimeframe("24h")}
                          className={`px-1.5 py-0.5 rounded transition font-medium ${predictionTimeframe === "24h" ? "bg-amber-400 text-black font-bold" : "text-white/50 hover:text-white"}`}
                        >
                          24h
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="relative flex-grow flex flex-col justify-between p-4">

                {/* Weather overlay visual markers */}
                {weatherSeverity >= 2 && (
                  <div className="absolute inset-0 pointer-events-none bg-cyan-900/5 select-none z-10" />
                )}
                {/* Simulated clouds floating */}
                {weatherSeverity >= 2 && (
                  <div className="absolute top-10 left-5 w-40 h-10 bg-white/5 rounded-full blur-xl animate-pulse duration-1000 select-none z-10" />
                )}

                {/* Simulated Rain drops lines effect */}
                {weatherSeverity >= 3 && (
                  <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
                    {Array.from({ length: weatherSeverity * 15 }).map((_, rIdx) => (
                      <div
                        key={rIdx}
                        className="absolute w-[1px] h-[30px] bg-[#22d3ee]/35 animate-fall"
                        style={{
                          left: `${(rIdx * 7.7) % 100}%`,
                          top: `-${Math.random() * 40}px`,
                          animationDuration: `${0.4 + Math.random() * 0.3}s`,
                          animationDelay: `${Math.random() * 2}s`,
                          animationIterationCount: 'infinite',
                          transform: 'rotate(12deg)',
                          opacity: 0.3 + (weatherSeverity * 0.1),
                        }}
                      />
                    ))}
                  </div>
                )}

                {/* Swirling cyclone vortex centers if level 5 storm */}
                {weatherSeverity === 5 && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-20">
                    <div className="w-[450px] h-[450px] border border-dashed border-red-500/20 rounded-full animate-swirls" style={{ animationDuration: '4s' }} />
                    <div className="absolute w-[200px] h-[200px] border border-dashed border-cyan-400/10 rounded-full animate-swirls" style={{ animationDuration: '2s' }} />
                  </div>
                )}

                {/* Ambient background grid lines layout */}
                <div className="absolute inset-0 select-none opacity-25 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(34,211,238,0.1)_0%,rgba(5,7,10,0.95)_80%)]" />
                
                {/* Svg lines content */}
                <svg className="absolute inset-0 w-full h-full" style={{ minHeight: "460px" }}>
                  <defs>
                    <pattern id="twinGrid2" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="0.8" />
                    </pattern>
                    <filter id="heatmapBlur" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="15" />
                    </filter>
                    {riskHotspots.map((spot) => (
                      <radialGradient key={spot.riskGradId} id={spot.riskGradId} cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor={spot.tierColor} stopOpacity={0.65} />
                        <stop offset="45%" stopColor={spot.tierColor} stopOpacity={0.28} />
                        <stop offset="100%" stopColor={spot.tierColor} stopOpacity={0} />
                      </radialGradient>
                    ))}
                  </defs>
                  <rect width="100%" height="100%" fill="url(#twinGrid2)" />

                  {/* Simulated Coastal Outline of Western Mumbai */}
                  <path
                    d="M 120 480 Q 210 400 240 310 T 260 210 T 320 120 T 420 40"
                    fill="none"
                    stroke="rgba(34, 211, 238, 0.09)"
                    strokeWidth="12"
                    strokeLinecap="round"
                    className="pointer-events-none"
                  />
                  <path
                    d="M 120 480 Q 210 400 240 310 T 260 210 T 320 120 T 420 40"
                    fill="none"
                    stroke="#05070a"
                    strokeWidth="4"
                    strokeLinecap="round"
                    className="pointer-events-none"
                  />

                  {/* HIGH-RESOLUTION RISK HEATMAP OVERLAY */}
                  {layerRiskHeatmap && (
                    <g className="risk-heatmap-overlay pointer-events-none" filter="url(#heatmapBlur)">
                      {riskHotspots.map((spot) => (
                        <circle
                          key={`heat-circle-${spot.id}`}
                          cx={spot.x}
                          cy={spot.y}
                          r={spot.heatRadius}
                          fill={`url(#${spot.riskGradId})`}
                          className="transition-all duration-500 animate-pulse"
                          style={{ animationDuration: "4.5s" }}
                        />
                      ))}
                    </g>
                  )}

                  {/* RISK CORES & HOTSPOT LABELS/BOUNDS */}
                  {layerRiskHeatmap && (
                    <g className="risk-heat-cores">
                      {riskHotspots.map((spot) => (
                        <g key={`core-${spot.id}`}>
                          {/* Pulsing warning perimeter for hazardous zones */}
                          {spot.accidentProbability >= 45 && (
                            <circle
                              cx={spot.x}
                              cy={spot.y}
                              r="10"
                              fill="none"
                              stroke={spot.tierColor}
                              strokeWidth="1.2"
                              className="animate-ping pointer-events-none opacity-60"
                              style={{ animationDuration: spot.accidentProbability >= 75 ? "1.2s" : "2.2s" }}
                            />
                          )}
                          
                          {/* Center node core bullet */}
                          <circle
                            cx={spot.x}
                            cy={spot.y}
                            r="4.5"
                            fill={spot.tierColor}
                            stroke="#05070a"
                            strokeWidth="1.5"
                            opacity="0.95"
                            className="cursor-help"
                          />

                          {/* Light dashed outer safety outline bounding zone of probability */}
                          <circle
                            cx={spot.x}
                            cy={spot.y}
                            r={spot.heatRadius}
                            fill="transparent"
                            stroke={spot.tierColor}
                            strokeWidth="0.7"
                            strokeDasharray="2 3"
                            opacity="0.22"
                            className="pointer-events-none"
                          />
                        </g>
                      ))}
                    </g>
                  )}

                  {/* Showing Air corridors links */}
                  {showAirLanes && Object.entries(HUBS_GEO).map(([name, geo], idx) => {
                    const keys = Object.keys(HUBS_GEO);
                    const targetKey = keys[(idx + 2) % keys.length];
                    const tgtGeo = HUBS_GEO[targetKey];
                    return (
                      <line
                        key={idx}
                        x1={geo.x}
                        y1={geo.y}
                        x2={tgtGeo.x}
                        y2={tgtGeo.y}
                        stroke={weatherSeverity >= 4 ? "rgba(244, 63, 94, 0.2)" : "rgba(34, 211, 238, 0.15)"}
                        strokeWidth="1"
                        strokeDasharray="4 4"
                        className="pointer-events-none"
                      />
                    );
                  })}

                  {/* 2. SMART CITY LAYERS OVERLAY */}
                  {layerSmartCity && (
                    <g className="smart-city-overlays">
                      {/* Commercial Spine Zone */}
                      <rect 
                        x="230" y="210" width="180" height="150" rx="16" 
                        fill="rgba(34, 211, 238, 0.05)" 
                        stroke="rgba(34, 211, 238, 0.2)" 
                        strokeWidth="1" 
                        strokeDasharray="3 3" 
                        className="pointer-events-none animate-pulse"
                        style={{ animationDuration: "6s" }}
                      />
                      <text 
                        x="320" y="225" 
                        fill="rgba(34, 211, 238, 0.6)" 
                        fontSize="8px" 
                        fontFamily="JetBrains Mono" 
                        fontWeight="bold" 
                        textAnchor="middle" 
                        className="pointer-events-none uppercase"
                      >
                        BKC-Dadar Commercial Spine
                      </text>

                      {/* Juhu Residential Eco Zone */}
                      <circle 
                        cx="270" cy="180" r="45" 
                        fill="rgba(16, 185, 129, 0.04)" 
                        stroke="rgba(16, 185, 129, 0.2)" 
                        strokeWidth="1" 
                        strokeDasharray="3 3" 
                        className="pointer-events-none" 
                      />
                      <text 
                        x="270" y="145" 
                        fill="rgba(16, 185, 129, 0.6)" 
                        fontSize="8px" 
                        fontFamily="JetBrains Mono" 
                        fontWeight="bold" 
                        textAnchor="middle" 
                        className="pointer-events-none uppercase"
                      >
                        Juhu Eco-Buffer Area
                      </text>

                      {/* Kurla VTOL Heavy Cargo zone */}
                      <rect 
                        x="360" y="240" width="100" height="90" rx="12" 
                        fill="rgba(245, 158, 11, 0.04)" 
                        stroke="rgba(245, 158, 11, 0.2)" 
                        strokeWidth="1" 
                        strokeDasharray="3 3" 
                        className="pointer-events-none" 
                      />
                      <text 
                        x="410" y="320" 
                        fill="rgba(245, 158, 11, 0.6)" 
                        fontSize="8px" 
                        fontFamily="JetBrains Mono" 
                        fontWeight="bold" 
                        textAnchor="middle" 
                        className="pointer-events-none uppercase"
                      >
                        Kurla Logistics VTOL Core
                      </text>

                      {/* Weather offshore storm cell */}
                      {weatherSeverity >= 3 && (
                        <g>
                          <circle 
                            cx="140" cy="460" r="90" 
                            fill="rgba(239, 68, 68, 0.03)" 
                            stroke="rgba(239, 68, 68, 0.15)" 
                            strokeWidth="1" 
                            className="pointer-events-none" 
                          />
                          <text 
                            x="140" y="385" 
                            fill="rgba(239, 68, 68, 0.5)" 
                            fontSize="8px" 
                            fontFamily="JetBrains Mono" 
                            fontWeight="bold" 
                            textAnchor="middle" 
                            className="pointer-events-none uppercase"
                          >
                            Turbulence Cell
                          </text>
                        </g>
                      )}
                    </g>
                  )}

                  {/* 3. PREDICTIVE AI LAYERS OVERLAY */}
                  {layerPredictive && (
                    <g className="predictive-overlays">
                      {predictionTimeframe === "30m" && (
                        <g>
                          {/* Pulsing Dadar queue alert */}
                          <circle 
                            cx={HUBS_GEO.Dadar.x} cy={HUBS_GEO.Dadar.y} r="25" 
                            fill="none" 
                            stroke="#f59e0b" 
                            strokeWidth="1.5" 
                            strokeDasharray="3 3" 
                            className="pointer-events-none animate-ping" 
                            style={{ animationDuration: "2s" }}
                          />
                          <text 
                            x={HUBS_GEO.Dadar.x} y={HUBS_GEO.Dadar.y + 22} 
                            fill="#f59e0b" 
                            fontSize="7px" 
                            fontFamily="JetBrains Mono" 
                            fontWeight="bold" 
                            textAnchor="middle" 
                            className="pointer-events-none"
                          >
                            30M CAP FORECAST: 94%
                          </text>
                          {/* Dynamic proposed alternative router bypass arrow */}
                          <path 
                            d="M 310 250 Q 220 230 270 190" 
                            fill="none" 
                            stroke="#f59e0b" 
                            strokeWidth="1.5" 
                            strokeDasharray="4 3" 
                            className="pointer-events-none" 
                          />
                          <polygon 
                            points="270,190 264,195 272,197" 
                            fill="#f59e0b" 
                            className="pointer-events-none" 
                          />
                          <text 
                            x="225" y="248" 
                            fill="#eab308" 
                            fontSize="7px" 
                            fontFamily="JetBrains Mono" 
                            className="pointer-events-none font-bold"
                          >
                            AI ALTERNATIVE PATHING
                          </text>
                        </g>
                      )}

                      {predictionTimeframe === "2h" && (
                        <g>
                          {/* Pulsing Bandra critical alert */}
                          <circle 
                            cx={HUBS_GEO.Bandra.x} cy={HUBS_GEO.Bandra.y} r="30" 
                            fill="none" 
                            stroke="#f43f5e" 
                            strokeWidth="1.5" 
                            strokeDasharray="3 3" 
                            className="pointer-events-none animate-ping" 
                            style={{ animationDuration: "1.5s" }}
                          />
                          <text 
                            x={HUBS_GEO.Bandra.x} y={HUBS_GEO.Bandra.y - 20} 
                            fill="#f43f5e" 
                            fontSize="7px" 
                            fontFamily="JetBrains Mono" 
                            fontWeight="bold" 
                            textAnchor="middle" 
                            className="pointer-events-none"
                          >
                            2H OVERLOAD PREDICTED: 148%
                          </text>
                        </g>
                      )}

                      {predictionTimeframe === "24h" && (
                        <g>
                          {/* Eastern corridor closure indicator */}
                          <line 
                            x1={HUBS_GEO.Thane.x} y1={HUBS_GEO.Thane.y} 
                            x2={HUBS_GEO.Kurla.x} y2={HUBS_GEO.Kurla.y} 
                            stroke="#ef4444" 
                            strokeWidth="2" 
                            strokeDasharray="3 4" 
                            className="pointer-events-none animate-pulse" 
                          />
                          <text 
                            x="425" y="150" 
                            fill="#f43f5e" 
                            fontSize="7.5px" 
                            fontFamily="JetBrains Mono" 
                            fontWeight="bold" 
                            className="pointer-events-none uppercase text-shadow"
                          >
                            24H CLOSURE: WIND SHEAR (EST)
                          </text>
                        </g>
                      )}
                    </g>
                  )}

                  {/* Dynamic Weather direction gusts visual elements */}
                  {weatherSeverity >= 3 && (
                    <g opacity="0.3" className="pointer-events-none">
                      <line x1="50" y1="80" x2="110" y2="90" stroke="#22d3ee" strokeWidth="1.5" strokeDasharray="5 5" />
                      <line x1="150" y1="280" x2="210" y2="290" stroke="#22d3ee" strokeWidth="1" strokeDasharray="5 5" />
                      <line x1="320" y1="420" x2="380" y2="430" stroke="#22d3ee" strokeWidth="1.5" strokeDasharray="5 5" />
                    </g>
                  )}

                  {/* 1. RENDER LIVE AIR TRAFFIC ELEMENT PATH VECTORS */}
                  {layerLiveTraffic && selectedTaxi && (
                    <g className="live-vector-path pointer-events-none">
                      <line 
                        x1={selectedTaxi.currX} 
                        y1={selectedTaxi.currY} 
                        x2={selectedTaxi.dstX} 
                        y2={selectedTaxi.dstY} 
                        stroke="#22d3ee" 
                        strokeWidth="1.5" 
                        strokeDasharray="3 3" 
                        className="animate-pulse"
                      />
                      <circle 
                        cx={selectedTaxi.dstX} 
                        cy={selectedTaxi.dstY} 
                        r="4" 
                        fill="none" 
                        stroke="#22d3ee" 
                        strokeWidth="1" 
                        className="animate-ping"
                      />
                    </g>
                  )}

                  {/* Render simulated airborne vehicles triangles */}
                  {layerLiveTraffic && movingVehicles.map((taxi) => (
                    <g 
                      key={taxi.id} 
                      className="cursor-pointer group"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTaxi(taxi);
                        setSelectedNode(null);
                      }}
                    >
                      {/* Active click circle selector radar */}
                      <circle
                        cx={taxi.currX}
                        cy={taxi.currY}
                        r={9}
                        fill={selectedTaxi?.id === taxi.id ? "rgba(34, 211, 238, 0.35)" : "transparent"}
                        className="hover:fill-cyan-400/20 transition duration-150"
                      />
                      
                      {/* Flight triangle vector */}
                      <polygon
                        points={`${taxi.currX},${taxi.currY - 5} ${taxi.currX - 4},${taxi.currY + 4} ${taxi.currX + 4},${taxi.currY + 4}`}
                        fill={taxi.battery < 30 ? "#f43f5e" : selectedTaxi?.id === taxi.id ? "#22d3ee" : "#0e7490"}
                        className="transition duration-150"
                      />

                      {/* Diagnostic tags */}
                      <text
                        x={taxi.currX + 8}
                        y={taxi.currY + 3}
                        fill="#22d3ee"
                        fontSize={8}
                        fontFamily="JetBrains Mono"
                        className="pointer-events-none opacity-0 group-hover:opacity-100 transition duration-150 drop-shadow-lg"
                      >
                        {taxi.vehicleID}
                      </text>
                    </g>
                  ))}

                  {/* Active charging hubs nodes */}
                  {Object.entries(HUBS_GEO).map(([nodeName, geo]) => {
                    const isCongested = (passengerDemandBoost >= 60 && (nodeName === "Bandra" || nodeName === "Dadar"));
                    return (
                      <g
                        key={nodeName}
                        className="cursor-pointer"
                        onClick={() => {
                          setSelectedNode(nodeName);
                          setSelectedTaxi(null);
                        }}
                      >
                        {/* Radar pulse around hub */}
                        <circle
                          cx={geo.x}
                          cy={geo.y}
                          r={isCongested ? 18 : 12}
                          className="animate-ping"
                          fill={isCongested ? "rgba(239, 68, 68, 0.05)" : "rgba(34, 211, 238, 0.04)"}
                          style={{ animationDuration: isCongested ? "1.8s" : "3.5s" }}
                        />
                        <circle
                          cx={geo.x}
                          cy={geo.y}
                          r={6}
                          fill={selectedNode === nodeName ? "#22d3ee" : isCongested ? "#ef4444" : "#10b981"}
                          stroke="#05070a"
                          strokeWidth={1.5}
                        />
                        <text
                          x={geo.x}
                          y={geo.y - 10}
                          fill="#f1f5f9"
                          fontFamily="Space Grotesk"
                          fontSize={9.5}
                          fontWeight="bold"
                          textAnchor="middle"
                          className="pointer-events-none drop-shadow-md select-none text-shadow-sm"
                        >
                          {nodeName}
                        </text>
                      </g>
                    );
                  })}
                </svg>

                {/* Legend bar overlays */}
                <div className="z-10 bg-[#05070a]/90 border border-white/10 p-3 rounded-2xl flex flex-wrap justify-between items-center text-[10px] font-mono select-none m-3 gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                    <span className="text-white/60">Hub Operational</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shrink-0" />
                    <span className="text-white/60">Monsoon Congested</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[8px] border-b-cyan-400 shrink-0" />
                    <span className="text-white/40">Air-Taxi Fleet Vector</span>
                  </div>
                  <div className="text-cyan-400 font-bold uppercase tracking-wider">
                    CLICK MAP ENTITIES TO INSPECT
                  </div>
                </div>

              </div>
            </div>

              {/* Sidebar: Interactive telemetry streams inspector */}
              <div className="space-y-6">
                
                {/* Telemetry output inspector */}
                {selectedNode ? (
                  <div className="glass-panel p-5 rounded-2xl space-y-4 relative border-cyan-500/20 glow-border-cyan animate-fade-in">
                    <div className="space-y-1">
                      <p className="text-[9px] text-cyan-400 font-mono uppercase tracking-wider">Sky-Hub Telemetry node</p>
                      <h3 className="font-display font-bold text-lg text-white">{selectedNode} Transit Center</h3>
                    </div>
                    <p className="text-xs text-white/60 leading-relaxed italic border-l-2 border-emerald-500 pl-2">
                      "{HUBS_GEO[selectedNode].description}"
                    </p>

                    <div className="space-y-3 pt-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-white/40">Node Status Code:</span>
                        <span className="text-emerald-400 font-mono font-bold">GRID_STABLE_ALIGNED</span>
                      </div>

                      <div className="flex justify-between items-center text-xs">
                        <span className="text-white/40">Monsoon Corrupted:</span>
                        <span className="text-white font-mono font-medium">{weatherSeverity >= 4 ? "HEAVY CORRUPT" : "NONE"}</span>
                      </div>

                      <div className="flex justify-between items-center text-xs">
                        <span className="text-white/40">Charging slots:</span>
                        <span className="font-mono text-white">4 / 4 operational</span>
                      </div>

                      <div className="flex justify-between items-center text-xs">
                        <span className="text-white/40">SLA Flight delays:</span>
                        <span className="text-amber-400 font-mono font-medium">+{simResult.waitTime} mins</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedNode(null)}
                      className="w-full text-center text-xs bg-white/5 border border-white/10 hover:border-cyan-400 text-white py-1.5 rounded-xl transition"
                    >
                      Close Inspector
                    </button>
                  </div>
                ) : selectedTaxi ? (
                  /* Taxi Stream */
                  <div className="glass-panel p-5 rounded-2xl space-y-4 relative border-cyan-500/20 glow-border-cyan">
                    <div className="space-y-1">
                      <p className="text-[9px] text-cyan-400 font-mono uppercase tracking-wider">Airborne VTOL telemetry stream</p>
                      <h3 className="font-display font-bold text-lg text-white">{selectedTaxi.vehicleID}</h3>
                      <p className="text-[10px] text-white/40 font-mono">FLIGHT-TRAC: {selectedTaxi.id}</p>
                    </div>

                    <div className="space-y-3.5 bg-white/5 p-4 rounded-xl border border-white/10 text-xs">
                      
                      <div className="flex justify-between items-center">
                        <span className="text-white/40">Vector Path:</span>
                        <span className="text-white font-semibold">{selectedTaxi.sourceHubName} ⇄ {selectedTaxi.targetHubName}</span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-white/40 font-mono">
                          <span>Route velocity stream</span>
                          <span>{Math.round(selectedTaxi.progress * 100)}%</span>
                        </div>
                        <div className="w-full bg-black/60 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-cyan-400 h-full transition-all duration-150" style={{ width: `${selectedTaxi.progress * 100}%` }} />
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-white/40">Altitude Vector:</span>
                        <span className="font-mono text-white font-semibold">{selectedTaxi.altitude}m</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-white/40">Dynamic Battery remaining:</span>
                        <span className={`font-mono font-bold ${selectedTaxi.battery < 30 ? "text-rose-500" : "text-emerald-400"}`}>
                          {selectedTaxi.battery}% {selectedTaxi.battery < 30 ? "WARNING" : "STABLE"}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-white/40">Guidance Core:</span>
                        <span className="bg-cyan-500/10 text-cyan-400 font-mono text-[9px] px-1.5 py-0.5 rounded border border-cyan-500/30">AI AUTOPILOT (MUTED)</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedTaxi(null)}
                      className="w-full text-center text-xs bg-white/5 border border-white/10 hover:border-cyan-400 text-white py-1.5 rounded-xl transition"
                    >
                      Close Telemetry stream
                    </button>
                  </div>
                ) : (
                  /* Idle Inspector info */
                  <div className="glass-panel p-5 rounded-2xl space-y-3 text-xs bg-white/5 border border-white/10">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-cyan-400 shrink-0" />
                      <div className="space-y-1.5">
                        <h4 className="font-semibold text-white">Click map indicators to inspect</h4>
                        <p className="text-white/60 leading-relaxed">
                          Click on any active sky-hub node marker pulsing green/red (e.g., Dadar, Colaba) or airborne vector triangle on the Mumbai terrain map layout to download live telemetry indices.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Dynamic Risk Heatmap Statistics Inspector */}
                {layerRiskHeatmap && (
                  <div className="glass-panel p-5 rounded-2xl space-y-4 bg-white/5 border border-white/10 text-xs">
                    <div className="flex justify-between items-center border-b border-white/10 pb-2">
                      <h4 className="font-display font-bold uppercase tracking-wider text-rose-450 text-[10px] font-mono flex items-center gap-1.5 text-rose-400">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                        AI Accident Probability
                      </h4>
                      <span className="font-mono text-[8px] text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/30 animate-pulse">
                        HEATMAP ACTIVE
                      </span>
                    </div>

                    <div className="space-y-3 font-sans">
                      <p className="text-white/60 text-[11px] leading-relaxed">
                        Risk modeling index dynamically correlates local wind shears (<strong className="text-cyan-400 font-semibold">{currentClimate.windSpeed} knots</strong>), channel configurations, and real-time aircraft cluster density.
                      </p>

                      <div className="space-y-2.5 pt-1">
                        {riskHotspots.map((spot) => {
                          let pctBarColor = "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]";
                          if (spot.accidentProbability >= 75) {
                            pctBarColor = "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.55)]";
                          } else if (spot.accidentProbability >= 45) {
                            pctBarColor = "bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]";
                          } else if (spot.accidentProbability >= 15) {
                            pctBarColor = "bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]";
                          }

                          return (
                            <div key={`side-spot-${spot.id}`} className="p-2 bg-black/25 rounded-xl border border-white/5 space-y-1 hover:border-white/15 transition-all duration-150">
                              <div className="flex justify-between items-center text-[10.5px]">
                                <span className="font-medium text-white/80">{spot.name}</span>
                                <span className="font-mono font-semibold text-cyan-400 bg-cyan-950/30 px-1.5 py-0.2 rounded text-[8px] border border-cyan-500/10">
                                  {spot.vehicleCount} craft{spot.vehicleCount !== 1 ? 's' : ''} close
                                </span>
                              </div>
                              <div className="flex justify-between items-center text-[9px] text-white/40 pb-0.5">
                                <span className={`text-[8.5px] uppercase tracking-wider font-mono ${spot.accidentProbability >= 45 ? 'text-amber-500' : 'text-slate-400'}`}>{spot.riskLabel}</span>
                                <span className={`font-mono font-bold ${spot.accidentProbability >= 75 ? 'text-rose-400' : spot.accidentProbability >= 45 ? 'text-orange-400' : 'text-emerald-400'}`}>
                                  {spot.accidentProbability}%
                                </span>
                              </div>
                              <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                                <div className={`h-full transition-all duration-300 ${pctBarColor}`} style={{ width: `${spot.accidentProbability}%` }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="p-2.5 bg-rose-950/20 border border-rose-500/20 text-rose-300 rounded-xl text-[9.5px] leading-normal flex items-start gap-1.5">
                        <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                        <span>
                          <strong>SEPARATION SECURITY OVERIDE:</strong> Standard guidance coordinates are dynamically re-routed around sectors exceeding 45% calculated accident probability.
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Live Real-time Climate telemetry stats bar */}
                <div className="glass-panel p-5 rounded-2xl space-y-4 bg-white/5 border border-white/10 text-xs">
                  <div className="flex justify-between items-center border-b border-white/10 pb-2">
                    <h4 className="font-display font-bold uppercase tracking-wider text-cyan-400 text-[10px] font-mono flex items-center gap-1.5">
                      <CloudRain className="w-3.5 h-3.5" />
                      Weather Feed Integration
                    </h4>
                    <span className="font-mono text-[9px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/30">
                      LIVE FEED
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5 font-mono text-[11px]">
                    <div className="space-y-0.5 p-2 bg-black/30 rounded-lg">
                      <span className="text-white/40 block text-[9px] uppercase">Precipitation</span>
                      <span className="text-white font-bold">{currentClimate.precipitation} mm/hr</span>
                    </div>
                    <div className="space-y-0.5 p-2 bg-black/30 rounded-lg">
                      <span className="text-white/40 block text-[9px] uppercase">Wind Velocity</span>
                      <span className="text-white font-bold">{currentClimate.windSpeed} knots</span>
                    </div>
                    <div className="space-y-0.5 p-2 bg-black/30 rounded-lg">
                      <span className="text-white/40 block text-[9px] uppercase">Spatial Visibility</span>
                      <span className="text-white font-bold">{currentClimate.visibility}m</span>
                    </div>
                    <div className="space-y-0.5 p-2 bg-black/30 rounded-lg">
                      <span className="text-white/40 block text-[9px] uppercase">Airspace State</span>
                      <span className="text-cyan-400 font-bold truncate text-[10px]">{currentClimate.hoverTerm}</span>
                    </div>
                  </div>
                </div>

                {/* Quick Simulation Info bar */}
                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-2 text-xs">
                  <h4 className="font-bold text-white uppercase text-[10px] tracking-wider flex items-center gap-1">
                    <Database className="w-3.5 h-3.5 text-cyan-400" />
                    Modeling Scale Indicators
                  </h4>
                  <p className="text-white/60 leading-normal font-sans text-[11px]">
                    Mathematical twin engine currently tracing <strong className="text-white">{fleetSize} virtual vehicles</strong>, analyzing commuter demand surges of up to <strong className="text-emerald-400 font-semibold">+{passengerDemandBoost}%</strong>, and outputting calculated delay limits.
                  </p>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: POWER BI EMBEDDED DASHBOARD COCKPIT */}
          {currentViewTab === "powerbi" && (
            <div className="pbi-report-bg rounded-3xl p-5 border border-white/10 space-y-6 relative overflow-hidden">
              
              {/* Power BI Title Banner bar */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white/5 p-4 rounded-2xl border border-white/10 gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#f2c811] text-black font-extrabold rounded-lg flex items-center justify-center text-sm shadow-[0_0_15px_rgba(242,200,17,0.3)]">
                    PBI
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-sm text-white tracking-tight flex items-center gap-2">
                      Power BI SkyGrid Custom Report Canvas
                      <span className="font-mono text-[9px] bg-cyan-400/10 text-cyan-400 px-1.5 py-0.5 rounded border border-cyan-400/25">
                        DESKTOP COCKPIT
                      </span>
                    </h3>
                    <p className="text-[10px] text-white/40 font-mono">WORKSPACE: MUMBAI-TRANSIT-2045 | UNDERLYING SEMANTIC MODEL STATS</p>
                  </div>
                </div>

                {/* Power BI tool actions mock buttons */}
                <div className="flex items-center gap-1.5 text-white/50 text-[10px] font-mono">
                  <button className="px-2 py-1 hover:bg-white/5 hover:text-white rounded transition flex items-center gap-1 border border-transparent hover:border-white/10">
                    <RefreshCw className="w-3 h-3 text-[#f2c811]" />
                    Refresh
                  </button>
                  <span className="text-white/10">|</span>
                  <button className="px-2 py-1 hover:bg-white/5 hover:text-white rounded transition flex items-center gap-1 border border-transparent hover:border-white/10">
                    <Filter className="w-3 h-3 text-[#f2c811]" />
                    Slicers
                  </button>
                  <span className="text-white/10">|</span>
                  <button className="px-2 py-1 hover:bg-white/5 hover:text-white rounded transition flex items-center gap-1 border border-transparent hover:border-white/10">
                    <Bookmark className="w-3 h-3 text-[#f2c811]" />
                    Bookmarks
                  </button>
                </div>
              </div>

              {/* Power BI Sector filter Slicers panel */}
              <div className="flex items-center gap-2.5 p-3.5 bg-white/5 rounded-2xl border border-white/10 text-xs overflow-x-auto">
                <span className="text-white/40 font-mono uppercase text-[9px] font-bold shrink-0 flex items-center gap-1">
                  <Filter className="w-3 h-3 text-[#f2c811]" />
                  Sector Slicer:
                </span>
                {["All Sectors", "Colaba sector", "Bandra BKC core", "Juhu corridor", "Thane regional"].map((sec) => (
                  <button
                    key={sec}
                    onClick={() => setSelectedSector(sec)}
                    className={`px-3 py-1 rounded-xl font-mono text-[10px] font-bold uppercase transition border shrink-0 ${
                      selectedSector === sec
                        ? "bg-[#f2c811] text-black border-[#f2c811] shadow-[0_0_10px_rgba(242,200,17,0.35)]"
                        : "bg-white/5 border-white/10 text-white/60 hover:text-white"
                    }`}
                  >
                    {sec}
                  </button>
                ))}
              </div>

              {/* Dynamic KPI summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                
                {/* KPI Card 1: Wait Time */}
                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-1 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-[3px] bg-[#f2c811]" />
                  <p className="text-[10px] text-white/40 font-mono uppercase tracking-wider">Avg Commuter Wait</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold font-mono text-white">{simResult.waitTime}m</span>
                    <span className={`text-[10px] font-mono ${simResult.waitTime > 4.2 ? "text-rose-450 text-rose-400" : "text-emerald-400"}`}>
                      {simResult.waitTime > 4.2 ? `+${(simResult.waitTime - 4.2).toFixed(1)}m` : `-${Math.abs(simResult.waitTime - 4.2).toFixed(1)}m`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[9px] text-white/40 font-mono">
                    <span>Baseline: 4.2 mins</span>
                    <span className="text-cyan-400">Reactive</span>
                  </div>
                </div>

                {/* KPI Card 2: Congestion */}
                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-1 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-[3px] bg-[#22d3ee]" />
                  <p className="text-[10px] text-white/40 font-mono uppercase tracking-wider">Airspace Congestion</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold font-mono text-white">{simResult.congestion}%</span>
                    <span className={`text-[10px] font-mono ${simResult.congestion > 45 ? "text-rose-400" : "text-emerald-400"}`}>
                      {simResult.congestion > 45 ? `High load` : `Stable`}
                    </span>
                  </div>
                  <div className="w-full bg-black/40 h-1 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${simResult.congestion > 74 ? "bg-rose-500" : simResult.congestion > 49 ? "bg-amber-450 bg-amber-500" : "bg-cyan-400"}`} 
                      style={{ width: `${simResult.congestion}%` }} 
                    />
                  </div>
                </div>

                {/* KPI Card 3: Hourly Revenue */}
                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-1 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-[3px] bg-emerald-500" />
                  <p className="text-[10px] text-white/40 font-mono uppercase tracking-wider">Projected Hourly Revenue</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold font-mono text-emerald-450 text-emerald-400">₹{simResult.revenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-[9px] text-white/40 font-mono">
                    <span>Active fleet: {Math.max(500, Math.round(fleetSize * 0.75))} units</span>
                    <span className="text-[#f2c811] font-semibold">What-If projection</span>
                  </div>
                </div>

                {/* KPI Card 4: Safety index */}
                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-1 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-[3px] bg-purple-500" />
                  <p className="text-[10px] text-white/40 font-mono uppercase tracking-wider">Jitter safety index</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold font-mono text-white">{simResult.safetyScore}%</span>
                    <span className="text-[9px] font-mono text-emerald-400">SLA Standard</span>
                  </div>
                  <div className="flex justify-between items-center text-[9px] text-white/40 font-mono">
                    <span>Incident probability: {Math.round((100 - simResult.safetyScore)*100)/100}%</span>
                    <span className="text-purple-400 font-semibold">Protected</span>
                  </div>
                </div>

              </div>

              {/* Power BI Custom charts layout rendering */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Visual A: Weather conditions to flight delays composite chart */}
                <div className="bg-white/5 border border-white/10 p-5 rounded-3xl space-y-4">
                  <div>
                    <h4 className="font-display font-semibold text-xs text-white uppercase tracking-wider flex items-center justify-between">
                      <span>Weather Overcast vs Flight Delay Index</span>
                      <span className="text-[9px] text-[#f2c811] font-mono lowercase font-normal">Double-Y correlation</span>
                    </h4>
                    <p className="text-[10px] text-white/45 mt-0.5">Correlates rainfall intensity (mm/hr) with the simulated ratio of delayed flight journeys</p>
                  </div>

                  <div className="h-56 w-full text-xs font-mono">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={weatherCorrelations} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                        <XAxis dataKey="severity" stroke="#94a3b8" fontSize={9} />
                        <YAxis yAxisId="left" stroke="#22d3ee" fontSize={9} label={{ value: 'Delays (mins)', angle: -90, position: 'insideLeft', fill: '#22d3ee', offset: 10 }} />
                        <YAxis yAxisId="right" orientation="right" stroke="#e11d48" fontSize={9} label={{ value: 'Rainfall (mm)', angle: 90, position: 'insideRight', fill: '#e11d48', offset: 10 }} />
                        <Tooltip contentStyle={{ backgroundColor: "#0d1117", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "8px" }} />
                        <Legend wrapperStyle={{ fontSize: '10px' }} />
                        <Bar yAxisId="right" dataKey="rainfall" name="Precipitation (mm/hr)" fill="rgba(34, 211, 238, 0.2)" stroke="#22d3ee" strokeWidth={1} />
                        <Line yAxisId="left" type="monotone" dataKey="delayedRatio" name="Delayed Flights Index" stroke="#e11d48" strokeWidth={2.5} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Visual B: Ground terrain floods heights to air demand correlation */}
                <div className="bg-white/5 border border-white/10 p-5 rounded-3xl space-y-4">
                  <div>
                    <h4 className="font-display font-semibold text-xs text-white uppercase tracking-wider flex items-center justify-between">
                      <span>Mumbai Surface Floods vs Air Transit Boost</span>
                      <span className="text-[9px] text-[#f2c811] font-mono lowercase font-normal">SLA Spillover model</span>
                    </h4>
                    <p className="text-[10px] text-white/45 mt-0.5">How heavy coastal water flooding boosts premium sky-taxi transit as cars completely stall</p>
                  </div>

                  <div className="h-56 w-full text-xs font-mono animate-fade-in">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={urbanVulnerabilityCorrelation} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                        <defs>
                          <linearGradient id="pbiSurface" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="pbiSky" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} />
                        <YAxis stroke="#94a3b8" fontSize={9} />
                        <Tooltip contentStyle={{ backgroundColor: "#0d1117", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "8px" }} />
                        <Legend wrapperStyle={{ fontSize: '10px' }} />
                        <Area type="monotone" dataKey="surfaceCommuteMins" name="Ground Transit Delay (mins)" stroke="#f59e0b" fillOpacity={1} fill="url(#pbiSurface)" />
                        <Area type="monotone" dataKey="skyCommuteMins" name="SkyGrid Transit (mins)" stroke="#10b981" fillOpacity={1} fill="url(#pbiSky)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Visual C: Simulated Flight Volume Fractions per Sector */}
                <div className="bg-white/5 border border-white/10 p-5 rounded-3xl space-y-4">
                  <div>
                    <h4 className="font-display font-semibold text-xs text-white uppercase tracking-wider">
                      Dynamic Flight Volume per Sector Corridor
                    </h4>
                    <p className="text-[10px] text-white/45 mt-0.5">Calculates baseline flight capacity against reactive what-if simulation totals</p>
                  </div>

                  <div className="h-56 w-full text-xs font-mono">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart data={simulationFlightFractions} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} />
                        <YAxis stroke="#94a3b8" fontSize={9} />
                        <Tooltip contentStyle={{ backgroundColor: "#0d1117", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "8px" }} />
                        <Legend wrapperStyle={{ fontSize: '10px' }} />
                        <Bar dataKey="baseline" name="Baseline (1,500 fleet standard)" fill="rgba(255, 255, 255, 0.1)" stroke="rgba(255, 255, 255, 0.2)" strokeWidth={1} />
                        <Bar dataKey="simulated" name="Simulated Scenario" fill="#f2c811" />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Visual D: Correlating Weather Incidents & Overrides */}
                <div className="bg-white/5 border border-white/10 p-5 rounded-3xl space-y-4">
                  <div>
                    <h4 className="font-display font-semibold text-xs text-white uppercase tracking-wider flex items-center justify-between">
                      <span>Atmospheric Jitter Incident Risks</span>
                      <span className="text-[9px] text-[#f2c811] font-mono lowercase font-normal">Regression forecast</span>
                    </h4>
                    <p className="text-[10px] text-white/45 mt-0.5">Correlates wind shear alerts and AI grid flight trajectory exclusions directly</p>
                  </div>

                  <div className="h-56 w-full text-xs font-mono">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={[
                        { wind: 5, automatedAlerts: 1, manuallyControlled: 2 },
                        { wind: 15, automatedAlerts: 4, manuallyControlled: 8 },
                        { wind: 25, automatedAlerts: 16, manuallyControlled: 28 },
                        { wind: 40, automatedAlerts: 64, manuallyControlled: 88 },
                        { wind: 65, automatedAlerts: 210, manuallyControlled: 240 }
                      ]} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                        <XAxis dataKey="wind" stroke="#94a3b8" fontSize={9} label={{ value: "Wind Shear (Knots)", position: "insideBottom", offset: -2, fill: "#94a3b8" }} />
                        <YAxis stroke="#94a3b8" fontSize={9} />
                        <Tooltip contentStyle={{ backgroundColor: "#0d1117", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "8px" }} />
                        <Legend wrapperStyle={{ fontSize: '10px' }} />
                        <Area type="monotone" dataKey="automatedAlerts" name="Corridor Wind Alerts" stroke="#f43f5e" fill="rgba(244, 63, 94, 0.15)" />
                        <Area type="monotone" dataKey="manuallyControlled" name="Autopilot Safety Exclusions" stroke="#a78bfa" fill="rgba(167, 139, 250, 0.15)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>

              {/* Recruiter Footnote notice inside Power BI */}
              <div className="p-4 pbi-grid-border rounded-2xl bg-white/5 text-xs text-white/50 border border-white/10 italic flex items-center gap-1.5 font-sans leading-normal">
                <Info className="w-5 h-5 text-[#f2c811] shrink-0" />
                <span>
                  <strong>Data Modeler Insight:</strong> This embedded canvas demonstrates direct DAX-reactive measure outcomes mapping real wind, rain, and spatial congestion ratios against key terminal milestones dynamically. Fits elite enterprise Power BI portfolios.
                </span>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
