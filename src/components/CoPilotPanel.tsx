import React, { useState } from "react";
import { 
  Sparkles, Send, Bot, Terminal, ShieldAlert, Cpu, 
  Copy, Check, BarChart2, PieChart, LineChart, HelpCircle, Eye, RefreshCw, Layers
} from "lucide-react";
import { SmartGridState } from "../types";

interface CoPilotPanelProps {
  gridState: SmartGridState;
}

interface Block {
  type: "text" | "dax" | "pbi-visual";
  content: string;
}

// Helper to extract dax and power bi blocks from raw response
function parseMessageContent(text: string): Block[] {
  const blocks: Block[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    const daxIdx = remaining.indexOf("```dax");
    const pbiIdx = remaining.indexOf("```pbi-visual");
    
    let startIndex = -1;
    let blockType: "dax" | "pbi-visual" = "dax";
    
    if (daxIdx !== -1 && pbiIdx !== -1) {
      if (daxIdx < pbiIdx) {
        startIndex = daxIdx;
        blockType = "dax";
      } else {
        startIndex = pbiIdx;
        blockType = "pbi-visual";
      }
    } else if (daxIdx !== -1) {
      startIndex = daxIdx;
      blockType = "dax";
    } else if (pbiIdx !== -1) {
      startIndex = pbiIdx;
      blockType = "pbi-visual";
    }

    if (startIndex === -1) {
      blocks.push({ type: "text", content: remaining });
      break;
    }

    if (startIndex > 0) {
      blocks.push({ type: "text", content: remaining.substring(0, startIndex) });
    }

    const markerLength = blockType === "dax" ? 6 : 13;
    const endBlockIdx = remaining.indexOf("```", startIndex + markerLength);
    if (endBlockIdx === -1) {
      blocks.push({ 
        type: blockType, 
        content: remaining.substring(startIndex + markerLength) 
      });
      break;
    } else {
      blocks.push({
        type: blockType,
        content: remaining.substring(startIndex + markerLength, endBlockIdx).trim()
      });
      remaining = remaining.substring(endBlockIdx + 3);
    }
  }

  return blocks;
}

