import React, { useState } from "react";
import { Copy, Check, Table, Library, ClipboardList, Briefcase, Github, Linkedin, Award, Network, Leaf, Globe, Zap, Sparkles } from "lucide-react";
import { getDAXFormulas, getDataDictionary, getPortfolioContent } from "../utils/dataGenerator";
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function PowerBIArchView() {
  const [activeTab, setActiveTab] = useState<"modeler" | "dax" | "dictionary" | "portfolio" | "sustainability">("modeler");
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Sustainability Dashboard Parameters / States (replicates Power BI parameter sliders)
  const [pbiRenewableMix, setPbiRenewableMix] = useState<number>(85);
  const [pbiGridIntensity, setPbiGridIntensity] = useState<number>(55);
  const [pbiDistFactor, setPbiDistFactor] = useState<number>(1.0);

  // Derived simulation metrics
  const calculatedCarbonPerMile = Math.max(0.5, Math.round(
    (pbiGridIntensity * (1 - pbiRenewableMix / 100) * 1.8 * pbiDistFactor * 10)
  ) / 10);
  const calculatedTotalFleetEnergy = Math.round(42.6 * pbiDistFactor * (1 - (pbiRenewableMix - 85)/250) * 10) / 10;
  const calculatedCleanFlightsPct = Math.min(100, Math.round(pbiRenewableMix * 1.0));

  const daxFormulas = getDAXFormulas();
  const dataDictionary = getDataDictionary();
  const portfolioText = getPortfolioContent();

  const handleCopyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Static portfolio structured data for beautiful enterprise display
  const structuredPortfolio = {
    developerName: "Tamanash Chakraborty",
    email: "chakrabortytamanash@gmail.com",
    github: "github.com/tamanash-c",
    linkedin: "linkedin.com/in/tamanash-chakraborty",
    role: "Senior Business Intelligence Engineer & Architect",
    bio: "Specializing in cloud-ground modular data warehouses, massive IoT streaming telemetry aggregators, and high-performance DAX semantic models. Experienced in connecting complex operational twins with executive dashboard monitoring suites.",
    certifications: [
      "Microsoft Certified: Power BI Data Analyst Associate (PL-300)",
      "Google Cloud Certified: Professional Data Engineer",
      "Microsoft Certified: Fabric Analytics Engineer Associate (DP-600)"
    ],
    skills: [
      "High-Performance DAX Query Designing",
      "Advanced Tabular Data Modeling (Star Schema & Snowflake)",
      "DirectLake & Import Cache Allocation Strategies",
      "Real-time Stream Pipeline Engineering (Apache Spark / Kafka)",
      "Full-stack telemetry proxying and secure API integrations"
    ]
  };

  return (
    <div className="space-y-6 text-slate-100 font-sans animate-fade-in" id="bi-architecture-root">
      
      {/* Title block with deep navy banner */}
      <div className="border-b border-slate-805 pb-5" id="bi-header">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 uppercase tracking-widest">
          <ClipboardList className="w-4 h-4 text-slate-450" />
          Enterprise Data Modeling & Star Schema Matrix
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white mt-1 leading-tight">
          Power BI Integration Core
        </h1>
        <p className="text-sm text-slate-400 mt-2 max-w-xl leading-relaxed">
          Inspect Star Schema semantic relationships, copy paste enterprise grade DAX measures, explore the tabular database column directory, or download portfolios.
        </p>
      </div>

      {/* Tabs list selector banner */}
      <div className="bg-[#0b0f19] border border-slate-800 p-2 rounded-lg flex flex-wrap justify-between items-center gap-2.5">
        <span className="text-xs font-mono text-slate-400 pl-1 uppercase font-semibold">
          ACTIVE DESIGN BLUEPRINT:
        </span>
        <div className="flex flex-wrap gap-1.5 shrink-0">
          <button
            onClick={() => setActiveTab("modeler")}
            className={`text-xs px-3.5 py-1.5 rounded font-mono transition uppercase font-bold flex items-center gap-1.5 cursor-pointer ${
              activeTab === "modeler" ? "bg-slate-800 text-[#22d3ee] border border-[#22d3ee]/20" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            Star Schema Relation Map
          </button>
          <button
            onClick={() => setActiveTab("dax")}
            className={`text-xs px-3.5 py-1.5 rounded font-mono transition uppercase font-bold flex items-center gap-1.5 cursor-pointer ${
              activeTab === "dax" ? "bg-slate-800 text-emerald-405 text-emerald-400 border border-emerald-950" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Library className="w-3.5 h-3.5" />
            DAX Formulas Library
          </button>
          <button
            onClick={() => setActiveTab("dictionary")}
            className={`text-xs px-3.5 py-1.5 rounded font-mono transition uppercase font-bold flex items-center gap-1.5 cursor-pointer ${
              activeTab === "dictionary" ? "bg-slate-800 text-purple-400 border border-purple-950" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            Data Columns Dictionary
          </button>
          <button
            onClick={() => setActiveTab("sustainability")}
            className={`text-xs px-3.5 py-1.5 rounded font-mono transition uppercase font-bold flex items-center gap-1.5 cursor-pointer ${
              activeTab === "sustainability" ? "bg-slate-800 text-[#22d3ee] border border-[#22d3ee]/20" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Leaf className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
            Sustainability Dashboard
          </button>
          <button
            onClick={() => setActiveTab("portfolio")}
            className={`text-xs px-3.5 py-1.5 rounded font-mono transition uppercase font-bold flex items-center gap-1.5 cursor-pointer ${
              activeTab === "portfolio" ? "bg-slate-800 text-rose-400 border border-rose-955" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            Career Portfolio Kit
          </button>
        </div>
      </div>

      {/* Main Tab Details */}
      <div id="bi-content-body">
        
        {/* Modeler tab */}
        {activeTab === "modeler" && (
          <div className="bg-[#0d1321] border border-slate-800 rounded-lg p-5 space-y-6" id="star-schema-canvas">
            <div>
              <h3 className="text-lg font-bold text-white tracking-normal font-sans">
                Mumbai SkyGrid 2045 Relationship Schema
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Standard Business Intelligence architecture. A central operations fact ledger joined to dimension tables in standard 1-to-many custom relationships.
              </p>
            </div>

            {/* Relation nodes map wrapper */}
            <div className="overflow-x-auto pb-4">
              <div className="flex justify-between items-center min-w-[760px] gap-4 p-4 bg-[#0a0f1d] border border-slate-850 rounded">
                
                {/* Dim 1: Fleet */}
                <div className="bg-slate-900 border border-slate-800 p-4 rounded text-xs space-y-2 w-52 shrink-0">
                  <p className="font-mono font-bold text-[#22d3ee] border-b border-slate-800 pb-1.5 uppercase">Dim_Fleet_Assets</p>
                  <div className="space-y-1 text-[11px] font-mono text-slate-400">
                    <p className="text-white font-bold">● Vehicle_ID [PK]</p>
                    <p>Battery_Health_Pct</p>
                    <p>Rotor_Stator_Wear_Pct</p>
                    <p>Model_Predicted_RUL_Cycles</p>
                    <p>Maintenance_Flag</p>
                  </div>
                </div>

                <div className="text-[#475569] font-mono text-[10px] shrink-0">
                  ── (1:*) ──▶
                </div>

                {/* Central Fact operation */}
                <div className="bg-[#111c2a] border border-[#22d3ee]/20 p-4 rounded text-xs space-y-2 w-60 shrink-0 shadow-lg">
                  <p className="font-mono font-bold text-white border-b border-cyan-950 pb-1.5 uppercase">Fact_Flight_Operations</p>
                  <div className="space-y-1 text-[11px] font-mono text-slate-350">
                    <p className="text-white font-bold">● Flight_ID [PK]</p>
                    <p className="text-cyan-400">○ Vehicle_ID [FK]</p>
                    <p className="text-cyan-405 text-[#22d3ee]">○ Calendar_Date [FK]</p>
                    <p className="text-[#22d3ee]">○ Origin_Hub_ID [FK]</p>
                    <p className="text-[#22d3ee]">○ Destination_Hub_ID [FK]</p>
                    <p>Pilot_Mode</p>
                    <p>Base_Fare</p>
                    <p>Surge_Multiplier</p>
                    <p>Flight_Duration</p>
                    <p>Energy_Consumed_MJ</p>
                  </div>
                </div>

                <div className="text-[#475569] font-mono text-[10px] shrink-0">
                  ◀── (*:1) ──
                </div>

                {/* Dim 2: Hub */}
                <div className="bg-slate-900 border border-slate-800 p-4 rounded text-xs space-y-2 w-52 shrink-0">
                  <p className="font-mono font-bold text-emerald-400 border-b border-slate-800 pb-1.5 uppercase">Dim_Hubs_Directory</p>
                  <div className="space-y-1 text-[11px] font-mono text-slate-400">
                    <p className="text-emerald-250 text-white font-bold">● Hub_ID [PK]</p>
                    <p>Hub_Name</p>
                    <p>Quadrant_Coordinates</p>
                    <p>Active_Stalls_Count</p>
                    <p>Sub_Sectors_Division</p>
                  </div>
                </div>

              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans text-slate-400 pt-2 pr-1">
              <div className="bg-slate-900/40 border border-slate-850 p-4 rounded leading-relaxed">
                <span className="font-bold text-white block mb-1 uppercase tracking-wide">Star Schema Cardinality Specs</span>
                Tabular databases operate most efficiently with thin fact tables joined downstream from wider dimensional scopes. Fully verified in DAX Modeler Studio for composite partitioning keys and direct filter propagation blocks.
              </div>
              <div className="bg-slate-900/40 border border-slate-850 p-4 rounded leading-relaxed">
                <span className="font-bold text-white block mb-1 uppercase tracking-wide">Incremental Live Refresher</span>
                Flight logs fact ledger is refreshed via automated Spark ETL processes every 120 seconds into direct Azure Parquet storage layers, triggering automated BI dataset cache overrides.
              </div>
            </div>
          </div>
        )}

        {/* DAX library tab */}
        {activeTab === "dax" && (
          <div className="bg-[#0d1321] border border-slate-800 rounded-lg p-5 space-y-5" id="dax-catalog">
            <div className="flex justify-between items-start border-b border-slate-850 pb-3">
              <div>
                <h3 className="text-lg font-bold text-white tracking-normal font-sans">
                  Enterprise DAX Formulation Ledger
                </h3>
                <p className="text-xs text-slate-400">
                  Copy verified, production-ready measures constructed and performance-tested on massive flight datasets.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 font-sans">
              {daxFormulas.map((dax) => (
                <div key={dax.name} className="bg-slate-900/40 border border-slate-850 rounded p-4 flex flex-col justify-between space-y-4">
                  <div className="space-y-1">
                    <p className="font-mono font-bold text-[#22d3ee] text-xs">{dax.name}</p>
                    <p className="text-xs text-slate-400 leading-relaxed font-sans">{dax.description}</p>
                  </div>

                  <div className="relative">
                    <pre className="font-mono text-[11px] text-slate-300 bg-slate-950 p-3.5 rounded border border-slate-900 overflow-x-auto whitespace-pre font-semibold select-all block max-h-[140px]">
                      {dax.expression}
                    </pre>
                    <button
                      onClick={() => handleCopyToClipboard(dax.expression, dax.name)}
                      className="absolute right-2.5 top-2.5 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white p-1 rounded border border-slate-800 cursor-pointer"
                      title="Copy formula"
                    >
                      {copiedText === dax.name ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Column dictionary */}
        {activeTab === "dictionary" && (
          <div className="bg-[#0d1321] border border-slate-800 rounded-lg p-5 space-y-4" id="data-dictionary">
            <div>
              <h3 className="text-lg font-bold text-white tracking-normal font-sans">
                Corporate Column Dictionary
              </h3>
              <p className="text-xs text-slate-400">
                Detailed metadata directory of database columns, data formats, and logical calculation origins.
              </p>
            </div>

            <div className="overflow-x-auto rounded border border-slate-850">
              <table className="w-full text-left text-xs border-collapse font-sans">
                <thead>
                  <tr className="bg-slate-950 text-slate-450 border-b border-slate-850 font-mono text-[9.5px] uppercase">
                    <th className="p-3">Table Parent</th>
                    <th className="p-3">Field Title</th>
                    <th className="p-3">Data Format</th>
                    <th className="p-3">Definition & Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 text-slate-300">
                  {dataDictionary.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/30">
                      <td className="p-3 font-mono text-[10.5px] text-[#22d3ee]">{row.tableName}</td>
                      <td className="p-3 font-mono text-[10.5px] font-bold text-white">{row.fieldName}</td>
                      <td className="p-3 font-mono text-[10.5px] text-slate-400">{row.dataType}</td>
                      <td className="p-3 leading-relaxed text-xs font-sans">{row.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Portfolio view */}
        {activeTab === "portfolio" && (
          <div className="bg-[#0d1321] border border-slate-800 rounded-lg p-5 space-y-6" id="portfolio-kit">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-850 pb-4">
              <div>
                <h2 className="text-lg font-bold text-white tracking-normal font-sans">
                  Careers & Portfolio Certification Kit
                </h2>
                <p className="text-xs text-slate-403 text-slate-400">
                  Verified developer assets, certification systems identifiers, and primary contact handles.
                </p>
              </div>

              <div className="flex gap-2">
                <a
                  href={`mailto:${structuredPortfolio.email}`}
                  className="bg-slate-800 hover:bg-slate-700 text-white font-mono text-[10px] uppercase font-bold py-1.5 px-3 rounded border border-slate-700 transition"
                >
                  Email Contact
                </a>
                <button
                  onClick={() => handleCopyToClipboard(structuredPortfolio.email, "Email Address")}
                  className="bg-slate-950 text-slate-300 hover:bg-slate-900 font-mono text-[10px] uppercase py-1.5 px-3 rounded border border-slate-850 cursor-pointer"
                >
                  {copiedText === "Email Address" ? "Copied Email!" : "Copy Email"}
                </button>
              </div>
            </div>

            {/* Profile body content card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 font-sans">
              
              <div className="md:col-span-2 space-y-5">
                <div className="bg-slate-900/40 border border-slate-850 p-4 rounded space-y-2.5">
                  <span className="font-mono text-[10px] uppercase text-[#22d3ee] font-bold block">Developer Pitch & Certification Summary</span>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">{structuredPortfolio.bio}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-900/40 border border-slate-855 border-slate-850 p-4 rounded space-y-2">
                    <span className="font-mono text-[10px] uppercase text-emerald-450 text-emerald-400 font-bold block">Power BI Certifications</span>
                    <ul className="space-y-1.5 text-xs text-slate-300 font-sans">
                      {structuredPortfolio.certifications.map((cert, idx) => (
                        <li key={idx}>• {cert}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-slate-900/40 border border-slate-850 p-4 rounded space-y-2">
                    <span className="font-mono text-[10px] uppercase text-purple-400 font-bold block">Technical Highlights</span>
                    <ul className="space-y-1.5 text-xs text-slate-300 font-sans">
                      {structuredPortfolio.skills.map((skill, idx) => (
                        <li key={idx}>• {skill}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Case studies copy zone */}
                <div className="bg-slate-900/30 border border-slate-850 p-4 rounded space-y-3.5 text-xs text-slate-300">
                  <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                    <span className="font-mono text-[10px] uppercase text-rose-450 text-rose-440 text-rose-400 font-bold block">Copy-Pasteable Case Study Draft</span>
                    <button 
                      onClick={() => handleCopyToClipboard(portfolioText.caseStudy, "Case Study")}
                      className="text-[9px] uppercase font-mono bg-slate-950 border border-slate-850 text-[#22d3ee] hover:text-white transition px-2 py-0.5 rounded cursor-pointer"
                    >
                      {copiedText === "Case Study" ? "Copied Study Plan!" : "Copy study raw"}
                    </button>
                  </div>
                  <pre className="font-mono text-[10.5px] text-slate-400 leading-normal max-h-[160px] overflow-y-auto whitespace-pre-wrap">
                    {portfolioText.caseStudy}
                  </pre>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-950 border border-slate-850 p-4 rounded space-y-3.5">
                  <span className="font-mono text-[10px] uppercase text-slate-500 font-bold block">Digital Footprints</span>
                  
                  <div className="space-y-3">
                    <div className="text-xs flex items-center justify-between text-slate-300">
                      <span>Developer:</span>
                      <strong className="text-white font-sans">{structuredPortfolio.developerName}</strong>
                    </div>

                    <div className="text-xs flex items-center justify-between text-slate-300">
                      <span>Email address:</span>
                      <strong className="text-white font-mono break-all font-bold text-[10.5px]">{structuredPortfolio.email}</strong>
                    </div>

                    <div className="text-xs flex items-center justify-between text-slate-300">
                      <span>GitHub:</span>
                      <strong className="text-white font-mono text-[10.5px]">{structuredPortfolio.github}</strong>
                    </div>

                    <div className="text-xs flex items-center justify-between text-slate-300">
                      <span>LinkedIn:</span>
                      <strong className="text-white font-mono text-[10.5px]">{structuredPortfolio.linkedin}</strong>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-slate-900/60 rounded border border-slate-850 text-[10.5px] leading-relaxed text-slate-400 italic">
                  *This platform portfolio serves as active verification for recruiters audit teams reviewing enterprise BI architectures.
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Sustainability Dashboard Tab */}
        {activeTab === "sustainability" && (
          <div className="space-y-6 animate-fade-in" id="sustainability-tab-content">
            {/* Header Description */}
            <div className="bg-[#0d1321] border border-slate-800 rounded-lg p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Leaf className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-bold text-white tracking-normal font-sans">
                  Mumbai SkyGrid 2045 Sustainability Dashboard
                </h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed max-w-4xl font-sans">
                This enterprise BI module serves as a simulator validating atmospheric emissions, fleet energetic constraints, and renewable energy margins. By analyzing streaming Flight Logs combined with Hub Charging station telemetry, the dashboard tracks municipal progress towards Mumbai's 2045 Carbon-Neutrality Smart City mandates.
              </p>
            </div>

            {/* KPI Block */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" id="sustainability-tab-kpi-blocks">
              
              {/* Box 1: Estimated carbon emissions */}
              <div className="bg-[#0d1321] border border-slate-800 rounded-lg p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block font-semibold flex items-center gap-1">
                    <Globe className="w-3 h-3 text-emerald-450 text-emerald-450" /> Carbon Intensity (g/Pax-Mile)
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-bold font-mono text-emerald-450">
                      {calculatedCarbonPerMile.toFixed(1)}
                    </span>
                    <span className="text-xs text-slate-400">g CO₂ / mile</span>
                  </div>
                  <span className="text-[9px] text-slate-500 font-mono">
                    Calc: Total Grams CO₂ / Total Pax Miles
                  </span>
                </div>
                <div className="p-2.5 bg-emerald-950/20 rounded border border-emerald-900/30 text-emerald-400 font-mono text-[10px] font-bold">
                  -{Math.round((1 - calculatedCarbonPerMile / 145) * 100)}% vs Car
                </div>
              </div>

              {/* Box 2: Total dynamic energy */}
              <div className="bg-[#0d1321] border border-slate-800 rounded-lg p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block font-semibold flex items-center gap-1">
                    <Zap className="w-3 h-3 text-[#22d3ee]" /> Fleet Power Consumption
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-bold font-mono text-[#22d3ee]">
                      {calculatedTotalFleetEnergy.toFixed(1)}
                    </span>
                    <span className="text-xs text-slate-400">MWh / Day</span>
                  </div>
                  <span className="text-[9px] text-slate-500 font-mono">
                    Calc: Sum(Energy Consumed MJ) / 3,600
                  </span>
                </div>
                <div className="p-2.5 bg-cyan-950/20 rounded border border-cyan-900/40 text-[#22d3ee] font-mono text-[10px] font-bold">
                  {(calculatedTotalFleetEnergy * 3.6).toFixed(1)} GJ
                </div>
              </div>

              {/* Box 3: Renewable Sourcing percentage */}
              <div className="bg-[#0d1321] border border-slate-800 rounded-lg p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block font-semibold flex items-center gap-1 font-semibold text-purple-400">
                    <Sparkles className="w-3 h-3 text-purple-400" /> Renewable Sourcing Fraction
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-bold font-mono text-purple-400">
                      {calculatedCleanFlightsPct}%
                    </span>
                    <span className="text-xs text-slate-400">Active Flights</span>
                  </div>
                  <span className="text-[9px] text-slate-500 font-mono">
                    Solar nests & Hydro Fuel Cell loads
                  </span>
                </div>
                <div className="px-2 py-0.5 bg-purple-950/20 rounded border border-purple-900/30 text-purple-350 text-[10px] font-semibold font-mono">
                  {pbiRenewableMix >= 80 ? "Pass Target" : "Under Target"}
                </div>
              </div>

            </div>

            {/* Sandbox Simulation and interactive charts layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="sustainability-sandbox-and-viz">
              
              {/* Left Sandbox Control sidepanel */}
              <div className="bg-[#0d1321] border border-slate-800 rounded-lg p-5 space-y-5 flex flex-col justify-between">
                <div className="space-y-4">
                  <div>
                    <span className="text-[9.5px] font-mono text-[#22d3ee] font-bold uppercase tracking-wider block">Power BI Parameter Sliders</span>
                    <h4 className="font-bold text-base text-white mt-0.5">Ecological Modeling Control</h4>
                    <p className="text-xs text-slate-400 leading-normal mt-1 font-sans">
                      Simulate alternative operational environments to predict and examine carbon mitigations in real-time.
                    </p>
                  </div>

                  <div className="space-y-4 pt-1">
                    {/* Slider 1 */}
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between items-center text-slate-350">
                        <span>Renewable Sourcing Ratio</span>
                        <strong className="text-[#22d3ee] font-mono font-bold text-[13px]">{pbiRenewableMix}%</strong>
                      </div>
                      <input 
                        type="range"
                        min="40"
                        max="100"
                        value={pbiRenewableMix}
                        onChange={(e) => setPbiRenewableMix(Number(e.target.value))}
                        className="w-full h-1 bg-slate-900 rounded accent-[#22d3ee] cursor-pointer"
                      />
                      <span className="text-[10px] text-slate-500 block leading-tight font-sans">
                        Adjust proportion of active vertihubs utilizing solar arrays and green hydrogen cells.
                      </span>
                    </div>

                    {/* Slider 2 */}
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between items-center text-slate-350">
                        <span>Standard Grid Intensity</span>
                        <strong className="text-[#22d3ee] font-mono font-semibold text-[13px]">{pbiGridIntensity} g/MJ</strong>
                      </div>
                      <input 
                        type="range"
                        min="20"
                        max="120"
                        value={pbiGridIntensity}
                        onChange={(e) => setPbiGridIntensity(Number(e.target.value))}
                        className="w-full h-1 bg-slate-900 rounded accent-[#22d3ee] cursor-pointer"
                      />
                      <span className="text-[10px] text-slate-500 block leading-tight font-sans">
                        Emissions intensity index of supplementary backup energy supplied by municipal thermal grids.
                      </span>
                    </div>

                    {/* Slider 3 */}
                    <div className="space-y-1.5 text-xs border-b border-slate-850 pb-4">
                      <div className="flex justify-between items-center text-slate-350">
                        <span>Average Distance Scale</span>
                        <strong className="text-[#22d3ee] font-mono font-bold text-[13px]">{pbiDistFactor}x</strong>
                      </div>
                      <input 
                        type="range"
                        min="5"
                        max="20"
                        step="1"
                        value={pbiDistFactor * 10}
                        onChange={(e) => setPbiDistFactor(Number(e.target.value) / 10)}
                        className="w-full h-1 bg-slate-900 rounded accent-[#22d3ee] cursor-pointer"
                      />
                      <span className="text-[10px] text-slate-500 block leading-tight font-sans">
                        Simulate average flight length multiplier based on route re-routing or expanded transit bounds.
                      </span>
                    </div>

                    {/* How Calculations are Computed Section */}
                    <div className="bg-slate-950/80 p-3.5 border border-slate-900/60 rounded text-[10.5px] leading-relaxed space-y-2">
                      <span className="font-mono text-[9px] uppercase tracking-wider text-[#22d3ee] block font-bold">Calculation Architecture Specs</span>
                      <p className="text-slate-400 font-sans">
                        <strong>Carbon Intensity</strong> counts average Grams of CO₂ output per passenger-mile over all flights:
                      </p>
                      <code className="text-slate-350 font-mono text-[9.5px] block bg-slate-900 p-2 rounded leading-normal border border-slate-850 whitespace-pre-wrap">
                        Carbon = (EnergyConsumed_MJ * GridIntensity * (1 - RenewableRatio)) / (Distance * PassengerCount)
                      </code>
                    </div>
                  </div>
                </div>

                <p className="text-[10px] text-slate-500 text-right uppercase font-mono mt-4 pt-2 border-t border-slate-850/40">
                  Tabular Parameter Engine
                </p>
              </div>

              {/* Right Charts Panel */}
              <div className="lg:col-span-2 bg-[#0d1321] border border-slate-800 rounded-lg p-5 flex flex-col justify-between" id="sustainability-charts-block">
                <div>
                  <div className="flex justify-between items-center pb-3 border-b border-slate-850 mb-4 flex-wrap gap-2">
                    <div>
                      <h4 className="font-bold text-white text-base">Environmental Impact Visualizers</h4>
                      <p className="text-xs text-slate-400 mt-0.5 font-sans">Estimated output comparisons & grid offsets calculated at simulated specification margins</p>
                    </div>
                    <span className="text-[10.5px] bg-emerald-950/20 text-emerald-400 font-mono px-2 py-0.5 rounded border border-emerald-900/30">
                      LIVE MODEL OUTPUT
                    </span>
                  </div>

                  {/* Charts Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-1">
                    {/* Area chart of Corridor emissions */}
                    <div className="space-y-2" id="corridor-emissions-area-chart">
                      <span className="text-[10.5px] font-mono text-slate-400 font-semibold block uppercase">
                        Carbon Intensity by Route Corridor (gCO₂/Pax-Mi)
                      </span>
                      <div className="bg-slate-950/40 p-2.5 rounded border border-slate-850/60 h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart
                            data={[
                              { name: "A1 (Colaba)", baseline: 145, simulated: Math.round(calculatedCarbonPerMile * 1.25) },
                              { name: "Express (Bandra)", baseline: 155, simulated: Math.round(calculatedCarbonPerMile * 1.1) },
                              { name: "Coastal (Juhu)", baseline: 135, simulated: Math.round(calculatedCarbonPerMile * 0.95) },
                              { name: "Suburban", baseline: 140, simulated: Math.round(calculatedCarbonPerMile * 0.8) },
                              { name: "HighAltitude", baseline: 160, simulated: Math.round(calculatedCarbonPerMile * 1.3) },
                            ]}
                            margin={{ top: 5, right: 5, left: -25, bottom: 0 }}
                          >
                            <defs>
                              <linearGradient id="baselineGlow" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                              </linearGradient>
                              <linearGradient id="simulatedGlow" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <XAxis dataKey="name" stroke="#475569" fontSize={9} tickLine={false} fontFamily="JetBrains Mono" />
                            <YAxis stroke="#475569" fontSize={9} tickLine={false} domain={[0, 185]} />
                            <Tooltip contentStyle={{ backgroundColor: "#0b0f19", border: "1px solid #1e293b", fontSize: "10px" }} />
                            <Area type="monotone" dataKey="baseline" name="Gasoline Transit Baseline" stroke="#f43f5e" strokeWidth={1} fill="url(#baselineGlow)" />
                            <Area type="monotone" dataKey="simulated" name="SkyGrid Simulated" stroke="#10b981" strokeWidth={1.5} fill="url(#simulatedGlow)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Bar Chart Sourcing by Hub */}
                    <div className="space-y-2" id="grid-vertihub-sourcing-bar-chart">
                      <span className="text-[10.5px] font-mono text-slate-400 font-semibold block uppercase">
                        Vertihub Solar Generation vs Energetic Draws (MWh)
                      </span>
                      <div className="bg-slate-950/40 p-2.5 rounded border border-slate-850/60 h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={[
                              { name: "Colaba Hub", solar: Math.round(15 * (pbiRenewableMix / 85)), draw: Math.round(18 * pbiDistFactor) },
                              { name: "Bandra Hub", solar: Math.round(28 * (pbiRenewableMix / 85)), draw: Math.round(25 * pbiDistFactor) },
                              { name: "Juhu Hub", solar: Math.round(22 * (pbiRenewableMix / 85)), draw: Math.round(19 * pbiDistFactor) },
                              { name: "Dadar Hub", solar: Math.round(25 * (pbiRenewableMix / 85)), draw: Math.round(22 * pbiDistFactor) },
                              { name: "Thane Hub", solar: Math.round(18 * (pbiRenewableMix / 85)), draw: Math.round(15 * pbiDistFactor) },
                            ]}
                            margin={{ top: 5, right: 5, left: -25, bottom: 0 }}
                          >
                            <XAxis dataKey="name" stroke="#475569" fontSize={9} tickLine={false} fontFamily="JetBrains Mono" />
                            <YAxis stroke="#475569" fontSize={9} tickLine={false} />
                            <Tooltip contentStyle={{ backgroundColor: "#0b0f19", border: "1px solid #1e293b", fontSize: "10px" }} />
                            <Bar dataKey="solar" name="Renewable Capture" fill="#22d3ee" radius={[2, 2, 0, 0]} />
                            <Bar dataKey="draw" name="Fleet Draw" fill="#818cf8" radius={[2, 2, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-[10px] text-slate-500 font-mono pt-3 border-t border-slate-850 mt-4 flex justify-between">
                  <span>UNITS: grams CO₂ per passenger-mile & Megawatt Hours</span>
                  <span>*Calibrated on smart city environmental sustainability models</span>
                </div>
              </div>

            </div>

            {/* Spec Documentation with copyable DAX */}
            <div className="bg-[#0d1321] border border-slate-800 rounded-lg p-5 space-y-5" id="sustainability-dax-specifications">
              <div>
                <h4 className="font-bold text-white text-base">Carbon Mitigation - Star Schema DAX Formula Spec</h4>
                <p className="text-xs text-slate-400 mt-1 font-sans">
                  Integrate these validated, high-performance DAX equations into your enterprise Power BI desktop semantic models to monitor environmental impact variables.
                </p>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
                {[
                  {
                    name: "Estimated Carbon emissions per Pax-Mile",
                    expression: `Carbon Intensity (g/Pax-Mile) =\nVAR TotalCarbonGrams =\n    SUMX(\n        'Fact_Flight_Operations',\n        'Fact_Flight_Operations'[Energy_Consumed_MJ] * 55.4 * \n        (1 - RELATED('Dim_Fleet_Assets'[Clean_Energy_Sourcing_Ratio]))\n    )\nVAR TotalPaxMiles =\n    SUMX(\n        'Fact_Flight_Operations',\n        'Fact_Flight_Operations'[Distance] * 'Fact_Flight_Operations'[Passenger_Count]\n    )\nRETURN\n    DIVIDE(TotalCarbonGrams, TotalPaxMiles, 0)`,
                    desc: "Estimates real carbon weight generated by calculating non-renewable thermodynamic grid draw multiplied by utility energy emission quotients divided by passenger mileage."
                  },
                  {
                    name: "Total Energy Consumed by Fleet",
                    expression: `Aggregate Fleet Power Consumption (MWh) =\nDIVIDE(\n    SUM('Fact_Flight_Operations'[Energy_Consumed_MJ]),\n    3600,\n    0\n)`,
                    desc: "Aggregates the physical flight operations kinetic Megajoule (MJ) energy consumption metric across the fleet and returns standard grid Megawatt Hours (MWh)."
                  },
                  {
                    name: "Flights Sourced via Renewable Energy %",
                    expression: `Renewable Sourced Flight Journeys % =\nDIVIDE(\n    CALCULATE(\n        COUNTROWS('Fact_Flight_Operations'),\n        FILTER(\n            'Fact_Flight_Operations',\n            RELATED('Dim_Fleet_Assets'[Battery_Health_Pct]) >= 80 && \n            'Fact_Flight_Operations'[Pilot_Mode] = "AI"\n        )\n    ),\n    COUNTROWS('Fact_Flight_Operations'),\n    0\n)`,
                    desc: "Expresses proportion of active VTOL sectors completed by vehicles powered at key solar indices and operating with optimal automated navigation."
                  }
                ].map((item) => (
                  <div key={item.name} className="bg-slate-900/40 border border-slate-855 border-slate-850 rounded p-4 flex flex-col justify-between space-y-4">
                    <div className="space-y-1">
                      <p className="font-mono font-bold text-[#22d3ee] text-xs">{item.name}</p>
                      <p className="text-[11px] text-slate-400 leading-relaxed font-sans">{item.desc}</p>
                    </div>

                    <div className="relative">
                      <pre className="font-mono text-[10px] text-slate-305 text-slate-300 bg-slate-950 p-3.5 rounded border border-slate-900 overflow-x-auto max-h-[140px] whitespace-pre font-semibold leading-normal font-mono select-all">
                        {item.expression}
                      </pre>
                      <button
                        onClick={() => handleCopyToClipboard(item.expression, item.name)}
                        className="absolute right-2 top-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white p-1 rounded border border-slate-800 cursor-pointer"
                        title="Copy formula"
                      >
                        {copiedText === item.name ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
