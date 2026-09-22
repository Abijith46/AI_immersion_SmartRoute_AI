import React, { useState, useRef, useEffect } from "react";
import {
  RouteOption,
  TrafficAlert,
  SpeedCamera,
  PolicePatrolAlert,
  TollGate,
  NearbyService,
  CongestionLevel
} from "../types";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Navigation,
  Layers,
  AlertTriangle,
  Camera,
  Shield,
  CreditCard,
  Fuel,
  Utensils,
  Wrench,
  Building2,
  Heart,
  Zap,
  Car,
  Volume2,
  VolumeX,
  X,
  CheckCircle2,
  Compass,
  ArrowUpRight,
  Info,
  Mic,
  Bike,
  Maximize2,
  Minimize2,
  Search,
  ShoppingBag,
  GraduationCap,
  Trees,
  Landmark,
  Bus,
  MapPin,
  Bookmark,
  Check,
  Globe,
  ExternalLink,
  LocateFixed,
  Star,
  Layers as LayersIcon
} from "lucide-react";
import { DataBadge } from "./DataBadge";
import { AddAlertDetailsModal } from "./AddAlertDetailsModal";
import { UserProfile, LiveVehicleTelemetry, BikeDetails } from "../types";
import { smartConnectService, userService } from "../services";
import { coimbatoreKeyPlaces, CoimbatoreKeyPlace } from "../data/mockData";

