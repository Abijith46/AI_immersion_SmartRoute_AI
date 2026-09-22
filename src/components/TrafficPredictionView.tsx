import React from "react";
import { TrafficPrediction } from "../types";
import {
  TrendingDown,
  Clock,
  ShieldAlert,
  Sparkles,
  BarChart3,
  Calendar,
  CloudRain,
  AlertTriangle,
  Layers,
  ArrowRight,
  Info
} from "lucide-react";
import { DataBadge } from "./DataBadge";

interface TrafficPredictionViewProps {
  prediction: TrafficPrediction;
  showDataBadges: boolean;
}

export const TrafficPredictionView: React.FC<TrafficPredictionViewProps> = ({
  prediction,
  showDataBadges,
}) => {
  return (
    <div className="space-y-6 pb-12">
      {/* HEADER */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-100 text-purple-700">
              <BarChart3 className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-900">
              AI Traffic Prediction Engine
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time multi-variate forecasting analyzing sensor streams, historical patterns, and weather conditions.
          </p>
        </div>

        {showDataBadges && <DataBadge metadata={prediction.dataQuality} showDetails={true} />}
      </div>

      {/* ESTIMATED CONGESTION CLEARING TIME BANNER (Section 5) */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-6 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-purple-400" />
              AI Congestion Clearing Forecast
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Heavy traffic expected to reduce around{" "}
              <span className="text-emerald-400 underline decoration-emerald-500/50">
                {prediction.clearingTimeEstimate}
              </span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {prediction.aiReasoning}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-center shrink-0 w-full md:w-auto">
            <span className="text-xs text-purple-200 block mb-1">Model Confidence</span>
            <span className="text-4xl font-black text-emerald-400">{prediction.clearingConfidence}%</span>
            <span className="text-[10px] text-purple-200 block mt-1 uppercase tracking-wider">
              High Reliability
            </span>
          </div>
        </div>

        {/* Disclaimer note */}
        <div className="mt-4 pt-3 border-t border-purple-800/60 text-[11px] text-purple-200 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-purple-300 shrink-0" />
          <span>{prediction.disclaimer}</span>
        </div>
      </div>

      {/* PREDICTION TIME SERIES GRAPH (Prompt Section 5) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              Traffic Prediction Timeline ({prediction.routeSummary})
            </h3>
            <span className="text-xs text-slate-500">
              Expected congestion index (0 = free flow, 100 = gridlock) over the next 4 hours
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-600">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-red-500"></span> Heavy (70+)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-amber-500"></span> Moderate (45-69)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-emerald-500"></span> Low (&lt;45)
            </span>
          </div>
        </div>

        {/* Horizontal Bar visualization matching user prompt style */}
        <div className="space-y-4">
          {prediction.series.map((step, idx) => {
            const barColor =
              step.congestionIndex >= 70
                ? "bg-red-500"
                : step.congestionIndex >= 45
                ? "bg-amber-500"
                : "bg-emerald-500";

            return (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                  <div className="w-24 font-mono font-bold text-slate-900">{step.timeLabel}</div>
                  <div className="flex items-center gap-4 text-slate-500">
                    <span>ETA: <strong className="text-slate-800">{step.estimatedTravelTimeMin} min</strong></span>
                    <span>Avg Speed: <strong className="text-slate-800">{step.expectedSpeedKmh} km/h</strong></span>
                    <span className="font-bold text-slate-800 w-12 text-right">
                      {step.congestionIndex}/100
                    </span>
                  </div>
                </div>

                {/* Bar */}
                <div className="w-full h-5 bg-slate-100 rounded-lg overflow-hidden flex items-center p-0.5 border border-slate-200">
                  <div
                    className={`h-full rounded-md transition-all duration-500 ${barColor}`}
                    style={{ width: `${Math.max(step.congestionIndex, 8)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI PREDICTION ARCHITECTURE PIPELINE (Section 25) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-600" />
          Prediction Pipeline & Multi-Factor Inputs
        </h3>
        <p className="text-xs text-slate-500 mb-6">
          The forecast synthesizes 8 distinct operational telemetry streams to arrive at the congestion trajectory:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {prediction.predictionFactors.map((factor, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Input Stream {idx + 1}
                </span>
                <h4 className="text-sm font-bold text-slate-800 mt-0.5">{factor.name}</h4>
                <p className="text-xs text-slate-600 mt-1">{factor.description}</p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900">{factor.impact}</span>
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                    factor.trend === "improving"
                      ? "bg-emerald-100 text-emerald-700"
                      : factor.trend === "worsening"
                      ? "bg-red-100 text-red-700"
                      : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {factor.trend}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
