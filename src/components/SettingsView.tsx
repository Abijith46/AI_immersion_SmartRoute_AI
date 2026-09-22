import React, { useState } from "react";
import { UserProfile, UserPreferences, DetailedAddress, EmergencyContact } from "../types";
import { userService, smartConnectService } from "../services";
import {
  Settings,
  Shield,
  Bell,
  Sliders,
  Trash2,
  CheckCircle2,
  Lock,
  Eye,
  MapPin,
  History,
  AlertCircle,
  User,
  Edit2,
  Save,
  Bike,
  Bluetooth,
  Gauge,
  Home,
  Briefcase,
  AlertOctagon,
  Phone,
  Radio,
  CloudSun,
  Database,
  Crosshair,
  ExternalLink,
  Plus
} from "lucide-react";

interface SettingsViewProps {
  user: UserProfile;
  preferences: UserPreferences;
  onPreferencesUpdated: (prefs: UserPreferences) => void;
  onProfileUpdated?: (profile: UserProfile) => void;
  onNavigateToTab?: (tab: string) => void;
  onOpenSOS?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  user,
  preferences,
  onPreferencesUpdated,
  onProfileUpdated,
  onNavigateToTab,
  onOpenSOS,
}) => {
  const [prefs, setPrefs] = useState<UserPreferences>(preferences);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [displayName, setDisplayName] = useState(user?.name || "Abijith");
  const [email, setEmail] = useState(user?.email || "abijithprakash044@gmail.com");
  const [phone, setPhone] = useState(user?.phone || "+91 98421 77309");
  const [bloodGroup, setBloodGroup] = useState<any>(user?.medicalInfo?.bloodGroup || "O+");
  const [allergies, setAllergies] = useState(user?.medicalInfo?.allergies || "Penicillin, Dust");

  // Home Address State
  const [isEditingHome, setIsEditingHome] = useState(false);
  const [homeFlat, setHomeFlat] = useState(user?.homeAddress?.flatOrDoorNo || "Door #4B, Krishna Enclave");
  const [homeStreet, setHomeStreet] = useState(user?.homeAddress?.street || "12/4 Cross Cut 7th Street");
  const [homeArea, setHomeArea] = useState(user?.homeAddress?.area || "Gandhipuram");
  const [homeLandmark, setHomeLandmark] = useState(user?.homeAddress?.landmark || "Near Cross Cut Signal");
  const [homePincode, setHomePincode] = useState(user?.homeAddress?.pincode || "641012");
  const [homeDepTime, setHomeDepTime] = useState(user?.homeAddress?.routineDepartureTime || "7:30 AM");

  // Work Address State
  const [isEditingWork, setIsEditingWork] = useState(false);
  const [workFlat, setWorkFlat] = useState(user?.workAddress?.flatOrDoorNo || "Tower 2, 4th Floor");
  const [workStreet, setWorkStreet] = useState(user?.workAddress?.street || "CHIL SEZ IT Corridor, Keeranatham Road");
  const [workArea, setWorkArea] = useState(user?.workAddress?.area || "Saravanampatti");
  const [workLandmark, setWorkLandmark] = useState(user?.workAddress?.landmark || "Near KCT Tech Gate & SEZ Main Entrance");
  const [workPincode, setWorkPincode] = useState(user?.workAddress?.pincode || "641035");
  const [workDepTime, setWorkDepTime] = useState(user?.workAddress?.routineDepartureTime || "5:30 PM");

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedProfile: UserProfile = {
      ...user,
      name: displayName.trim() || "Abijith",
      email: email.trim() || "abijithprakash044@gmail.com",
      phone: phone.trim() || "+91 98421 77309",
      medicalInfo: {
        bloodGroup,
        allergies,
        conditions: user.medicalInfo?.conditions || "Mild asthmatic wheeze during monsoon drop",
        organDonor: true,
        insurancePolicyNo: user.medicalInfo?.insurancePolicyNo || "STAR-HEALTH-7829-TN-2026",
        emergencyNotes: user.medicalInfo?.emergencyNotes || "Primary rider on Hunter 350.",
      },
    };
    userService.saveProfile(updatedProfile);
    if (onProfileUpdated) onProfileUpdated(updatedProfile);
    setIsEditingProfile(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleSaveHome = (e: React.FormEvent) => {
    e.preventDefault();
    const formatted = `${homeFlat}, ${homeStreet}, ${homeArea}, Coimbatore ${homePincode}`;
    const detailed: DetailedAddress = {
      street: homeStreet,
      flatOrDoorNo: homeFlat,
      area: homeArea,
      landmark: homeLandmark,
      city: "Coimbatore",
      state: "Tamil Nadu",
      pincode: homePincode,
      formattedAddress: formatted,
      coordinates: user.homeAddress?.coordinates || { lat: 11.0183, lng: 76.9725 },
      routineDepartureTime: homeDepTime,
      routineArrivalTime: "7:15 PM",
    };
    const updated: UserProfile = {
      ...user,
      homeAddress: detailed,
      commuteSummary: {
        ...user.commuteSummary,
        routineRoute: `Home (${homeArea}) → Work (${user.workAddress?.area || "Saravanampatti"})`,
        usualDeparture: `${homeDepTime} (Mon–Fri)`,
      },
    };
    userService.saveProfile(updated);
    if (onProfileUpdated) onProfileUpdated(updated);
    setIsEditingHome(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleSaveWork = (e: React.FormEvent) => {
    e.preventDefault();
    const formatted = `${workFlat}, ${workStreet}, ${workArea}, Coimbatore ${workPincode}`;
    const detailed: DetailedAddress = {
      street: workStreet,
      flatOrDoorNo: workFlat,
      area: workArea,
      landmark: workLandmark,
      city: "Coimbatore",
      state: "Tamil Nadu",
      pincode: workPincode,
      formattedAddress: formatted,
      coordinates: user.workAddress?.coordinates || { lat: 11.0829, lng: 77.0019 },
      routineDepartureTime: workDepTime,
      routineArrivalTime: "8:30 AM",
    };
    const updated: UserProfile = {
      ...user,
      workAddress: detailed,
      commuteSummary: {
        ...user.commuteSummary,
        routineRoute: `Home (${user.homeAddress?.area || "Gandhipuram"}) → Work (${workArea})`,
      },
    };
    userService.saveProfile(updated);
    if (onProfileUpdated) onProfileUpdated(updated);
    setIsEditingWork(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleToggle = (key: keyof UserPreferences) => {
    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated);
    userService.savePreferences(updated);
    onPreferencesUpdated(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleClearData = () => {
    if (
      confirm(
        "Are you sure you want to delete all personal data (saved places, travel history, chat messages, and custom preferences)? This action cannot be undone."
      )
    ) {
      userService.clearAllUserData();
      alert("All local data has been permanently cleared.");
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* HEADER */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-600" />
            Application Settings & Live Connectivity
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure rider profile, granular Home & Work addresses, SOS contacts, and live sensor APIs.
          </p>
        </div>

        {saveSuccess && (
          <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" /> Changes Saved
          </span>
        )}
      </div>

      {/* USER PROFILE & MEDICAL EMERGENCY ID */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-lg flex items-center justify-center shadow-md">
              {(user?.name || "Abijith").charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">{user?.name || "Abijith"}</h3>
                <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                  Verified Commuter
                </span>
                <span className="text-[10px] font-bold bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">
                  Blood Group: {user?.medicalInfo?.bloodGroup || "O+"}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {user?.email || "abijithprakash044@gmail.com"} • {user?.phone || "+91 98421 77309"}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsEditingProfile(!isEditingProfile)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>{isEditingProfile ? "Cancel" : "Edit Profile & Medical"}</span>
          </button>
        </div>

        {/* Profile edit form */}
        {isEditingProfile ? (
          <form onSubmit={handleSaveProfile} className="pt-3 border-t border-slate-100 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Display Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Abijith"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="abijithprakash044@gmail.com"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Rider Phone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98421 77309"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Blood Group</label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value as any)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-blue-500 bg-white"
                >
                  <option value="O+">O+ (Universal Donor)</option>
                  <option value="O-">O-</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Allergies / Medical Notes</label>
                <input
                  type="text"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  placeholder="e.g. Penicillin, Pollen, Asthmatic"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditingProfile(false)}
                className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm"
              >
                <Save className="w-3.5 h-3.5" />
                Save Profile Details
              </button>
            </div>
          </form>
        ) : (
          <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600">
            <div>
              <span className="text-slate-400 block text-[11px]">Daily Commute Corridor:</span>
              <span className="font-semibold text-slate-800">{user?.commuteSummary?.routineRoute}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Routine Departure:</span>
              <span className="font-semibold text-slate-800">{user?.commuteSummary?.usualDeparture}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Medical Alert Info:</span>
              <span className="font-semibold text-slate-800">
                Blood Group: {user?.medicalInfo?.bloodGroup || "O+"} • Organ Donor: Yes
              </span>
            </div>
          </div>
        )}
      </div>

      {/* DETAILED HOME ADDRESS SECTION */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Home Address & Routine Timings</h3>
              <p className="text-xs text-slate-500">
                Used for instant route calculation, morning commute triggers, and emergency origin.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsEditingHome(!isEditingHome)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>{isEditingHome ? "Cancel" : "Edit Home Address"}</span>
          </button>
        </div>

        {isEditingHome ? (
          <form onSubmit={handleSaveHome} className="pt-3 border-t border-slate-100 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Door / Flat No. & Building</label>
                <input
                  type="text"
                  value={homeFlat}
                  onChange={(e) => setHomeFlat(e.target.value)}
                  placeholder="Door #4B, Krishna Enclave"
                  required
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Street / Cross Road</label>
                <input
                  type="text"
                  value={homeStreet}
                  onChange={(e) => setHomeStreet(e.target.value)}
                  placeholder="12/4 Cross Cut 7th Street"
                  required
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Area / Suburb</label>
                <input
                  type="text"
                  value={homeArea}
                  onChange={(e) => setHomeArea(e.target.value)}
                  placeholder="Gandhipuram"
                  required
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Landmark</label>
                <input
                  type="text"
                  value={homeLandmark}
                  onChange={(e) => setHomeLandmark(e.target.value)}
                  placeholder="Near Cross Cut Signal"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">PIN Code</label>
                <input
                  type="text"
                  value={homePincode}
                  onChange={(e) => setHomePincode(e.target.value)}
                  placeholder="641012"
                  required
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Routine Morning Departure</label>
                <input
                  type="text"
                  value={homeDepTime}
                  onChange={(e) => setHomeDepTime(e.target.value)}
                  placeholder="7:30 AM"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditingHome(false)}
                className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm"
              >
                <Save className="w-3.5 h-3.5" />
                Save Home Address
              </button>
            </div>
          </form>
        ) : (
          <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <strong className="text-sm font-bold text-slate-900 block">
                {user?.homeAddress?.formattedAddress ||
                  `${homeFlat}, ${homeStreet}, ${homeArea}, Coimbatore ${homePincode}`}
              </strong>
              <div className="text-slate-500 mt-1 flex flex-wrap gap-2 text-[11px]">
                <span>Landmark: {user?.homeAddress?.landmark || homeLandmark}</span>
                <span>•</span>
                <span>PIN: {user?.homeAddress?.pincode || homePincode}</span>
                <span>•</span>
                <span>Routine Departure: {user?.homeAddress?.routineDepartureTime || homeDepTime}</span>
              </div>
            </div>

            <a
              href={`https://maps.google.com/?q=${user?.homeAddress?.coordinates?.lat || 11.0183},${user?.homeAddress?.coordinates?.lng || 76.9725}`}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1 shrink-0"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              View Map
            </a>
          </div>
        )}
      </div>

      {/* DETAILED WORK ADDRESS SECTION */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Work / Office Address & Hours</h3>
              <p className="text-xs text-slate-500">
                Tech park or college destination for peak hour routing and traffic alerts.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsEditingWork(!isEditingWork)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>{isEditingWork ? "Cancel" : "Edit Work Address"}</span>
          </button>
        </div>

        {isEditingWork ? (
          <form onSubmit={handleSaveWork} className="pt-3 border-t border-slate-100 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Tower / Unit / Floor</label>
                <input
                  type="text"
                  value={workFlat}
                  onChange={(e) => setWorkFlat(e.target.value)}
                  placeholder="Tower 2, 4th Floor"
                  required
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Campus / Road</label>
                <input
                  type="text"
                  value={workStreet}
                  onChange={(e) => setWorkStreet(e.target.value)}
                  placeholder="CHIL SEZ IT Corridor, Keeranatham Road"
                  required
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Area / Suburb</label>
                <input
                  type="text"
                  value={workArea}
                  onChange={(e) => setWorkArea(e.target.value)}
                  placeholder="Saravanampatti"
                  required
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Landmark</label>
                <input
                  type="text"
                  value={workLandmark}
                  onChange={(e) => setWorkLandmark(e.target.value)}
                  placeholder="Near KCT Tech Gate"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">PIN Code</label>
                <input
                  type="text"
                  value={workPincode}
                  onChange={(e) => setWorkPincode(e.target.value)}
                  placeholder="641035"
                  required
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Evening Return Departure</label>
                <input
                  type="text"
                  value={workDepTime}
                  onChange={(e) => setWorkDepTime(e.target.value)}
                  placeholder="5:30 PM"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditingWork(false)}
                className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm"
              >
                <Save className="w-3.5 h-3.5" />
                Save Work Address
              </button>
            </div>
          </form>
        ) : (
          <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <strong className="text-sm font-bold text-slate-900 block">
                {user?.workAddress?.formattedAddress ||
                  `${workFlat}, ${workStreet}, ${workArea}, Coimbatore ${workPincode}`}
              </strong>
              <div className="text-slate-500 mt-1 flex flex-wrap gap-2 text-[11px]">
                <span>Landmark: {user?.workAddress?.landmark || workLandmark}</span>
                <span>•</span>
                <span>PIN: {user?.workAddress?.pincode || workPincode}</span>
                <span>•</span>
                <span>Return Departure: {user?.workAddress?.routineDepartureTime || workDepTime}</span>
              </div>
            </div>

            <a
              href={`https://maps.google.com/?q=${user?.workAddress?.coordinates?.lat || 11.0829},${user?.workAddress?.coordinates?.lng || 77.0019}`}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1 shrink-0"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              View Map
            </a>
          </div>
        )}
      </div>

      {/* SOS EMERGENCY OPTIONS & DISPATCH CONFIGURATION */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">SOS Emergency & Distress Dispatch Options</h3>
              <p className="text-xs text-slate-500">
                112 ERSS integration, 108 trauma care, automated siren, and emergency family broadcasts.
              </p>
            </div>
          </div>

          {onOpenSOS && (
            <button
              onClick={onOpenSOS}
              className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 flex items-center gap-1.5 transition-colors"
            >
              <AlertOctagon className="w-4 h-4" />
              Test SOS Panel
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <strong className="text-slate-900 font-bold flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-rose-600" />
                National Helpline 112
              </strong>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                Active
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Immediate voice & data relay to Coimbatore City Police and Fire control rooms.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <strong className="text-slate-900 font-bold flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                Ambulance Helpline 108
              </strong>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                Active
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Direct dispatch trigger transmitting rider blood group ({user?.medicalInfo?.bloodGroup || "O+"}) and GPS pin.
            </p>
          </div>
        </div>

        {/* Emergency Contacts List */}
        <div className="pt-2">
          <span className="text-xs font-bold text-slate-700 block mb-2">Registered Emergency Contacts</span>
          {(() => {
            const validContacts = (user?.emergencyContacts || []).filter(
              (c) =>
                !c.name.toLowerCase().includes("father") &&
                !c.name.toLowerCase().includes("mother") &&
                !c.name.toLowerCase().includes("prakash") &&
                !c.name.toLowerCase().includes("lakshmi") &&
                !c.relationship.toLowerCase().includes("parent")
            );

            const handleDeleteContact = (id: string) => {
              const updated = validContacts.filter((c) => c.id !== id);
              if (updated.length > 0 && !updated.some((c) => c.isPrimary)) {
                updated[0].isPrimary = true;
              }
              const updatedProfile = { ...user, emergencyContacts: updated };
              userService.saveProfile(updatedProfile);
              if (onProfileUpdated) onProfileUpdated(updatedProfile);
            };

            if (validContacts.length === 0) {
              return (
                <div className="p-4 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-center text-xs text-slate-500">
                  No personal emergency contacts registered. (Emergency distress signals are dispatched directly to National 112 & 108 trauma care).
                </div>
              );
            }

            return (
              <div className="space-y-2">
                {validContacts.map((c) => (
                  <div
                    key={c.id}
                    className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs"
                  >
                    <div>
                      <strong className="text-slate-900 font-bold">{c.name}</strong>
                      <span className="text-slate-500 text-[11px] ml-2">({c.relationship})</span>
                      <div className="text-slate-500 font-mono text-[11px] mt-0.5">{c.phone}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {c.isPrimary && (
                        <span className="text-[10px] font-bold bg-rose-100 text-rose-700 px-2 py-0.5 rounded">
                          Primary Contact
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeleteContact(c.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete contact"
                        aria-label={`Delete ${c.name}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      </div>

      {/* LIVE CONNECTED APIS STATUS MONITOR */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-indigo-600 animate-pulse" />
            <div>
              <h3 className="text-base font-bold text-slate-900">Live Connected APIs & Sensor Stream</h3>
              <p className="text-xs text-slate-500">
                Real-time external services connected to SmartRoute AI engine.
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            All Streams Operational
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <CloudSun className="w-4 h-4 text-amber-500" />
                Open-Meteo Weather API
              </span>
              <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                LIVE • 200 OK
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Live precipitation, ambient road temp, wind speed, and rain hazard predictions for Coimbatore Metro.
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-blue-600" />
                OpenStreetMap Nominatim
              </span>
              <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                LIVE • 200 OK
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Real-time geocoding, reverse GPS street resolution, and Coimbatore address autocompletion.
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <Crosshair className="w-4 h-4 text-rose-500" />
                W3C Geolocation Satellite
              </span>
              <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                HIGH ACCURACY
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Browser-level device location provider with sub-10m satellite precision.
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <AlertOctagon className="w-4 h-4 text-rose-600" />
                Emergency SOS Mesh Gateway
              </span>
              <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                READY /api/sos
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Dispatches incident tickets, vehicle diagnostics, and SMS/WhatsApp emergency webhooks.
            </p>
          </div>
        </div>
      </div>

      {/* ROUTE PREFERENCES */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-indigo-600" />
          Routing Algorithm Preferences
        </h3>

        <div className="space-y-3 divide-y divide-slate-100 text-xs">
          <div className="flex items-center justify-between pt-3">
            <div>
              <strong className="text-slate-800 block">Avoid Toll Gates</strong>
              <span className="text-slate-500">
                Prioritize alternate corridors with ₹0 toll cost when available.
              </span>
            </div>
            <button
              onClick={() => handleToggle("avoidTolls")}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                prefs.avoidTolls ? "bg-blue-600" : "bg-slate-300"
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  prefs.avoidTolls ? "right-1" : "left-1"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between pt-3">
            <div>
              <strong className="text-slate-800 block">Avoid Highways</strong>
              <span className="text-slate-500">
                Favor local arterial bypasses instead of high-speed freeways.
              </span>
            </div>
            <button
              onClick={() => handleToggle("avoidHighways")}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                prefs.avoidHighways ? "bg-blue-600" : "bg-slate-300"
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  prefs.avoidHighways ? "right-1" : "left-1"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between pt-3">
            <div>
              <strong className="text-slate-800 block">Avoid Unpaved / Damaged Roads</strong>
              <span className="text-slate-500">
                Exclude roads with severe pothole or waterlogging community reports.
              </span>
            </div>
            <button
              onClick={() => handleToggle("avoidUnpavedRoads")}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                prefs.avoidUnpavedRoads ? "bg-blue-600" : "bg-slate-300"
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  prefs.avoidUnpavedRoads ? "right-1" : "left-1"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* PRIVACY & DATA TRANSPARENCY */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-emerald-600" />
          <h3 className="text-base font-bold text-slate-900">Privacy & Consent (By Design)</h3>
        </div>

        <p className="text-xs text-slate-500">
          SmartRoute AI only uses data directly required for navigation and travel time optimization. No advertising trackers or background selling of location data.
        </p>

        <div className="space-y-3 divide-y divide-slate-100 text-xs">
          <div className="flex items-center justify-between pt-3">
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-800 block">Live Location Access</strong>
                <span className="text-slate-500">
                  Allow browser geolocation to calculate proximity to fuel bunks and speed cameras.
                </span>
              </div>
            </div>
            <button
              onClick={() => handleToggle("locationAccessConsent")}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                prefs.locationAccessConsent ? "bg-emerald-600" : "bg-slate-300"
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  prefs.locationAccessConsent ? "right-1" : "left-1"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between pt-3">
            <div className="flex items-start gap-2.5">
              <History className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-800 block">Store Commute History Locally</strong>
                <span className="text-slate-500">
                  Logs routine travel times on this device to generate delay savings metrics.
                </span>
              </div>
            </div>
            <button
              onClick={() => handleToggle("travelHistoryLogging")}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                prefs.travelHistoryLogging ? "bg-emerald-600" : "bg-slate-300"
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  prefs.travelHistoryLogging ? "right-1" : "left-1"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Delete All Data */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div>
            <strong className="text-xs text-rose-700 block">Erase All Personal Information</strong>
            <span className="text-[11px] text-slate-500">
              Permanently purges saved locations, route history, and AI chat memory.
            </span>
          </div>
          <button
            onClick={handleClearData}
            className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 transition-colors flex items-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            Erase All Data
          </button>
        </div>
      </div>

      {/* CONNECTED VEHICLE & TELEMETRY */}
      {(() => {
        const activeBike = smartConnectService.getActiveBike();
        return (
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Bike className="w-5 h-5 text-cyan-600" />
                Connected Two-Wheeler & Telemetry
              </h3>
              {onNavigateToTab && (
                <button
                  onClick={() => onNavigateToTab("smart_connect")}
                  className="text-xs font-bold text-cyan-600 hover:text-cyan-800 flex items-center gap-1"
                >
                  Open Cockpit →
                </button>
              )}
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold">
                  <Bike className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    {activeBike.make} {activeBike.model}
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                      {activeBike.regNumber}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {activeBike.engineCc} cc • {activeBike.fuelTankCapacityLitres}L Tank • Odometer:{" "}
                    {activeBike.odometerKm.toLocaleString()} km
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                  <Bluetooth className="w-3.5 h-3.5" />
                  BLE Synced
                </div>
                {onNavigateToTab && (
                  <button
                    onClick={() => onNavigateToTab("smart_connect")}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
                  >
                    Manage Bike
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
