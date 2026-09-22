export type DataSourceType = "live" | "historical" | "prediction" | "demo" | "live_sensor";

export type CongestionLevel = "low" | "moderate" | "heavy" | "severe";

export interface DataMetadata {
  sourceType: DataSourceType;
  provider: string;
  lastUpdated: string;
  confidence?: number; // 0 - 100%
  isLive: boolean;
}

export interface Coordinates {
  lat: number;
  lng: number;
  x?: number; // canvas / SVG projected coordinate
  y?: number;
}

export interface RouteSegment {
  id: string;
  name: string;
  distanceKm: number;
  durationMin: number;
  congestion: CongestionLevel;
  speedLimitKmh?: number | null;
  speedLimitUnavailable?: boolean;
  roadCondition: "good" | "moderate" | "poor" | "construction" | "waterlogging" | "accident";
  coordinates: [number, number][];
}

export interface RouteOption {
  id: string;
  title: string;
  origin?: string;
  destination?: string;
  type: "fastest" | "alternative" | "low_toll" | "balanced";
  summary: string;
  distanceKm: number;
  durationMin: number;
  typicalDurationMin: number;
  delayMin: number;
  congestionLevel: CongestionLevel;
  tollCount: number;
  tollCostInr: number;
  trafficSignalsCount: number;
  weatherImpactMin: number;
  weatherImpactReason: string;
  confidence: number;
  badge: string;
  isAiRecommended: boolean;
  segments: RouteSegment[];
  description: string;
  dataQuality: DataMetadata;
}

export interface TrafficAlert {
  id: string;
  title: string;
  type: "accident" | "road_closure" | "construction" | "waterlogging" | "pothole" | "congestion" | "other";
  severity: "low" | "medium" | "high" | "critical";
  location: string;
  coordinates: Coordinates;
  reportedTime: string;
  expectedResolution: string;
  description: string;
  source: string;
  confidence: number;
  affectedRouteIds: string[];
  dataQuality: DataMetadata;
  additionalDetails?: { note: string; author: string; timestamp: string }[];
}

export interface SpeedCamera {
  id: string;
  location: string;
  coordinates: Coordinates;
  speedLimitKmh: number;
  cameraType: "Fixed Radar" | "Point-to-Point Average" | "Mobile Laser" | "Red-Light Speed";
  direction: "Both directions" | "Northbound" | "Southbound" | "Eastbound" | "Westbound";
  lastUpdated: string;
  dataSource: string;
  confidence: number;
  dataQuality: DataMetadata;
}

export interface PolicePatrolAlert {
  id: string;
  title: string;
  location: string;
  coordinates: Coordinates;
  alertType: "Traffic Enforcement Checkpoint" | "Official Traffic Announcement" | "Diversion Patrol" | "Speed Interceptor Check";
  isLivePatrolAvailable: boolean;
  notes: string;
  authority: string;
  lastUpdated: string;
  dataQuality: DataMetadata;
}

export interface TollGate {
  id: string;
  name: string;
  location: string;
  distanceAheadKm: number;
  coordinates: Coordinates;
  costInr: number;
  acceptedPayments: string[];
  fastagEnabled: boolean;
  averageWaitTimeMin: number;
  alternativeNonTollAvailable: boolean;
  routeImpact: string;
  dataQuality: DataMetadata;
}

export interface NearbyService {
  id: string;
  category:
    | "fuel"
    | "restaurant"
    | "mechanic"
    | "police"
    | "hospital"
    | "parking"
    | "ev_charging"
    | "rest_area"
    | "atm"
    | "transit"
    | "shopping"
    | "it_park"
    | "college"
    | "leisure"
    | "temple";
  name: string;
  address: string;
  distanceKm: number;
  distanceFromOriginKm?: number;
  rating?: number;
  isOpen: boolean;
  openHours: string;
  coordinates: Coordinates;
  contactNumber?: string;
  details: string[];
  emergencyAvailable?: boolean;
  dataQuality: DataMetadata;
}

export interface WeatherData {
  city: string;
  temperatureC: number;
  condition: string;
  conditionIcon: string;
  rainProbability: number;
  rainfallMm: number;
  windSpeedKmh: number;
  visibilityKm: number;
  humidityPercent: number;
  weatherAlert?: string;
  trafficImpact: {
    level: "None" | "Low" | "Moderate" | "Severe";
    expectedDelayMinutes: number;
    reason: string;
  };
  dataQuality: DataMetadata;
}

