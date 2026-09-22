import React, { useState } from "react";
import { Sparkles, MessageSquare, X, Send, User, ChevronUp, Mic } from "lucide-react";
import { RouteOption, UserPreferences, ChatMessage } from "../types";
import { geminiService } from "../services";

interface FloatingAIChatProps {
  activeRoute: RouteOption;
  userPreferences: UserPreferences;
  onOpenVoiceCommand?: () => void;
}

export const FloatingAIChat: React.FC<FloatingAIChatProps> = ({
  activeRoute,
  userPreferences,
  onOpenVoiceCommand,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "f_init",
      sender: "assistant",
      text: `Hi! Ask me anything about traffic, congestion clearing, or shortcuts along **${activeRoute.title}**!`,
      timestamp: "Just now",
    },
  ]);

  const handleSend = async (text: string) => {
    const q = text.trim();
    if (!q || loading) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: "user",
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const travelContext = {
        origin: "Gandhipuram Central",
        destination: "Saravanampatti Tech Zone",
        routeTitle: activeRoute.title,
        duration: `${activeRoute.durationMin} min`,
        traffic: activeRoute.congestionLevel,
      };

      const res = await geminiService.askAssistant(q, messages, travelContext, userPreferences);

      setMessages((prev) => [
        ...prev,
        {
          id: `bot_${Date.now()}`,
          sender: "assistant",
          text: res.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: "assistant",
          text: "Heavy traffic on Sathy Road is expected to begin easing around 5:45 PM.",
          timestamp: "Just now",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-20 md:bottom-6 right-6 z-40 flex items-center gap-2">
      {!isOpen ? (
        <>
          {onOpenVoiceCommand && (
            <button
              onClick={onOpenVoiceCommand}
              className="p-3.5 rounded-full bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-slate-700 shadow-2xl flex items-center gap-2 group transition-all hover:scale-105 active:scale-95"
              title="Speak Voice Commands: 'Start navigation to work' or 'Report pothole'"
            >
              <Mic className="w-5 h-5 animate-pulse text-cyan-400" />
              <span className="text-xs font-bold text-white pr-1 hidden lg:inline">Voice Control</span>
            </button>
          )}

          <button
            onClick={() => setIsOpen(true)}
            className="p-3.5 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-2xl flex items-center gap-2 group transition-all hover:scale-105 active:scale-95"
            title="Ask SmartRoute AI"
          >
            <Sparkles className="w-5 h-5 animate-pulse" />
            <span className="text-xs font-extrabold pr-1 hidden sm:inline">Ask AI Copilot</span>
          </button>
        </>
      ) : (
        <div className="w-80 sm:w-96 bg-slate-900 text-white rounded-3xl shadow-2xl border border-slate-700 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="p-4 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">SmartRoute AI Copilot</h4>
                <span className="text-[10px] text-emerald-400">● Live Corridor Reasoning</span>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="p-4 space-y-3 max-h-72 overflow-y-auto text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2 ${m.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.sender === "assistant" && (
                  <div className="w-6 h-6 rounded bg-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-3 h-3 text-white" />
                  </div>
                )}
                <div
                  className={`p-2.5 rounded-xl max-w-[85%] ${
                    m.sender === "user" ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-200 border border-slate-700"
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{m.text}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="text-[11px] text-slate-400 flex items-center gap-2 pl-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                Analyzing traffic streams...
              </div>
            )}
          </div>

          {/* Quick chip */}
          <div className="px-3 py-1.5 bg-slate-950 flex items-center gap-1.5 overflow-x-auto text-[10px]">
            {["When will traffic clear?", "Is there a shortcut?", "Nearest petrol bunk"].map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSend(prompt)}
                className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700 whitespace-nowrap"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="p-3 bg-slate-800/80 border-t border-slate-700 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
              placeholder="Ask about traffic, delays..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 outline-none focus:border-blue-500"
            />
            <button
              onClick={() => handleSend(input)}
              disabled={!input.trim() || loading}
              className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
