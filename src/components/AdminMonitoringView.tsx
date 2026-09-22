import React, { useState } from "react";
import {
  Activity,
  Server,
  Database,
  Cpu,
  Radio,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Clock,
  ShieldCheck,
  Terminal,
  Zap
} from "lucide-react";

export const AdminMonitoringView: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  const services = [
    {
      name: "Gemini AI Travel Copilot",
      provider: "@google/genai (Gemini 2.5)",
      status: "Operational",
      latency: "140ms",
      freshness: "Real-time",
      health: 99.8,
    },
    {
      name: "Live Corridor Traffic Feed",
      provider: "Municipal Smart Highway Mesh & Sensors",
      status: "Operational",
      latency: "45ms",
      freshness: "12s ago",
      health: 99.4,
    },
    {
      name: "Met Weather Telemetry",
      provider: "Open-Meteo & Radar Satellite",
      status: "Operational",
      latency: "82ms",
      freshness: "3m ago",
      health: 100,
    },
    {
      name: "Dynamic Speed Camera Database",
      provider: "Transport Department Verified Index",
      status: "Operational",
      latency: "28ms",
      freshness: "Daily sync",
      health: 100,
    },
    {
      name: "Highway Patrol & Police Alerts",
      provider: "City Traffic Enforcement Dispatch",
      status: "Limited Area",
      latency: "94ms",
      freshness: "4m ago",
      health: 94.2,
      note: "Live patrol available for primary urban sector only",
    },
    {
      name: "Toll Gate & FASTag Pricing Feed",
      provider: "NHAI National Electronic Toll Collection",
      status: "Operational",
      latency: "51ms",
      freshness: "Cached hourly",
      health: 99.9,
    },
  ];

  const recentLogs = [
    { time: "16:42:10", type: "INFO", message: "Traffic prediction recalculated for NH-209. Congestion spike detected near Ganapathy." },
    { time: "16:40:02", type: "INFO", message: "Weather alert ingested: Light rain across Peelamedu corridor. Speed reduction factor +14% applied." },
    { time: "16:38:15", type: "SUCCESS", message: "Gemini AI response synthesized in 380ms with 92% confidence rating." },
    { time: "16:35:40", type: "WARN", message: "Speed limit unposted on Vilankurichi Link; UI fallback 'Speed limit information unavailable' rendered." },
    { time: "16:31:00", type: "INFO", message: "Community road issue reported: Pothole on Sathy Road (Upvotes: 4)." },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* HEADER */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-slate-900 text-white">
              <Server className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-900">System Telemetry & Engine Feeds</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Internal telemetry health, API connectivity, model accuracy, and real-time streaming status.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
          <span>Ping All Services</span>
        </button>
      </div>

      {/* STATS OVERVIEW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs text-slate-400 block mb-1">Active Commuters</span>
          <div className="text-2xl font-black text-slate-900">1,428</div>
          <span className="text-[11px] text-emerald-600 font-semibold block mt-1">● 142 on live navigation</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs text-slate-400 block mb-1">Overall System Uptime</span>
          <div className="text-2xl font-black text-emerald-600">99.94%</div>
          <span className="text-[11px] text-slate-500 block mt-1">Past 90 operating days</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs text-slate-400 block mb-1">Prediction Engine Status</span>
          <div className="text-2xl font-black text-purple-600">Active</div>
          <span className="text-[11px] text-slate-500 block mt-1">Mean Absolute Error: 2.1 min</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs text-slate-400 block mb-1">Corridor Telemetry Feeds</span>
          <div className="text-2xl font-black text-slate-900">6 / 6 Live</div>
          <span className="text-[11px] text-emerald-600 font-semibold block mt-1">All pipelines synchronous</span>
        </div>
      </div>

      {/* FEED STATUS TABLE */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Radio className="w-4 h-4 text-emerald-600" />
          Upstream Data Ingestion Providers
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                <th className="pb-3">Feed Name</th>
                <th className="pb-3">Data Provider</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Latency</th>
                <th className="pb-3">Freshness</th>
                <th className="pb-3 text-right">Reliability</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {services.map((s, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="py-3 font-bold text-slate-900">
                    {s.name}
                    {s.note && <span className="block text-[10px] text-amber-600 font-normal">{s.note}</span>}
                  </td>
                  <td className="py-3 text-slate-600">{s.provider}</td>
                  <td className="py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        s.status === "Operational"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td className="py-3 font-mono text-slate-600">{s.latency}</td>
                  <td className="py-3 text-slate-600">{s.freshness}</td>
                  <td className="py-3 text-right font-bold text-slate-900">{s.health}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* RECENT EVENT LOGS */}
      <div className="bg-slate-950 text-slate-300 p-6 rounded-2xl border border-slate-800 font-mono text-xs shadow-xl">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
          <span className="flex items-center gap-2 text-slate-400 font-bold">
            <Terminal className="w-4 h-4 text-blue-400" />
            Live Telemetry Event Log
          </span>
          <span className="text-[10px] text-slate-500">Streaming live</span>
        </div>

        <div className="space-y-2">
          {recentLogs.map((log, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="text-slate-500 shrink-0">{log.time}</span>
              <span
                className={`font-bold shrink-0 text-[10px] px-1.5 py-0.5 rounded ${
                  log.type === "INFO"
                    ? "bg-blue-950 text-blue-400 border border-blue-800"
                    : log.type === "SUCCESS"
                    ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                    : "bg-amber-950 text-amber-400 border border-amber-800"
                }`}
              >
                {log.type}
              </span>
              <span className="text-slate-300">{log.message}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
