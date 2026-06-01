import React, { useState } from "react";
import { ShieldCheck, Calendar, Wind, CloudRain, ShieldAlert, Sparkles, Activity, Clock, Eye } from "lucide-react";
import { SmartGridState } from "../types";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

interface SafetyViewProps {
  gridState: SmartGridState;
}

export default function SafetyView({ gridState }: SafetyViewProps) {
  const [selectedWeatherImpact, setSelectedWeatherImpact] = useState<"Heavy Rainfall" | "Clear Sky" | "High Altitude Turbulence" | "Extreme Cyclone">("Heavy Rainfall");
  const [activeManualOverrides, setActiveManualOverrides] = useState<number>(14);

  // Incidents history by type over weeks
  const incidentHistory = [
    { type: "Yaw Deviation", count: 8, resolutionMins: 12 },
    { type: "Thermal Surge", count: 3, resolutionMins: 18 },
    { type: "Signal Jitter", count: 12, resolutionMins: 4 },
    { type: "GPS Sync Loss", count: 4, resolutionMins: 8 },
    { type: "Stator Override", count: 1, resolutionMins: 32 },
  ];

  // Specific reports of recent alerts
  const loggedIncidentList = [
    { id: "INC-93021", lane: "Lane-Coastal", type: "Yaw Drift Warning", severity: "Minor", status: "Resolved", action: "Pilot shifted to grid autonomous pathing" },
    { id: "INC-93019", lane: "Lane-Express", type: "Thermal Battery Surge", severity: "Moderate", status: "Auto-Routed", action: "VTOL landed safely at Dadar charging nest" },
    { id: "INC-93018", lane: "Lane-A1", type: "Signal Jitter Loss", severity: "Minor", status: "Resolved", action: "Dynamic antenna booster realignment initiated" },
  ];

  // Predictive accident probability engine logic
  const calculateSafetyAccidentProbability = () => {
    let prob = 1.05; // Base probability in percentage
    if (selectedWeatherImpact === "High Altitude Turbulence") prob += 1.25;
    if (selectedWeatherImpact === "Heavy Rainfall") prob += 2.10;
    if (selectedWeatherImpact === "Extreme Cyclone") prob += 5.80;

    // Manual overrides impact
    prob += (activeManualOverrides * 0.15);

    return Math.round(prob * 100) / 100;
  };

  const calculatedProb = calculateSafetyAccidentProbability();

  return (
    <div className="space-y-6 text-slate-100 font-sans" id="safety-compliance-root">
      
      {/* Title & Banner area */}
      <div className="border-b border-slate-800 pb-5" id="safety-title-section">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 uppercase tracking-widest">
          <ShieldCheck className="w-4 h-4 text-slate-450" />
          Aviation Safety Board / Collision Avoidance Logs
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white mt-1 leading-tight">
          Safety & Regulatory Compliance
        </h1>
        <p className="text-sm text-slate-400 mt-2 max-w-xl leading-relaxed">
          Monitor minor telemetry flight anomalies, execute safety predictor forecasting matrices, and view autonomous rescue dispatcher units.
        </p>
      </div>

      {/* Primary Indicators Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="safety-analytics-row">
        
        {/* Incident Resolution Recharts Chart with storytelling */}
        <div className="lg:col-span-2 bg-[#0d1321] border border-slate-800 rounded-lg p-5 flex flex-col justify-between" id="incident-resolution-card">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
            <div>
              <h3 className="text-lg font-bold text-white tracking-normal font-sans">
                Incident Response Performance Register
              </h3>
              <p className="text-xs text-slate-400">
                Weekly occurrence rates of telemetry drift anomalies mapped against automated resolution times (minutes)
              </p>
            </div>
            <span className="bg-[#111c2a] text-[#22d3ee] border border-slate-800 font-mono text-[10px] px-2.5 py-1 rounded font-bold whitespace-nowrap">
              SAFETY RATING: {gridState.safetyScore}%
            </span>
          </div>

          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={incidentHistory} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1d263b" opacity={0.3} />
                <XAxis dataKey="type" stroke="#475569" fontSize={10} fontFamily="JetBrains Mono" tickLine={false} />
                <YAxis stroke="#475569" fontSize={10} fontFamily="JetBrains Mono" tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0b0f19", border: "1px solid #1e293b", borderRadius: "8px", fontSize: "11px", color: "#f8fafc" }}
                  labelStyle={{ color: "#22d3ee", fontWeight: "bold" }}
                />
                <Bar dataKey="count" name="Incidents Logged" fill="#cbd5e1" radius={[2, 2, 0, 0]} />
                <Bar dataKey="resolutionMins" name="Avg Restore Time (Min)" fill="#22d3ee" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Emergency Response KPI panel (Tesla inspired) */}
        <div className="bg-[#0d1321] border border-slate-800 rounded-lg p-5 flex flex-col justify-between" id="emergency-response-panel">
          <div>
            <h3 className="text-lg font-bold text-white tracking-normal font-sans mb-3">
              Emergency Response Units
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Autonomous search-and-rescue copter vectors staged across Mumbai skies
            </p>

            <div className="space-y-3.5">
              <div className="bg-slate-900/35 p-3.5 rounded border border-slate-800/80 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-500 font-mono uppercase font-semibold">Average Response Time</p>
                  <p className="text-xl font-bold text-white font-sans mt-0.5">4.2 Minutes</p>
                </div>
                <Clock className="w-5 h-5 text-[#22d3ee] shrink-0" />
              </div>

              <div className="bg-slate-900/35 p-3.5 rounded border border-slate-800/80 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-500 font-mono uppercase font-semibold">Resolution Rate</p>
                  <p className="text-xl font-bold text-emerald-400 font-sans mt-0.5">99.98%</p>
                </div>
                <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
              </div>

              <div className="bg-slate-900/35 p-3.5 rounded border border-slate-800/80 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-500 font-mono uppercase font-semibold">Staged Airborne Assets</p>
                  <p className="text-xl font-bold text-white font-sans mt-0.5">45 Units Active</p>
                </div>
                <Activity className="w-5 h-5 text-purple-400 shrink-0" />
              </div>
            </div>
          </div>

          <p className="font-mono text-[9px] text-slate-550 uppercase pt-4 border-t border-slate-800 mt-4 flex items-center gap-1.5 leading-none">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            REGULATORY SAFETY OVERLAYS ACTIVE
          </p>
        </div>

      </div>

      {/* Live Incidents & AI Predictor Sandbox */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="safety-logistics-sandbox">
        
        {/* Safety log list ledger */}
        <div className="lg:col-span-2 bg-[#0d1321] border border-slate-800 rounded-lg p-5">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-bold text-white font-sans tracking-normal">Direct Safety Log Tracer</h3>
              <p className="text-xs text-slate-400">Resolved telemetry abnormalities and corrective autopilot overrides</p>
            </div>
            <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" />
          </div>

          <div className="space-y-3">
            {loggedIncidentList.map((inc) => (
              <div key={inc.id} className="flex flex-col p-3 bg-slate-900/35 hover:bg-slate-900/60 border border-slate-800/80 hover:border-slate-705 transition rounded text-xs space-y-1.5">
                <div className="flex justify-between items-center text-slate-300">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[#22d3ee] font-semibold">{inc.id}</span>
                    <span className="text-slate-600">|</span>
                    <span className="font-mono text-slate-400">{inc.lane}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[9.5px] font-bold border ${
                    inc.severity === "Critical" ? "bg-rose-950 text-rose-300 border-rose-900/30" : "bg-amber-950 text-amber-300 border border-amber-900/30"
                  }`}>
                    {inc.severity}
                  </span>
                </div>
                <p className="font-bold text-slate-200">{inc.type}</p>
                <div className="flex justify-between text-[11px] text-slate-455 font-sans italic border-t border-slate-850/60 pt-1">
                  <span>Action: {inc.action}</span>
                  <span className="text-emerald-400 font-mono font-bold uppercase">{inc.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Predictor slider control widget */}
        <div className="bg-[#0d1321] border border-slate-800 rounded-lg p-5 flex flex-col justify-between relative overflow-hidden" id="accident-predictor-sandbox">
          <div className="space-y-4 z-10">
            <div className="space-y-1">
              <span className="text-[9px] text-[#22d3ee] font-mono flex items-center gap-1 uppercase tracking-wider font-bold">
                <Sparkles className="w-3.5 h-3.5 text-[#22d3ee]" />
                Neural Safety Modeler
              </span>
              <h3 className="text-lg font-bold text-white font-sans tracking-normal">Incident Predictor Lab</h3>
              <p className="text-xs text-slate-400">Evaluate collision incident limits under weather changes & manual override operations</p>
            </div>

            {/* Weather condition */}
            <div className="space-y-1.5 text-xs">
              <label className="text-slate-400 font-mono text-[10px] uppercase font-bold">Atmospheric Weather Factor</label>
              <select
                value={selectedWeatherImpact}
                onChange={(e: any) => setSelectedWeatherImpact(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 py-1.5 px-2.5 rounded text-xs focus:outline-none cursor-pointer outline-none font-sans"
              >
                <option value="Clear Sky">Clear Skies (Balanced lift vectors)</option>
                <option value="High Altitude Turbulence">High Altitude Wind Sheer Overlays</option>
                <option value="Heavy Rainfall">Monsoon Heavy Overcast (Microburst hazard)</option>
                <option value="Extreme Cyclone">Extreme Coastal Cyclone (Severe limit warning)</option>
              </select>
            </div>

            {/* Manual override slide */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between items-center">
                <label className="text-slate-400 font-mono text-[10px] uppercase font-bold">Manual Pilot Overrides</label>
                <span className="text-rose-450 font-mono font-bold text-[10px]">{activeManualOverrides}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="40"
                value={activeManualOverrides}
                onChange={(e) => setActiveManualOverrides(parseInt(e.target.value))}
                className="w-full h-1 bg-slate-950 rounded appearance-none cursor-pointer accent-[#22d3ee]"
              />
              <div className="flex justify-between text-[9px] text-slate-550 font-mono">
                <span>0% (Fully Autonomous)</span>
                <span>40% (Manual Drift)</span>
              </div>
            </div>

            {/* Output Calculation widgets */}
            <div className="bg-[#0a0f1d] border border-slate-850 p-4 rounded text-center space-y-1">
              <span className="text-[10px] text-slate-500 font-mono uppercase font-semibold">ESTIMATED SYSTEM INCIDENT HAZARD RATIO</span>
              <p className={`text-3xl font-mono font-black pt-1 leading-none ${
                calculatedProb > 4.5 ? "text-rose-500" : calculatedProb > 2.0 ? "text-amber-500" : "text-emerald-450"
              }`}>
                {calculatedProb}%
              </p>
              <p className={`text-[10px] font-mono uppercase font-bold block pt-1 ${
                calculatedProb > 4.5 ? "text-rose-500" : "text-emerald-450"
              }`}>
                {calculatedProb > 4.5 ? "INCIDENT HEIGHT LIMIT TRIGGERED" : "Nominal limits active"}
              </p>
            </div>

          </div>

          <p className="text-[9px] text-[#475569] font-mono uppercase pt-4 border-t border-slate-850 mt-4 text-right">
            Bayesian risk projection models active
          </p>
        </div>

      </div>

    </div>
  );
}
