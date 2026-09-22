// Browser SpeechRecognition & Voice Command Engine for SmartRoute AI

export interface VoiceCommandResult {
  rawTranscript: string;
  commandType:
    | "START_NAVIGATION"
    | "STOP_NAVIGATION"
    | "REPORT_ROAD_ISSUE"
    | "NAVIGATE_TAB"
    | "FIND_NEARBY"
    | "CHECK_VEHICLE_SPEED"
    | "CHECK_FUEL_EFFICIENCY"
    | "CHECK_FUEL_LEVEL"
    | "CHECK_BIKE_STATUS"
    | "CONNECT_VEHICLE"
    | "TRIGGER_SOS"
    | "UNKNOWN";
  params?: Record<string, any>;
  feedbackText: string;
}

export type SpeechRecognitionStatus =
  | "idle"
  | "listening"
  | "processing"
  | "success"
  | "error"
  | "unsupported";

export class VoiceRecognitionService {
  private recognition: any = null;
  private isSupported: boolean = false;
  private isListening: boolean = false;

  constructor() {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        this.isSupported = true;
        try {
          this.recognition = new SpeechRecognition();
          this.recognition.continuous = false;
          this.recognition.interimResults = true;
          this.recognition.lang = "en-US";
        } catch (e) {
          console.warn("SpeechRecognition initialization failed:", e);
          this.isSupported = false;
        }
      }
    }
  }

  public checkSupport(): boolean {
    return this.isSupported;
  }

  public startListening(
    onInterim: (text: string) => void,
    onResult: (result: VoiceCommandResult) => void,
    onError: (errorMsg: string) => void,
    onEnd: () => void
  ) {
    if (!this.isSupported || !this.recognition) {
      onError("SpeechRecognition API is not supported in this browser. You can select commands below.");
      return;
    }

    if (this.isListening) {
      try {
        this.recognition.abort();
      } catch (e) {}
    }

    this.isListening = true;

    this.recognition.onstart = () => {
      this.isListening = true;
    };

    this.recognition.onresult = (event: any) => {
      let interim = "";
      let final = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }

      if (interim) {
        onInterim(interim);
      }

      if (final) {
        this.isListening = false;
        const parsed = this.parseVoiceCommand(final.trim());
        onResult(parsed);
      }
    };

    this.recognition.onerror = (event: any) => {
      this.isListening = false;
      let msg = "Microphone error";
      if (event.error === "not-allowed") {
        msg = "Microphone access was denied. Please allow microphone permissions in your browser.";
      } else if (event.error === "no-speech") {
        msg = "No voice input detected. Please try speaking clearly.";
      } else if (event.error === "network") {
        msg = "Network error during voice recognition.";
      } else {
        msg = `Voice recognition error: ${event.error || "Unknown"}`;
      }
      onError(msg);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      onEnd();
    };

    try {
      this.recognition.start();
    } catch (e: any) {
      this.isListening = false;
      onError(`Failed to start speech recognition: ${e.message}`);
    }
  }

  public stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {}
      this.isListening = false;
    }
  }

  /**
   * Parses spoken natural language into SmartRoute AI system commands.
   * Handles commands like:
   * - "Start navigation to work" / "Navigate to office"
   * - "Start navigation to home"
   * - "Start navigation"
   * - "Stop navigation" / "Cancel route"
   * - "Report pothole" / "Report accident" / "Report waterlogging" / "Report road closed"
   * - "Find nearby fuel" / "Find hospital" / "Find mechanic"
   * - "Show live map" / "Predict traffic"
   */
  public parseVoiceCommand(transcript: string): VoiceCommandResult {
    const text = transcript.toLowerCase().trim();

    // 0. Emergency SOS Distress Call (Highest Priority)
    if (
      text.includes("sos") ||
      text.includes("emergency") ||
      text.includes("call 112") ||
      text.includes("call 108") ||
      text.includes("need help") ||
      text.includes("send help") ||
      text.includes("ambulance") ||
      text.includes("police help") ||
      text.includes("distress") ||
      text.includes("danger")
    ) {
      return {
        rawTranscript: transcript,
        commandType: "TRIGGER_SOS",
        params: { urgency: "critical" },
        feedbackText: "Emergency SOS triggered! Opening rapid distress panel and broadcasting coordinates.",
      };
    }

    // 1. Navigation Commands: Work / Office
    if (
      text.includes("to work") ||
      text.includes("to office") ||
      text.includes("navigate to work") ||
      text.includes("start navigation to work") ||
      text.includes("drive to work") ||
      text.includes("go to work")
    ) {
      return {
        rawTranscript: transcript,
        commandType: "START_NAVIGATION",
        params: { destination: "work", destinationName: "Saravanampatti Tech Zone" },
        feedbackText: "Starting navigation to work (Saravanampatti Tech Zone). Live route loaded.",
      };
    }

    // 2. Navigation Commands: Home
    if (
      text.includes("to home") ||
      text.includes("navigate home") ||
      text.includes("take me home") ||
      text.includes("start navigation to home") ||
      text.includes("drive home")
    ) {
      return {
        rawTranscript: transcript,
        commandType: "START_NAVIGATION",
        params: { destination: "home", destinationName: "Gandhipuram Central" },
        feedbackText: "Starting navigation to home (Gandhipuram Central).",
      };
    }

    // 3. Generic Start Navigation
    if (
      text.startsWith("start navigation") ||
      text.startsWith("begin route") ||
      text.startsWith("start driving") ||
      text.startsWith("navigate") ||
      text.includes("start route")
    ) {
      return {
        rawTranscript: transcript,
        commandType: "START_NAVIGATION",
        params: { destination: "current" },
        feedbackText: "Starting navigation on the optimal route.",
      };
    }

    // 4. Stop / Cancel Navigation
    if (
      text.includes("stop navigation") ||
      text.includes("end navigation") ||
      text.includes("cancel navigation") ||
      text.includes("stop route") ||
      text.includes("exit navigation")
    ) {
      return {
        rawTranscript: transcript,
        commandType: "STOP_NAVIGATION",
        feedbackText: "Navigation simulation stopped.",
      };
    }

    // 5. Road Issue Reporting: Pothole
    if (text.includes("pothole") || text.includes("pot hole")) {
      return {
        rawTranscript: transcript,
        commandType: "REPORT_ROAD_ISSUE",
        params: {
          category: "Pothole",
          description: "Pothole reported via voice command by commuter on active route.",
        },
        feedbackText: "Reported pothole on current road corridor. Thank you for warning fellow drivers.",
      };
    }

    // 6. Road Issue Reporting: Waterlogging / Flood
    if (
      text.includes("waterlog") ||
      text.includes("water logging") ||
      text.includes("flood") ||
      text.includes("water logging")
    ) {
      return {
        rawTranscript: transcript,
        commandType: "REPORT_ROAD_ISSUE",
        params: {
          category: "Waterlogging",
          description: "Waterlogging / road submerged reported via voice command.",
        },
        feedbackText: "Reported waterlogging on active corridor. Weather and route warning updated.",
      };
    }

    // 7. Road Issue Reporting: Accident / Crash
    if (
      text.includes("accident") ||
      text.includes("crash") ||
      text.includes("collision")
    ) {
      return {
        rawTranscript: transcript,
        commandType: "REPORT_ROAD_ISSUE",
        params: {
          category: "Accident",
          description: "Traffic accident reported via voice command. Lane caution advised.",
        },
        feedbackText: "Accident reported on active route. Warning flagged for approaching vehicles.",
      };
    }

    // 8. Road Issue Reporting: Road Closed / Blocked
    if (
      text.includes("road closed") ||
      text.includes("road closure") ||
      text.includes("blocked") ||
      text.includes("barricade")
    ) {
      return {
        rawTranscript: transcript,
        commandType: "REPORT_ROAD_ISSUE",
        params: {
          category: "Road Closed",
          description: "Road closure or physical barrier reported via voice command.",
        },
        feedbackText: "Road closure logged. Recalculating detour recommendations.",
      };
    }

    // 9. Road Issue Reporting: Construction / Road Work
    if (
      text.includes("construction") ||
      text.includes("road work") ||
      text.includes("repair work")
    ) {
      return {
        rawTranscript: transcript,
        commandType: "REPORT_ROAD_ISSUE",
        params: {
          category: "Construction",
          description: "Active road construction work reported via voice command.",
        },
        feedbackText: "Construction zone reported on route.",
      };
    }

    // 10. General Road Issue / Hazard
    if (
      text.includes("report issue") ||
      text.includes("report hazard") ||
      text.includes("report danger") ||
      text.includes("road issue")
    ) {
      return {
        rawTranscript: transcript,
        commandType: "REPORT_ROAD_ISSUE",
        params: {
          category: "Other",
          description: "General road hazard reported via voice command.",
        },
        feedbackText: "Road hazard report registered.",
      };
    }

    // 11. Nearby Services: Fuel / Petrol / Gas
    if (
      text.includes("fuel") ||
      text.includes("petrol") ||
      text.includes("gas station") ||
      text.includes("diesel")
    ) {
      return {
        rawTranscript: transcript,
        commandType: "FIND_NEARBY",
        params: { category: "fuel" },
        feedbackText: "Locating verified fuel stations along your corridor.",
      };
    }

    // 12. Nearby Services: Hospital / Medical
    if (
      text.includes("hospital") ||
      text.includes("medical") ||
      text.includes("clinic") ||
      text.includes("emergency")
    ) {
      return {
        rawTranscript: transcript,
        commandType: "FIND_NEARBY",
        params: { category: "hospital" },
        feedbackText: "Locating 24/7 hospitals and emergency care nearby.",
      };
    }

    // 13. Nearby Services: Mechanic / Workshop
    if (
      text.includes("mechanic") ||
      text.includes("workshop") ||
      text.includes("repair") ||
      text.includes("puncture")
    ) {
      return {
        rawTranscript: transcript,
        commandType: "FIND_NEARBY",
        params: { category: "mechanic" },
        feedbackText: "Locating verified mechanics and workshops along your route.",
      };
    }

    // 14. Tab Navigation: Map
    if (text.includes("live map") || text.includes("open map") || text.includes("show map")) {
      return {
        rawTranscript: transcript,
        commandType: "NAVIGATE_TAB",
        params: { tab: "map" },
        feedbackText: "Opening full screen Live Traffic & Hazard Map.",
      };
    }

    // 15. Tab Navigation: Traffic Prediction
    if (
      text.includes("traffic prediction") ||
      text.includes("predict traffic") ||
      text.includes("forecast")
    ) {
      return {
        rawTranscript: transcript,
        commandType: "NAVIGATE_TAB",
        params: { tab: "prediction" },
        feedbackText: "Opening AI Traffic Prediction timeline.",
      };
    }

    // 16. Tab Navigation: Road Conditions
    if (
      text.includes("road condition") ||
      text.includes("road issues") ||
      text.includes("hazards")
    ) {
      return {
        rawTranscript: transcript,
        commandType: "NAVIGATE_TAB",
        params: { tab: "roads" },
        feedbackText: "Opening community Road Conditions and Hazard logs.",
      };
    }

    // 17. Tab Navigation: AI Assistant
    if (
      text.includes("assistant") ||
      text.includes("ai copilot") ||
      text.includes("chat") ||
      text.includes("gemini")
    ) {
      return {
        rawTranscript: transcript,
        commandType: "NAVIGATE_TAB",
        params: { tab: "assistant" },
        feedbackText: "Opening Gemini AI Travel Assistant.",
      };
    }

    // 18. Smart Connect: Check Vehicle Speed
    if (
      text.includes("speed") ||
      text.includes("how fast") ||
      text.includes("current speed") ||
      text.includes("bike speed")
    ) {
      return {
        rawTranscript: transcript,
        commandType: "CHECK_VEHICLE_SPEED",
        feedbackText: "Checking real-time vehicle speed telemetry.",
      };
    }

    // 19. Smart Connect: Check Fuel Efficiency / Mileage
    if (
      text.includes("mileage") ||
      text.includes("fuel efficiency") ||
      text.includes("fuel economy") ||
      text.includes("consumption") ||
      text.includes("kmpl")
    ) {
      return {
        rawTranscript: transcript,
        commandType: "CHECK_FUEL_EFFICIENCY",
        feedbackText: "Querying vehicle instant and trip average fuel efficiency.",
      };
    }

    // 20. Smart Connect: Check Fuel Level / Petrol
    if (
      text.includes("fuel level") ||
      text.includes("petrol level") ||
      text.includes("how much petrol") ||
      text.includes("how much fuel") ||
      text.includes("petrol left") ||
      text.includes("distance to empty") ||
      text.includes("fuel remaining")
    ) {
      return {
        rawTranscript: transcript,
        commandType: "CHECK_FUEL_LEVEL",
        feedbackText: "Checking fuel tank level and distance to empty.",
      };
    }

    // 21. Smart Connect: Check Bike Status & Diagnostics
    if (
      text.includes("bike status") ||
      text.includes("bike details") ||
      text.includes("vehicle status") ||
      text.includes("tyre pressure") ||
      text.includes("tire pressure") ||
      text.includes("battery health")
    ) {
      return {
        rawTranscript: transcript,
        commandType: "CHECK_BIKE_STATUS",
        feedbackText: "Checking bike diagnostics, tyre pressures, and battery state.",
      };
    }

    // 22. Smart Connect: Connect / Open Smart Connect View
    if (
      text.includes("smart connect") ||
      text.includes("connect bike") ||
      text.includes("connect vehicle") ||
      text.includes("connect to bike") ||
      text.includes("bluetooth connect") ||
      text.includes("vehicle telemetry")
    ) {
      return {
        rawTranscript: transcript,
        commandType: "CONNECT_VEHICLE",
        params: { tab: "smart_connect" },
        feedbackText: "Opening Smart Connect vehicle dashboard and Bluetooth sync.",
      };
    }

    // Unrecognized
    return {
      rawTranscript: transcript,
      commandType: "UNKNOWN",
      feedbackText: `I heard: "${transcript}". Say 'Check bike speed', 'Check fuel level', 'What is my mileage', or 'Start navigation'.`,
    };
  }

  /**
   * Speaks feedback to the driver using browser SpeechSynthesis
   */
  public speakFeedback(text: string): void {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    try {
      window.speechSynthesis.cancel(); // Stop any pending speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      utterance.volume = 0.9;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("SpeechSynthesis error:", e);
    }
  }
}

export const voiceService = new VoiceRecognitionService();
