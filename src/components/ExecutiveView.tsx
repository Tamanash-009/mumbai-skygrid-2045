import React, { useMemo } from "react";
import { 
  Users, DollarSign, ShieldCheck, Activity, AlertTriangle, 
  ArrowUpRight, ArrowDownRight, TrendingUp, Calendar, Download, Eye, Globe2
} from "lucide-react";
import { SmartGridState, FlightRecord } from "../types";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

interface ExecutiveViewProps {
  gridState: SmartGridState;
  flights: FlightRecord[];
}

export default function ExecutiveView({ gridState, flights }: ExecutiveViewProps) {
  // Chart data: hourly flight telemetry logs
  const performanceTrendData = [
    { hour: "08:00", activeVolume: 380, passengers: 1200, revenue: 15400 },
    { hour: "10:00", activeVolume: 540, passengers: 1980, revenue: 28900 },
    { hour: "12:00", activeVolume: 410, passengers: 1350, revenue: 18400 },
    { hour: "14:00", activeVolume: 490, passengers: 1620, revenue: 21900 },
    { hour: "16:00", activeVolume: 720, passengers: 2580, revenue: 39500 },
    { hour: "18:00", activeVolume: 940, passengers: 3410, revenue: 54100 },
    { hour: "20:00", activeVolume: 650, passengers: 2100, revenue: 31000 },
    { hour: "22:00", activeVolume: 420, passengers: 1150, revenue: 17200 },
  ];

  // Derived metrics
  const activeAICount = flights.filter(f => f.pilotMode === "AI").length;
  const congestionIndex = useMemo(() => {
    return Math.round(Math.min(96, (gridState.activeFlights / 25) + (gridState.avgWaitTime * 6)));
  }, [gridState.activeFlights, gridState.avgWaitTime]);

  const activeFlightsTodayColor = "text-[#22d3ee]";

  return (
    <div className="space-y-6 text-slate-100 font-sans" id="executive-command-root">
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-5" id="executive-header">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 uppercase tracking-widest">
            <Globe2 className="w-4 h-4 text-slate-400" />
            Control Center / Operations Core
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white leading-tight">
            Executive Command Suite
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed max-w-xl">
            Real-time operations platform tracking commercial airmobility traffic, revenue, and active fleet telemetry across Mumbai's regional drone corridors.
          </p>
        </div>

        {/* Global Toolbar Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs bg-[#111827] border border-slate-800 text-slate-350 px-3 py-2 rounded-lg flex items-center gap-2 font-mono" id="header-date">
            <Calendar className="w-4 h-4 text-slate-400" />
            UTC: 2026-06-01
          </span>
          <button 
            className="text-xs bg-[#111827] hover:bg-slate-800 text-slate-200 hover:text-white px-3.5 py-2 rounded-lg border border-slate-800 flex items-center gap-2 font-medium transition cursor-pointer"
            id="export-metrics-btn"
          >
            <Download className="w-4 h-4" />
            Export snapshot
          </button>
        </div>
      </div>

      {/* TOP SECTION: EXECUTIVE KPI OVERVIEW (12-column grid scale) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4" id="executive-kpis">
        
        {/* KPI 1: Passengers Today */}
        <div className="bg-[#0d1321] border border-slate-800 rounded-lg p-4 flex flex-col justify-between shadow-sm hover:border-slate-700 transition" id="kpi-card-passengers">
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-slate-400">Passengers Today</span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-900/40 flex items-center gap-0.5 font-bold">
                <ArrowUpRight className="w-3 h-3" />
                14.2%
              </span>
            </div>
            <div className="flex items-baseline gap-2 pt-1">
              <span className="text-2xl font-bold font-mono tracking-tight text-white">
                {gridState.dailyPassengers.toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">commuters</span>
            </div>
          </div>
          
          {/* Sparkline */}
          <div className="h-8 mt-3 flex items-end">
            <svg className="w-full h-full text-emerald-400" viewBox="0 0 100 25" preserveAspectRatio="none">
              <path d="M0 24 Q15 20, 30 18 T60 8 T85 14 T100 2" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <p className="text-[10px] text-slate-500 font-mono mt-2 flex justify-between">
            <span>Trend: Growing Outflow</span>
            <span>Est: 21,500</span>
          </p>
        </div>

        {/* KPI 2: Revenue */}
        <div className="bg-[#0d1321] border border-slate-800 rounded-lg p-4 flex flex-col justify-between shadow-sm hover:border-slate-700 transition" id="kpi-card-revenue">
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-slate-400">Revenue Today</span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-900/40 flex items-center gap-0.5 font-bold">
                <ArrowUpRight className="w-3 h-3" />
                11.8%
              </span>
            </div>
            <div className="flex items-baseline gap-2 pt-1">
              <span className="text-2xl font-bold font-mono tracking-tight text-white">
                ₹{(gridState.revenueToday).toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">INR</span>
            </div>
          </div>
          
          {/* Sparkline */}
          <div className="h-8 mt-3 flex items-end">
            <svg className="w-full h-full text-emerald-400" viewBox="0 0 100 25" preserveAspectRatio="none">
              <path d="M0 24 L20 18 L40 22 L60 12 L80 8 L100 2" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <p className="text-[10px] text-slate-500 font-mono mt-2 flex justify-between">
            <span>Surge: {gridState.surgeMultiplier}x scale</span>
            <span>Target: ₹30L</span>
          </p>
        </div>

        {/* KPI 3: Congestion Index */}
        <div className="bg-[#0d1321] border border-slate-800 rounded-lg p-4 flex flex-col justify-between shadow-sm hover:border-slate-700 transition" id="kpi-card-congestion">
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-slate-400">Congestion Index</span>
              <span className="text-[10px] font-mono text-amber-400 bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-900/40 flex items-center gap-0.5 font-bold">
                <ArrowUpRight className="w-3 h-3" />
                3.1%
              </span>
            </div>
            <div className="flex items-baseline gap-2 pt-1">
              <span className="text-2xl font-bold font-mono tracking-tight text-white">
                {congestionIndex}%
              </span>
              <span className="text-[10px] text-slate-500 font-mono">capacity</span>
            </div>
          </div>
          
          {/* Sparkline */}
          <div className="h-8 mt-3 flex items-end">
            <svg className="w-full h-full text-amber-400" viewBox="0 0 100 25" preserveAspectRatio="none">
              <path d="M0 6 L15 10 L35 4 L60 18 L80 12 L100 19" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <p className="text-[10px] text-slate-500 font-mono mt-2 flex justify-between">
            <span>Peak Sector: Dadar Hub</span>
            <span>Stable Threshold: 85%</span>
          </p>
        </div>

        {/* KPI 4: Safety Score */}
        <div className="bg-[#0d1321] border border-slate-800 rounded-lg p-4 flex flex-col justify-between shadow-sm hover:border-slate-700 transition" id="kpi-card-safety">
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-slate-400">Safety Score</span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-900/40 flex items-center gap-0.5 font-bold">
                Optimal
              </span>
            </div>
            <div className="flex items-baseline gap-2 pt-1">
              <span className="text-2xl font-bold font-mono tracking-tight text-white">
                {gridState.safetyScore}%
              </span>
              <span className="text-[10px] text-slate-500 font-mono">index</span>
            </div>
          </div>
          
          {/* Sparkline */}
          <div className="h-8 mt-3 flex items-end">
            <svg className="w-full h-full text-emerald-400" viewBox="0 0 100 25" preserveAspectRatio="none">
              <path d="M0 12 L20 12 L40 12 L60 12 L80 12 L100 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <p className="text-[10px] text-slate-500 font-mono mt-2 flex justify-between">
            <span>Active Alerts: None critical</span>
            <span>Goal: 100.0%</span>
          </p>
        </div>

        {/* KPI 5: Fleet Utilization */}
        <div className="bg-[#0d1321] border border-slate-800 rounded-lg p-4 flex flex-col justify-between shadow-sm hover:border-slate-700 transition" id="kpi-card-utilization">
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-slate-400">Fleet Utilization</span>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 flex items-center gap-0.5">
                Target Met
              </span>
            </div>
            <div className="flex items-baseline gap-2 pt-1">
              <span className="text-2xl font-bold font-mono tracking-tight text-white">
                {gridState.fleetUtilization}%
              </span>
              <span className="text-[10px] text-slate-500 font-mono">active</span>
            </div>
          </div>
          
          {/* Sparkline */}
          <div className="h-8 mt-3 flex items-end">
            <svg className="w-full h-full text-[#22d3ee]" viewBox="0 0 100 25" preserveAspectRatio="none">
              <path d="M0 15 L20 12 L40 14 L60 10 L80 11 L100 8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <p className="text-[10px] text-slate-500 font-mono mt-2 flex justify-between">
            <span>Rotor Inductance: Safe</span>
            <span>Optimal Range: 80-90%</span>
          </p>
        </div>

      </div>

      {/* Flagship Hero Operational Narrative Section */}
      <div className="bg-[#0d1321] border border-slate-800 rounded-lg p-5" id="operations-narrative-container">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-semibold text-white tracking-normal flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#22d3ee] shrink-0" />
              Active Airspace System Status
            </h2>
            <p className="text-xs text-slate-400">Automated multi-node diagnostics log generated instantly for regional grid directors</p>
          </div>
          <span className="bg-emerald-950/30 text-emerald-400 border border-emerald-800/30 text-[10px] font-mono px-2.5 py-1 rounded">
            OPERATING WITHIN NOMINAL BENCHMARKS
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 text-sm leading-relaxed text-slate-300">
          <div className="space-y-2 border-r border-slate-800/40 pr-0 md:pr-4">
            <p className="font-semibold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#22d3ee]" />
              Demand Corridor Fluidity
            </p>
            <p className="text-xs text-slate-300 leading-relaxed">
              Mumbai SkyGrid integrates telemetry directly from active high-altitude lanes. The major corridor density is around {gridState.peakSector}, aggregating roughly {Math.round(gridState.activeFlights * 0.42)} active transits. Decentralized scheduling modules are filtering non-priority cargo VTOL routes, preventing hub lockups.
            </p>
          </div>
          <div className="space-y-2">
            <p className="font-semibold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Meteorology Mitigation Advisory
            </p>
            <p className="text-xs text-slate-300 leading-relaxed">
              Air lanes are influenced by the dynamic monsoon pattern (<span className="text-amber-400">{gridState.weather}</span>). All aircraft have updated rotor configurations for high atmospheric pressure. Auto-orbit overrides are currently active around coastal lanes, guaranteeing safe vehicle separation.
            </p>
          </div>
        </div>
      </div>

      {/* ANALYTICS SECTION: TRANSFORM CHARTS INTO STORIES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="analytics-section-root">
        
        {/* Core Chart Widget */}
        <div className="lg:col-span-2 bg-[#0d1321] border border-slate-800 rounded-lg p-5 flex flex-col justify-between" id="performance-chart-card">
          <div className="space-y-1 mb-4">
            <span className="text-[10px] font-mono text-[#22d3ee] tracking-wider uppercase font-semibold">Corridor Commute Traffic</span>
            <h3 className="text-lg font-bold text-white tracking-normal">Air Traffic Growth Trend</h3>
            <p className="text-xs text-slate-400">Simultaneous tracking of active aerial vehicles and aggregate commuter loads.</p>
          </div>

          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceTrendData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorActiveVolume" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPassengersGroup" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1d263b" opacity={0.3} />
                <XAxis dataKey="hour" stroke="#475569" fontSize={10} fontFamily="JetBrains Mono" tickLine={false} />
                <YAxis stroke="#475569" fontSize={10} fontFamily="JetBrains Mono" tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0b0f19", border: "1px solid #1e293b", borderRadius: "8px", fontSize: "11px", color: "#f8fafc" }}
                  labelStyle={{ color: "#22d3ee", fontWeight: "bold" }}
                />
                <Area type="monotone" dataKey="activeVolume" name="Active VTOLs" stroke="#22d3ee" strokeWidth={1.5} fillOpacity={1} fill="url(#colorActiveVolume)" />
                <Area type="monotone" dataKey="passengers" name="Passengers" stroke="#818cf8" strokeWidth={1.5} fillOpacity={1} fill="url(#colorPassengersGroup)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ANALYTICAL STORY COMPONENT (Title, Description, Insight, Forecast, Risk Level) */}
        <div className="bg-[#0d1321] border border-slate-800 rounded-lg p-5 flex flex-col justify-between" id="chart-analytical-story">
          <div className="space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-amber-500 uppercase font-semibold">Storytelling Analytics</span>
              <h3 className="text-lg font-bold text-white tracking-normal">Air Traffic Growth</h3>
              <p className="text-xs text-slate-400">Analytical breakdown modeling commercial aerial pathways</p>
            </div>

            <div className="space-y-3.5 pt-2">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 font-mono tracking-wider uppercase font-bold">Current Standing</span>
                <p className="text-base font-bold text-white leading-tight">
                  +18% cumulative commuter surge during monsoon periods.
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 font-mono tracking-wider uppercase font-bold font-bold">Description</span>
                <p className="text-xs text-slate-350 leading-relaxed">
                  Active transport limits correlate directly with terrestrial road lockdowns near the Bandra-Worli Sea Link during flooding.
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 font-mono tracking-wider uppercase font-bold">Grid Insight</span>
                <p className="text-xs text-slate-350 leading-relaxed">
                  Commuters shifted safely from premium corporate plans to emergency on-demand reservations, maintaining low passenger exit times of <span className="text-white font-bold">{gridState.avgWaitTime} minutes</span>.
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 font-mono tracking-wider uppercase font-bold">Forward Forecast</span>
                <p className="text-xs text-[#22d3ee] font-semibold leading-relaxed">
                  +22% demand growth projected next quarter. Recommend expanding recharging nests near Dadar.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between mt-4">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
              <span>Risk:</span>
              <span className="text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-900/40 text-[10px] font-bold uppercase">
                Medium Risk
              </span>
            </div>
            <button className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 font-medium transition">
              <Eye className="w-3.5 h-3.5" />
              View calculations
            </button>
          </div>
        </div>

      </div>

      {/* FLIGHT TRANSIT OPERATIONS DATABASE TABLE - Responsive & Collapse cards for Mobile */}
      <div className="bg-[#0d1321] border border-slate-800 rounded-lg p-5" id="flights-database-ledger">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
          <div>
            <h3 className="text-lg font-bold text-white tracking-normal">Airmobility Active Dispatch Ledger</h3>
            <p className="text-xs text-slate-400">Current real-time flight telemetry trace details under active smart matrix supervision</p>
          </div>
          <p className="text-xs font-mono text-slate-400">
            Showing <span className="text-slate-200 font-semibold">{flights.slice(0, 6).length}</span> active routes
          </p>
        </div>

        {/* Large Screen Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300 border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono text-[10px] uppercase">
                <th className="py-3 px-3">Flight ID</th>
                <th className="py-3 px-3">Vehicle ID</th>
                <th className="py-3 px-3">Pilot Mode</th>
                <th className="py-3 px-3">Origin</th>
                <th className="py-3 px-3">Destination</th>
                <th className="py-3 px-3">Time Scale</th>
                <th className="py-3 px-3">Altitude</th>
                <th className="py-3 px-3 text-right">Operational Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {flights.slice(0, 6).map((f) => (
                <tr key={f.flightID} id={`flight-row-${f.flightID}`} className="hover:bg-slate-900/30 transition">
                  <td className="py-3 px-3 font-mono font-semibold text-white">{f.flightID}</td>
                  <td className="py-3 px-3 font-mono text-slate-400">{f.vehicleID}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                      f.pilotMode === "AI" ? "bg-cyan-950 text-cyan-400 border border-cyan-900/50" : "bg-slate-800 text-slate-400"
                    }`}>
                      {f.pilotMode}
                    </span>
                  </td>
                  <td className="py-3 px-3">{f.originHub}</td>
                  <td className="py-3 px-3">{f.destinationHub}</td>
                  <td className="py-3 px-3 font-mono text-slate-450">{f.departureTime} - {f.arrivalTime}</td>
                  <td className="py-3 px-3 font-mono text-slate-400">{f.averageAltitude}m</td>
                  <td className="py-3 px-3 text-right">
                    <span className="inline-flex items-center gap-1.5 capitalize text-[11px] font-semibold">
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        f.status === "completed" ? "bg-emerald-500" : f.status === "delayed" ? "bg-amber-500" : "bg-cyan-500"
                      }`} />
                      {f.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile touch-friendly card stack (Aids Responsive Layout converting tables on smaller screens) */}
        <div className="grid grid-cols-1 gap-3 md:hidden" id="mobile-flights-stack">
          {flights.slice(0, 5).map((f) => (
            <div key={f.flightID} className="bg-slate-900/50 border border-slate-800 rounded-lg p-3 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-mono font-bold text-[#22d3ee]">{f.flightID}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                  f.pilotMode === "AI" ? "bg-cyan-900/30 text-cyan-400 border border-cyan-800/30" : "bg-slate-800 text-slate-400"
                }`}>
                  {f.pilotMode}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-slate-400">
                <div>
                  <span className="text-[9px] uppercase font-mono block">Terminal Path</span>
                  <span className="text-white text-[11px] font-medium">{f.originHub} → {f.destinationHub}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-mono block">Operational Status</span>
                  <span className="inline-flex items-center gap-1 capitalize text-white font-semibold">
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      f.status === "completed" ? "bg-emerald-500" : f.status === "delayed" ? "bg-amber-500" : "bg-cyan-500"
                    }`} />
                    {f.status}
                  </span>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-800/60 flex justify-between items-center text-[10px] text-slate-500 font-mono">
                <span>Vehicle: {f.vehicleID}</span>
                <span>Altitude: {f.averageAltitude}m</span>
              </div>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
}
