import React, { useState, useEffect } from "react";
import {
  RouteOption,
  TrafficAlert,
  SpeedCamera,
  PolicePatrolAlert,
  TollGate,
  NearbyService,
  WeatherData,
  TrafficPrediction,
  RoadIssueReport,
  UserProfile,
  UserPreferences,
  SavedPlace,
  TravelHistoryRecord
} from "./types";
import {
  trafficService,
  weatherService,
  routeService,
  placesService,
  roadConditionService,
  userService,
  geminiService,
  liveApiService,
  smartConnectService
} from "./services";
import { Navbar } from "./components/Navbar";
import { DemoModeBanner } from "./components/DemoModeBanner";
import { InteractiveMap } from "./components/InteractiveMap";
import { DashboardView } from "./components/DashboardView";
import { RoutePlannerView } from "./components/RoutePlannerView";
import { TrafficPredictionView } from "./components/TrafficPredictionView";
import { RoadConditionsView } from "./components/RoadConditionsView";
import { NearbyServicesView } from "./components/NearbyServicesView";
import { AIAssistantView } from "./components/AIAssistantView";
import { AnalyticsView } from "./components/AnalyticsView";
import { SavedPlacesAndHistoryView } from "./components/SavedPlacesAndHistoryView";
import { SettingsView } from "./components/SettingsView";
import { AdminMonitoringView } from "./components/AdminMonitoringView";
import { SmartConnectView } from "./components/SmartConnectView";
import { FloatingAIChat } from "./components/FloatingAIChat";
import { MobileBottomNav } from "./components/MobileBottomNav";
import { Logo } from "./components/Logo";
import { VoiceCommandModal } from "./components/VoiceCommandModal";
import { SOSModal } from "./components/SOSModal";
import { VoiceCommandResult, voiceService } from "./services/voiceService";
import { sampleTrafficPrediction } from "./data/mockData";
import { Compass, AlertTriangle, ShieldCheck, MapPin, Mic, CheckCircle2, Sparkles, X, Bike } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [showDataBadges, setShowDataBadges] = useState<boolean>(true);
  const [selectedRouteId, setSelectedRouteId] = useState<string>("route_1");
  const [isNavigating, setIsNavigating] = useState<boolean>(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState<boolean>(false);
  const [isSOSModalOpen, setIsSOSModalOpen] = useState<boolean>(false);
  const [voiceFeedbackToast, setVoiceFeedbackToast] = useState<{ title: string; desc: string } | null>(null);

  // Core Data States
  const [userProfile, setUserProfile] = useState<UserProfile>(() => userService.getProfile());
  const [preferences, setPreferences] = useState<UserPreferences>(() => userService.getPreferences());
  const [routes, setRoutes] = useState<RouteOption[]>(() =>
    routeService.getAvailableRoutes("Gandhipuram Central", "Saravanampatti Tech Zone", preferences)
  );
  const [alerts, setAlerts] = useState<TrafficAlert[]>(() => trafficService.getLiveAlerts());
  const [speedCameras, setSpeedCameras] = useState<SpeedCamera[]>(() => trafficService.getSpeedCameras());
  const [policeAlerts, setPoliceAlerts] = useState<PolicePatrolAlert[]>(() => trafficService.getPoliceAlerts());
  const [tollGates, setTollGates] = useState<TollGate[]>(() => trafficService.getTollGates());
  const [nearbyServices, setNearbyServices] = useState<NearbyService[]>(() => placesService.getNearbyServices());
  const [weather, setWeather] = useState<WeatherData>(() => weatherService.getRouteWeather());
  const [prediction, setPrediction] = useState<TrafficPrediction>(sampleTrafficPrediction);
  const [roadIssues, setRoadIssues] = useState<RoadIssueReport[]>(() => roadConditionService.getRoadIssues());
  const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>(() => userService.getSavedPlaces());
  const [travelHistory, setTravelHistory] = useState<TravelHistoryRecord[]>(() => userService.getTravelHistory());

  // Re-fetch routes if preferences change
  useEffect(() => {
    setRoutes(routeService.getAvailableRoutes("Gandhipuram Central", "Saravanampatti Tech Zone", preferences));
  }, [preferences]);

  // Live Meteorological Weather sync from Open-Meteo API
  useEffect(() => {
    liveApiService
      .fetchLiveWeather(11.0168, 76.9558)
      .then((liveW) => {
        setWeather(liveW);
      })
      .catch((err) => {
        console.warn("Using offline/cached weather:", err);
      });
  }, []);

  // Keyboard shortcut listener for hands-free voice trigger ('V' key)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === "v" || e.key === "V") &&
        !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)
      ) {
        e.preventDefault();
        setIsVoiceModalOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const activeRoute = routes.find((r) => r.id === selectedRouteId) || routes[0];

  const handlePreferencesUpdated = (newPrefs: UserPreferences) => {
    setPreferences(newPrefs);
  };

  const handleReportSubmitted = () => {
    setRoadIssues(roadConditionService.getRoadIssues());
  };

  const handleRefreshPlacesAndHistory = () => {
    setSavedPlaces(userService.getSavedPlaces());
    setTravelHistory(userService.getTravelHistory());
  };

  const handleRouteFromHistory = (origin: string, destination: string) => {
    setActiveTab("routes");
  };

  const handleNavigateToService = (service: NearbyService) => {
    setActiveTab("map");
  };

  const toggleNavigation = () => {
    setIsNavigating(!isNavigating);
  };

  const handleAddAlertDetail = (
    alertId: string,
    detail: { note: string; author: string; timestamp: string }
  ) => {
    const updated = trafficService.addAlertDetail(alertId, detail);
    setAlerts(updated);
  };

  const handleUpdateUserName = (newName: string) => {
    const updated = { ...userProfile, name: newName };
    setUserProfile(updated);
    userService.saveProfile(updated);
  };

  const handleProfileUpdated = (updated: UserProfile) => {
    setUserProfile(updated);
  };

  // Execution of natural language voice commands
  const handleExecuteVoiceCommand = (result: VoiceCommandResult) => {
    setVoiceFeedbackToast({
      title:
        result.commandType === "START_NAVIGATION"
          ? "Navigation Triggered by Voice"
          : result.commandType === "REPORT_ROAD_ISSUE"
          ? "Road Hazard Reported by Voice"
          : result.commandType === "STOP_NAVIGATION"
          ? "Navigation Stopped"
          : "Voice Command Processed",
      desc: result.feedbackText,
    });

    setTimeout(() => {
      setVoiceFeedbackToast(null);
    }, 6000);

    switch (result.commandType) {
      case "START_NAVIGATION": {
        if (result.params?.destination === "work") {
          const workRoute =
            routes.find((r) => r.id === "route_1" || r.type === "fastest") || routes[0];
          setSelectedRouteId(workRoute.id);
        } else if (result.params?.destination === "home") {
          const altRoute =
            routes.find((r) => r.type === "alternative") || routes[1] || routes[0];
          setSelectedRouteId(altRoute.id);
        }
        setIsNavigating(true);
        setActiveTab("map");
        break;
      }

      case "STOP_NAVIGATION": {
        setIsNavigating(false);
        break;
      }

      case "REPORT_ROAD_ISSUE": {
        const category = result.params?.category || "Pothole";
        const description =
          result.params?.description || "Road hazard reported by commuter via voice.";
        const location = activeRoute
          ? `${activeRoute.title} (Near KM 3.8)`
          : "Sathy Road Express Corridor";

        roadConditionService.submitIssueReport({
          category,
          location,
          description,
          reportedBy: `${userProfile?.name || "Abijith"} (Verified Commuter • Voice)`,
        });

        setRoadIssues(roadConditionService.getRoadIssues());
        break;
      }

      case "NAVIGATE_TAB": {
        if (result.params?.tab) {
          setActiveTab(result.params.tab);
        }
        break;
      }

      case "FIND_NEARBY": {
        setActiveTab("nearby");
        break;
      }

      case "CHECK_VEHICLE_SPEED": {
        const tel = smartConnectService.getTelemetry();
        const speedMsg = `Current speed is ${tel.currentSpeedKmh} km/h in gear ${tel.currentGear} at ${tel.currentRpm} RPM.`;
        voiceService.speakFeedback(speedMsg);
        setVoiceFeedbackToast({
          title: "Speedometer Telemetry",
          desc: speedMsg,
        });
        break;
      }

      case "CHECK_FUEL_EFFICIENCY": {
        const tel = smartConnectService.getTelemetry();
        const effMsg = `Instant fuel efficiency is ${tel.instantFuelEfficiencyKmpl} km/L. Trip average is ${tel.tripAvgFuelEfficiencyKmpl} km/L with an eco score of ${tel.ecoScore}/100.`;
        voiceService.speakFeedback(effMsg);
        setVoiceFeedbackToast({
          title: "Fuel Efficiency & Economy",
          desc: effMsg,
        });
        break;
      }

      case "CHECK_FUEL_LEVEL": {
        const tel = smartConnectService.getTelemetry();
        const bike = smartConnectService.getActiveBike();
        const fuelMsg = `Fuel level is ${tel.fuelLevelPercent}% (${tel.fuelRemainingLitres.toFixed(1)}L / ${bike.fuelTankCapacityLitres}L). Estimated range to empty is ${tel.distanceToEmptyKm} km.`;
        voiceService.speakFeedback(fuelMsg);
        setVoiceFeedbackToast({
          title: "Fuel Tank & Range to Empty",
          desc: fuelMsg,
        });
        break;
      }

      case "CHECK_BIKE_STATUS": {
        const bike = smartConnectService.getActiveBike();
        const statusMsg = `${bike.make} ${bike.model} (${bike.regNumber}): TPMS Front ${bike.tyrePressure.frontPsi} PSI, Rear ${bike.tyrePressure.rearPsi} PSI. Battery ${bike.batteryVoltage}V (${bike.batteryHealthPercent}%).`;
        voiceService.speakFeedback(statusMsg);
        setVoiceFeedbackToast({
          title: "Bike Details & Diagnostics",
          desc: statusMsg,
        });
        break;
      }

      case "CONNECT_VEHICLE": {
        setActiveTab("smart_connect");
        setVoiceFeedbackToast({
          title: "Smart Connect Vehicle Hub",
          desc: "Opened vehicle cockpit, live telemetry gauges, and Bluetooth sync.",
        });
        break;
      }

      case "TRIGGER_SOS": {
        setIsSOSModalOpen(true);
        voiceService.speakFeedback("Emergency SOS distress mode activated. Opening emergency broadcast.");
        setVoiceFeedbackToast({
          title: "🚨 EMERGENCY SOS ACTIVATED",
          desc: "Emergency 112/108 services and family contacts alerted.",
        });
        break;
      }

      default:
        break;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans flex flex-col selection:bg-blue-600 selection:text-white">
      {/* 1. DEMO MODE TRANSPARENCY BANNER */}
      <DemoModeBanner
        showDataBadges={showDataBadges}
        onToggleDataBadges={() => setShowDataBadges(!showDataBadges)}
      />

      {/* 2. TOP NAVBAR */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        showDataBadges={showDataBadges}
        onToggleDataBadges={() => setShowDataBadges(!showDataBadges)}
        userProfile={userProfile}
        onUpdateUserName={handleUpdateUserName}
        onOpenVoiceCommand={() => setIsVoiceModalOpen(true)}
        onOpenSOS={() => setIsSOSModalOpen(true)}
      />

      {/* VOICE COMMAND EXECUTION TOAST BANNER */}
      {voiceFeedbackToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 max-w-md w-full px-4 animate-in slide-in-from-top duration-300 pointer-events-auto">
          <div className="bg-slate-900/95 border border-cyan-500/50 shadow-2xl rounded-2xl p-3.5 backdrop-blur-md flex items-start justify-between gap-3 text-white">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center shrink-0 mt-0.5">
                <Mic className="w-5 h-5 text-cyan-400 animate-pulse" />
              </div>
              <div>
                <div className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  {voiceFeedbackToast.title}
                </div>
                <div className="text-xs text-slate-200 mt-0.5 leading-relaxed font-medium">
                  {voiceFeedbackToast.desc}
                </div>
              </div>
            </div>
            <button
              onClick={() => setVoiceFeedbackToast(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 3. MAIN CONTENT CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 pb-24 xl:pb-12">
        {/* DASHBOARD VIEW */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            <DashboardView
              user={userProfile}
              activeRoute={activeRoute}
              routes={routes}
              onSelectRoute={setSelectedRouteId}
              weather={weather}
              prediction={prediction}
              alerts={alerts}
              onNavigateToTab={setActiveTab}
              showDataBadges={showDataBadges}
              onAddAlertDetail={handleAddAlertDetail}
              onOpenSOS={() => setIsSOSModalOpen(true)}
            />

            {/* Live Interactive Map on Dashboard */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    Live Corridor Map & Interactive Layers
                  </h3>
                  <p className="text-xs text-slate-500">
                    Showing route options, live traffic density, speed cameras, hazards, and toll plazas.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsVoiceModalOpen(true)}
                    className="text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
                  >
                    <Mic className="w-3.5 h-3.5 text-cyan-600 animate-pulse" />
                    Voice
                  </button>
                  <button
                    onClick={() => setActiveTab("map")}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800"
                  >
                    Full Screen Map →
                  </button>
                </div>
              </div>

              <InteractiveMap
                routes={routes}
                selectedRouteId={selectedRouteId}
                onSelectRoute={setSelectedRouteId}
                alerts={alerts}
                speedCameras={speedCameras}
                policeAlerts={policeAlerts}
                tollGates={tollGates}
                nearbyServices={nearbyServices}
                showDataBadges={showDataBadges}
                isNavigating={isNavigating}
                onToggleNavigation={toggleNavigation}
                userProfile={userProfile}
                onAddAlertDetail={handleAddAlertDetail}
                onOpenVoiceCommand={() => setIsVoiceModalOpen(true)}
                onSelectDestination={(placeName) => {
                  const match = routes.find(r => r.title.toLowerCase().includes(placeName.toLowerCase()));
                  if (match) setSelectedRouteId(match.id);
                }}
              />
            </div>
          </div>
        )}

        {/* SMART CONNECT: VEHICLE TELEMETRY & BIKE DETAILS */}
        {activeTab === "smart_connect" && (
          <SmartConnectView
            userProfile={userProfile}
            onNavigateToTab={setActiveTab}
            onOpenVoiceCommand={() => setIsVoiceModalOpen(true)}
          />
        )}

        {/* LIVE MAP VIEW (HERO SHOWCASE) */}
        {activeTab === "map" && (
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Interactive Live Traffic & Hazard Map
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Click any road segment, speed camera, police alert, or toll plaza for verified details.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsVoiceModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-slate-700 flex items-center gap-2 transition-all shadow-sm"
                  title="Speak 'Start navigation to work' or 'Report pothole'"
                >
                  <Mic className="w-4 h-4 animate-pulse" />
                  <span>Voice Control</span>
                </button>

                <button
                  onClick={toggleNavigation}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                    isNavigating
                      ? "bg-rose-600 text-white"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {isNavigating ? "Stop Navigation Simulation" : "Start Live Simulation"}
                </button>
              </div>
            </div>

            <InteractiveMap
              routes={routes}
              selectedRouteId={selectedRouteId}
              onSelectRoute={setSelectedRouteId}
              alerts={alerts}
              speedCameras={speedCameras}
              policeAlerts={policeAlerts}
              tollGates={tollGates}
              nearbyServices={nearbyServices}
              showDataBadges={showDataBadges}
              isNavigating={isNavigating}
              onToggleNavigation={toggleNavigation}
              userProfile={userProfile}
              onAddAlertDetail={handleAddAlertDetail}
              onOpenVoiceCommand={() => setIsVoiceModalOpen(true)}
              onSelectDestination={(placeName) => {
                const match = routes.find(r => r.title.toLowerCase().includes(placeName.toLowerCase()));
                if (match) setSelectedRouteId(match.id);
              }}
              className="h-[620px] md:h-[720px]"
            />
          </div>
        )}

        {/* ROUTE PLANNER VIEW */}
        {activeTab === "routes" && (
          <div className="space-y-6">
            <RoutePlannerView
              routes={routes}
              selectedRouteId={selectedRouteId}
              onSelectRoute={setSelectedRouteId}
              userPreferences={preferences}
              showDataBadges={showDataBadges}
              onStartNavigation={toggleNavigation}
              isNavigating={isNavigating}
              onOpenVoiceCommand={() => setIsVoiceModalOpen(true)}
            />

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-3">
                Corridor Map for: {activeRoute.title}
              </h3>
              <InteractiveMap
                routes={routes}
                selectedRouteId={selectedRouteId}
                onSelectRoute={setSelectedRouteId}
                alerts={alerts}
                speedCameras={speedCameras}
                policeAlerts={policeAlerts}
                tollGates={tollGates}
                nearbyServices={nearbyServices}
                showDataBadges={showDataBadges}
                isNavigating={isNavigating}
                onToggleNavigation={toggleNavigation}
                userProfile={userProfile}
                onAddAlertDetail={handleAddAlertDetail}
                onOpenVoiceCommand={() => setIsVoiceModalOpen(true)}
              />
            </div>
          </div>
        )}

        {/* TRAFFIC PREDICTION VIEW */}
        {activeTab === "prediction" && (
          <TrafficPredictionView
            prediction={prediction}
            showDataBadges={showDataBadges}
          />
        )}

        {/* ROAD CONDITIONS VIEW */}
        {activeTab === "roads" && (
          <RoadConditionsView
            issues={roadIssues}
            onReportSubmitted={handleReportSubmitted}
            showDataBadges={showDataBadges}
            userProfile={userProfile}
            onOpenVoiceCommand={() => setIsVoiceModalOpen(true)}
          />
        )}

        {/* NEARBY SERVICES VIEW */}
        {activeTab === "nearby" && (
          <NearbyServicesView
            services={nearbyServices}
            showDataBadges={showDataBadges}
            onNavigateToPlace={handleNavigateToService}
          />
        )}

        {/* AI ASSISTANT VIEW */}
        {activeTab === "assistant" && (
          <AIAssistantView
            activeRoute={activeRoute}
            userPreferences={preferences}
            showDataBadges={showDataBadges}
          />
        )}

        {/* COMMUTE ANALYTICS VIEW */}
        {activeTab === "analytics" && (
          <AnalyticsView
            showDataBadges={showDataBadges}
            activeRoute={activeRoute}
            isNavigating={isNavigating}
            onToggleNavigation={() => setIsNavigating(!isNavigating)}
            onNavigateToTab={setActiveTab}
            userProfile={userProfile}
          />
        )}

        {/* SAVED PLACES & TRAVEL HISTORY VIEW */}
        {activeTab === "places" && (
          <SavedPlacesAndHistoryView
            savedPlaces={savedPlaces}
            travelHistory={travelHistory}
            onRefresh={handleRefreshPlacesAndHistory}
            onSelectRouteFromHistory={handleRouteFromHistory}
          />
        )}

        {/* SETTINGS & PRIVACY VIEW */}
        {activeTab === "settings" && (
          <SettingsView
            user={userProfile}
            preferences={preferences}
            onPreferencesUpdated={handlePreferencesUpdated}
            onProfileUpdated={handleProfileUpdated}
            onNavigateToTab={setActiveTab}
            onOpenSOS={() => setIsSOSModalOpen(true)}
          />
        )}

        {/* ADMIN TELEMETRY VIEW */}
        {activeTab === "admin" && <AdminMonitoringView />}
      </main>

      {/* 4. FLOATING AI COPILOT CHAT (Shown on other tabs) */}
      {activeTab !== "assistant" && (
        <FloatingAIChat
          activeRoute={activeRoute}
          userPreferences={preferences}
          onOpenVoiceCommand={() => setIsVoiceModalOpen(true)}
        />
      )}

      {/* 5. MOBILE BOTTOM NAVIGATION */}
      <MobileBottomNav activeTab={activeTab} onSelectTab={setActiveTab} />

      {/* 6. VOICE COMMAND INTERACTIVE MODAL */}
      <VoiceCommandModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onExecuteCommand={handleExecuteVoiceCommand}
        userProfile={userProfile}
      />

      {/* 7. EMERGENCY SOS DISTRESS MODAL */}
      <SOSModal
        isOpen={isSOSModalOpen}
        onClose={() => setIsSOSModalOpen(false)}
        userProfile={userProfile}
        onProfileUpdated={handleProfileUpdated}
        onSelectRoute={(origin, destination) => {
          setIsSOSModalOpen(false);
          setActiveTab("routes");
        }}
      />

      {/* 8. PROFESSIONAL FOOTER */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 text-xs py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <Logo size="sm" showTagline={true} className="[&_span]:text-white" />

          <div className="text-center md:text-right text-[11px] text-slate-500 max-w-xl">
            <p className="leading-relaxed">
              SmartRoute AI combines live sensor feeds, historical time series, and Gemini AI. Predictions are estimates and not guarantees. Always adhere to posted regulatory speed signs and traffic police directions.
            </p>
            <p className="mt-1">
              © {new Date().getFullYear()} SmartRoute AI. Engineered with Privacy by Design.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
