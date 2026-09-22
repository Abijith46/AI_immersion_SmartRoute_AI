import React, { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  Clock,
  Zap,
  Gauge,
  Calendar,
  ShieldCheck,
  Award,
  Navigation,
  Play,
  Square,
  RotateCcw,
  Save,
  CheckCircle2,
  MapPin,
  Flame,
  Fuel,
  AlertTriangle,
  ChevronRight,
  ArrowRight,
  Timer,
  Bike,
  Activity,
  DollarSign,
  Compass
} from "lucide-react";
import { DataBadge } from "./DataBadge";
import { NavigationPathD3View } from "./NavigationPathD3View";
import { RouteOption, UserProfile, LiveVehicleTelemetry, TravelHistoryRecord } from "../types";
import { smartConnectService, userService, PETROL_PRICE_PER_LITRE_INR } from "../services";

interface AnalyticsViewProps {
  showDataBadges: boolean;
  activeRoute?: RouteOption;
  isNavigating?: boolean;
  onToggleNavigation?: () => void;
  onNavigateToTab?: (tab: string) => void;
  userProfile?: UserProfile;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  showDataBadges,
  activeRoute,
  isNavigating = false,
  onToggleNavigation,
  onNavigateToTab,
  userProfile,
}) => {
  // Vehicle telemetry from Smart Connect
  const [telemetry, setTelemetry] = useState<LiveVehicleTelemetry>(() => smartConnectService.getTelemetry());

  // Current session timing and distance simulation
  const [sessionSeconds, setSessionSeconds] = useState<number>(1045); // 17m 25s initial
  const [sessionDistanceKm, setSessionDistanceKm] = useState<number>(10.8);
  const [sessionTopSpeed, setSessionTopSpeed] = useState<number>(58.4);
  const [isSessionActive, setIsSessionActive] = useState<boolean>(isNavigating);
  const [savedSuccessMessage, setSavedSuccessMessage] = useState<string | null>(null);

  // Sync with isNavigating prop
  useEffect(() => {
    setIsSessionActive(isNavigating);
  }, [isNavigating]);

  // Subscribe to live telemetry updates
  useEffect(() => {
    const unsub = smartConnectService.subscribeTelemetry((t) => {
      setTelemetry(t);
      if (t.currentSpeedKmh > sessionTopSpeed) {
        setSessionTopSpeed(t.currentSpeedKmh);
      }
    });
    return () => unsub();
  }, [sessionTopSpeed]);

  // Active navigation session timer and odometer accumulation
  useEffect(() => {
    let interval: any = null;
    if (isSessionActive) {
      interval = setInterval(() => {
        setSessionSeconds((prev) => prev + 1);
        // Increment distance based on simulated speed (~36 km/h = 0.01 km per sec)
        setSessionDistanceKm((prev) => {
          const maxRouteDist = activeRoute?.distanceKm || 14.2;
          const next = prev + 0.01;
          return next > maxRouteDist ? maxRouteDist : Math.round(next * 100) / 100;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSessionActive, activeRoute]);

  // Computed metrics for current session
  const durationHours = Math.max(sessionSeconds / 3600, 0.001);
  const averageSpeedKmh = Math.round((sessionDistanceKm / durationHours) * 10) / 10;
  const routeTotalKm = activeRoute?.distanceKm || 14.2;
  const progressPercent = Math.min(Math.round((sessionDistanceKm / routeTotalKm) * 100), 100);

  // Fuel consumption and cost calculations
  const avgMileage = telemetry.tripAvgFuelEfficiencyKmpl || 38.0;
  const fuelBurnedLitres = Math.round((sessionDistanceKm / avgMileage) * 100) / 100;
  const fuelCostInr = Math.round(fuelBurnedLitres * PETROL_PRICE_PER_LITRE_INR * 10) / 10;
  const co2Grams = Math.round(fuelBurnedLitres * 2310); // ~2310g CO2 per litre of petrol

  // Moving vs Idle time breakdown (estimated 84% moving, 16% idle at signals)
  const movingSeconds = Math.round(sessionSeconds * 0.84);
  const idleSeconds = sessionSeconds - movingSeconds;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s < 10 ? "0" : ""}${s}s`;
  };

  const handleResetSession = () => {
    setSessionSeconds(0);
    setSessionDistanceKm(0);
    setSessionTopSpeed(0);
    setSavedSuccessMessage(null);
  };

  const handleSaveTripToHistory = () => {
    const origin = activeRoute?.origin || "Gandhipuram Central";
    const destination = activeRoute?.destination || "Saravanampatti Tech Zone";
    const durationMin = Math.round(sessionSeconds / 60);

    const newRecord: Omit<TravelHistoryRecord, "id"> = {
      date: new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      origin,
      destination,
      distanceKm: sessionDistanceKm,
      actualDurationMin: durationMin,
      predictedDurationMin: activeRoute?.durationMin || 28,
      delayAvoidedMin: Math.max(0, (activeRoute?.delayMin || 0) > 2 ? 6 : 2),
      averageSpeedKmh,
      delayEncounteredMin: activeRoute?.delayMin || 4,
      tollPaidInr: activeRoute?.tollCostInr || 0,
      fuelBurnedLitres,
      notes: `SmartRoute AI navigation session on ${activeRoute?.title || "NH-209 corridor"}. Average speed: ${averageSpeedKmh} km/h.`,
    };

    userService.addTravelHistoryRecord(newRecord);
    setSavedSuccessMessage("Trip session saved to Travel History!");
    setTimeout(() => setSavedSuccessMessage(null), 3000);
  };

  const hourlyTraffic = [
    { hour: "7 AM", index: 32 },
    { hour: "8 AM", index: 65 },
    { hour: "9 AM", index: 88 },
    { hour: "10 AM", index: 72 },
    { hour: "12 PM", index: 48 },
    { hour: "2 PM", index: 42 },
    { hour: "4 PM", index: 64 },
    { hour: "5 PM", index: 92 },
    { hour: "6 PM", index: 96 },
    { hour: "7 PM", index: 78 },
    { hour: "9 PM", index: 35 },
  ];

  const weekdayStats = [
    { day: "Mon", avgMin: 34 },
    { day: "Tue", avgMin: 31 },
    { day: "Wed", avgMin: 33 },
    { day: "Thu", avgMin: 32 },
    { day: "Fri", avgMin: 38 },
    { day: "Sat", avgMin: 24 },
    { day: "Sun", avgMin: 19 },
  ];

  // Route milestones for the current session
  const milestones = [
    {
      name: "Gandhipuram 7th Cross Cut Road",
      km: 0.0,
      status: sessionDistanceKm >= 0 ? "completed" : "pending",
      time: "Departed 5:15 PM",
      note: "Origin point",
    },
    {
      name: "GP Signal & 100 Feet Road Junction",
      km: 2.1,
      status: sessionDistanceKm >= 2.1 ? "completed" : "pending",
      time: "5:20 PM",
      note: "Cleared moderate traffic",
    },
    {
      name: "Ganapathy Police Patrol Zone",
      km: 4.8,
      status: sessionDistanceKm >= 4.8 ? "completed" : "pending",
      time: "5:26 PM",
      note: "Verified 38 km/h radar camera",
    },
    {
      name: "Textool Flyover & Prozone Bypass",
      km: 8.5,
      status: sessionDistanceKm >= 8.5 ? "completed" : "pending",
      time: "5:33 PM",
      note: "Cruised at 48 km/h",
    },
    {
      name: "KCT Tech Park Gate / Saravanampatti",
      km: 12.0,
      status: sessionDistanceKm >= 12.0 ? "completed" : "in-progress",
      time: "5:39 PM",
      note: "Approaching corridor signal",
    },
    {
      name: "CHIL SEZ IT Park Campus",
      km: 14.2,
      status: sessionDistanceKm >= 14.2 ? "completed" : "upcoming",
      time: "ETA ~5:44 PM",
      note: "Work destination",
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* HEADER */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-100 text-blue-700">
              <BarChart3 className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-900">Commute Analytics & Trip Performance</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time session telemetry, comprehensive trip summary, historical trends, and cumulative savings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {showDataBadges && (
            <DataBadge
              metadata={{
                sourceType: "live_sensor",
                provider: "SmartRoute Live Session Engine & OBD-II Telemetry",
                lastUpdated: "Active Right Now",
                confidence: 96,
                isLive: true,
              }}
            />
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🚀 TRIP SUMMARY: CURRENT NAVIGATION SESSION BREAKDOWN (REQUESTED FEATURE) */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Trip Summary Top Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white p-6 relative">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
            <div>
              <div className="flex items-center gap-2.5 mb-1.5">
                <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1.5">
                  <Activity className="w-3 h-3 text-blue-400" />
                  Navigation Trip Summary
                </span>

                {isSessionActive ? (
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    LIVE SESSION RECORDING
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-700 text-slate-300 border border-slate-600 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-slate-400" />
                    COMMUTE SESSION STANDBY
                  </span>
                )}
              </div>

              <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                <span>{activeRoute?.origin || "Gandhipuram Central"}</span>
                <ArrowRight className="w-5 h-5 text-blue-400 shrink-0" />
                <span className="text-blue-300">{activeRoute?.destination || "Saravanampatti Tech Zone"}</span>
              </h3>

              <p className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-3">
                <span>Corridor: <strong className="text-slate-200">{activeRoute?.title || "NH-209 Sathy Road"}</strong></span>
                <span>•</span>
                <span>Vehicle: <strong className="text-cyan-300">Hunter 350 (TN 37 CK 4829)</strong></span>
                <span>•</span>
                <span>Rider: <strong className="text-slate-200">{userProfile?.name || "Abijith"}</strong></span>
              </p>
            </div>

            {/* Session Action Controls */}
            <div className="flex items-center flex-wrap gap-2">
              <button
                onClick={() => {
                  if (onToggleNavigation) {
                    onToggleNavigation();
                  } else {
                    setIsSessionActive(!isSessionActive);
                  }
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md ${
                  isSessionActive
                    ? "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20"
                    : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20"
                }`}
              >
                {isSessionActive ? (
                  <>
                    <Square className="w-3.5 h-3.5 fill-current" />
                    <span>Pause Session</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{sessionSeconds > 0 ? "Resume Navigation" : "Start Live Session"}</span>
                  </>
                )}
              </button>

              <button
                onClick={handleSaveTripToHistory}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                title="Save this trip calculation to your personal commute history"
              >
                <Save className="w-3.5 h-3.5 text-emerald-400" />
                <span>Save to History</span>
              </button>

              <button
                onClick={handleResetSession}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 transition-colors"
                title="Reset session counters"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {onNavigateToTab && (
                <button
                  onClick={() => onNavigateToTab("map")}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 text-xs font-bold transition-colors flex items-center gap-1"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Map</span>
                </button>
              )}
            </div>
          </div>

          {savedSuccessMessage && (
            <div className="mt-3 p-2.5 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              {savedSuccessMessage}
            </div>
          )}

          {/* Progress Bar of Current Navigation Session */}
          <div className="mt-6 pt-4 border-t border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span className="flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-blue-400" />
                Session Route Progress: <strong className="text-white font-mono">{progressPercent}%</strong>
              </span>
              <span className="font-mono text-slate-400">
                <strong className="text-white">{sessionDistanceKm.toFixed(1)} km</strong> covered of {routeTotalKm} km (
                {(routeTotalKm - sessionDistanceKm > 0 ? (routeTotalKm - sessionDistanceKm).toFixed(1) : "0.0")} km left)
              </span>
            </div>
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-700/60">
              <div
                className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* CORE TRI-METRIC BREAKDOWN: DISTANCE, DURATION & AVERAGE SPEED (MANDATORY) */}
        {/* ========================================================================= */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. TOTAL DISTANCE TRAVELED */}
            <div className="bg-gradient-to-br from-blue-50/70 to-indigo-50/40 p-5 rounded-2xl border border-blue-100 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between text-blue-900 mb-2">
                <div className="flex items-center gap-1.5">
                  <Navigation className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
                    Total Distance Traveled
                  </span>
                </div>
                <span className="text-[10px] font-bold bg-blue-200/60 text-blue-800 px-2 py-0.5 rounded-full">
                  GPS Odometer
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-slate-900 font-mono tracking-tight">
                  {sessionDistanceKm.toFixed(1)}
                </span>
                <span className="text-sm font-bold text-slate-500 uppercase">km</span>
              </div>

              <div className="mt-3 pt-3 border-t border-blue-100 text-xs text-slate-600 flex items-center justify-between">
                <span>Route Total: <strong>{routeTotalKm} km</strong></span>
                <span className="text-emerald-700 font-semibold font-mono">
                  {(routeTotalKm - sessionDistanceKm > 0 ? (routeTotalKm - sessionDistanceKm).toFixed(1) : "0.0")} km remaining
                </span>
              </div>
            </div>

            {/* 2. DURATION */}
            <div className="bg-gradient-to-br from-amber-50/70 to-orange-50/40 p-5 rounded-2xl border border-amber-100 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between text-amber-900 mb-2">
                <div className="flex items-center gap-1.5">
                  <Timer className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
                    Duration (Elapsed)
                  </span>
                </div>
                {isSessionActive && (
                  <span className="text-[10px] font-bold bg-amber-200/60 text-amber-900 px-2 py-0.5 rounded-full animate-pulse">
                    Live Clock
                  </span>
                )}
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-slate-900 font-mono tracking-tight">
                  {formatTime(sessionSeconds)}
                </span>
              </div>

              <div className="mt-3 pt-3 border-t border-amber-100 text-xs text-slate-600 flex items-center justify-between">
                <span>Moving: <strong className="text-slate-800">{formatTime(movingSeconds)}</strong></span>
                <span>Signals Idle: <strong className="text-slate-800">{formatTime(idleSeconds)}</strong></span>
              </div>
            </div>

            {/* 3. AVERAGE SPEED */}
            <div className="bg-gradient-to-br from-emerald-50/70 to-teal-50/40 p-5 rounded-2xl border border-emerald-100 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between text-emerald-900 mb-2">
                <div className="flex items-center gap-1.5">
                  <Gauge className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                    Average Speed
                  </span>
                </div>
                <span className="text-[10px] font-bold bg-emerald-200/60 text-emerald-800 px-2 py-0.5 rounded-full">
                  Distance ÷ Time
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-slate-900 font-mono tracking-tight">
                  {averageSpeedKmh}
                </span>
                <span className="text-sm font-bold text-slate-500 uppercase">km/h</span>
              </div>

              <div className="mt-3 pt-3 border-t border-emerald-100 text-xs text-slate-600 flex items-center justify-between">
                <span>Instant: <strong className="text-emerald-700 font-mono">{telemetry.currentSpeedKmh} km/h</strong></span>
                <span>Peak Max: <strong className="text-slate-800 font-mono">{sessionTopSpeed} km/h</strong></span>
              </div>
            </div>
          </div>

          {/* SECONDARY TRIP BREAKDOWN GRID: FUEL, DELAY SAVED, SAFETY SCORE */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {/* Fuel Burned & Cost */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-slate-400 font-semibold flex items-center gap-1">
                <Fuel className="w-3.5 h-3.5 text-cyan-600" />
                Fuel Burned
              </span>
              <div className="text-lg font-bold text-slate-900 font-mono">
                {fuelBurnedLitres} <span className="text-xs font-normal text-slate-500">L</span>
              </div>
              <span className="text-[11px] text-slate-500 block">
                Trip Cost: <strong className="text-slate-800">₹{fuelCostInr}</strong> (@ ₹{PETROL_PRICE_PER_LITRE_INR}/L)
              </span>
            </div>

            {/* Fuel Efficiency */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-slate-400 font-semibold flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-emerald-600" />
                Average Mileage
              </span>
              <div className="text-lg font-bold text-emerald-600 font-mono">
                {avgMileage} <span className="text-xs font-normal text-slate-500">km/L</span>
              </div>
              <span className="text-[11px] text-slate-500 block">
                Instant: <strong className="text-slate-800">{telemetry.instantFuelEfficiencyKmpl} km/L</strong>
              </span>
            </div>

            {/* Traffic Delay Avoided */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-slate-400 font-semibold flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                Congestion Delay
              </span>
              <div className="text-lg font-bold text-amber-600 font-mono">
                +{activeRoute?.delayMin || 4} <span className="text-xs font-normal text-slate-500">min</span>
              </div>
              <span className="text-[11px] text-emerald-600 font-semibold block">
                Saved 5.2m vs choked artery
              </span>
            </div>

            {/* Rider Safety & Eco Score */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-slate-400 font-semibold flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-indigo-600" />
                Ride Quality Score
              </span>
              <div className="text-lg font-bold text-indigo-600 font-mono">
                {telemetry.ecoScore} <span className="text-xs font-normal text-slate-500">/ 100</span>
              </div>
              <span className="text-[11px] text-slate-500 block">
                Harsh Brakes: <strong className="text-slate-800">{telemetry.harshBrakingCount}</strong> • Smooth Throttle
              </span>
            </div>
          </div>

          {/* D3.JS SPATIAL PATH & TRAJECTORY VISUALIZATION */}
          <NavigationPathD3View
            activeRoute={activeRoute}
            sessionDistanceKm={sessionDistanceKm}
            sessionSeconds={sessionSeconds}
            sessionTopSpeed={sessionTopSpeed}
            averageSpeedKmh={averageSpeedKmh}
            userProfile={userProfile}
          />

          {/* TRIP WAYPOINT & MILESTONE TIMELINE */}
          <div className="pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              Navigation Route Waypoints & Checkpoint Log
            </h4>

            <div className="space-y-2.5">
              {milestones.map((ms, idx) => {
                const isPassed = ms.status === "completed";
                const isNext = ms.status === "in-progress";

                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs ${
                      isPassed
                        ? "bg-slate-50/70 border-slate-200 text-slate-800"
                        : isNext
                        ? "bg-blue-50/80 border-blue-200 text-blue-900 shadow-sm"
                        : "bg-white border-slate-100 text-slate-400"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-[11px] font-bold ${
                          isPassed
                            ? "bg-emerald-100 text-emerald-700"
                            : isNext
                            ? "bg-blue-600 text-white animate-pulse"
                            : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        {isPassed ? "✓" : idx + 1}
                      </span>
                      <div>
                        <strong className="block text-slate-900">{ms.name}</strong>
                        <span className="text-[11px] text-slate-500">{ms.note}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 sm:text-right shrink-0">
                      <span className="font-mono text-slate-500 text-[11px]">KM {ms.km.toFixed(1)}</span>
                      <span
                        className={`font-semibold px-2 py-0.5 rounded text-[10px] ${
                          isPassed
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : isNext
                            ? "bg-blue-100 text-blue-700 border border-blue-200"
                            : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        {ms.time}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 30-DAY CUMULATIVE COMMUTE BENCHMARKS & STATS */}
      {/* ========================================================================= */}
      <div className="pt-2">
        <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-600" />
          30-Day Long-Term Commute Benchmarks
        </h3>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">Average Commute Time</span>
              <Clock className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl font-black text-slate-900">
              29.4 <span className="text-xs font-normal text-slate-500">min</span>
            </div>
            <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
              ↓ 4.2 min vs static navigation
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">Monthly Avg Speed</span>
              <Gauge className="w-4 h-4 text-purple-500" />
            </div>
            <div className="text-2xl font-black text-slate-900">
              38.2 <span className="text-xs font-normal text-slate-500">km/h</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">Urban arterial corridor</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">Total Delays Avoided</span>
              <Award className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black text-emerald-600">
              3.8 <span className="text-xs font-normal text-slate-500">hours</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">Over past 30 days</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">CO₂ & Fuel Saved</span>
              <Zap className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-black text-slate-900">
              14.8 <span className="text-xs font-normal text-slate-500">litres</span>
            </div>
            <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
              via lower idle time & green routing
            </span>
          </div>
        </div>
      </div>

      {/* CONGESTION BY TIME OF DAY */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 mb-1">
          Traffic Congestion Index by Hour of Day
        </h3>
        <p className="text-xs text-slate-500 mb-6">
          Aggregated bottleneck severity along Coimbatore tech and arterial corridors (Peak at 6:00 PM)
        </p>

        <div className="flex items-end gap-2 h-44 pt-6 border-b border-slate-100">
          {hourlyTraffic.map((item, idx) => {
            const heightPercent = item.index;
            const barBg =
              item.index >= 80 ? "bg-red-500" : item.index >= 50 ? "bg-amber-500" : "bg-emerald-500";

            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                <span className="text-[10px] font-bold text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.index}
                </span>
                <div className="w-full bg-slate-100 rounded-t-lg h-32 flex items-end">
                  <div
                    className={`w-full rounded-t-lg transition-all duration-300 ${barBg}`}
                    style={{ height: `${heightPercent}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-500 font-mono rotate-45 sm:rotate-0 mt-1">
                  {item.hour}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* WEEKDAY COMPARISON */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-1">Commute Time by Day of Week</h3>
          <p className="text-xs text-slate-500 mb-4">Typical duration on Gandhipuram ↔ Saravanampatti</p>
          <div className="space-y-3">
            {weekdayStats.map((w, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="w-10 font-bold text-slate-700">{w.day}</span>
                <div className="flex-1 mx-3 bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      w.avgMin > 35 ? "bg-red-500" : w.avgMin > 28 ? "bg-amber-500" : "bg-emerald-500"
                    }`}
                    style={{ width: `${(w.avgMin / 45) * 100}%` }}
                  />
                </div>
                <span className="font-mono font-bold text-slate-900 w-14 text-right">
                  {w.avgMin} min
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-1">Most Frequent Corridors</h3>
          <p className="text-xs text-slate-500 mb-4">Saved travel routines ranked by frequency</p>
          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <strong className="text-slate-800 block text-sm">Gandhipuram ↔ Saravanampatti</strong>
                <span className="text-slate-500">24 trips this month • Avg 32 min</span>
              </div>
              <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                Fastest
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <strong className="text-slate-800 block text-sm">Peelamedu ↔ Gandhipuram</strong>
                <span className="text-slate-500">12 trips this month • Avg 18 min</span>
              </div>
              <span className="font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg border border-blue-200">
                Routine
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <strong className="text-slate-800 block text-sm">Gandhipuram ↔ Airport</strong>
                <span className="text-slate-500">4 trips this month • Avg 26 min</span>
              </div>
              <span className="font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-lg border border-purple-200">
                Flyway
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
