import React, { useState } from "react";
import { Compass, AlertCircle, RefreshCw, BarChart2, Activity, CloudRain, Sun, Wind, Eye, ShieldAlert } from "lucide-react";
import { FlightRecord, SmartGridState } from "../types";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";

interface TrafficViewProps {
  gridState: SmartGridState;
  flights: FlightRecord[];
}

export default function TrafficView({ gridState, flights }: TrafficViewProps) {
  const [selectedLane, setSelectedLane] = useState<string>("Lane-Coastal");
  const [testSimWindSpeed, setTestSimWindSpeed] = useState<number>(35); // knots
  const [testRainSeverity, setTestRainSeverity] = useState<"Light" | "Heavy" | "Cyclone">("Heavy");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [overrideSuccessMsg, setOverrideSuccessMsg] = useState<string | null>(null);

  // Congestion ratios per lane
  const laneOperationalData = [
    { laneName: "Lane-Coastal (Marine Route)", trafficDensity: "74%", congestionRank: "Moderate", speedCeiling: "320 km/h", restriction: "Altitude min 300m" },
    { laneName: "Lane-Express (Thane-Bandra Transit)", trafficDensity: "91%", congestionRank: "Critical", speedCeiling: "380 km/h", restriction: "AI Autonomous Mode Only" },
    { laneName: "Lane-A1 (Colaba-Airport Radial)", trafficDensity: "82%", congestionRank: "High", speedCeiling: "280 km/h", restriction: "No manual steering bypass" },
    { laneName: "Lane-Suburban (Andheri-Dadar Segment)", trafficDensity: "61%", congestionRank: "Low", speedCeiling: "240 km/h", restriction: "Open manual overrides" },
    { laneName: "Lane-HighAltitude (Inter-City Gateways)", trafficDensity: "38%", congestionRank: "Low", speedCeiling: "450 km/h", restriction: "Class Grade 4 required" },
  ];

  // Delay analytics charts over the hours
  const delayHourTrend = [
    { hour: "11:00", avgDelaySeconds: 45, maxDelaySeconds: 120 },
    { hour: "13:00", avgDelaySeconds: 72, maxDelaySeconds: 180 },
    { hour: "15:00", avgDelaySeconds: 140, maxDelaySeconds: 320 },
    { hour: "17:00", avgDelaySeconds: 210, maxDelaySeconds: 540 },
    { hour: "19:00", avgDelaySeconds: 110, maxDelaySeconds: 240 },
    { hour: "21:00", avgDelaySeconds: 35, maxDelaySeconds: 90 },
  ];

  // Interactive predictive function to calculate corridor overload index
  const calculatePredictedOverload = () => {
    let baseValue = 40; // Base index
    if (selectedLane === "Lane-Express") baseValue += 30;
    if (selectedLane === "Lane-A1") baseValue += 20;
    if (selectedLane === "Lane-Coastal") baseValue += 15;

    baseValue += (testSimWindSpeed * 0.4);

    if (testRainSeverity === "Heavy") baseValue += 15;
    if (testRainSeverity === "Cyclone") baseValue += 30;

    return Math.min(Math.round(baseValue), 100);
  };

  const predictedOverloadIndex = calculatePredictedOverload();

  const getDetourComparison = (lane: string, wind: number, rain: "Light" | "Heavy" | "Cyclone") => {
    let baseOrigDuration = 25;
    let baseOrigEnergy = 75;
    let title = "";
    let detourName = "";

    if (lane === "Lane-Express") {
      baseOrigDuration = 40;
      baseOrigEnergy = 120;
      title = "Lane-Express (Thane-Bandra Transit)";
      detourName = "Central Airway Bypass Sector";
    } else if (lane === "Lane-Coastal") {
      baseOrigDuration = 30;
      baseOrigEnergy = 90;
      title = "Lane-Coastal (Marine Route)";
      detourName = "Eastern Freeway Inner Corridor";
    } else if (lane === "Lane-A1") {
      baseOrigDuration = 35;
      baseOrigEnergy = 105;
      title = "Lane-A1 (Colaba Harbor Belt)";
      detourName = "West-Coast Outer Skygrid Bypass";
    } else {
      // Lane-Suburban or others
      baseOrigDuration = 20;
      baseOrigEnergy = 60;
      title = "Lane-Suburban (Andheri-Dadar Segment)";
      detourName = "Sanjay Gandhi NP High Overpass";
    }

    // Penalties based on current simulator values
    const windPenalty = Math.round(wind * 0.3);
    let rainPenalty = 2;
    if (rain === "Heavy") rainPenalty = 10;
    if (rain === "Cyclone") rainPenalty = 22;

    const originalDuration = baseOrigDuration + windPenalty + rainPenalty;
    const originalEnergy = baseOrigEnergy + (windPenalty * 1.4) + (rainPenalty * 1.8);

    // Proposed detour bypasses bad factors
    const proposedDuration = Math.round(baseOrigDuration * 0.75 + (windPenalty * 0.15) + (rainPenalty * 0.2));
    const proposedEnergy = Math.round(baseOrigEnergy * 0.7 + (windPenalty * 0.2) + (rainPenalty * 0.3));

    const durationSaved = originalDuration - proposedDuration;
    const energySaved = originalEnergy - proposedEnergy;
    const durationSavedPct = Math.round((durationSaved / originalDuration) * 100);
    const energySavedPct = Math.round((energySaved / originalEnergy) * 100);

    return {
      title,
      detourName,
      originalDuration,
      originalEnergy: Math.round(originalEnergy),
      proposedDuration,
      proposedEnergy: Math.round(proposedEnergy),
      durationSaved,
      energySaved,
      durationSavedPct,
      energySavedPct
    };
  };

  const detourData = getDetourComparison(selectedLane, testSimWindSpeed, testRainSeverity);

  return (
    <div className="space-y-6 text-slate-100 font-sans" id="traffic-control-root">
      
      {/* Dynamic Success Override Banner */}
      {overrideSuccessMsg && (
        <div className="p-3 border border-emerald-500/40 text-emerald-350 text-xs rounded-lg flex items-start gap-2.5 bg-emerald-950/40 shadow-sm animate-fade-in" id="override-success-toast">
          <span className="text-emerald-400 font-bold font-mono">OVERRIDE CONFIRMED:</span>
          <span>{overrideSuccessMsg}</span>
        </div>
      )}

      {/* Upper Header Banner */}
      <div className="border-b border-slate-800 pb-5" id="traffic-header">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 uppercase tracking-widest">
          <Compass className="w-4 h-4 text-slate-450" />
          Aviation Control Authority / Collision Mitigation
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white mt-1 leading-tight">
          Air Traffic Command View
        </h1>
        <p className="text-sm text-slate-400 mt-2 max-w-xl leading-relaxed">
          Monitor dynamic scheduling latencies, manage regional corridor loads, and perform active weather simulation vectors for autonomous transits.
        </p>
      </div>

      {/* Grid with main delay analytics area chart & Lane occupancy side-panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="traffic-analytics-grid">
        
        {/* Line Chart Widget with storytelling structure */}
        <div className="lg:col-span-2 bg-[#0d1321] border border-slate-800 rounded-lg p-5 flex flex-col justify-between" id="latency-trend-card">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
            <div>
              <h3 className="text-lg font-bold text-white tracking-normal font-sans">
                Transit Grid Scheduling Latencies
              </h3>
              <p className="text-xs text-slate-400">
                Hourly tracking of average queue delays and single outlier delays across aircraft
              </p>
            </div>
            <span className="bg-[#111c2a] text-[#22d3ee] border border-slate-800 font-mono text-[10px] px-2.5 py-1 rounded font-bold whitespace-nowrap">
              SAFETY RATING: OPTIMAL
            </span>
          </div>

          {/* Line Chart visualization */}
          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={delayHourTrend} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1d263b" opacity={0.3} />
                <XAxis dataKey="hour" stroke="#475569" fontSize={10} fontFamily="JetBrains Mono" tickLine={false} />
                <YAxis stroke="#475569" fontSize={10} fontFamily="JetBrains Mono" tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0b0f19", border: "1px solid #1e293b", borderRadius: "8px", fontSize: "11px", color: "#f8fafc" }}
                  labelStyle={{ color: "#22d3ee", fontWeight: "bold" }}
                />
                <Legend iconSize={8} wrapperStyle={{ fontSize: "10px", pt: 10 }} />
                <Line type="monotone" dataKey="avgDelaySeconds" name="Avg Delay (sec)" stroke="#22d3ee" strokeWidth={2} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="maxDelaySeconds" name="Max Delay (sec)" stroke="#f43f5e" strokeWidth={1.5} strokeDasharray="3 3" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stories Panel capturing Lane Occupancy Insights */}
        <div className="bg-[#0d1321] border border-slate-800 rounded-lg p-5 flex flex-col justify-between" id="lane-occupancy-story-card">
          <div className="space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-amber-500 uppercase tracking-widest font-semibold">Corridor Narrative</span>
              <h3 className="text-lg font-bold text-white tracking-normal font-sans">
                Air Corridor Occupancy
              </h3>
              <p className="text-xs text-slate-400">Current active workload and safety restrictions per route sector</p>
            </div>

            <div className="space-y-3 pt-1">
              {laneOperationalData.slice(0, 3).map((lane, idx) => (
                <div key={idx} className="p-2.5 bg-slate-900/35 rounded border border-slate-800/80 text-xs">
                  <div className="flex justify-between items-center font-semibold mb-1">
                    <span className="text-slate-200">{lane.laneName}</span>
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                      lane.congestionRank === "Critical" 
                        ? "bg-rose-950 text-rose-300 border-rose-900/40"
                        : lane.congestionRank === "High"
                        ? "bg-amber-950 text-amber-300 border-amber-900/40"
                        : "bg-cyan-950 text-[#22d3ee] border-cyan-900/40"
                    }`}>
                      {lane.trafficDensity} Load
                    </span>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>Ceiling: {lane.speedCeiling}</span>
                    <span>Rule: {lane.restriction}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Stories Style Insight parameters */}
            <div className="p-3 bg-[#0a0d17] border border-slate-850 rounded text-xs space-y-1 text-slate-350">
              <span className="text-[10px] font-mono text-slate-500 block font-bold uppercase">Corridor Analytics Story</span>
              <p className="leading-relaxed text-[11px]">
                Active Juhu Segment speed limits are restricted to 240km/h under wet conditions. High commuter flow trends (+18%) over Thane express routes are balance-managed by autopilot algorithms cleanly.
              </p>
              <div className="text-[9.5px] font-mono text-[#22d3ee] flex justify-between pt-1 border-t border-slate-800/60 mt-1.5">
                <span>Forecast: Normal routing conditions</span>
                <span>Risk: Low Risk</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 text-[10px] text-slate-500 font-mono flex items-center justify-between mt-3">
            <span>OPERATIONAL FLOTILLA LOGS</span>
            <span className="text-emerald-400 font-bold">GRID AUTOPILOT ACTIVE</span>
          </div>
        </div>

      </div>

      {/* Interactive Predictive Hotspots Laboratory Simulator */}
      <div className="bg-[#0d1321] border border-slate-800 rounded-lg p-5 relative overflow-hidden" id="overload-simulator-section">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          
          {/* Simulation Controls side */}
          <div className="lg:col-span-2 space-y-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-[#22d3ee] font-mono uppercase tracking-wider font-semibold">
                <AlertCircle className="w-4 h-4 text-[#22d3ee] shrink-0" />
                Airspace Overload Predictor Laboratory
              </div>
              <h2 className="text-xl font-bold text-white tracking-normal font-sans">
                Corridor Overload Simulation
              </h2>
              <p className="text-xs text-slate-450 leading-relaxed max-w-xl">
                Tune predictive atmospheric vectors (wind speed forces and rainfall densities) to estimate potential commuter latencies across Mumbai's main sky hubs, enabling operators to apply protective buffers.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-900/40 p-4 rounded-lg border border-slate-800/80">
              
              {/* Lane selection */}
              <div className="space-y-1.5 text-xs" style={{ minHeight: "44px" }}>
                <label className="text-slate-400 font-mono text-[10px] uppercase font-bold">Corridor Vector Route</label>
                <select
                  value={selectedLane}
                  onChange={(e) => setSelectedLane(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 py-2 px-2.5 rounded text-xs select-none focus:outline-none cursor-pointer outline-none"
                >
                  <option value="Lane-Express">Lane-Express (Commuter Segment)</option>
                  <option value="Lane-Coastal">Lane-Coastal (Marine Corridor)</option>
                  <option value="Lane-A1">Lane-A1 (Colaba Harbor Belt)</option>
                  <option value="Lane-Suburban">Lane-Suburban (Andheri Link)</option>
                </select>
              </div>

              {/* Wind Speed simulation */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between items-center">
                  <label className="text-slate-400 font-mono text-[10px] uppercase font-bold">Atm Wind Speed</label>
                  <span className="text-[#22d3ee] font-mono text-[10px] font-bold">{testSimWindSpeed} knots</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="70"
                  value={testSimWindSpeed}
                  onChange={(e) => setTestSimWindSpeed(parseInt(e.target.value))}
                  className="w-full h-1 bg-slate-950 rounded appearance-none cursor-pointer accent-[#22d3ee]"
                />
                <div className="flex justify-between text-[9px] text-slate-550 font-mono">
                  <span>10 KT (Breeze)</span>
                  <span>70 KT (Gale)</span>
                </div>
              </div>

              {/* Rain density severity */}
              <div className="space-y-1.5 text-xs">
                <label className="text-slate-400 font-mono text-[10px] uppercase font-bold block">Precipitation severity</label>
                <div className="grid grid-cols-3 gap-1" style={{ minHeight: "40px" }}>
                  {(["Light", "Heavy", "Cyclone"] as const).map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setTestRainSeverity(lvl)}
                      className={`text-[9.5px] border rounded transition font-mono cursor-pointer ${
                        testRainSeverity === lvl 
                          ? "bg-slate-800 border-[#22d3ee]/45 text-[#22d3ee] font-bold" 
                          : "bg-slate-950/50 border-slate-800 text-slate-500 hover:text-slate-350"
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Interactive prediction gauge viewport */}
          <div className="p-4 rounded-lg bg-[#0a0f1d] border border-slate-800 flex flex-col items-center justify-center text-center space-y-4">
            <div className="space-y-1">
              <p className="font-mono text-slate-500 text-[10px] uppercase font-semibold">Predicted System Overload</p>
              <div className={`text-5xl font-mono font-black tracking-tight leading-none ${
                predictedOverloadIndex > 75 ? "text-rose-500" : predictedOverloadIndex > 50 ? "text-amber-500" : "text-emerald-550"
              }`}>
                {predictedOverloadIndex}%
              </div>
              <p className={`text-[10px] font-mono tracking-wider uppercase font-bold ${
                predictedOverloadIndex > 75 ? "text-rose-500" : predictedOverloadIndex > 50 ? "text-amber-400" : "text-emerald-500"
              }`}>
                {predictedOverloadIndex > 75 ? "Severe Overfill Lock" : predictedOverloadIndex > 50 ? "Adaptive Bypass active" : "CORRIDOR SAFE & FLUID"}
              </p>
            </div>

            {/* Corrective advice narrative */}
            <div className="p-3 bg-[#0c111e] rounded border border-slate-850 text-[10.5px] text-slate-400 leading-normal italic min-h-[64px] flex items-center justify-center">
              {predictedOverloadIndex > 75 
                ? "Tactical corrective: Severe monsoon pressure forces bypass overrides. Autopilot locking manual air taxis. Diverting commercial flights to Thane gateways."
                : predictedOverloadIndex > 50 
                ? "Tactical corrective: High crosswind thresholds active. Surge rates scaled to 1.35x. Flight paths set to high altitude corridor limits."
                : "Tactical corrective: Atmospheric vectors within normal limits. Corridors maintaining nominal spacing intervals with zero manual restrictions rules."}
            </div>

            {/* Auto-Suggest Detour Button */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full py-2.5 bg-[#22d3ee] text-slate-950 hover:bg-[#1faec4] font-mono text-[11px] uppercase font-bold rounded flex items-center justify-center gap-1.5 transition cursor-pointer shadow-[0_0_15px_rgba(34,211,238,0.15)] hover:shadow-[0_0_20px_rgba(34,211,238,0.3)]"
            >
              <Compass className="w-4 h-4" /> Auto-Suggest Detour
            </button>
          </div>

        </div>
      </div>

      {/* Auto-Suggest Detour Modal backdrop overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in" id="detour-modal-overlay">
          <div className="bg-[#0b111e] border border-slate-800 rounded-lg max-w-lg w-full p-6 shadow-2xl relative space-y-6" id="detour-modal-content">
            
            {/* Header */}
            <div className="flex justify-between items-start border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#22d3ee] font-bold block">
                  Dynamic Airway Re-Routing Model
                </span>
                <h3 className="text-lg font-bold text-white mt-1">
                  Proposed Autonomous Detour
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white font-mono text-sm uppercase font-bold hover:bg-slate-900 border border-slate-800 px-2.5 py-1 rounded transition cursor-pointer"
                id="modal-close-btn"
              >
                ✕
              </button>
            </div>

            {/* Lane Details */}
            <div className="space-y-1.5 bg-slate-900/30 p-3 rounded-lg border border-slate-850">
              <p className="text-xs text-slate-400 font-mono">
                Original Sector: <strong className="text-white font-sans text-sm">{detourData.title}</strong>
              </p>
              <p className="text-xs text-slate-400 font-mono">
                Recommended Bypass: <strong className="text-[#22d3ee] font-sans text-sm">{detourData.detourName}</strong>
              </p>
            </div>

            {/* Comparative Columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Original Card */}
              <div className="bg-slate-950/60 p-4 border border-rose-900/40 rounded-lg space-y-3">
                <span className="font-mono text-[9px] uppercase font-bold text-rose-400 tracking-wider">
                  Original Impacted Path
                </span>
                
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase font-mono block">Flight Duration</span>
                  <span className="text-xl font-mono text-slate-200 font-bold">{detourData.originalDuration} Mins</span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase font-mono block">Energy Consumption</span>
                  <span className="text-xl font-mono text-slate-200 font-bold">{detourData.originalEnergy} MJ</span>
                </div>
                
                <span className="text-[9px] block text-slate-500 font-sans leading-relaxed">
                  Prone to {predictedOverloadIndex}% corridor overload turbulence resistance.
                </span>
              </div>

              {/* Proposed Detour Card */}
              <div className="bg-slate-950/60 p-4 border border-emerald-900/40 rounded-lg space-y-3 shadow-[0_0_15px_rgba(16,185,129,0.05)]">
                <span className="font-mono text-[9px] uppercase font-bold text-emerald-400 tracking-wider">
                  Proposed Bypass Path
                </span>

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase font-mono block">Flight Duration</span>
                  <span className="text-xl font-mono text-emerald-400 font-black">
                    {detourData.proposedDuration} Mins
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase font-mono block">Energy Consumption</span>
                  <span className="text-xl font-mono text-emerald-400 font-black">
                    {detourData.proposedEnergy} MJ
                  </span>
                </div>

                <span className="text-[9px] block text-emerald-400 font-bold uppercase bg-emerald-950/10 border border-emerald-900/30 px-2 py-0.5 rounded text-center">
                  Clear Waypoints
                </span>
              </div>

            </div>

            {/* Savings Widget */}
            <div className="bg-[#0c1424] p-4 rounded-lg border border-slate-850 flex flex-col sm:flex-row justify-between gap-3 text-xs leading-normal">
              <div>
                <span className="text-[9px] uppercase font-mono text-slate-500 block mb-0.5">Duration Optimization</span>
                <span className="text-emerald-400 font-mono font-black text-sm flex items-center gap-1">
                  ▼ {detourData.durationSaved} mins saved ({detourData.durationSavedPct}%)
                </span>
              </div>
              <div className="sm:text-right">
                <span className="text-[9px] uppercase font-mono text-slate-500 block mb-0.5">Energy Optimization</span>
                <span className="text-emerald-400 font-mono font-black text-sm flex items-center gap-1 justify-end">
                  ▼ {detourData.energySaved} MJ saved ({detourData.energySavedPct}%)
                </span>
              </div>
            </div>

            {/* Footer actions */}
            <div className="flex gap-2.5 justify-end pt-3 border-t border-slate-800">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 font-mono text-xs uppercase font-bold rounded cursor-pointer border border-slate-800 transition"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setOverrideSuccessMsg(`Autopilot route override updated: Airway assigned to: ${detourData.detourName}. Safe margins successfully negotiated.`);
                  setIsModalOpen(false);
                  setTimeout(() => {
                    setOverrideSuccessMsg(null);
                  }, 6000);
                }}
                className="px-4 py-2 bg-[#22d3ee] text-slate-950 hover:bg-[#1faec4] font-mono text-xs uppercase font-bold rounded cursor-pointer transition shadow-[0_0_10px_rgba(34,211,238,0.2)]"
              >
                Authorize Override
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
