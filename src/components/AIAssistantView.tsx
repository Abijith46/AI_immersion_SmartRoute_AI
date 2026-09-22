import React, { useState, useRef, useEffect } from "react";
import { ChatMessage, RouteOption, UserPreferences } from "../types";
import { geminiService } from "../services";
import {
  Sparkles,
  Send,
  Bot,
  User,
  Clock,
  HelpCircle,
  RefreshCw,
  Compass,
  AlertTriangle,
  CloudRain,
  Fuel,
  Info
} from "lucide-react";

interface AIAssistantViewProps {
  activeRoute: RouteOption;
  userPreferences: UserPreferences;
  showDataBadges: boolean;
}

export const AIAssistantView: React.FC<AIAssistantViewProps> = ({
  activeRoute,
  userPreferences,
  showDataBadges,
}) => {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem("smartroute_chat_history");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      {
        id: "msg_init",
        sender: "assistant",
        text: `Hello! I am **SmartRoute AI**, your intelligent traffic & travel copilot. I am currently monitoring your journey along **${activeRoute.title}** (${activeRoute.durationMin} min, ${activeRoute.congestionLevel} traffic). How can I assist your commute?`,
        timestamp: "Just now",
        confidence: "95%",
        mode: "gemini",
      },
    ];
  });

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    localStorage.setItem("smartroute_chat_history", JSON.stringify(messages));
  }, [messages]);

  const quickPrompts = [
    "Which route should I take right now?",
    "Why is traffic heavy on Sathy Road?",
    "When will the traffic clear up?",
    "Find me the nearest petrol bunk",
    "Will the rain cause further delays?",
    "Is there any accident reported on my route?",
  ];

  const handleSendMessage = async (textToSend: string) => {
    const query = textToSend.trim();
    if (!query || loading) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: "user",
      text: query,
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
        weather: "Light Rain, 27°C",
        toll: activeRoute.tollCostInr > 0 ? `₹${activeRoute.tollCostInr}` : "₹0 Free",
      };

      const res = await geminiService.askAssistant(query, messages, travelContext, userPreferences);

      const botMsg: ChatMessage = {
        id: `bot_${Date.now()}`,
        sender: "assistant",
        text: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        confidence: res.confidence || "85%",
        mode: res.mode,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot_err_${Date.now()}`,
          sender: "assistant",
          text: "I experienced a temporary connection hiccup with the traffic telemetry engine. For your current route to Saravanampatti, the fastest choice remains Sathy Road Express.",
          timestamp: "Just now",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    const initial: ChatMessage[] = [
      {
        id: `msg_init_${Date.now()}`,
        sender: "assistant",
        text: `Chat reset. I am ready to advise on your route from **Gandhipuram** to **Saravanampatti**!`,
        timestamp: "Just now",
      },
    ];
    setMessages(initial);
    localStorage.removeItem("smartroute_chat_history");
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* HEADER */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">SmartRoute AI Assistant</h2>
            <p className="text-xs text-slate-500">
              Context-grounded travel reasoning powered by Gemini & real-time highway feeds
            </p>
          </div>
        </div>

        <button
          onClick={clearChat}
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 p-2 rounded-lg hover:bg-slate-100 flex items-center gap-1"
          title="Reset conversation"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* QUICK PROMPTS CHIPS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="font-bold text-slate-400 shrink-0 flex items-center gap-1">
          <HelpCircle className="w-3.5 h-3.5" />
          Suggested:
        </span>
        {quickPrompts.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(q)}
            className="px-3 py-1.5 rounded-full bg-indigo-50/80 hover:bg-indigo-100 text-indigo-700 font-medium whitespace-nowrap border border-indigo-200/60 transition-colors shrink-0"
          >
            {q}
          </button>
        ))}
      </div>

      {/* CHAT MESSAGES WINDOW */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-800 min-h-[440px] flex flex-col justify-between">
        <div className="space-y-4 overflow-y-auto max-h-[500px] pr-2">
          {messages.map((msg) => {
            const isBot = msg.sender === "assistant";
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${isBot ? "justify-start" : "justify-end"}`}
              >
                {isBot && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shrink-0 shadow-md">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                    isBot
                      ? "bg-slate-800/90 text-slate-200 border border-slate-700"
                      : "bg-blue-600 text-white font-medium ml-auto"
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.text}</div>

                  <div className="mt-2 pt-2 border-t border-slate-700/50 flex items-center justify-between text-[10px] text-slate-400">
                    <span>{msg.timestamp}</span>
                    {isBot && msg.confidence && (
                      <span className="text-emerald-400">Confidence: {msg.confidence}</span>
                    )}
                  </div>
                </div>

                {!isBot && (
                  <div className="w-8 h-8 rounded-xl bg-slate-700 flex items-center justify-center shrink-0 text-slate-200">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shrink-0 animate-pulse">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="bg-slate-800/90 border border-slate-700 rounded-2xl px-4 py-3 text-xs text-slate-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                SmartRoute AI is analyzing live corridors...
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* INPUT BOX */}
        <div className="mt-4 pt-4 border-t border-slate-800 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage(input)}
            placeholder="Ask anything regarding traffic, shortcuts, road works, speed limits..."
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />

          <button
            onClick={() => handleSendMessage(input)}
            disabled={!input.trim() || loading}
            className="p-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-md transition-all shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
