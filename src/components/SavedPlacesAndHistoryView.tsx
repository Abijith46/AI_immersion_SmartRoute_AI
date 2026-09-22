import React, { useState, useEffect } from "react";
import { SavedPlace, TravelHistoryRecord, DetailedAddress } from "../types";
import { userService, liveApiService } from "../services";
import {
  Bookmark,
  History,
  Plus,
  Trash2,
  MapPin,
  Clock,
  Navigation,
  CheckCircle2,
  X,
  Home,
  Briefcase,
  GraduationCap,
  Sparkles,
  Search,
  Crosshair,
  ExternalLink,
  Edit3,
  Calendar
} from "lucide-react";

interface SavedPlacesAndHistoryViewProps {
  savedPlaces: SavedPlace[];
  travelHistory: TravelHistoryRecord[];
  onRefresh: () => void;
  onSelectRouteFromHistory: (origin: string, destination: string) => void;
}

export const SavedPlacesAndHistoryView: React.FC<SavedPlacesAndHistoryViewProps> = ({
  savedPlaces,
  travelHistory,
  onRefresh,
  onSelectRouteFromHistory,
}) => {
  const [activeTab, setActiveTab] = useState<"places" | "history">("places");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPlace, setEditingPlace] = useState<SavedPlace | null>(null);

  // Form state
  const [label, setLabel] = useState("");
  const [category, setCategory] = useState<"home" | "work" | "college" | "gym" | "airport" | "favorite" | "other">("home");
  const [street, setStreet] = useState("");
  const [flatOrDoorNo, setFlatOrDoorNo] = useState("");
  const [area, setArea] = useState("");
  const [landmark, setLandmark] = useState("");
  const [city, setCity] = useState("Coimbatore");
  const [pincode, setPincode] = useState("641012");
  const [lat, setLat] = useState<number>(11.0183);
  const [lng, setLng] = useState<number>(76.9725);
  const [departureTime, setDepartureTime] = useState("7:30 AM");
  const [arrivalTime, setArrivalTime] = useState("6:30 PM");

  // Live Address Search
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearchingLive, setIsSearchingLive] = useState(false);
  const [isLocatingGps, setIsLocatingGps] = useState(false);

  // Trigger live geocode search as user types
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 3) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingLive(true);
      try {
        const results = await liveApiService.searchLiveLocations(searchQuery);
        setSearchResults(results);
      } catch (err) {
        console.warn("Live search failed:", err);
      } finally {
        setIsSearchingLive(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectLiveLocation = (item: any) => {
    setStreet(item.road || item.name || "");
    setArea(item.suburb || "Coimbatore Central");
    setCity(item.city || "Coimbatore");
    if (item.postcode) setPincode(item.postcode);
    setLat(item.lat);
    setLng(item.lng);
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleDetectLiveGps = async () => {
    setIsLocatingGps(true);
    try {
      const pos = await liveApiService.getCurrentGpsPosition();
      setLat(pos.lat);
      setLng(pos.lng);
      if (pos.address) {
        setStreet(pos.address.street || "");
        setArea(pos.address.area || "");
        setCity(pos.address.city || "Coimbatore");
        setPincode(pos.address.pincode || "641012");
      }
    } catch (e) {
      console.warn("GPS detection failed:", e);
    } finally {
      setIsLocatingGps(false);
    }
  };

  const openNewPlaceModal = (presetCategory?: any) => {
    setEditingPlace(null);
    if (presetCategory === "home") {
      setLabel("Home");
      setCategory("home");
      setStreet("12/4 Cross Cut 7th Street");
      setFlatOrDoorNo("Door #4B, Krishna Enclave");
      setArea("Gandhipuram");
      setLandmark("Near Cross Cut Signal");
      setPincode("641012");
      setLat(11.0183);
      setLng(76.9725);
      setDepartureTime("7:30 AM");
      setArrivalTime("7:15 PM");
    } else if (presetCategory === "work") {
      setLabel("Work / Tech Park");
      setCategory("work");
      setStreet("CHIL SEZ IT Corridor, Keeranatham Road");
      setFlatOrDoorNo("Tower 2, 4th Floor");
      setArea("Saravanampatti");
      setLandmark("Near KCT Tech Gate & SEZ Main Entrance");
      setPincode("641035");
      setLat(11.0829);
      setLng(77.0019);
      setDepartureTime("5:30 PM");
      setArrivalTime("8:30 AM");
    } else {
      setLabel("");
      setCategory("other");
      setStreet("");
      setFlatOrDoorNo("");
      setArea("");
      setLandmark("");
      setPincode("641012");
      setLat(11.0183);
      setLng(76.9725);
    }
    setShowAddModal(true);
  };

  const openEditPlaceModal = (place: SavedPlace) => {
    setEditingPlace(place);
    setLabel(place.label);
    setCategory((place.category as any) || "home");

    const det = place.detailedAddress;
    if (det) {
      setStreet(det.street || "");
      setFlatOrDoorNo(det.flatOrDoorNo || "");
      setArea(det.area || "");
      setLandmark(det.landmark || "");
      setCity(det.city || "Coimbatore");
      setPincode(det.pincode || "641012");
      setLat(det.coordinates.lat || 11.0183);
      setLng(det.coordinates.lng || 76.9725);
      setDepartureTime(det.routineDepartureTime || "7:30 AM");
      setArrivalTime(det.routineArrivalTime || "6:30 PM");
    } else {
      setStreet(place.address);
      setFlatOrDoorNo("");
      setArea("Coimbatore");
      setLandmark("");
      setCity("Coimbatore");
      setPincode("641012");
      if (place.coordinates) {
        setLat(place.coordinates.lat);
        setLng(place.coordinates.lng);
      }
    }
    setShowAddModal(true);
  };

  const handleSavePlace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return;

    const formattedAddress = [
      flatOrDoorNo,
      street,
      landmark ? `(Opp/Nr: ${landmark})` : "",
      area,
      `${city} ${pincode}`,
    ]
      .filter(Boolean)
      .join(", ");

    const detailed: DetailedAddress = {
      street: street || label,
      flatOrDoorNo: flatOrDoorNo || undefined,
      area: area || "Coimbatore",
      landmark: landmark || undefined,
      city: city || "Coimbatore",
      state: "Tamil Nadu",
      pincode: pincode || "641012",
      formattedAddress,
      coordinates: { lat, lng },
      routineDepartureTime: departureTime,
      routineArrivalTime: arrivalTime,
    };

    if (editingPlace) {
      // Update existing
      const existing = userService.getSavedPlaces();
      const updated = existing.map((p) =>
        p.id === editingPlace.id
          ? {
              ...p,
              label,
              category,
              address: formattedAddress,
              detailedAddress: detailed,
              coordinates: { lat, lng },
              frequentlyVisitedHours: `${departureTime} - ${arrivalTime}`,
            }
          : p
      );
      localStorage.setItem("smartroute_saved_places", JSON.stringify(updated));
    } else {
      // Create new
      userService.addSavedPlace({
        label,
        address: formattedAddress,
        category,
        detailedAddress: detailed,
        coordinates: { lat, lng },
        frequentlyVisitedHours: `${departureTime} - ${arrivalTime}`,
      } as any);
    }

    setShowAddModal(false);
    onRefresh();
  };

  const handleDeletePlace = (id: string) => {
    userService.deleteSavedPlace(id);
    onRefresh();
  };

  const handleClearHistory = () => {
    if (confirm("Are you sure you want to clear your local travel history?")) {
      localStorage.removeItem("smartroute_travel_history");
      onRefresh();
    }
  };

  // Helper icons for categories
  const getCategoryIcon = (cat?: string) => {
    const c = (cat || "").toLowerCase();
    if (c === "home") return <Home className="w-4 h-4 text-emerald-600" />;
    if (c === "work") return <Briefcase className="w-4 h-4 text-blue-600" />;
    if (c === "college") return <GraduationCap className="w-4 h-4 text-purple-600" />;
    return <Bookmark className="w-4 h-4 text-amber-600" />;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* HEADER & TABS */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-blue-600" />
            Places & Commute Log
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Granular Home/Work addresses, live OpenStreetMap geocoding, and private travel logs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="p-1 bg-slate-100 rounded-xl flex items-center gap-1 text-xs">
            <button
              onClick={() => setActiveTab("places")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === "places" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Saved Places ({savedPlaces.length})
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === "history" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Travel History ({travelHistory.length})
            </button>
          </div>

          {activeTab === "places" ? (
            <button
              onClick={() => openNewPlaceModal()}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm flex items-center gap-1.5 text-xs font-bold transition-colors"
              title="Add New Place"
            >
              <Plus className="w-4 h-4" />
              <span>Add Place</span>
            </button>
          ) : (
            <button
              onClick={handleClearHistory}
              className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200"
              title="Clear Travel History"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* QUICK PRESETS BANNER FOR HOME & WORK */}
      {activeTab === "places" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50/50 border border-emerald-200/80 rounded-2xl flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                <Home className="w-5 h-5" />
              </div>
              <div>
                <strong className="text-sm font-bold text-emerald-950 block">Home Address Profile</strong>
                <span className="text-xs text-emerald-700">Gandhipuram Central • Usual Dep: 7:30 AM</span>
              </div>
            </div>
            <button
              onClick={() => {
                const homePlace = savedPlaces.find((p) => p.category === "home" || p.label.toLowerCase() === "home");
                if (homePlace) {
                  openEditPlaceModal(homePlace);
                } else {
                  openNewPlaceModal("home");
                }
              }}
              className="px-3 py-1.5 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold shadow-xs transition-colors"
            >
              Configure Home
            </button>
          </div>

          <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50/50 border border-blue-200/80 rounded-2xl flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <strong className="text-sm font-bold text-blue-950 block">Work / Office Profile</strong>
                <span className="text-xs text-blue-700">CHIL SEZ Saravanampatti • Dep: 5:30 PM</span>
              </div>
            </div>
            <button
              onClick={() => {
                const workPlace = savedPlaces.find((p) => p.category === "work" || p.label.toLowerCase() === "work");
                if (workPlace) {
                  openEditPlaceModal(workPlace);
                } else {
                  openNewPlaceModal("work");
                }
              }}
              className="px-3 py-1.5 bg-white hover:bg-blue-100 text-blue-800 border border-blue-300 rounded-xl text-xs font-bold shadow-xs transition-colors"
            >
              Configure Work
            </button>
          </div>
        </div>
      )}

      {/* SAVED PLACES TAB */}
      {activeTab === "places" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {savedPlaces.map((place) => {
            const det = place.detailedAddress;
            return (
              <div
                key={place.id}
                className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:border-slate-300 hover:shadow-md transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-1.5">
                      <span className="p-1.5 bg-slate-50 rounded-lg border border-slate-200">
                        {getCategoryIcon(place.category)}
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                        {place.category || "Place"}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditPlaceModal(place)}
                        className="text-slate-400 hover:text-blue-600 p-1 rounded-lg hover:bg-blue-50 transition-colors"
                        title="Edit Full Details"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeletePlace(place.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Delete Place"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h4 className="text-base font-bold text-slate-900">{place.label}</h4>

                  {/* Address Summary */}
                  <p className="text-xs text-slate-600 mt-1.5 flex items-start gap-1 leading-relaxed">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                    <span>{det?.formattedAddress || place.address}</span>
                  </p>

                  {/* Granular Metadata Badges */}
                  <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap gap-1.5 text-[10px]">
                    {det?.area && (
                      <span className="bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded">
                        Area: {det.area}
                      </span>
                    )}
                    {det?.pincode && (
                      <span className="bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded">
                        PIN: {det.pincode}
                      </span>
                    )}
                    {det?.landmark && (
                      <span className="bg-amber-50 text-amber-800 border border-amber-200 font-semibold px-2 py-0.5 rounded">
                        Nr: {det.landmark}
                      </span>
                    )}
                    {place.frequentlyVisitedHours && (
                      <span className="bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {place.frequentlyVisitedHours}
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() => onSelectRouteFromHistory("Current Location", place.label)}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    Route Here
                  </button>
                  {place.coordinates && (
                    <a
                      href={`https://www.google.com/maps?q=${place.coordinates.lat},${place.coordinates.lng}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
                      title="Open in Google Maps"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TRAVEL HISTORY TAB */}
      {activeTab === "history" && (
        <div className="space-y-3">
          {travelHistory.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-200/80 text-center text-slate-500 text-xs">
              No travel history recorded or history has been cleared for privacy.
            </div>
          ) : (
            travelHistory.map((trip) => (
              <div
                key={trip.id}
                className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-300 transition-all"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">
                      {trip.origin} → {trip.destination}
                    </span>
                    <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-mono">
                      {trip.date}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-3">
                    <span>
                      Route: <strong className="text-slate-700">{trip.routeUsed}</strong>
                    </span>
                    <span>•</span>
                    <span>Distance: {trip.distanceKm} km</span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                  <div className="text-right">
                    <div className="text-base font-black text-slate-900">{trip.durationMin} min</div>
                    <span className="text-[10px] text-emerald-600 font-bold block">
                      Saved ~{trip.delayAvoidedMin}m delay
                    </span>
                  </div>

                  <button
                    onClick={() => onSelectRouteFromHistory(trip.origin, trip.destination)}
                    className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                    title="Repeat this journey"
                  >
                    <Navigation className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* COMPREHENSIVE ADD/EDIT PLACE MODAL WITH LIVE APIS */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 my-auto max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {editingPlace ? "Edit Address Details" : "Add Address with Live Coordinates"}
                  </h3>
                  <span className="text-xs text-slate-500">Live OpenStreetMap search & W3C GPS geocoding</span>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePlace} className="space-y-4 mt-4 overflow-y-auto pr-1">
              {/* LIVE SEARCH & AUTOCOMPLETE BAR */}
              <div className="bg-blue-50/70 p-3 rounded-2xl border border-blue-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                    <Search className="w-3.5 h-3.5 text-blue-600" />
                    Live Address Search (OpenStreetMap API)
                  </label>
                  <button
                    type="button"
                    onClick={handleDetectLiveGps}
                    disabled={isLocatingGps}
                    className="text-[11px] font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-blue-300 shadow-xs"
                  >
                    <Crosshair className={`w-3.5 h-3.5 ${isLocatingGps ? "animate-spin text-blue-600" : ""}`} />
                    <span>{isLocatingGps ? "Detecting GPS..." : "📍 Use My GPS Location"}</span>
                  </button>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search any street, area, or landmark in Coimbatore..."
                    className="w-full px-3.5 py-2 rounded-xl border border-blue-300 bg-white text-xs text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {isSearchingLive && (
                    <span className="absolute right-3 top-2.5 text-[10px] font-bold text-blue-600 animate-pulse">
                      Searching...
                    </span>
                  )}
                </div>

                {/* Dropdown suggestions */}
                {searchResults.length > 0 && (
                  <div className="bg-white rounded-xl border border-blue-200 shadow-lg overflow-hidden divide-y divide-slate-100 max-h-48 overflow-y-auto">
                    {searchResults.map((item) => (
                      <button
                        key={item.placeId}
                        type="button"
                        onClick={() => handleSelectLiveLocation(item)}
                        className="w-full text-left p-2.5 hover:bg-blue-50 text-xs transition-colors flex items-start gap-2"
                      >
                        <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="font-bold text-slate-900 block">{item.name}</strong>
                          <span className="text-[11px] text-slate-500 line-clamp-1">{item.formattedAddress}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Basic Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Place Name / Label</label>
                  <input
                    type="text"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder="e.g. Home, Tech Park Campus"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 outline-none focus:border-blue-600 bg-white"
                  >
                    <option value="home">Home</option>
                    <option value="work">Work / Tech Park</option>
                    <option value="college">College / University</option>
                    <option value="gym">Gym / Fitness</option>
                    <option value="favorite">Favorite Spot</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              {/* Granular Address Details */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <span className="text-xs font-black uppercase text-slate-600 tracking-wider block">
                  Detailed Address Breakdown
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Door / Flat No. & Building
                    </label>
                    <input
                      type="text"
                      value={flatOrDoorNo}
                      onChange={(e) => setFlatOrDoorNo(e.target.value)}
                      placeholder="e.g. Door #4B, Krishna Enclave"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Street / Main Road
                    </label>
                    <input
                      type="text"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      placeholder="e.g. 12/4 Cross Cut 7th Street"
                      required
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Area / Locality</label>
                    <input
                      type="text"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      placeholder="e.g. Gandhipuram / Peelamedu"
                      required
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Landmark</label>
                    <input
                      type="text"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      placeholder="Near Signal / Power House"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">PIN Code</label>
                    <input
                      type="text"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      placeholder="641012"
                      required
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Latitude (Coordinates)
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={lat}
                      onChange={(e) => setLat(parseFloat(e.target.value) || 11.0183)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Longitude (Coordinates)
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={lng}
                      onChange={(e) => setLng(parseFloat(e.target.value) || 76.9725)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Routine Commute Timings */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Usual Departure</label>
                  <input
                    type="text"
                    value={departureTime}
                    onChange={(e) => setDepartureTime(e.target.value)}
                    placeholder="e.g. 7:30 AM"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Usual Return / Arrival</label>
                  <input
                    type="text"
                    value={arrivalTime}
                    onChange={(e) => setArrivalTime(e.target.value)}
                    placeholder="e.g. 6:30 PM"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
