import React from "react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = "md", showTagline = false, className = "" }) => {
  const iconSizes = {
    sm: "w-7 h-7",
    md: "w-9 h-9",
    lg: "w-12 h-12",
  };

  const titleSizes = {
    sm: "text-base font-bold",
    md: "text-xl font-bold",
    lg: "text-2xl font-extrabold",
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Visual Logo: Combination of Road, Location Pin, and AI/Network elements */}
      <div
        className={`relative ${iconSizes[size]} rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-emerald-500 p-0.5 shadow-md flex items-center justify-center shrink-0`}
      >
        <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center relative overflow-hidden">
          {/* Subtle AI network nodes background */}
          <svg
            viewBox="0 0 40 40"
            className="w-full h-full text-white"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Highway / Road curving upward */}
            <path
              d="M14 36 L17 18 L23 18 L26 36 Z"
              fill="url(#roadGrad)"
              opacity="0.8"
            />
            <path
              d="M20 36 L20 20"
              stroke="#38bdf8"
              strokeWidth="1.5"
              strokeDasharray="2 2"
            />
            {/* AI Network nodes / circuits */}
            <circle cx="10" cy="12" r="1.5" fill="#38bdf8" />
            <circle cx="30" cy="12" r="1.5" fill="#10b981" />
            <circle cx="20" cy="6" r="2" fill="#60a5fa" />
            <path d="M10 12 L20 6 L30 12" stroke="#38bdf8" strokeWidth="0.8" strokeOpacity="0.5" />
            <path d="M20 6 L20 12" stroke="#38bdf8" strokeWidth="0.8" strokeOpacity="0.6" />

            {/* Smart Pin atop the road */}
            <path
              d="M20 10 C16.5 10 14 12.5 14 16 C14 20.5 20 27 20 27 C20 27 26 20.5 26 16 C26 12.5 23.5 10 20 10 Z"
              fill="url(#pinGrad)"
            />
            <circle cx="20" cy="16" r="2.5" fill="#0f172a" />
            <circle cx="20" cy="16" r="1.2" fill="#38bdf8" />

            <defs>
              <linearGradient id="roadGrad" x1="20" y1="18" x2="20" y2="36" gradientUnits="userSpaceOnUse">
                <stop stopColor="#334155" />
                <stop offset="1" stopColor="#1e293b" />
              </linearGradient>
              <linearGradient id="pinGrad" x1="14" y1="10" x2="26" y2="27" gradientUnits="userSpaceOnUse">
                <stop stopColor="#38bdf8" />
                <stop offset="0.5" stopColor="#3b82f6" />
                <stop offset="1" stopColor="#10b981" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-1.5 leading-none">
          <span className={`tracking-tight text-slate-900 ${titleSizes[size]}`}>
            SmartRoute
          </span>
          <span className="text-xs font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-blue-600 text-white font-mono shadow-sm">
            AI
          </span>
        </div>
        {showTagline && (
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Predict traffic. Find smarter routes. Reach faster.
          </p>
        )}
      </div>
    </div>
  );
};
