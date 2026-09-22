import React, { useState } from "react";
import { Info, Sparkles, ChevronDown, ChevronUp, ShieldCheck, Database, Radio } from "lucide-react";

interface DemoModeBannerProps {
  showDataBadges: boolean;
  onToggleDataBadges: () => void;
}

export const DemoModeBanner: React.FC<DemoModeBannerProps> = ({
  showDataBadges,
  onToggleDataBadges,
}) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-amber-500/10 border-b border-amber-500/20 text-slate-800 transition-all">
      <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
          <span className="font-bold tracking-wide uppercase text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded text-[10px]">
            DEMO MODE
          </span>
          <span className="text-slate-600 font-medium">
            Connect live APIs to display real-time information. Sample simulation active for Coimbatore corridor.
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onToggleDataBadges}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
              showDataBadges
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            {showDataBadges ? "Data Badges: Visible" : "Show Data Sources"}
          </button>

          <button
            onClick={() => setExpanded(!expanded)}
            className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 font-medium text-[11px]"
          >
            Data Transparency
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="max-w-7xl mx-auto px-4 pb-3 pt-1 border-t border-amber-500/10 text-xs text-slate-600 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white/80 p-2.5 rounded-lg border border-slate-200/80">
            <div className="flex items-center gap-1.5 text-emerald-700 font-bold mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Live Data
            </div>
            <p className="text-[11px] text-slate-500">
              Direct telemetry from official highway feeds, municipal smart parking sensors, and verified police notices.
            </p>
          </div>

          <div className="bg-white/80 p-2.5 rounded-lg border border-slate-200/80">
            <div className="flex items-center gap-1.5 text-blue-700 font-bold mb-1">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              Historical Data
            </div>
            <p className="text-[11px] text-slate-500">
              Aggregated typical commute speeds by hour of day and day of week across key corridors.
            </p>
          </div>

          <div className="bg-white/80 p-2.5 rounded-lg border border-slate-200/80">
            <div className="flex items-center gap-1.5 text-purple-700 font-bold mb-1">
              <span className="w-2 h-2 rounded-full bg-purple-500"></span>
              AI Predictions
            </div>
            <p className="text-[11px] text-slate-500">
              Stochastic traffic models & Gemini neural blend estimating congestion trends. Labeled with confidence scores.
            </p>
          </div>

          <div className="bg-white/80 p-2.5 rounded-lg border border-slate-200/80">
            <div className="flex items-center gap-1.5 text-amber-700 font-bold mb-1">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              Demo / Simulated Data
            </div>
            <p className="text-[11px] text-slate-500">
              Clearly marked demonstration feeds when external commercial API tokens are unconfigured.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
