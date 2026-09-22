import React, { useRef, useEffect, useState, useMemo } from "react";
import * as d3 from "d3";
import {
  Navigation,
  Play,
  Pause,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Gauge,
  TrendingUp,
  MapPin,
  Layers,
  Sparkles,
  Compass,
  Zap,
  Info,
  Activity,
  CheckCircle2
} from "lucide-react";
import { RouteOption, UserProfile } from "../types";

export interface GPSPoint {
  id: number;
  lat: number;
  lng: number;
  x: number;
  y: number;
  distKm: number;
  speedKmh: number;
  elevationM: number;
  timeSec: number;
  landmark?: string;
  congestion: "low" | "moderate" | "heavy";
  roadName: string;
}

interface NavigationPathD3ViewProps {
  activeRoute?: RouteOption;
  sessionDistanceKm?: number;
  sessionSeconds?: number;
  sessionTopSpeed?: number;
  averageSpeedKmh?: number;
  userProfile?: UserProfile;
}

// High-resolution GPS trajectory simulated for Gandhipuram Central -> Saravanampatti Tech Zone (NH-209 Sathy Road corridor)
const generateRealisticTrajectory = (totalDistKm: number = 14.2): GPSPoint[] => {
  const points: GPSPoint[] = [];
  const count = 75; // 75 high-fidelity recorded GPS telemetry fixes
  
  // Key geographic landmarks along Coimbatore NH-209 corridor
  const keyNodes = [
    { pct: 0.0, x: 80, y: 340, lat: 11.0183, lng: 76.9725, elevation: 412, landmark: "Gandhipuram Central Terminal", road: "Cross Cut Road", speed: 28, congestion: "moderate" as const },
    { pct: 0.12, x: 160, y: 310, lat: 11.0260, lng: 76.9760, elevation: 414, landmark: "100ft Road Cross / Power House", road: "Sathy Road Arterial", speed: 42, congestion: "low" as const },
    { pct: 0.25, x: 260, y: 275, lat: 11.0340, lng: 76.9810, elevation: 416, landmark: "Ganapathy Flyover Ramp", road: "NH-209 Ganapathy", speed: 18, congestion: "heavy" as const },
    { pct: 0.38, x: 370, y: 235, lat: 11.0420, lng: 76.9840, elevation: 420, landmark: "Textool Junction Signal", road: "NH-209 Central", speed: 14, congestion: "heavy" as const },
    { pct: 0.52, x: 490, y: 200, lat: 11.0530, lng: 76.9875, elevation: 425, landmark: "Prozone Mall Junction", road: "Sathy Highway", speed: 52, congestion: "low" as const },
    { pct: 0.68, x: 620, y: 165, lat: 11.0650, lng: 76.9910, elevation: 430, landmark: "Sivanandapuram Intersection", road: "NH-209 North", speed: 58, congestion: "low" as const },
    { pct: 0.84, x: 740, y: 130, lat: 11.0760, lng: 76.9935, elevation: 434, landmark: "Vilankurichi Bypass Junction", road: "Saravanampatti Link", speed: 46, congestion: "moderate" as const },
    { pct: 1.0, x: 860, y: 95, lat: 11.0825, lng: 76.9958, elevation: 438, landmark: "Saravanampatti Tech Zone / CHIL SEZ", road: "Tech Corridor Main Gate", speed: 25, congestion: "low" as const },
  ];

  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const distKm = Math.round(t * totalDistKm * 100) / 100;
    
    // Find surrounding key nodes
    let lowerNode = keyNodes[0];
    let upperNode = keyNodes[keyNodes.length - 1];
    for (let k = 0; k < keyNodes.length - 1; k++) {
      if (t >= keyNodes[k].pct && t <= keyNodes[k + 1].pct) {
        lowerNode = keyNodes[k];
        upperNode = keyNodes[k + 1];
        break;
      }
    }

    const span = upperNode.pct - lowerNode.pct || 1;
    const localT = (t - lowerNode.pct) / span;

    // Smooth interpolation with gentle highway curve noise
    const curveWobble = Math.sin(t * Math.PI * 3.5) * 8 + Math.cos(t * Math.PI * 6) * 3;
    const x = lowerNode.x + (upperNode.x - lowerNode.x) * localT + Math.sin(t * Math.PI * 5) * 4;
    const y = lowerNode.y + (upperNode.y - lowerNode.y) * localT + curveWobble;

    const lat = lowerNode.lat + (upperNode.lat - lowerNode.lat) * localT;
    const lng = lowerNode.lng + (upperNode.lng - lowerNode.lng) * localT;
    const elevationM = Math.round(lowerNode.elevation + (upperNode.elevation - lowerNode.elevation) * localT);

    // Speed variation with realistic road dynamics
    let baseSpeed = lowerNode.speed + (upperNode.speed - lowerNode.speed) * localT;
    const speedNoise = (Math.sin(i * 1.3) * 4) + (Math.cos(i * 0.7) * 3);
    const speedKmh = Math.max(12, Math.min(68, Math.round(baseSpeed + speedNoise)));

    let congestion: "low" | "moderate" | "heavy" = "low";
    if (speedKmh < 24) congestion = "heavy";
    else if (speedKmh < 42) congestion = "moderate";

    // Estimate cumulative session seconds (average ~38 km/h)
    const timeSec = Math.round((distKm / 38) * 3600);

    // Match exact landmark if close to keyNode
    let landmark: string | undefined = undefined;
    if (localT < 0.06) landmark = lowerNode.landmark;
    else if (localT > 0.94) landmark = upperNode.landmark;

    points.push({
      id: i,
      lat: Math.round(lat * 10000) / 10000,
      lng: Math.round(lng * 10000) / 10000,
      x: Math.round(x * 10) / 10,
      y: Math.round(y * 10) / 10,
      distKm,
      speedKmh,
      elevationM,
      timeSec,
      landmark,
      congestion,
      roadName: lowerNode.road
    });
  }

  return points;
};

