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
  TravelHistoryRecord,
  ChatMessage,
  EmergencyContact
} from "../types";
import {
  sampleRoutes,
  sampleTrafficAlerts,
  sampleSpeedCameras,
  samplePoliceAlerts,
  sampleTollGates,
  sampleNearbyServices,
  sampleWeatherData,
  sampleTrafficPrediction,
  sampleRoadIssues,
  sampleTravelHistory,
  sampleSavedPlaces,
  initialUserProfile,
  initialUserPreferences
} from "../data/mockData";

export const geminiService = {
  async askAssistant(
    message: string,
    history: ChatMessage[],
    travelContext: any,
    userPreferences: UserPreferences
  ): Promise<{ reply: string; mode?: string; confidence?: string }> {
    try {
      const res = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, history, travelContext, userPreferences }),
      });
      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }
      return await res.json();
    } catch (err: any) {
      console.warn("Client fallback for Gemini request:", err);
      return {
        reply: `### AI Travel Assistant (Local Gateway)\n\nI analyzed your query: "${message}".\n\n- **Route:** ${travelContext.origin || "Gandhipuram"} → ${travelContext.destination || "Saravanampatti"}\n- **Current Congestion:** ${travelContext.traffic || "Heavy"}\n- **Recommended:** Stay on Sathy Road Express (32 min) or take the CODISSIA Bypass (36 min) for lower congestion.\n- **Clearing Forecast:** Traffic should ease around 5:45 PM.`,
        mode: "demo_fallback",
        confidence: "80%",
      };
    }
  },

  async getTrafficPrediction(origin: string, destination: string): Promise<TrafficPrediction> {
    try {
      const res = await fetch("/api/gemini/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ origin, destination }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      // fallback
    }
    return sampleTrafficPrediction;
  },
};

export const trafficService = {
  getLiveAlerts(): TrafficAlert[] {
    const saved = localStorage.getItem("smartroute_traffic_alerts");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return sampleTrafficAlerts;
  },
  addAlertDetail(alertId: string, detail: { note: string; author: string; timestamp: string }): TrafficAlert[] {
    const alerts = this.getLiveAlerts();
    const alert = alerts.find((a) => a.id === alertId);
    if (alert) {
      alert.additionalDetails = alert.additionalDetails || [];
      alert.additionalDetails.unshift(detail);
      localStorage.setItem("smartroute_traffic_alerts", JSON.stringify(alerts));
    }
    return [...alerts];
  },
  getSpeedCameras(): SpeedCamera[] {
    return sampleSpeedCameras;
  },
  getPoliceAlerts(): PolicePatrolAlert[] {
    return samplePoliceAlerts;
  },
  getTollGates(): TollGate[] {
    return sampleTollGates;
  },
};

export const weatherService = {
  getRouteWeather(city: string = "Coimbatore"): WeatherData {
    return sampleWeatherData;
  },
};

export const routeService = {
  getAvailableRoutes(origin: string, destination: string, prefs?: UserPreferences): RouteOption[] {
    let routes = [...sampleRoutes];
    if (prefs?.avoidTolls) {
      routes = routes.sort((a, b) => a.tollCostInr - b.tollCostInr);
    }
    return routes;
  },
};

export const placesService = {
  getNearbyServices(category?: string, query?: string): NearbyService[] {
    let results = sampleNearbyServices;
    if (category && category !== "all") {
      results = results.filter((s) => s.category === category);
    }
    if (query && query.trim()) {
      const q = query.toLowerCase();
      results = results.filter((s) => s.name.toLowerCase().includes(q) || s.address.toLowerCase().includes(q) || s.details.some(d => d.toLowerCase().includes(q)));
    }
    return results;
  },
};

export const roadConditionService = {
  getRoadIssues(): RoadIssueReport[] {
    const saved = localStorage.getItem("smartroute_road_issues");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return sampleRoadIssues;
  },
  submitIssueReport(report: Omit<RoadIssueReport, "id" | "reportedAt" | "upvotes" | "status">): RoadIssueReport {
    const current = this.getRoadIssues();
    const newReport: RoadIssueReport = {
      id: `rep_${Date.now()}`,
      ...report,
      reportedAt: "Just now",
      upvotes: 1,
      status: "Under Review",
    };
    const updated = [newReport, ...current];
    localStorage.setItem("smartroute_road_issues", JSON.stringify(updated));
    return newReport;
  },
  upvoteReport(id: string): RoadIssueReport[] {
    const current = this.getRoadIssues();
    const updated = current.map((r) => (r.id === id ? { ...r, upvotes: r.upvotes + 1 } : r));
    localStorage.setItem("smartroute_road_issues", JSON.stringify(updated));
    return updated;
  },
  addIssueDetail(issueId: string, detail: { note: string; author: string; timestamp: string }): RoadIssueReport[] {
    const issues = this.getRoadIssues();
    const issue = issues.find((i) => i.id === issueId);
    if (issue) {
      issue.additionalDetails = issue.additionalDetails || [];
      issue.additionalDetails.unshift(detail);
      localStorage.setItem("smartroute_road_issues", JSON.stringify(issues));
    }
    return [...issues];
  },
};

