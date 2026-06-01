import React, { useState, useEffect, useRef } from "react";
import { 
  Compass, Radio, Zap, Wind, CloudRain, AlertTriangle, Play, RefreshCw, 
  Settings, MapPin, Database, Sparkles, Filter, ShieldAlert, CheckCircle, 
  Send, Wrench, ShieldCheck, Activity, Eye, FileText, UserCheck, Key, 
  Layers, Clock, ArrowRight, CornerDownLeft, MessageSquare, Plus, Lock, Globe
} from "lucide-react";
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, 
  LineChart, Line, CartesianGrid, Legend 
} from "recharts";
import { SmartGridState, FlightRecord, TelemetryRecord } from "../types";

interface OperationsViewProps {
  gridState: SmartGridState;
  setGridState: React.Dispatch<React.SetStateAction<SmartGridState>>;
  flights: FlightRecord[];
  setFlights: React.Dispatch<React.SetStateAction<FlightRecord[]>>;
  activeRole: string;
}

interface IncidentNode {
  id: string;
  title: string;
  sector: string;
  severity: "critical" | "warning" | "info";
  timestamp: string;
  assignedTo: string;
  status: "open" | "investigating" | "mitigated";
  description: string;
}

export default function OperationsView({ 
  gridState, 
  setGridState, 
  flights, 
  setFlights,
  activeRole 
}: OperationsViewProps) {
  
  // Map toggles and states
  const [activeSegmentFilters, setActiveSegmentFilters] = useState<"all" | "high" | "low">("all");
  const [mapLayer, setMapLayer] = useState<{
    corridors: boolean;
    weather: boolean;
    congestions: boolean;
    incidentPins: boolean;
  }>({
    corridors: true,
    weather: true,
    congestions: true,
    incidentPins: true
  });

  const [selectedHub, setSelectedHub] = useState<string | null>(null);
  const [selectedFlight, setSelectedFlight] = useState<FlightRecord | null>(null);
  const [simulationSpeed, setSimulationSpeed] = useState<number>(1.0);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Weather parameters
  const [windTolerance, setWindTolerance] = useState<number>(45); // km/h
  const [airspaceFreezeActive, setAirspaceFreezeActive] = useState<boolean>(false);

  // Simulated live incidents
  const [incidents, setIncidents] = useState<IncidentNode[]>([
    {
      id: "INC-9382",
      title: "Wind Shear at BKC Conflux Corridor",
      sector: "Bandra BKC Core",
      severity: "critical",
      timestamp: "13:10:45",
      assignedTo: "Sys Autopilot Control",
      status: "open",
      description: "Severe localized downdraft detected. Crosswind velocity exceeding 52 km/h. Flight separation adjusted to 500m."
    },
    {
      id: "INC-8830",
      title: "Telemetry Transponder Dropping Packets",
      sector: "Thane Gateways",
      severity: "warning",
      timestamp: "12:55:00",
      assignedTo: "Fleet Ground Crew 4",
      status: "investigating",
      description: "VTOL-2849 reporting high latency on secondary RF telemetry stream. Primary satellite receiver fully active."
    },
    {
      id: "INC-7489",
      title: "Vertihub #3 Slow Fast-Charger Coupler",
      sector: "Colaba Harbor Terminus",
      severity: "info",
      timestamp: "12:40:12",
      assignedTo: "Unassigned Hub Tech",
      status: "open",
      description: "Autonomous charging arm experiencing minor locking delays. Power transfer rate sustained at 450kW."
    }
  ]);

  // Command palette inputs
  const [manualDispatchID, setManualDispatchID] = useState<string>("");
  const [dispatchOrigin, setDispatchOrigin] = useState<string>("Bandra");
  const [dispatchDest, setDispatchDest] = useState<string>("Colaba");
  const [dispatchPax, setDispatchPax] = useState<number>(3);

  // Collaboration state
  const [comments, setComments] = useState<Array<{ id: string; user: string; text: string; time: string }>>([
    { id: "c1", user: "Systems Commander Juhu", text: "Alert: Keep Juhu corridors at high altitude. Visual flyby restrictions below 200m today.", time: "10 mins ago" },
    { id: "c2", user: "Operations Analyst", text: "BKC Congestion should subside once flights to Kurla are re-routed through Lane-Coastal.", time: "25 mins ago" }
  ]);
  const [newComment, setNewComment] = useState("");

  // 7-day predictive demand data
  const [demandForecast, setDemandForecast] = useState([
    { time: "08:00 AM", baselineDemand: 820, predictedDemand: 940, capacityCap: 1200 },
    { time: "10:00 AM", baselineDemand: 1050, predictedDemand: 1180, capacityCap: 1200 },
    { time: "12:00 PM", baselineDemand: 740, predictedDemand: 810, capacityCap: 1200 },
    { time: "02:00 PM", baselineDemand: 890, predictedDemand: 980, capacityCap: 1200 },
    { time: "04:00 PM", baselineDemand: 1110, predictedDemand: 1250, capacityCap: 1200 },
    { time: "06:00 PM", baselineDemand: 1350, predictedDemand: 1420, capacityCap: 1500 },
    { time: "08:00 PM", baselineDemand: 920, predictedDemand: 1050, capacityCap: 1200 }
  ]);

  // Mumbai Map Grid configurations (Slight offset so standard container coordinates wrap beautifully)
  const HUBS_CONFIG: Record<string, { name: string; x: number; y: number; type: string; load: number }> = {
    "Colaba": { name: "Colaba Coastal Harbor", x: 190, y: 390, type: "Luxury Terminus", load: 74 },
    "Nariman Point": { name: "Nariman Point Business Port", x: 140, y: 340, type: "Financial Core", load: 52 },
    "Dadar": { name: "Dadar Central Sky-Terminal", x: 260, y: 240, type: "Transit Linkway", load: 88 },
    "Bandra": { name: "Bandra BKC Gateway (BKC)", x: 330, y: 190, type: "Commercial Core", load: 94 },
    "Kurla": { name: "Kurla Logistics Hub", x: 420, y: 220, type: "Heavy Cargo Cargo", load: 61 },
    "Juhu": { name: "Juhu Seafront Terminal", x: 230, y: 130, type: "Bypass West Gate", load: 45 },
    "Andheri": { name: "Andheri Commercial Link", x: 320, y: 90, type: "Suburban Core", load: 68 },
    "Thane": { name: "Thane Northern Gateway", x: 490, y: 40, type: "Regional Terminal", load: 38 }
  };

  // Helper trigger alerts
  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => {
      setFeedbackMsg(null);
    }, 4500);
  };

  // Dispatch Action: Re-Route Sector Airway
  const handleRerouteSector = (laneName: string, destinationHub: string) => {
    setFlights(prev => 
      prev.map(f => {
        if (f.airLaneUsed === laneName && f.status === "active") {
          return { ...f, airLaneUsed: "Lane-Coastal", averageAltitude: f.averageAltitude + 100 };
        }
        return f;
      })
    );
    setGridState(prev => ({
      ...prev,
      safetyScore: Math.min(100, prev.safetyScore + 0.05),
      avgWaitTime: Math.max(2.1, prev.avgWaitTime - 0.2)
    }));
    showFeedback(`Airway Sector ${laneName} modified. Routing flights to alternate Juhu Sea Bypass route. Active Altitude ceiling increased.`);
  };

  // Dispatch Action: Dispatch emergency override
  const handleHaltOperations = (status: boolean) => {
    setAirspaceFreezeActive(status);
    setFlights(prev => 
      prev.map(f => {
        if (f.status === "active") {
          return { ...f, status: status ? "diverted" : "active" };
        }
        return f;
      })
    );
    setGridState(prev => ({
      ...prev,
      activeFlights: status ? 0 : 1420,
      safetyScore: status ? 100.0 : prev.safetyScore,
      surgeMultiplier: status ? 3.5 : 1.25
    }));
    showFeedback(status 
      ? "CRITICAL: Airspace holding pattern invoked. All airborne VTOLs commanded to nearest landing hub." 
      : "GRID RESET: Global airspace freeze resolved. Restoring typical flight paths."
    );
  };

  // Resolve active incident
  const handleMitigateIncident = (id: string, name: string) => {
    setIncidents(prev =>
      prev.map(inc => {
        if (inc.id === id) {
          return { ...inc, status: "mitigated", assignedTo: "Director Override Resolved" };
        }
        return inc;
      })
    );
    setGridState(prev => ({
      ...prev,
      safetyScore: Math.min(100.0, prev.safetyScore + 0.1),
      avgWaitTime: Math.max(1.5, prev.avgWaitTime - 0.5)
    }));
    showFeedback(`Incident RESOLVED successfully. Safety vectors for ${name} fully restored.`);
  };

  // Manual Dispatch flight execution
  const handleManualDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (dispatchOrigin === dispatchDest) {
      alert("Origin and destination hubs cannot be matching nodes.");
      return;
    }
    const newFlight: FlightRecord = {
      flightID: `FL-MAN-${Math.floor(10000 + Math.random() * 90000)}`,
      vehicleID: `VTOL-${Math.floor(2000 + Math.random() * 7999)}`,
      pilotMode: "AI",
      originHub: dispatchOrigin as any,
      destinationHub: dispatchDest as any,
      departureTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      arrivalTime: new Date(Date.now() + 18 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      flightDuration: 18,
      distance: 24.3,
      passengerCount: dispatchPax,
      airLaneUsed: "Lane-Express",
      averageAltitude: 350,
      energyConsumed: 45.4,
      status: "active"
    };

    setFlights([newFlight, ...flights]);
    setGridState(prev => ({
      ...prev,
      activeFlights: prev.activeFlights + 1,
      dailyPassengers: prev.dailyPassengers + dispatchPax,
      revenueToday: prev.revenueToday + (3520 * dispatchPax)
    }));
    showFeedback(`DISPATCHED: ${newFlight.flightID} issued custom clearance path ${dispatchOrigin} → ${dispatchDest}.`);
    setManualDispatchID("");
  };

  // Append Team collaboration comments
  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setComments([
      ...comments,
      {
        id: `c-${Date.now()}`,
        user: `HQ - Senior ${activeRole}`,
        text: newComment,
        time: "Just now"
      }
    ]);
    setNewComment("");
    showFeedback("SaaS collaboration comment broadcast to active sector team.");
  };

  // Computed Congestion density ratios values based on active wind configuration
  const totalGridCongestion = airspaceFreezeActive ? 5 : Math.round(52 + (windTolerance > 40 ? 15 : -8));

  return (
    <div className="space-y-6 animate-fade-in" id="operations-command-workspace">
      
      {/* Top operational status banner - Contextual awareness checklist */}
      <div className="bg-[#0b0f19] border border-slate-900 rounded-lg p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <h2 className="text-base font-bold text-white tracking-tight font-sans">
              Airspace Active Management Network (24/7 Command)
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl leading-normal font-sans">
            Real-time urban flight vectors across Mumbai Municipal Corridors. System health is currently operating at <span className="text-emerald-400 font-bold font-mono">{(gridState.safetyScore).toFixed(2)}% threshold safety margins</span>. Supplementary grids are fully synced.
          </p>
        </div>

        <div className="flex gap-2 shrink-0">
          <button 
            onClick={() => handleHaltOperations(!airspaceFreezeActive)}
            className={`px-3.5 py-1.5 rounded text-xs font-semibold cursor-pointer uppercase tracking-wider font-mono flex items-center gap-1.5 transition ${
              airspaceFreezeActive 
                ? "bg-emerald-900 border border-emerald-800 text-emerald-200" 
                : "bg-rose-950/40 hover:bg-rose-900 border border-rose-900/60 text-rose-350"
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            {airspaceFreezeActive ? "Deactivate Airspace Lock" : "Emergency HOLD ALL flights"}
          </button>
          
          <button
            onClick={() => {
              setWindTolerance(22);
              setAirspaceFreezeActive(false);
              showFeedback("Autopilot wind tolerances and lane algorithms reset to default benchmarks.");
            }}
            className="p-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-350 hover:text-white rounded transition cursor-pointer"
            title="Reset operational state"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {feedbackMsg && (
        <div className="bg-slate-950 border border-[#22d3ee]/40 text-slate-200 px-4 py-3.5 rounded text-xs font-mono select-none flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-[#22d3ee] shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Main Layout containing Map and the Role specific controllers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="dashboard-operational-grid">
        
        {/* LEFT COLUMN: Map Space (65% width equivalent) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#0b0f19] border border-slate-900 rounded-lg p-4 flex flex-col justify-between min-h-[500px]">
            
            {/* Map Header with quick layer controls */}
            <div className="flex justify-between items-center border-b border-slate-900 pb-3 flex-wrap gap-2 mb-3">
              <div>
                <span className="text-[9px] font-mono text-cyan-400 font-bold uppercase tracking-widest block">Operational Space View</span>
                <h3 className="font-bold text-white text-sm font-sans">
                  Live Mumbai SkyGrid 2D Space Commandant
                </h3>
              </div>

              {/* Layer Filters buttons */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-950 border border-slate-900 rounded text-[10.5px] font-mono font-semibold">
                <button 
                  onClick={() => setMapLayer(p => ({ ...p, corridors: !p.corridors }))}
                  className={`px-2 py-1 rounded transition ${mapLayer.corridors ? "bg-slate-900 text-cyan-400" : "text-slate-500"}`}
                >
                  Corridors
                </button>
                <button 
                  onClick={() => setMapLayer(p => ({ ...p, weather: !p.weather }))}
                  className={`px-2 py-1 rounded transition ${mapLayer.weather ? "bg-slate-900 text-cyan-400" : "text-slate-500"}`}
                >
                  Storms
                </button>
                <button 
                  onClick={() => setMapLayer(p => ({ ...p, congestions: !p.congestions }))}
                  className={`px-2 py-1 rounded transition ${mapLayer.congestions ? "bg-slate-900 text-cyan-400" : "text-slate-500"}`}
                >
                  Bottleneck Zones
                </button>
                <button 
                  onClick={() => setMapLayer(p => ({ ...p, incidentPins: !p.incidentPins }))}
                  className={`px-2 py-1 rounded transition ${mapLayer.incidentPins ? "bg-slate-900 text-rose-400" : "text-slate-500"}`}
                >
                  Alerts
                </button>
              </div>
            </div>

            {/* Interactive Vector SVG Map Drawer */}
            <div className="relative flex-grow bg-[#080b13] border border-slate-900/60 rounded flex items-center justify-center p-2 select-none overflow-hidden h-[340px]">
              
              {/* Climate rain grid overlays */}
              {mapLayer.weather && windTolerance > 40 && (
                <div className="absolute inset-0 bg-cyan-950/5 pointer-events-none border border-cyan-500/10">
                  <div className="absolute top-8 left-16 w-32 h-32 rounded-full bg-cyan-500/5 filter blur-xl animate-pulse" />
                  <div className="absolute top-24 right-20 w-44 h-44 rounded-full bg-slate-500/5 filter blur-2xl animate-pulse" />
                  
                  {/* Monsoon heavy droplets indicator */}
                  <div className="absolute top-3 left-4 p-1 rounded bg-[#0b0f19] border border-cyan-900/40 text-[9.5px] text-cyan-350 font-mono flex items-center gap-1 leading-none shadow-md">
                    <CloudRain className="w-3.5 h-3.5 text-cyan-400 animate-bounce" />
                    <span>L3 Monsoon Rain Cell Active</span>
                  </div>
                </div>
              )}

              {/* Congestion bottleneck radial overlays */}
              {mapLayer.congestions && !airspaceFreezeActive && (
                <>
                  {/* BKC bottleneck ring */}
                  <div className="absolute w-[80px] h-[80px] border border-rose-500/30 rounded-full bg-rose-500/10 animate-ping pointer-events-none" style={{ left: "305px", top: "155px" }} />
                  <div className="absolute w-[40px] h-[40px] border border-orange-500/40 rounded-full bg-orange-500/10 pointer-events-none" style={{ left: "325px", top: "175px" }} />
                  
                  {/* Dadar bottleneck ring */}
                  <div className="absolute w-[60px] h-[60px] border border-yellow-500/20 rounded-full bg-yellow-500/5 pointer-events-none" style={{ left: "245px", top: "215px" }} />
                </>
              )}

              {/* Central Map SVG canvas */}
              <svg className="w-full h-full text-slate-700 min-w-[500px]" viewBox="0 0 540 380" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.4))">
                <defs>
                  <linearGradient id="corridor-gradient-green" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#34d399" stopOpacity="0.1" />
                  </linearGradient>
                  <linearGradient id="corridor-gradient-red" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.15" />
                  </linearGradient>
                </defs>

                {/* Draw Corridor lanes lines */}
                {mapLayer.corridors && (
                  <>
                    {/* Lane 1: Colaba - Nariman Point */}
                    <path d="M 190 315 C 160 295, 150 280, 140 265 M 190 315" fill="none" stroke="#22d3ee" strokeWidth="2.5" strokeDasharray="5 5" className="animate-pulse" />
                    {/* Lane 2: Nariman Point - Dadar */}
                    <path d="M 140 265 Q 200 215 260 165" fill="none" stroke="#10b981" strokeWidth="1.5" strokeOpacity="0.6" />
                    {/* Lane 3: Dadar - Bandra BKC */}
                    <path d="M 260 165 C 285 145, 305 130, 330 115" fill="none" stroke="#f43f5e" strokeWidth="2.5" className="animate-pulse" />
                    <text x="300" y="130" fill="#f43f5e" fontSize="8" fontFamily="JetBrains Mono" fontWeight="bold">DENSE BOTTLENECK</text>
                    {/* Lane 4: Bandra - Juhu seafront */}
                    <path d="M 330 115 Q 280 85 230 55" fill="none" stroke="#10b981" strokeWidth="2" strokeOpacity="0.8" />
                    {/* Lane 5: Kurla cargo corridor to BKC */}
                    <path d="M 420 145 L 330 115" fill="none" stroke="#eab308" strokeWidth="1.5" />
                    {/* Lane 6: Andheri Commercial to Thane Gateway */}
                    <path d="M 320 40 L 490 25" fill="none" stroke="#10b981" strokeWidth="1" strokeOpacity="0.4" />
                  </>
                )}

                {/* Draw grid interactive nodes (Vertihubs) */}
                {Object.entries(HUBS_CONFIG).map(([key, point]) => {
                  // Re-scale coordinates to fit standard view
                  const cx = point.x;
                  const cy = point.y / 1.3 + 40; // slight scale compression
                  const isSelected = selectedHub === key;
                  
                  return (
                    <g key={key} className="cursor-pointer group" onClick={() => setSelectedHub(isSelected ? null : key)}>
                      {/* Pulse circle for key loaded stations */}
                      {point.load > 85 && (
                        <circle cx={cx} cy={cy} r="18" fill="none" stroke="#ef4444" strokeWidth="1" className="animate-ping" opacity="0.4" />
                      )}

                      {/* Base Hub container physical layout */}
                      <circle cx={cx} cy={cy} r={isSelected ? "11" : "8"} fill="#090d16" stroke={isSelected ? "#22d3ee" : point.load > 85 ? "#ef4444" : "#475569"} strokeWidth={isSelected ? "3" : "2"} />
                      <circle cx={cx} cy={cy} r="4" fill={point.load > 85 ? "#ef4444" : isSelected ? "#22d3ee" : "#94a3b8"} />
                      
                      {/* Label tooltip */}
                      <text x={cx + 12} y={cy + 4} fill={isSelected ? "#22d3ee" : point.load > 85 ? "#fca5a5" : "#f1f5f9"} fontSize="9.5" fontWeight={isSelected ? "bold" : "normal"} fontFamily="Inter" className="group-hover:fill-cyan-400 select-none">
                        {key} ({point.load}%)
                      </text>
                    </g>
                  );
                })}

                {/* Active alert indicator flags */}
                {mapLayer.incidentPins && incidents.filter(i => i.status !== "mitigated").map((inc, i) => {
                  const xCoord = inc.id === "INC-9382" ? 340 : inc.id === "INC-8830" ? 480 : 180;
                  const yCoord = inc.id === "INC-9382" ? 140 : inc.id === "INC-8830" ? 75 : 320;
                  return (
                    <g key={inc.id} className="animate-bounce">
                      <polygon points={`${xCoord},${yCoord} ${xCoord-5},${yCoord+14} ${xCoord+5},${yCoord+14}`} fill="#f43f5e" />
                      <circle cx={xCoord} cy={yCoord + 14} r="3" fill="#f43f5e" />
                      <line x1={xCoord} y1={yCoord+4} x2={xCoord} y2={yCoord+10} stroke="white" strokeWidth="1.5" />
                    </g>
                  );
                })}
              </svg>

              {/* Absolute Side overlays matching the specific node inspection details */}
              {selectedHub && (
                <div className="absolute bottom-3 left-3 bg-[#0d1321] border border-slate-800 p-3.5 rounded-lg max-w-[245px] space-y-2 text-xs shadow-2xl animate-scale-up select-text">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-white text-[13px]">{selectedHub} SkyPort</h4>
                      <p className="text-[10px] text-cyan-400 font-mono font-medium">{HUBS_CONFIG[selectedHub]?.type}</p>
                    </div>
                    <button onClick={() => setSelectedHub(null)} className="text-slate-500 hover:text-white px-1 leading-none text-[15px]">×</button>
                  </div>
                  <div className="space-y-1.5 font-sans leading-relaxed text-slate-400 text-[11px]">
                    <p>Current Port Load capacity is at <strong className="text-white font-mono">{HUBS_CONFIG[selectedHub]?.load}%</strong> peak congestion index.</p>
                    <p className="font-mono text-[9.5px] border-t border-slate-850 pt-1.5">Nesting Slot: 4 online / 1 ready<br />Grid Power Draw: 850 kW/h<br />Commuters waiting: ~45 pax</p>
                  </div>
                  <button 
                    onClick={() => {
                      handleRerouteSector("Lane-Express", selectedHub);
                      setSelectedHub(null);
                    }}
                    className="w-full uppercase text-[9.5px] font-mono tracking-wider bg-slate-900 border border-slate-850 hover:border-[#22d3ee]/40 py-1.5 rounded text-slate-300 hover:text-[#22d3ee] font-bold text-center cursor-pointer transition"
                  >
                    Recalibrate Airport Slots
                  </button>
                </div>
              )}

              {/* Floating Quick Navigation Stats Overlay */}
              <div className="absolute top-3 right-3 bg-slate-950/90 border border-slate-900 px-3 py-2 rounded text-[10px] font-mono space-y-1 text-slate-400">
                <div className="flex justify-between gap-6">
                  <span>AIRSPACE DENSITY:</span>
                  <strong className="text-slate-200">{totalGridCongestion}%</strong>
                </div>
                <div className="flex justify-between gap-6">
                  <span>ACTIVE PLANES:</span>
                  <strong className="text-[#22d3ee]">{gridState.activeFlights} units</strong>
                </div>
                <div className="flex justify-between gap-6">
                  <span>CLIMATE:</span>
                  <strong className="text-orange-400">Monsoon shear</strong>
                </div>
              </div>

            </div>

            {/* Bottom mini-control logs block */}
            <div className="pt-3 border-t border-slate-900 flex justify-between items-center flex-wrap gap-2 text-[10.5px] font-mono text-slate-450 select-none">
              <span>SIMULATION CONTROLLER RATIO:</span>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => { setSimulationSpeed(0.5); showFeedback("Simulation clock throttled to 0.5x standard flow."); }}
                  className={`px-1.5 py-0.5 rounded ${simulationSpeed === 0.5 ? "bg-slate-850 text-[#22d3ee]" : "hover:text-slate-250"}`}
                >
                  0.5x
                </button>
                <button 
                  onClick={() => { setSimulationSpeed(1.0); showFeedback("Simulation clock calibrated to 1.0x standard speed."); }}
                  className={`px-1.5 py-0.5 rounded ${simulationSpeed === 1.0 ? "bg-slate-850 text-[#22d3ee]" : "hover:text-slate-250"}`}
                >
                  1.0x
                </button>
                <button 
                  onClick={() => { setSimulationSpeed(2.0); showFeedback("Simulation clock boosted to 2.0x warp flow."); }}
                  className={`px-1.5 py-0.5 rounded ${simulationSpeed === 2.0 ? "bg-slate-850 text-[#22d3ee]" : "hover:text-slate-250"}`}
                >
                  2.0x
                </button>
                <span className="text-slate-600 pl-2">|</span>
                <span className="text-[#22d3ee] animate-pulse pl-1 font-bold">● LIVE UPDATES LOG</span>
              </div>
            </div>

          </div>

          {/* LOWER TWO-COLUMN SPLIT: 1. Dispatch Center Form, 2. Live Active Incidents List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Box 1: Manual Flight Dispatch (Enterprise operations tool) */}
            <div className="bg-[#0b0f19] border border-slate-900 rounded-lg p-4 flex flex-col justify-between space-y-4">
              <div>
                <h4 className="font-bold text-white text-xs uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Send className="w-4 h-4 text-[#22d3ee]" /> Dispatch Office Control Desk
                </h4>
                <p className="text-[11px] text-slate-400 mt-1">
                  Draft flight schedules manually and issue system routing waivers directly to the central autopilot flight grid.
                </p>
              </div>

              <form onSubmit={handleManualDispatch} className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-500 font-mono font-bold uppercase block">Origin Station</label>
                    <select 
                      value={dispatchOrigin}
                      onChange={(e) => setDispatchOrigin(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-900 text-slate-350 p-2 rounded focus:outline-none"
                    >
                      {Object.keys(HUBS_CONFIG).map(h => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-500 font-mono font-bold uppercase block">Target Terminal</label>
                    <select 
                      value={dispatchDest}
                      onChange={(e) => setDispatchDest(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-900 text-slate-350 p-2 rounded focus:outline-none"
                    >
                      {Object.keys(HUBS_CONFIG).map(h => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-500 font-mono font-bold uppercase block">Seats Occupancy</label>
                    <input 
                      type="number" 
                      min="1" 
                      max="6" 
                      value={dispatchPax}
                      onChange={(e) => setDispatchPax(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-900 text-slate-350 p-2 rounded focus:outline-none focus:border-cyan-400 font-mono text-center"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-500 font-mono font-bold uppercase block">Authorized Token</label>
                    <input 
                      type="text" 
                      disabled
                      placeholder="MUM-AUTO-CLEAR" 
                      className="w-full bg-slate-950/60 border border-slate-900 text-slate-600 p-2 rounded focus:outline-none font-mono text-center cursor-not-allowed text-[11px]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-slate-900 hover:bg-[#1a2e45] text-white hover:text-[#22d3ee] rounded border border-slate-800 hover:border-[#22d3ee]/30 transition text-xs font-bold font-mono uppercase tracking-wider cursor-pointer mt-1"
                >
                  Broadcast Flight Clearance
                </button>
              </form>
            </div>

            {/* Box 2: Active incident list & mitigation buttons */}
            <div className="bg-[#0b0f19] border border-slate-900 rounded-lg p-4 flex flex-col justify-between space-y-3">
              <div>
                <h4 className="font-bold text-white text-xs uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-450 text-rose-400" /> Active Incidents Dispatch Desk
                </h4>
                <p className="text-[11px] text-slate-400 mt-1">
                  Track ongoing climate and hardware anomalies. Mitigate threats directly to sustain safe operational safety scores.
                </p>
              </div>

              <div className="space-y-2 max-h-[175px] overflow-y-auto pr-1">
                {incidents.filter(inc => inc.status !== "mitigated").length === 0 ? (
                  <div className="p-4 text-center border border-dashed border-slate-850 rounded text-xs text-slate-500 font-mono">
                    ✓ All air lanes optimal. No active incidents log.
                  </div>
                ) : (
                  incidents.filter(inc => inc.status !== "mitigated").map((inc) => (
                    <div key={inc.id} className="bg-[#080b13] border border-slate-900 rounded p-2.5 space-y-1.5 text-left text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-mono text-[10px] font-bold text-rose-400 flex items-center gap-1">
                          <span className={`w-1.5 h-1.5 rounded-full ${inc.severity === "critical" ? "bg-rose-500 animate-ping" : "bg-orange-500"}`} />
                          {inc.id}
                        </span>
                        <span className="text-[9px] text-slate-500 font-mono">{inc.timestamp}</span>
                      </div>
                      <h5 className="font-bold text-white leading-tight font-sans text-[11px]">{inc.title}</h5>
                      <p className="text-[10px] text-slate-400 leading-normal font-sans line-clamp-1">{inc.description}</p>
                      
                      <div className="flex justify-between items-center pt-1">
                        <span className="text-[9px] text-slate-500 font-mono">Assignee: {inc.assignedTo}</span>
                        <button 
                          onClick={() => handleMitigateIncident(inc.id, inc.title)}
                          className="px-2 py-0.5 bg-slate-900 hover:bg-emerald-950 border border-slate-850 hover:border-emerald-800 text-slate-300 hover:text-emerald-400 font-semibold text-[10px] rounded transition cursor-pointer font-mono"
                        >
                          Resolve & Clear
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* 7-Day Forecasting Chart Block (Sustains advanced prediction aesthetics) */}
          <div className="bg-[#0b0f19] border border-slate-900 rounded-lg p-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
              <div>
                <h4 className="font-bold text-white text-xs uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-[#22d3ee]" /> Predictive Commuter Loading & Threshold Capacity
                </h4>
                <p className="text-[11px] text-slate-400 mt-1 font-sans">
                  Deep intelligence machine-learning modeling. Blue Line forecasts demand curves based on upcoming monsoon forecasts.
                </p>
              </div>
              <div className="flex gap-4 text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-700" /> Historic Commuters
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#22d3ee]" /> AI Forecast Density
                </span>
              </div>
            </div>

            <div className="h-48 w-full pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={demandForecast} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <XAxis dataKey="time" stroke="#475569" fontSize={9.5} tickLine={false} fontFamily="JetBrains Mono" />
                  <YAxis stroke="#475569" fontSize={9.5} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: "#0b0f19", border: "1px solid #1e293b", fontSize: "10.5px" }} />
                  <Area type="monotone" dataKey="baselineDemand" name="Historic Commuters" stroke="#475569" strokeWidth={1} fill="#1e293b" fillOpacity={0.15} />
                  <Area type="monotone" dataKey="predictedDemand" name="AI Forecast Loading" stroke="#22d3ee" strokeWidth={1.5} fill="#0d9488" fillOpacity={0.10} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Enterprise Role Cockpit Console & Actions Panel (35% width equivalent) */}
        <div className="space-y-6">
          
          {/* Box 1: Dynamic Role Custom Cockpit (Updates based on parent activeRole) */}
          <div className="bg-[#0b0f19] border border-slate-900 rounded-lg p-5 space-y-4">
            
            {/* Top title showing the specific focus of the selected role */}
            <div className="border-b border-slate-900 pb-3">
              <span className="text-[9px] font-mono text-[#22d3ee] font-bold uppercase tracking-widest block">Role-Based Dashboard Integration</span>
              <h3 className="font-bold text-white text-sm font-sans flex items-center gap-1.5 mt-0.5">
                <UserCheck className="w-4 h-4 text-cyan-400" /> 
                {activeRole} Active Desk
              </h3>
              <p className="text-[11px] text-slate-400 mt-1 leading-normal font-sans">
                Tailored security permissions, operational metrics, and command triggers configured for your security profile.
              </p>
            </div>

            {/* Dynamic cockpit view routing matching the current SaaS role */}
            {activeRole === "Executive VP (Strategic Finance)" && (
              <div className="space-y-4 text-xs font-sans animate-fade-in">
                <div className="bg-slate-950 p-3 rounded space-y-2 border border-slate-900">
                  <span className="text-[9.5px] font-mono uppercase text-slate-500 font-bold block">Consolidated Ledger Revenue Indicators</span>
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="bg-slate-900/60 p-2 rounded">
                      <p className="text-[10px] text-slate-500 uppercase font-semibold">Today's Billing</p>
                      <h5 className="font-mono text-white text-[13px] font-bold mt-0.5">₹{(gridState.revenueToday / 100000).toFixed(2)}L</h5>
                    </div>
                    <div className="bg-slate-900/60 p-2 rounded">
                      <p className="text-[10px] text-slate-400 uppercase font-semibold text-[#22d3ee]">Active Surge</p>
                      <h5 className="font-mono text-[#22d3ee] text-[13px] font-bold mt-0.5">{gridState.surgeMultiplier.toFixed(2)}x</h5>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 text-slate-400 leading-normal">
                  <p className="text-[11px]"><strong>Strategic Guidance:</strong> Surges indices have increased naturally to manage high BKC booking density. High climate overhead keeps overall flight profit yields slightly depressed.</p>
                </div>

                <div className="space-y-1 border-t border-slate-900 pt-3">
                  <button 
                    onClick={() => {
                      alert("Secured Executive Environmental CO2 Report generated. Broadcast sent to Mumbai Ministry.");
                      showFeedback("SEC Environmental Compliance Report dispatched. Transmitted safely.");
                    }}
                    className="w-full text-center bg-cyan-950/20 hover:bg-cyan-900/30 border border-cyan-800/40 hover:border-cyan-500 text-[#22d3ee] py-2 rounded text-[11px] font-mono tracking-wider font-semibold cursor-pointer uppercase transition"
                  >
                    Generate ESG & SEC Compliance Report
                  </button>
                </div>
              </div>
            )}

            {activeRole === "Operations Director (All Active Flows)" && (
              <div className="space-y-4 text-xs font-sans animate-fade-in">
                <div className="space-y-2">
                  <label className="text-[10px] text-slate-500 font-mono font-bold uppercase block">Climate Wind Tolerance Safety Bounds</label>
                  <div className="flex justify-between items-center text-slate-300 font-mono text-[11px]">
                    <span>Standard Limit:</span>
                    <strong className="text-cyan-400">{windTolerance} km/h</strong>
                  </div>
                  <input 
                    type="range" 
                    min="15" 
                    max="75" 
                    value={windTolerance}
                    onChange={(e) => {
                      setWindTolerance(Number(e.target.value));
                      if (Number(e.target.value) > 55) {
                        setGridState(p => ({ ...p, safetyScore: Math.max(90, p.safetyScore - 0.4) }));
                      }
                    }}
                    className="w-full h-1 bg-slate-950 rounded accent-cyan-400 cursor-pointer"
                  />
                  <span className="text-[9.5px] text-slate-500 block leading-tight">
                    Higher wind tolerance increases route capacity but decreases general automated safety coefficients.
                  </span>
                </div>

                <div className="space-y-2 border-t border-slate-900 pt-3">
                  <span className="text-[9.5px] font-mono text-slate-500 uppercase font-bold block">Autopilot Corridor Configuration</span>
                  <div className="grid grid-cols-2 gap-1.5 font-mono text-[10px]">
                    <button 
                      onClick={() => showFeedback("Autopilot configured to: Traditional Hub-Spoke. Central Dadar routing active.")}
                      className="p-1.5 bg-slate-950 border border-slate-900 hover:border-slate-800 rounded text-slate-350"
                    >
                      Hub & Spoke
                    </button>
                    <button 
                      onClick={() => {
                        setWindTolerance(38);
                        showFeedback("Autopilot configured to: Sectorized Mesh routing. Grid load distributed safely.");
                      }}
                      className="p-1.5 bg-slate-950 border border-slate-900 hover:border-cyan-500/40 rounded text-[#22d3ee] font-semibold"
                    >
                      Sectorized Mesh
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeRole === "Fleet Supervisor (VTOL Maintenance)" && (
              <div className="space-y-4 text-xs font-sans animate-fade-in">
                <div className="bg-slate-950 p-3 rounded space-y-2 border border-slate-900">
                  <span className="text-[9.5px] font-mono text-slate-505 text-slate-500 font-bold block">Power & Charging Slot Status</span>
                  <div className="space-y-1 font-mono text-[10.5px] text-slate-400">
                    <div className="flex justify-between">
                      <span>Dadar Fast Chargers:</span>
                      <span className="text-white">5 / 6 Occupied</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-900 rounded overflow-hidden">
                      <div className="bg-cyan-500 h-full rounded" style={{ width: "83%" }} />
                    </div>
                    <div className="flex justify-between pt-1">
                      <span>Colaba Solar Array:</span>
                      <span className="text-emerald-400">Generative (850kW)</span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    alert("Waiver dispatched. All non-active VTOL lithium cycles logged for telemetry update.");
                    showFeedback("Lithium battery diagnostics broadcast completed.");
                  }}
                  className="w-full text-center bg-slate-950 hover:bg-slate-900 border border-slate-900 hover:border-slate-800 text-slate-200 py-2 rounded text-[11px] font-mono tracking-wider font-semibold cursor-pointer uppercase transition"
                >
                  Schedule Telemetry Diagnostics
                </button>
              </div>
            )}

            {activeRole === "Principal Safety Officer" && (
              <div className="space-y-4 text-xs font-sans animate-fade-in">
                <div className="p-3 bg-rose-950/20 border border-rose-900/30 rounded text-[11px] text-rose-300 leading-normal space-y-1.5">
                  <span className="font-bold font-mono text-[9.5px] uppercase text-rose-400 block tracking-wider">CRITICAL INCIDENT AUDIT CHECKLIST</span>
                  <p>Check spatial buffer parameters.Autopilot wind limits set: <strong className="text-white">{windTolerance} km/h</strong>.</p>
                  <p>In the event of communication failures over Juhu Bay, override pilot auto mode with the control prompt below.</p>
                </div>

                <button 
                  onClick={() => {
                    setWindTolerance(20);
                    showFeedback("Auto-pilot systems forced to safety maximum standards. Peak wind ceilings capped at 20km/h.");
                  }}
                  className="w-full text-center bg-rose-900 hover:bg-rose-950 text-white border border-rose-800 py-2 rounded text-[11px] font-mono tracking-wider font-bold cursor-pointer uppercase transition"
                >
                  Enforce strict wind safety protocol
                </button>
              </div>
            )}

            {activeRole === "Quantum Data Analyst" && (
              <div className="space-y-4 text-xs font-sans animate-fade-in">
                <div className="space-y-2">
                  <span className="text-[9.5px] font-mono uppercase text-slate-500 font-bold block">Dynamic DAX Modeler console</span>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Write or edit custom DAX formulas below to evaluate grid operations metrics. Run compiler to audit safety logic constraints.
                  </p>
                  <code className="text-emerald-400 font-mono text-[10px] block bg-slate-950 p-2.5 rounded leading-normal border border-slate-900 whitespace-pre">
                    {`Verify_Traffic_Spacing = \nDIVIDE(\n  SUM(Fact_Flight_Operations[Distance]),\n  COUNT(Fact_Flight_Operations[FlightID]),\n  0\n)`}
                  </code>
                </div>

                <button 
                  onClick={() => {
                    showFeedback("DAX Custom semantic equation compiled. No parsing warnings found.");
                  }}
                  className="w-full text-center bg-cyan-950/20 hover:bg-[#1a2d42] border border-cyan-900/40 text-[#22d3ee] py-2 rounded text-[11px] font-mono tracking-wider font-semibold cursor-pointer uppercase transition"
                >
                  Compile Semantic Equation
                </button>
              </div>
            )}

            {activeRole === "Systems Administrator (RBAC Security)" && (
              <div className="space-y-4 text-xs font-sans animate-fade-in">
                <div className="bg-slate-950 p-3 rounded space-y-2 border border-slate-900">
                  <span className="text-[9.5px] font-mono uppercase text-slate-500 font-bold block">Authorization Keys Tracker</span>
                  <div className="space-y-2 text-[10.5px] font-mono text-slate-450">
                    <div className="flex justify-between items-center">
                      <span>Multi-Tenant Tenants:</span>
                      <strong className="text-white">Mumbai Municipal, MMRDA</strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Live OAuth Client Scopes:</span>
                      <strong className="text-emerald-400">Grid.FullAccess</strong>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <button 
                    onClick={() => {
                      alert("Grid JWT Access Keys rotated. Active SaaS sessions invalidated safely.");
                      showFeedback("OAuth Client Security Keys rotated successfully.");
                    }}
                    className="w-full text-center bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 py-2 rounded text-[11px] font-mono tracking-wider font-semibold cursor-pointer uppercase transition"
                  >
                    Force Rotate OAuth Token Key
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* Box 2: Collaboration Workspace Comments (SaaS highlight feature) */}
          <div className="bg-[#0b0f19] border border-slate-900 rounded-lg p-5 space-y-4 flex flex-col justify-between h-[280px]">
            <div className="space-y-2">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider font-mono flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-cyan-400" /> Sector Team Comments Desk
              </h4>
              <p className="text-[11px] text-slate-400 font-sans">
                Real-time commentary linked directly with other dispatch operatives active on this workspace tenant ID.
              </p>
            </div>

            {/* Comments list scrolling container */}
            <div className="flex-grow overflow-y-auto space-y-2.5 max-h-[120px] pr-1.5 pt-1 border-t border-slate-900 text-left">
              {comments.map((c) => (
                <div key={c.id} className="text-[11px] leading-relaxed">
                  <div className="flex justify-between items-center font-mono text-[9.5px] text-slate-500 mb-0.5">
                    <strong className="text-slate-300 font-bold">{c.user}</strong>
                    <span>{c.time}</span>
                  </div>
                  <p className="text-slate-400 pl-2 border-l border-cyan-800/60 font-sans">{c.text}</p>
                </div>
              ))}
            </div>

            {/* Input comment draft */}
            <form onSubmit={handlePostComment} className="flex gap-1 border-t border-slate-900 pt-3">
              <input 
                type="text" 
                placeholder="Broadcast brief workspace brief..." 
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="bg-slate-950 border border-slate-900 text-xs p-2 rounded text-slate-200 focus:outline-none w-full"
              />
              <button 
                type="submit"
                className="p-2 bg-slate-900 hover:bg-slate-800 rounded border border-slate-800 text-[#22d3ee] cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          {/* Box 3: Secure Audit Trail (Simulating high-density enterprise trails) */}
          <div className="bg-[#0b0f19] border border-slate-900 rounded-lg p-4 font-mono text-[10px] text-slate-500 space-y-2.5 text-left select-none">
            <span className="text-[9px] font-bold text-[#22d3ee] uppercase block tracking-widest">
              SYSTEM AUDIT TRAILS LOG (MMRDA TENANT)
            </span>
            <div className="space-y-1.5 leading-relaxed max-h-[75px] overflow-y-auto">
              <p>• <span className="text-slate-400">13:14:02</span> OP-CHAKRABORTY updated windTolerance bounds</p>
              <p>• <span className="text-slate-400">13:12:45</span> incident INC-8830 state → "investigating"</p>
              <p>• <span className="text-slate-400">13:10:12</span> auth-service authorized auto-pilot clearance tokens</p>
              <p>• <span className="text-slate-300">13:08:44</span> database.Fact_Flight_Operations committed transaction</p>
            </div>
            <p className="text-[8.5px] text-slate-600 border-t border-slate-900/60 pt-1.5">
              Secure ledger SHA-256 integrity signature validated.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
