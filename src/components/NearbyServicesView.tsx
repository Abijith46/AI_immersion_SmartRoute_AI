import React, { useState } from "react";
import { NearbyService } from "../types";
import {
  Fuel,
  Utensils,
  Wrench,
  Shield,
  Heart,
  Zap,
  Car,
  CreditCard,
  Search,
  Star,
  MapPin,
  Clock,
  Phone,
  Navigation,
  CheckCircle,
  ShoppingBag,
  Building2,
  GraduationCap,
  Trees,
  Landmark,
  Bus
} from "lucide-react";
import { DataBadge } from "./DataBadge";

interface NearbyServicesViewProps {
  services: NearbyService[];
  showDataBadges: boolean;
  onNavigateToPlace: (service: NearbyService) => void;
}

export const NearbyServicesView: React.FC<NearbyServicesViewProps> = ({
  services,
  showDataBadges,
  onNavigateToPlace,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    { id: "all", label: "All Places", icon: MapPin },
    { id: "transit", label: "Transit & Hubs", icon: Bus },
    { id: "shopping", label: "Shopping & Malls", icon: ShoppingBag },
    { id: "it_park", label: "Tech Parks", icon: Building2 },
    { id: "college", label: "Colleges", icon: GraduationCap },
    { id: "hospital", label: "Hospitals", icon: Heart },
    { id: "restaurant", label: "Food & Cafes", icon: Utensils },
    { id: "ev_charging", label: "EV Fast Chargers", icon: Zap },
    { id: "fuel", label: "Fuel & CNG", icon: Fuel },
    { id: "leisure", label: "Parks & Lakes", icon: Trees },
    { id: "temple", label: "Temples & Heritage", icon: Landmark },
    { id: "mechanic", label: "Mechanics", icon: Wrench },
    { id: "police", label: "Police Stations", icon: Shield },
    { id: "parking", label: "Parking", icon: Car },
    { id: "atm", label: "ATMs", icon: CreditCard },
  ];

  const filtered = services.filter((s) => {
    const matchesCategory = selectedCategory === "all" || s.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.details.some((d) => d.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* HEADER & SEARCH */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              Corridor & En-Route Services
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified amenities, emergency facilities, and charging hubs along your active travel path.
            </p>
          </div>

          {/* Search box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search fuel, hospital, food..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none"
            />
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-2 rounded-xl font-bold flex items-center gap-1.5 shrink-0 transition-all ${
                  isSelected
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SERVICES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((service) => (
          <div
            key={service.id}
            className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  {service.category.replace("_", " ")}
                </span>

                <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{service.rating}</span>
                </div>
              </div>

              <h4 className="text-base font-bold text-slate-900">{service.name}</h4>
              <p className="text-xs text-slate-500 mt-1">{service.address}</p>

              {/* Tags / Details */}
              <div className="flex flex-wrap gap-1.5 my-3">
                {service.details.map((d, i) => (
                  <span key={i} className="text-[10px] font-medium bg-slate-50 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200">
                    {d}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 text-slate-600">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-semibold text-emerald-600">{service.openHours}</span>
                </div>
                <div className="flex items-center gap-1 text-slate-600">
                  <Navigation className="w-3.5 h-3.5 text-blue-600" />
                  <span className="font-bold text-slate-900">{service.distanceFromOriginKm} km away</span>
                </div>
              </div>

              {service.contactNumber && (
                <div className="text-xs text-slate-600 flex items-center gap-1.5 font-mono">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{service.contactNumber}</span>
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => onNavigateToPlace(service)}
                  className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-colors"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  Add as Waypoint
                </button>
              </div>

              {showDataBadges && (
                <div className="pt-1">
                  <DataBadge metadata={service.dataQuality} showDetails={false} />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
