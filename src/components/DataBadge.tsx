import React from "react";
import { DataMetadata } from "../types";
import { ShieldCheck, Clock, Zap, Database } from "lucide-react";

interface DataBadgeProps {
  metadata?: DataMetadata;
  showDetails?: boolean;
  className?: string;
}

export const DataBadge: React.FC<DataBadgeProps> = ({ metadata, showDetails = false, className = "" }) => {
  if (!metadata) return null;

  const styles = {
    live: {
      bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
      dot: "bg-emerald-500",
      label: "LIVE DATA",
      icon: Zap,
    },
    live_sensor: {
      bg: "bg-cyan-50 text-cyan-700 border-cyan-200",
      dot: "bg-cyan-500",
      label: "LIVE SENSOR",
      icon: Zap,
    },
    historical: {
      bg: "bg-blue-50 text-blue-700 border-blue-200",
      dot: "bg-blue-500",
      label: "HISTORICAL",
      icon: Database,
    },
    prediction: {
      bg: "bg-purple-50 text-purple-700 border-purple-200",
      dot: "bg-purple-500",
      label: "AI PREDICTION",
      icon: ShieldCheck,
    },
    demo: {
      bg: "bg-amber-50 text-amber-700 border-amber-200",
      dot: "bg-amber-500",
      label: "DEMO DATA",
      icon: Clock,
    },
  };

  const current = styles[metadata.sourceType] || styles.demo;
  const Icon = current.icon;

  return (
    <div className={`inline-flex flex-col gap-1 ${className}`}>
      <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold tracking-wider ${current.bg}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${current.dot} animate-pulse`} />
        <span>{current.label}</span>
        {metadata.confidence !== undefined && (
          <span className="opacity-80 font-normal">({metadata.confidence}%)</span>
        )}
      </div>

      {showDetails && (
        <div className="text-[10px] text-slate-500 flex items-center gap-2">
          <span>Source: {metadata.provider}</span>
          <span>•</span>
          <span>{metadata.lastUpdated}</span>
        </div>
      )}
    </div>
  );
};
