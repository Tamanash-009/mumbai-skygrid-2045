import React, { useState } from "react";
import { DollarSign, Percent, TrendingUp, Sparkles, Scale, Info, ArrowUpRight, Award, Receipt, Sliders } from "lucide-react";
import { SmartGridState } from "../types";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

interface RevenueViewProps {
  gridState: SmartGridState;
}

export default function RevenueView({ gridState }: RevenueViewProps) {
  const [whatIfBaseFare, setWhatIfBaseFare] = useState<number>(350); // baseline trip INR
  const [whatIfSurgeFloor, setWhatIfSurgeFloor] = useState<number>(1.2); // threshold pricing multiplier

  // 12-Month revenue history + predictions (AI generated forecasting plot)
  const monthlyRevenueForecast = [
    { month: "Jan 45", historical: 4.2, predicted: 4.2 },
    { month: "Feb 45", historical: 4.8, predicted: 4.8 },
    { month: "Mar 45", historical: 5.1, predicted: 5.1 },
    { month: "Apr 45", historical: 5.9, predicted: 5.9 },
    { month: "May 45", historical: null, predicted: 6.8 },
    { month: "Jun 45", historical: null, predicted: 7.4 },
    { month: "Jul 45", historical: null, predicted: 8.1 },
    { month: "Aug 45", historical: null, predicted: 8.9 },
    { month: "Sep 45", historical: null, predicted: 9.5 },
    { month: "Oct 45", historical: null, predicted: 10.4 },
    { month: "Nov 45", historical: null, predicted: 11.2 },
    { month: "Dec 45", historical: null, predicted: 12.5 },
  ];

  // Route Profitability Analysis Metrics
  const routeProfitability = [
    { corridor: "Bandra ⇆ Nariman Point", monthlyTrips: 18400, baseRevenue: "₹6.4M", averageSurge: "1.45x", profitMargin: "44.2%" },
    { corridor: "Dadar ⇆ Colaba Coastal", monthlyTrips: 12100, baseRevenue: "₹4.1M", averageSurge: "1.30x", profitMargin: "38.5%" },
    { corridor: "Andheri East ⇆ Juhu Harbor", monthlyTrips: 14800, baseRevenue: "₹4.9M", averageSurge: "1.25x", profitMargin: "35.8%" },
    { corridor: "Thane Gateways ⇆ Bandra Transit", monthlyTrips: 10200, baseRevenue: "₹3.8M", averageSurge: "1.32x", profitMargin: "41.9%" },
    { corridor: "Kurla Industrial ⇆ Airport Radial", monthlyTrips: 9400, baseRevenue: "₹2.9M", averageSurge: "1.15x", profitMargin: "29.1%" },
  ];

  // What-If financial multiplier calculations
  const calculateEstDailyYield = () => {
    const dailyBaseTrips = 8500;
    return dailyBaseTrips * whatIfBaseFare * whatIfSurgeFloor;
  };

  const calculatedYield = calculateEstDailyYield();
  const indexGrowthEst = Math.round((calculatedYield / 3200000 - 1) * 100);

  return (
    <div className="space-y-6 text-slate-100 font-sans" id="revenue-intelligence-root">
      
      {/* Title & Heading Banner */}
      <div className="border-b border-slate-800 pb-5" id="revenue-title-area">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 uppercase tracking-widest">
          <Receipt className="w-4 h-4 text-slate-450" />
          Financial Division / Monetization Indices
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white mt-1 leading-tight">
          Revenue Intelligence Command
        </h1>
        <p className="text-sm text-slate-400 mt-2 max-w-xl leading-relaxed">
          Dynamic route pricing, dynamic tariff modeling structures, and strategic multi-year regional yield analysis tools for aerial corridors.
        </p>
      </div>

      {/* 12-Month AI Revenue Forecast Visualization block */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="revenue-forecast-grid">
        
        {/* Forecast Graph Area */}
        <div className="lg:col-span-2 bg-[#0d1321] border border-slate-800 rounded-lg p-5 flex flex-col justify-between" id="revenue-forecast-chart">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
            <div>
              <h3 className="text-lg font-bold text-white tracking-normal font-sans">
                12-Month Regional Revenue Performance
              </h3>
              <p className="text-xs text-slate-400">
                Combined historical sales and predicted corridor earnings in Millions of INR (₹)
              </p>
            </div>
            <span className="bg-[#111c2a] text-[#22d3ee] font-mono text-[10px] px-2.5 py-1 rounded border border-[#1e293b] flex items-center gap-1.5 font-bold whitespace-nowrap">
              <TrendingUp className="w-3.5 h-3.5" />
              FORECAST ACCURACY: +98.2%
            </span>
          </div>

          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyRevenueForecast} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorHist" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorProj" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1d263b" opacity={0.3} />
                <XAxis dataKey="month" stroke="#475569" fontSize={10} fontFamily="JetBrains Mono" tickLine={false} />
                <YAxis stroke="#475569" fontSize={10} fontFamily="JetBrains Mono" tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0b0f19", border: "1px solid #1e293b", borderRadius: "8px", fontSize: "11px", color: "#f8fafc" }}
                  labelStyle={{ color: "#22d3ee", fontWeight: "bold" }}
                  formatter={(value: any) => [`₹${value}M`, "Earnings"]}
                />
                <Area type="monotone" dataKey="historical" name="Historical Earnings" stroke="#22d3ee" strokeWidth={1.5} fillOpacity={1} fill="url(#colorHist)" />
                <Area type="monotone" dataKey="predicted" name="AI Projected Trend" stroke="#10b981" strokeWidth={1.5} strokeDasharray="3 3" fillOpacity={1} fill="url(#colorProj)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Dynamic Pricing Metrics & Intelligent Narrative Sidepanel */}
        <div className="bg-[#0d1321] border border-slate-800 rounded-lg p-5 flex flex-col justify-between" id="pricing-indicators-panel">
          <div className="space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-[#22d3ee] tracking-wider uppercase font-semibold">Diagnostic Stories</span>
              <h3 className="text-lg font-bold text-white tracking-normal font-sans">Pricing Architecture</h3>
              <p className="text-xs text-slate-400">Autonomous surge algorithms balancing airspace densities</p>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="bg-slate-900/35 p-3 rounded-lg border border-slate-800">
                <p className="text-[10px] text-slate-400 font-mono uppercase font-medium">Avg Surge Rate</p>
                <p className="text-2xl font-bold font-mono text-[#22d3ee] mt-0.5">{gridState.surgeMultiplier}x</p>
                <p className="text-[9px] text-slate-500 mt-1">Live active index</p>
              </div>

              <div className="bg-slate-900/35 p-3 rounded-lg border border-slate-800">
                <p className="text-[10px] text-slate-400 font-mono uppercase font-medium">Surge Ceiling</p>
                <p className="text-2xl font-bold font-mono text-white mt-0.5">2.25x</p>
                <p className="text-[9px] text-slate-500 mt-1">Max safety limit</p>
              </div>

              <div className="bg-slate-900/35 p-3 rounded-lg border border-slate-800">
                <p className="text-[10px] text-slate-400 font-mono uppercase font-medium">Base Tariff</p>
                <p className="text-xl font-bold font-mono text-white mt-0.5">₹32/km</p>
                <p className="text-[9px] text-slate-500 mt-1">Stator power toll</p>
              </div>

              <div className="bg-slate-900/35 p-3 rounded-lg border border-slate-800">
                <p className="text-[10px] text-slate-400 font-mono uppercase font-medium">Profit margin</p>
                <p className="text-xl font-bold font-mono text-emerald-400 mt-0.5">41.8%</p>
                <p className="text-[9px] text-emerald-500 mt-1">Operational surplus</p>
              </div>
            </div>

            {/* Stories Style Insight Block */}
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-850 text-xs text-slate-300 space-y-1.5 pt-2.5">
              <div className="flex items-center gap-1.5 font-bold text-white text-[11px] font-sans">
                <Award className="w-4 h-4 text-[#22d3ee] shrink-0" />
                Strategic Yield Insights
              </div>
              <p className="text-[11px] text-slate-350 leading-relaxed">
                As of June 2026, air transport corridors demonstrate strong elastic demand. Re-nesting automatic drones near Thane and Bandra transit vector limits yielded ₹3.8M in premium fares directly. Surge algorithms minimized airlock delays.
              </p>
              <div className="text-[9px] font-mono text-slate-500 border-t border-slate-800/60 pt-1 flex justify-between">
                <span>Forecast: High growth (+12.4% MoM)</span>
                <span>Risk: Low Risk</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 text-[10px] text-slate-500 font-mono flex justify-between mt-3">
            <span>TARIFF MATRIX COMPILER</span>
            <span className="text-[#22d3ee] font-bold">STABLE GENERAL REVENUES</span>
          </div>
        </div>

      </div>

      {/* Corridor Profitability table + What-If Parameters laboratory */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="yield-modelling-grid">
        
        {/* Route Profitability Table container */}
        <div className="lg:col-span-2 bg-[#0d1321] border border-slate-800 rounded-lg p-5" id="corridor-profitability-card">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-bold text-white font-sans tracking-normal">Corridor Net Yield Margins</h3>
              <p className="text-xs text-slate-400">Direct comparison of simulated commuter segments and pricing multipliers</p>
            </div>
            <Percent className="w-4 h-4 text-emerald-400 shrink-0" />
          </div>

          {/* Large Screen Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300 border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 font-mono text-[10px] uppercase">
                  <th className="py-3 px-3">Air Corridor Sector</th>
                  <th className="py-3 px-3">Monthly Outflow Journeys</th>
                  <th className="py-3 px-3">Gross Earnings</th>
                  <th className="py-3 px-3">Average Surge Coefficient</th>
                  <th className="py-3 px-3 text-right">EBITDA margin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {routeProfitability.map((route, idx) => (
                  <tr key={idx} id={`profitability-row-${idx}`} className="hover:bg-slate-900/30 transition">
                    <td className="py-3 px-3 font-medium text-slate-200">
                      {route.corridor}
                    </td>
                    <td className="py-3 px-3 font-mono">{route.monthlyTrips.toLocaleString()}</td>
                    <td className="py-3 px-3 font-mono text-slate-300">{route.baseRevenue}</td>
                    <td className="py-3 px-3 font-mono text-[#22d3ee]">{route.averageSurge}</td>
                    <td className="py-3 px-3 font-mono text-emerald-400 text-right font-semibold">{route.profitMargin}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile responsive cards view replacing table */}
          <div className="grid grid-cols-1 gap-3 md:hidden" id="mobile-profitability-cards">
            {routeProfitability.map((route, idx) => (
              <div key={idx} className="bg-slate-900/40 border border-slate-800 rounded-lg p-3 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-white">{route.corridor}</span>
                  <span className="text-emerald-400 font-bold font-mono">{route.profitMargin} Margin</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-slate-400 text-[11px]">
                  <div>
                    <span className="text-[9px] uppercase font-mono block text-slate-500">Monthly scale</span>
                    <span className="text-white font-mono">{route.monthlyTrips.toLocaleString()} trips</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-mono block text-slate-500">Earnings</span>
                    <span className="text-white font-mono">{route.baseRevenue}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-mono block text-slate-500">Surge</span>
                    <span className="text-[#22d3ee] font-mono">{route.averageSurge}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* What-If advanced parameter laboratory */}
        <div className="bg-[#0d1321] border border-slate-800 rounded-lg p-5 flex flex-col justify-between relative overflow-hidden" id="yield-modelling-slider-card">
          <div className="space-y-4 z-10">
            <div className="space-y-1">
              <span className="text-[9px] text-[#22d3ee] font-mono flex items-center gap-1 uppercase tracking-wider font-semibold">
                <Sliders className="w-3.5 h-3.5 text-[#22d3ee]" />
                Interactive Modeling
              </span>
              <h3 className="text-lg font-bold text-white font-sans tracking-normal">Yield Optimizer Lab</h3>
              <p className="text-xs text-slate-400">Simulate tariff modifications to compute network earning scales</p>
            </div>

            {/* Base Fare slider */}
            <div className="space-y-1.5 text-xs pt-1">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium text-[11px]">Simulation Base Fare</span>
                <span className="text-[#22d3ee] font-mono font-bold">₹{whatIfBaseFare}</span>
              </div>
              <input
                type="range"
                className="w-full h-1 bg-slate-900 roundedappearance-none cursor-pointer accent-[#22d3ee]"
                min="100"
                max="800"
                step="25"
                value={whatIfBaseFare}
                onChange={(e) => setWhatIfBaseFare(parseInt(e.target.value))}
              />
              <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                <span>₹100 (Subsidized)</span>
                <span>₹800 (Premium)</span>
              </div>
            </div>

            {/* Surge Floor slider */}
            <div className="space-y-1.5 text-xs pt-1">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium text-[11px]">Surge Multiplier Floor</span>
                <span className="text-emerald-400 font-mono font-bold">{whatIfSurgeFloor}x</span>
              </div>
              <input
                type="range"
                className="w-full h-1 bg-slate-900 rounded appearance-none cursor-pointer accent-emerald-500"
                min="1.0"
                max="2.5"
                step="0.05"
                value={whatIfSurgeFloor}
                onChange={(e) => setWhatIfSurgeFloor(parseFloat(e.target.value))}
              />
              <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                <span>1.0x (Flat tariff)</span>
                <span>2.5.0x (Extreme Congestion)</span>
              </div>
            </div>

            {/* Output Calculation card */}
            <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-800 text-center space-y-1">
              <span className="text-[10px] text-slate-500 font-mono uppercase font-semibold">ESTIMATED REGIONAL VALUE YIELD</span>
              <p className="text-2xl font-bold font-mono text-emerald-400 leading-none pt-1">
                ₹{Math.round(calculatedYield).toLocaleString()}
              </p>
              <div className="text-[9.5px] font-mono flex items-center justify-center gap-1 mt-1 font-bold">
                <span className={indexGrowthEst >= 0 ? "text-emerald-400" : "text-rose-500"}>
                  {indexGrowthEst >= 0 ? `+${indexGrowthEst}%` : `${indexGrowthEst}%`}
                </span>
                <span className="text-slate-500 text-[9px] uppercase font-medium">vs initial benchmark</span>
              </div>
            </div>

          </div>

          <p className="text-[9px] text-slate-500 font-mono uppercase pt-4 border-t border-slate-800 mt-4 leading-relaxed text-right">
            computed over default 8,500 daily sorties
          </p>
        </div>

      </div>

    </div>
  );
}