export interface TrafficPredictionStep {
  timeLabel: string;
  minutesFromNow: number;
  congestionIndex: number; // 0 - 100
  status: CongestionLevel;
  estimatedTravelTimeMin: number;
  expectedSpeedKmh: number;
  confidence: number;
}

export interface TrafficPrediction {
  routeSummary: string;
  nowCongestion: CongestionLevel;
  clearingTimeEstimate: string;
  clearingConfidence: number;
  series: TrafficPredictionStep[];
  predictionFactors: {
    name: string;
    impact: string;
    trend: "improving" | "worsening" | "neutral";
    description: string;
  }[];
  aiReasoning: string;
  disclaimer: string;
  dataQuality: DataMetadata;
}

export interface RoadIssueReport {
  id: string;
  category: "Pothole" | "Accident" | "Waterlogging" | "Road Closed" | "Construction" | "Other";
  location: string;
  description: string;
  reportedAt: string;
  reportedBy: string;
  upvotes: number;
  status: "Under Review" | "Verified by Traffic Police" | "Work in Progress" | "Resolved";
  coordinates?: Coordinates;
  additionalDetails?: { note: string; author: string; timestamp: string }[];
}

export interface UserPreferences {
  avoidTolls: boolean;
  avoidHighways: boolean;
  avoidUnpavedRoads?: boolean;
  priority: "fastest" | "least_congestion" | "low_cost" | "scenic";
  travelMode: "car" | "motorcycle" | "ev" | "commercial";
  enablePersonalization: boolean;
  enableTravelHistory: boolean;
  allowLocationAccess: boolean;
  locationAccessConsent?: boolean;
  travelHistoryLogging?: boolean;
  notificationsTraffic: boolean;
  notificationsWeather: boolean;
  notifyTrafficSpikes?: boolean;
  notifyWeatherDelays?: boolean;
  notifySpeedCameras?: boolean;
  speedAlertThresholdKmh: number;
}

export interface DetailedAddress {
  street: string;
  flatOrDoorNo?: string;
  area: string; // e.g. "Gandhipuram", "Saravanampatti", "Peelamedu"
  landmark?: string;
  city: string; // "Coimbatore"
  state: string; // "Tamil Nadu"
  pincode: string; // "641012"
  formattedAddress: string;
  coordinates: Coordinates;
  routineDepartureTime?: string; // e.g. "7:30 AM"
  routineArrivalTime?: string; // e.g. "6:30 PM"
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string; // "Parent" | "Spouse" | "Sibling" | "Friend" | "Doctor" | "Colleague"
  phone: string;
  isPrimary: boolean;
}

export interface MedicalEmergencyInfo {
  bloodGroup: "A+" | "A-" | "B+" | "B-" | "O+" | "O-" | "AB+" | "AB-" | "Unknown";
  allergies: string;
  conditions: string;
  organDonor: boolean;
  insurancePolicyNo?: string;
  emergencyNotes?: string;
}

export interface SOSIncidentReport {
  incidentId: string;
  timestamp: string;
  status: "DISPATCHED" | "ACKNOWLEDGED" | "RESOLVED" | "CANCELLED";
  location: {
    lat: number;
    lng: number;
    address: string;
    accuracyMeters?: number;
  };
  rider: {
    name: string;
    phone: string;
    bloodGroup: string;
    bikeModel: string;
    regNumber: string;
    speedKmh: number;
  };
  notifiedServices: string[];
  emergencyContactsNotified: string[];
  dispatchNotes: string;
}

export interface SavedPlace {
  id: string;
  label: "Home" | "Work" | "College" | "Favorite" | string;
  customName?: string;
  category?: string;
  address: string;
  detailedAddress?: DetailedAddress;
  coordinates?: Coordinates;
  frequentlyVisitedHours?: string;
}

