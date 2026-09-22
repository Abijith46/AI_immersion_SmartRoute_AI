import React from "react";
import { LayoutDashboard, Map, Compass, TrendingUp, Sparkles, Bike } from "lucide-react";

interface MobileBottomNavProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ activeTab, onSelectTab }) => {
  const primaryTabs = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "smart_connect", label: "Bike Telemetry", icon: Bike },
    { id: "map", label: "Map", icon: Map },
    { id: "routes", label: "Routes", icon: Compass },
    { id: "prediction", label: "Predict", icon: TrendingUp },
    { id: "assistant", label: "AI Copilot", icon: Sparkles },
  ];

  return (
    <div className="xl:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-1.5 py-1.5">
      <div className="flex items-center justify-around">
        {primaryTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center gap-0.5 py-1 px-1.5 rounded-xl transition-all ${
                isActive ? "text-blue-600 font-bold" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "stroke-[2.5]" : "stroke-[1.8]"}`} />
              <span className="text-[9px] tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

