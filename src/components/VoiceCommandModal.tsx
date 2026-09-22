import React, { useState, useEffect, useRef } from "react";
import {
  Mic,
  MicOff,
  X,
  Navigation,
  AlertTriangle,
  Volume2,
  VolumeX,
  Compass,
  CheckCircle2,
  Sparkles,
  Car,
  Fuel,
  Map,
  Shield,
  HelpCircle,
  Clock,
  Bike,
  Gauge
} from "lucide-react";
import { voiceService, VoiceCommandResult } from "../services/voiceService";
import { UserProfile } from "../types";

interface VoiceCommandModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExecuteCommand: (result: VoiceCommandResult) => void;
  userProfile?: UserProfile;
}

export const VoiceCommandModal: React.FC<VoiceCommandModalProps> = ({
  isOpen,
  onClose,
  onExecuteCommand,
  userProfile,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState("");
  const [finalResult, setFinalResult] = useState<VoiceCommandResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    setIsSupported(voiceService.checkSupport());
  }, []);

  // When modal opens, automatically start listening if supported
  useEffect(() => {
    if (isOpen) {
      setInterimText("");
      setFinalResult(null);
      setErrorMessage(null);
      startListening();
    } else {
      stopListening();
    }
  }, [isOpen]);

  const startListening = () => {
    setErrorMessage(null);
    setFinalResult(null);
    setInterimText("");

    voiceService.startListening(
      (interim) => {
        setInterimText(interim);
      },
      (result) => {
        setIsListening(false);
        setInterimText(result.rawTranscript);
        setFinalResult(result);

        // Optional Audio response
        if (speechEnabled) {
          voiceService.speakFeedback(result.feedbackText);
        }

        // Execute command in parent app
        setTimeout(() => {
          onExecuteCommand(result);
          setTimeout(() => {
            onClose();
          }, 1400);
        }, 300);
      },
      (error) => {
        setIsListening(false);
        setErrorMessage(error);
      },
      () => {
        setIsListening(false);
      }
    );

    setIsListening(true);
  };

  const stopListening = () => {
    voiceService.stopListening();
    setIsListening(false);
  };

  const handleSimulateCommand = (phrase: string) => {
    setErrorMessage(null);
    setInterimText(phrase);
    const parsed = voiceService.parseVoiceCommand(phrase);
    setFinalResult(parsed);

    if (speechEnabled) {
      voiceService.speakFeedback(parsed.feedbackText);
    }

    setTimeout(() => {
      onExecuteCommand(parsed);
      setTimeout(() => {
        onClose();
      }, 1400);
    }, 400);
  };

  if (!isOpen) return null;

  const quickCommands = [
    { text: "Start navigation to work", icon: Navigation, desc: "Loads Saravanampatti Tech corridor" },
    { text: "Check bike speed", icon: Gauge, desc: "Telemetry speed & gear readout" },
    { text: "What is my fuel efficiency", icon: Fuel, desc: "Instant & trip km/L economy" },
    { text: "How much petrol left", icon: Fuel, desc: "Fuel tank & distance to empty" },
    { text: "Check bike status", icon: Bike, desc: "TPMS pressure & battery health" },
    { text: "Report pothole", icon: AlertTriangle, desc: "Flags road damage at current segment" },
    { text: "Open Smart Connect", icon: Bike, desc: "Vehicle cockpit & BLE sync" },
    { text: "Find nearby fuel", icon: Fuel, desc: "Locates closest petrol stations" },
    { text: "Show live map", icon: Map, desc: "Switches to interactive map" },
    { text: "Stop navigation", icon: X, desc: "Cancels active simulation" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden text-white flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base flex items-center gap-2">
                Voice Command Assistant
                <span className="text-[10px] bg-blue-600 px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold">
                  SpeechRecognition API
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Hands-free control for {userProfile?.name || "Abijith"} while commuting
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSpeechEnabled(!speechEnabled)}
              className={`p-2 rounded-xl border transition-colors ${
                speechEnabled
                  ? "bg-slate-800 text-blue-400 border-slate-700"
                  : "bg-slate-800 text-slate-500 border-slate-700"
              }`}
              title={speechEnabled ? "Voice Feedback Enabled" : "Voice Feedback Muted"}
            >
              {speechEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Central Audio & Speech Visualizer */}
        <div className="p-8 flex flex-col items-center text-center space-y-5 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950">
          {/* Pulsing Mic Circle */}
          <div className="relative">
            {isListening && (
              <>
                <div className="absolute inset-0 rounded-full bg-blue-500/30 animate-ping" />
                <div className="absolute -inset-3 rounded-full bg-blue-500/20 animate-pulse" />
                <div className="absolute -inset-6 rounded-full bg-blue-500/10 animate-pulse delay-75" />
              </>
            )}

            <button
              onClick={isListening ? stopListening : startListening}
              className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-xl ${
                isListening
                  ? "bg-gradient-to-tr from-blue-600 to-cyan-500 text-white shadow-blue-500/40 scale-105"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600"
              }`}
            >
              {isListening ? (
                <Mic className="w-9 h-9 animate-pulse" />
              ) : (
                <MicOff className="w-9 h-9 text-slate-400" />
              )}
            </button>
          </div>

          {/* Status and Live Transcript */}
          <div className="min-h-[70px] flex flex-col items-center justify-center space-y-1.5 w-full">
            {isListening ? (
              <div className="space-y-1">
                <span className="text-xs font-bold text-cyan-400 tracking-wider uppercase animate-pulse">
                  Listening to voice...
                </span>
                <p className="text-sm font-medium text-slate-200 italic px-4">
                  {interimText || 'Say "Start navigation to work" or "Report pothole"...'}
                </p>
              </div>
            ) : finalResult ? (
              <div className="space-y-1.5 animate-in fade-in">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-3 py-1 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Command Executed: {finalResult.commandType.replace(/_/g, " ")}
                </div>
                <p className="text-xs text-slate-300 max-w-sm mx-auto">
                  {finalResult.feedbackText}
                </p>
              </div>
            ) : errorMessage ? (
              <div className="space-y-2">
                <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/30 px-3 py-1.5 rounded-xl max-w-sm">
                  {errorMessage}
                </p>
                <button
                  onClick={startListening}
                  className="text-xs text-blue-400 underline font-semibold hover:text-blue-300"
                >
                  Tap microphone to retry
                </button>
              </div>
            ) : (
              <div className="space-y-1">
                <span className="text-xs text-slate-400 font-semibold">
                  Microphone idle. Tap the mic or speak:
                </span>
                <p className="text-xs text-slate-500">
                  "Start navigation to work" • "Report accident" • "Find fuel"
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Voice Command Shortcuts */}
        <div className="p-5 bg-slate-950/80 border-t border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
            <span>Quick Voice Commands (Click to Trigger)</span>
            <span className="text-[10px] text-blue-400 normal-case font-normal flex items-center gap-1">
              <Clock className="w-3 h-3" /> Hands-free ready
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {quickCommands.map((cmd, idx) => {
              const Icon = cmd.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleSimulateCommand(cmd.text)}
                  className="p-2.5 rounded-2xl bg-slate-800/70 hover:bg-blue-600/20 border border-slate-700/60 hover:border-blue-500/50 transition-all text-left group flex items-start gap-2.5"
                >
                  <div className="p-1.5 rounded-xl bg-slate-700/50 text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="truncate">
                    <span className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 block truncate">
                      "{cmd.text}"
                    </span>
                    <span className="text-[10px] text-slate-400 block truncate">
                      {cmd.desc}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Note */}
        <div className="px-5 py-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <span>Supported: Chrome, Edge, Safari (SpeechRecognition)</span>
          <span className="text-slate-400">Authenticated: <strong>{userProfile?.name || "Abijith"}</strong></span>
        </div>
      </div>
    </div>
  );
};