export interface TravelHistoryRecord {
  id: string;
  date: string;
  origin: string;
  destination: string;
  distanceKm: number;
  actualDurationMin: number;
  predictedDurationMin?: number;
  durationMin?: number;
  delayAvoidedMin: number;
  averageSpeedKmh?: number;
  fuelBurnedLitres?: number;
  tollPaidInr?: number;
  delayEncounteredMin?: number;
  notes?: string;
  fuelSavedLitres?: number;
  routeChosen?: string;
  routeUsed?: string;
  weatherCondition?: string;
  tollSpentInr?: number;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "assistant" | "system";
  text: string;
  timestamp: string;
  suggestedPrompts?: string[];
  mode?: "live_gemini" | "demo_fallback" | "error_fallback" | string;
  confidence?: string;
  metadata?: {
    routeReference?: string;
    facilityType?: string;
    confidence?: string;
  };
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  memberSince: string;
  homeAddress?: DetailedAddress;
  workAddress?: DetailedAddress;
  emergencyContacts?: EmergencyContact[];
  medicalInfo?: MedicalEmergencyInfo;
  commuteSummary: {
    routineRoute: string;
    usualDeparture: string;
    usualTravelTimeMin: number;
    currentEstimatedTimeMin: number;
    alternativeAvailable: boolean;
    alternativeTimeMin: number;
  };
}

// -------------------------------------------------------------
// SMART CONNECT & VEHICLE TELEMETRY TYPES
// -------------------------------------------------------------

export interface TyrePressureData {
  frontPsi: number;
  rearPsi: number;
  targetFrontPsi: number;
  targetRearPsi: number;
  frontStatus: "optimal" | "low" | "high";
  rearStatus: "optimal" | "low" | "high";
  frontTempC: number;
  rearTempC: number;
}

export interface BikeDetails {
  id: string;
  nickname: string;
  make: string; // e.g. "Royal Enfield", "TVS", "Yamaha", "KTM", "Ather", "Honda"
  model: string; // e.g. "Hunter 350 Dapper Ash"
  type: "motorcycle" | "scooter" | "electric_bike" | "car";
  regNumber: string; // e.g. "TN 37 CK 4829"
  vinNumber: string;
  year: number;
  engineCc: number;
  fuelType: "petrol" | "electric" | "diesel";
  fuelTankCapacityLitres: number;
  batteryVoltage: number; // e.g. 12.6
  batteryHealthPercent: number; // e.g. 96
  odometerKm: number;
  engineOilHealthPercent: number;
  nextServiceDueKm: number;
  nextServiceDueDate: string;
  tyrePressure: TyrePressureData;
  coolantTempC: number;
  insuranceExpiry: string;
  pucExpiry: string;
  rcStatus: "Active & Verified" | "Expiring Soon";
  bluetoothDeviceId?: string;
}

export interface SmartConnectDevice {
  id: string;
  name: string;
  protocol: "Bluetooth 5.2 BLE" | "OBD-II CAN Bus" | "WiFi IoT Telemetry";
  macAddress: string;
  signalDbm: number; // -30 (strong) to -90 (weak)
  firmwareVersion: string;
  isConnected: boolean;
  isPairing: boolean;
  autoConnect: boolean;
  batteryPercent: number;
  lastSynced: string;
}

export interface LiveVehicleTelemetry {
  currentSpeedKmh: number;
  topSpeedKmh: number;
  avgSpeedKmh: number;
  currentRpm: number;
  maxRpm: number;
  currentGear: number | "N";
  leanAngleDeg: number; // negative = left, positive = right
  maxLeanAngle: { left: number; right: number };
  fuelLevelPercent: number;
  fuelRemainingLitres: number;
  distanceToEmptyKm: number;
  instantFuelEfficiencyKmpl: number; // km/L
  tripAvgFuelEfficiencyKmpl: number;
  ecoScore: number; // 0 - 100
  tripDistanceKm: number;
  tripDurationMin: number;
  tripCostInr: number;
  fuelSavedLitres: number;
  harshBrakingCount: number;
  rapidAccelerationCount: number;
  engineKillSwitch: boolean;
  sideStandSensor: boolean; // true = down (hazard warning)
  absActive: boolean;
  headlampBeam: "low" | "high";
  ridingMode: "Eco" | "City" | "Sport" | "Rain";
  engineTempC: number;
}

export interface BikeServiceRecord {
  id: string;
  date: string;
  odometerKm: number;
  serviceType: "Periodic Maintenance" | "Free Service" | "Oil & Filter Change" | "Brake Overhaul" | "Tyre Replacement";
  center: string;
  costInr: number;
  notes: string;
  status: "Completed" | "Upcoming";
}
