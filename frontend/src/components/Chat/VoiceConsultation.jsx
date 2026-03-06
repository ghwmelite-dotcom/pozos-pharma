import { useState, useEffect, useRef, useCallback } from "react";

const LANGUAGES = [
  { code: "en-GH", label: "English", short: "EN" },
  { code: "ak-GH", label: "Twi", short: "TW" },
  { code: "gaa", label: "Ga", short: "GA" },
];

const STATES = {
  IDLE: "IDLE",
  LISTENING: "LISTENING",
  PROCESSING: "PROCESSING",
  DONE: "DONE",
};

function getSpeechRecognition() {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

/** Microphone SVG icon */
function MicIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
      <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
    </svg>
  );
}

/** Waveform bars animation (CSS-only) */
function WaveformBars() {
  return (
    <div className="flex items-end gap-1 h-8" aria-hidden="true">
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <span
          key={i}
          className="w-1 rounded-full bg-[#C9A84C]"
          style={{
            animation: `waveBar 1.2s ease-in-out ${i * 0.1}s infinite alternate`,
            height: "4px",
          }}
        />
      ))}
      <style>{`
        @keyframes waveBar {
          0% { height: 4px; opacity: 0.4; }
          100% { height: 28px; opacity: 1; }
        }
      `}</style>
    </div>
  );
}

