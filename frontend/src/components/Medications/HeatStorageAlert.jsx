import { useState } from "react";

const MOCK_MEDICATIONS = [
  {
    name: "Insulin Glargine",
    requiresColdChain: true,
    maxTemp: 8,
    storageInstructions: "Refrigerate at 2-8\u00B0C. Once opened, use within 28 days.",
  },
  {
    name: "Metformin",
    requiresColdChain: false,
    maxTemp: 30,
    storageInstructions: "Store below 30\u00B0C",
  },
  {
    name: "Amlodipine",
    requiresColdChain: false,
    maxTemp: 25,
    storageInstructions: "Store below 25\u00B0C, protect from moisture",
  },
];

/** Simulated ambient temperature for Ghana (30-38 range) */
function getSimulatedTemp() {
  return Math.floor(Math.random() * 9) + 30;
}

function getRiskLevel(currentTemp, maxTemp, requiresColdChain) {
  if (requiresColdChain) return "danger";
  if (currentTemp > 35) return "danger";
  if (currentTemp > maxTemp) return "warning";
  return "safe";
}

function getRiskLabel(level) {
  if (level === "danger") return "High Risk";
  if (level === "warning") return "Caution";
  return "Safe";
}

function getStorageTip(requiresColdChain, maxTemp) {
  if (requiresColdChain) {
    return "Store in a refrigerator immediately. Do not freeze. If no fridge is available, use a cool box with ice packs.";
  }
  if (maxTemp <= 25) {
    return "Keep in a cool, dry place away from direct sunlight. Avoid storing in bathrooms or near windows.";
  }
  return "Store in a cool, dry place away from direct sunlight and heat sources.";
}

/** Thermometer SVG icon */
function ThermometerIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M14 14.76V3.5a2.5 2.5 0 00-5 0v11.26a4.5 4.5 0 105 0z" />
    </svg>
  );
}

/** Warning triangle icon */
function WarningIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

/** Checkmark circle icon */
function CheckIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

/** Snowflake icon for cold chain */
function SnowflakeIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="12" y1="2" x2="12" y2="22" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
      <line x1="19.07" y1="4.93" x2="4.93" y2="19.07" />
    </svg>
  );
}

function RiskIcon({ level, className }) {
  if (level === "danger") {
    return <WarningIcon className={className || "w-5 h-5 text-red-500"} />;
  }
  if (level === "warning") {
    return <WarningIcon className={className || "w-5 h-5 text-amber-500"} />;
  }
  return <CheckIcon className={className || "w-5 h-5 text-green-500"} />;
}

