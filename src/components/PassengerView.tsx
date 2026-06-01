import React, { useState } from "react";
import { Users, BarChart, TrendingUp, Sparkles, MapPin, Smile, Clock, Route, Award, ShieldAlert, SlidersHorizontal, Eye } from "lucide-react";
import { SmartGridState } from "../types";
import { ResponsiveContainer, BarChart as RechartsBarChart, Bar, XAxis, YAxis, Tooltip, Legend, AreaChart, Area, CartesianGrid } from "recharts";

interface PassengerViewProps {
  gridState: SmartGridState;
}

export default function PassengerView({ gridState }: PassengerViewProps) {
  const [selectedPredictZone, setSelectedPredictZone] = useState<"Bandra" | "Colaba" | "Dadar" | "Thane" | "Andheri">("Bandra");

  // Commuter segments/demographics
  const demographicData = [
    { name: "Executive Core (31-45)", value: 45, color: "#22d3ee" },
    { name: "Digital Nomad (18-30)", value: 30, color: "#818cf8" },
    { name: "Affluent Senior (46+)", value: 15, color: "#fb7185" },
    { name: "Academic Sub (Under 18)", value: 10, color: "#34d399" },
  ];

  // Subscription split
  const subscriptionData = [
    { name: "Premium (SkyGold)", value: 42, color: "#6366f1" },
    { name: "Corporate Infinite", value: 38, color: "#2563eb" },
    { name: "Pay-As-You-Fly", value: 20, color: "#14b8a6" },
  ];

  // Peak Hour volume metrics
  const peakTrends = [
    { slot: "07-09", Premium: 4500, Regular: 2100 },
    { slot: "09-12", Premium: 3800, Regular: 1400 },
    { slot: "12-15", Premium: 1900, Regular: 1200 },
    { slot: "15-18", Premium: 4300, Regular: 2800 },
    { slot: "18-21", Premium: 5900, Regular: 4200 },
    { slot: "21-23", Premium: 2400, Regular: 1900 },
  ];

  // Area load index indicators
  const areaLoadHeatmap = [
    { zone: "Bandra Business District", currentLoad: "Critical", count: 1840, density: "94%" },
    { zone: "Colaba Coastal Terminus", currentLoad: "Moderate", count: 950, density: "52%" },
    { zone: "Dadar Transit Intersection", currentLoad: "High", count: 1490, density: "81%" },
    { zone: "Andheri East Link", currentLoad: "High", count: 1320, density: "76%" },
    { zone: "Thane Sky-Gateways", currentLoad: "Low", count: 420, density: "28%" },
    { zone: "Kurla Hub Central", currentLoad: "Moderate", count: 880, density: "45%" },
    { zone: "Nariman Port Outer", currentLoad: "Low", count: 310, density: "19%" },
  ];

  // AI demand forecast predictions by zone
  const zoneForecasting: Record<string, { morningPeak: number; eveningPeak: number; mainCategory: string; indexRating: string; comment: string }> = {
    Bandra: { morningPeak: 4200, eveningPeak: 6800, mainCategory: "Luxury Tech Executives", indexRating: "Severe Gridlock Impending", comment: "Dynamic surges expected to surpass 1.8x multiplier. Recommend auto-routing manual pilots back to coastal bypass lanes." },
    Colaba: { morningPeak: 1900, eveningPeak: 3100, mainCategory: "Leisure & Maritime Investors", indexRating: "Moderate Fluidity", comment: "Breeze wind flows remains below safety thresholds. Normal corridor pricing rules active." },
    Dadar: { morningPeak: 3800, eveningPeak: 5400, mainCategory: "Inter-City Commuters", indexRating: "High Density Alert", comment: "Dadar sky terminal is tracking high boarding congestion on Platform 4. Expand pre-nesting taxi pools." },
    Thane: { morningPeak: 3200, eveningPeak: 4100, mainCategory: "Suburban Tech-Park Staff", indexRating: "Steady Rise", comment: "Thane outward traffic is trending upwards. Peak corporate subscription reservations active starting 18:00." },
    Andheri: { morningPeak: 4100, eveningPeak: 5900, mainCategory: "Media Creators & Air-freight Operators", indexRating: "Heavy Transit Hub", comment: "Airlane congestion corridor over link roads is congested. Advise manual overrides restriction rules." },
  };

  const activeZonePredict = zoneForecasting[selectedPredictZone];

  const [forecastTimeframe, setForecastTimeframe] = useState<"7d" | "30d" | "90d">("30d");

  // Advanced Long-Term Forecasting datasets
  const longTermForecasts = {
    "7d": [
      { period: "Day 1", "AI Predicted Demand": 18200, "Corridor Limit": 22000 },
      { period: "Day 2", "AI Predicted Demand": 19400, "Corridor Limit": 22000 },
      { period: "Day 3", "AI Predicted Demand": 20800, "Corridor Limit": 22000 },
      { period: "Day 4", "AI Predicted Demand": 23100, "Corridor Limit": 25000 },
      { period: "Day 5", "AI Predicted Demand": 19500, "Corridor Limit": 25000 },
      { period: "Day 6", "AI Predicted Demand": 18900, "Corridor Limit": 25000 },
      { period: "Day 7", "AI Predicted Demand": 24200, "Corridor Limit": 28000 },
    ],
    "30d": [
      { period: "Week 1", "AI Predicted Demand": 115000, "Corridor Limit": 140000 },
      { period: "Week 2", "AI Predicted Demand": 128000, "Corridor Limit": 140000 },
      { period: "Week 3", "AI Predicted Demand": 145000, "Corridor Limit": 150000 },
      { period: "Week 4", "AI Predicted Demand": 162000, "Corridor Limit": 180000 },
    ],
    "90d": [
      { period: "Month 1", "AI Predicted Demand": 480000, "Corridor Limit": 550000 },
      { period: "Month 2", "AI Predicted Demand": 540000, "Corridor Limit": 580000 },
      { period: "Month 3", "AI Predicted Demand": 690000, "Corridor Limit": 720000 },
    ],
  };

  const activeForecastData = longTermForecasts[forecastTimeframe];

  return (
    <div className="space-y-6 text-slate-100 font-sans" id="passenger-intelligence-viewport">
      
      {/* Page Header banner */}
      <div className="border-b border-slate-800 pb-5">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 uppercase tracking-widest">
          <Users className="w-4 h-4 text-slate-450" />
          Commuter Analytics Division / High-Value Segments
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white mt-1 leading-tight">
          Passenger Intelligence Portal
        </h1>
        <p className="text-sm text-slate-400 mt-2 max-w-xl leading-relaxed">
          Detailed metrics monitoring passenger satisfaction indices, peak flow demographic clusters, and predicted corridor volume loads.
        </p>
      </div>

      {/* Main Demographics Charts block */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="passenger-charts-grid">
        
        {/* Core peak-hour trends bar chart */}
        <div className="lg:col-span-2 bg-[#0d1321] border border-slate-800 rounded-lg p-5 flex flex-col justify-between" id="passenger-trends-chart">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
            <div>
              <h3 className="text-lg font-bold text-white tracking-normal font-sans">
                Peak-Hour Passenger Density Volume
              </h3>
              <p className="text-xs text-slate-400">
                Hourly boarding trends comparing high-tier active subscriptions vs casual single transits
              </p>
            </div>
            <span className="text-[10px] text-emerald-450 font-mono bg-emerald-950/40 px-2.5 py-1 rounded border border-emerald-900/40 font-bold">
              AGGREGATE CSAT: 4.85 / 5.0
            </span>
          </div>

          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart data={peakTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1d263b" opacity={0.3} />
                <XAxis dataKey="slot" stroke="#475569" fontSize={10} fontFamily="JetBrains Mono" tickLine={false} />
                <YAxis stroke="#475569" fontSize={10} fontFamily="JetBrains Mono" tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0b0f19", border: "1px solid #1e293b", borderRadius: "8px", fontSize: "11px", color: "#f8fafc" }}
                  labelStyle={{ color: "#22d3ee", fontWeight: "bold" }}
                />
                <Legend iconSize={8} wrapperStyle={{ fontSize: "10px", pt: 10 }} />
                <Bar dataKey="Premium" name="SkyGold & Corporate" fill="#22d3ee" radius={[2, 2, 0, 0]} />
                <Bar dataKey="Regular" name="Pay-As-You-Fly" fill="#6366f1" radius={[2, 2, 0, 0]} />
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Demographics Split Muted Side Panel */}
        <div className="bg-[#0d1321] border border-slate-800 rounded-lg p-5 flex flex-col justify-between" id="demographic-breakdown-card">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white tracking-normal font-sans">
              Commuter Segmentation
            </h3>

            {/* Age groups distribution list */}
            <div className="space-y-3">
              <p className="text-[10px] text-slate-500 font-mono uppercase border-b border-slate-800/60 pb-1 font-bold">
                Commuter Age Cohorts
              </p>
              {demographicData.map((d, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                    <span className="text-slate-300 font-sans">{d.name}</span>
                  </div>
                  <span className="font-mono text-slate-400 font-semibold">{d.value}%</span>
                </div>
              ))}
            </div>

            {/* Subscription classes list */}
            <div className="space-y-3 pt-2">
              <p className="text-[10px] text-slate-500 font-mono uppercase border-b border-slate-800/60 pb-1 font-bold">
                Subscription Class Tier
              </p>
              {subscriptionData.map((s, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                    <span className="text-slate-300 font-sans">{s.name}</span>
                  </div>
                  <span className="font-mono text-slate-400 font-semibold">{s.value}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 mt-4">
            <span className="font-mono text-[9px] text-slate-500 leading-none">PEAK SEGMENT STENCIL</span>
            <span className="text-[#22d3ee] flex items-center gap-1 font-semibold text-[10px]">
              <Smile className="w-4 h-4 text-[#22d3ee]" />
              CSAT SCALE HIGH
            </span>
          </div>
        </div>

      </div>

      {/* Demand Heatmap and Zone Predictive AI Forecast widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="demand-heatmap-grid">
        
        {/* SkyGrid Density Heatmap Ledger */}
        <div className="lg:col-span-2 bg-[#0d1321] border border-slate-800 rounded-lg p-5">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-bold text-white font-sans tracking-normal">Hub Boarding Density Register</h3>
              <p className="text-xs text-slate-400">Tactical corridor monitoring showing commuter inflow loads and density indexes</p>
            </div>
            <Users className="w-4 h-4 text-slate-450 shrink-0" />
          </div>

          <div className="space-y-3">
            {areaLoadHeatmap.map((heatmap, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-slate-900/35 hover:bg-slate-900/60 rounded border border-slate-800/60 hover:border-slate-700/60 transition outline-none" style={{ minHeight: "44px" }}>
                <div className="flex items-center gap-3">
                  <MapPin className="w-3.5 h-3.5 text-[#22d3ee] shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-slate-200">{heatmap.zone}</p>
                    <p className="text-[10px] text-slate-500 font-mono">Current active transits: {heatmap.count} commuters</p>
                  </div>
                </div>

                <div className="flex items-center gap-5">
                  <div className="text-right">
                    <p className="text-[9px] text-slate-500 font-mono uppercase font-medium">Node Load</p>
                    <span className={`text-[11px] font-bold font-mono uppercase ${
                      heatmap.currentLoad === "Critical" 
                        ? "text-rose-500" 
                        : heatmap.currentLoad === "High" 
                        ? "text-amber-500" 
                        : heatmap.currentLoad === "Moderate" 
                        ? "text-[#22d3ee]" 
                        : "text-emerald-500"
                    }`}>
                      {heatmap.currentLoad}
                    </span>
                  </div>

                  <div className="w-16 text-right">
                    <p className="text-[9px] text-slate-500 font-mono uppercase font-medium">Margin</p>
                    <p className="font-mono text-xs text-slate-300 font-bold">{heatmap.density}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Zone passenger volume Predictor with clean card structures */}
        <div className="bg-[#0d1321] border border-slate-800 rounded-lg p-5 flex flex-col justify-between relative overflow-hidden" id="zone-predictor-card">
          <div className="space-y-4">
            <div className="space-y-1">
              <span className="text-[9px] text-indigo-400 font-mono flex items-center gap-1 uppercase tracking-wider font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                Airspace Predictor
              </span>
              <h3 className="text-lg font-bold text-white font-sans tracking-normal">Predict Air Terminal Demand</h3>
              <p className="text-xs text-slate-400">Simulate machine-learning forecast limits per city corridor</p>
            </div>

            {/* Zone Selector Buttons - Touch targets optimized (minimum 44px tap targets where feasible) */}
            <div className="grid grid-cols-5 gap-1 pt-1" style={{ minHeight: "36px" }}>
              {(["Bandra", "Colaba", "Dadar", "Thane", "Andheri"] as const).map((z) => (
                <button
                  key={z}
                  onClick={() => setSelectedPredictZone(z)}
                  className={`text-[10px] py-2 border rounded transition font-medium cursor-pointer ${
                    selectedPredictZone === z 
                      ? "bg-slate-800 text-[#22d3ee] border-[#22d3ee]/40 font-bold" 
                      : "bg-slate-900/50 text-slate-400 border-slate-800 hover:text-slate-200"
                  }`}
                  style={{ minHeight: "40px" }}
                >
                  {z}
                </button>
              ))}
            </div>

            {/* AI Predictions parameters display */}
            <div className="space-y-3 bg-[#0a0f1d] p-4 rounded border border-slate-800/80">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Target Hub Cluster:</span>
                <span className="font-semibold text-white">{selectedPredictZone} Corridor</span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Primary Commuter Class:</span>
                <span className="text-indigo-300 font-mono text-[10px] font-bold">{activeZonePredict.mainCategory}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/60 pb-1">
                <div>
                  <p className="text-[9px] text-slate-500 font-mono uppercase">Morning Peak</p>
                  <p className="text-xs font-mono text-slate-200 font-semibold">{activeZonePredict.morningPeak} commuters/hr</p>
                </div>
                <div>
                  <p className="text-[9px] text-slate-500 font-mono uppercase font-bold">Evening Peak</p>
                  <p className="text-xs font-mono text-indigo-400 font-semibold">{activeZonePredict.eveningPeak} commuters/hr</p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/60 flex justify-between items-center text-xs">
                <span className="text-slate-400">Risk Severity Level:</span>
                <span className="font-bold text-rose-500 font-mono text-[10px] uppercase">{activeZonePredict.indexRating}</span>
              </div>

              <div className="p-2.5 bg-[#0d1321] rounded border border-slate-800 text-[11px] text-indigo-300 leading-relaxed italic">
                "{activeZonePredict.comment}"
              </div>
            </div>
          </div>

          <p className="text-[9px] text-slate-550 font-mono uppercase pt-4 border-t border-slate-800 mt-4 leading-relaxed text-right">
            RECURRENT NEURAL FORECASTER R-SQ: 0.942
          </p>
        </div>

      </div>

      {/* INTELLIGENT STORIES FOR LONG-TERM DEMAND FORECASTING */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="long-term-story-analytics">
        
        {/* Core long term forecasting Area Grid */}
        <div className="lg:col-span-2 bg-[#0d1321] border border-slate-800 rounded-lg p-5 space-y-4">
          <div className="flex flex-wrap gap-3 items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white font-sans tracking-normal">
                Strategic Long-Term Demands
              </h3>
              <p className="text-xs text-slate-400">Multi-day forward prediction models mapping peak passenger demand volume limits</p>
            </div>

            {/* Timeframe selector tabs */}
            <div className="flex bg-[#0a0d18] p-1 rounded-lg border border-slate-850 self-stretch sm:self-auto">
              {(["7d", "30d", "90d"] as const).map((opt) => (
                <button
                  key={opt}
                  onClick={() => setForecastTimeframe(opt)}
                  className={`px-3 py-1.5 text-[10px] font-mono tracking-wider uppercase rounded transition font-bold cursor-pointer ${
                    forecastTimeframe === opt 
                      ? "bg-slate-800 text-[#22d3ee] border border-[#22d3ee]/20" 
                      : "text-slate-450 hover:text-white"
                  }`}
                >
                  {opt === "7d" ? "7 Days" : opt === "30d" ? "30 Days" : "90 Days"}
                </button>
              ))}
            </div>
          </div>

          {/* Area Chart visualization */}
          <div className="h-64 h sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activeForecastData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="forecastDemandGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="limitColorLine" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.05}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1d263b" opacity={0.3} />
                <XAxis dataKey="period" stroke="#475569" fontSize={10} fontFamily="JetBrains Mono" tickLine={false} />
                <YAxis stroke="#475569" fontSize={10} fontFamily="JetBrains Mono" tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0b0f19", border: "1px solid #1e293b", borderRadius: "8px", fontSize: "11px", color: "#f8fafc" }}
                />
                <Area type="monotone" dataKey="AI Predicted Demand" stroke="#22d3ee" strokeWidth={1.5} fillOpacity={1} fill="url(#forecastDemandGlow)" />
                <Area type="monotone" dataKey="Corridor Limit" stroke="#6366f1" strokeWidth={1} strokeDasharray="5 5" fillOpacity={1} fill="url(#limitColorLine)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ANALYTICAL STORY COMPONENT FOR THE CHART */}
        <div className="bg-[#0d1321] border border-slate-800 rounded-lg p-5 flex flex-col justify-between" id="demands-forecasting-story">
          <div className="space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-indigo-400 uppercase font-semibold">Analytical Forecast Story</span>
              <h3 className="text-lg font-bold text-white tracking-normal font-sans">Air Corridor Long Outlook</h3>
              <p className="text-xs text-slate-400">Projections modeling forward consumer volume capacity ratios</p>
            </div>

            <div className="space-y-3 pt-1 text-xs text-slate-300">
              <div className="space-y-0.5">
                <span className="text-[9px] text-slate-500 font-mono uppercase font-bold">Trend Description</span>
                <p className="leading-relaxed">
                  Historical high-density spikes shift outwards near Thane over 90 days. Aggregated weekend leisure transits represent +14.2% demand booster.
                </p>
              </div>

              <div className="space-y-0.5">
                <span className="text-[9px] text-slate-500 font-mono uppercase font-bold">Core Insight</span>
                <p className="leading-relaxed">
                  Decentralized routing protects active hubs from passenger overfill spikes while maintaining smooth rotor performance ratios safely.
                </p>
              </div>

              <div className="space-y-0.5">
                <span className="text-[9px] text-slate-500 font-mono uppercase font-bold">Forecast Matrix</span>
                <p className="text-[#22d3ee] font-medium leading-relaxed">
                  +19% average quarterly compound commuter volumes, with zero corridor lockouts.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between mt-4">
            <div className="flex items-center gap-1 text-xs text-slate-400 font-mono">
              <span>Risk Rating:</span>
              <span className="text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-950/40 text-[10px] font-bold">
                Low Risk
              </span>
            </div>
            <button className="text-[11px] text-slate-450 hover:text-white inline-flex items-center gap-1 font-medium transition cursor-pointer">
              <Eye className="w-3.5 h-3.5" />
              View models
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