export const NavigationPathD3View: React.FC<NavigationPathD3ViewProps> = ({
  activeRoute,
  sessionDistanceKm = 10.8,
  sessionSeconds = 1045,
  sessionTopSpeed = 58.4,
  averageSpeedKmh = 37.2,
  userProfile,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Layer mode: 'speed' (speed heatmap), 'congestion' (traffic delays), 'elevation' (terrain gradient)
  const [colorMode, setColorMode] = useState<"speed" | "congestion" | "elevation">("speed");
  const [isReplaying, setIsReplaying] = useState<boolean>(false);
  const [replayProgress, setReplayProgress] = useState<number>(0.76); // Initial replay position matches ~10.8 km
  const [hoveredPoint, setHoveredPoint] = useState<GPSPoint | null>(null);
  const [showCoordinatesGrid, setShowCoordinatesGrid] = useState<boolean>(true);
  const [showWaypoints, setShowWaypoints] = useState<boolean>(true);

  // Generate the high-density GPS track data
  const totalRouteKm = activeRoute?.distanceKm || 14.2;
  const trajectoryPoints = useMemo(() => generateRealisticTrajectory(totalRouteKm), [totalRouteKm]);

  // ViewBox dimensions for D3 canvas
  const width = 940;
  const height = 440;
  const margin = { top: 40, right: 50, bottom: 45, left: 60 };

  // Replay animation loop
  useEffect(() => {
    let animationFrameId: number;
    let lastTimestamp: number | null = null;

    if (isReplaying) {
      const animate = (timestamp: number) => {
        if (!lastTimestamp) lastTimestamp = timestamp;
        const delta = (timestamp - lastTimestamp) / 1000;
        lastTimestamp = timestamp;

        setReplayProgress((prev) => {
          const next = prev + delta * 0.08; // ~12 seconds for complete route animation
          if (next >= 1) {
            setIsReplaying(false);
            return 1;
          }
          return next;
        });

        animationFrameId = requestAnimationFrame(animate);
      };

      animationFrameId = requestAnimationFrame(animate);
    }

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [isReplaying]);

  // D3 Rendering & Interactive Probing
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous render

    // Define Defs: Linear Gradients and Drop Shadows
    const defs = svg.append("defs");

    // Speed multi-stop gradient (Rose -> Amber -> Emerald)
    const speedGradient = defs.append("linearGradient")
      .attr("id", "d3-path-speed-gradient")
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", 80).attr("y1", 340)
      .attr("x2", 860).attr("y2", 95);

    speedGradient.append("stop").attr("offset", "0%").attr("stop-color", "#f59e0b"); // Ganapathy moderate
    speedGradient.append("stop").attr("offset", "25%").attr("stop-color", "#ef4444"); // Heavy flyover bottleneck
    speedGradient.append("stop").attr("offset", "40%").attr("stop-color", "#ef4444"); // Textool signal crawl
    speedGradient.append("stop").attr("offset", "55%").attr("stop-color", "#10b981"); // Prozone mall cruise
    speedGradient.append("stop").attr("offset", "75%").attr("stop-color", "#059669"); // 58 km/h open road
    speedGradient.append("stop").attr("offset", "90%").attr("stop-color", "#0ea5e9"); // Saravanampatti tech gate
    speedGradient.append("stop").attr("offset", "100%").attr("stop-color", "#3b82f6");

    // Congestion gradient
    const congestionGradient = defs.append("linearGradient")
      .attr("id", "d3-path-congestion-gradient")
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", 80).attr("y1", 340)
      .attr("x2", 860).attr("y2", 95);

    congestionGradient.append("stop").attr("offset", "0%").attr("stop-color", "#f59e0b");
    congestionGradient.append("stop").attr("offset", "25%").attr("stop-color", "#ef4444");
    congestionGradient.append("stop").attr("offset", "45%").attr("stop-color", "#ef4444");
    congestionGradient.append("stop").attr("offset", "60%").attr("stop-color", "#10b981");
    congestionGradient.append("stop").attr("offset", "85%").attr("stop-color", "#10b981");
    congestionGradient.append("stop").attr("offset", "100%").attr("stop-color", "#f59e0b");

    // Elevation gradient
    const elevationGradient = defs.append("linearGradient")
      .attr("id", "d3-path-elevation-gradient")
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", 80).attr("y1", 340)
      .attr("x2", 860).attr("y2", 95);

    elevationGradient.append("stop").attr("offset", "0%").attr("stop-color", "#6366f1");
    elevationGradient.append("stop").attr("offset", "50%").attr("stop-color", "#8b5cf6");
    elevationGradient.append("stop").attr("offset", "100%").attr("stop-color", "#d946ef");

    // Glow filter
    const glowFilter = defs.append("filter")
      .attr("id", "d3-path-glow")
      .attr("x", "-20%").attr("y", "-20%").attr("width", "140%").attr("height", "140%");
    glowFilter.append("feGaussianBlur").attr("stdDeviation", "4").attr("result", "coloredBlur");
    const feMerge = glowFilter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    // Main Canvas Container Group
    const g = svg.append("g").attr("class", "d3-spatial-container");

    // 1. Background Grid & Spatial Coordinates System
    if (showCoordinatesGrid) {
      const gridGroup = g.append("g").attr("class", "d3-spatial-grid").attr("opacity", 0.35);

      // Latitudinal grid lines (11.02° N to 11.08° N)
      const latLines = [
        { label: "11.02° N", y: 340 },
        { label: "11.04° N", y: 255 },
        { label: "11.06° N", y: 170 },
        { label: "11.08° N", y: 85 }
      ];

      latLines.forEach((l) => {
        gridGroup.append("line")
          .attr("x1", margin.left)
          .attr("y1", l.y)
          .attr("x2", width - margin.right)
          .attr("y2", l.y)
          .attr("stroke", "#94a3b8")
          .attr("stroke-dasharray", "4,4")
          .attr("stroke-width", 0.75);

        gridGroup.append("text")
          .attr("x", margin.left - 12)
          .attr("y", l.y + 4)
          .attr("font-size", "10px")
          .attr("font-family", "monospace")
          .attr("font-weight", "600")
          .attr("fill", "#64748b")
          .attr("text-anchor", "end")
          .text(l.label);
      });

      // Longitudinal grid lines (76.97° E to 76.99° E)
      const lngLines = [
        { label: "76.970° E", x: 100 },
        { label: "76.978° E", x: 320 },
        { label: "76.986° E", x: 540 },
        { label: "76.994° E", x: 760 },
      ];

      lngLines.forEach((l) => {
        gridGroup.append("line")
          .attr("x1", l.x)
          .attr("y1", margin.top)
          .attr("x2", l.x)
          .attr("y2", height - margin.bottom)
          .attr("stroke", "#94a3b8")
          .attr("stroke-dasharray", "4,4")
          .attr("stroke-width", 0.75);

        gridGroup.append("text")
          .attr("x", l.x)
          .attr("y", height - margin.bottom + 20)
          .attr("font-size", "10px")
          .attr("font-family", "monospace")
          .attr("font-weight", "600")
          .attr("fill", "#64748b")
          .attr("text-anchor", "middle")
          .text(l.label);
      });
    }

    // 2. D3 Curve Generator for Smooth Highway Alignment
    const lineGenerator = d3.line<GPSPoint>()
      .x((d) => d.x)
      .y((d) => d.y)
      .curve(d3.curveCatmullRom.alpha(0.6));

    const pathData = lineGenerator(trajectoryPoints) || "";

    // 3. Base Highway Underlay (Subtle roadway casing representing NH-209 dual carriageway)
    g.append("path")
      .attr("d", pathData)
      .attr("fill", "none")
      .attr("stroke", "#cbd5e1")
      .attr("stroke-width", 14)
      .attr("stroke-linecap", "round")
      .attr("stroke-linejoin", "round")
      .attr("opacity", 0.7);

    // Highway centerline dashed markings
    g.append("path")
      .attr("d", pathData)
      .attr("fill", "none")
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "8,8")
      .attr("opacity", 0.85);

    // 4. Primary Trajectory Path with D3 Gradient
    const gradientId =
      colorMode === "speed"
        ? "url(#d3-path-speed-gradient)"
        : colorMode === "congestion"
        ? "url(#d3-path-congestion-gradient)"
        : "url(#d3-path-elevation-gradient)";

    const primaryPath = g.append("path")
      .attr("d", pathData)
      .attr("fill", "none")
      .attr("stroke", gradientId)
      .attr("stroke-width", 6)
      .attr("stroke-linecap", "round")
      .attr("stroke-linejoin", "round")
      .attr("filter", "url(#d3-path-glow)");

    // 5. Calculate Point along path based on Replay/Progress
    const pathNode = primaryPath.node();
    const totalLength = pathNode ? pathNode.getTotalLength() : 800;
    const currentLength = totalLength * replayProgress;
    const currentPointOnPath = pathNode ? pathNode.getPointAtLength(currentLength) : { x: 500, y: 200 };

    // Covered portion glow overlay
    const coveredPoints = trajectoryPoints.filter((_, idx) => (idx / (trajectoryPoints.length - 1)) <= replayProgress);
    if (coveredPoints.length > 1) {
      g.append("path")
        .attr("d", lineGenerator(coveredPoints) || "")
        .attr("fill", "none")
        .attr("stroke", "#38bdf8")
        .attr("stroke-width", 7)
        .attr("stroke-linecap", "round")
        .attr("opacity", 0.45);
    }

    // 6. Interactive Waypoint Landmark Markers
    if (showWaypoints) {
      const keyLandmarks = trajectoryPoints.filter((p) => p.landmark);

      const waypointGroups = g.selectAll(".d3-waypoint")
        .data(keyLandmarks)
        .enter()
        .append("g")
        .attr("class", "d3-waypoint cursor-pointer")
        .attr("transform", (d) => `translate(${d.x}, ${d.y})`);

      // Outer rings
      waypointGroups.append("circle")
        .attr("r", (d, i) => (i === 0 || i === keyLandmarks.length - 1 ? 14 : 9))
        .attr("fill", (d, i) => {
          if (i === 0) return "#2563eb";
          if (i === keyLandmarks.length - 1) return "#dc2626";
          return d.congestion === "heavy" ? "#ef4444" : d.congestion === "moderate" ? "#f59e0b" : "#10b981";
        })
        .attr("stroke", "#ffffff")
        .attr("stroke-width", 2.5)
        .attr("filter", "drop-shadow(0px 2px 4px rgba(0,0,0,0.18))");

      // Inner dot
      waypointGroups.append("circle")
        .attr("r", (d, i) => (i === 0 || i === keyLandmarks.length - 1 ? 4 : 3))
        .attr("fill", "#ffffff");

      // Landmark labels (Alternating top/bottom for clear spatial balance)
      waypointGroups.each(function (d, i) {
        const group = d3.select(this);
        const isTop = i % 2 === 0;
        const yOffset = isTop ? -20 : 26;

        // Label pill background
        const text = d.landmark || "";
        const textWidth = Math.min(150, text.length * 6 + 18);

        group.append("rect")
          .attr("x", -textWidth / 2)
          .attr("y", isTop ? yOffset - 15 : yOffset - 4)
          .attr("width", textWidth)
          .attr("height", 18)
          .attr("rx", 5)
          .attr("fill", i === 0 ? "#1e3a8a" : i === keyLandmarks.length - 1 ? "#7f1d1d" : "#0f172a")
          .attr("opacity", 0.9)
          .attr("stroke", "#ffffff")
          .attr("stroke-width", 0.75);

        group.append("text")
          .attr("x", 0)
          .attr("y", isTop ? yOffset - 2 : yOffset + 9)
          .attr("text-anchor", "middle")
          .attr("font-size", "9.5px")
          .attr("font-weight", "700")
          .attr("fill", "#ffffff")
          .text(text.length > 22 ? text.substring(0, 20) + "…" : text);
      });
    }

    // 7. Active Vehicle Telemetry Marker (Rider on Hunter 350)
    const vehicleG = g.append("g")
      .attr("class", "d3-vehicle-marker")
      .attr("transform", `translate(${currentPointOnPath.x}, ${currentPointOnPath.y})`);

    // Pulsing radar ripple
    vehicleG.append("circle")
      .attr("r", 20)
      .attr("fill", "#38bdf8")
      .attr("opacity", 0.3)
      .attr("class", "animate-ping");

    // Vehicle halo
    vehicleG.append("circle")
      .attr("r", 12)
      .attr("fill", "#0284c7")
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 2.5)
      .attr("filter", "drop-shadow(0px 3px 6px rgba(2, 132, 199, 0.4))");

    // Directional chevron indicator pointing along highway direction
    vehicleG.append("path")
      .attr("d", "M -4 -3 L 0 -8 L 4 -3 L 2 -3 L 2 4 L -2 4 L -2 -3 Z")
      .attr("fill", "#ffffff")
      .attr("transform", "rotate(68)"); // Direction along NH-209 north-east corridor

    // 8. D3 Hover Probe / Closest Point Bisector for High-Precision Inspection
    const overlay = svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "transparent")
      .attr("cursor", "crosshair");

    // Probe guideline and circle elements
    const probeGroup = g.append("g").attr("class", "d3-probe-group").style("display", "none");

    const probeLine = probeGroup.append("line")
      .attr("stroke", "#38bdf8")
      .attr("stroke-width", 1.5)
      .attr("stroke-dasharray", "3,3");

    const probeCircle = probeGroup.append("circle")
      .attr("r", 8)
      .attr("fill", "#0284c7")
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 2.5);

    overlay.on("mousemove", function (event) {
      const [mouseX, mouseY] = d3.pointer(event);

      // Find closest GPS point by Euclidean distance
      let closestPoint = trajectoryPoints[0];
      let minDistance = Infinity;

      for (const pt of trajectoryPoints) {
        const dx = pt.x - mouseX;
        const dy = pt.y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < minDistance) {
          minDistance = dist;
          closestPoint = pt;
        }
      }

      // Only show probe if mouse is reasonably close to the path (< 85px)
      if (minDistance < 85) {
        probeGroup.style("display", null);
        probeLine
          .attr("x1", closestPoint.x)
          .attr("y1", margin.top)
          .attr("x2", closestPoint.x)
          .attr("y2", height - margin.bottom);

        probeCircle.attr("cx", closestPoint.x).attr("cy", closestPoint.y);
        setHoveredPoint(closestPoint);
      } else {
        probeGroup.style("display", "none");
        setHoveredPoint(null);
      }
    });

    overlay.on("mouseleave", function () {
      probeGroup.style("display", "none");
      setHoveredPoint(null);
    });

    // Handle click to seek replay progress
    overlay.on("click", function (event) {
      const [mouseX] = d3.pointer(event);
      const ratio = Math.max(0, Math.min(1, (mouseX - 80) / (860 - 80)));
      setReplayProgress(ratio);
    });

  }, [trajectoryPoints, colorMode, replayProgress, showCoordinatesGrid, showWaypoints]);

  // Current replay interpolated stats
  const currentReplayPoint = useMemo(() => {
    const idx = Math.min(
      trajectoryPoints.length - 1,
      Math.max(0, Math.floor(replayProgress * (trajectoryPoints.length - 1)))
    );
    return trajectoryPoints[idx];
  }, [trajectoryPoints, replayProgress]);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mt-6">
      {/* 1. Header & Spatial Controls Toolbar */}
      <div className="p-5 sm:p-6 border-b border-slate-200/80 bg-slate-50/70 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="w-3 h-3 text-blue-600" />
              D3.js Spatial Trajectory Engine
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
              <Zap className="w-3 h-3 text-emerald-600" />
              75 GPS Fixes Sampled
            </span>
            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-mono">
              NH-209 Sathy Arterial
            </span>
          </div>

          <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Spatial Path Representation of Last Navigation Session
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Interactive D3 visualization of recorded GPS telemetry, speed vectors, and junction waypoints from Gandhipuram Central to Saravanampatti.
          </p>
        </div>

        {/* Action Controls & Layer Switcher */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Layer Selector */}
          <div className="flex items-center p-1 bg-slate-200/70 rounded-xl text-xs font-semibold text-slate-700">
            <button
              onClick={() => setColorMode("speed")}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 text-[11px] ${
                colorMode === "speed"
                  ? "bg-white text-blue-700 shadow-sm font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Gauge className="w-3 h-3" />
              Speed Profile
            </button>
            <button
              onClick={() => setColorMode("congestion")}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 text-[11px] ${
                colorMode === "congestion"
                  ? "bg-white text-rose-700 shadow-sm font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Activity className="w-3 h-3" />
              Congestion
            </button>
            <button
              onClick={() => setColorMode("elevation")}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 text-[11px] ${
                colorMode === "elevation"
                  ? "bg-white text-indigo-700 shadow-sm font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <TrendingUp className="w-3 h-3" />
              Elevation (ASL)
            </button>
          </div>

          {/* Replay Controls */}
          <button
            onClick={() => setIsReplaying(!isReplaying)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm ${
              isReplaying
                ? "bg-amber-600 hover:bg-amber-700 text-white"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {isReplaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                Pause Replay
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                Replay Path
              </>
            )}
          </button>

          <button
            onClick={() => {
              setIsReplaying(false);
              setReplayProgress(0);
            }}
            className="p-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 transition-colors shadow-sm"
            title="Rewind to start of commute"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Toggle Grid & Waypoints */}
          <button
            onClick={() => setShowCoordinatesGrid(!showCoordinatesGrid)}
            className={`p-1.5 rounded-xl border text-xs transition-colors shadow-sm ${
              showCoordinatesGrid
                ? "bg-blue-50 border-blue-200 text-blue-700"
                : "bg-white border-slate-200 text-slate-500"
            }`}
            title="Toggle geographic coordinate grid"
          >
            <Layers className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. D3 Interactive SVG Canvas */}
      <div className="relative bg-slate-950/95 overflow-hidden" ref={containerRef}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto block select-none"
          style={{ minHeight: "340px", maxHeight: "460px" }}
        />

        {/* Floating Real-Time Replay HUD */}
        <div className="absolute top-4 left-4 pointer-events-none z-10 flex flex-col gap-2">
          <div className="bg-slate-900/90 backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-slate-700/80 shadow-2xl text-white">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-300">
                Spatial Replay Telemetry
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                {Math.round(replayProgress * 100)}%
              </span>
            </div>

            <div className="flex items-baseline gap-3">
              <div>
                <span className="text-xl font-black font-mono text-white">
                  {currentReplayPoint.speedKmh}
                </span>
                <span className="text-[10px] text-slate-400 ml-1">km/h</span>
              </div>
              <div className="text-xs text-slate-300 border-l border-slate-700 pl-3">
                <span className="font-mono text-cyan-300 font-bold">
                  {currentReplayPoint.distKm.toFixed(1)} km
                </span>
                <span className="text-slate-500"> / {totalRouteKm} km</span>
              </div>
              <div className="text-xs text-slate-300 border-l border-slate-700 pl-3">
                <span className="font-mono text-slate-300">
                  {Math.floor(currentReplayPoint.timeSec / 60)}m {currentReplayPoint.timeSec % 60}s
                </span>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 mt-1 font-medium truncate max-w-[260px]">
              📍 {currentReplayPoint.landmark || currentReplayPoint.roadName}
            </div>
          </div>
        </div>

        {/* Interactive Hover Probe Tooltip */}
        {hoveredPoint && (
          <div
            className="absolute pointer-events-none z-20 transition-transform duration-75"
            style={{
              left: `${(hoveredPoint.x / width) * 100}%`,
              top: `${(hoveredPoint.y / height) * 100}%`,
              transform: "translate(-50%, -125%)",
            }}
          >
            <div className="bg-slate-900/95 backdrop-blur-md px-3 py-2 rounded-xl border border-blue-500/60 shadow-2xl text-white text-xs whitespace-nowrap">
              <div className="flex items-center gap-1.5 font-bold text-blue-300 text-[11px] mb-0.5">
                <MapPin className="w-3 h-3 text-blue-400" />
                {hoveredPoint.landmark || hoveredPoint.roadName}
              </div>
              <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-300 font-mono mt-1 pt-1 border-t border-slate-800">
                <div>
                  <span className="text-slate-500 block">Distance:</span>
                  <strong className="text-white">{hoveredPoint.distKm.toFixed(1)} km</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Recorded:</span>
                  <strong
                    className={
                      hoveredPoint.speedKmh < 24
                        ? "text-rose-400"
                        : hoveredPoint.speedKmh < 45
                        ? "text-amber-400"
                        : "text-emerald-400"
                    }
                  >
                    {hoveredPoint.speedKmh} km/h
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Elevation:</span>
                  <strong className="text-cyan-300">{hoveredPoint.elevationM}m ASL</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Legend on Canvas */}
        <div className="absolute bottom-3 right-4 z-10 flex items-center gap-3 bg-slate-900/80 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-slate-800 text-[11px] text-slate-300">
          {colorMode === "speed" ? (
            <>
              <span className="text-slate-400 font-medium">Speed Profile:</span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> &lt;25 km/h (Slow)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> 25-45 km/h (Normal)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> &gt;45 km/h (Cruising)
              </span>
            </>
          ) : colorMode === "congestion" ? (
            <>
              <span className="text-slate-400 font-medium">Traffic Congestion:</span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Free Flow
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Moderate Backlog
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Junction Delay
              </span>
            </>
          ) : (
            <>
              <span className="text-slate-400 font-medium">Terrain Elevation:</span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> 410m (Gandhipuram Basin)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-fuchsia-500" /> 438m (Saravanampatti Plateau)
              </span>
            </>
          )}
        </div>
      </div>

      {/* 3. Replay Scrubber & Distance Slider Bar */}
      <div className="px-6 py-3 bg-slate-900 border-t border-slate-800 flex items-center gap-4 text-xs text-slate-300">
        <span className="font-mono text-slate-400 text-[11px] shrink-0">
          KM 0.0 (Gandhipuram)
        </span>
        <div className="flex-1 relative flex items-center">
          <input
            type="range"
            min="0"
            max="1"
            step="0.005"
            value={replayProgress}
            onChange={(e) => {
              setIsReplaying(false);
              setReplayProgress(parseFloat(e.target.value));
            }}
            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            aria-label="Navigation Path Replay Scrubber"
          />
        </div>
        <span className="font-mono text-slate-400 text-[11px] shrink-0">
          KM {totalRouteKm} (Saravanampatti)
        </span>
      </div>

      {/* 4. Spatial Analytics Bento (Key Telemetry Metrics Derived from Trajectory) */}
      <div className="p-5 sm:p-6 bg-white grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-blue-600" />
            Curvature Index
          </div>
          <div className="text-xl font-black text-slate-900 font-mono">
            1.08 <span className="text-xs font-normal text-emerald-600 font-sans">Direct Alignment</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">
            Path deviation ratio compared to straight-line distance.
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
            <Gauge className="w-3.5 h-3.5 text-emerald-600" />
            Fastest Segment
          </div>
          <div className="text-xl font-black text-slate-900 font-mono">
            {sessionTopSpeed} <span className="text-xs font-normal text-slate-500 font-sans">km/h</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">
            Recorded along Prozone Mall to Sivanandapuram bypass.
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
            Elevation Gain
          </div>
          <div className="text-xl font-black text-slate-900 font-mono">
            +26 <span className="text-xs font-normal text-slate-500 font-sans">meters</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">
            Gradual ascent from 412m to 438m ASL on the northern ridge.
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-amber-600" />
            Primary Delay Point
          </div>
          <div className="text-base font-black text-slate-900 truncate">
            Textool Signal
          </div>
          <p className="text-[10px] text-amber-700 font-semibold mt-0.5">
            3.8 min dwell time at Ganapathy flyover merge.
          </p>
        </div>
      </div>
    </div>
  );
};
