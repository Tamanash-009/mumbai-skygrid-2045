import React, { useState, useEffect } from "react";
import { Zap, BatteryCharging, Wrench, ShieldAlert, Sparkles, Fan, Activity, AlertTriangle, Sliders, Settings } from "lucide-react";
import { TelemetryRecord } from "../types";
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

interface FleetViewProps {
  telemetry: TelemetryRecord[];
}

export default function FleetView({ telemetry }: FleetViewProps) {
  const [selectedVehicle, setSelectedVehicle] = useState<string>("VTOL-2004");
  const [diagnosticsStatorWear, setDiagnosticsStatorWear] = useState<number>(34); // %
  const [chargingFrequency, setChargingFrequency] = useState<number>(8); // charges/day

  // Diagnostic parameters index map
  const activeVehicleTelemetryIdx = telemetry.find(t => t.vehicleID === selectedVehicle) || telemetry[0];

  // Derive battery cycles based on health factor dynamically
  const getCyclesForVehicle = (t: TelemetryRecord) => {
    return Math.round((100 - t.batteryHealth) * 9.5 + 140);
  };

  // State hooks for Predictive Maintenance Analyzer
  const [pmTemp, setPmTemp] = useState<number>(activeVehicleTelemetryIdx.motorTemp);
  const [pmSignal, setPmSignal] = useState<number>(activeVehicleTelemetryIdx.signalStrength);
  const [pmCycles, setPmCycles] = useState<number>(getCyclesForVehicle(activeVehicleTelemetryIdx));
  const [showOrderToast, setShowOrderToast] = useState<boolean>(false);
  const [dispatchSuccessMsg, setDispatchSuccessMsg] = useState<string>("");

  useEffect(() => {
    setPmTemp(activeVehicleTelemetryIdx.motorTemp);
    setPmSignal(activeVehicleTelemetryIdx.signalStrength);
    setPmCycles(getCyclesForVehicle(activeVehicleTelemetryIdx));
  }, [selectedVehicle, activeVehicleTelemetryIdx]);

  const calcFailureProbability = (temp: number, sig: number, cycles: number) => {
    const tempCont = Math.max(0, (temp - 40) * 1.55);
    const sigCont = Math.max(0, (-sig - 50) * 1.75);
    const cyclesCont = Math.max(0, (cycles - 100) * 0.18);
    const scoreSum = tempCont + sigCont + cyclesCont;
    return Math.min(99.6, Math.max(1.5, Math.round(scoreSum * 10) / 10));
  };

  const calculatedFailureProb = calcFailureProbability(pmTemp, pmSignal, pmCycles);

  // Derive urgency score (0-100)
  let pmUrgencyScore = Math.round(calculatedFailureProb * 0.95);
  if (pmTemp > 78 || pmSignal < -80) {
    pmUrgencyScore = Math.min(100, pmUrgencyScore + 15);
  }

  let pmUrgencyColor = "text-emerald-450";
  let pmBgColor = "bg-emerald-950/20 border-emerald-900/30 text-emerald-400";
  let recommendedWindow = "Routine Multi-point Audit (Next 30 Days)";

  if (pmUrgencyScore >= 75) {
    pmUrgencyColor = "text-rose-500 font-bold";
    pmBgColor = "bg-rose-950/40 border-rose-900/40 text-rose-400";
    recommendedWindow = "IMMEDIATE GROUNDING & EMERGENCY RUNTIME REFIT";
  } else if (pmUrgencyScore >= 45) {
    pmUrgencyColor = "text-amber-500";
    pmBgColor = "bg-amber-950/20 border-amber-900/30 text-amber-400";
    recommendedWindow = "Expedited Field Overhaul (Next 12 Hours)";
  } else if (pmUrgencyScore >= 18) {
    pmUrgencyColor = "text-cyan-400";
    pmBgColor = "bg-cyan-950/20 border-[#22d3ee]/20 text-[#22d3ee]";
    recommendedWindow = "Scheduled Flight Check (Within 72 Hours)";
  }

  const getDynamicRecommendations = (temp: number, sig: number, cycles: number) => {
    const recs = [];
    if (temp > 72) {
      recs.push({
        title: "Liquid Coolant Flushing",
        desc: "Inductor coils temperature is reporting high levels. Coolant pressure adjustments are recommended."
      });
    }
    if (sig < -75) {
      recs.push({
        title: "Transceiver Realignment",
        desc: "RF signal attenuation noticed on local sector receivers. Calibrate primary sub-carrier bands."
      });
    }
    if (cycles > 300) {
      recs.push({
        title: "Anode Re-ionization Model",
        desc: "Power cell cycle limits exceeded. Conduct graphene layer re-ionization diagnostic tests."
      });
    }
    if (recs.length === 0) {
      recs.push({
        title: "Standard Diagnostics Sync",
        desc: "Operations are fully nominal. Synchronize cloud flight telemetry logs safely."
      });
    }
    return recs;
  };

  const activeRecommendations = getDynamicRecommendations(pmTemp, pmSignal, pmCycles);

  const handleDispatchOrder = () => {
    setShowOrderToast(true);
    setDispatchSuccessMsg(`Proactive Service Order triggered for ${selectedVehicle}. Sched range: ${recommendedWindow}`);
    setTimeout(() => {
      setShowOrderToast(false);
    }, 5000);
  };

  // Map of battery deterioration vs operational hours (Scatter plot representation)
  const scatterBatteryData = telemetry.map((t, idx) => ({
    vehicle: t.vehicleID,
    operatingHours: Math.round(120 + (idx * 45) + (Math.random() * 20)),
    batteryHealth: t.batteryHealth,
    motorTemp: t.motorTemp,
  }));

  const calculateEstimatedRULCycles = () => {
    let baseRul = activeVehicleTelemetryIdx.batteryHealth * 9.2;
    baseRul -= (diagnosticsStatorWear * 1.55);
    baseRul -= (chargingFrequency * 4.2);
    return Math.max(Math.round(baseRul), 0);
  };

  const calculatedRUL = calculateEstimatedRULCycles();

  return (
    <div className="space-y-6 text-slate-100 font-sans" id="fleet-intelligence-root">
      
      {/* Page Title & Header Banner */}
      <div className="border-b border-slate-800 pb-5">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 uppercase tracking-widest">
          <Settings className="w-4 h-4 text-slate-450" />
          Engineering Division / Airframe Diagnostics Log
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white mt-1 leading-tight">
          Fleet Diagnostics & Prognostics
        </h1>
        <p className="text-sm text-slate-400 mt-2 max-w-xl leading-relaxed">
          Predict component exhaustion, monitor real-time battery degradation scatter ranges, and submit proactive maintenance dispatch orders.
        </p>
      </div>

      {/* Primary Telemetry & Maintenance Reporting metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="fleet-telemetry-row">
        
        {/* Scatter Chart degradation plot with story layout */}
        <div className="lg:col-span-2 bg-[#0d1321] border border-slate-800 rounded-lg p-5 flex flex-col justify-between" id="battery-degradation-card">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
            <div>
              <h3 className="text-lg font-bold text-white tracking-normal font-sans">
                Fleet Battery Capacity Log
              </h3>
              <p className="text-xs text-slate-400">
                Scatter analysis correlating total flight logs (hours) with active battery cell capacity metrics
              </p>
            </div>
            <span className="bg-[#111c2a] text-[#22d3ee] border border-slate-800 font-mono text-[10px] px-2.5 py-1 rounded font-bold whitespace-nowrap">
              LOGGED NODES: {telemetry.length}
            </span>
          </div>

          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 0, left: -25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1d263b" opacity={0.3} />
                <XAxis type="number" dataKey="operatingHours" name="Operating Hours" stroke="#475569" fontSize={10} fontFamily="JetBrains Mono" tickLine={false} />
                <YAxis type="number" dataKey="batteryHealth" name="Battery Capacity" stroke="#475569" fontSize={10} fontFamily="JetBrains Mono" tickLine={false} />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }}
                  contentStyle={{ backgroundColor: "#0b0f19", border: "1px solid #1e293b", borderRadius: "8px", fontSize: "11px", color: "#f8fafc" }}
                />
                <Scatter name="VTOL Fleets" data={scatterBatteryData} fill="#22d3ee" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Maintenance Log quick lists */}
        <div className="bg-[#0d1321] border border-slate-800 rounded-lg p-5 flex flex-col justify-between" id="maintenance-summary-panel">
          <div>
            <h3 className="text-lg font-bold text-white tracking-normal font-sans mb-3">
              Maintenance Indicators
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Real-time structural health thresholds monitoring active fleet stator cells
            </p>

            <div className="space-y-3">
              <div className="p-3 bg-slate-900/35 rounded border border-slate-800/80 flex justify-between items-center text-xs">
                <div className="flex items-center gap-2.5">
                  <Wrench className="w-4 h-4 text-[#22d3ee] shrink-0" />
                  <div>
                    <p className="font-semibold text-slate-200">Pending Refit Overhauls</p>
                    <p className="text-[10px] text-slate-500 font-mono">Battery parameters below 70% limit</p>
                  </div>
                </div>
                <span className="font-mono font-bold text-[#22d3ee] text-sm">4 Vehicles</span>
              </div>

              <div className="p-3 bg-slate-900/35 rounded border border-slate-800/80 flex justify-between items-center text-xs">
                <div className="flex items-center gap-2.5">
                  <BatteryCharging className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <p className="font-semibold text-slate-200">Fast-Charging Queue</p>
                    <p className="text-[10px] text-slate-500 font-mono">Dadar Central Hub active slots</p>
                  </div>
                </div>
                <span className="font-mono font-bold text-emerald-400 text-sm">18 Units</span>
              </div>

              <div className="p-3 bg-slate-900/35 rounded border border-slate-800/80 flex justify-between items-center text-xs">
                <div className="flex items-center gap-2.5">
                  <ShieldAlert className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <p className="font-semibold text-slate-200">Critical Core Alerts</p>
                    <p className="text-[10px] text-slate-400 font-mono">Core heat limits exceeding 82°C</p>
                  </div>
                </div>
                <span className="font-mono font-bold text-emerald-500 text-sm">0 Status</span>
              </div>
            </div>
          </div>

          <p className="font-mono text-[9px] text-slate-500 uppercase pt-4 border-t border-slate-800/60 mt-4 flex items-center gap-1 leading-none">
            <Activity className="w-4 h-4 text-[#22d3ee]" />
            DIAGNOSTICS PROTOCOL STRETCHED NORMAL
          </p>
        </div>

      </div>

      {/* RUL Predictive workbench sandbox */}
      <div className="bg-[#0d1321] border border-slate-800 rounded-lg p-5" id="rul-sandbox">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          
          <div className="lg:col-span-2 space-y-4">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-[#22d3ee] font-mono uppercase tracking-wider mb-1 font-bold">
                <Sliders className="w-4 h-4" />
                Remaining Useful Life Estimator Sandbox
              </div>
              <h3 className="text-lg font-bold text-white tracking-normal font-sans">
                Core Stator Exhaustion Modeler
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
                Interrogate particular airframes to compute remaining service cycles. Adjust simulated stator friction wear index and daily fast-charge frequency to customize preventive override timelines.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-900/35 p-4 rounded border border-slate-800/80 text-xs">
              
              <div className="space-y-1.5">
                <label className="text-slate-400 font-mono text-[10px] uppercase font-bold">Registration Mark ID</label>
                <select
                  value={selectedVehicle}
                  onChange={(e) => setSelectedVehicle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 py-1.5 px-2 rounded font-mono text-xs focus:outline-none cursor-pointer outline-none"
                >
                  {telemetry.slice(0, 5).map((t) => (
                    <option key={t.vehicleID} value={t.vehicleID}>{t.vehicleID} ({t.sensorStatus === "Optimal" ? "Optimal" : "Alert"})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-slate-400 font-mono text-[10px] uppercase font-bold">Stator Friction Wear</label>
                  <span className="text-[#22d3ee] font-mono font-bold text-[10px]">{diagnosticsStatorWear}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="80"
                  value={diagnosticsStatorWear}
                  onChange={(e) => setDiagnosticsStatorWear(parseInt(e.target.value))}
                  className="w-full h-1 bg-slate-900 rounded appearance-none cursor-pointer accent-[#22d3ee]"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-slate-400 font-mono text-[10px] uppercase font-bold">Charger Rate/Day</label>
                  <span className="text-[#22d3ee] font-mono font-bold text-[10px]">{chargingFrequency} slots</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="16"
                  value={chargingFrequency}
                  onChange={(e) => setChargingFrequency(parseInt(e.target.value))}
                  className="w-full h-1 bg-slate-900 rounded appearance-none cursor-pointer accent-[#22d3ee]"
                />
              </div>

            </div>
          </div>

          <div className="p-4 rounded-lg bg-[#0a0f1d] border border-slate-800 flex flex-col items-center justify-center text-center space-y-4">
            <div className="space-y-1 text-center">
              <span className="font-mono text-slate-500 text-[10px] uppercase font-semibold">ESTIMATED REMAINING USEFUL LIFE (RUL)</span>
              <p className={`text-4xl font-mono font-black leading-none pt-1 ${
                calculatedRUL > 400 ? "text-emerald-400" : calculatedRUL > 200 ? "text-amber-500" : "text-rose-500"
              }`}>
                {calculatedRUL} Cycles
              </p>
              <p className="text-[10px] font-mono text-slate-400 pt-1">
                Airframe battery capacity: <strong className="text-white">{activeVehicleTelemetryIdx.batteryHealth}%</strong>
              </p>
            </div>

            <div className="p-2.5 bg-[#0c111e] rounded border border-slate-850 text-xs text-slate-400 leading-normal italic min-h-[58px] flex items-center justify-center">
              {calculatedRUL > 400 
                ? "Engineering Diagnostic: Comfortable operating margins. Continuous battery cells structural health is highly optimal. Stator overhaul scheduled routine."
                : calculatedRUL > 200 
                ? "Engineering Diagnostic: Moderate deterioration. Service threshold approaching. Maintain schedule on off-peak cycles."
                : "Engineering Diagnostic: Safe margins exhausted. Safe flight overrides active. Commend instant physical tow grounding immediately."}
            </div>
          </div>

        </div>
      </div>

      {/* Advanced prognostic Stress simulator */}
      <div className="bg-[#0d1321] border border-slate-800 rounded-lg p-5 relative overflow-hidden" id="pm-matrix">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-850 pb-4 mb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-rose-450 font-mono text-xs uppercase tracking-wider font-bold">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              Machine Learning Prognostics Terminal
            </div>
            <h2 className="text-xl font-bold text-white tracking-normal font-sans">
              AI Component Fracture Prognostic Suite
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
              Real-time prediction model projecting structural component failure probability based on stress variables (motor temperature, signal attenuation, and total cycles).
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded text-[11px] font-mono text-slate-350 shrink-0 select-none">
            Selected Frame: <strong className="text-[#22d3ee] font-bold">{selectedVehicle}</strong>
          </div>
        </div>

        {/* Prognostic Control dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
          
          {/* Inputs Column */}
          <div className="lg:col-span-5 space-y-4 bg-slate-900/30 p-4 rounded border border-slate-800/80 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-[#22d3ee]" /> Tune Stressor Inputs
                </span>
                <button
                  onClick={() => {
                    setPmTemp(activeVehicleTelemetryIdx.motorTemp);
                    setPmSignal(activeVehicleTelemetryIdx.signalStrength);
                    setPmCycles(getCyclesForVehicle(activeVehicleTelemetryIdx));
                  }}
                  className="text-[9.5px] font-mono text-[#22d3ee] hover:text-white transition uppercase font-bold tracking-tight bg-slate-950/60 px-2 py-0.5 rounded border border-slate-800 cursor-pointer"
                >
                  Reset parameters
                </button>
              </div>

              {/* Stress Temp */}
              <div className="space-y-1 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-350 flex items-center gap-1.5"><Fan className="w-3.5 h-3.5 text-slate-450" /> Motor Temperature</span>
                  <span className={`font-mono font-bold ${pmTemp > 75 ? "text-rose-500" : "text-white"}`}>{pmTemp}°C</span>
                </div>
                <input
                  type="range"
                  min="35"
                  max="110"
                  value={pmTemp}
                  onChange={(e) => setPmTemp(parseInt(e.target.value))}
                  className="w-full h-1 bg-slate-950 rounded appearance-none cursor-pointer accent-[#22d3ee]"
                />
                <div className="flex justify-between text-[9px] text-[#475569] font-mono">
                  <span>35°C (Balanced)</span>
                  <span>75°C (Threshold)</span>
                  <span>110°C (Limit)</span>
                </div>
              </div>

              {/* Stress Signal */}
              <div className="space-y-1 text-xs pt-1">
                <div className="flex justify-between items-center">
                  <span className="text-slate-350 flex items-center gap-1.5"><Activity className="w-3.5 h-3.5 text-slate-450" /> Signal Strength</span>
                  <span className={`font-mono font-bold ${pmSignal < -78 ? "text-rose-500" : "text-white"}`}>{pmSignal} dBm</span>
                </div>
                <input
                  type="range"
                  min="-95"
                  max="-30"
                  value={pmSignal}
                  onChange={(e) => setPmSignal(parseInt(e.target.value))}
                  className="w-full h-1 bg-slate-950 rounded appearance-none cursor-pointer accent-[#22d3ee]"
                />
                <div className="flex justify-between text-[9px] text-[#475569] font-mono">
                  <span>-95 dBm (Attenuated)</span>
                  <span>-65 dBm (Nominal)</span>
                  <span>-30 dBm (Direct gain)</span>
                </div>
              </div>

              {/* Stress Cycles */}
              <div className="space-y-1 text-xs pt-1">
                <div className="flex justify-between items-center">
                  <span className="text-slate-350 flex items-center gap-1.5"><BatteryCharging className="w-3.5 h-3.5 text-slate-450" /> Battery Discharge Cycles</span>
                  <span className={`font-mono font-bold ${pmCycles > 380 ? "text-rose-500" : "text-white"}`}>{pmCycles} cycles</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="550"
                  value={pmCycles}
                  onChange={(e) => setPmCycles(parseInt(e.target.value))}
                  className="w-full h-1 bg-slate-950 rounded appearance-none cursor-pointer accent-[#22d3ee]"
                />
                <div className="flex justify-between text-[9px] text-[#475569] font-mono">
                  <span>20 c (Mint status)</span>
                  <span>300 c (Half-life spec)</span>
                  <span>550 c (Exhausted spec)</span>
                </div>
              </div>

            </div>

            <p className="text-[10px] text-[#475569] leading-normal pt-2 italic font-sans">
              Prognostics calculations perform Bayesian heuristics mapping load stress to degradation indices.
            </p>
          </div>

          {/* Outputs Column */}
          <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Probability Output card */}
            <div className="bg-slate-950/60 p-4 border border-slate-850 rounded flex flex-col justify-between space-y-4">
              <div className="space-y-1.5">
                <span className="text-[9px] text-[#475569] font-mono uppercase tracking-wider block font-bold">Calculated Breakdown Probability</span>
                <div className="flex items-baseline gap-2 pt-1">
                  <p className={`text-4xl font-mono font-black ${
                    calculatedFailureProb > 70 ? "text-rose-500" : calculatedFailureProb > 40 ? "text-amber-500" : "text-emerald-400"
                  }`}>
                    {calculatedFailureProb}%
                  </p>
                  <span className={`text-[9.5px] font-mono uppercase px-2 py-0.5 rounded font-bold border ${
                    calculatedFailureProb > 70 
                      ? "bg-rose-950/40 border-rose-900/40 text-rose-400" 
                      : calculatedFailureProb > 40 
                      ? "bg-amber-950/30 border-amber-900/30 text-amber-400" 
                      : "bg-emerald-950/30 border-emerald-900/30 text-emerald-400"
                  }`}>
                    {calculatedFailureProb > 70 ? "CRITICAL" : calculatedFailureProb > 40 ? "ELEVATED" : "OPTIMAL"}
                  </span>
                </div>
              </div>

              {/* Progress bar visualizer */}
              <div className="w-full bg-[#0a0f1d] rounded-full h-2 overflow-hidden border border-slate-800">
                <div 
                  className={`h-full transition-all duration-300 ${
                    calculatedFailureProb > 70 
                      ? "bg-rose-500" 
                      : calculatedFailureProb > 40 
                      ? "bg-amber-500" 
                      : "bg-emerald-400"
                  }`} 
                  style={{ width: `${calculatedFailureProb}%` }} 
                />
              </div>

              {/* Dynamic Warning alerts description text block */}
              <div className={`p-3 rounded border text-[10.5px] font-sans leading-relaxed flex items-start gap-2 ${pmBgColor}`}>
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold uppercase tracking-wide block text-[10px] mb-0.5">Automated ML Diagnostics Report</span>
                  Calculated stressors represent {
                    calculatedFailureProb > 70 
                      ? "severe operational exhaustion. Immediate component fractures projected over air lockouts. Sched direct tow parameters." 
                      : calculatedFailureProb > 45 
                      ? "gradual electromagnetic component shifts. Stabilities protected but schedule preventative overhaul soon." 
                      : "nominal operational thresholds. Thermal coils, stators, and cell arrays are balanced and fully steady."
                  }
                </div>
              </div>
            </div>

            {/* Recommender Control window card */}
            <div className="bg-slate-950/60 p-4 border border-slate-850 rounded flex flex-col justify-between space-y-4">
              <div className="space-y-1.5">
                <span className="text-[9px] text-[#475569] font-mono uppercase tracking-wider block font-bold">Recommended Service window</span>
                <p className={`text-[10.5px] font-mono uppercase text-center border p-2 rounded font-bold ${
                  pmUrgencyScore >= 75 
                    ? "bg-rose-950/40 border-rose-900/40 text-rose-400 font-bold" 
                    : pmUrgencyScore >= 45 
                    ? "bg-amber-950/30 border-amber-900/30 text-amber-400 font-bold" 
                    : "bg-emerald-950/20 border-emerald-900/30 text-emerald-400 font-bold"
                }`}>
                  {recommendedWindow}
                </p>
              </div>

              {/* Quick checklist recommendations */}
              <div className="space-y-2 bg-[#0a0f1c] p-3 rounded border border-slate-850">
                <span className="text-[9px] font-mono text-slate-550 block uppercase font-bold">Proactive Tasks Suggested</span>
                <div className="space-y-1.5 text-xs text-slate-400">
                  {activeRecommendations.map((rec, rIdx) => (
                    <div key={rIdx} className="text-[11px] leading-relaxed">
                      • <strong className="text-white">{rec.title}:</strong> {rec.desc}
                    </div>
                  ))}
                </div>
              </div>

              {/* Dispatch Order trigger */}
              <button
                onClick={handleDispatchOrder}
                className={`w-full py-2.5 rounded font-mono text-[10px] uppercase font-bold transition flex items-center justify-center gap-1.5 cursor-pointer hover:shadow-md ${
                  pmUrgencyScore >= 45 
                    ? "bg-rose-500 hover:bg-rose-600 text-white" 
                    : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                }`}
              >
                <Zap className="w-3.5 h-3.5" /> Dispatch Active Service Order
              </button>
            </div>

          </div>

        </div>

        {/* Dynamic succ order toast */}
        {showOrderToast && (
          <div className="p-3 border border-emerald-500/40 text-emerald-350 text-xs rounded-lg flex items-start gap-2.5 mb-5 bg-emerald-950/40 shadow-sm">
            <span className="text-emerald-400 font-bold font-mono">DISPATCH CONFIRMED:</span>
            <span>{dispatchSuccessMsg}</span>
          </div>
        )}

        {/* Fleet database registry table */}
        <div className="space-y-3 pt-2">
          <div className="flex justify-between items-center">
            <h4 className="font-mono text-[10px] uppercase text-[#22d3ee] font-bold">Fleet Registry Prognostics Real-time Matrix</h4>
            <span className="text-[9px] font-mono text-slate-500">Tap rows below to select individual airframes</span>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto rounded border border-slate-850">
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead>
                <tr className="bg-slate-950 text-[#475569] border-b border-slate-850 text-[9.5px] uppercase">
                  <th className="p-3">Airframe Serial</th>
                  <th className="p-3">Stator Wear</th>
                  <th className="p-3">Battery Cap</th>
                  <th className="p-3">Battery Cycles</th>
                  <th className="p-3">Motor Temp</th>
                  <th className="p-3">Signal Power</th>
                  <th className="p-3">Fail Probability</th>
                  <th className="p-3 text-right">Service Window</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 bg-slate-900/10">
                {telemetry.map((t) => {
                  const vCycles = getCyclesForVehicle(t);
                  const vFailProb = calcFailureProbability(t.motorTemp, t.signalStrength, vCycles);
                  const isSelected = t.vehicleID === selectedVehicle;

                  let failColor = "text-emerald-405 text-emerald-400";
                  let winLabel = "30-Day Audit";
                  let windowBadge = "border-emerald-950 bg-emerald-950/20 text-emerald-400";

                  if (vFailProb >= 75) {
                    failColor = "text-rose-500 font-bold";
                    winLabel = "MANDATORY REFIT";
                    windowBadge = "border-rose-900 bg-rose-950/30 text-rose-400";
                  } else if (vFailProb >= 45) {
                    failColor = "text-amber-500 font-semibold";
                    winLabel = "Next 12 Hours";
                    windowBadge = "border-amber-900 bg-amber-950/20 text-amber-400";
                  } else if (vFailProb >= 18) {
                    winLabel = "Next 72 Hours";
                    windowBadge = "border-yellow-905 bg-yellow-950/20 text-yellow-405 text-yellow-400";
                  }

                  return (
                    <tr 
                      key={t.vehicleID}
                      onClick={() => setSelectedVehicle(t.vehicleID)}
                      className={`cursor-pointer transition ${
                        isSelected 
                          ? "bg-slate-800/40 border-l-2 border-l-[#22d3ee]" 
                          : "hover:bg-slate-900/30"
                      }`}
                    >
                      <td className="p-3 font-bold text-white flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-rose-500' : t.sensorStatus === 'Optimal' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                        {t.vehicleID}
                      </td>
                      <td className="p-3 text-slate-300">{t.sensorStatus === 'Anomalous' ? '54%' : '34%'}</td>
                      <td className="p-3 text-slate-300">{t.batteryHealth}%</td>
                      <td className="p-3 text-slate-300 font-bold">{vCycles}</td>
                      <td className="p-3 text-slate-300">{t.motorTemp}°C</td>
                      <td className="p-3 text-slate-300">{t.signalStrength} dBm</td>
                      <td className={`p-3 font-bold ${failColor}`}>{vFailProb}%</td>
                      <td className="p-3 text-right">
                        <span className={`text-[8.5px] px-2 py-0.5 rounded border uppercase font-bold ${windowBadge}`}>
                          {winLabel}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile responsive card list */}
          <div className="grid grid-cols-1 gap-3 md:hidden" id="mobile-fleet-cards">
            {telemetry.map((t) => {
              const vCycles = getCyclesForVehicle(t);
              const vFailProb = calcFailureProbability(t.motorTemp, t.signalStrength, vCycles);
              const isSelected = t.vehicleID === selectedVehicle;

              let failColor = "text-emerald-400";
              let winLabel = "30-Day Audit";
              let windowBadge = "border-emerald-800 bg-emerald-950/20 text-emerald-400";

              if (vFailProb >= 75) {
                failColor = "text-rose-500 font-bold";
                winLabel = "MANDATORY REFIT";
                windowBadge = "border-rose-900 bg-rose-950/30 text-rose-400";
              } else if (vFailProb >= 45) {
                failColor = "text-amber-500 font-semibold";
                winLabel = "Next 12 Hours";
                windowBadge = "border-amber-900 bg-amber-950/20 text-amber-400";
              }

              return (
                <div 
                  key={t.vehicleID}
                  onClick={() => setSelectedVehicle(t.vehicleID)}
                  className={`p-3 rounded border text-xs space-y-2 transition cursor-pointer ${
                    isSelected 
                      ? "bg-slate-800/40 border-[#22d3ee] shadow-sm" 
                      : "bg-[#0d1321] border-slate-850 hover:border-slate-800"
                  }`}
                  style={{ minHeight: "44px" }}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-rose-500' : 'bg-emerald-400'}`} />
                      {t.vehicleID}
                    </span>
                    <span className={`text-[8.5px] px-2 py-0.5 rounded border uppercase font-bold ${windowBadge}`}>
                      {winLabel}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-slate-400 text-[10.5px]">
                    <div>
                      <span className="text-[9px] uppercase font-mono block text-slate-500">Stator wear</span>
                      <span className="text-white font-mono">{t.sensorStatus === 'Anomalous' ? '54%' : '34%'}</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-mono block text-slate-500">Battery health</span>
                      <span className="text-white font-mono">{t.batteryHealth}% ({vCycles} c)</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-mono block text-slate-500">Prob fail</span>
                      <span className={`font-mono font-bold ${failColor}`}>{vFailProb}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>

    </div>
  );
}