export default function HeatStorageAlert({ medications }) {
  const [currentTemp] = useState(() => getSimulatedTemp());

  const meds = medications && medications.length > 0 ? medications : MOCK_MEDICATIONS;

  const sensitiveMeds = meds.filter(
    (med) => med.requiresColdChain || med.maxTemp < 35
  );

  // Determine banner color based on current temperature
  const bannerLevel =
    currentTemp > 35 ? "danger" : currentTemp >= 30 ? "warning" : "safe";

  const bannerStyles = {
    danger:
      "border-red-500/40 bg-red-50/80 dark:bg-red-950/30 dark:border-red-500/30",
    warning:
      "border-amber-500/40 bg-amber-50/80 dark:bg-amber-950/30 dark:border-amber-500/30",
    safe:
      "border-green-500/40 bg-green-50/80 dark:bg-green-950/30 dark:border-green-500/30",
  };

  const tempTextStyles = {
    danger: "text-red-600 dark:text-red-400",
    warning: "text-amber-600 dark:text-amber-400",
    safe: "text-green-600 dark:text-green-400",
  };

  // If no medications need special storage
  if (sensitiveMeds.length === 0) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 dark:bg-green-950/30 border border-green-300/50 dark:border-green-700/50">
        <CheckIcon className="w-4 h-4 text-green-500" />
        <span className="text-sm font-body font-medium text-green-700 dark:text-green-400">
          All medications stored safely
        </span>
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl border ${bannerStyles[bannerLevel]} p-4 space-y-4 transition-colors`}
      role="alert"
      aria-live="polite"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <ThermometerIcon
            className={`w-7 h-7 ${tempTextStyles[bannerLevel]} animate-pulse`}
          />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-display font-bold text-gray-900 dark:text-gray-100">
            Storage Alert
          </h3>
          <p className="text-sm font-body text-gray-600 dark:text-gray-400">
            Current ambient temperature:{" "}
            <span className={`font-bold ${tempTextStyles[bannerLevel]}`}>
              {currentTemp}&deg;C
            </span>
          </p>
        </div>
        {bannerLevel === "danger" && (
          <span className="px-2.5 py-1 text-xs font-body font-semibold text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/40 rounded-full">
            Action Needed
          </span>
        )}
      </div>

      {/* Temperature bar */}
      <div className="relative h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
        <div
          className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${
            bannerLevel === "danger"
              ? "bg-red-500"
              : bannerLevel === "warning"
                ? "bg-amber-500"
                : "bg-green-500"
          }`}
          style={{ width: `${Math.min(((currentTemp - 20) / 25) * 100, 100)}%` }}
        />
        {/* Marker labels */}
        <div className="absolute top-3 left-0 w-full flex justify-between text-[10px] font-body text-gray-400 dark:text-gray-500">
          <span>20&deg;C</span>
          <span>30&deg;C</span>
          <span>35&deg;C</span>
          <span>45&deg;C</span>
        </div>
      </div>

      {/* Medication warning cards */}
      <div className="space-y-3 pt-3">
        {sensitiveMeds.map((med) => {
          const risk = getRiskLevel(currentTemp, med.maxTemp, med.requiresColdChain);
          const riskLabel = getRiskLabel(risk);
          const tip = getStorageTip(med.requiresColdChain, med.maxTemp);

          const cardStyles = {
            danger:
              "border-red-300/50 dark:border-red-700/50 bg-warm-50 dark:bg-gray-900/50",
            warning:
              "border-amber-300/50 dark:border-amber-700/50 bg-warm-50 dark:bg-gray-900/50",
            safe:
              "border-green-300/50 dark:border-green-700/50 bg-warm-50 dark:bg-gray-900/50",
          };

          const riskBadgeStyles = {
            danger:
              "text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/40",
            warning:
              "text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/40",
            safe:
              "text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/40",
          };

          return (
            <div
              key={med.name}
              className={`rounded-lg border ${cardStyles[risk]} p-3 space-y-2`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  {med.requiresColdChain ? (
                    <SnowflakeIcon className="w-5 h-5 text-blue-500 dark:text-blue-400 shrink-0" />
                  ) : (
                    <RiskIcon level={risk} />
                  )}
                  <h4 className="text-sm font-body font-bold text-gray-900 dark:text-gray-100">
                    {med.name}
                  </h4>
                </div>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-body font-semibold rounded-full ${riskBadgeStyles[risk]}`}
                >
                  <RiskIcon
                    level={risk}
                    className="w-3.5 h-3.5"
                  />
                  {riskLabel}
                </span>
              </div>

              <div className="text-sm font-body text-gray-600 dark:text-gray-400">
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  Required storage:
                </span>{" "}
                {med.storageInstructions}
              </div>

              {med.requiresColdChain && (
                <div className="text-xs font-body text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 px-2.5 py-1.5 rounded-md border border-blue-200/50 dark:border-blue-800/50">
                  Refrigerate ({med.maxTemp}&deg;C max) &mdash; Cold chain required
                </div>
              )}

              {risk !== "safe" && (
                <div className="flex items-start gap-2 text-xs font-body text-gray-500 dark:text-gray-400 bg-warm-100 dark:bg-gray-800/50 px-2.5 py-1.5 rounded-md">
                  <svg
                    className="w-4 h-4 shrink-0 mt-0.5 text-[#C9A84C]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                  <span>
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Tip:
                    </span>{" "}
                    {tip}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
