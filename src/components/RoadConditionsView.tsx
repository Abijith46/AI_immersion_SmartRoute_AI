import React, { useState } from "react";
import { RoadIssueReport } from "../types";
import {
  AlertTriangle,
  PlusCircle,
  ThumbsUp,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  HardHat,
  Droplets,
  AlertOctagon,
  HelpCircle,
  X,
  Mic
} from "lucide-react";
import { roadConditionService } from "../services";
import { AddAlertDetailsModal } from "./AddAlertDetailsModal";
import { UserProfile } from "../types";

interface RoadConditionsViewProps {
  issues: RoadIssueReport[];
  onReportSubmitted: () => void;
  showDataBadges: boolean;
  userProfile?: UserProfile;
  onOpenVoiceCommand?: () => void;
}

export const RoadConditionsView: React.FC<RoadConditionsViewProps> = ({
  issues,
  onReportSubmitted,
  showDataBadges,
  userProfile = {
    id: "usr_7894",
    name: "Abijith",
    email: "abijithprakash044@gmail.com",
    memberSince: "May 2025",
    commuteSummary: {
      routineRoute: "Home (Gandhipuram) → College / Office (Saravanampatti)",
      usualDeparture: "7:30 AM (Mon–Fri)",
      usualTravelTimeMin: 35,
      currentEstimatedTimeMin: 48,
      alternativeAvailable: true,
      alternativeTimeMin: 39,
    },
  },
  onOpenVoiceCommand,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [showReportModal, setShowReportModal] = useState(false);
  const [activeIssueForDetail, setActiveIssueForDetail] = useState<RoadIssueReport | null>(null);

  // New report form state
  const [selectedCategory, setSelectedCategory] = useState<
    "Pothole" | "Accident" | "Waterlogging" | "Road Closed" | "Construction" | "Other"
  >("Pothole");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!location.trim() || !description.trim()) return;

    roadConditionService.submitIssueReport({
      category: selectedCategory,
      location,
      description,
      reportedBy: `${userProfile?.name || "Abijith"} (Verified Commuter)`,
    });

    setLocation("");
    setDescription("");
    setShowReportModal(false);
    onReportSubmitted();
  };

  const handleUpvote = (id: string) => {
    roadConditionService.upvoteReport(id);
    onReportSubmitted();
  };

  const filteredIssues =
    filterCategory === "all"
      ? issues
      : issues.filter((i) => i.category.toLowerCase() === filterCategory.toLowerCase());

  const categories = [
    { label: "Pothole", icon: AlertTriangle },
    { label: "Accident", icon: AlertOctagon },
    { label: "Waterlogging", icon: Droplets },
    { label: "Road Closed", icon: AlertOctagon },
    { label: "Construction", icon: HardHat },
    { label: "Other", icon: HelpCircle },
  ] as const;

  return (
    <div className="space-y-6 pb-12">
      {/* HEADER & ACTION */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-100 text-amber-700">
              <HardHat className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-900">Road Conditions & Hazards</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Community-reported and traffic-police-verified pavement status, waterlogging, and repair updates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onOpenVoiceCommand && (
            <button
              onClick={onOpenVoiceCommand}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-400 font-bold text-xs shadow-md border border-slate-700 transition-all shrink-0 group"
              title="Voice report: Speak 'Report pothole' or 'Report accident'"
            >
              <Mic className="w-4 h-4 animate-pulse text-cyan-400" />
              <span>Report by Voice</span>
            </button>
          )}

          <button
            onClick={() => setShowReportModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-all shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            Report Road Issue
          </button>
        </div>
      </div>

      {/* FILTER BUTTONS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setFilterCategory("all")}
          className={`px-3 py-1.5 rounded-xl font-semibold transition-colors ${
            filterCategory === "all"
              ? "bg-slate-900 text-white"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
          }`}
        >
          All Reports ({issues.length})
        </button>

        {categories.map((cat) => (
          <button
            key={cat.label}
            onClick={() => setFilterCategory(cat.label)}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-colors flex items-center gap-1.5 ${
              filterCategory === cat.label
                ? "bg-blue-600 text-white"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
            }`}
          >
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* ISSUES LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredIssues.map((issue) => (
          <div
            key={issue.id}
            className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                    issue.category === "Accident" || issue.category === "Road Closed"
                      ? "bg-rose-100 text-rose-700 border border-rose-200"
                      : issue.category === "Waterlogging"
                      ? "bg-cyan-100 text-cyan-700 border border-cyan-200"
                      : issue.category === "Construction"
                      ? "bg-orange-100 text-orange-700 border border-orange-200"
                      : "bg-amber-100 text-amber-700 border border-amber-200"
                  }`}
                >
                  {issue.category}
                </span>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    issue.status === "Resolved"
                      ? "bg-emerald-100 text-emerald-700"
                      : issue.status === "Work in Progress"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {issue.status}
                </span>
              </div>

              <h4 className="text-sm font-bold text-slate-900 flex items-start gap-1.5">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span>{issue.location}</span>
              </h4>

              <p className="text-xs text-slate-600 mt-2 leading-relaxed">{issue.description}</p>

              {/* Additional Community Details if any */}
              {issue.additionalDetails && issue.additionalDetails.length > 0 && (
                <div className="mt-3 space-y-1.5 pt-2 border-t border-slate-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block">
                    Community Updates ({issue.additionalDetails.length})
                  </span>
                  {issue.additionalDetails.map((dt, i) => (
                    <div key={i} className="p-2 rounded-xl bg-blue-50/70 border border-blue-100 text-xs">
                      <p className="text-slate-800 leading-relaxed">{dt.note}</p>
                      <span className="text-[10px] text-blue-700 font-semibold block mt-0.5">
                        Added by {dt.author} • {dt.timestamp}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
              <span>
                Reported {issue.reportedAt} by <strong className="text-slate-700">{issue.reportedBy}</strong>
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveIssueForDetail(issue)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors"
                >
                  <span>+ Add Details</span>
                </button>

                <button
                  onClick={() => handleUpvote(issue.id)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-700 font-semibold transition-colors"
                  title="Upvote verified report"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>{issue.upvotes}</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* REPORT ISSUE MODAL */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Report Road Issue</h3>
              <button
                onClick={() => setShowReportModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              {/* Commuter identity badge */}
              <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-blue-50/80 border border-blue-200">
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                  {(userProfile?.name || "Abijith").charAt(0).toUpperCase()}
                </div>
                <div className="text-xs">
                  <span className="text-slate-500">Reporting hazard as: </span>
                  <strong className="text-slate-900">{userProfile?.name || "Abijith"}</strong>
                  <span className="text-[10px] text-blue-600 font-bold ml-1.5 bg-blue-100 px-1.5 py-0.5 rounded">Verified</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">Issue Category</label>
                <div className="grid grid-cols-3 gap-2">
                  {categories.map((cat) => {
                    const isSelected = selectedCategory === cat.label;
                    return (
                      <button
                        key={cat.label}
                        type="button"
                        onClick={() => setSelectedCategory(cat.label as any)}
                        className={`p-2 rounded-xl text-xs font-bold border transition-all text-center ${
                          isSelected
                            ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        [ {cat.label} ]
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Location Details</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                  placeholder="e.g. Sathy Road near Ganapathy Signal"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Issue Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  placeholder="Describe the condition, lane blockage, depth of water, etc."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 resize-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                >
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Alert Details Modal for Road Issue */}
      {activeIssueForDetail && (
        <AddAlertDetailsModal
          isOpen={!!activeIssueForDetail}
          onClose={() => setActiveIssueForDetail(null)}
          alertSymbolTitle={activeIssueForDetail.category}
          alertSymbolType={activeIssueForDetail.category}
          alertSymbolLocation={activeIssueForDetail.location}
          userProfile={userProfile}
          onSubmitDetail={(note, author) => {
            roadConditionService.addIssueDetail(activeIssueForDetail.id, {
              note,
              author,
              timestamp: "Just now",
            });
            onReportSubmitted();
            setActiveIssueForDetail(null);
          }}
        />
      )}
    </div>
  );
};