interface InteractiveMapProps {
  routes: RouteOption[];
  selectedRouteId: string;
  onSelectRoute: (id: string) => void;
  alerts: TrafficAlert[];
  speedCameras: SpeedCamera[];
  policeAlerts: PolicePatrolAlert[];
  tollGates: TollGate[];
  nearbyServices: NearbyService[];
  showDataBadges: boolean;
  className?: string;
  isNavigating?: boolean;
  onToggleNavigation?: () => void;
  userProfile?: UserProfile;
  onAddAlertDetail?: (alertId: string, detail: { note: string; author: string; timestamp: string }) => void;
  onOpenVoiceCommand?: () => void;
  onSelectDestination?: (placeName: string) => void;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  routes,
  selectedRouteId,
  onSelectRoute,
  alerts,
  speedCameras,
  policeAlerts,
  tollGates,
  nearbyServices,
  showDataBadges,
  className = "",
  isNavigating = false,
  onToggleNavigation,
  userProfile = {
    id: "usr_7894",
    name: "Abijith",
    email: "abijithprakash044@gmail.com",
    memberSince: "May 2025",
    commuteSummary: {
      routineRoute: "Home (Gandhipuram) → College / Office (Saravanampatti)",
      usualDeparture: "7:30 AM (Mon–Fri)",
      usualTravelTimeMin: 35,
      currentEstimatedTimeMin: 48,
      alternativeAvailable: true,
      alternativeTimeMin: 39,
    },
  },
  onAddAlertDetail,
  onOpenVoiceCommand,
  onSelectDestination,
}) => {
  // Map pan and zoom state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: -40, y: -20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Fullscreen & map view mode state
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mapMode, setMapMode] = useState<"radar" | "osm">("radar");

  // Place search and highlighting
  const [placeSearchQuery, setPlaceSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [highlightedPlaceId, setHighlightedPlaceId] = useState<string | null>(null);
  const [placeSavedToast, setPlaceSavedToast] = useState<string | null>(null);

  // Layer filter states
  const [showTraffic, setShowTraffic] = useState(true);
  const [showAlerts, setShowAlerts] = useState(true);
  const [showCameras, setShowCameras] = useState(true);
  const [showPolice, setShowPolice] = useState(true);
  const [showTolls, setShowTolls] = useState(true);
  const [showServices, setShowServices] = useState(true);
  const [selectedServiceCategory, setSelectedServiceCategory] = useState<string>("all");

  // Selected item modal / drawer
  const [selectedItem, setSelectedItem] = useState<{
    type: "alert" | "camera" | "police" | "toll" | "service" | "speed_limit";
    data: any;
  } | null>(null);

  const [showAddDetailModal, setShowAddDetailModal] = useState(false);

  // Jump to specific place helper
  const handleJumpToPlace = (place: { id: string; name: string; coordinates?: { x?: number; y?: number }; x?: number; y?: number }) => {
    const targetX = place.coordinates?.x ?? place.x ?? 300;
    const targetY = place.coordinates?.y ?? place.y ?? 300;
    // Smoothly pan & center
    setPan({ x: 400 - targetX, y: 300 - targetY });
    setZoom(1.45);
    setHighlightedPlaceId(place.id);
    setIsSearchOpen(false);
    setPlaceSearchQuery("");

    // If matching service exists in nearbyServices, select it
    const matchedService = nearbyServices.find(
      (s) => s.id === place.id || s.name.toLowerCase().includes(place.name.toLowerCase())
    );
    if (matchedService) {
      setSelectedItem({ type: "service", data: matchedService });
    }
    setTimeout(() => setHighlightedPlaceId(null), 3500);
  };

  // Save place to favorites
  const handleSaveToFavorites = (service: NearbyService) => {
    userService.addSavedPlace({
      label: "Favorite",
      customName: service.name,
      address: service.address,
      coordinates: service.coordinates,
    });
    setPlaceSavedToast(`Saved "${service.name}" to My Places!`);
    setTimeout(() => setPlaceSavedToast(null), 3000);
  };

  // Simulated vehicle animation along selected route
  const [navProgress, setNavProgress] = useState(0.2); // 0 to 1
  const [voiceMuted, setVoiceMuted] = useState(false);

  // Live Vehicle Smart Connect Telemetry
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

  useEffect(() => {
    let interval: any = null;
    if (isNavigating) {
      interval = setInterval(() => {
        setNavProgress((prev) => (prev >= 0.98 ? 0.05 : prev + 0.015));
      }, 600);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isNavigating]);

  // Selected route object
  const activeRoute = routes.find((r) => r.id === selectedRouteId) || routes[0];

  // Mouse drag handlers for smooth panning
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.25, 2.5));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.7));
  const handleResetView = () => {
    setZoom(1);
    setPan({ x: -40, y: -20 });
  };

  // Helper for traffic segment colors
  const getTrafficStroke = (congestion: CongestionLevel) => {
    switch (congestion) {
      case "low":
        return "#22c55e"; // Green
      case "moderate":
        return "#eab308"; // Yellow
      case "heavy":
        return "#f97316"; // Orange
      case "severe":
        return "#ef4444"; // Red
      default:
        return "#3b82f6";
    }
  };

  // Calculate vehicle coordinates along route
  const calculateVehiclePos = () => {
    if (!activeRoute || !activeRoute.segments || activeRoute.segments.length === 0) {
      return { x: 300, y: 300 };
    }
    const allCoords: [number, number][] = [];
    activeRoute.segments.forEach((s) => allCoords.push(...s.coordinates));
    if (allCoords.length < 2) return { x: 300, y: 300 };

    const totalPoints = allCoords.length;
    const index = Math.min(Math.floor(navProgress * (totalPoints - 1)), totalPoints - 2);
    const p1 = allCoords[index];
    const p2 = allCoords[index + 1];
    const localT = (navProgress * (totalPoints - 1)) % 1;

    return {
      x: p1[0] + (p2[0] - p1[0]) * localT,
      y: p1[1] + (p2[1] - p1[1]) * localT,
    };
  };

  const vehiclePos = calculateVehiclePos();

  return (
    <div
      id="live-interactive-map-container"
      className={
        isFullscreen
          ? "fixed inset-0 z-50 w-screen h-screen bg-slate-950 select-none flex flex-col overflow-hidden"
          : `relative w-full h-[540px] md:h-[660px] rounded-2xl overflow-hidden bg-slate-900 select-none shadow-xl border border-slate-800 ${className}`
      }
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* MAP CANVAS: REAL-WORLD OPENSTREETMAP OR VECTOR RADAR */}
      {mapMode === "osm" ? (
        <div className="relative w-full h-full bg-slate-950">
          <iframe
            title="OpenStreetMap Coimbatore Metro Area"
            className="w-full h-full border-0 filter contrast-125"
            src="https://www.openstreetmap.org/export/embed.html?bbox=76.8400%2C10.9200%2C77.0900%2C11.1300&layer=mapnik"
          />
          <div className="absolute bottom-20 left-4 z-10 bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-700 text-xs text-slate-200 flex items-center gap-2 shadow-2xl pointer-events-auto">
            <Globe className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <div className="font-bold text-white">OpenStreetMap Live Full Network</div>
              <div className="text-[10px] text-slate-400">Coimbatore Metro • Pan & zoom real-world road grid</div>
            </div>
          </div>
        </div>
      ) : (
        <div
          className="w-full h-full cursor-grab active:cursor-grabbing transition-transform duration-75"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "center center",
          }}
        >
          <svg
            viewBox="0 0 800 600"
            className="w-[900px] h-[680px] pointer-events-auto"
            xmlns="http://www.w3.org/2000/svg"
          >
          {/* MAP BACKGROUND & GEOGRAPHIC WATER/PARKS */}
          <rect width="800" height="600" fill="#0f172a" />

          {/* City Parks / Green zones */}
          <path
            d="M 180,410 C 210,410 240,430 250,470 C 230,490 190,480 170,450 Z"
            fill="#064e3b"
            opacity="0.35"
          />
          <text x="210" y="445" fill="#34d399" fontSize="9" opacity="0.6" fontWeight="bold">
            Race Course Green Park
          </text>

          <path
            d="M 460,340 C 490,320 540,330 550,370 C 530,390 480,400 460,370 Z"
            fill="#064e3b"
            opacity="0.3"
          />
          <text x="480" y="360" fill="#34d399" fontSize="9" opacity="0.6" fontWeight="bold">
            Peelamedu Reserve
          </text>

          {/* Waterbody / Lake */}
          <path
            d="M 120,490 C 150,470 170,520 190,540 C 160,560 130,550 110,520 Z"
            fill="#0369a1"
            opacity="0.35"
          />
          <text x="130" y="525" fill="#38bdf8" fontSize="9" opacity="0.6" fontWeight="bold">
            Singanallur Lake
          </text>

          {/* MINOR ROAD GRID */}
          <g stroke="#334155" strokeWidth="1.5" opacity="0.4">
            <line x1="100" y1="180" x2="700" y2="180" />
            <line x1="80" y1="280" x2="720" y2="280" />
            <line x1="120" y1="380" x2="680" y2="380" />
            <line x1="140" y1="480" x2="650" y2="480" />
            <line x1="200" y1="100" x2="200" y2="520" />
            <line x1="320" y1="80" x2="320" y2="540" />
            <line x1="440" y1="90" x2="440" y2="530" />
            <line x1="580" y1="80" x2="580" y2="500" />
          </g>

          {/* MAJOR ARTERIAL HIGHWAYS (Grey Base) */}
          <path
            d="M 140,540 L 200,380 L 310,290 L 450,200 L 580,140 L 680,90"
            stroke="#1e293b"
            strokeWidth="14"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M 200,380 L 300,370 L 420,320 L 500,260 L 540,200 L 580,140"
            stroke="#1e293b"
            strokeWidth="12"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M 200,380 L 270,340 L 350,310 L 440,240 L 510,180 L 580,140"
            stroke="#1e293b"
            strokeWidth="10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M 420,320 L 550,320 L 670,280 L 740,260"
            stroke="#1e293b"
            strokeWidth="12"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* ROUTE ALTERNATIVES (When NOT selected, drawn with dimmed dashed lines) */}
          {routes.map((route) => {
            const isSelected = route.id === selectedRouteId;
            if (isSelected) return null; // Drawn on top layer

            // Flatten coordinates
            const points = route.segments.flatMap((s) => s.coordinates);
            const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0]},${p[1]}`).join(" ");

            return (
              <g key={`inactive_${route.id}`} className="cursor-pointer" onClick={() => onSelectRoute(route.id)}>
                <path
                  d={pathD}
                  stroke="#475569"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="4 4"
                  opacity="0.6"
                  className="hover:stroke-blue-400 transition-colors"
                />
              </g>
            );
          })}

          {/* ACTIVE SELECTED ROUTE WITH TRAFFIC FLOW SEGMENTS */}
          {activeRoute && (
            <g id="active-route-layer">
              {/* Outer glow aura for selected route */}
              {activeRoute.segments.map((seg) => {
                const pathD = seg.coordinates.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0]},${p[1]}`).join(" ");
                return (
                  <path
                    key={`glow_${seg.id}`}
                    d={pathD}
                    stroke={showTraffic ? getTrafficStroke(seg.congestion) : "#3b82f6"}
                    strokeWidth="16"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.25"
                  />
                );
              })}

              {/* Core traffic colored road segments */}
              {activeRoute.segments.map((seg) => {
                const pathD = seg.coordinates.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0]},${p[1]}`).join(" ");
                const color = showTraffic ? getTrafficStroke(seg.congestion) : "#38bdf8";

                return (
                  <g
                    key={`seg_${seg.id}`}
                    className="cursor-pointer group"
                    onClick={() =>
                      setSelectedItem({
                        type: "speed_limit",
                        data: {
                          name: seg.name,
                          congestion: seg.congestion,
                          speedLimitKmh: seg.speedLimitKmh,
                          speedLimitUnavailable: seg.speedLimitUnavailable,
                          roadCondition: seg.roadCondition,
                          distanceKm: seg.distanceKm,
                          durationMin: seg.durationMin,
                        },
                      })
                    }
                  >
                    <path
                      d={pathD}
                      stroke={color}
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {/* Animated direction dash */}
                    <path
                      d={pathD}
                      stroke="#ffffff"
                      strokeWidth="2"
                      strokeDasharray="6 12"
                      strokeLinecap="round"
                      opacity="0.6"
                      className="animate-pulse"
                    />
                  </g>
                );
              })}
            </g>
          )}

          {/* ROAD LABELS */}
          <text x="235" y="320" fill="#94a3b8" fontSize="10" fontWeight="600" letterSpacing="0.5">
            NH-209 Sathy Road
          </text>
          <text x="350" y="355" fill="#94a3b8" fontSize="10" fontWeight="600" letterSpacing="0.5">
            Avinashi Road
          </text>
          <text x="480" y="240" fill="#94a3b8" fontSize="9" fontWeight="500">
            Vilankurichi Link
          </text>
          <text x="590" y="295" fill="#94a3b8" fontSize="9" fontWeight="500">
            NH-544 Salem-Kochi Hwy
          </text>

          {/* TOLL GATES (Section 12) */}
          {showTolls &&
            tollGates.map((toll) => (
              <g
                key={toll.id}
                transform={`translate(${toll.coordinates.x}, ${toll.coordinates.y})`}
                className="cursor-pointer hover:scale-125 transition-transform"
                onClick={() => setSelectedItem({ type: "toll", data: toll })}
              >
                <circle cx="0" cy="0" r="13" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />
                <text x="0" y="4" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
                  ₹
                </text>
                <text x="0" y="24" fill="#fbbf24" fontSize="8" fontWeight="bold" textAnchor="middle">
                  {toll.name.split(" ")[0]}
                </text>
              </g>
            ))}

          {/* SPEED CAMERAS (Section 10) */}
          {showCameras &&
            speedCameras.map((cam) => (
              <g
                key={cam.id}
                transform={`translate(${cam.coordinates.x}, ${cam.coordinates.y})`}
                className="cursor-pointer hover:scale-125 transition-transform"
                onClick={() => setSelectedItem({ type: "camera", data: cam })}
              >
                <circle cx="0" cy="0" r="11" fill="#6366f1" stroke="#ffffff" strokeWidth="1.5" />
                <circle cx="0" cy="0" r="4" fill="#ffffff" />
                {/* Speed Limit Indicator */}
                <rect x="8" y="-12" width="22" height="13" rx="3" fill="#dc2626" stroke="#ffffff" strokeWidth="1" />
                <text x="19" y="-3" fill="#ffffff" fontSize="8" fontWeight="black" textAnchor="middle">
                  {cam.speedLimitKmh}
                </text>
              </g>
            ))}

          {/* POLICE / TRAFFIC PATROL ALERTS (Section 11) */}
          {showPolice &&
            policeAlerts.map((police) => (
              <g
                key={police.id}
                transform={`translate(${police.coordinates.x}, ${police.coordinates.y})`}
                className="cursor-pointer hover:scale-125 transition-transform"
                onClick={() => setSelectedItem({ type: "police", data: police })}
              >
                <circle
                  cx="0"
                  cy="0"
                  r="12"
                  fill={police.isLivePatrolAvailable ? "#0284c7" : "#475569"}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />
                <path d="M -4 -3 L 0 -7 L 4 -3 L 4 3 L 0 7 L -4 3 Z" fill="#ffffff" />
              </g>
            ))}

          {/* TRAFFIC ALERTS & ROAD CONDITIONS (Section 4 & 8) */}
          {showAlerts &&
            alerts.map((alert) => {
              const bgColors = {
                accident: "#ef4444",
                road_closure: "#dc2626",
                construction: "#f97316",
                waterlogging: "#06b6d4",
                pothole: "#d97706",
                congestion: "#eab308",
                other: "#64748b",
              };
              const color = bgColors[alert.type] || "#f97316";

              return (
                <g
                  key={alert.id}
                  transform={`translate(${alert.coordinates.x}, ${alert.coordinates.y})`}
                  className="cursor-pointer hover:scale-125 transition-transform"
                  onClick={() => setSelectedItem({ type: "alert", data: alert })}
                >
                  <circle cx="0" cy="0" r="14" fill={color} stroke="#ffffff" strokeWidth="2" />
                  <path d="M 0 -6 L 6 5 L -6 5 Z" fill="#ffffff" />
                  <circle cx="0" cy="2" r="1" fill={color} />
                </g>
              );
            })}

          {/* NEARBY SERVICES (Section 13) */}
          {showServices &&
            nearbyServices
              .filter((s) => selectedServiceCategory === "all" || s.category === selectedServiceCategory)
              .map((service) => {
                const getServiceColor = (cat: string) => {
                  switch (cat) {
                    case "transit":
                      return "#2563eb"; // Blue
                    case "shopping":
                      return "#ec4899"; // Pink
                    case "it_park":
                      return "#6366f1"; // Indigo
                    case "college":
                      return "#8b5cf6"; // Purple
                    case "hospital":
                      return "#e11d48"; // Crimson / Rose
                    case "restaurant":
                      return "#f59e0b"; // Amber
                    case "ev_charging":
                      return "#059669"; // Emerald
                    case "fuel":
                      return "#10b981"; // Green
                    case "leisure":
                      return "#14b8a6"; // Teal
                    case "temple":
                      return "#f97316"; // Orange
                    case "mechanic":
                      return "#0284c7"; // Sky
                    case "police":
                      return "#06b6d4"; // Cyan
                    case "parking":
                      return "#a855f7"; // Violet
                    default:
                      return "#64748b";
                  }
                };

                const isHighlighted = highlightedPlaceId === service.id;

                return (
                  <g
                    key={service.id}
                    transform={`translate(${service.coordinates.x}, ${service.coordinates.y})`}
                    className="cursor-pointer group"
                    onClick={() => setSelectedItem({ type: "service", data: service })}
                  >
                    {isHighlighted && (
                      <circle cx="0" cy="0" r="26" fill="#38bdf8" opacity="0.6" className="animate-ping" />
                    )}
                    <circle
                      cx="0"
                      cy="0"
                      r={isHighlighted ? 15 : 12}
                      fill={getServiceColor(service.category)}
                      stroke="#ffffff"
                      strokeWidth="2"
                      className="transition-transform group-hover:scale-125"
                    />
                    <circle cx="0" cy="0" r="4" fill="#ffffff" />
                    
                    {/* Place Name Hover / Selected Label */}
                    <g className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <rect
                        x="-50"
                        y="-26"
                        width="100"
                        height="18"
                        rx="4"
                        fill="#0f172a"
                        stroke="#475569"
                        strokeWidth="1"
                      />
                      <text
                        x="0"
                        y="-14"
                        fill="#ffffff"
                        fontSize="8.5"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        {service.name.length > 18 ? service.name.substring(0, 16) + "…" : service.name}
                      </text>
                    </g>
                  </g>
                );
              })}

          {/* START LOCATION PIN (Gandhipuram) */}
          <g transform="translate(200, 380)" className="cursor-pointer">
            <circle cx="0" cy="0" r="22" fill="#3b82f6" opacity="0.3" className="animate-ping" />
            <circle cx="0" cy="0" r="12" fill="#2563eb" stroke="#ffffff" strokeWidth="2.5" />
            <circle cx="0" cy="0" r="4" fill="#ffffff" />
            <rect x="-35" y="-32" width="70" height="18" rx="4" fill="#1e293b" stroke="#3b82f6" strokeWidth="1" />
            <text x="0" y="-20" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
              Gandhipuram
            </text>
          </g>

          {/* DESTINATION PIN (Saravanampatti) */}
          <g transform="translate(580, 140)" className="cursor-pointer">
            <circle cx="0" cy="0" r="24" fill="#ef4444" opacity="0.3" className="animate-ping" />
            <path
              d="M 0 -18 C -7 -18 -12 -12 -12 -5 C -12 4 0 14 0 14 C 0 14 12 4 12 -5 C 12 -12 7 -18 0 -18 Z"
              fill="#dc2626"
              stroke="#ffffff"
              strokeWidth="2"
            />
            <circle cx="0" cy="-5" r="4" fill="#ffffff" />
            <rect x="-42" y="-42" width="84" height="18" rx="4" fill="#1e293b" stroke="#ef4444" strokeWidth="1" />
            <text x="0" y="-30" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
              Saravanampatti
            </text>
          </g>

          {/* VEHICLE SIMULATION MARKER */}
          {isNavigating && (
            <g transform={`translate(${vehiclePos.x}, ${vehiclePos.y})`}>
              <circle cx="0" cy="0" r="18" fill="#38bdf8" opacity="0.4" className="animate-ping" />
              <circle cx="0" cy="0" r="10" fill="#0284c7" stroke="#ffffff" strokeWidth="2" />
              <path d="M 0 -6 L 4 5 L 0 3 L -4 5 Z" fill="#ffffff" />
            </g>
          )}
        </svg>
      </div>
      )}

      {/* TOP LEFT: ACTIVE JOURNEY HUD / NAVIGATION INFO */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 max-w-xs pointer-events-auto">
        <div className="bg-slate-900/90 backdrop-blur-md p-3 rounded-xl border border-slate-700/80 shadow-2xl text-white">
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
              <Navigation className="w-3.5 h-3.5 text-blue-400" />
              <span>{activeRoute.title}</span>
            </div>
            <span
              className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                activeRoute.congestionLevel === "low"
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : activeRoute.congestionLevel === "moderate"
                  ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                  : "bg-red-500/20 text-red-400 border border-red-500/30"
              }`}
            >
              {activeRoute.congestionLevel} traffic
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black tracking-tight text-white">{activeRoute.durationMin} min</span>
            <span className="text-xs text-slate-400">({activeRoute.distanceKm} km)</span>
          </div>

          <div className="text-[11px] text-slate-300 mt-1 flex items-center justify-between pt-2 border-t border-slate-800">
            <span>Toll: {activeRoute.tollCostInr > 0 ? `₹${activeRoute.tollCostInr}` : "₹0 (Free)"}</span>
            <span className="text-amber-400">{activeRoute.weatherImpactReason.split(";")[0]}</span>
          </div>

          {onToggleNavigation && (
            <button
              onClick={onToggleNavigation}
              className={`w-full mt-2.5 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                isNavigating
                  ? "bg-rose-600 hover:bg-rose-700 text-white shadow-lg"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25"
              }`}
            >
              <Car className="w-4 h-4" />
              {isNavigating ? "Exit Simulation" : "Start Live Navigation"}
            </button>
          )}
        </div>

        {/* Turn instruction banner during navigation */}
        {isNavigating && (
          <div className="bg-emerald-950/95 border border-emerald-500/50 p-3 rounded-xl text-white shadow-2xl flex items-center gap-3 animate-in fade-in">
            <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center shrink-0">
              <ArrowUpRight className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-xs font-semibold text-emerald-300">In 400 meters</div>
              <div className="text-sm font-bold text-white leading-tight">Keep right onto Sathy Road Express</div>
              <div className="text-[10px] text-emerald-200/80 mt-0.5">Speed: {telemetry.currentSpeedKmh} km/h • Limit: 50 km/h</div>
            </div>
          </div>
        )}

        {/* SMART CONNECT: LIVE VEHICLE TELEMETRY HUD PILL */}
        <div className="bg-slate-900/95 backdrop-blur-md p-2.5 rounded-xl border border-cyan-500/40 shadow-xl text-white flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
              <Bike className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-semibold leading-tight">
                {activeBike.make} {activeBike.model}
              </div>
              <div className="flex items-baseline gap-1.5 font-mono">
                <span className="text-sm font-black text-cyan-300">{telemetry.currentSpeedKmh}</span>
                <span className="text-[9px] text-slate-400 uppercase">km/h</span>
                <span className="text-slate-600">•</span>
                <span className="text-emerald-400 font-bold text-[11px]">{telemetry.instantFuelEfficiencyKmpl} km/L</span>
              </div>
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[10px] text-slate-300 block font-bold">Gear {telemetry.currentGear}</span>
            <span className="text-[10px] text-cyan-400 font-bold">{telemetry.fuelRemainingLitres.toFixed(1)}L Fuel</span>
          </div>
        </div>
      </div>

      {/* TOP CENTER: FLOATING PLACE SEARCH & QUICK LANDMARKS */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 w-[92%] max-w-lg pointer-events-auto">
        <div className="relative">
          <div className="bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-700/80 p-1.5 shadow-2xl flex items-center gap-2">
            <div className="flex items-center gap-1.5 pl-2 text-slate-400">
              <Search className="w-3.5 h-3.5" />
            </div>
            <input
              type="text"
              value={placeSearchQuery}
              onChange={(e) => {
                setPlaceSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              placeholder="Search Coimbatore: Airport, TIDEL, Malls, Tech..."
              className="w-full bg-transparent text-xs text-white placeholder:text-slate-400 outline-none"
            />
            {placeSearchQuery && (
              <button
                onClick={() => {
                  setPlaceSearchQuery("");
                  setIsSearchOpen(false);
                }}
                className="p-1 text-slate-400 hover:text-white rounded"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Mode Switcher */}
            <div className="flex items-center border-l border-slate-700/80 pl-2 pr-1 gap-1 shrink-0">
              <button
                onClick={() => setMapMode(mapMode === "radar" ? "osm" : "radar")}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all ${
                  mapMode === "osm"
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
                title="Switch between Live Street Map and Tactical Radar"
              >
                <Globe className="w-3 h-3 text-cyan-400" />
                <span>{mapMode === "osm" ? "Street Map" : "Radar View"}</span>
              </button>
            </div>
          </div>

          {/* Quick Place Search Results Dropdown */}
          {isSearchOpen && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-xl p-2 shadow-2xl max-h-64 overflow-y-auto space-y-1 text-xs text-white z-40">
              <div className="flex items-center justify-between px-2 py-1 text-[10px] uppercase font-bold text-slate-400">
                <span>{placeSearchQuery ? "Matching Coimbatore Locations" : "Quick Landmark Navigation"}</span>
                <button onClick={() => setIsSearchOpen(false)} className="text-slate-400 hover:text-white">
                  Close
                </button>
              </div>
              {(placeSearchQuery
                ? nearbyServices.filter(
                    (s) =>
                      s.name.toLowerCase().includes(placeSearchQuery.toLowerCase()) ||
                      s.address.toLowerCase().includes(placeSearchQuery.toLowerCase()) ||
                      s.category.toLowerCase().includes(placeSearchQuery.toLowerCase())
                  )
                : nearbyServices.slice(0, 9)
              ).map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleJumpToPlace(s)}
                  className="w-full p-2 rounded-lg hover:bg-slate-800 flex items-center justify-between text-left transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                    <div>
                      <div className="font-bold text-slate-100">{s.name}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[260px]">{s.address}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 uppercase tracking-wider shrink-0">
                    {s.category.replace("_", " ")}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Horizontal Quick Landmark Chips */}
          <div className="flex items-center gap-1.5 mt-1.5 overflow-x-auto pb-1 no-scrollbar text-[10px]">
            {coimbatoreKeyPlaces.slice(0, 8).map((kp) => (
              <button
                key={kp.id}
                onClick={() => handleJumpToPlace(kp)}
                className="px-2.5 py-1 rounded-lg bg-slate-900/90 hover:bg-blue-600 hover:text-white text-slate-300 border border-slate-700/60 font-semibold whitespace-nowrap transition-all shadow-sm shrink-0"
              >
                {kp.shortName}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* TOP RIGHT: MAP CONTROLS & FULLSCREEN */}
      <div className="absolute top-4 right-4 z-30 flex flex-col gap-2 pointer-events-auto">
        {/* Zoom & Recenter controls */}
        <div className="flex flex-col bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-700/80 p-1 shadow-xl">
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className={`p-2 rounded-lg transition-colors ${
              isFullscreen ? "bg-blue-600 text-white" : "text-slate-300 hover:text-white hover:bg-slate-800"
            }`}
            title={isFullscreen ? "Exit Fullscreen (Esc)" : "Full Map Screen"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={handleZoomIn}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetView}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="Reset Map View"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          {onOpenVoiceCommand && (
            <button
              onClick={onOpenVoiceCommand}
              className="p-2 text-cyan-400 hover:text-cyan-200 hover:bg-slate-800 rounded-lg transition-colors border-t border-slate-800"
              title="Speak Voice Command"
            >
              <Mic className="w-4 h-4 animate-pulse" />
            </button>
          )}
        </div>

        {/* Audio Mute for guidance */}
        {isNavigating && (
          <button
            onClick={() => setVoiceMuted(!voiceMuted)}
            className="bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-700/80 p-2.5 text-slate-300 hover:text-white shadow-xl flex items-center justify-center"
            title={voiceMuted ? "Unmute Voice Guidance" : "Mute Voice Guidance"}
          >
            {voiceMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        )}
      </div>

      {/* TOAST NOTIFICATION */}
      {placeSavedToast && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 bg-emerald-950/95 text-emerald-200 border border-emerald-500/50 px-4 py-2 rounded-xl text-xs font-bold shadow-2xl flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{placeSavedToast}</span>
        </div>
      )}

      {/* BOTTOM LAYER TOGGLES BAR */}
      <div className="absolute bottom-4 left-4 right-4 z-10 pointer-events-auto flex flex-col gap-2">
        {/* Category Filter Pills when Nearby Places is active */}
        {showServices && (
          <div className="bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-700/70 p-1.5 shadow-xl flex items-center gap-1.5 overflow-x-auto text-[11px] text-white">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1 pr-1 shrink-0">
              Places Filter:
            </span>
            {[
              { id: "all", label: `All (${nearbyServices.length})` },
              { id: "transit", label: "Transit Hubs" },
              { id: "shopping", label: "Malls & Shopping" },
              { id: "it_park", label: "Tech Parks" },
              { id: "college", label: "Colleges" },
              { id: "hospital", label: "Hospitals" },
              { id: "restaurant", label: "Food & Cafes" },
              { id: "ev_charging", label: "EV Charging" },
              { id: "fuel", label: "Fuel" },
              { id: "temple", label: "Temples" },
              { id: "leisure", label: "Lakes & Leisure" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedServiceCategory(cat.id)}
                className={`px-2 py-0.5 rounded-lg font-medium whitespace-nowrap transition-colors shrink-0 ${
                  selectedServiceCategory === cat.id
                    ? "bg-blue-600 text-white font-bold"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        )}

        <div className="bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-700/80 p-2 shadow-2xl flex items-center justify-between gap-2 overflow-x-auto text-xs text-white">
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 mr-1">
              <Layers className="w-3.5 h-3.5" />
              Layers:
            </span>

            <button
              onClick={() => setShowTraffic(!showTraffic)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                showTraffic ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Traffic Flow
            </button>

            <button
              onClick={() => setShowAlerts(!showAlerts)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                showAlerts ? "bg-amber-600 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Alerts ({alerts.length})
            </button>

            <button
              onClick={() => setShowCameras(!showCameras)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                showCameras ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              Speed Cams
            </button>

            <button
              onClick={() => setShowPolice(!showPolice)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                showPolice ? "bg-sky-600 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              Police Layer
            </button>

            <button
              onClick={() => setShowTolls(!showTolls)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                showTolls ? "bg-yellow-600 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              Tolls
            </button>

            <button
              onClick={() => setShowServices(!showServices)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                showServices ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"
              }`}
            >
              <Fuel className="w-3.5 h-3.5" />
              Nearby Places ({nearbyServices.length})
            </button>
          </div>

          {/* Traffic Legend indicators */}
          <div className="hidden lg:flex items-center gap-2 pl-3 border-l border-slate-700/80 text-[10px] text-slate-300">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Low
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span> Moderate
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span> Heavy
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Severe
            </span>
          </div>
        </div>
      </div>

      {/* MARKER INSPECTION MODAL / DRAWER */}
      {selectedItem && (
        <div className="absolute inset-x-4 bottom-20 z-20 max-w-lg mx-auto bg-slate-900/95 backdrop-blur-xl border border-slate-700 p-4 rounded-2xl shadow-2xl text-white animate-in slide-in-from-bottom-5">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-blue-400">
                {selectedItem.type === "alert" && "Traffic & Road Hazard"}
                {selectedItem.type === "camera" && "Enforcement Speed Camera"}
                {selectedItem.type === "police" && "Traffic Security & Patrol"}
                {selectedItem.type === "toll" && "Highway Toll Plaza"}
                {selectedItem.type === "service" && `Nearby Service • ${selectedItem.data.category.toUpperCase()}`}
                {selectedItem.type === "speed_limit" && "Corridor Speed Limit"}
              </div>
              <h4 className="text-base font-bold text-white mt-0.5">
                {selectedItem.data.title || selectedItem.data.name || selectedItem.data.location}
              </h4>
            </div>
            <button
              onClick={() => setSelectedItem(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="text-xs text-slate-300 space-y-2">
            {/* Speed Limit Segment */}
            {selectedItem.type === "speed_limit" && (
              <div>
                <div className="flex items-center gap-3 my-2">
                  <div className="w-14 h-14 rounded-full border-4 border-red-600 bg-white flex flex-col items-center justify-center font-black text-slate-900 shadow-md">
                    {selectedItem.data.speedLimitUnavailable ? (
                      <span className="text-[9px] text-center leading-none text-slate-600 font-bold px-1">
                        Limit N/A
                      </span>
                    ) : (
                      <>
                        <span className="text-lg leading-none">{selectedItem.data.speedLimitKmh}</span>
                        <span className="text-[8px] uppercase tracking-tighter">km/h</span>
                      </>
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">
                      {selectedItem.data.speedLimitUnavailable
                        ? "Speed limit information unavailable."
                        : `Current Road Speed Limit: ${selectedItem.data.speedLimitKmh} km/h`}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {selectedItem.data.speedLimitUnavailable
                        ? "Official gazetted speed limit for this link section has not been published by municipal authorities."
                        : "Mandatory speed restriction enforced by traffic cameras."}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Alert details */}
            {selectedItem.type === "alert" && (
              <>
                <p>{selectedItem.data.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/60">
                  <div>
                    <span className="text-slate-400 block">Reported:</span>
                    <span className="font-semibold text-white">{selectedItem.data.reportedTime}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Resolution:</span>
                    <span className="font-semibold text-amber-300">{selectedItem.data.expectedResolution}</span>
                  </div>
                </div>

                {/* Community updates / added details */}
                {selectedItem.data.additionalDetails && selectedItem.data.additionalDetails.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 block">
                      Community Updates ({selectedItem.data.additionalDetails.length})
                    </span>
                    <div className="space-y-1.5 max-h-32 overflow-y-auto">
                      {selectedItem.data.additionalDetails.map((dt: any, i: number) => (
                        <div key={i} className="p-2 rounded-lg bg-blue-950/60 border border-blue-800/60 text-xs">
                          <p className="text-slate-200 leading-relaxed">{dt.note}</p>
                          <span className="text-[10px] text-blue-400 font-semibold block mt-1">
                            Added by {dt.author} • {dt.timestamp}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add Details to this Alert Symbol Button */}
                <div className="pt-2">
                  <button
                    onClick={() => setShowAddDetailModal(true)}
                    className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/20 transition-all"
                  >
                    <span>➕ Add Details to this Alert Symbol</span>
                    <span className="text-[10px] opacity-80 font-normal">as {userProfile?.name || "Abijith"}</span>
                  </button>
                </div>
              </>
            )}

            {/* Speed Camera details (Section 10) */}
            {selectedItem.type === "camera" && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded font-mono font-bold">
                    {selectedItem.data.cameraType}
                  </span>
                  <span className="text-xs text-slate-400">Direction: {selectedItem.data.direction}</span>
                </div>
                <div className="text-[11px] text-slate-300 bg-slate-800/60 p-2.5 rounded-lg">
                  <div>Limit: <strong className="text-white">{selectedItem.data.speedLimitKmh} km/h</strong></div>
                  <div>Source: <strong className="text-white">{selectedItem.data.dataSource}</strong></div>
                  <div>Updated: <strong className="text-white">{selectedItem.data.lastUpdated}</strong></div>
                </div>
              </div>
            )}

            {/* Police details (Section 11) */}
            {selectedItem.type === "police" && (
              <div className="space-y-2">
                <p>{selectedItem.data.notes}</p>
                {!selectedItem.data.isLivePatrolAvailable && (
                  <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
                    Live patrol information is not available for this area.
                  </div>
                )}
                <div className="text-[11px] text-slate-400">
                  Authority: <strong className="text-white">{selectedItem.data.authority}</strong> • Updated:{" "}
                  <strong className="text-white">{selectedItem.data.lastUpdated}</strong>
                </div>
              </div>
            )}

            {/* Toll Gate details (Section 12) */}
            {selectedItem.type === "toll" && (
              <div className="space-y-2">
                <div className="flex items-baseline justify-between bg-slate-800/60 p-2.5 rounded-lg">
                  <div>
                    <span className="text-[11px] text-slate-400">Estimated Toll:</span>
                    <div className="text-xl font-black text-amber-400">₹{selectedItem.data.costInr}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400">Distance Ahead:</span>
                    <div className="text-sm font-bold text-white">{selectedItem.data.distanceAheadKm} km</div>
                  </div>
                </div>
                <p className="text-[11px] text-slate-300">{selectedItem.data.routeImpact}</p>
              </div>
            )}

            {/* Nearby Service details (Section 13) */}
            {selectedItem.type === "service" && (
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-slate-400 block text-[11px] leading-tight">{selectedItem.data.address}</span>
                    <span className="text-[11px] font-bold text-emerald-400 mt-0.5 block">{selectedItem.data.openHours}</span>
                  </div>
                  <div className="flex items-center gap-1 bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded font-bold text-xs shrink-0">
                    <Star className="w-3 h-3 fill-amber-300" />
                    <span>{selectedItem.data.rating}</span>
                  </div>
                </div>

                {selectedItem.data.details && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedItem.data.details.map((d: string, i: number) => (
                      <span key={i} className="text-[10px] bg-slate-800 border border-slate-700/80 px-2 py-0.5 rounded text-slate-300">
                        {d}
                      </span>
                    ))}
                  </div>
                )}

                {selectedItem.data.contactNumber && (
                  <div className="text-[11px] text-cyan-400 font-mono flex items-center justify-between pt-1">
                    <span>📞 {selectedItem.data.contactNumber}</span>
                    <a
                      href={`tel:${selectedItem.data.contactNumber}`}
                      className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-700/60 text-[10px] font-bold hover:bg-cyan-900"
                    >
                      Call Place
                    </a>
                  </div>
                )}

                {/* Quick Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => {
                      if (onSelectDestination) {
                        onSelectDestination(selectedItem.data.name);
                      }
                      setPlaceSavedToast(`Routed destination to ${selectedItem.data.name}`);
                      setTimeout(() => setPlaceSavedToast(null), 3000);
                    }}
                    className="py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/20 transition-all"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Route To Here</span>
                  </button>

                  <button
                    onClick={() => handleSaveToFavorites(selectedItem.data)}
                    className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                    <span>Save to Places</span>
                  </button>
                </div>
              </div>
            )}

            {/* Data Source & Confidence Badge */}
            {selectedItem.data.dataQuality && (
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <DataBadge metadata={selectedItem.data.dataQuality} showDetails={true} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Alert Details Modal */}
      {selectedItem && selectedItem.type === "alert" && (
        <AddAlertDetailsModal
          isOpen={showAddDetailModal}
          onClose={() => setShowAddDetailModal(false)}
          alertSymbolTitle={selectedItem.data.title || "Traffic Alert Symbol"}
          alertSymbolType={selectedItem.data.type || "Hazard"}
          alertSymbolLocation={selectedItem.data.location || "Corridor Segment"}
          userProfile={userProfile}
          onSubmitDetail={(note, author) => {
            const detailObj = { note, author, timestamp: "Just now" };
            if (onAddAlertDetail) {
              onAddAlertDetail(selectedItem.data.id, detailObj);
            }
            // Update current item in state
            const updatedDetails = [detailObj, ...(selectedItem.data.additionalDetails || [])];
            setSelectedItem({
              ...selectedItem,
              data: {
                ...selectedItem.data,
                additionalDetails: updatedDetails,
              },
            });
          }}
        />
      )}
    </div>
  );
};
