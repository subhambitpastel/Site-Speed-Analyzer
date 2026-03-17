"use client";

interface StrategyToggleProps {
  strategy: "mobile" | "desktop";
  setStrategy: (s: "mobile" | "desktop") => void;
  disabled?: boolean;
}

export default function StrategyToggle({
  strategy,
  setStrategy,
  disabled = false,
}: StrategyToggleProps) {
  const isMobile = strategy === "mobile";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isMobile}
      aria-label={`Switch to ${isMobile ? "desktop" : "mobile"} analysis`}
      disabled={disabled}
      onClick={() => setStrategy(isMobile ? "desktop" : "mobile")}
      className={`relative inline-flex h-[44px] w-[220px] flex-shrink-0 cursor-pointer items-center rounded-full bg-gray-200 ring-1 ring-gray-300 transition-all duration-300 hover:brightness-105 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-500/30 dark:bg-gray-700 dark:ring-white/10 ${
        disabled ? "pointer-events-none opacity-50" : ""
      }`}
    >
      {/* Sliding gradient thumb */}
      <span
        className="absolute top-[3px] h-[38px] rounded-full bg-gradient-to-r from-sky-500 to-cyan-500 shadow-lg ring-2 ring-sky-500/20 dark:ring-sky-400/30 transition-all duration-500 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)] dark:shadow-sky-500/10"
        style={{
          width: "calc(50% - 3px)",
          left: isMobile ? "calc(50% + 3px)" : "3px",
        }}
      />

      {/* Desktop label */}
      <span
        className={`relative z-10 flex w-1/2 items-center justify-center gap-1.5 text-xs font-semibold tracking-wide transition-colors duration-300 ${
          !isMobile
            ? "text-white"
            : "text-gray-500 dark:text-gray-400"
        }`}
      >
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25A2.25 2.25 0 015.25 3h13.5A2.25 2.25 0 0121 5.25z" />
        </svg>
        Desktop
      </span>

      {/* Mobile label */}
      <span
        className={`relative z-10 flex w-1/2 items-center justify-center gap-1.5 text-xs font-semibold tracking-wide transition-colors duration-300 ${
          isMobile
            ? "text-white"
            : "text-gray-500 dark:text-gray-400"
        }`}
      >
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
        </svg>
        Mobile
      </span>
    </button>
  );
}
