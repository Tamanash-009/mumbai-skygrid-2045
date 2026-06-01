import React, { useState } from "react";
import { Sparkles, BarChart2, TrendingUp, ShieldAlert, Zap, Layers, Play } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, CartesianGrid } from "recharts";

export default function PredictiveLabView() {
  const [activeModel, setActiveModel] = useState<"demand" | "revenue" | "traffic" | "safety">("demand");

  // State sliders for ML model simulations
  const [macroWorkforceShift, setMacroWorkforceShift] = useState<number>(15); // % surge commuters
  const [surgeMultiplicationCap, setSurgeMultiplicationCap] = useState<number>(1.5); // surge limit multiplier
  const [monsoonClimaticImpact, setMonsoonClimaticImpact] = useState<number>(3); // 1-5 severity index
  const [aiGridExclusionTime, setAiGridExclusionTime] = useState<number>(8); // manual flight hours ratio

  // 1. Demand Simulating plot dataset
  const baselineDemandData = [
    { hour: "08:00", standardDemand: 2400, predictedDemand: Math.round(2400 * (1 + macroWorkforceShift / 100)) },
    { hour: "11:00", standardDemand: 1800, predictedDemand: Math.round(1800 * (1 + macroWorkforceShift / 120)) },
    { hour: "14:00", standardDemand: 2100, predictedDemand: Math.round(2100 * (1 + macroWorkforceShift / 100)) },
    { hour: "17:00", standardDemand: 3400, predictedDemand: Math.round(3400 * (1 + macroWorkforceShift / 80)) },
    { hour: "20:00", standardDemand: 2800, predictedDemand: Math.round(2800 * (1 + macroWorkforceShift / 100)) },
  ];

  // 2. Revenue Projections dataset
  const calculatedFutureMarketYield = [
    { year: "2045 Q1", standardGrowth: 15.2, simGrowth: Math.round(15.2 * surgeMultiplicationCap * 10) / 10 },
    { year: "2045 Q2", standardGrowth: 17.8, simGrowth: Math.round(17.8 * surgeMultiplicationCap * 1.15 * 10) / 10 },
    { year: "2045 Q3", standardGrowth: 21.0, simGrowth: Math.round(21.0 * surgeMultiplicationCap * 1.25 * 10) / 10 },
    { year: "2045 Q4", standardGrowth: 24.5, simGrowth: Math.round(24.5 * surgeMultiplicationCap * 1.35 * 10) / 10 },
  ];

  // 3. Traffic Corridor bottlenecks indices
  const simulationAirspaceBottleneckIndex = () => {
    let baseOverload = 32;
    baseOverload += (monsoonClimaticImpact * 12);
    baseOverload += (macroWorkforceShift * 0.4);
    return Math.min(Math.round(baseOverload), 100);
  };

  // 4. Safety flight incident prediction indices
  const simulationAirspaceRiskIndicatorIndex = () => {
    let baseSafetyLoss = 0.02; // Initial risk ratio in %
    baseSafetyLoss += (aiGridExclusionTime * 0.15); // manual piloting ratio
    baseSafetyLoss += (monsoonClimaticImpact * 0.45); // rainy monsoons
    return Math.round(baseSafetyLoss * 100) / 100;
  };

  return (
    <div className="space-y-6 text-slate-100 font-sans animate-fade-in" id="predictive-lab-root">
      
      {/* Page header Banner introducing models */}
      <div className="border-b border-slate-800 pb-5" id="predictive-header">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 uppercase tracking-widest">
          <Sparkles className="w-4 h-4 text-slate-450" />
          Predictive Analytics Ground / Deep Forecasting Core
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white mt-1 leading-tight">
          Grid Predictive Laboratory
        </h1>
        <p className="text-sm text-slate-400 mt-2 max-w-xl leading-relaxed">
          Evaluate smart city transit load dynamics, model economic ticket pricing matrices under peak strain, and assess flight incident limits under extreme monsoons.
        </p>
      </div>

      {/* Model select subheader tabs */}
      <div className="bg-[#0b0f19] border border-slate-800 p-2 rounded-lg flex flex-wrap justify-between items-center gap-3">
        <span className="text-xs font-mono text-slate-400 pl-1 uppercase font-semibold">
          ACTIVE SYSTEM MODEL INDICATOR:
        </span>
        <div className="flex flex-wrap gap-1.5 shrink-0">
          <button
            onClick={() => setActiveModel("demand")}
            className={`text-xs px-3.5 py-1.5 rounded font-mono transition uppercase font-bold cursor-pointer ${
              activeModel === "demand" ? "bg-slate-800 text-[#22d3ee] border border-[#22d3ee]/20" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Commuter Demand Projections
          </button>
          <button
            onClick={() => setActiveModel("revenue")}
            className={`text-xs px-3.5 py-1.5 rounded font-mono transition uppercase font-bold cursor-pointer ${
              activeModel === "revenue" ? "bg-slate-800 text-emerald-400 border border-emerald-950" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Pricing Revenue Scenarios
          </button>
          <button
            onClick={() => setActiveModel("traffic")}
            className={`text-xs px-3.5 py-1.5 rounded font-mono transition uppercase font-bold cursor-pointer ${
              activeModel === "traffic" ? "bg-slate-800 text-purple-400 border border-purple-950" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Bottleneck Overloads
          </button>
          <button
            onClick={() => setActiveModel("safety")}
            className={`text-xs px-3.5 py-1.5 rounded font-mono transition uppercase font-bold cursor-pointer ${
              activeModel === "safety" ? "bg-slate-800 text-rose-400 border border-rose-950" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Incident Risk Hazards
          </button>
        </div>
      </div>

      {/* Main Sandbox Interactive grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="playground-body-grid">
        
        {/* Variables control card */}
        <div className="bg-[#0d1321] border border-slate-800 rounded-lg p-5 flex flex-col justify-between" id="simulation-drivers-card">
          <div className="space-y-5">
            <h3 className="text-sm text-slate-350 font-mono uppercase tracking-wider font-bold pb-2 border-b border-slate-800">
              Interactive Predictor Drivers
            </h3>

            {/* Slider 1: Commuter shift */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between items-center bg-slate-900/40 p-1.5 rounded px-2.5">
                <span className="text-slate-400 font-mono text-[9.5px] uppercase font-bold">Commuter Growth Surge</span>
                <span className="text-[#22d3ee] font-mono font-black">+{macroWorkforceShift}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                value={macroWorkforceShift}
                onChange={(e) => setMacroWorkforceShift(parseInt(e.target.value))}
                className="w-full h-1 bg-slate-950 rounded appearance-none cursor-pointer accent-[#22d3ee]"
              />
              <p className="text-[10px] text-[#475569] leading-normal italic">
                Models commuter growth spikes centered on high density Bandra and Dadar offices.
              </p>
            </div>

            {/* Slider 2: Surge factor ceiling */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between items-[#0d1321] bg-slate-900/40 p-1.5 rounded px-2.5">
                <span className="text-slate-400 font-mono text-[9.5px] uppercase font-bold">Dynamic Price Ceiling Clip</span>
                <span className="text-emerald-450 font-mono font-black">{surgeMultiplicationCap}x</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="2.5"
                step="0.1"
                value={surgeMultiplicationCap}
                onChange={(e) => setSurgeMultiplicationCap(parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-950 rounded appearance-none cursor-pointer accent-emerald-500"
              />
              <p className="text-[10px] text-[#475569] leading-normal italic">
                Caps dynamic multipliers to restrict peak hour fare-price exhaustion indices.
              </p>
            </div>

            {/* Slider 3: Monsoon climate */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between items-[#0d1321] bg-slate-900/40 p-1.5 rounded px-2.5">
                <span className="text-slate-400 font-mono text-[9.5px] uppercase font-bold">Climatic Monsoons Indicator</span>
                <span className="text-purple-400 font-mono font-black">Lvl {monsoonClimaticImpact} / 5</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                value={monsoonClimaticImpact}
                onChange={(e) => setMonsoonClimaticImpact(parseInt(e.target.value))}
                className="w-full h-1 bg-slate-950 rounded appearance-none cursor-pointer accent-purple-500"
              />
              <p className="text-[10px] text-[#475569] leading-normal italic">
                Adjusts cloud water levels, surface visual distances, and vertical wind gusts.
              </p>
            </div>

            {/* Slider 4: Pilot override ratios */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between items-[#0d1321] bg-slate-900/40 p-1.5 rounded px-2.5">
                <span className="text-slate-400 font-mono text-[9.5px] uppercase font-bold">Manual Flight Override Ratio</span>
                <span className="text-rose-450 font-mono font-black">{aiGridExclusionTime}% flights</span>
              </div>
              <input
                type="range"
                min="2"
                max="25"
                value={aiGridExclusionTime}
                onChange={(e) => setAiGridExclusionTime(parseInt(e.target.value))}
                className="w-full h-1 bg-slate-950 rounded appearance-none cursor-pointer accent-rose-500"
              />
              <p className="text-[10px] text-[#475569] leading-normal italic">
                Factor of human pilots exercising manual override control over autonomous grid corridors.
              </p>
            </div>

          </div>

          <div className="pt-4 border-t border-slate-800 text-[9px] text-[#475569] font-mono uppercase flex items-center justify-between mt-4">
            <span>ML forecasting engines active</span>
            <span className="text-emerald-450 font-bold flex items-center gap-1">
              <Play className="w-3.5 h-3.5 fill-emerald-500 text-emerald-500" />
              SYSTEM SYNCHRONIZED
            </span>
          </div>
        </div>

        {/* Data visualizations dynamic charts */}
        <div className="lg:col-span-2 bg-[#0d1321] border border-slate-800 rounded-lg p-5 flex flex-col justify-between" id="simulation-output-display">
          
          {/* 1. Demand models */}
          {activeModel === "demand" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-white tracking-normal font-sans">
                  Commuter Demand Growth Projector
                </h3>
                <p className="text-xs text-slate-400">
                  Contrast current baseline commuter volume standards with the growth shifts predicted from simulation parameters
                </p>
              </div>

              <div className="h-64 sm:h-72 w-full pt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={baselineDemandData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1d263b" opacity={0.3} />
                    <XAxis dataKey="hour" stroke="#475569" fontSize={10} fontFamily="JetBrains Mono" tickLine={false} />
                    <YAxis stroke="#475569" fontSize={10} fontFamily="JetBrains Mono" tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: "#0b0f19", border: "1px solid #1e293b", borderRadius: "8px", fontSize: "11px", color: "#f8fafc" }} />
                    <Bar dataKey="standardDemand" name="Current standard load" fill="#475569" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="predictedDemand" name="Projected commuter surge" fill="#22d3ee" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="p-3 bg-cyan-950/20 text-[#22d3ee] rounded border border-cyan-950 text-xs leading-normal font-sans italic">
                <strong>Model Diagnostic:</strong> Peak commute volume is projected to saturate up to <strong>{Math.round(baselineDemandData[3].predictedDemand)} commutes/hour</strong> at 17:00. Pre-staging 120 extra batteries or landing zones is recommended.
              </div>
            </div>
          )}

          {/* 2. Revenue scenario */}
          {activeModel === "revenue" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-white tracking-normal font-sans">
                  Pricing Scenario Gross Revenue Projections
                </h3>
                <p className="text-xs text-slate-400">
                  Quarterly gross revenue (Millions of INR) predicting earnings margins with the dynamic ticket price multiplier cap enabled
                </p>
              </div>

              <div className="h-64 sm:h-72 w-full pt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={calculatedFutureMarketYield} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorPredictRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1d263b" opacity={0.3} />
                    <XAxis dataKey="year" stroke="#475569" fontSize={10} fontFamily="JetBrains Mono" tickLine={false} />
                    <YAxis stroke="#475569" fontSize={10} fontFamily="JetBrains Mono" tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: "#0b0f19", border: "1px solid #1e293b", borderRadius: "8px", fontSize: "11px", color: "#f8fafc" }} />
                    <Area type="monotone" dataKey="simGrowth" name="Simulated Scenario Earnings" stroke="#10b981" fillOpacity={1} fill="url(#colorPredictRev)" strokeWidth={2} />
                    <Area type="monotone" dataKey="standardGrowth" name="Baseline Projection" stroke="#475569" fillOpacity={0} strokeWidth={1} strokeDasharray="3 3" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="p-3 bg-emerald-950/20 text-emerald-400 rounded border border-emerald-950 text-xs leading-normal font-sans italic">
                <strong>Model Diagnostic:</strong> Tuning peak hour dynamic pricing cap to <strong>{surgeMultiplicationCap}x</strong> forecasts up to <strong>₹{calculatedFutureMarketYield[3].simGrowth}M</strong> gross yield by 2045 Q4 safely.
              </div>
            </div>
          )}

          {/* 3. Traffic Corridor overloads */}
          {activeModel === "traffic" && (
            <div className="space-y-6 flex flex-col justify-center h-full">
              <div className="text-center space-y-1">
                <h3 className="text-lg font-bold text-white tracking-normal font-sans">Airspace Corridor Overload Probability</h3>
                <p className="text-xs text-slate-400">Bayesian dynamic calculations simulating major expressway blockages</p>
              </div>

              <div className="flex flex-col items-center justify-center p-6 bg-[#0a0f1d] rounded border border-slate-800 max-w-md mx-auto w-full text-center space-y-3.5 mt-2">
                <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider font-semibold">PROJECTED CONGESTION HOTSPOT RATE</p>
                <div className={`text-6xl font-mono font-black leading-none ${
                  simulationAirspaceBottleneckIndex() > 70 ? "text-rose-500" : "text-amber-500"
                }`}>
                  {simulationAirspaceBottleneckIndex()}%
                </div>
                <div className={`text-xs uppercase font-mono tracking-wider font-bold ${
                  simulationAirspaceBottleneckIndex() > 70 ? "text-rose-500" : "text-[#22d3ee]"
                }`}>
                  {simulationAirspaceBottleneckIndex() > 70 ? "Severe traffic bottleneck threats" : "Under nominal corridor density caps"}
                </div>
                <div className="text-[11px] text-slate-400 leading-relaxed italic bg-slate-900/40 p-3 rounded border border-slate-850">
                  {simulationAirspaceBottleneckIndex() > 70 
                    ? "Warning recommendation: Trigger autonomous coastal bypass routing patterns. Limit absolute flight logs to 850 crafts until monsoon cells dissipate from Mumbai airspace."
                    : "Warning recommendation: Operations stable. Commuter flight distributions conform nicely within normal operating buffers."}
                </div>
              </div>
            </div>
          )}

          {/* 4. Safety incident risk */}
          {activeModel === "safety" && (
            <div className="space-y-6 flex flex-col justify-center h-full">
              <div className="text-center space-y-1">
                <h3 className="text-lg font-bold text-white tracking-normal font-sans">Air Corridor Deviation Probability</h3>
                <p className="text-xs text-slate-400">Calculates yaw-deviations and magnetic transceiver jitter probabilities</p>
              </div>

              <div className="flex flex-col items-center justify-center p-6 bg-[#0a0f1d] rounded border border-slate-800 max-w-md mx-auto w-full text-center space-y-3.5 mt-2">
                <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider font-semibold">PREDICTED SYSTEM RISK VALUE</p>
                <div className={`text-6xl font-mono font-black leading-none ${
                  simulationAirspaceRiskIndicatorIndex() > 3.5 ? "text-rose-500" : "text-emerald-450"
                }`}>
                  {simulationAirspaceRiskIndicatorIndex()}%
                </div>
                <div className={`text-xs uppercase font-mono tracking-wider font-bold ${
                  simulationAirspaceRiskIndicatorIndex() > 3.5 ? "text-rose-500" : "text-emerald-400"
                }`}>
                  {simulationAirspaceRiskIndicatorIndex() > 3.5 ? "System safety hazards elevated" : "Within secure autonomous design thresholds"}
                </div>
                <div className="text-[11px] text-slate-400 leading-relaxed italic bg-slate-900/40 p-3 rounded border border-slate-850">
                  {simulationAirspaceRiskIndicatorIndex() > 3.5 
                    ? "Warning recommendation: Flying manually under severe monsoons risk extreme spatial drift. Autonomous autopilot locks successfully initialized."
                    : "Warning recommendation: Real-time telemetry indicators are fully nominal. No routing deviations anticipated."}
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
