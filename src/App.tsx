import React, { useState, useEffect } from "react";
import { 
  Menu, X, Radio, Compass, Users, DollarSign, ShieldCheck, 
  Activity, Sparkles, Layers, Globe, Bot, Bell, ShieldAlert, Cpu, Leaf,
  Search, Star, Check, Archive, ArrowRight, HelpCircle, User, LogOut, 
  Terminal, History, ChevronRight, Sliders, Play, Settings, Database,
  ArrowUpRight, Key, MessageSquare, ClipboardList, Eye, Power, RefreshCw, Sun, Moon
} from "lucide-react";

import { AppView, SmartGridState, FlightRecord, TelemetryRecord } from "./types";
import { generateInitialFlights, generateInitialTelemetry } from "./utils/dataGenerator";

// Components
import OperationsView from "./components/OperationsView";
import ExecutiveView from "./components/ExecutiveView";
import PassengerView from "./components/PassengerView";
import TrafficView from "./components/TrafficView";
import RevenueView from "./components/RevenueView";
import SafetyView from "./components/SafetyView";
import FleetView from "./components/FleetView";
import PredictiveLabView from "./components/PredictiveLabView";
import DigitalTwinView from "./components/DigitalTwinView";
import PowerBIArchView from "./components/PowerBIArchView";
import SustainabilityView from "./components/SustainabilityView";

