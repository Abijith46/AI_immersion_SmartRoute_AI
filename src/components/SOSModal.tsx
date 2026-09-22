import React, { useState, useEffect, useRef } from "react";
import {
  AlertOctagon,
  Phone,
  MessageSquare,
  MapPin,
  Shield,
  Heart,
  User,
  X,
  Volume2,
  VolumeX,
  Copy,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Send,
  Navigation,
  Activity,
  Bike,
  Trash2
} from "lucide-react";
import { UserProfile, EmergencyContact, SOSIncidentReport } from "../types";
import { liveApiService, smartConnectService, userService } from "../services";

interface SOSModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onProfileUpdated?: (profile: UserProfile) => void;
  onSelectRoute?: (origin: string, destination: string) => void;
}

export const SOSModal: React.FC<SOSModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onProfileUpdated,
  onSelectRoute,
}) => {
  const [countdown, setCountdown] = useState<number>(10);
  const [isCountingDown, setIsCountingDown] = useState<boolean>(true);
  const [isDispatched, setIsDispatched] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Live Location State
  const [currentLat, setCurrentLat] = useState<number>(11.0183);
  const [currentLng, setCurrentLng] = useState<number>(76.9725);
  const [currentAddress, setCurrentAddress] = useState<string>("Gandhipuram Cross Cut Road, Coimbatore");
  const [gpsAccuracy, setGpsAccuracy] = useState<number>(8);
  const [isLoadingGps, setIsLoadingGps] = useState<boolean>(false);

  // Active Dispatched Incident
  const [incident, setIncident] = useState<SOSIncidentReport | null>(null);

  // Contacts (Excludes father and mother contacts as requested)
  const filterContacts = (rawList?: EmergencyContact[]) => {
    return (rawList || []).filter(
      (c) =>
        !c.name.toLowerCase().includes("father") &&
        !c.name.toLowerCase().includes("mother") &&
        !c.name.toLowerCase().includes("prakash") &&
        !c.name.toLowerCase().includes("lakshmi") &&
        !c.relationship.toLowerCase().includes("parent")
    );
  };

  const [contacts, setContacts] = useState<EmergencyContact[]>(() =>
    filterContacts(
      userProfile.emergencyContacts || [
        { id: "ec_1", name: "Karthik (Riding Partner)", relationship: "Friend", phone: "+91 98940 55123", isPrimary: true },
      ]
    )
  );

  // Keep contacts in sync if userProfile changes
  useEffect(() => {
    if (userProfile.emergencyContacts) {
      setContacts(filterContacts(userProfile.emergencyContacts));
    }
  }, [userProfile.emergencyContacts]);
  const [showAddContact, setShowAddContact] = useState<boolean>(false);
  const [newContactName, setNewContactName] = useState<string>("");
  const [newContactPhone, setNewContactPhone] = useState<string>("");
  const [newContactRel, setNewContactRel] = useState<string>("Parent");

  // Audio Context Ref for Synthesized Emergency Siren Beep
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Telemetry Snapshot
  const telemetry = smartConnectService.getTelemetry();
  const bike = smartConnectService.getActiveBike();

  // Load real browser GPS location on modal open
  useEffect(() => {
    if (isOpen) {
      setCountdown(10);
      setIsCountingDown(true);
      setIsDispatched(false);
      setIsLoadingGps(true);

      liveApiService
        .getCurrentGpsPosition()
        .then((res) => {
          setCurrentLat(res.lat);
          setCurrentLng(res.lng);
          setGpsAccuracy(res.accuracy);
          if (res.address?.formattedAddress) {
            setCurrentAddress(res.address.formattedAddress);
          }
        })
        .finally(() => {
          setIsLoadingGps(false);
        });
    } else {
      stopSirenSound();
    }
  }, [isOpen]);

  // Audio Siren Player via Web Audio API
  const playSirenBeep = () => {
    if (!soundEnabled || typeof window === "undefined") return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (e) {
      console.warn("AudioContext siren error:", e);
    }
  };

  const stopSirenSound = () => {
    if (audioCtxRef.current) {
      try {
        audioCtxRef.current.close();
      } catch {}
      audioCtxRef.current = null;
    }
  };

  // Countdown timer
  useEffect(() => {
    if (!isOpen || !isCountingDown) return;

    if (countdown > 0) {
      playSirenBeep();
      const timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      triggerSOSDispatch();
    }
  }, [isOpen, isCountingDown, countdown]);

  const triggerSOSDispatch = async () => {
    setIsCountingDown(false);
    setIsDispatched(true);

    const newIncident = await liveApiService.broadcastSOS({
      location: {
        lat: currentLat,
        lng: currentLng,
        address: currentAddress,
        accuracyMeters: gpsAccuracy,
      },
      rider: {
        name: userProfile.name || "Abijith",
        phone: userProfile.phone || "+91 98421 77309",
        bloodGroup: userProfile.medicalInfo?.bloodGroup || "O+",
        bikeModel: `${bike.make} ${bike.model}`,
        regNumber: bike.regNumber,
        speedKmh: telemetry.currentSpeedKmh,
      },
      emergencyContactsNotified: contacts.map((c) => `${c.name} (${c.phone})`),
      dispatchNotes: `Automated distress dispatch sent. Rider is stationary at ${currentAddress}.`,
    });

    setIncident(newIncident);
  };

  const cancelCountdown = () => {
    setIsCountingDown(false);
    stopSirenSound();
  };

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName.trim() || !newContactPhone.trim()) return;

    const updated: EmergencyContact[] = [
      ...contacts,
      {
        id: `ec_${Date.now()}`,
        name: newContactName.trim(),
        phone: newContactPhone.trim(),
        relationship: newContactRel,
        isPrimary: contacts.length === 0,
      },
    ];

    setContacts(updated);
    const updatedProfile: UserProfile = { ...userProfile, emergencyContacts: updated };
    userService.saveProfile(updatedProfile);
    if (onProfileUpdated) onProfileUpdated(updatedProfile);

    setNewContactName("");
    setNewContactPhone("");
    setShowAddContact(false);
  };

  const handleDeleteContact = (id: string) => {
    const updated = contacts.filter((c) => c.id !== id);
    if (updated.length > 0 && !updated.some((c) => c.isPrimary)) {
      updated[0].isPrimary = true;
    }
    setContacts(updated);
    const updatedProfile: UserProfile = { ...userProfile, emergencyContacts: updated };
    userService.saveProfile(updatedProfile);
    if (onProfileUpdated) onProfileUpdated(updatedProfile);
  };

  const copyMapsLink = () => {
    const url = `https://www.google.com/maps?q=${currentLat},${currentLng}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-rose-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* EMERGENCY HEADER BANNER */}
        <div className="bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 text-white p-5 flex items-center justify-between shrink-0 relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />

          <div className="flex items-center gap-3 z-10">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 ring-2 ring-white/30 animate-pulse">
              <AlertOctagon className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded-md">
                  EMERGENCY SOS HELP
                </span>
                <span className="text-xs font-bold text-rose-100">Coimbatore Metro</span>
              </div>
              <h2 className="text-xl font-black text-white mt-0.5 leading-tight">
                Rapid Distress & Emergency Response
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 z-10">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
              title={soundEnabled ? "Mute Siren" : "Unmute Siren"}
            >
              {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
            <button
              onClick={() => {
                stopSirenSound();
                onClose();
              }}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* SCROLLABLE BODY */}
        <div className="p-5 overflow-y-auto space-y-5 text-slate-800">
          {/* 1. COUNTDOWN / DISPATCH BANNER */}
          {isCountingDown ? (
            <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-4 text-center space-y-3 animate-in fade-in">
              <div className="flex items-center justify-center gap-2 text-rose-700 font-bold text-xs uppercase tracking-wider">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
                Auto-Dispatching Emergency Broadcast In
              </div>

              <div className="text-5xl font-black text-rose-600 font-mono tracking-tight">
                00:{countdown < 10 ? `0${countdown}` : countdown}
              </div>

              <p className="text-xs text-slate-600 max-w-md mx-auto">
                Distress notification will transmit your live GPS coordinates, vehicle telemetry, and medical ID to
                police control and emergency contacts.
              </p>

              <div className="flex items-center justify-center gap-3 pt-1">
                <button
                  onClick={cancelCountdown}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs shadow-sm transition-all"
                >
                  Cancel Auto-Alert
                </button>
                <button
                  onClick={triggerSOSDispatch}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-lg shadow-rose-600/30 transition-all flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Dispatch SOS Now
                </button>
              </div>
            </div>
          ) : isDispatched ? (
            <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 flex items-start gap-3 animate-in fade-in">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase text-emerald-800 tracking-wider">
                    Emergency Broadcast Transmitted
                  </span>
                  {incident?.incidentId && (
                    <span className="text-[10px] font-mono font-bold bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded">
                      {incident.incidentId}
                    </span>
                  )}
                </div>
                <p className="text-xs text-emerald-700">
                  Transmitted to <strong>112 ERSS</strong>, <strong>108 Ambulance</strong>, and family contacts with live GPS
                  pin and rider diagnostics.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-amber-800">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Auto-countdown cancelled. You can trigger manual dispatch or use direct hotlines below.</span>
              </div>
              <button
                onClick={triggerSOSDispatch}
                className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 shrink-0"
              >
                Send SOS
              </button>
            </div>
          )}

          {/* 2. OFFICIAL 1-TAP EMERGENCY CALL SERVICES */}
          <div className="space-y-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-rose-600" />
              Immediate Emergency Hotlines (India & Tamil Nadu)
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <a
                href="tel:112"
                className="p-3 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-200 flex flex-col items-center justify-center text-center group transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-black text-lg group-hover:scale-105 transition-transform">
                  112
                </div>
                <span className="text-xs font-bold text-rose-950 mt-1.5">National Help</span>
                <span className="text-[10px] text-rose-700">Police & Rescue</span>
              </a>

              <a
                href="tel:108"
                className="p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 flex flex-col items-center justify-center text-center group transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-lg group-hover:scale-105 transition-transform">
                  108
                </div>
                <span className="text-xs font-bold text-emerald-950 mt-1.5">Ambulance</span>
                <span className="text-[10px] text-emerald-700">Free Trauma Care</span>
              </a>

              <a
                href="tel:1091"
                className="p-3 rounded-2xl bg-purple-50 hover:bg-purple-100 border border-purple-200 flex flex-col items-center justify-center text-center group transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black text-lg group-hover:scale-105 transition-transform">
                  1091
                </div>
                <span className="text-xs font-bold text-purple-950 mt-1.5">Women Safety</span>
                <span className="text-[10px] text-purple-700">24/7 Helpline</span>
              </a>

              <a
                href="tel:1033"
                className="p-3 rounded-2xl bg-blue-50 hover:bg-blue-100 border border-blue-200 flex flex-col items-center justify-center text-center group transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-lg group-hover:scale-105 transition-transform">
                  1033
                </div>
                <span className="text-xs font-bold text-blue-950 mt-1.5">Highway Patrol</span>
                <span className="text-[10px] text-blue-700">Toll & Tow Assist</span>
              </a>
            </div>
          </div>

          {/* 3. CURRENT LIVE LOCATION & TELEMETRY */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-rose-600" />
                Live Incident Coordinates (GPS ±{gpsAccuracy}m)
              </span>
              <button
                onClick={copyMapsLink}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                {copiedLink ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? "Copied!" : "Copy Pin"}</span>
              </button>
            </div>

            <div className="text-xs text-slate-800 font-medium leading-relaxed bg-white p-3 rounded-xl border border-slate-200">
              {isLoadingGps ? (
                <div className="flex items-center gap-2 text-slate-500">
                  <Activity className="w-4 h-4 animate-spin text-blue-600" />
                  Resolving high-precision satellite GPS fix...
                </div>
              ) : (
                <>
                  <div className="font-bold text-slate-900">{currentAddress}</div>
                  <div className="font-mono text-[11px] text-slate-500 mt-1">
                    Latitude: {currentLat.toFixed(6)}° N • Longitude: {currentLng.toFixed(6)}° E
                  </div>
                </>
              )}
            </div>

            {/* Vehicle & Rider Snapshot */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[10px]">Vehicle</span>
                <strong className="text-slate-900 font-bold">
                  {bike.make} {bike.model}
                </strong>
                <span className="text-slate-500 block text-[10px] font-mono">{bike.regNumber}</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[10px]">Telemetry</span>
                <strong className="text-slate-900 font-bold">{telemetry.currentSpeedKmh} km/h</strong>
                <span className="text-slate-500 block text-[10px]">Gear: {telemetry.currentGear}</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200 col-span-2 sm:col-span-1">
                <span className="text-slate-400 block text-[10px]">Blood Group</span>
                <strong className="text-rose-600 font-black text-sm">
                  {userProfile.medicalInfo?.bloodGroup || "O+"}
                </strong>
                <span className="text-slate-500 block text-[10px]">Universal Donor</span>
              </div>
            </div>
          </div>

          {/* 4. EMERGENCY CONTACTS (FAMILY & FRIENDS) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <User className="w-4 h-4 text-blue-600" />
                Personal Emergency Contacts ({contacts.length})
              </h3>
              <button
                onClick={() => setShowAddContact(!showAddContact)}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Contact
              </button>
            </div>

            {/* Add Contact Form */}
            {showAddContact && (
              <form
                onSubmit={handleAddContact}
                className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5 text-xs animate-in fade-in"
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Name (e.g., Sister, Doctor)"
                    value={newContactName}
                    onChange={(e) => setNewContactName(e.target.value)}
                    required
                    className="p-2 border border-slate-300 rounded-lg bg-white"
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number (+91 ...)"
                    value={newContactPhone}
                    onChange={(e) => setNewContactPhone(e.target.value)}
                    required
                    className="p-2 border border-slate-300 rounded-lg bg-white"
                  />
                  <select
                    value={newContactRel}
                    onChange={(e) => setNewContactRel(e.target.value)}
                    className="p-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Parent">Parent</option>
                    <option value="Spouse">Spouse</option>
                    <option value="Sibling">Sibling</option>
                    <option value="Friend">Friend</option>
                    <option value="Doctor">Doctor</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddContact(false)}
                    className="px-3 py-1 text-slate-600 hover:text-slate-900 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700"
                  >
                    Save Contact
                  </button>
                </div>
              </form>
            )}

            {/* Contacts list */}
            {contacts.length === 0 ? (
              <div className="p-4 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-center">
                <p className="text-xs text-slate-500 font-medium">
                  No personal emergency contacts configured. Use "+ Add Contact" above to add contacts, or dispatch to National 112 / 108 trauma care directly below.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {contacts.map((contact) => {
                  const whatsappUrl = liveApiService.generateWhatsAppSOSUrl(
                    contact.phone,
                    userProfile.name || "Abijith",
                    currentLat,
                    currentLng,
                    currentAddress,
                    `${bike.make} ${bike.model} (${bike.regNumber})`,
                    userProfile.medicalInfo?.bloodGroup || "O+"
                  );
                  const smsUrl = liveApiService.generateSmsUrl(
                    contact.phone,
                    userProfile.name || "Abijith",
                    currentLat,
                    currentLng,
                    currentAddress
                  );

                  return (
                    <div
                      key={contact.id}
                      className="p-3 bg-white rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-sm hover:border-slate-300"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-xs font-bold text-slate-900">{contact.name}</strong>
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                            {contact.relationship}
                          </span>
                          {contact.isPrimary && (
                            <span className="text-[10px] bg-rose-100 text-rose-700 font-bold px-1.5 py-0.5 rounded">
                              Primary
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 font-mono mt-0.5">{contact.phone}</div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <a
                          href={`tel:${contact.phone}`}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 shadow-sm"
                        >
                          <Phone className="w-3.5 h-3.5" /> Call
                        </a>
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-1"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-emerald-600" /> WhatsApp SOS
                        </a>
                        <a
                          href={smsUrl}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                          title="Send SMS"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </a>
                        <button
                          type="button"
                          onClick={() => handleDeleteContact(contact.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete contact"
                          aria-label={`Delete ${contact.name}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 5. NEARBY 24/7 HOSPITALS & TRAUMA WINGS */}
          <div className="space-y-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-rose-600" />
              Nearest 24/7 Trauma Emergency Centers
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-2">
                <div>
                  <div className="flex items-center justify-between">
                    <strong className="font-bold text-slate-900">KMCH Specialty Hospital</strong>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                      3.8 km
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">Avinashi Road • 24/7 Level 1 Trauma Care</p>
                </div>
                <div className="flex items-center gap-2 pt-1 border-t border-slate-200/60">
                  <a
                    href="tel:04224323800"
                    className="text-xs font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1"
                  >
                    <Phone className="w-3 h-3" /> 0422 4323800
                  </a>
                  {onSelectRoute && (
                    <button
                      onClick={() => {
                        onSelectRoute(currentAddress, "KMCH Hospital, Avinashi Road");
                        onClose();
                      }}
                      className="ml-auto text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <Navigation className="w-3 h-3" /> Route
                    </button>
                  )}
                </div>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-2">
                <div>
                  <div className="flex items-center justify-between">
                    <strong className="font-bold text-slate-900">Coimbatore Medical College (CMCH)</strong>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                      4.1 km
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">Trichy Road • Govt. Super Specialty Emergency</p>
                </div>
                <div className="flex items-center gap-2 pt-1 border-t border-slate-200/60">
                  <a
                    href="tel:04222301393"
                    className="text-xs font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1"
                  >
                    <Phone className="w-3 h-3" /> 0422 2301393
                  </a>
                  {onSelectRoute && (
                    <button
                      onClick={() => {
                        onSelectRoute(currentAddress, "CMCH Hospital, Trichy Road");
                        onClose();
                      }}
                      className="ml-auto text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <Navigation className="w-3 h-3" /> Route
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500 flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            Protected by SmartRoute Emergency Mesh v4
          </span>
          <button
            onClick={() => {
              stopSirenSound();
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition-colors"
          >
            Close Emergency Panel
          </button>
        </div>
      </div>
    </div>
  );
};
