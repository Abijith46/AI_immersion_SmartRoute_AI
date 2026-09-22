import React, { useState, useEffect } from "react";
import {
  BikeDetails,
  SmartConnectDevice,
  LiveVehicleTelemetry,
  BikeServiceRecord,
  UserProfile
} from "../types";
import {
  smartConnectService,
  PETROL_PRICE_PER_LITRE_INR
} from "../services/smartConnectService";
import {
  Bike,
  Gauge,
  Fuel,
  Bluetooth,
  BatteryCharging,
  Zap,
  ShieldCheck,
  RotateCcw,
  Sliders,
  Settings,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  FileText,
  Wrench,
  ChevronRight,
  Plus,
  RefreshCw,
  X,
  Radio,
  Sparkles,
  Award,
  CircleDot,
  Compass
} from "lucide-react";

interface SmartConnectViewProps {
  userProfile: UserProfile;
  onNavigateToTab?: (tab: string) => void;
  onOpenVoiceCommand?: () => void;
}

export const SmartConnectView: React.FC<SmartConnectViewProps> = ({
  userProfile,
  onNavigateToTab,
  onOpenVoiceCommand,
}) => {
  const [activeBike, setActiveBike] = useState<BikeDetails>(smartConnectService.getActiveBike());
  const [allBikes, setAllBikes] = useState<BikeDetails[]>(smartConnectService.getBikes());
  const [devices, setDevices] = useState<SmartConnectDevice[]>(smartConnectService.getDevices());
  const [telemetry, setTelemetry] = useState<LiveVehicleTelemetry>(smartConnectService.getTelemetry());
  const [serviceRecords, setServiceRecords] = useState<BikeServiceRecord[]>(smartConnectService.getServiceRecords());
  const [isAutoSim, setIsAutoSim] = useState<boolean>(smartConnectService.getIsAutoSimulating());

  // Modals
  const [showPairModal, setShowPairModal] = useState(false);
  const [showBikeModal, setShowBikeModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [pairingNotice, setPairingNotice] = useState<string | null>(null);

  // New Bike Form state
  const [newBikeForm, setNewBikeForm] = useState({
    nickname: "",
    make: "Royal Enfield",
    model: "",
    regNumber: "",
    engineCc: 350,
    fuelTankCapacityLitres: 13,
    fuelType: "petrol" as "petrol" | "electric",
  });

  // Subscribe to live telemetry and bike updates
  useEffect(() => {
    const unsubTelemetry = smartConnectService.subscribeTelemetry((t) => setTelemetry(t));
    const unsubBike = smartConnectService.subscribeBike((b) => setActiveBike(b));
    const unsubDevices = smartConnectService.subscribeDevices((d) => setDevices(d));

    return () => {
      unsubTelemetry();
      unsubBike();
      unsubDevices();
    };
  }, []);

  const connectedDevice = devices.find((d) => d.isConnected);

  // Speedometer Needle Calculation (for SVG arc: 0 to 140 km/h mapped to -120deg to +120deg)
  const maxSpeedGauge = 140;
  const speedClamped = Math.min(maxSpeedGauge, Math.max(0, telemetry.currentSpeedKmh));
  const speedAngle = -120 + (speedClamped / maxSpeedGauge) * 240;

  // RPM Needle Calculation (0 to 9000 RPM mapped to -110deg to +110deg)
  const rpmClamped = Math.min(9000, Math.max(0, telemetry.currentRpm));
  const rpmAngle = -110 + (rpmClamped / 9000) * 220;

  // Handle switching active bike
  const handleSelectBike = (bikeId: string) => {
    const b = smartConnectService.setActiveBike(bikeId);
    setActiveBike(b);
  };

  // Connect device
  const handleConnectDevice = async (deviceId: string) => {
    setPairingNotice("Negotiating BLE pairing & CAN-Bus encryption...");
    await smartConnectService.connectDevice(deviceId);
    setPairingNotice(null);
    setShowPairModal(false);
  };

  const handleDisconnect = () => {
    smartConnectService.disconnectDevice();
  };

  const handleScanWebBluetooth = async () => {
    setPairingNotice("Scanning for nearby Bluetooth 5.2 OBD-II adapters...");
    const res = await smartConnectService.scanForWebBluetooth();
    if (res.success) {
      setPairingNotice(`Successfully paired with ${res.deviceName}!`);
      setTimeout(() => {
        setPairingNotice(null);
        setShowPairModal(false);
      }, 1500);
    } else {
      setPairingNotice(res.error || "Web Bluetooth unavailable in sandbox. Connected to Simulated SmartConnect Dongle.");
      setTimeout(() => setPairingNotice(null), 3000);
    }
  };

  const handleAddNewBike = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBikeForm.model.trim()) return;

    const created = smartConnectService.addBike({
      nickname: newBikeForm.nickname || newBikeForm.model,
      make: newBikeForm.make,
      model: newBikeForm.model,
      type: newBikeForm.fuelType === "electric" ? "electric_bike" : "motorcycle",
      regNumber: newBikeForm.regNumber || `TN 37 AB ${Math.floor(1000 + Math.random() * 9000)}`,
      vinNumber: `ME4${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      year: 2024,
      engineCc: Number(newBikeForm.engineCc) || 350,
      fuelType: newBikeForm.fuelType,
      fuelTankCapacityLitres: Number(newBikeForm.fuelTankCapacityLitres) || 13,
      batteryVoltage: 12.6,
      batteryHealthPercent: 98,
      odometerKm: 120,
      engineOilHealthPercent: 95,
      nextServiceDueKm: 4880,
      nextServiceDueDate: "15 Dec 2026",
      tyrePressure: {
        frontPsi: 29.0,
        rearPsi: 33.0,
        targetFrontPsi: 29.0,
        targetRearPsi: 33.0,
        frontStatus: "optimal",
        rearStatus: "optimal",
        frontTempC: 32,
        rearTempC: 35,
      },
      coolantTempC: 86,
      insuranceExpiry: "30 Mar 2027",
      pucExpiry: "15 Nov 2026",
      rcStatus: "Active & Verified",
    });

    setAllBikes(smartConnectService.getBikes());
    setActiveBike(created);
    setShowBikeModal(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. TOP HEADER & CONNECTIVITY BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white p-6 rounded-3xl border border-slate-700/80 shadow-xl relative overflow-hidden">
        {/* Glow aesthetics */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-400 flex items-center justify-center shrink-0 shadow-inner">
              <Bike className="w-8 h-8" />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">
                  Smart Connect • Vehicle Telemetry
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
                  {activeBike.regNumber}
                </span>
                {connectedDevice ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse">
                    <Radio className="w-3 h-3 text-emerald-400" />
                    BLE Connected ({connectedDevice.signalDbm} dBm)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    <AlertTriangle className="w-3 h-3 text-rose-400" />
                    Dongle Disconnected
                  </span>
                )}
              </div>

              <h2 className="text-2xl font-black text-white mt-1">
                {activeBike.make} {activeBike.model}
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Owner: <span className="font-semibold text-white">{userProfile.name}</span> • Odometer:{" "}
                <span className="font-semibold text-cyan-300">{activeBike.odometerKm.toLocaleString()} km</span> •{" "}
                Engine: <span className="font-semibold text-white">{activeBike.engineCc > 0 ? `${activeBike.engineCc} cc` : "Pure Electric (PMSM)"}</span>
              </p>
            </div>
          </div>

          {/* Quick Bike Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={activeBike.id}
              onChange={(e) => handleSelectBike(e.target.value)}
              className="bg-slate-800/90 border border-slate-700 text-white text-xs font-semibold rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all cursor-pointer"
            >
              {allBikes.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.make} {b.model} ({b.regNumber})
                </option>
              ))}
            </select>

            <button
              onClick={() => setShowBikeModal(true)}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl border border-slate-700 transition-colors"
              title="Add or Customize Bike"
            >
              <Plus className="w-4 h-4" />
            </button>

            {connectedDevice ? (
              <button
                onClick={handleDisconnect}
                className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1.5 transition-colors"
              >
                <Bluetooth className="w-3.5 h-3.5 text-cyan-400" />
                <span>Disconnect</span>
              </button>
            ) : (
              <button
                onClick={() => setShowPairModal(true)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white flex items-center gap-1.5 shadow-lg shadow-cyan-600/30 transition-all"
              >
                <Bluetooth className="w-3.5 h-3.5" />
                <span>Pair Dongle</span>
              </button>
            )}

            {onOpenVoiceCommand && (
              <button
                onClick={onOpenVoiceCommand}
                className="p-2.5 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 rounded-xl border border-indigo-500/40 transition-colors"
                title="Speak 'Check bike speed' or 'How much petrol left'"
              >
                <Sparkles className="w-4 h-4 text-cyan-300" />
              </button>
            )}
          </div>
        </div>

        {/* CONNECTED HARDWARE STATUS STRIP */}
        <div className="mt-4 pt-3.5 border-t border-slate-700/70 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Bluetooth className="w-3.5 h-3.5 text-cyan-400" />
              Adapter: <strong className="text-white">{connectedDevice?.name || "None"}</strong>
            </span>
            <span className="text-slate-500 hidden sm:inline">•</span>
            <span className="flex items-center gap-1.5">
              Protocol: <strong className="text-slate-200">{connectedDevice?.protocol || "BLE Standby"}</strong>
            </span>
            <span className="text-slate-500 hidden sm:inline">•</span>
            <span className="flex items-center gap-1.5">
              Battery: <strong className="text-emerald-400">{connectedDevice?.batteryPercent || 95}%</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400">Simulation:</span>
            <button
              onClick={() => setIsAutoSim(smartConnectService.toggleAutoSimulation())}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                isAutoSim
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                  : "bg-slate-800 text-slate-400 border border-slate-700"
              }`}
            >
              {isAutoSim ? "Traffic Auto-Drive (ON)" : "Manual Throttle (ON)"}
            </button>
          </div>
        </div>
      </div>

      {/* 2. PRIMARY LIVE GAUGES: SPEEDOMETER, RPM & LEAN ANGLE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SPEEDOMETER CIRCULAR CLUSTER */}
        <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-col items-center justify-between relative">
          <div className="w-full flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Gauge className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Speedometer Telemetry
              </span>
            </div>
            {/* Speed limit sign */}
            <div className="w-9 h-9 rounded-full border-2 border-red-500 bg-white text-slate-900 font-black text-xs flex flex-col items-center justify-center shadow-md">
              <span>50</span>
              <span className="text-[7px] -mt-1 uppercase">km/h</span>
            </div>
          </div>

          {/* SVG SPEEDOMETER DIAL */}
          <div className="relative w-64 h-56 flex items-center justify-center my-1">
            <svg viewBox="0 0 240 200" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="speedGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="55%" stopColor="#06b6d4" />
                  <stop offset="85%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#ef4444" />
                </linearGradient>
              </defs>

              {/* Background Arc */}
              <path
                d="M 30 150 A 90 90 0 1 1 210 150"
                fill="none"
                stroke="#1e293b"
                strokeWidth="14"
                strokeLinecap="round"
              />

              {/* Colored Speed Arc */}
              <path
                d="M 30 150 A 90 90 0 1 1 210 150"
                fill="none"
                stroke="url(#speedGrad)"
                strokeWidth="14"
                strokeDasharray="420"
                strokeDashoffset={420 - (speedClamped / maxSpeedGauge) * 315}
                strokeLinecap="round"
                className="transition-all duration-300"
              />

              {/* Tick Marks & Speed Labels */}
              {[0, 20, 40, 60, 80, 100, 120, 140].map((s) => {
                const angle = -120 + (s / 140) * 240;
                const rad = (angle - 90) * (Math.PI / 180);
                const x = 120 + 72 * Math.cos(rad);
                const y = 140 + 72 * Math.sin(rad);
                return (
                  <text
                    key={s}
                    x={x}
                    y={y}
                    fill="#64748b"
                    fontSize="9"
                    fontWeight="bold"
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    {s}
                  </text>
                );
              })}

              {/* Dynamic Needle */}
              <g transform={`translate(120, 140) rotate(${speedAngle})`}>
                <line x1="0" y1="0" x2="0" y2="-72" stroke="#38bdf8" strokeWidth="3.5" strokeLinecap="round" />
                <circle cx="0" cy="0" r="8" fill="#0284c7" stroke="#38bdf8" strokeWidth="2" />
              </g>
            </svg>

            {/* Central Digital Readout */}
            <div className="absolute inset-x-0 bottom-4 flex flex-col items-center">
              <span className="text-4xl font-black tracking-tight text-white font-mono">
                {telemetry.currentSpeedKmh}
              </span>
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">km / h</span>
              <span className="text-[10px] text-slate-400 mt-0.5">
                {telemetry.currentSpeedKmh > 50 ? (
                  <span className="text-rose-400 font-bold">⚠️ Overspeed Warning (&gt;50 km/h)</span>
                ) : (
                  <span className="text-emerald-400 font-semibold">✓ Normal City Pace</span>
                )}
              </span>
            </div>
          </div>

          {/* Speed Records Sub-bar */}
          <div className="w-full grid grid-cols-2 gap-2 pt-3 border-t border-slate-800 text-xs">
            <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
              <span className="text-[10px] text-slate-400 block">Top Speed</span>
              <span className="text-base font-bold text-white font-mono">{telemetry.topSpeedKmh} km/h</span>
            </div>
            <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
              <span className="text-[10px] text-slate-400 block">Average Speed</span>
              <span className="text-base font-bold text-cyan-300 font-mono">{telemetry.avgSpeedKmh} km/h</span>
            </div>
          </div>
        </div>

        {/* ENGINE RPM, GEAR & LEAN ANGLE GAUGES */}
        <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Powertrain & Gyro
              </span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
              <span className="text-[10px] text-slate-400">Mode:</span>
              <span className="text-xs font-bold text-cyan-400">{telemetry.ridingMode}</span>
            </div>
          </div>

          {/* Gear & RPM cluster */}
          <div className="flex items-center justify-around py-3 bg-slate-800/40 rounded-2xl border border-slate-700/60">
            {/* Gear Indicator Box */}
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase mb-1">Gear</span>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-b from-slate-800 to-slate-900 border-2 border-cyan-500/50 flex items-center justify-center text-3xl font-black text-cyan-300 font-mono shadow-inner">
                {telemetry.currentGear}
              </div>
              <span className="text-[10px] text-slate-400 mt-1">5-Speed Mesh</span>
            </div>

            {/* Tachometer RPM Display */}
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase mb-1">Engine RPM</span>
              <div className="text-2xl font-black text-amber-400 font-mono">
                {telemetry.currentRpm.toLocaleString()}
              </div>
              <div className="w-32 bg-slate-700 h-2.5 rounded-full overflow-hidden mt-2">
                <div
                  className={`h-full transition-all duration-300 ${
                    telemetry.currentRpm > 6500
                      ? "bg-rose-500"
                      : telemetry.currentRpm > 4500
                      ? "bg-amber-400"
                      : "bg-emerald-400"
                  }`}
                  style={{ width: `${(telemetry.currentRpm / telemetry.maxRpm) * 100}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-1">Redline: 8,500 RPM</span>
            </div>
          </div>

          {/* DYNAMIC LEAN ANGLE GYRO SENSOR (Popular Bike Feature) */}
          <div className="mt-4 pt-3 border-t border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-cyan-400" />
                Live Lean Angle (Gyro)
              </span>
              <span className="font-mono font-bold text-cyan-300">
                {telemetry.leanAngleDeg > 0
                  ? `${telemetry.leanAngleDeg}° Right`
                  : telemetry.leanAngleDeg < 0
                  ? `${Math.abs(telemetry.leanAngleDeg)}° Left`
                  : "0° Center"}
              </span>
            </div>

            {/* Visual Bike Tilting Representation */}
            <div className="h-16 bg-slate-800/60 rounded-xl border border-slate-700/60 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-x-0 h-px bg-slate-700 top-1/2" />
              <div className="absolute inset-y-0 w-px bg-slate-700 left-1/2" />

              {/* Tilting Motorcycle Icon */}
              <div
                className="transition-transform duration-300 ease-out z-10 text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]"
                style={{ transform: `rotate(${telemetry.leanAngleDeg}deg)` }}
              >
                <Bike className="w-8 h-8" />
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span>Max Left: <strong className="text-slate-200 font-mono">{telemetry.maxLeanAngle.left}°</strong></span>
              <span>Max Right: <strong className="text-slate-200 font-mono">{telemetry.maxLeanAngle.right}°</strong></span>
            </div>
          </div>

          {/* Riding Mode Buttons */}
          <div className="grid grid-cols-4 gap-1.5 pt-3 border-t border-slate-800">
            {(["Eco", "City", "Sport", "Rain"] as const).map((m) => (
              <button
                key={m}
                onClick={() => smartConnectService.setRidingMode(m)}
                className={`py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                  telemetry.ridingMode === m
                    ? "bg-cyan-600 text-white shadow-sm"
                    : "bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* FUEL EFFICIENCY & ECONOMY HIGHLIGHT */}
        <div className="bg-gradient-to-br from-emerald-950/70 via-slate-900 to-slate-900 text-white p-6 rounded-3xl border border-emerald-500/30 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Fuel className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                  Fuel Efficiency & Range
                </span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Eco Score: {telemetry.ecoScore}/100
              </span>
            </div>

            {/* Instant Mileage Highlight */}
            <div className="bg-emerald-900/30 border border-emerald-500/40 p-4 rounded-2xl mb-4">
              <span className="text-[11px] text-emerald-200 block font-medium">Instant Fuel Efficiency</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black text-white font-mono">
                  {telemetry.instantFuelEfficiencyKmpl}
                </span>
                <span className="text-xs font-bold text-emerald-300">km / Litre</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-emerald-200/80 mt-2 pt-2 border-t border-emerald-500/20">
                <span>Trip Average: <strong className="text-white">{telemetry.tripAvgFuelEfficiencyKmpl} km/L</strong></span>
                <span>Saved: <strong className="text-emerald-300">{telemetry.fuelSavedLitres} L</strong></span>
              </div>
            </div>

            {/* Fuel Tank Level Bar */}
            <div className="space-y-1.5 mb-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300">Fuel Remaining:</span>
                <span className="font-bold text-white font-mono">
                  {telemetry.fuelRemainingLitres.toFixed(1)} L ({telemetry.fuelLevelPercent}%)
                </span>
              </div>
              <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden border border-slate-700">
                <div
                  className={`h-full transition-all duration-500 ${
                    telemetry.fuelLevelPercent > 40
                      ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                      : telemetry.fuelLevelPercent > 15
                      ? "bg-amber-400"
                      : "bg-rose-500 animate-pulse"
                  }`}
                  style={{ width: `${telemetry.fuelLevelPercent}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Tank: {activeBike.fuelTankCapacityLitres} Litres</span>
                <span className="text-cyan-300 font-bold">
                  DTE: {telemetry.distanceToEmptyKm} km
                </span>
              </div>
            </div>

            {/* Financial Rupee Cost Calculation */}
            <div className="grid grid-cols-2 gap-2 text-xs bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
              <div>
                <span className="text-[10px] text-slate-400 block">Trip Expense</span>
                <span className="text-base font-black text-emerald-400 font-mono">
                  ₹{telemetry.tripCostInr.toFixed(1)}
                </span>
                <span className="text-[9px] text-slate-400 block">@ ₹{PETROL_PRICE_PER_LITRE_INR}/L</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Running Cost</span>
                <span className="text-base font-black text-white font-mono">
                  ₹{(PETROL_PRICE_PER_LITRE_INR / (telemetry.tripAvgFuelEfficiencyKmpl || 38)).toFixed(2)}
                </span>
                <span className="text-[9px] text-slate-400 block">per kilometer</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-800">
            <button
              onClick={() => smartConnectService.refuelTank()}
              className="flex-1 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-1.5 transition-colors"
            >
              <Fuel className="w-3.5 h-3.5" />
              <span>Full Refuel</span>
            </button>

            <button
              onClick={() => smartConnectService.resetTripMeter()}
              className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1 transition-colors"
              title="Reset Trip A Odometer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Trip</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. INTERACTIVE THROTTLE TEST CONTROLLER (When manual mode active) */}
      {!isAutoSim && (
        <div className="bg-slate-900 border border-cyan-500/40 p-4 rounded-2xl text-white shadow-lg animate-in fade-in">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-cyan-300 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              Manual Throttle Simulation Slider
            </span>
            <span className="text-xs text-slate-400">
              Drag to simulate speed change: <strong className="text-white font-mono">{telemetry.currentSpeedKmh} km/h</strong>
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="120"
            value={telemetry.currentSpeedKmh}
            onChange={(e) => smartConnectService.setManualSpeed(Number(e.target.value))}
            className="w-full accent-cyan-500 cursor-pointer h-2 bg-slate-700 rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1">
            <span>0 km/h (Idle 1,050 RPM)</span>
            <span>45 km/h (Optimal 42+ km/L)</span>
            <span>80 km/h (Top Gear)</span>
            <span>120 km/h (Expressway)</span>
          </div>
        </div>
      )}

      {/* 4. BIKE HEALTH SENSORS & DIAGNOSTICS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* TPMS Front & Rear */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
              <CircleDot className="w-4 h-4 text-blue-600" />
              Tyre Pressure (TPMS)
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
              Optimal
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-[10px] text-slate-500 block">Front Tyre</span>
              <span className="text-lg font-black text-slate-900 font-mono">
                {activeBike.tyrePressure.frontPsi} <span className="text-xs text-slate-500">PSI</span>
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                Target: {activeBike.tyrePressure.targetFrontPsi} PSI • {activeBike.tyrePressure.frontTempC}°C
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-[10px] text-slate-500 block">Rear Tyre</span>
              <span className="text-lg font-black text-slate-900 font-mono">
                {activeBike.tyrePressure.rearPsi} <span className="text-xs text-slate-500">PSI</span>
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                Target: {activeBike.tyrePressure.targetRearPsi} PSI • {activeBike.tyrePressure.rearTempC}°C
              </span>
            </div>
          </div>
        </div>

        {/* Battery & Charging */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
              <BatteryCharging className="w-4 h-4 text-emerald-600" />
              Electrical & Battery
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
              {activeBike.batteryHealthPercent}% Health
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-slate-600">Terminal Voltage</span>
              <span className="text-xl font-black text-slate-900 font-mono">
                {activeBike.batteryVoltage} V
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
              <span>Alternator Status</span>
              <span className="text-emerald-600 font-bold">14.2V Charging</span>
            </div>
          </div>
        </div>

        {/* Engine Oil & Coolant Temperature */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
              <Wrench className="w-4 h-4 text-amber-600" />
              Engine & Oil Life
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
              {activeBike.engineOilHealthPercent}% Life
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-slate-600">Operating Temp</span>
              <span className="text-xl font-black text-slate-900 font-mono">
                {activeBike.coolantTempC}°C
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
              <span>Next Oil Change</span>
              <span className="text-slate-800 font-bold">{activeBike.nextServiceDueKm} km</span>
            </div>
          </div>
        </div>

        {/* Service & Maintenance Due */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-purple-600" />
              Next Service Due
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-800">
              Scheduled
            </span>
          </div>

          <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-100 space-y-1">
            <span className="text-xs font-bold text-purple-900 block">
              In {activeBike.nextServiceDueKm} km ({activeBike.nextServiceDueDate})
            </span>
            <span className="text-[10px] text-purple-700 block">
              Periodic 10,000 km general service and spark plug check.
            </span>
          </div>
        </div>
      </div>

      {/* 5. REGISTRATION WALLET & SERVICE LOGS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Document Wallet */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900">Vehicle Documents</h3>
            </div>
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              All Valid
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
              <div>
                <span className="text-slate-500 block text-[10px]">Registration Certificate (RC)</span>
                <span className="font-bold text-slate-900">{activeBike.regNumber}</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                Active & Verified
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
              <div>
                <span className="text-slate-500 block text-[10px]">Motor Vehicle Insurance</span>
                <span className="font-bold text-slate-900">Valid until {activeBike.insuranceExpiry}</span>
              </div>
              <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                Comprehensive
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
              <div>
                <span className="text-slate-500 block text-[10px]">Pollution Certificate (PUC)</span>
                <span className="font-bold text-slate-900">Valid until {activeBike.pucExpiry}</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                Pass (BS-VI)
              </span>
            </div>
          </div>
        </div>

        {/* Service History Timeline */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <Wrench className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900">Service & Maintenance History</h3>
            </div>
            <button
              onClick={() => setShowServiceModal(true)}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Log Service
            </button>
          </div>

          <div className="space-y-3">
            {serviceRecords.map((record) => (
              <div
                key={record.id}
                className="p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{record.serviceType}</span>
                    <span className="text-[10px] text-slate-500">• {record.odometerKm.toLocaleString()} km</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                      {record.status}
                    </span>
                  </div>
                  <p className="text-slate-600">{record.notes}</p>
                  <span className="text-[10px] text-slate-400 block">{record.center}</span>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-sm font-black text-slate-900 font-mono">₹{record.costInr}</span>
                  <span className="text-[10px] text-slate-400 block">{record.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 6. MODAL: PAIR SMART CONNECT BLUETOOTH DONGLE */}
      {showPairModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 max-w-md w-full rounded-3xl p-6 shadow-2xl text-white space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <Bluetooth className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Smart Connect Pairing</h3>
                  <p className="text-xs text-slate-400">Connect to your motorcycle's BLE or OBD-II port</p>
                </div>
              </div>
              <button
                onClick={() => setShowPairModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {pairingNotice && (
              <div className="p-3 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-xs text-cyan-200 flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin shrink-0" />
                <span>{pairingNotice}</span>
              </div>
            )}

            <div className="space-y-2 text-xs">
              <span className="text-slate-400 font-bold block text-[11px] uppercase tracking-wider">
                Available Telemetry Adapters
              </span>
              {devices.map((d) => (
                <div
                  key={d.id}
                  onClick={() => handleConnectDevice(d.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    d.isConnected
                      ? "bg-cyan-950/50 border-cyan-500 text-white"
                      : "bg-slate-800/60 border-slate-700 hover:bg-slate-800 text-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Bluetooth className="w-4 h-4 text-cyan-400 shrink-0" />
                    <div>
                      <span className="font-bold block text-white">{d.name}</span>
                      <span className="text-[10px] text-slate-400">
                        {d.protocol} • MAC: {d.macAddress}
                      </span>
                    </div>
                  </div>

                  <span className="text-[11px] font-bold text-cyan-400">
                    {d.isConnected ? "Connected ✓" : `${d.signalDbm} dBm`}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={handleScanWebBluetooth}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white flex items-center justify-center gap-2 transition-all shadow-md"
              >
                <Radio className="w-4 h-4" />
                Scan for Nearby BLE Devices (Web Bluetooth)
              </button>

              <button
                onClick={() => setShowPairModal(false)}
                className="w-full py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. MODAL: ADD / CUSTOMIZE BIKE */}
      {showBikeModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 shadow-2xl text-slate-900 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Bike className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Add or Edit Bike</h3>
                  <p className="text-xs text-slate-500">Configure specifications for real-time tracking</p>
                </div>
              </div>
              <button
                onClick={() => setShowBikeModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddNewBike} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Make / Brand</label>
                <select
                  value={newBikeForm.make}
                  onChange={(e) => setNewBikeForm({ ...newBikeForm, make: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-800 font-medium"
                >
                  <option value="Royal Enfield">Royal Enfield</option>
                  <option value="TVS">TVS Motor</option>
                  <option value="Yamaha">Yamaha</option>
                  <option value="KTM">KTM</option>
                  <option value="Honda">Honda</option>
                  <option value="Ather">Ather Energy (Electric)</option>
                  <option value="Bajaj">Bajaj Auto</option>
                  <option value="Hero">Hero MotoCorp</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Model Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hunter 350, Apache RTR 200, MT-15"
                  value={newBikeForm.model}
                  onChange={(e) => setNewBikeForm({ ...newBikeForm, model: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-800 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Registration No.</label>
                  <input
                    type="text"
                    placeholder="e.g. TN 37 CK 4829"
                    value={newBikeForm.regNumber}
                    onChange={(e) => setNewBikeForm({ ...newBikeForm, regNumber: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-800 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Fuel Type</label>
                  <select
                    value={newBikeForm.fuelType}
                    onChange={(e) => setNewBikeForm({ ...newBikeForm, fuelType: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-800 font-medium"
                  >
                    <option value="petrol">Petrol</option>
                    <option value="electric">Electric (EV)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Engine Displacement (CC)</label>
                  <input
                    type="number"
                    placeholder="e.g. 349"
                    value={newBikeForm.engineCc}
                    onChange={(e) => setNewBikeForm({ ...newBikeForm, engineCc: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-800 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tank Capacity (Litres)</label>
                  <input
                    type="number"
                    step="0.5"
                    placeholder="e.g. 13"
                    value={newBikeForm.fuelTankCapacityLitres}
                    onChange={(e) => setNewBikeForm({ ...newBikeForm, fuelTankCapacityLitres: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-800 font-medium"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowBikeModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-sm"
                >
                  Save Bike Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. MODAL: LOG SERVICE RECORD */}
      {showServiceModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 shadow-2xl text-slate-900 space-y-4">
            <div className="flex items-start justify-between">
              <h3 className="font-bold text-base text-slate-900">Log Maintenance Service</h3>
              <button
                onClick={() => setShowServiceModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-600">
                Record newly completed maintenance or oil change for{" "}
                <strong>{activeBike.make} {activeBike.model}</strong>.
              </p>
              <button
                onClick={() => {
                  const rec = smartConnectService.addServiceRecord({
                    date: "Today",
                    odometerKm: activeBike.odometerKm,
                    serviceType: "Oil & Filter Change",
                    center: "Authorized Service Center (Coimbatore)",
                    costInr: 1650,
                    notes: "Engine oil flushed, oil filter replaced, chain tension checked.",
                    status: "Completed",
                  });
                  setServiceRecords(smartConnectService.getServiceRecords());
                  setShowServiceModal(false);
                }}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
              >
                Confirm & Log ₹1,650 Service Entry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