export default function App() {
  const [selectedView, setSelectedView] = useState<AppView>("operations");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeRole, setActiveRole] = useState<string>("Operations Director (All Active Flows)");
  const [workspaceTenant, setWorkspaceTenant] = useState<string>("Mumbai SkyGrid Primary");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  
  // High contrast mode state (True-black tactical background)
  const [highContrastMode, setHighContrastMode] = useState<boolean>(() => {
    return localStorage.getItem("high_contrast_mode") === "true";
  });

  useEffect(() => {
    localStorage.setItem("high_contrast_mode", highContrastMode.toString());
  }, [highContrastMode]);
  
  // Custom API Keys administrator state
  const [apiKeyActive, setApiKeyActive] = useState<string>("sk-live-india-skygrid-2045-secure-aes");
  const [apiLogs, setApiLogs] = useState<string[]>(["GET /api/v1/vectors/live - 200 OK", "POST /api/v1/dispatch - 201 Created (Token Secured)"]);

  // Floating AI Assistant States
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [aiInquiry, setAiInquiry] = useState("");
  const [aiChatLog, setAiChatLog] = useState<Array<{ sender: "user" | "copilot"; text: string; code?: string }>>([
    { 
      sender: "copilot", 
      text: "Authentication confirmed. I am your automated SaaS Flight Co-Pilot. I monitor Mumbai atmospheric flow and charging metrics in real-time. How can I assist you today?" 
    }
  ]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isVoiceListening, setIsVoiceListening] = useState(false);

  // Command Palette states
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [paletteSearch, setPaletteSearch] = useState("");

  // Simulated operations datasets
  const [flights, setFlights] = useState<FlightRecord[]>([]);
  const [telemetry, setTelemetry] = useState<TelemetryRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Live Smart Operational States
  const [gridState, setGridState] = useState<SmartGridState>({
    activeFlights: 1420,
    activeVehicles: 2850,
    dailyPassengers: 18450,
    revenueToday: 2845000,
    safetyScore: 99.8,
    fleetUtilization: 88.4,
    avgWaitTime: 4.2,
    surgeMultiplier: 1.25,
    peakSector: "Bandra-Worli Transit Vector",
    weather: "Heavy Monsoon Overcast",
    co2Savings: 34.2,
  });

  // Action Notification alert banner helper
  const [alertBanner, setAlertBanner] = useState<string | null>(null);

  const triggerAlertBanner = (msg: string) => {
    setAlertBanner(msg);
    setTimeout(() => {
      setAlertBanner(null);
    }, 4000);
  };

  // Pre-seed mock notifications list
  const [notifications, setNotifications] = useState([
    { id: "n1", text: "Dadar central passenger loading index exceeded 85% capacity threshold", type: "warning", time: "2 min ago" },
    { id: "n2", text: "Heavy local turbulence reported near BKC conflux airway", type: "info", time: "12 min ago" },
    { id: "n3", text: "Autonomous safety verification cycles completed successfully", type: "success", time: "1 hr ago" }
  ]);

  // Seed initial operational datasets on mount
  useEffect(() => {
    setFlights(generateInitialFlights(35));
    setTelemetry(generateInitialTelemetry(18));
  }, []);

  // Listen for Ctrl+K or Cmd+K to open Command Palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setIsCommandPaletteOpen(false);
        setShowNotifications(false);
        setShowAccountMenu(false);
        setIsCopilotOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Live simulation update ticks interval
  useEffect(() => {
    const timer = setInterval(() => {
      setGridState((prev) => {
        const deltaFlights = Math.random() > 0.5 ? 2 : -1;
        const deltaPassengers = Math.floor(Math.random() * 6) - 1;
        const deltaRevenue = Math.floor(Math.random() * 1100) + 250;
        
        const newFlightsCount = Math.max(1300, prev.activeFlights + deltaFlights);
        const newDailyPassengers = prev.dailyPassengers + deltaPassengers;
        const newRevenue = prev.revenueToday + deltaRevenue;
        
        let newSurge = prev.surgeMultiplier;
        if (Math.random() > 0.85) {
          newSurge = Math.round((1.1 + Math.random() * 0.45) * 100) / 100;
        }

        let newWaitTime = prev.avgWaitTime;
        if (Math.random() > 0.75) {
          newWaitTime = Math.round((3.6 + Math.random() * 1.4) * 10) / 10;
        }

        return {
          ...prev,
          activeFlights: airspaceFreezeActive() ? 0 : newFlightsCount,
          dailyPassengers: newDailyPassengers,
          revenueToday: newRevenue,
          surgeMultiplier: newSurge,
          avgWaitTime: newWaitTime,
          co2Savings: Math.round((prev.co2Savings + 0.006) * 1000) / 1000,
        };
      });

      setFlights((prev) => 
        prev.map((f, idx) => {
          if (idx === 4 && Math.random() > 0.75) {
            return {
              ...f,
              status: f.status === "completed" ? "delayed" : "completed"
            };
          }
          return f;
        })
      );
    }, 5500);

    return () => clearInterval(timer);
  }, [selectedView]);

  const airspaceFreezeActive = () => {
    // If first active flight is diverted in manual operations mode
    return flights.length > 0 && flights[0].status === "diverted";
  };

  // Submit inquiry to AI Copilot
  const handleAiInquirySubmit = (e?: React.FormEvent, customPrompt?: string) => {
    if (e) e.preventDefault();
    const prompt = customPrompt || aiInquiry;
    if (!prompt.trim()) return;

    // Append user query
    const userMsg = { sender: "user" as const, text: prompt };
    setAiChatLog(prev => [...prev, userMsg]);
    setAiInquiry("");
    setIsAiLoading(true);

    // Simulated responsive AI model output answering "What, Why & what to do next"
    setTimeout(() => {
      let aiResponseText = "";
      let daxCode = "";

      if (prompt.includes("/forecast")) {
        aiResponseText = "DATA SPECTRUM REPORT: Autopilot commuter demand curves predict a +18% booking spike at Bandra BKC terminus within 45 minutes due to local rail flooding delays. RECOMMENDATION: Dispatch additional empty 4-seater drones to BKC Hub 2 immediately to mitigate waiting queue overhead.";
      } else if (prompt.includes("/dax-measure")) {
        aiResponseText = "DAX COMPILER LOG: Calculated high-speed measure to tracking real-time VTOL energy utilization rates:";
        daxCode = "Fleet_Rationing_Coef = \nDIVIDE(\n  SUMX('Fact_Flight_Operations', 'Fact_Flight_Operations'[Energy_Consumed_MJ]),\n  COUNTROWS('Fact_Flight_Operations'),\n  0\n)";
      } else if (prompt.includes("mitigate") || prompt.includes("wind") || prompt.includes("congest")) {
        aiResponseText = "AIRSPACE ACTION CLEARED: Wind gusts at BKC conflux are high (45km/h). Autopilot separation buffer increased to 450 meters. Advised all southbound flights to enter coastal bypass airway vectors.";
      } else {
        aiResponseText = "ANALYSIS COMPLETE: Current Mumbai grid performance is optimal. High grid densities are localized in Bandra-Worli corridors. The recommended action is to sustain current surplus charging levels at Nariman Point corporate ports.";
      }

      setAiChatLog(prev => [...prev, { 
        sender: "copilot", 
        text: aiResponseText,
        code: daxCode || undefined
      }]);
      setIsAiLoading(false);
    }, 1000);
  };

  // Trigger simulated voice command
  const triggerVoiceListener = () => {
    setIsVoiceListening(true);
    setTimeout(() => {
      setIsVoiceListening(false);
      handleAiInquirySubmit(undefined, "BKC wind conflux mitigation action sequence");
      triggerAlertBanner("VOICE COMMAND RECEIVED: 'Mitigate BKC wind conflux.' Transcribing stream...");
    }, 3200);
  };

  // Header quick actions execution
  const executeQuickAction = (action: string) => {
    if (action === "optimize-bkc") {
      setGridState(prev => ({
        ...prev,
        avgWaitTime: Math.max(1.8, prev.avgWaitTime - 0.7),
        safetyScore: Math.min(100.0, prev.safetyScore + 0.05)
      }));
      triggerAlertBanner("OPTIMIZATION: BKC air lane coordinates pruned. Auto-piloting speed separations recalibrated.");
    } else if (action === "force-altitudes") {
      setFlights(p => p.map(f => f.status === "active" ? { ...f, averageAltitude: 350 } : f));
      triggerAlertBanner("COMMAND AUTHORIZED: Hard average flight ceiling lock set at standard 350m vectors.");
    } else if (action === "rotate-keys") {
      const newKey = `sk-live-mumbai-${Math.floor(1000 + Math.random() * 9000)}-aes`;
      setApiKeyActive(newKey);
      setApiLogs(p => [`ROTATION: Client authorization keys rotated Safely [${new Date().toLocaleTimeString()}]`, ...p]);
      triggerAlertBanner(`ADMIN COMPLIANCE: Primary JWT access keys rotated successfully.`);
    }
  };

  // Primary Workspace sidebar navigation items
  const sidebarNavItems: Array<{ 
    view: AppView; 
    label: string; 
    category: "control" | "analytics" | "system";
    badge?: string;
    icon: React.ReactNode;
  }> = [
    { view: "operations", label: "Operations Command Space", category: "control", badge: "Live Map", icon: <Layers className="w-4 h-4 text-cyan-400" /> },
    { view: "executive", label: "Executive Command Summary", category: "analytics", icon: <Users className="w-4 h-4 text-slate-350" /> },
    { view: "passenger", label: "Passenger Intelligence Stats", category: "analytics", icon: <Users className="w-4 h-4 text-slate-350" /> },
    { view: "traffic", label: "Air Traffic Density Desk", category: "control", icon: <Compass className="w-4 h-4 text-slate-350" /> },
    { view: "revenue", label: "Revenue Ledger Intelligence", category: "analytics", icon: <DollarSign className="w-4 h-4 text-slate-350" /> },
    { view: "safety", label: "Safety Assurance Dashboard", category: "control", icon: <ShieldCheck className="w-4 h-4 text-slate-350" /> },
    { view: "fleet", label: "Vessel Fleet Performance", category: "analytics", icon: <Activity className="w-4 h-4 text-slate-350" /> },
    { view: "pred-lab", label: "A.I. Predictive Lab Room", category: "analytics", icon: <Sparkles className="w-4 h-4 text-slate-350" /> },
    { view: "sustainability", label: "Sustainability Index Report", category: "analytics", badge: "CO₂", icon: <Leaf className="w-4 h-4 text-emerald-450 text-emerald-400" /> },
    { view: "digital-twin", label: "Digital Twin Airspace Space", category: "system", icon: <Globe className="w-4 h-4 text-slate-350" /> },
    { view: "powerbi-docs", label: "Power BI DAX Architect Hub", category: "system", icon: <Cpu className="w-4 h-4 text-slate-350" /> }
  ];

  // Command palette search results
  const filteredCommandResults = sidebarNavItems.filter(item => 
    item.label.toLowerCase().includes(paletteSearch.toLowerCase())
  );

  return (
    <div className={`min-h-screen bg-[#070913] font-sans text-slate-200 flex flex-col md:flex-row antialiased relative transition-all duration-300 ${highContrastMode ? "theme-true-black" : ""}`}>
      
      {/* 1. LEFT SIDEBAR NAVIGATION DRAWER: Flat, clean visual look (Palantir/Microsoft Fabric-inspired) */}
      <aside className={`shrink-0 bg-[#090c16] border-r border-slate-900 flex flex-col justify-between transition-all duration-300 z-30 relative ${
        sidebarOpen ? "w-64" : "w-0 md:w-16 md:overflow-hidden"
      }`} aria-label="Aviation Management Sidebar">
        
        <div className="space-y-6">
          
          {/* Brand header panel - Professional literal labels */}
          <div className="h-16 px-4 bg-[#070913] border-b border-slate-900 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-slate-900 rounded flex items-center justify-center border border-slate-800 shrink-0">
                <Radio className="w-4 h-4 text-cyan-400" />
              </div>
              <div className={`${sidebarOpen ? "block font-sans" : "hidden md:hidden"}`}>
                <h1 className="font-bold text-[12px] uppercase tracking-wider text-white">MUMBAI SKYGRID</h1>
                <span className="text-[9px] text-cyan-400 font-mono tracking-widest block leading-none font-bold">OPERATIONS SAAS</span>
              </div>
            </div>
            
            <button 
              onClick={() => setSidebarOpen(false)}
              className="text-slate-400 hover:text-white transition p-1 rounded hover:bg-slate-900 md:hidden cursor-pointer"
              aria-label="Minimize sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation categories list */}
          <nav className="px-3.5 space-y-5 text-left">
            
            {/* Category: Operational Space Control */}
            <div className="space-y-1">
              <span className={`text-[9px] font-mono text-slate-500 uppercase tracking-widest px-2.5 block mb-1.5 ${
                sidebarOpen ? "block" : "hidden"
              }`}>
                Aviation Controls
              </span>
              {sidebarNavItems.filter(item => item.category === "control").map((item) => {
                const isActive = selectedView === item.view;
                return (
                  <button
                    key={item.view}
                    onClick={() => setSelectedView(item.view)}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded text-xs transition font-semibold cursor-pointer ${
                      isActive 
                        ? "bg-[#101626] text-cyan-400 border-l border-cyan-400 font-bold" 
                        : "text-slate-400 hover:text-white hover:bg-slate-900/40"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="shrink-0">{item.icon}</span>
                      <span className={`truncate ${sidebarOpen ? "block" : "hidden md:hidden"}`}>{item.label.split("Summary")[0].split("Stats")[0].split("Index")[0].split("Desk")[0]}</span>
                    </div>
                    {item.badge && sidebarOpen && (
                      <span className="text-[8px] font-mono bg-cyan-950/40 text-cyan-400 border border-cyan-900/60 font-bold px-1.5 py-0.5 rounded uppercase font-semibold">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Category: Advanced Fleet & Financial Intelligence */}
            <div className="space-y-1">
              <span className={`text-[9px] font-mono text-slate-500 uppercase tracking-widest px-2.5 block mb-1.5 ${
                sidebarOpen ? "block" : "hidden"
              }`}>
                Grid Analytics
              </span>
              {sidebarNavItems.filter(item => item.category === "analytics").map((item) => {
                const isActive = selectedView === item.view;
                return (
                  <button
                    key={item.view}
                    onClick={() => setSelectedView(item.view)}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded text-xs transition font-semibold cursor-pointer ${
                      isActive 
                        ? "bg-[#101626] text-cyan-400 border-l border-cyan-400 font-bold" 
                        : "text-slate-400 hover:text-white hover:bg-slate-900/40"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="shrink-0">{item.icon}</span>
                      <span className={`truncate ${sidebarOpen ? "block" : "hidden md:hidden"}`}>{item.label.split("Summary")[0].split("Stats")[0].split("Index")[0].split("Report")[0].split("Room")[0]}</span>
                    </div>
                    {item.badge && sidebarOpen && (
                      <span className="text-[8px] font-mono bg-emerald-950/20 text-emerald-400 border border-emerald-900/30 px-1 py-0.5 rounded font-bold uppercase">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Category: Spatial Twin & Semantic Databases */}
            <div className="space-y-1">
              <span className={`text-[9px] font-mono text-slate-500 uppercase tracking-widest px-2.5 block mb-1.5 ${
                sidebarOpen ? "block" : "hidden"
              }`}>
                Infrastructure
              </span>
              {sidebarNavItems.filter(item => item.category === "system").map((item) => {
                const isActive = selectedView === item.view;
                return (
                  <button
                    key={item.view}
                    onClick={() => setSelectedView(item.view)}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded text-xs transition font-semibold cursor-pointer ${
                      isActive 
                        ? "bg-[#101626] text-cyan-400 border-l border-cyan-400 font-bold" 
                        : "text-slate-400 hover:text-white hover:bg-slate-900/40"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="shrink-0">{item.icon}</span>
                      <span className={`truncate ${sidebarOpen ? "block" : "hidden md:hidden"}`}>{item.label.split("Space")[0].split("Hub")[0]}</span>
                    </div>
                  </button>
                );
              })}
            </div>

          </nav>
        </div>

        {/* Workspace audit log metadata at bottom */}
        <div className={`p-4 border-t border-slate-900 bg-[#070913] text-[9.5px] text-slate-500 font-mono space-y-1 z-10 ${
          sidebarOpen ? "block" : "hidden md:hidden"
        }`}>
          <div className="flex justify-between">
            <span>SECURE TENANT:</span>
            <span className="text-white font-bold">MMRDA-WEST-IN</span>
          </div>
          <div className="flex justify-between">
            <span>AUDIT STATUS:</span>
            <span className="text-emerald-400">PASSED</span>
          </div>
        </div>
      </aside>

      {/* 2. PRIMARY VIEWPORT WRAPPER */}
      <div className="flex-grow flex flex-col min-w-0 bg-[#060810] relative">
        
        {/* INTERACTIVE COMPANION ALERT BANNER */}
        {alertBanner && (
          <div className="bg-[#090d16] border border-cyan-400/40 py-2.5 px-4 text-xs font-mono text-slate-100 flex items-center justify-between shadow-2xl z-40 select-none animate-slide-in relative">
            <span className="flex items-center gap-1.5 text-cyan-400">
              <Sparkles className="w-4 h-4 animate-bounce" />
              {alertBanner}
            </span>
            <button onClick={() => setAlertBanner(null)} className="text-slate-400 hover:text-white px-2">×</button>
          </div>
        )}

        {/* 3. SAAS CONTROL HEADER: Replaces old dashboard selectors with robust enterprise headers */}
        <header className="h-16 px-4 md:px-6 bg-[#090c16] border-b border-slate-900 flex items-center justify-between shrink-0 z-25 select-none text-xs">
          
          <div className="flex items-center gap-4 flex-grow max-w-4xl">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-slate-400 hover:text-white transition p-1.5 rounded hover:bg-slate-900 cursor-pointer"
              aria-label="Toggle navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Workspace Switcher */}
            <div className="hidden lg:flex items-center gap-2">
              <span className="text-[10px] font-mono text-slate-550 text-slate-500 tracking-widest uppercase">WORKSPACE:</span>
              <select 
                value={workspaceTenant}
                onChange={(e) => {
                  setWorkspaceTenant(e.target.value);
                  triggerAlertBanner(`WORKSPACE SEGMENT: Restructured variables for ${e.target.value}.`);
                }}
                className="bg-[#0e1220] border border-slate-900 text-slate-250 py-1 px-2 rounded hover:border-slate-800 text-xs focus:ring-1 focus:ring-cyan-500"
              >
                <option value="Mumbai SkyGrid Primary">Mumbai Municipal SkyGrid</option>
                <option value="Executive Financial Segment">Corporate Finance Ledger</option>
                <option value="Strategic Security & Audit">Aviation Security Hold</option>
              </select>
            </div>

            {/* Active Role Selector - Customized Workspace layout trigger */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-slate-500 tracking-widest uppercase hidden sm:inline">ROLE:</span>
              <select 
                value={activeRole}
                onChange={(e) => {
                  setActiveRole(e.target.value);
                  triggerAlertBanner(`ROLE SWITCHED: Active cockpit parameters parsed for Senior ${e.target.value}.`);
                }}
                className="bg-[#0e1220] border border-slate-900 text-cyan-400 font-bold py-1 px-2 rounded hover:border-slate-800 text-xs focus:ring-1 focus:ring-cyan-500 cursor-pointer"
              >
                <option value="Operations Director (All Active Flows)">Operations Director</option>
                <option value="Executive VP (Strategic Finance)">Executive VP (Finance)</option>
                <option value="Fleet Supervisor (VTOL Maintenance)">Fleet Supervisor</option>
                <option value="Principal Safety Officer">Safety Officer</option>
                <option value="Quantum Data Analyst">Data Analyst</option>
                <option value="Systems Administrator (RBAC Security)">Systems Administrator</option>
              </select>
            </div>

            {/* Quick Actions Shortcuts Trigger dropdown */}
            <div className="hidden xl:flex items-center gap-1.5 bg-[#0e1220] border border-slate-900 px-1 py-1 rounded">
              <span className="text-[9.5px] font-mono text-slate-500 uppercase px-2 font-bold select-none">TRIGGERS:</span>
              <button 
                onClick={() => executeQuickAction("optimize-bkc")}
                className="bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white px-2 py-0.5 rounded text-[10px] cursor-pointer"
              >
                Prune BKC
              </button>
              <button 
                onClick={() => executeQuickAction("force-altitudes")}
                className="bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white px-2 py-0.5 rounded text-[10px] cursor-pointer"
              >
                Altitude Cap
              </button>
              <button 
                onClick={() => executeQuickAction("rotate-keys")}
                className="bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white px-2 py-0.5 rounded text-[10px] cursor-pointer"
              >
                Rotate Keys
              </button>
            </div>
          </div>

          {/* Header Right components */}
          <div className="flex items-center gap-4 shrink-0">
            
            {/* Theme Toggle Button - Switches to True-Black Command Visibility Mode */}
            <button
              onClick={() => {
                setHighContrastMode(!highContrastMode);
                triggerAlertBanner(
                  !highContrastMode
                    ? "VISIBILITY CONTROL: Switched to True-Black Tactical High-Contrast Mode for optimal command center readability." 
                    : "VISIBILITY CONTROL: Restored slate-space ambient dark theme values."
                );
              }}
              className="p-2 ml-1 rounded bg-[#0e1220] border border-slate-900 hover:border-slate-800 text-slate-400 hover:text-slate-200 transition flex items-center justify-center cursor-pointer shrink-0"
              title={highContrastMode ? "Restore ambient dark theme" : "Activate true-black high-contrast visibility"}
            >
              {highContrastMode ? (
                <div className="flex items-center gap-1.5 px-0.5">
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[10px] font-mono text-amber-400 font-bold hidden sm:inline uppercase">AMBIENT</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-0.5">
                  <Moon className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                  <span className="text-[10px] font-mono text-cyan-400 font-bold hidden sm:inline uppercase">TRUE BLACK</span>
                </div>
              )}
            </button>

            {/* Search command shortcut */}
            <button 
              onClick={() => setIsCommandPaletteOpen(true)}
              className="hidden md:flex items-center gap-2.5 bg-[#0e1220] border border-slate-900 px-3 py-1.5 rounded hover:border-slate-800 text-slate-450 text-slate-400 font-medium "
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search airspace vectors...</span>
              <kbd className="font-mono text-[9px] bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 text-slate-500">⌘K</kbd>
            </button>

            {/* Notification alert bells triggers dropdown */}
            <div className="relative">
              <button 
                onClick={() => { setShowNotifications(!showNotifications); setShowAccountMenu(false); }}
                className="text-slate-400 hover:text-slate-200 transition p-2 hover:bg-slate-900 rounded relative cursor-pointer"
                aria-label="SaaS alerts"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-rose-500 rounded-full" />
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 bg-[#0e1220] border border-slate-900 rounded-lg shadow-2xl z-50 overflow-hidden divide-y divide-slate-900 animate-scale-up text-left">
                  <div className="p-3 bg-[#0a0d16] flex justify-between items-center">
                    <span className="font-semibold text-white">Grid System Warnings</span>
                    <button onClick={() => setNotifications([])} className="text-[10px] text-cyan-400 hover:underline">Clear all</button>
                  </div>
                  <div className="max-h-64 overflow-y-auto divide-y divide-slate-900/60 text-xs">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-slate-500 font-mono">No active systemic warnings.</div>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className="p-3 hover:bg-slate-900/40 transition relative">
                          <p className="text-slate-300 pr-4 leading-normal">{n.text}</p>
                          <span className="text-[9px] text-[#22d3ee] font-mono mt-1 block font-medium">{n.time}</span>
                          <span className={`absolute top-3.5 right-3 w-1.5 h-1.5 rounded-full ${n.type === "warning" ? "bg-amber-400" : "bg-cyan-400"}`} />
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Account dropdown profile */}
            <div className="relative">
              <button
                onClick={() => { setShowAccountMenu(!showAccountMenu); setShowNotifications(false); }}
                className="w-7 h-7 rounded bg-[#0e1220] border border-slate-800 text-[#22d3ee] font-bold font-mono text-[11px] flex items-center justify-center hover:border-slate-700 cursor-pointer"
              >
                OP
              </button>

              {showAccountMenu && (
                <div className="absolute right-0 mt-3 w-56 bg-[#0e1220] border border-slate-900 rounded-lg shadow-2xl z-50 overflow-hidden text-xs text-left animate-scale-up">
                  <div className="p-3 bg-[#0a0d16] flex items-center gap-2.5 border-b border-slate-900">
                    <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-slate-300 font-mono font-bold border border-slate-800">
                      OP
                    </div>
                    <div>
                      <h4 className="font-bold text-white leading-none">Chakraborty T.</h4>
                      <span className="text-[9.5px] text-slate-500 font-mono">Principal Director</span>
                    </div>
                  </div>
                  <div className="p-1 space-y-0.5">
                    <button 
                      onClick={() => { setShowAccountMenu(false); setSelectedView("powerbi-docs"); }}
                      className="w-full text-left px-3 py-2 rounded text-slate-300 hover:bg-slate-900/40 transition flex items-center gap-2 cursor-pointer font-medium"
                    >
                      <Cpu className="w-3.5 h-3.5 text-slate-505 text-slate-500" />
                      Dynamic DAX Docs
                    </button>
                    <button 
                      onClick={() => { setShowAccountMenu(false); setSelectedView("sustainability"); }}
                      className="w-full text-left px-3 py-2 rounded text-slate-300 hover:bg-slate-900/40 transition flex items-center gap-2 cursor-pointer font-medium"
                    >
                      <Leaf className="w-3.5 h-3.5 text-[#22c55e]" />
                      Eco Sourcing Index
                    </button>
                  </div>
                  <div className="p-1.5 border-t border-slate-900 bg-slate-950/60">
                    <button 
                      onClick={() => { 
                        setShowAccountMenu(false); 
                        alert("Session safely archived on locked AWS ledger."); 
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded text-rose-450 text-rose-400 hover:bg-rose-950/20 font-bold transition flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Close secure terminal
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* 4. PRIMARY MAIN SCROLLABLE VIEWPORT AREA */}
        <main className="flex-grow p-4 md:p-6 overflow-y-auto max-w-7xl mx-auto w-full pb-20 space-y-6 text-xs text-left" id="saas-main-viewport">
          
          {selectedView === "operations" && (
            <OperationsView 
              gridState={gridState} 
              setGridState={setGridState} 
              flights={flights} 
              setFlights={setFlights}
              activeRole={activeRole}
            />
          )}

          {selectedView === "executive" && <ExecutiveView gridState={gridState} flights={flights} />}
          {selectedView === "passenger" && <PassengerView gridState={gridState} />}
          {selectedView === "traffic" && <TrafficView gridState={gridState} flights={flights} />}
          {selectedView === "revenue" && <RevenueView gridState={gridState} />}
          {selectedView === "safety" && <SafetyView gridState={gridState} />}
          {selectedView === "fleet" && <FleetView telemetry={telemetry} />}
          {selectedView === "pred-lab" && <PredictiveLabView />}
          {selectedView === "digital-twin" && <DigitalTwinView flights={flights} />}
          {selectedView === "powerbi-docs" && <PowerBIArchView />}
          {selectedView === "sustainability" && <SustainabilityView gridState={gridState} />}

        </main>
      </div>

      {/* 5. FLOATING AI AGENT WIDGET (Bottom Right Expandable Chat Bubbles & Voice, strictly hidden unless needed) */}
      <div className="fixed bottom-4 right-4 z-50 select-none">
        
        {/* Expanded CoPilot Agent Dialog Bubble */}
        {isCopilotOpen ? (
          <div className="bg-[#0b0f19] border border-slate-900 hover:border-slate-800 rounded-xl shadow-2xl w-80 max-w-sm overflow-hidden flex flex-col justify-between text-xs animate-scale-up absolute bottom-14 right-0 leading-normal">
            
            {/* Agent Header dialog */}
            <div className="px-3 py-2.5 bg-[#080a13] border-b border-slate-900 flex justify-between items-center text-white font-sans">
              <div className="flex items-center gap-1.5 font-bold text-[11.5px]">
                <Bot className="w-4 h-4 text-cyan-400" />
                <span>Grid A.I. Co-Pilot Desk</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse pl-0.5" />
              </div>
              <button onClick={() => setIsCopilotOpen(false)} className="text-slate-500 hover:text-white px-1 leading-none text-base cursor-pointer">×</button>
            </div>

            {/* Contextual intelligent advice bar */}
            <div className="bg-slate-950/80 px-3 py-2 border-b border-slate-900 text-[10px] text-cyan-400 font-mono italic">
              Context: windTolerance limits operating at {gridState.safetyScore > 99.4 ? "Optimal High Hold" : "Pre-Warning Margins"}.
            </div>

            {/* Chat list block with dynamic scrollbars */}
            <div className="p-3 h-52 overflow-y-auto space-y-3 bg-[#080b13] scrollbar-thin scrollbar-thumb-slate-900 text-left">
              {aiChatLog.map((chat, idx) => (
                <div key={idx} className={`space-y-1 ${chat.sender === "user" ? "text-right" : "text-left"}`}>
                  <span className="text-[9.5px] font-mono text-slate-500 font-bold block uppercase">
                    {chat.sender === "user" ? "HQ OP" : "SYSTEM CO-PILOT"}
                  </span>
                  <div className={`p-2 rounded-lg inline-block text-[11px] leading-relaxed max-w-[92%] ${
                    chat.sender === "user" 
                      ? "bg-cyan-950/40 text-cyan-250 border border-cyan-900/30 text-left" 
                      : "bg-[#0f1423] text-slate-300 border border-slate-800 text-left"
                  }`}>
                    {chat.text}
                    {chat.code && (
                      <pre className="mt-2 font-mono text-[9px] text-emerald-400 bg-slate-950/60 p-2 rounded overflow-x-auto whitespace-pre border border-slate-900 select-all font-semibold">
                        {chat.code}
                      </pre>
                    )}
                  </div>
                </div>
              ))}

              {isAiLoading && (
                <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[9.5px]">
                  <RefreshCw className="w-3 h-3 animate-spin text-cyan-400" />
                  <span>Grid intelligence compiles response...</span>
                </div>
              )}
            </div>

            {/* Dynamic Voice helper listening waveform bar */}
            {isVoiceListening && (
              <div className="bg-slate-950 border-t border-slate-900 py-2.5 px-3 flex flex-col items-center gap-1.5 text-[9.5px] font-mono text-rose-450 text-rose-400 animate-pulse">
                <div className="flex gap-1 h-3.5 items-end justify-center">
                  <div className="w-[1.5px] h-3 bg-rose-500 animate-bounce" style={{ animationDelay: "0.1s" }} />
                  <div className="w-[1.5px] h-4 bg-rose-400 animate-bounce" style={{ animationDelay: "0.3s" }} />
                  <div className="w-[1.5px] h-2.5 bg-rose-500 animate-bounce" style={{ animationDelay: "0.2s" }} />
                  <div className="w-[1.5px] h-5 bg-rose-300 animate-bounce" style={{ animationDelay: "0.5s" }} />
                  <div className="w-[1.5px] h-3.5 bg-rose-500 animate-bounce" style={{ animationDelay: "0.4s" }} />
                </div>
                <span>DICTATING OPERATOR OVERRIDE STREAM...</span>
              </div>
            )}

            {/* Predefined prompt shortcut tags for faster workflow */}
            <div className="p-1 px-1.5 bg-[#0a0d16] border-t border-slate-900/60 flex flex-wrap gap-1">
              <button 
                onClick={(e) => handleAiInquirySubmit(e, "/forecast BKC demand load")}
                className="text-[9.5px] font-mono text-slate-400 hover:text-[#22d3ee] bg-slate-900 border border-slate-850 px-1.5 py-0.5 rounded cursor-pointer transition"
              >
                /forecast BKC
              </button>
              <button 
                onClick={(e) => handleAiInquirySubmit(e, "/dax-measure fleet energy")}
                className="text-[9.5px] font-mono text-slate-400 hover:text-[#22d3ee] bg-slate-900 border border-slate-850 px-1.5 py-0.5 rounded cursor-pointer transition"
              >
                /dax-measure
              </button>
              <button 
                onClick={(e) => handleAiInquirySubmit(e, "Mitigate wind conflux")}
                className="text-[9.5px] font-mono text-slate-400 hover:text-rose-400 bg-slate-900 border border-slate-850 px-1.5 py-0.5 rounded cursor-pointer transition"
              >
                Mitigate BKC Wind
              </button>
            </div>

            {/* Text message keyboard input */}
            <form onSubmit={(e) => handleAiInquirySubmit(e)} className="p-2 border-t border-slate-900 bg-[#080b13] flex gap-1 items-center">
              <input 
                type="text" 
                placeholder="Ask Co-Pilot or type command..." 
                value={aiInquiry}
                onChange={(e) => setAiInquiry(e.target.value)}
                className="bg-slate-950 border border-slate-900 rounded p-1.5 text-[11px] text-slate-200 placeholder-slate-650 focus:outline-none w-full"
              />
              
              {/* Voice micro command shortcut */}
              <button 
                type="button"
                onClick={triggerVoiceListener}
                className="p-1.5 bg-slate-900 border border-slate-850 hover:bg-slate-800 text-slate-350 hover:text-white rounded cursor-pointer shrink-0 transition"
                title="Dictate action rule"
              >
                <Terminal className="w-3.5 h-3.5 text-rose-450" />
              </button>

              <button 
                type="submit"
                className="p-1.5 bg-slate-900 border border-[#22d3ee]/40 text-[#22d3ee] hover:bg-[#1a2d42] rounded shrink-0 cursor-pointer transition"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

          </div>
        ) : null}

        {/* Floating Toggle Button */}
        <button
          onClick={() => setIsCopilotOpen(!isCopilotOpen)}
          className={`w-11 h-11 rounded-full flex items-center justify-center border transition shadow-2xl cursor-pointer ${
            isCopilotOpen 
              ? "bg-[#0d1321] border-[#22d3ee] text-[#22d3ee]" 
              : "bg-[#090d16] hover:bg-[#101423] border-slate-800 hover:border-cyan-400 text-white"
          }`}
          title="Toggle Co-Pilot Virtual Desk support"
        >
          <Bot className="w-5 h-5" />
        </button>

      </div>

      {/* 6. INTERACTIVE COMMAND PALETTE DIALOG OVERLAY SCREEN (Ctrl+K popup modal) */}
      {isCommandPaletteOpen && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none">
          <div 
            className="bg-[#0e1220] border border-slate-900 rounded-lg shadow-2xl w-full max-w-xl overflow-hidden divide-y divide-slate-905 divide-slate-900 text-xs text-left animate-scale-up"
            role="document" 
            aria-modal="true"
          >
            {/* Input query */}
            <div className="p-4 flex items-center gap-3">
              <Search className="w-5 h-5 text-slate-450 text-slate-400 shrink-0" />
              <input 
                type="text" 
                placeholder="Type command E.g. 'Revenue', 'Safety', 'Power BI', 'Sustainability'..."
                value={paletteSearch}
                onChange={(e) => setPaletteSearch(e.target.value)}
                className="bg-transparent border-none outline-none font-sans text-[13px] text-white placeholder-slate-600 w-full"
                autoFocus
              />
              <button 
                onClick={() => setIsCommandPaletteOpen(false)}
                className="text-[9.5px] text-slate-500 bg-slate-950 border border-slate-850 px-2 py-1 rounded"
              >
                Close
              </button>
            </div>

            {/* Results */}
            <div className="max-h-72 overflow-y-auto p-2 space-y-0.5">
              <div className="px-2.5 py-1 text-[8.5px] font-mono text-cyan-400 font-bold uppercase tracking-widest block mb-1">
                Workspace Vectors ({filteredCommandResults.length})
              </div>
              
              {filteredCommandResults.length === 0 ? (
                <div className="px-4 py-3 text-slate-550 text-center font-mono">No matching airspace sectors parsed.</div>
              ) : (
                filteredCommandResults.map(item => (
                  <button
                    key={item.view}
                    onClick={() => {
                      setSelectedView(item.view);
                      setIsCommandPaletteOpen(false);
                      setPaletteSearch("");
                    }}
                    className="w-full text-left px-2.5 py-2 rounded hover:bg-slate-900/40 transition flex items-center justify-between text-slate-300 hover:text-white cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 font-semibold">
                      <span className="text-slate-500 shrink-0">{item.icon}</span>
                      <span className="font-sans text-xs">{item.label}</span>
                    </div>
                    <span className="text-[9px] font-mono text-[#22d3ee] uppercase font-bold">Launch Workspace</span>
                  </button>
                ))
              )}
            </div>

            <div className="px-4 py-2.5 bg-slate-950 text-slate-500 flex justify-between font-mono text-[9px]">
              <span>Use arrow keys or enter to steer</span>
              <span>Mumbai Corporate Command Hub</span>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
