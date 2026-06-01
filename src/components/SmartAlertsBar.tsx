import React, { useState, useEffect } from "react";
import { AlertCircle, ShieldAlert, Sparkles, X, Check, Bell } from "lucide-react";
import { Alert } from "../types";

export default function SmartAlertsBar() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/alerts")
      .then((res) => res.json())
      .then((data) => {
        setAlerts(data.alerts || []);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const handleDismiss = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const handleExecuteRule = (alert: Alert) => {
    // Show success toast simulating action execution
    setToastMessage(`Executed Override Dispatch for ${alert.category}: ${alert.message.split(".")[0]}.`);
    setAlerts((prev) => prev.filter((a) => a.id !== alert.id));
    setTimeout(() => setToastMessage(null), 3500);
  };

  if (loading) {
    return (
      <div className="glass-panel p-4 rounded-2xl flex items-center gap-2 text-slate-400 font-mono text-xs max-w-sm animate-pulse border-sky-955">
        <Bell className="w-4 h-4 animate-bounce text-sky-400" />
        Synchronizing system-wide recommendation logs...
      </div>
    );
  }

  return (
    <div className="space-y-4 relative">
      
      {/* Dynamic Success trigger toast overlay */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 bg-black/90 backdrop-blur-md border border-emerald-500/40 text-emerald-400 px-5 py-3 rounded-2xl text-xs font-mono font-bold z-50 flex items-center gap-2 shadow-2xl animate-bounce glow-border-cyan">
          <Check className="w-4.5 h-4.5 text-emerald-400 shrink-0" />
          {toastMessage}
        </div>
      )}

      {/* Title */}
      <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/10">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-cyan-400 font-bold" />
          <h4 className="font-display font-bold text-[11px] text-white uppercase tracking-widest">Recommended Actions Hub</h4>
        </div>
        <span className="font-mono text-[10px] text-white/45">
          {alerts.length} Pending Rules
        </span>
      </div>

      {/* Alerts Loop */}
      <div className="space-y-3 max-h-[480px] overflow-y-auto">
        {alerts.length === 0 ? (
          <div className="p-5 text-center text-white/40 text-xs italic bg-white/5 border border-dashed border-white/10 rounded-xl space-y-2">
            <ShieldAlert className="w-6 h-6 mx-auto text-white/20" />
            <p>All traffic corridors normalized. No emergency overloads logged.</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <div 
              key={alert.id} 
              className={`p-3.5 border rounded-xl flex flex-col justify-between gap-3 text-xs relative overflow-hidden transition ${
                alert.severity === "critical" 
                  ? "bg-rose-500/10 border-rose-500/20 text-white" 
                  : alert.severity === "warning"
                  ? "bg-amber-500/10 border-amber-500/20 text-white"
                  : alert.severity === "success"
                  ? "bg-emerald-500/10 border-emerald-500/20 text-white"
                  : "bg-white/5 border-white/10 text-white"
              }`}
            >
              {/* Top Details line */}
              <div className="flex justify-between items-start mt-0.5">
                <div className="space-y-0.5">
                  <span className={`text-[9px] font-mono uppercase font-bold tracking-wider ${
                    alert.severity === "critical" ? "text-rose-400" : alert.severity === "warning" ? "text-amber-400" : "text-cyan-400"
                  }`}>
                    {alert.category}
                  </span>
                  <p className="font-sans leading-relaxed text-[11px] font-medium text-white pr-4">
                    {alert.message}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleDismiss(alert.id)}
                    className="text-white/40 hover:text-white p-0.5 rounded transition"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Action execute row button */}
              <div className="flex justify-between items-center text-[10px] font-mono border-t border-white/10 pt-2 shrink-0">
                <span className="text-white/30">{alert.timestamp}</span>
                <button
                  onClick={() => handleExecuteRule(alert)}
                  className={`px-2 py-1 rounded transition text-[9px] font-bold uppercase flex items-center gap-1 border ${
                    alert.severity === "critical"
                      ? "bg-rose-500/20 border-rose-550/30 text-rose-300 hover:bg-rose-500/30"
                      : alert.severity === "warning"
                      ? "bg-amber-500/20 border-amber-550/30 text-amber-300 hover:bg-amber-500/30"
                      : "bg-cyan-500/20 border-cyan-400/20 text-cyan-300 hover:bg-cyan-500/30 shadow-[0_0_10px_rgba(34,211,238,0.2)]"
                  }`}
                >
                  <Sparkles className="w-3 h-3" />
                  EXECUTE GRID OVERRIDE
                </button>
              </div>

            </div>
          ))
        )}
      </div>

    </div>
  );
}
