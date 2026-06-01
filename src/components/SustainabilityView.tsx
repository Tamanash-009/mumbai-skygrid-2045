import React, { useState } from "react";
import { Globe, Zap, Sun, Award, Scale, Sparkles, AlertTriangle, TrendingDown, TrendingUp, Info, Eye, Sliders } from "lucide-react";
import { SmartGridState } from "../types";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, AreaChart, Area, CartesianGrid, PieChart, Pie, Cell, LineChart, Line } from "recharts";

interface SustainabilityViewProps {
  gridState: SmartGridState;
}

export default function SustainabilityView({ gridState }: SustainabilityViewProps) {
  // Simulator State
  const [cleanEnergyBlend, setCleanEnergyBlend] = useState<number>(80); // percentage of fleet powered by Solar/Hydrogen
  const [glideRecovery, setGlideRecovery] = useState<number>(35); // aerodynamic recuperation percentage
  const [pilotAutomation, setPilotAutomation] = useState<number>(92); // AI automated paths percentage

  // Derived simulation metrics
  const co2PerPassengerMileGrid = Math.max(2.4, Math.round((12 * (100 - cleanEnergyBlend) / 20) * (1 - (glideRecovery / 100) * 0.3) * (1 - (pilotAutomation - 50) / 100 * 0.15) * 10) / 10);
  const totalFleetEnergyMWh = Math.round((42.6 * (1 - (glideRecovery - 35) / 100 * 0.4) * (1 - (pilotAutomation - 90) / 100 * 0.1) * 10)) / 10;
  const simulatedDailySavings = Math.round((gridState.co2Savings * (1 + (cleanEnergyBlend - 80) / 100 + (glideRecovery - 35) / 150) * 1000)) / 1000;

  // 7-day trend based on current simulator values scaled with natural daily variance
  const getSevenDayTrend = () => {
    const days = [
      { name: "Mon", scalar: 1.15, target: 14.5 },
      { name: "Tue", scalar: 1.08, target: 14.0 },
      { name: "Wed", scalar: 1.02, target: 13.5 },
      { name: "Thu", scalar: 0.98, target: 13.0 },
      { name: "Fri", scalar: 1.05, target: 12.5 },
      { name: "Sat", scalar: 0.92, target: 12.0 },
      { name: "Sun", scalar: 0.85, target: 11.5 },
    ];

    return days.map((v) => {
      const simulatedVal = Math.max(1.5, Math.round(co2PerPassengerMileGrid * v.scalar * 10) / 10);
      return {
        day: v.name,
        "Simulated Intensity": simulatedVal,
        "Smart City Goal": v.target,
      };
    });
  };

  const sevenDayTrendData = getSevenDayTrend();

  // Static transit comparison dataset
  const transportComparisonData = [
    { name: "Diesel Taxi", carbon: 180, energy: 3.2, costPerMile: 45 },
    { name: "Gasoline Car", carbon: 145, energy: 2.8, costPerMile: 35 },
    { name: "Private Electric Car", carbon: 110, energy: 1.1, costPerMile: 15 },
    { name: "Mumbai Local Metro", carbon: 45, energy: 0.4, costPerMile: 5 },
    { name: "SkyGrid eVTOL (Current)", carbon: 12, energy: 0.55, costPerMile: 28 },
    { name: "SkyGrid eVTOL (Simulated)", carbon: co2PerPassengerMileGrid, energy: (totalFleetEnergyMWh / 100), costPerMile: Math.max(12, Math.round(28 * (1 - glideRecovery/200))) },
  ];

  // 12-Hour historical/forecasted solar & hydrogen offsets
  const dailyRenewableTrend = [
    { hour: "06:00", solar: 1.2, hydrogen: 3.4, demand: 4.8 },
    { hour: "08:00", solar: 2.5, hydrogen: 3.9, demand: 7.2 },
    { hour: "10:00", solar: 4.8, hydrogen: 4.1, demand: 8.5 },
    { hour: "12:00", solar: 6.2, hydrogen: 4.2, demand: 9.3 },
    { hour: "14:00", solar: 5.9, hydrogen: 4.0, demand: 8.9 },
    { hour: "16:00", solar: 3.8, hydrogen: 4.4, demand: 7.6 },
    { hour: "18:00", solar: 1.5, hydrogen: 5.2, demand: 8.8 },
    { hour: "20:00", solar: 0.1, hydrogen: 5.8, demand: 7.1 },
    { hour: "22:00", solar: 0.0, hydrogen: 5.5, demand: 5.3 },
  ];

  // Energy source distribution pie data
  const energyMixData = [
    { name: "Green Hydrogen Fuel Cell", value: Math.round(cleanEnergyBlend * 0.65), color: "#22d3ee" },
    { name: "Solar Landing Nests", value: Math.round(cleanEnergyBlend * 0.35), color: "#818cf8" },
    { name: "Inductive Thermal Grid", value: 100 - cleanEnergyBlend, color: "#cbd5e1" },
  ];

  // AI Insights Engine based on Sliders
  const getAISustainabilityInsights = () => {
    const list = [
      {
        title: "Atmospheric Wind Shield Mapping",
        desc: "Automated routing identifies headwind pockets near Dadar bypass. Leveraging thermal updrafts yields up to 8.4% energy reclaim in automated models.",
        impact: `${Math.round(pilotAutomation * 0.12)} MWh Avoided`,
        priority: "High",
        type: "routing"
      },
      {
        title: "Aerodynamic Micro-Glide Recuperation",
        desc: "eVTOL models approaching Juhu Terminal show a gliding angle optimal at 8.2 degrees. Under current configurations, we recover vital energy.",
        impact: `+${Math.round(glideRecovery * 0.4 * 10) / 10}% Recaptured`,
        priority: "Medium",
        type: "hardware"
      },
      {
        title: "Hydrogen Nest Load-Balancing",
        desc: "Fuel cells in South Mumbai are operating at 94% uptime. Redirecting excess morning solar capture to hydrolyzer tanks mitigates nocturnal grid tariff overheads.",
        impact: "₹185,000 Saved / Day",
        priority: "Medium",
        type: "grid"
      }
    ];

    if (cleanEnergyBlend < 70) {
      list.unshift({
        title: "Grid Carbon Spillover Hazard",
        desc: "Clean Energy Blend has dropped below 70%. SkyGrid is running high grid thermal dependencies. Increase green integration to escape peak carbon penalty taxes.",
        impact: "Carbon Penalty Danger",
        priority: "Critical",
        type: "grid"
      });
    } else {
      list.unshift({
        title: "Optimized Carbon Credit Generation",
        desc: "Clean blend ratios exceed 80%. Mumbai SkyGrid is qualified to issue Green Transport Credits, marketable at ₹4,200 per ton of carbon saved.",
        impact: `+₹${Math.round(simulatedDailySavings * 4200).toLocaleString()} Credits Yield`,
        priority: "Excellent",
        type: "revenue"
      });
    }

    return list;
  };

  const aiInsights = getAISustainabilityInsights();

  return (
    <div className="space-y-6 text-slate-100 font-sans" id="sustainability-division-root">
      
      {/* Title & Banner area */}
      <div className="border-b border-slate-800 pb-5" id="sustainability-title-section">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 uppercase tracking-widest">
          <Globe className="w-4 h-4 text-slate-450" />
          Sustainability Division / Decarbonization Indices
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white mt-1 leading-tight">
          Sustainability & Environmental Impact
        </h1>
        <p className="text-sm text-slate-400 mt-2 max-w-xl leading-relaxed">
          Monitor carbon offsets, compare fleet efficiencies against fossil alternatives, and simulate parameters to optimize energy conservation.
        </p>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="sustainability-kpis">
        
        {/* Cumulative savings */}
        <div className="bg-[#0d1321] border border-slate-800 rounded-lg p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block font-semibold">Tons CO₂ Avoided Today</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono text-emerald-400">
                {simulatedDailySavings.toFixed(3)}
              </span>
              <span className="text-xs text-emerald-500 font-medium">tons</span>
            </div>
            <span className="text-[9.5px] text-slate-500 font-mono">Continuous offset saving metrics</span>
          </div>
          <div className="p-3 bg-emerald-950/20 rounded border border-emerald-900/40 text-emerald-400 shrink-0">
            <Globe className="w-5 h-5" />
          </div>
        </div>

        {/* Carbon per passenger mile */}
        <div className="bg-[#0d1321] border border-slate-800 rounded-lg p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block font-semibold">Carbon Output Intensity</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono text-[#22d3ee]">
                {co2PerPassengerMileGrid}
              </span>
              <span className="text-xs text-[#22d3ee]">g/mile</span>
            </div>
            <span className="text-[9.5px] text-slate-500 font-mono">Traditional cars: 180g (93% cleaner)</span>
          </div>
          <div className="p-3 bg-cyan-950/20 rounded border border-cyan-900/40 text-[#22d3ee] shrink-0">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>

        {/* Total energy consumed */}
        <div className="bg-[#0d1321] border border-slate-800 rounded-lg p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block font-semibold">Aggregate Fleet Energy</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono text-white">
                {totalFleetEnergyMWh}
              </span>
              <span className="text-xs text-slate-400 font-mono">MWh</span>
            </div>
            <span className="text-[9.5px] text-slate-500 font-mono">Gliding recaptures: {(totalFleetEnergyMWh * (glideRecovery/100)).toFixed(1)} MWh</span>
          </div>
          <div className="p-3 bg-slate-900/40 rounded border border-slate-800 text-slate-350 shrink-0">
            <Zap className="w-5 h-5" />
          </div>
        </div>

        {/* Energy blend */}
        <div className="bg-[#0d1321] border border-slate-800 rounded-lg p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block font-semibold">Clean Energy Integration</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono text-white">
                {cleanEnergyBlend}%
              </span>
              <span className="text-xs text-slate-400">sourcing</span>
            </div>
            <span className="text-[9.5px] text-emerald-500 font-mono">National Target blend: 90%</span>
          </div>
          <div className="p-3 bg-slate-900/40 rounded border border-slate-800 text-slate-350 shrink-0">
            <Sun className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Main Carbon benchmark bars & Live energy mix distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="sustainability-charts-row">
        
        {/* CO2 Emissions comparison horizontally layout */}
        <div className="lg:col-span-2 bg-[#0d1321] border border-slate-800 rounded-lg p-5 flex flex-col justify-between" id="comparison-emissions-card">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-bold text-white font-sans tracking-normal">CO₂ Emissions Benchmark Comparison</h3>
              <p className="text-xs text-slate-400">Comparing Mumbai SkyGrid eVTOL fleet against legacy public transport models (grams CO₂ / passenger-mile)</p>
            </div>
            <span className="bg-[#111c2a] text-[#22d3ee] font-mono text-[10px] px-2.5 py-1 rounded border border-slate-850 font-bold">
              UNIT: CO₂ G/MILE
            </span>
          </div>

          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={transportComparisonData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1d263b" opacity={0.3} />
                <XAxis type="number" stroke="#475569" fontSize={10} fontFamily="JetBrains Mono" domain={[0, 200]} tickLine={false} />
                <YAxis dataKey="name" type="category" stroke="#475569" fontSize={10} width={135} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0b0f19", border: "1px solid #1e293b", borderRadius: "8px", fontSize: "11px", color: "#f8fafc" }}
                  labelStyle={{ color: "#22d3ee", fontWeight: "bold" }}
                  formatter={(value: any) => [`${value} grams CO₂ / mile`, "Carbon Output"]}
                />
                <Bar dataKey="carbon" fill="#cbd5e1" radius={[0, 2, 2, 0]}>
                  {transportComparisonData.map((entry, index) => {
                    let barColor = "#475569"; // slate for standard cars
                    if (entry.name.includes("Simulated")) barColor = "#22d3ee";
                    else if (entry.name.includes("Current")) barColor = "#818cf8";
                    else if (entry.name.includes("Metro")) barColor = "#10b981";
                    else if (entry.carbon > 140) barColor = "#ef4444";
                    return <Cell key={`cell-${index}`} fill={barColor} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Active Energy Sourcing blend donut chart */}
        <div className="bg-[#0d1321] border border-slate-800 rounded-lg p-5 flex flex-col justify-between" id="active-sourcing-donut-card">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white font-sans tracking-normal">Live Active Sourcing</h3>
            <p className="text-xs text-slate-400">Allocated power matrix driving VTOL launch stations and stator batteries</p>
          </div>

          <div className="h-44 w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={energyMixData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={65}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {energyMixData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0b0f19", border: "1px solid #1e293b", fontSize: "11px" }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-xl font-bold text-white font-mono">{cleanEnergyBlend}%</span>
              <span className="text-[9px] text-[#22d3ee] font-mono uppercase tracking-wider font-bold">Renewable</span>
            </div>
          </div>

          {/* Donut metadata descriptions */}
          <div className="space-y-2 border-t border-slate-800 pt-3 text-xs">
            {energyMixData.map((entry, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                  <span className="text-slate-350">{entry.name}</span>
                </div>
                <span className="font-mono text-slate-400 font-semibold">{entry.value}%</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Sustainable Environment Trend curves + Interactive Sliders panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in" id="renewables-timeseries-simulator">
        
        {/* Renewable hour curve */}
        <div className="lg:col-span-2 bg-[#0d1321] border border-slate-800 rounded-lg p-5 flex flex-col justify-between" id="renewable-hourly-curves">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
            <div>
              <h3 className="text-lg font-bold text-white font-sans tracking-normal">Renewable Support vs Transit Passenger Loads</h3>
              <p className="text-xs text-slate-400">24-hour peak curve demonstrating solar offsets buffering heavy flight commuting volumes (MWh)</p>
            </div>
            <div className="flex gap-4 text-[9px] font-mono text-slate-450 uppercase tracking-wider font-semibold">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-[#818cf8]" /> Solar</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-[#22d3ee]" /> Hydrogen</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-red-400" /> Commuters</span>
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyRenewableTrend} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="solarGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="hydroGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1d263b" opacity={0.3} />
                <XAxis dataKey="hour" stroke="#475569" fontSize={10} fontFamily="JetBrains Mono" tickLine={false} />
                <YAxis stroke="#475569" fontSize={10} fontFamily="JetBrains Mono" tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0b0f19", border: "1px solid #1e293b", borderRadius: "8px", fontSize: "11px", color: "#f8fafc" }}
                />
                <Area type="monotone" dataKey="solar" name="Solar Offsets (MWh)" stroke="#818cf8" strokeWidth={1.5} fillOpacity={1} fill="url(#solarGlow)" />
                <Area type="monotone" dataKey="hydrogen" name="Green Hydrogen Cell (MWh)" stroke="#22d3ee" strokeWidth={1.5} fillOpacity={1} fill="url(#hydroGlow)" />
                <Area type="monotone" dataKey="demand" name="Aggregated Commut Demand" stroke="#f43f5e" strokeWidth={1} strokeDasharray="3 3" fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Interactive Ecological Parameters simulator UI sidepanel */}
        <div className="bg-[#0d1321] border border-slate-800 rounded-lg p-5 flex flex-col justify-between" id="environmental-sim-sliders">
          <div className="space-y-4">
            <div className="space-y-1">
              <span className="text-[9px] text-[#22d3ee] font-mono flex items-center gap-1 uppercase tracking-wider font-bold">
                <Sliders className="w-3.5 h-3.5" />
                Scenario Calculator
              </span>
              <h3 className="text-lg font-bold text-white font-sans tracking-normal">Eco Modeling Sandbox</h3>
              <p className="text-xs text-slate-400">Modify fleet factors to simulate real carbon impacts</p>
            </div>

            {/* Slider 1 */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-350">Clean Grid Fuel Blend</span>
                <span className="text-[#22d3ee] font-mono font-bold">{cleanEnergyBlend}%</span>
              </div>
              <input 
                type="range" 
                min="40" 
                max="100" 
                value={cleanEnergyBlend} 
                onChange={(e) => setCleanEnergyBlend(Number(e.target.value))}
                className="w-full accent-[#22d3ee] h-1 bg-slate-900 rounded cursor-pointer"
              />
              <span className="text-[10px] text-slate-500 leading-tight block">Solar array landing pods expansion ratios</span>
            </div>

            {/* Slider 2 */}
            <div className="space-y-1.5 text-xs pt-1">
              <div className="flex justify-between items-center">
                <span className="text-slate-350">Aerodynamic Recuperation</span>
                <span className="text-[#22d3ee] font-mono font-bold">{glideRecovery}%</span>
              </div>
              <input 
                type="range" 
                min="20" 
                max="60" 
                value={glideRecovery} 
                onChange={(e) => setGlideRecovery(Number(e.target.value))}
                className="w-full accent-[#22d3ee] h-1 bg-slate-900 rounded cursor-pointer"
              />
              <span className="text-[10px] text-slate-500 leading-tight block">Efficiency of kinetic rotor recapture during glide descent</span>
            </div>

            {/* Slider 3 */}
            <div className="space-y-1.5 text-xs pt-1">
              <div className="flex justify-between items-center">
                <span className="text-slate-350">Autonomous Flight Pathing</span>
                <span className="text-[#22d3ee] font-mono font-bold">{pilotAutomation}%</span>
              </div>
              <input 
                type="range" 
                min="50" 
                max="100" 
                value={pilotAutomation} 
                onChange={(e) => setPilotAutomation(Number(e.target.value))}
                className="w-full accent-[#22d3ee] h-1 bg-slate-900 rounded cursor-pointer"
              />
              <span className="text-[10px] text-slate-500 leading-tight block">Fraction of active VTOL paths overseen by AI drag channels</span>
            </div>

            {/* Output simulated parameters calculation stats card */}
            <div className="bg-slate-900/40 border border-slate-800 p-3.5 rounded text-[11px] font-mono text-slate-300 space-y-1">
              <p className="text-slate-500 border-b border-slate-800/60 pb-1 uppercase font-semibold text-[9px] tracking-wider">Simulated Operational Yield</p>
              <div className="flex justify-between py-0.5">
                <span>Carbon Credits Saved:</span>
                <span className="text-emerald-400 font-bold">+{((simulatedDailySavings / gridState.co2Savings) * 100 - 100).toFixed(1)}% vs Base</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span>Avoided Carbon Taxes:</span>
                <span className="text-[#22d3ee] font-bold">₹{(Math.max(0, cleanEnergyBlend - 70) * 12500).toLocaleString()} / Mo</span>
              </div>
            </div>

          </div>

          <p className="text-[9px] text-slate-550 font-mono uppercase border-t border-slate-800 mt-4 leading-relaxed text-right">
            CALCULATION PROTOCOL EV-01
          </p>
        </div>

      </div>

      {/* 7-Day Carbon Footprint Intensity Trend */}
      <div className="bg-[#0d1321] border border-slate-800 rounded-lg p-5 flex flex-col justify-between" id="carbon-intensity-trend-section">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
          <div>
            <h3 className="text-lg font-bold text-white font-sans tracking-normal flex items-center gap-1.5">
              <TrendingDown className="w-5 h-5 text-[#22d3ee] animate-pulse" />
              7-Day Carbon Footprint Intensity Trend
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Historical progression of transport emission intensity (g/Pax-Mile) over the last 7 days based on current sandbox conditions.
            </p>
          </div>
          <div className="flex gap-4 text-[9px] font-mono text-slate-450 uppercase tracking-wider font-semibold">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#22d3ee]" /> Simulated Intensity
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-0.5 border-t border-dashed border-rose-450 border-rose-400" /> Smart City Goal
            </span>
          </div>
        </div>

        <div className="h-64 sm:h-72 w-full pt-1">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sevenDayTrendData} margin={{ top: 15, right: 15, left: -25, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1d263b" opacity={0.3} />
              <XAxis dataKey="day" stroke="#475569" fontSize={10} fontFamily="JetBrains Mono" tickLine={false} />
              <YAxis stroke="#475569" fontSize={10} fontFamily="JetBrains Mono" tickLine={false} domain={[0, "auto"]} />
              <Tooltip 
                contentStyle={{ backgroundColor: "#0b0f19", border: "1px solid #1e293b", borderRadius: "8px", fontSize: "11px", color: "#f8fafc" }}
                labelStyle={{ color: "#22d3ee", fontWeight: "bold" }}
              />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: "10px", fontFamily: "JetBrains Mono" }} />
              <Line 
                type="monotone" 
                dataKey="Simulated Intensity" 
                name="Simulated Intensity (g/Pax-Mile)" 
                stroke="#22d3ee" 
                strokeWidth={2.5} 
                activeDot={{ r: 6 }} 
              />
              <Line 
                type="monotone" 
                dataKey="Smart City Goal" 
                name="Smart City Goal" 
                stroke="#ef4444" 
                strokeWidth={1.5} 
                strokeDasharray="5 5" 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="text-[10px] text-slate-500 font-mono pt-3 border-t border-slate-800 mt-4 flex justify-between flex-wrap gap-2">
          <span>CO₂ Output Intensity reflects average grams of carbon per seat-mile adjusted by clean fuel blends and pilot drag configurations.</span>
          <span className="text-emerald-400 font-bold font-mono">
            ● Status: {co2PerPassengerMileGrid <= 10.0 ? "Optimized Decarbonization Level" : "Standard Operational Index"}
          </span>
        </div>
      </div>

      {/* Narrative block capturing recommendations */}
      <div className="bg-[#0d1321] border border-slate-800 rounded-lg p-5" id="ecological-advisories-section">
        <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-3">
          <Sparkles className="w-5 h-5 text-emerald-400" />
          <div>
            <h3 className="text-lg font-bold text-white font-sans tracking-normal">AI Ecological Recommendations Engine</h3>
            <p className="text-xs text-slate-400">Neural-derived flight operations recommendations to minimize municipal carbon costs and yield energy savings</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" id="ecological-cards">
          {aiInsights.map((insight, idx) => (
            <div 
              key={idx} 
              className={`p-4 rounded-lg border bg-slate-900/25 flex flex-col justify-between space-y-3 transition ${
                insight.priority === "Critical" 
                  ? "border-red-900/45 hover:border-red-800" 
                  : insight.priority === "Excellent"
                  ? "border-emerald-900/45 hover:border-emerald-800"
                  : "border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className={`text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 rounded border ${
                    insight.priority === "Critical" 
                      ? "bg-red-950/40 text-red-400 border-red-900/30 font-bold" 
                      : insight.priority === "Excellent"
                      ? "bg-emerald-950/40 text-emerald-400 border-emerald-950/30 font-bold"
                      : "bg-slate-950 text-slate-400 border-slate-850 font-semibold"
                  }`}>
                    {insight.priority} Priority
                  </span>
                  <span className="text-[9px] text-slate-500 font-mono uppercase">
                    {insight.type}
                  </span>
                </div>
                <h4 className="font-bold text-xs text-slate-200">{insight.title}</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed font-sans">{insight.desc}</p>
              </div>

              <div className="pt-3 border-t border-slate-800/60 flex justify-between items-center text-xs">
                <span className="text-[10px] text-slate-500 font-medium font-sans">Potential:</span>
                <span className={`font-mono font-bold ${
                  insight.priority === "Critical" ? "text-red-400" : "text-emerald-400"
                }`}>
                  {insight.impact}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
