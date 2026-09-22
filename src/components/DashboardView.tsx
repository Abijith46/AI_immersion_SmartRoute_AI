import React, { useState, useEffect } from "react";
import {
  UserProfile,
  RouteOption,
  WeatherData,
  TrafficPrediction,
  TrafficAlert,
  LiveVehicleTelemetry,
  BikeDetails
} from "../types";
import {
  Navigation,
  Clock,
  CloudRain,
  ShieldCheck,
  TrendingDown,
  AlertTriangle,
  ArrowRight,
  Compass,
  Zap,
  Sparkles,
  MapPin,
  ChevronRight,
  Fuel,
  Wrench,
  Heart,
  Plus,
  Bike,
  Gauge,
  Bluetooth,
  CircleDot,
  Home,
  Briefcase,
  AlertOctagon,
  Radio
} from "lucide-react";
import { DataBadge } from "./DataBadge";
import { AddAlertDetailsModal } from "./AddAlertDetailsModal";
import { smartConnectService } from "../services";

interface DashboardViewProps {
  user: UserProfile;
  activeRoute: RouteOption;
  routes: RouteOption[];
  onSelectRoute: (id: string) => void;
  weather: WeatherData;
  prediction: TrafficPrediction;
  alerts: TrafficAlert[];
  onNavigateToTab: (tab: string) => void;
  showDataBadges: boolean;
  onAddAlertDetail?: (alertId: string, detail: { note: string; author: string; timestamp: string }) => void;
  onOpenSOS?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  activeRoute,
  routes,
  onSelectRoute,
  weather,
  prediction,
  alerts,
  onNavigateToTab,
  showDataBadges,
  onAddAlertDetail,
  onOpenSOS,
}) => {
  const [selectedAlertForDetail, setSelectedAlertForDetail] = useState<TrafficAlert | null>(null);
  const [telemetry, setTelemetry] = useState<LiveVehicleTelemetry>(smartConnectService.getTelemetry());
  const [activeBike, setActiveBike] = useState<BikeDetails>(smartConnectService.getActiveBike());

  useEffect(() => {
    const unsubT = smartConnectService.subscribeTelemetry(setTelemetry);
    const unsubB = smartConnectService.subscribeBike(setActiveBike);
    return () => {
      unsubT();
      unsubB();
    };
  }, []);

  // Determine time-appropriate greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const fastestRoute = routes.find((r) => r.type === "fastest") || routes[0];
  const alternativeRoute = routes.find((r) => r.type === "alternative") || routes[1];

  return (
    <div className="space-y-6 pb-12">
      {/* GREETING & PERSONALIZED COMMUTE ADVISORY */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {getGreeting()}, <span className="text-blue-600">{user.name}</span>
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            {user.commuteSummary.routineRoute} is currently experiencing{" "}
            <span className="font-semibold text-amber-600">moderate-to-heavy traffic</span>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onOpenSOS && (
            <button
              onClick={onOpenSOS}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 transition-all animate-pulse"
              title="Trigger Emergency SOS: 112/108 Police & Ambulance Alert"
            >
              <AlertOctagon className="w-4 h-4" />
              <span>SOS Help</span>
            </button>
          )}

          <button
            onClick={() => onNavigateToTab("routes")}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-sm transition-all"
          >
            <Compass className="w-4 h-4" />
            Plan Journey
          </button>

          <button
            onClick={() => onNavigateToTab("assistant")}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-sm border border-indigo-200 transition-all"
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            Ask SmartRoute AI
          </button>
        </div>
      </div>

      {/* QUICK COMMUTE DESTINATIONS & LIVE ADDRESS SHORTCUTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Home Commute Shortcut Card */}
        <div
          onClick={() => onNavigateToTab("routes")}
          className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group flex items-start justify-between gap-3"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Home Base</span>
                <span className="text-[10px] text-slate-400">
                  Departs {user.homeAddress?.routineDepartureTime || "7:30 AM"}
                </span>
              </div>
              <strong className="text-sm font-bold text-slate-900 block mt-0.5">
                {user.homeAddress?.area || "Gandhipuram"}
              </strong>
              <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                {user.homeAddress?.formattedAddress ||
                  `${user.homeAddress?.flatOrDoorNo || "Door #4B"}, ${user.homeAddress?.street || "12/4 Cross Cut 7th Street"}, Coimbatore`}
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5 shrink-0 mt-2">
            Route <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>

        {/* Work Commute Shortcut Card */}
        <div
          onClick={() => onNavigateToTab("routes")}
          className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group flex items-start justify-between gap-3"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-700">Work Corridor</span>
                <span className="text-[10px] text-slate-400">
                  Returns {user.workAddress?.routineDepartureTime || "5:30 PM"}
                </span>
              </div>
              <strong className="text-sm font-bold text-slate-900 block mt-0.5">
                {user.workAddress?.area || "Saravanampatti"}
              </strong>
              <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                {user.workAddress?.formattedAddress ||
                  `${user.workAddress?.flatOrDoorNo || "Tower 2"}, ${user.workAddress?.street || "CHIL SEZ IT Corridor"}, Coimbatore`}
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-blue-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5 shrink-0 mt-2">
            Route <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>

      {/* SMART CONNECT: LIVE VEHICLE TELEMETRY CARD */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white p-5 sm:p-6 rounded-3xl border border-slate-800 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
                <Bike className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                    Smart Connect • Active Vehicle
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse">
                    <Bluetooth className="w-2.5 h-2.5" />
                    BLE Live
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white">
                  {activeBike.make} {activeBike.model}
                  <span className="text-xs font-normal text-slate-400 ml-2">({activeBike.regNumber})</span>
                </h3>
              </div>
            </div>

            <button
              onClick={() => onNavigateToTab("smart_connect")}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md shadow-cyan-600/30 transition-all self-start sm:self-auto"
            >
              <span>Full Cockpit & Diagnostics</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Speed & Gear */}
            <div className="bg-slate-800/70 p-3.5 rounded-2xl border border-slate-700/60">
              <span className="text-[11px] text-slate-400 block mb-0.5">Current Speed</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-cyan-300 font-mono tracking-tight">
                  {telemetry.currentSpeedKmh}
                </span>
                <span className="text-xs text-slate-400 font-semibold uppercase">km/h</span>
              </div>
              <span className="text-[10px] text-slate-400 block mt-1">
                Gear <strong className="text-white">{telemetry.currentGear}</strong> • {telemetry.currentRpm} RPM
              </span>
            </div>

            {/* Instant Mileage */}
            <div className="bg-slate-800/70 p-3.5 rounded-2xl border border-slate-700/60">
              <span className="text-[11px] text-slate-400 block mb-0.5">Fuel Efficiency</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-emerald-400 font-mono tracking-tight">
                  {telemetry.instantFuelEfficiencyKmpl}
                </span>
                <span className="text-xs text-slate-400 font-semibold uppercase">km/L</span>
              </div>
              <span className="text-[10px] text-emerald-300 block mt-1">
                Avg: {telemetry.tripAvgFuelEfficiencyKmpl} km/L • Score {telemetry.ecoScore}/100
              </span>
            </div>

            {/* Fuel Remaining & DTE */}
            <div className="bg-slate-800/70 p-3.5 rounded-2xl border border-slate-700/60">
              <span className="text-[11px] text-slate-400 block mb-0.5">Fuel Tank</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-white font-mono tracking-tight">
                  {telemetry.fuelRemainingLitres.toFixed(1)}
                </span>
                <span className="text-xs text-slate-400 font-semibold uppercase">Litres</span>
              </div>
              <span className="text-[10px] text-cyan-300 block mt-1">
                Range: ~{telemetry.distanceToEmptyKm} km to empty
              </span>
            </div>

            {/* TPMS / Tyre Pressures */}
            <div className="bg-slate-800/70 p-3.5 rounded-2xl border border-slate-700/60">
              <span className="text-[11px] text-slate-400 block mb-0.5">Tyre Pressure (TPMS)</span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-black text-white font-mono">
                  {activeBike.tyrePressure.frontPsi} <span className="text-xs font-normal text-slate-400">F</span>
                </span>
                <span className="text-slate-600">/</span>
                <span className="text-xl font-black text-white font-mono">
                  {activeBike.tyrePressure.rearPsi} <span className="text-xs font-normal text-slate-400">R</span>
                </span>
                <span className="text-[10px] text-slate-400 font-semibold">PSI</span>
              </div>
              <span className="text-[10px] text-emerald-400 block mt-1">
                Status: Optimal Pressure & Temp
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* CURRENT JOURNEY CARD (Prompt Section 3) */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
        {/* Subtle decorative background curves */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-700/80">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-blue-400">
                Current Journey Summary
              </span>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-lg font-bold text-white">Gandhipuram</span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
                <span className="text-lg font-bold text-white">Saravanampatti</span>
              </div>
            </div>

            {showDataBadges && (
              <DataBadge
                metadata={{
                  sourceType: "demo",
                  provider: "SmartRoute Live Sensor & Prediction Blend",
                  lastUpdated: "Just now",
                  confidence: 88,
                  isLive: false,
                }}
              />
            )}
          </div>

          {/* Key Metric Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6">
            <div className="bg-slate-800/60 backdrop-blur-sm p-4 rounded-2xl border border-slate-700/60">
              <span className="text-xs text-slate-400 block mb-1">Distance</span>
              <span className="text-2xl font-black text-white">{activeRoute.distanceKm} km</span>
              <span className="text-[11px] text-slate-400 block mt-1">Corridor NH-209</span>
            </div>

            <div className="bg-slate-800/60 backdrop-blur-sm p-4 rounded-2xl border border-slate-700/60">
              <span className="text-xs text-slate-400 block mb-1">Estimated Time</span>
              <span className="text-2xl font-black text-white">{activeRoute.durationMin} min</span>
              <span className="text-[11px] text-amber-400 block mt-1">+{activeRoute.delayMin}m delay</span>
            </div>

            <div className="bg-slate-800/60 backdrop-blur-sm p-4 rounded-2xl border border-slate-700/60">
              <span className="text-xs text-slate-400 block mb-1">Current Traffic</span>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-orange-500 animate-pulse" />
                <span className="text-xl font-bold uppercase text-orange-400">
                  {activeRoute.congestionLevel}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 block mt-1">Avg 24 km/h</span>
            </div>

            <div className="bg-slate-800/60 backdrop-blur-sm p-4 rounded-2xl border border-slate-700/60">
              <span className="text-xs text-slate-400 block mb-1">Weather Impact</span>
              <div className="flex items-center gap-1.5 text-blue-300 font-bold text-lg">
                <span>{weather.conditionIcon}</span>
                <span>{weather.temperatureC}°C</span>
              </div>
              <span className="text-[11px] text-blue-200 block mt-1">+{weather.trafficImpact.expectedDelayMinutes}m slowdown</span>
            </div>
          </div>

          {/* Congestion clearing callout */}
          <div className="bg-blue-900/40 border border-blue-500/30 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                <TrendingDown className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-blue-300 font-medium">Traffic clearing forecast:</span>
                <div className="text-white font-bold">
                  Traffic expected to reduce in: <span className="text-emerald-400">18 min</span> (~5:45 PM)
                </div>
              </div>
            </div>

            <div className="text-xs text-slate-300 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
              Model Confidence: <strong className="text-white">{prediction.clearingConfidence}%</strong>
            </div>
          </div>

          {/* Route Options Comparison (Fastest vs Alternative) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-700/80">
            {/* AI Recommended Route */}
            <div
              onClick={() => onSelectRoute(fastestRoute.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                activeRoute.id === fastestRoute.id
                  ? "bg-blue-600/20 border-blue-500 shadow-md ring-2 ring-blue-500/50"
                  : "bg-slate-800/40 border-slate-700 hover:bg-slate-800"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-600 text-white">
                  AI Recommended Route
                </span>
                <span className="text-xs text-slate-300">Fastest practical route</span>
              </div>
              <div className="flex items-baseline justify-between mt-2">
                <h4 className="text-base font-bold text-white">{fastestRoute.title}</h4>
                <span className="text-2xl font-black text-emerald-400">{fastestRoute.durationMin} min</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">{fastestRoute.summary}</p>
            </div>

            {/* Alternative Route */}
            <div
              onClick={() => onSelectRoute(alternativeRoute.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                activeRoute.id === alternativeRoute.id
                  ? "bg-blue-600/20 border-blue-500 shadow-md ring-2 ring-blue-500/50"
                  : "bg-slate-800/40 border-slate-700 hover:bg-slate-800"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-600/30 text-emerald-300 border border-emerald-500/30">
                  Alternative Route
                </span>
                <span className="text-xs text-emerald-300 font-medium">Lower Congestion</span>
              </div>
              <div className="flex items-baseline justify-between mt-2">
                <h4 className="text-base font-bold text-white">{alternativeRoute.title}</h4>
                <span className="text-2xl font-black text-white">{alternativeRoute.durationMin} min</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">{alternativeRoute.summary}</p>
            </div>
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS & RECENT ALERTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Traffic Alerts ticker */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900">Active Road Hazards & Alerts</h3>
            </div>
            <button
              onClick={() => onNavigateToTab("roads")}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              View All ({alerts.length}) <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {alerts.slice(0, 3).map((alert) => (
              <div
                key={alert.id}
                className="p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/70 transition-colors space-y-2"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                          alert.severity === "high"
                            ? "bg-rose-100 text-rose-700"
                            : alert.severity === "medium"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {alert.type.replace("_", " ")}
                      </span>
                      <span className="text-xs font-bold text-slate-800">{alert.location}</span>
                    </div>
                    <p className="text-xs text-slate-600">{alert.description}</p>
                    <span className="text-[10px] text-slate-400">{alert.reportedTime} • {alert.source}</span>
                  </div>

                  <span className="text-xs font-bold text-slate-400 shrink-0">
                    {alert.confidence}% conf.
                  </span>
                </div>

                {/* Additional Community Details */}
                {alert.additionalDetails && alert.additionalDetails.length > 0 && (
                  <div className="pt-1.5 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block">
                      Community Updates ({alert.additionalDetails.length})
                    </span>
                    {alert.additionalDetails.map((dt, i) => (
                      <div key={i} className="p-2 rounded-lg bg-blue-50/80 border border-blue-100 text-xs">
                        <p className="text-slate-800">{dt.note}</p>
                        <span className="text-[10px] text-blue-700 font-semibold block mt-0.5">
                          Added by {dt.author} • {dt.timestamp}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-1 flex items-center justify-end">
                  <button
                    onClick={() => setSelectedAlertForDetail(alert)}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-lg transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Details as {user.name}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Route Shortcuts & Amenities */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <Zap className="w-4 h-4 text-blue-600" />
            Corridor Services
          </h3>
          <p className="text-xs text-slate-500">
            Instantly locate certified support along your active route:
          </p>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => onNavigateToTab("nearby")}
              className="p-3 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 text-slate-700 flex flex-col items-center justify-center gap-1.5 transition-all text-center"
            >
              <Fuel className="w-5 h-5 text-emerald-600" />
              <span className="font-bold">Nearby Fuel</span>
              <span className="text-[10px] text-slate-400">1.8 km ahead</span>
            </button>

            <button
              onClick={() => onNavigateToTab("nearby")}
              className="p-3 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-slate-700 flex flex-col items-center justify-center gap-1.5 transition-all text-center"
            >
              <Wrench className="w-5 h-5 text-blue-600" />
              <span className="font-bold">Mechanics</span>
              <span className="text-[10px] text-slate-400">2.1 km ahead</span>
            </button>

            <button
              onClick={() => onNavigateToTab("nearby")}
              className="p-3 rounded-xl border border-slate-200 hover:border-rose-300 hover:bg-rose-50 text-slate-700 flex flex-col items-center justify-center gap-1.5 transition-all text-center"
            >
              <Heart className="w-5 h-5 text-rose-600" />
              <span className="font-bold">Hospitals</span>
              <span className="text-[10px] text-slate-400">24/7 Trauma</span>
            </button>

            <button
              onClick={() => onNavigateToTab("prediction")}
              className="p-3 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50 text-slate-700 flex flex-col items-center justify-center gap-1.5 transition-all text-center"
            >
              <Clock className="w-5 h-5 text-purple-600" />
              <span className="font-bold">Predict Traffic</span>
              <span className="text-[10px] text-slate-400">+15m to +2h</span>
            </button>
          </div>
        </div>
      </div>

      {/* Add Alert Details Modal for Dashboard Alerts */}
      {selectedAlertForDetail && (
        <AddAlertDetailsModal
          isOpen={!!selectedAlertForDetail}
          onClose={() => setSelectedAlertForDetail(null)}
          alertSymbolTitle={selectedAlertForDetail.description}
          alertSymbolType={selectedAlertForDetail.type}
          alertSymbolLocation={selectedAlertForDetail.location}
          userProfile={user}
          onSubmitDetail={(note, author) => {
            if (onAddAlertDetail) {
              onAddAlertDetail(selectedAlertForDetail.id, {
                note,
                author,
                timestamp: "Just now",
              });
            }
            setSelectedAlertForDetail(null);
          }}
        />
      )}
    </div>
  );
};