export const userService = {
  getProfile(): UserProfile {
    const saved = localStorage.getItem("smartroute_profile");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (!parsed.name || parsed.name === "Arjun Krishnan" || parsed.name === "Arjun") {
          parsed.name = "Abijith";
          parsed.email = "abijithprakash044@gmail.com";
        }
        // Filter out father and mother contacts
        if (parsed.emergencyContacts && Array.isArray(parsed.emergencyContacts)) {
          const filtered = parsed.emergencyContacts.filter(
            (c: EmergencyContact) =>
              !c.name.toLowerCase().includes("father") &&
              !c.name.toLowerCase().includes("mother") &&
              !c.name.toLowerCase().includes("prakash") &&
              !c.name.toLowerCase().includes("lakshmi") &&
              !c.relationship.toLowerCase().includes("parent")
          );
          if (filtered.length !== parsed.emergencyContacts.length) {
            parsed.emergencyContacts = filtered;
            localStorage.setItem("smartroute_profile", JSON.stringify(parsed));
          }
        }
        return parsed;
      } catch (e) {}
    }
    return initialUserProfile;
  },
  saveProfile(profile: UserProfile): void {
    localStorage.setItem("smartroute_profile", JSON.stringify(profile));
  },
  getPreferences(): UserPreferences {
    const saved = localStorage.getItem("smartroute_preferences");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return initialUserPreferences;
  },
  savePreferences(prefs: UserPreferences): void {
    localStorage.setItem("smartroute_preferences", JSON.stringify(prefs));
  },
  getSavedPlaces(): SavedPlace[] {
    const saved = localStorage.getItem("smartroute_saved_places");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const existingIds = new Set(parsed.map((p: any) => p.id));
          const missing = sampleSavedPlaces.filter((sp) => !existingIds.has(sp.id));
          if (missing.length > 0) {
            const merged = [...parsed, ...missing];
            localStorage.setItem("smartroute_saved_places", JSON.stringify(merged));
            return merged;
          }
          return parsed;
        }
      } catch (e) {}
    }
    return sampleSavedPlaces;
  },
  addSavedPlace(place: Omit<SavedPlace, "id">): SavedPlace[] {
    const current = this.getSavedPlaces();
    const newPlace: SavedPlace = { id: `sp_${Date.now()}`, ...place };
    const updated = [...current, newPlace];
    localStorage.setItem("smartroute_saved_places", JSON.stringify(updated));
    return updated;
  },
  deleteSavedPlace(id: string): SavedPlace[] {
    const current = this.getSavedPlaces();
    const updated = current.filter((p) => p.id !== id);
    localStorage.setItem("smartroute_saved_places", JSON.stringify(updated));
    return updated;
  },
  getTravelHistory(): TravelHistoryRecord[] {
    const saved = localStorage.getItem("smartroute_travel_history");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return sampleTravelHistory;
  },
  addTravelHistoryRecord(record: Omit<TravelHistoryRecord, "id">): TravelHistoryRecord[] {
    const current = this.getTravelHistory();
    const newRecord: TravelHistoryRecord = { id: `hist_${Date.now()}`, ...record };
    const updated = [newRecord, ...current];
    localStorage.setItem("smartroute_travel_history", JSON.stringify(updated));
    return updated;
  },
  clearAllUserData(): void {
    localStorage.removeItem("smartroute_road_issues");
    localStorage.removeItem("smartroute_profile");
    localStorage.removeItem("smartroute_preferences");
    localStorage.removeItem("smartroute_saved_places");
    localStorage.removeItem("smartroute_travel_history");
    localStorage.removeItem("smartroute_chat_history");
  },
};

export const notificationService = {
  getPendingAlerts() {
    return [
      {
        id: "notif_1",
        title: "🚨 Heavy Traffic Alert on Routine Corridor",
        message: "Sathy Road near Ganapathy is currently experiencing heavy congestion. Delay: ~10 minutes. An alternative via CODISSIA is open.",
        time: "5m ago",
        type: "traffic",
        actionText: "View Alternative Route",
      },
      {
        id: "notif_2",
        title: "🌧️ Weather Alert: Precipitation Ahead",
        message: "Light rain is falling across the northern tech corridor. Average travel speeds are reduced by ~14%.",
        time: "12m ago",
        type: "weather",
        actionText: "View Impact",
      },
    ];
  },
};

export const mapsService = {
  calculateDistanceKm(x1: number, y1: number, x2: number, y2: number): number {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.round(Math.sqrt(dx * dx + dy * dy) * 0.05 * 10) / 10;
  },
};

export { smartConnectService, PETROL_PRICE_PER_LITRE_INR } from "./smartConnectService";
export { liveApiService } from "./liveApiService";
