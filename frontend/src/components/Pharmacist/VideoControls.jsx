/**
 * Video call control bar for PozosPharma pharmacist consultations.
 *
 * Floating bar with mic toggle, camera toggle, and end call buttons.
 *
 * @param {object} props
 * @param {boolean} props.micOn
 * @param {boolean} props.cameraOn
 * @param {Function} props.onToggleMic
 * @param {Function} props.onToggleCamera
 * @param {Function} props.onEndCall
 */
export default function VideoControls({
  micOn,
  cameraOn,
  onToggleMic,
  onToggleCamera,
  onEndCall,
}) {
  return (
    <div className="flex items-center justify-center gap-4 py-4 bg-gray-900/80 backdrop-blur-sm">
      {/* Mic toggle */}
      <button
        type="button"
        onClick={onToggleMic}
        className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
          micOn
            ? "bg-gray-700 hover:bg-gray-600 text-white"
            : "bg-red-600 hover:bg-red-500 text-white"
        }`}
        aria-label={micOn ? "Mute microphone" : "Unmute microphone"}
        title={micOn ? "Mute" : "Unmute"}
      >
        {micOn ? (
          <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
            />
          </svg>
        ) : (
          <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 3l18 18"
            />
          </svg>
        )}
      </button>

      {/* Camera toggle */}
      <button
        type="button"
        onClick={onToggleCamera}
        className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
          cameraOn
            ? "bg-gray-700 hover:bg-gray-600 text-white"
            : "bg-red-600 hover:bg-red-500 text-white"
        }`}
        aria-label={cameraOn ? "Turn off camera" : "Turn on camera"}
        title={cameraOn ? "Camera off" : "Camera on"}
      >
        {cameraOn ? (
          <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z"
            />
          </svg>
        ) : (
          <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 3l18 18"
            />
          </svg>
        )}
      </button>

      {/* End call */}
      <button
        type="button"
        onClick={onEndCall}
        className="w-14 h-12 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center transition-colors"
        aria-label="End call"
        title="End call"
      >
        <svg
          className="w-6 h-6"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M1.5 4.5a3 3 0 013-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 01-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 006.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 011.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 01-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5z" />
          <path d="M19.5 4.5l-15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
        </svg>
      </button>
    </div>
  );
}