// 1. DAX Formula Formatter and Interactive Copier component
function DAXMeasureRenderer({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Basic syntax highlight regex lines helpers
  const highlightLine = (line: string) => {
    if (line.startsWith("//")) {
      return <span className="text-slate-500 italic">{line}</span>;
    }
    // Highlight common DAX functions
    const daxKeywords = ["CALCULATE", "SUMX", "SUM", "AVERAGEX", "AVERAGE", "DIVIDE", "FILTER", "ALL", "VALUES", "DATESINPERIOD", "LASTDATE", "COUNTROWS", "COUNT"];
    
    let parts: React.ReactNode[] = [line];
    
    daxKeywords.forEach((kw) => {
      const newParts: React.ReactNode[] = [];
      parts.forEach((part) => {
        if (typeof part === "string") {
          const splitPart = part.split(kw);
          if (splitPart.length > 1) {
            splitPart.forEach((subPart, sIdx) => {
              newParts.push(subPart);
              if (sIdx < splitPart.length - 1) {
                newParts.push(<strong key={kw + sIdx} className="text-cyan-400 font-semibold">{kw}</strong>);
              }
            });
          } else {
            newParts.push(part);
          }
        } else {
          newParts.push(part);
        }
      });
      parts = newParts;
    });

    return <span>{parts}</span>;
  };

  return (
    <div className="bg-slate-950 rounded-xl border border-cyan-500/20 overflow-hidden font-mono text-[11px] my-3">
      <div className="px-3 py-2 bg-slate-900 border-b border-cyan-550/10 flex justify-between items-center text-[10px] text-slate-400">
        <span className="flex items-center gap-1.5 text-cyan-400 tracking-wider uppercase font-semibold">
          <Terminal className="w-3.5 h-3.5 animate-pulse" />
          DAX Calculation Formula
        </span>
        <button 
          onClick={handleCopy}
          className="hover:bg-white/5 px-2 py-1 rounded transition text-xs flex items-center gap-1 text-slate-300 hover:text-cyan-400"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? "Copied!" : "Copy Formula"}
        </button>
      </div>

      <div className="p-3.5 overflow-x-auto text-slate-300 leading-relaxed whitespace-pre font-mono scrollbar-thin max-h-[180px]">
        {code.split("\n").map((line, idx) => (
          <div key={idx} className="flex select-text">
            <span className="text-slate-600 w-5 select-none shrink-0 text-right pr-2">{(idx + 1)}</span>
            <span className="text-left">{highlightLine(line)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// 2. High-fidelity Simulated Power BI Visual Specification and Preview component
function PowerBIVisualRenderer({ jsonStr }: { jsonStr: string }) {
  try {
    const visual = JSON.parse(jsonStr);
    const vizType = visual.visualType || "KPI Card";
    
    // Choose icon based on visualType
    const renderIcon = () => {
      switch (vizType) {
        case "Donut Chart": return <PieChart className="w-4 h-4 text-emerald-400" />;
        case "Line Chart": return <LineChart className="w-4 h-4 text-cyan-400" />;
        case "Gauge Chart": return <RefreshCw className="w-4 h-4 text-yellow-400" />;
        default: return <BarChart2 className="w-4 h-4 text-purple-400" />;
      }
    };

    // Render interactive mini SVG mockup based on visualType
    const renderMiniMockup = () => {
      if (vizType === "Clustered Column Chart" || vizType === "Bar Chart") {
        return (
          <div className="space-y-2 py-1">
            <div className="flex items-center gap-2 text-[10px]">
              <span className="w-12 text-slate-400 truncate">Dadar</span>
              <div className="flex-1 h-3 bg-slate-900 rounded overflow-hidden">
                <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded" style={{ width: "85%" }} />
              </div>
              <span className="font-mono text-cyan-400 w-8 text-right font-bold">85%</span>
            </div>
            <div className="flex items-center gap-2 text-[10px]">
              <span className="w-12 text-slate-400 truncate">Bandra</span>
              <div className="flex-1 h-3 bg-slate-900 rounded overflow-hidden">
                <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded" style={{ width: "62%" }} />
              </div>
              <span className="font-mono text-cyan-400 w-8 text-right font-bold">62%</span>
            </div>
            <div className="flex items-center gap-2 text-[10px]">
              <span className="w-12 text-slate-400 truncate">Colaba</span>
              <div className="flex-1 h-3 bg-slate-900 rounded overflow-hidden">
                <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded" style={{ width: "45%" }} />
              </div>
              <span className="font-mono text-cyan-400 w-8 text-right font-bold">45%</span>
            </div>
            <div className="flex items-center gap-2 text-[10px]">
              <span className="w-12 text-slate-400 truncate">Juhu</span>
              <div className="flex-1 h-3 bg-slate-900 rounded overflow-hidden">
                <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded" style={{ width: "74%" }} />
              </div>
              <span className="font-mono text-cyan-400 w-8 text-right font-bold">74%</span>
            </div>
          </div>
        );
      }

      if (vizType === "Line Chart" || vizType === "Area Chart") {
        return (
          <div className="h-20 w-full bg-slate-900/60 rounded border border-slate-800 flex items-end justify-between px-3 pb-1 relative pt-2">
            <div className="absolute top-1 right-2 text-[8px] text-slate-500 font-mono tracking-wider">AMPLITUDE INTENSITY</div>
            
            {/* Draw a faux grid */}
            <div className="absolute inset-0 grid grid-rows-3 pointer-events-none opacity-10">
              <div className="border-b border-white" />
              <div className="border-b border-white" />
              <div className="border-b border-white" />
            </div>

            <svg className="absolute inset-0 w-full h-full p-2 overflow-visible" viewBox="0 0 100 30" preserveAspectRatio="none">
              <path d="M 0 25 Q 15 5 30 15 T 60 4 T 85 20 T 100 12" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
              <path d="M 0 28 Q 15 20 30 25 T 60 12 T 85 25 T 100 18" fill="none" stroke="#eab308" strokeWidth="1" strokeLinecap="round" strokeDasharray="2 2" />
              <circle cx="30" cy="15" r="1.5" fill="#10b981" />
              <circle cx="60" cy="4" r="1.5" fill="#10b981" />
            </svg>
            <div className="w-full flex justify-between text-[8px] text-slate-500 font-mono mt-1">
              <span>08:00</span>
              <span>12:00</span>
              <span>16:00</span>
              <span>20:00</span>
            </div>
          </div>
        );
      }

      if (vizType === "Gauge Chart") {
        return (
          <div className="flex items-center justify-around py-1">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="32" cy="32" r="24" stroke="rgba(255,255,255,0.05)" strokeWidth="4" fill="none" />
                <circle cx="32" cy="32" r="24" stroke="#f59e0b" strokeWidth="5" fill="none" strokeDasharray="150" strokeDashoffset="35" strokeLinecap="round" />
              </svg>
              <div className="absolute text-center">
                <span className="text-[10px] font-mono font-bold text-yellow-400 leading-none">98.4%</span>
                <span className="text-[7px] text-slate-500 uppercase block leading-none">Trust</span>
              </div>
            </div>
            <div className="text-[10px] space-y-1 text-slate-400 font-mono pl-2 border-l border-white/5">
              <div>Target: <span className="text-emerald-400 font-bold">98.4%</span></div>
              <div>Min boundary: <span className="text-slate-500">50%</span></div>
              <div>Telemetry Status: <span className="text-emerald-400">Green</span></div>
            </div>
          </div>
        );
      }

      if (vizType === "Donut Chart") {
        return (
          <div className="flex items-center justify-around py-1">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="w-full h-full rotate-45">
                <circle cx="32" cy="32" r="22" stroke="#0ea5e9" strokeWidth="8" fill="none" strokeDasharray="140" strokeDashoffset="30" />
                <circle cx="32" cy="32" r="22" stroke="#f59e0b" strokeWidth="8" fill="none" strokeDasharray="140" strokeDashoffset="120" />
                <circle cx="32" cy="32" r="22" stroke="#ef4444" strokeWidth="8" fill="none" strokeDasharray="140" strokeDashoffset="132" />
              </svg>
              <div className="absolute text-[8px] font-bold text-slate-400 font-mono">STATUS</div>
            </div>
            <div className="text-[9px] space-y-1 text-slate-400 font-mono">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-sky-500" /> Optimal: 71%
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-yellow-500" /> Degraded: 21%
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500" /> Anomalous: 8%
              </div>
            </div>
          </div>
        );
      }

      // KPI Card by default
      return (
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-md text-center shadow-[inset_0_0_10px_rgba(34,211,238,0.05)]">
          <p className="text-[8px] text-slate-500 font-mono uppercase tracking-wider">Active Airborne Taxis Index</p>
          <p className="text-3xl font-display font-bold text-cyan-400 font-mono tracking-tight my-1">1,420</p>
          <p className="text-[9px] text-emerald-400 flex items-center justify-center gap-1 leading-none font-semibold">
            <span>▲ +14% vs baseline schedule</span>
          </p>
        </div>
      );
    };

    return (
      <div className="bg-[#0b0f19] rounded-xl border border-amber-500/15 overflow-hidden my-3 leading-relaxed relative text-xs">
        {/* Banner indicator */}
        <div className="px-3 py-2 bg-amber-500/10 border-b border-amber-500/10 flex justify-between items-center text-[10px] text-amber-400 select-none">
          <span className="flex items-center gap-1.5 uppercase font-mono font-bold tracking-wider">
            {renderIcon()}
            Power BI Dashboard Visual Design
          </span>
          <span className="font-mono text-[8px] bg-amber-400/10 border border-amber-400/25 px-1.5 rounded-sm">
            {vizType.toUpperCase()}
          </span>
        </div>

        <div className="p-4 space-y-3.5">
          {/* Visual specifications */}
          <div className="space-y-1.5">
            <h5 className="font-display font-semibold text-slate-200 text-xs leading-normal">{visual.title}</h5>
            
            {/* Visual breakdown table mapping fields */}
            <div className="bg-slate-950 rounded-lg p-2.5 border border-white/5 space-y-1">
              <span className="text-[8px] text-slate-500 font-mono uppercase tracking-widest block font-bold">Parameters and Tables</span>
              {Object.entries(visual.tablesAndFields || {}).map(([key, val]: any) => (
                <div key={key} className="flex justify-between items-center text-[10px] border-b border-white/5 pb-1 last:border-0 last:pb-0 font-mono">
                  <span className="text-slate-400 font-medium">{key}:</span>
                  <span className="text-cyan-400 font-semibold">{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Graphical canvas mockup component */}
          <div className="p-3 bg-slate-950/60 rounded-lg border border-white/5">
            <span className="text-[8px] text-slate-500 font-mono uppercase tracking-widest block mb-1.5 font-bold">Dashboard Preview Block</span>
            {renderMiniMockup()}
          </div>

          {/* Formatting rules as tags */}
          {visual.formatting && visual.formatting.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[8px] text-slate-500 font-mono uppercase tracking-widest block font-bold text-left">Formatting Rules</span>
              <div className="flex flex-wrap gap-1">
                {visual.formatting.map((rule: string, rIdx: number) => (
                  <span key={rIdx} className="text-[9px] bg-white/5 hover:bg-white/10 text-slate-300 font-mono px-2 py-0.5 rounded border border-white/5">
                    {rule}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Strategy description */}
          {visual.description && (
            <div className="text-[10px] text-slate-400 leading-relaxed border-t border-white/5 pt-2.5 flex items-start gap-1.5">
              <Eye className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
              <p>{visual.description}</p>
            </div>
          )}
        </div>
      </div>
    );
  } catch (err) {
    // Graceful fallback if JSON fails to parse
    return (
      <div className="bg-[#0b0f19] rounded-xl border border-red-500/20 p-3.5 font-mono text-[10px] text-red-400 my-2">
        <span className="font-bold block mb-1">Visual Config Block (Malformed JSON)</span>
        <pre className="whitespace-pre-wrap leading-relaxed text-slate-400 max-h-[150px] overflow-y-auto pr-1">{jsonStr}</pre>
      </div>
    );
  }
}

// Custom Markdown inline bolding / listing parsed text blocks
function NormalTextRenderer({ text }: { text: string }) {
  return (
    <div className="space-y-1.5">
      {text.split("\n").map((line, lIdx) => {
        if (!line.trim()) return null;

        if (line.startsWith("### ")) {
          return (
            <h4 key={lIdx} className="font-display font-bold text-sky-300 mt-3 mb-1.5 text-xs tracking-wider uppercase border-b border-white/5 pb-1">
              {line.replace("### ", "")}
            </h4>
          );
        }

        if (line.startsWith("#### ")) {
          return (
            <h5 key={lIdx} className="font-display font-medium text-cyan-400 mt-2.5 mb-1 text-[11px] uppercase tracking-wide">
              {line.replace("#### ", "")}
            </h5>
          );
        }

        if (line.startsWith("- ")) {
          return (
            <li key={lIdx} className="ml-3.5 list-disc text-slate-300 my-1 leading-relaxed">
              {line.replace("- ", "")}
            </li>
          );
        }

        // Basic bold markdown parser helper
        if (line.includes("**")) {
          const parts = line.split("**");
          return (
            <p key={lIdx} className="my-1 leading-relaxed">
              {parts.map((p, pIdx) => pIdx % 2 === 1 ? <strong key={pIdx} className="text-cyan-400 font-semibold">{p}</strong> : p)}
            </p>
          );
        }

        return <p key={lIdx} className="my-1 leading-relaxed">{line}</p>;
      })}
    </div>
  );
}

export default function CoPilotPanel({ gridState }: CoPilotPanelProps) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{ sender: "user" | "copilot"; text: string; realAI?: boolean; warning?: string }>>([
    {
      sender: "copilot",
      text: "### 👋 Mumbai SkyGrid AI Assistant Online\n\nI have indexed the **Mumbai SkyGrid 2045** real-time data metrics. Ask me to:\n- **Forecast regional congestion** under the current rain index.\n- **Optimize premium lanes** for highest surge routing.\n- **Review critical safety alerts** and failure predictions.\n\n*How can I assist your team's tactical deployment today?*",
      realAI: true
    }
  ]);

  const presetQueries = [
    "Dax measure to calculate 30-day passenger limits",
    "Generate a Power BI visual to track safety incident metrics",
    "Show corridor revenue surge models as a Power BI visual",
    "Predict remaining useful life (RUL) index for batteries"
  ];

  const handleSendMessage = async (customQuery?: string) => {
    const textToSubmit = customQuery || query;
    if (!textToSubmit.trim()) return;

    setChatHistory((prev) => [...prev, { sender: "user", text: textToSubmit }]);
    setQuery("");
    setLoading(true);

    try {
      const response = await fetch("/api/gemini/copilot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: textToSubmit,
          currentState: gridState,
        }),
      });

      const data = await response.json();
      setChatHistory((prev) => [...prev, { 
        sender: "copilot", 
        text: data.text, 
        realAI: data.realAI,
        warning: data.warning 
      }]);
    } catch {
      setChatHistory((prev) => [...prev, { 
        sender: "copilot", 
        text: "### ❌ Operational Loss Alert\n\nFailed to establish connection to the Central SkyGrid neural cluster. Ensure API broker keys are initialized in the Secrets interface. Falling back to local diagnostic matrix.",
        realAI: false 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const renderBlocks = (text: string) => {
    const blocks = parseMessageContent(text);
    return blocks.map((block, idx) => {
      if (block.type === "dax") {
        return <div key={idx}><DAXMeasureRenderer code={block.content} /></div>;
      }
      if (block.type === "pbi-visual") {
        return <div key={idx}><PowerBIVisualRenderer jsonStr={block.content} /></div>;
      }
      return <div key={idx}><NormalTextRenderer text={block.content} /></div>;
    });
  };

  return (
    <div className="glass-panel rounded-2xl glow-border-cyan flex flex-col h-[580px] overflow-hidden text-white border-white/10" id="copilot-panel">
      {/* Header */}
      <div className="p-4 bg-white/5 border-b border-white/10 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-sky-400 animate-pulse" />
          <div>
            <h3 className="font-display font-semibold text-xs text-sky-100 uppercase tracking-wider">AI Co-Pilot Advisor</h3>
            <p className="text-[9px] text-sky-400 font-mono">MODEL: GEMINI-3.5-FLASH</p>
          </div>
        </div>
        <div className="bg-cyan-500/10 text-cyan-400 font-mono text-[8px] px-2 py-0.5 rounded border border-cyan-500/25 flex items-center gap-1">
          <Cpu className="w-3 h-3 text-cyan-400" />
          BI ANALYTICS CO-PILOT
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-[11px] scrollbar-thin">
        {chatHistory.map((msg, idx) => (
          <div key={idx} className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}>
            <div className={`p-3 rounded-xl max-w-[95%] font-sans whitespace-pre-wrap border ${
              msg.sender === "user" 
                ? "bg-cyan-500/10 text-white border-cyan-550/25" 
                : "bg-white/5 text-white/90 border-white/10"
            }`}>
              {/* Sequential Custom Block Parser */}
              {msg.sender === "user" ? (
                <p className="leading-relaxed">{msg.text}</p>
              ) : (
                <div className="space-y-1.5">{renderBlocks(msg.text)}</div>
              )}

              {msg.warning && (
                <div className="mt-2.5 pt-2 border-t border-amber-900/40 text-[9px] text-amber-400 flex items-center gap-1 font-mono">
                  <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                  {msg.warning}
                </div>
              )}
            </div>
            <span className="text-[8px] text-slate-500 font-mono mt-1 px-1">
              {msg.sender === "user" ? "Grid Operator" : msg.realAI ? "SkyGrid AI Agent" : "Grid Core Fallback"}
            </span>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 p-3 bg-cyan-700/5 rounded-xl max-w-[85%] border border-cyan-500/15 animate-pulse text-cyan-400">
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
            <span className="font-mono text-[9px]">Synthesizing Power BI visuals & DAX calculations...</span>
          </div>
        )}
      </div>

      {/* preset Suggestions */}
      <div className="px-3 py-2 bg-white/5 border-t border-white/10 shrink-0">
        <p className="text-[8px] text-slate-400 font-mono mb-1 flex items-center gap-1 uppercase tracking-wide">
          <Terminal className="w-3 h-3 text-sky-500" />
          Recommended BI Queries
        </p>
        <div className="flex flex-wrap gap-1 max-h-[85px] overflow-y-auto">
          {presetQueries.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              disabled={loading}
              className="text-[9px] bg-white/5 hover:bg-cyan-500/10 text-white/70 hover:text-cyan-400 border border-white/10 hover:border-cyan-500/25 px-2 py-0.5 rounded transition text-left shrink-0 max-w-full truncate"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="p-2.5 bg-white/5 border-t border-white/10 flex gap-2 shrink-0">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
          placeholder="Ask about passenger wait, revenues, safety, or Power BI visuals/DAX..."
          disabled={loading}
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 font-sans"
        />
        <button
          onClick={() => handleSendMessage()}
          disabled={loading || !query.trim()}
          className="bg-cyan-400 hover:bg-cyan-300 disabled:bg-white/5 disabled:text-white/20 text-black px-2.5 rounded-lg transition shrink-0 flex items-center justify-center border border-white/10 shadow-[0_0_10px_rgba(34,211,238,0.3)]"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
