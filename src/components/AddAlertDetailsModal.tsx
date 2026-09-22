import React, { useState } from "react";
import {
  X,
  AlertTriangle,
  Send,
  User,
  CheckCircle2,
  HardHat,
  Droplets,
  Car,
  OctagonAlert,
  Shield,
  Clock,
  Sparkles
} from "lucide-react";
import { UserProfile } from "../types";

interface AddAlertDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  alertSymbolTitle: string;
  alertSymbolType: string;
  alertSymbolLocation: string;
  userProfile: UserProfile;
  onSubmitDetail: (note: string, author: string) => void;
}

export const AddAlertDetailsModal: React.FC<AddAlertDetailsModalProps> = ({
  isOpen,
  onClose,
  alertSymbolTitle,
  alertSymbolType,
  alertSymbolLocation,
  userProfile,
  onSubmitDetail,
}) => {
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const quickPresets = [
    "Traffic is now easing up",
    "Right lane is open and passable",
    "Left lane completely barricaded",
    "Water has receded to a safe level",
    "Tow truck / repair crew on site",
    "Road hazard completely cleared",
    "Police wardens manually directing flow",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim()) return;

    setIsSubmitting(true);
    // Submit using Abijith's profile name
    onSubmitDetail(note.trim(), userProfile.name || "Abijith");

    setIsSubmitting(false);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setNote("");
      onClose();
    }, 900);
  };

  const getSymbolIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "construction":
        return <HardHat className="w-5 h-5 text-amber-500" />;
      case "waterlogging":
        return <Droplets className="w-5 h-5 text-blue-500" />;
      case "accident":
        return <Car className="w-5 h-5 text-rose-500" />;
      case "pothole":
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case "road_closure":
      case "road closed":
        return <OctagonAlert className="w-5 h-5 text-red-600" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/10 text-white backdrop-blur-md">
              {getSymbolIcon(alertSymbolType)}
            </div>
            <div>
              <h3 className="text-base font-bold">Add Details for Alert Symbol</h3>
              <p className="text-xs text-slate-300">
                Provide real-time crowd-sourced situational updates for fellow commuters
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Target Alert Summary Card */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-semibold uppercase tracking-wider text-[10px] text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-md">
                {alertSymbolType.replace("_", " ")} Symbol
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> Live Corridor
              </span>
            </div>
            <strong className="text-sm font-bold text-slate-900 block">
              {alertSymbolTitle}
            </strong>
            <span className="text-xs text-slate-600 mt-0.5 block">
              {alertSymbolLocation}
            </span>
          </div>

          {/* User Profile Display Name Badge */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-blue-50/80 border border-blue-200">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shadow-sm">
                {(userProfile.name || "Abijith").charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-900">
                    {userProfile.name || "Abijith"}
                  </span>
                  <span className="text-[10px] font-bold bg-blue-600 text-white px-1.5 py-0.2 rounded-full">
                    Verified Commuter
                  </span>
                </div>
                <span className="text-[11px] text-blue-800">
                  Submitting details as display name: <strong>{userProfile.name || "Abijith"}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Quick situation preset pills */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2">
              Quick Situational Status Presets:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {quickPresets.map((preset, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setNote(preset)}
                  className={`text-xs px-2.5 py-1.5 rounded-xl border transition-all text-left ${
                    note === preset
                      ? "bg-blue-600 text-white border-blue-600 font-semibold"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Detailed Input Area */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Additional Details or Observations:
            </label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Water receded by 4 inches, right lane open, police are redirecting traffic through Ganapathy link road..."
              className="w-full text-xs p-3 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 placeholder:text-slate-400"
              required
            />
          </div>

          {success && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Details posted successfully as {userProfile.name || "Abijith"}!
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!note.trim() || isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 disabled:opacity-50 flex items-center gap-1.5 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Post Details as {userProfile.name || "Abijith"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
