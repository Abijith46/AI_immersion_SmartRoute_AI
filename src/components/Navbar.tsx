import React, { useState, useEffect } from "react";
import { Logo } from "./Logo";
import {
  LayoutDashboard,
  Map,
  Compass,
  TrendingUp,
  HardHat,
  MapPin,
  Sparkles,
  BarChart3,
  Bookmark,
  Settings,
  Shield,
  Bell,
  X,
  Menu,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Mic,
  Bike,
  AlertOctagon
} from "lucide-react";
import { notificationService, smartConnectService } from "../services";
import { UserProfile, LiveVehicleTelemetry, BikeDetails } from "../types";

interface NavbarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  showDataBadges: boolean;
  onToggleDataBadges: () => void;
  userProfile: UserProfile;
  onUpdateUserName?: (name: string) => void;
  onOpenVoiceCommand?: () => void;
  onOpenSOS?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  showDataBadges,
  onToggleDataBadges,
  userProfile,
  onUpdateUserName,
  onOpenVoiceCommand,
  onOpenSOS,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [editNameMode, setEditNameMode] = useState(false);
  const [tempName, setTempName] = useState(userProfile?.name || "Abijith");
  const notifications = notificationService.getPendingAlerts();

  const [telemetry, setTelemetry] = useState<LiveVehicleTelemetry>(smartConnectService.getTelemetry());
  const [bike, setBike] = useState<BikeDetails>(smartConnectService.getActiveBike());

  useEffect(() => {
    const unsubT = smartConnectService.subscribeTelemetry(setTelemetry);
    const unsubB = smartConnectService.subscribeBike(setBike);
    return () => {
      unsubT();
      unsubB();
    };
  }, []);

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "smart_connect", label: "Smart Connect", icon: Bike },
    { id: "map", label: "Live Map", icon: Map },
    { id: "routes", label: "Route Planner", icon: Compass },
    { id: "prediction", label: "Traffic Prediction", icon: TrendingUp },
    { id: "roads", label: "Road Conditions", icon: HardHat },
    { id: "nearby", label: "Nearby Places", icon: MapPin },
    { id: "assistant", label: "AI Assistant", icon: Sparkles },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "places", label: "Saved & History", icon: Bookmark },
    { id: "settings", label: "Settings", icon: Settings },
    { id: "admin", label: "Telemetry", icon: Shield },
  ];

  const handleNavClick = (id: string) => {
    onSelectTab(id);
    setShowMobileMenu(false);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* BRAND LOGO */}
        <div className="cursor-pointer" onClick={() => handleNavClick("dashboard")}>
          <Logo size="md" showTagline={false} />
        </div>

        {/* DESKTOP NAV TABS */}
        <nav className="hidden xl:flex items-center gap-1">
          {navItems.slice(0, 7).map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  isActive
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="h-5 w-px bg-slate-200 mx-1" />

          {/* More Dropdown/Buttons */}
          {navItems.slice(7).map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`p-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-slate-900 text-white"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                }`}
                title={item.label}
              >
                <Icon className="w-4 h-4" />
              </button>
            );
          })}
        </nav>

        {/* RIGHT CONTROLS: SMART CONNECT, VOICE ASSISTANT, NOTIFICATIONS & PROFILE */}
        <div className="flex items-center gap-2">
          {/* Smart Connect Vehicle Status Pill */}
          <button
            onClick={() => handleNavClick("smart_connect")}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 shadow-sm ${
              activeTab === "smart_connect"
                ? "bg-cyan-600 text-white border-cyan-500 shadow-cyan-500/20"
                : "bg-slate-900 text-slate-200 hover:bg-slate-850 border-slate-750"
            }`}
            title={`${bike.make} ${bike.model} (${bike.regNumber}) • Speed: ${telemetry.currentSpeedKmh} km/h • Mileage: ${telemetry.instantFuelEfficiencyKmpl} km/L • Petrol: ${telemetry.fuelRemainingLitres.toFixed(1)}L`}
          >
            <Bike className="w-4 h-4 text-cyan-400" />
            <span className="font-mono text-cyan-300 font-black">
              {telemetry.currentSpeedKmh} <span className="text-[9px] font-normal text-slate-400">km/h</span>
            </span>
            <span className="hidden sm:inline text-slate-600">•</span>
            <span className="hidden sm:inline text-emerald-400 font-mono text-[11px] font-bold">
              {telemetry.instantFuelEfficiencyKmpl} <span className="text-[9px] font-normal text-slate-400">km/L</span>
            </span>
          </button>

          {/* Emergency SOS Distress Button */}
          {onOpenSOS && (
            <button
              onClick={onOpenSOS}
              className="px-2.5 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white shadow-sm shadow-rose-600/30 flex items-center gap-1.5 transition-all animate-pulse"
              title="Emergency SOS: Rapid 112/108 Police & Ambulance Broadcast"
            >
              <AlertOctagon className="w-4 h-4 text-white" />
              <span className="tracking-wider">SOS</span>
            </button>
          )}

          {/* Hands-Free Voice Command Button */}
          {onOpenVoiceCommand && (
            <button
              onClick={onOpenVoiceCommand}
              className="px-2.5 py-2 rounded-xl text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-all flex items-center gap-1.5 shadow-sm group"
              title="Voice Commands: Speak 'Start navigation to work' or 'Check bike speed'"
            >
              <Mic className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
              <span className="hidden md:inline text-[11px]">Voice Control</span>
            </button>
          )}

          {/* Notification Bell with Badge */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80 transition-colors relative"
              title="Corridor Traffic & Weather Notifications"
            >
              <Bell className="w-4 h-4" />
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white" />
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 z-50 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Active Road Alerts ({notifications.length})
                  </h4>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="p-1 text-slate-400 hover:text-slate-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/70 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <strong className="text-xs font-bold text-slate-900">{n.title}</strong>
                        <span className="text-[10px] text-slate-400 shrink-0">{n.time}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                      <button
                        onClick={() => {
                          setShowNotifications(false);
                          onSelectTab("routes");
                        }}
                        className="mt-2 text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        {n.actionText} <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* USER PROFILE BADGE & QUICK DISPLAY NAME */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-slate-100 border border-slate-200/80 transition-all text-left"
              title={`User Profile: ${userProfile?.name || "Abijith"}`}
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                {(userProfile?.name || "Abijith").charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block text-left">
                <span className="text-xs font-bold text-slate-900 block leading-tight">
                  {userProfile?.name || "Abijith"}
                </span>
                <span className="text-[10px] text-emerald-600 font-medium block leading-none">
                  Verified Commuter
                </span>
              </div>
            </button>

            {/* Profile Menu Popover */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 z-50 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center">
                      {(userProfile?.name || "Abijith").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">
                        {userProfile?.name || "Abijith"}
                      </h4>
                      <p className="text-[11px] text-slate-400 truncate max-w-[150px]">
                        {userProfile?.email || "abijithprakash044@gmail.com"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowProfileMenu(false)}
                    className="p-1 text-slate-400 hover:text-slate-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {editNameMode ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (tempName.trim() && onUpdateUserName) {
                        onUpdateUserName(tempName.trim());
                      }
                      setEditNameMode(false);
                    }}
                    className="space-y-3"
                  >
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                        Edit Display Name
                      </label>
                      <input
                        type="text"
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        placeholder="Abijith"
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-blue-500"
                        autoFocus
                      />
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditNameMode(false)}
                        className="px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-700"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700"
                      >
                        Save
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        setTempName(userProfile?.name || "Abijith");
                        setEditNameMode(true);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center justify-between"
                    >
                      <span>Change Display Name</span>
                      <span className="text-[10px] text-blue-600 font-bold">Edit</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        onSelectTab("settings");
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center justify-between"
                    >
                      <span>Settings & Privacy</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile hamburger menu toggle */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="xl:hidden p-2.5 rounded-xl text-slate-700 hover:bg-slate-100 border border-slate-200/80"
          >
            {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* MOBILE FULL DRAWER NAVIGATION */}
      {showMobileMenu && (
        <div className="xl:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-2 animate-in slide-in-from-top-2">
          {onOpenSOS && (
            <button
              onClick={() => {
                setShowMobileMenu(false);
                onOpenSOS();
              }}
              className="w-full p-3 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md shadow-rose-600/30 animate-pulse"
            >
              <AlertOctagon className="w-5 h-5" />
              <span>EMERGENCY SOS DISTRESS HELP (112 / 108)</span>
            </button>
          )}

          <div className="grid grid-cols-2 gap-2 pt-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                    isActive
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};
