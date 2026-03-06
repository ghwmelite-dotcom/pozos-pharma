import { useState, useRef, useCallback } from 'react';
import useChatStore from '../../store/chatStore';

const API_URL = import.meta.env.VITE_API_URL || '';

/**
 * Voice input button for speech-to-text transcription.
 *
 * Three states:
 *  - idle: gray mic icon, hover indigo
 *  - recording: red pulsing background, white stop icon, duration display
 *  - processing: indigo spinner
 *
 * @param {object} props
 * @param {(text: string) => void} props.onTranscribe - Callback with transcribed text
 * @param {boolean} [props.disabled] - Disable the button
 */
export default function VoiceInput({ onTranscribe, disabled }) {
  const token = useChatStore((s) => s.token);
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState('');
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  const formatDuration = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const startRecording = useCallback(async () => {
    try {
      setError('');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : undefined,
      });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        clearInterval(timerRef.current);
        setRecording(false);
        setProcessing(true);

        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('audio', blob, 'recording.webm');

        try {
          const res = await fetch(`${API_URL}/api/voice/transcribe`, {
            method: 'POST',
            headers: {
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: formData,
          });
          if (!res.ok) throw new Error('Transcription failed');
          const data = await res.json();
          if (data.text) {
            onTranscribe(data.text);
          } else {
            setError('Could not understand audio');
          }
        } catch {
          setError('Transcription failed. Try again.');
        } finally {
          setProcessing(false);
          setDuration(0);
        }
      };

      mediaRecorder.start();
      setRecording(true);
      setDuration(0);
      timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);

      // Auto-stop after 30 seconds
      setTimeout(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
      }, 30000);
    } catch {
      setError('Microphone access denied');
    }
  }, [token, onTranscribe]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const handleClick = () => {
    if (recording) {
      stopRecording();
    } else if (!processing) {
      startRecording();
    }
  };

  return (
    <div className="relative flex items-center shrink-0">
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || processing}
        aria-label={
          recording
            ? 'Stop recording'
            : processing
              ? 'Processing audio'
              : 'Start voice input'
        }
        className={`
          relative flex items-center justify-center rounded-xl transition-all duration-200
          ${
            recording
              ? 'bg-red-500 hover:bg-red-600 text-white px-3 py-2.5 gap-2'
              : processing
                ? 'bg-brand-indigo/10 dark:bg-indigo-900/30 text-brand-indigo dark:text-indigo-300 px-3 py-2.5 cursor-wait'
                : 'text-gray-400 dark:text-gray-500 hover:text-brand-indigo dark:hover:text-indigo-400 hover:bg-warm-200/60 dark:hover:bg-gray-800 px-2.5 py-2.5'
          }
          disabled:opacity-40 disabled:cursor-not-allowed
        `}
      >
        {/* Pulsing ring when recording */}
        {recording && (
          <span
            className="absolute inset-0 rounded-xl bg-red-500 animate-ping opacity-30"
            aria-hidden="true"
          />
        )}

        {recording ? (
          <>
            {/* Stop icon */}
            <svg
              className="w-5 h-5 relative z-10"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <rect x="5" y="5" width="10" height="10" rx="1" />
            </svg>
            {/* Duration */}
            <span className="text-xs font-mono font-medium relative z-10">
              {formatDuration(duration)}
            </span>
          </>
        ) : processing ? (
          /* Spinner */
          <svg
            className="w-5 h-5 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          /* Microphone icon */
          <svg
            className="w-5 h-5"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </button>

      {/* Error tooltip */}
      {error && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-red-50 dark:bg-red-900/40 text-red-600 dark:text-red-400 text-[11px] font-medium px-2.5 py-1 rounded-lg shadow-sm border border-red-200 dark:border-red-800">
          {error}
          <button
            type="button"
            onClick={() => setError('')}
            className="ml-1.5 text-red-400 hover:text-red-600 dark:hover:text-red-300"
            aria-label="Dismiss error"
          >
            &times;
          </button>
        </div>
      )}
    </div>
  );
}