/** Gold spinner */
function GoldSpinner() {
  return (
    <div className="flex items-center justify-center" aria-hidden="true">
      <svg className="w-8 h-8 animate-spin" viewBox="0 0 24 24" fill="none">
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="#C9A84C"
          strokeWidth="3"
        />
        <path
          className="opacity-75"
          fill="#C9A84C"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
}

export default function VoiceConsultation({ onSend, language = "en" }) {
  const [state, setState] = useState(STATES.IDLE);
  const [selectedLang, setSelectedLang] = useState(() => {
    const match = LANGUAGES.find((l) => l.code.startsWith(language));
    return match ? match.code : "en-GH";
  });
  const [transcript, setTranscript] = useState("");
  const [interimText, setInterimText] = useState("");
  const [isSupported, setIsSupported] = useState(true);

  const recognitionRef = useRef(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition) {
      setIsSupported(false);
    }
    return () => {
      isMountedRef.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const startListening = useCallback(() => {
    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = selectedLang;
    recognition.interimResults = true;
    recognition.continuous = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      if (isMountedRef.current) {
        setState(STATES.LISTENING);
        setTranscript("");
        setInterimText("");
      }
    };

    recognition.onresult = (event) => {
      if (!isMountedRef.current) return;
      let final = "";
      let interim = "";
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }
      setTranscript(final);
      setInterimText(interim);
    };

    recognition.onerror = (event) => {
      if (!isMountedRef.current) return;
      // If the language is not supported, fall back to en-GH
      if (
        event.error === "language-not-supported" &&
        selectedLang !== "en-GH"
      ) {
        recognition.lang = "en-GH";
        try {
          recognition.start();
        } catch {
          setState(STATES.IDLE);
        }
        return;
      }
      if (event.error !== "aborted") {
        setState(STATES.IDLE);
      }
    };

    recognition.onend = () => {
      if (!isMountedRef.current) return;
      if (state === STATES.LISTENING || transcript || interimText) {
        setState(STATES.PROCESSING);
        // Brief simulated processing delay, then show result
        setTimeout(() => {
          if (isMountedRef.current) {
            setState(STATES.DONE);
          }
        }, 600);
      } else {
        setState(STATES.IDLE);
      }
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch {
      setState(STATES.IDLE);
    }
  }, [selectedLang]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
  }, []);

  const handleMicClick = useCallback(() => {
    if (state === STATES.IDLE) {
      startListening();
    } else if (state === STATES.LISTENING) {
      stopListening();
    }
  }, [state, startListening, stopListening]);

  const handleSendToChat = useCallback(() => {
    const finalText = (transcript + " " + interimText).trim();
    if (finalText && onSend) {
      onSend(finalText);
    }
    setTranscript("");
    setInterimText("");
    setState(STATES.IDLE);
  }, [transcript, interimText, onSend]);

  const handleTryAgain = useCallback(() => {
    setTranscript("");
    setInterimText("");
    setState(STATES.IDLE);
  }, []);

  const displayText = (transcript + " " + interimText).trim();

  // Unsupported browser
  if (!isSupported) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-warm-100 dark:bg-gray-800 flex items-center justify-center border-2 border-warm-300 dark:border-gray-600">
          <svg
            className="w-8 h-8 text-gray-400 dark:text-gray-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="1" y1="1" x2="23" y2="23" />
            <path d="M9 9v3a3 3 0 005.12 2.12M15 9.34V4a3 3 0 00-5.94-.6" />
            <path d="M17 16.95A7 7 0 015 12m14 0a7 7 0 01-.11 1.23" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
          </svg>
        </div>
        <p className="text-sm font-body font-medium text-gray-600 dark:text-gray-400">
          Speech recognition is not supported in this browser.
        </p>
        <p className="text-xs font-body text-gray-500 dark:text-gray-500">
          Please use Chrome, Edge, or Safari for voice consultation.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-6 p-6">
      {/* Language Selector */}
      <div className="flex items-center gap-2" role="radiogroup" aria-label="Select language">
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            type="button"
            role="radio"
            aria-checked={selectedLang === lang.code}
            aria-label={`Select ${lang.label}`}
            onClick={() => {
              if (state === STATES.IDLE) setSelectedLang(lang.code);
            }}
            disabled={state !== STATES.IDLE}
            className={`
              px-3.5 py-1.5 text-sm font-body font-medium rounded-full transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
              ${
                selectedLang === lang.code
                  ? "bg-[#C9A84C] text-gray-900 shadow-md shadow-[#C9A84C]/20"
                  : "bg-warm-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-warm-200 dark:hover:bg-gray-700 border border-warm-200 dark:border-gray-700"
              }
            `}
          >
            {lang.label}
          </button>
        ))}
      </div>

      {/* Microphone Button */}
      <div className="relative flex items-center justify-center">
        {/* Pulsing ring when listening */}
        {state === STATES.LISTENING && (
          <>
            <span
              className="absolute w-28 h-28 rounded-full border-2 border-red-400/60 dark:border-red-500/40 animate-ping"
              aria-hidden="true"
            />
            <span
              className="absolute w-32 h-32 rounded-full border border-[#C9A84C]/30 animate-pulse"
              aria-hidden="true"
            />
          </>
        )}

        {/* Gold ring border */}
        <button
          type="button"
          onClick={handleMicClick}
          disabled={state === STATES.PROCESSING || state === STATES.DONE}
          aria-label={
            state === STATES.IDLE
              ? "Tap to speak your question"
              : state === STATES.LISTENING
                ? "Tap to stop recording"
                : state === STATES.PROCESSING
                  ? "Processing your speech"
                  : "Speech converted"
          }
          className={`
            relative z-10 w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300
            focus:outline-none focus:ring-4 focus:ring-[#C9A84C]/30
            disabled:cursor-not-allowed
            ${
              state === STATES.LISTENING
                ? "bg-red-500/90 dark:bg-red-600/90 border-4 border-[#C9A84C] shadow-lg shadow-red-500/30"
                : state === STATES.PROCESSING
                  ? "bg-warm-100 dark:bg-gray-800 border-4 border-[#E8D48B] cursor-wait"
                  : "bg-warm-50 dark:bg-gray-900 border-4 border-[#C9A84C] hover:border-[#E8D48B] hover:shadow-lg hover:shadow-[#C9A84C]/20 active:scale-95"
            }
          `}
        >
          {state === STATES.PROCESSING ? (
            <GoldSpinner />
          ) : (
            <MicIcon
              className={`w-10 h-10 transition-colors ${
                state === STATES.LISTENING
                  ? "text-white"
                  : "text-[#C9A84C] dark:text-[#E8D48B]"
              }`}
            />
          )}
        </button>
      </div>

      {/* Status Text */}
      <div className="text-center space-y-2">
        {state === STATES.IDLE && (
          <p className="text-sm font-body text-gray-500 dark:text-gray-400">
            Tap to speak your question
          </p>
        )}
        {state === STATES.LISTENING && (
          <div className="flex flex-col items-center gap-3">
            <WaveformBars />
            <p className="text-sm font-body font-medium text-red-500 dark:text-red-400 animate-pulse">
              Listening...
            </p>
          </div>
        )}
        {state === STATES.PROCESSING && (
          <p className="text-sm font-body font-medium text-[#C9A84C] dark:text-[#E8D48B]">
            Converting speech...
          </p>
        )}
      </div>

      {/* Real-time transcript (during listening) */}
      {state === STATES.LISTENING && displayText && (
        <div className="w-full max-w-sm px-4 py-3 rounded-lg bg-warm-100/80 dark:bg-gray-800/60 border border-warm-200 dark:border-gray-700">
          <p className="text-sm font-body text-gray-700 dark:text-gray-300">
            {transcript}
            {interimText && (
              <span className="text-gray-400 dark:text-gray-500 italic">
                {transcript ? " " : ""}
                {interimText}
              </span>
            )}
          </p>
        </div>
      )}

      {/* Done State — dark-glass panel with results */}
      {state === STATES.DONE && (
        <div className="w-full max-w-sm space-y-4 animate-stagger">
          {/* Transcribed text in dark-glass panel */}
          <div className="dark-glass rounded-xl px-4 py-4 border border-warm-200/30 dark:border-gray-700/50 bg-warm-100/90 dark:bg-gray-900/80 backdrop-blur-sm">
            <p className="text-xs font-body font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
              Transcribed Text
            </p>
            {displayText ? (
              <p className="text-sm font-body text-gray-800 dark:text-gray-200 leading-relaxed">
                {displayText}
              </p>
            ) : (
              <p className="text-sm font-body text-gray-400 dark:text-gray-500 italic">
                No speech detected. Please try again.
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSendToChat}
              disabled={!displayText}
              aria-label="Send transcribed text to chat"
              className="flex-1 px-4 py-2.5 text-sm font-body font-semibold text-gray-900 bg-[#C9A84C] hover:bg-[#A8893A] active:bg-[#A8893A] disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors shadow-sm shadow-[#C9A84C]/20"
            >
              Send to Chat
            </button>
            <button
              type="button"
              onClick={handleTryAgain}
              aria-label="Try recording again"
              className="flex-1 px-4 py-2.5 text-sm font-body font-medium text-gray-600 dark:text-gray-300 bg-warm-100 dark:bg-gray-800 hover:bg-warm-200 dark:hover:bg-gray-700 border border-warm-200 dark:border-gray-700 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
