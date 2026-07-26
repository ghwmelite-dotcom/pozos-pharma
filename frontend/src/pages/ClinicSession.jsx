import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import useWebSocket from "../hooks/useWebSocket";
import ClinicalToolkit from "../components/Clinic/ClinicalToolkit";

const API_URL = import.meta.env.VITE_API_URL || "";

const RTC_CONFIG = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

/* Duration limits in seconds per tier */
const TIER_DURATION = {
  quick: 15 * 60,
  standard: 30 * 60,
  comprehensive: 45 * 60,
};

/* ── Format MM:SS ─────────────────────────────────────────────── */
function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/* ── Star Rating (interactive) ────────────────────────────────── */
function InteractiveStarRating({ rating, onRate }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onRate(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          className="transition-transform hover:scale-110"
          aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
        >
          <svg
            className={`w-8 h-8 ${
              star <= (hover || rating) ? "text-[#C9A84C]" : "text-gray-600"
            } transition-colors`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
    </div>
  );
}

/* ── Connecting Spinner ───────────────────────────────────────── */
function ConnectingOverlay() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-900/90 z-10">
      <div className="text-center space-y-4">
        <div className="relative w-20 h-20 mx-auto">
          <div className="absolute inset-0 rounded-full border-2 border-[#C9A84C]/20" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#C9A84C] animate-spin" />
          <div
            className="absolute inset-2 rounded-full border-2 border-transparent border-t-[#E8D48B] animate-spin"
            style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
          />
        </div>
        <p className="text-[#E8D48B] font-display text-lg animate-pulse">
          Connecting to session...
        </p>
        <p className="text-gray-400 text-sm font-body">
          Waiting for the other participant to join
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ClinicSession — Virtual Office split-screen consultation page
   ═══════════════════════════════════════════════════════════════ */
export default function ClinicSession() {
  const { sessionId } = useParams();
  const { user, token, isAuthenticated } = useAuth();

  /* ── Session & call state ───────────────────────────────── */
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [callStatus, setCallStatus] = useState("connecting"); // connecting | connected | ended
  const [showPostSession, setShowPostSession] = useState(false);

  /* ── Post-session state ─────────────────────────────────── */
  const [aiSummary, setAiSummary] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [starRating, setStarRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  /* ── Refs ────────────────────────────────────────────────── */
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const pcRef = useRef(null);
  const pendingCandidatesRef = useRef([]);
  const hasCreatedOfferRef = useRef(false);
  const timerRef = useRef(null);
  const videoContainerRef = useRef(null);

  /* ── Derived ────────────────────────────────────────────── */
  const isPharmacist =
    session &&
    user &&
    (session.pharmacist_user_id === user.id ||
      session.pharmacist_id === user.id ||
      (user.role === "pharmacist" || user.role === "admin"));
  const isAudioOnly = session?.tier === "quick";
  const durationLimit = TIER_DURATION[session?.tier] || 30 * 60;
  const timeRemaining = durationLimit - elapsed;
  const isWarning = timeRemaining <= 120 && timeRemaining > 0;

  /* Determine remote user id for signaling */
  const remoteUserId = session
    ? isPharmacist
      ? session.user_id
      : session.pharmacist_user_id || session.pharmacist_id
    : null;

  /* ── WebSocket ──────────────────────────────────────────── */
  const roomSlug = sessionId ? `clinic-${sessionId}` : null;
  const { sendWsMessage, isConnected, onlineUsers, videoSignal } =
    useWebSocket(roomSlug);

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  /* ── Fetch session data ─────────────────────────────────── */
  useEffect(() => {
    if (!sessionId || !token) return;

    const fetchSession = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/clinic/session/${sessionId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to load session");
        const data = await res.json();
        const s = data.session || data;
        setSession(s);

        // If already completed, show post-session
        if (s.status === "completed" || s.status === "summarized") {
          setCallStatus("ended");
          setShowPostSession(true);
          if (s.summary) setAiSummary(s.summary);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [sessionId, token]);

  /* ── Initialize media & peer connection ─────────────────── */
  useEffect(() => {
    if (!session || callStatus === "ended" || showPostSession) return;

    let cancelled = false;

    const init = async () => {
      try {
        const constraints = {
          audio: true,
          video: isAudioOnly ? false : true,
        };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        const pc = new RTCPeerConnection(RTC_CONFIG);
        pcRef.current = pc;

        stream.getTracks().forEach((track) => {
          pc.addTrack(track, stream);
        });

        pc.ontrack = (event) => {
          if (remoteVideoRef.current && event.streams[0]) {
            remoteVideoRef.current.srcObject = event.streams[0];
          }
        };

        pc.onicecandidate = (event) => {
          if (event.candidate && remoteUserId) {
            sendWsMessage({
              type: "video_ice",
              targetUserId: remoteUserId,
              data: event.candidate,
            });
          }
        };

        pc.onconnectionstatechange = () => {
          if (pc.connectionState === "connected") {
            setCallStatus("connected");
          } else if (
            pc.connectionState === "disconnected" ||
            pc.connectionState === "failed"
          ) {
            // Only end if we haven't already ended
            if (callStatus !== "ended") {
              setCallStatus("ended");
            }
          }
        };

        // Pharmacist initiates the call when ready
        if (isPharmacist && !hasCreatedOfferRef.current && remoteUserId) {
          hasCreatedOfferRef.current = true;
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          sendWsMessage({
            type: "video_offer",
            targetUserId: remoteUserId,
            data: offer,
          });
        }

        // Flush buffered ICE candidates
        for (const candidate of pendingCandidatesRef.current) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
          } catch (e) {
            console.warn("[ClinicSession] Failed to add buffered ICE:", e);
          }
        }
        pendingCandidatesRef.current = [];
      } catch (err) {
        console.error("[ClinicSession] Media init error:", err);
        setError("Could not access camera/microphone. Please check permissions.");
      }
    };

    init();

    return () => {
      cancelled = true;
    };
  }, [session, isAudioOnly, isPharmacist, remoteUserId]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Handle incoming WebRTC signals ─────────────────────── */
  useEffect(() => {
    if (!videoSignal) return;

    const handleSignal = async () => {
      const pc = pcRef.current;

      if (videoSignal.type === "video_offer") {
        if (!pc) return;
        try {
          await pc.setRemoteDescription(
            new RTCSessionDescription(videoSignal.data)
          );
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          sendWsMessage({
            type: "video_answer",
            targetUserId: videoSignal.fromUserId,
            data: answer,
          });
        } catch (e) {
          console.error("[ClinicSession] Error handling offer:", e);
        }
      } else if (videoSignal.type === "video_answer") {
        if (!pc) return;
        try {
          await pc.setRemoteDescription(
            new RTCSessionDescription(videoSignal.data)
          );
        } catch (e) {
          console.error("[ClinicSession] Error handling answer:", e);
        }
      } else if (videoSignal.type === "video_ice") {
        if (!pc || !pc.remoteDescription) {
          pendingCandidatesRef.current.push(videoSignal.data);
          return;
        }
        try {
          await pc.addIceCandidate(new RTCIceCandidate(videoSignal.data));
        } catch (e) {
          console.warn("[ClinicSession] Failed to add ICE candidate:", e);
        }
      }
    };

    handleSignal();
  }, [videoSignal?._ts]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Session timer ──────────────────────────────────────── */
  useEffect(() => {
    if (callStatus === "connected") {
      timerRef.current = setInterval(() => {
        setElapsed((prev) => {
          const next = prev + 1;
          if (next >= durationLimit) {
            handleEndCall();
          }
          return next;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [callStatus, durationLimit]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Call controls ──────────────────────────────────────── */
  const toggleMute = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;
    stream.getAudioTracks().forEach((t) => {
      t.enabled = !t.enabled;
    });
    setIsMuted((prev) => !prev);
  }, []);

  const toggleCamera = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;
    stream.getVideoTracks().forEach((t) => {
      t.enabled = !t.enabled;
    });
    setIsCameraOff((prev) => !prev);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!videoContainerRef.current) return;
    if (!document.fullscreenElement) {
      videoContainerRef.current.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  }, []);

  /* ── End call ───────────────────────────────────────────── */
  const handleEndCall = useCallback(async () => {
    // Stop media tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    // Close peer connection
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    // Stop timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setCallStatus("ended");

    // Update session status
    try {
      await fetch(`${API_URL}/api/clinic/session/${sessionId}/status`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ status: "completed" }),
      });
    } catch (e) {
      console.error("[ClinicSession] Failed to update status:", e);
    }

    // Request AI summary
    try {
      setSummaryLoading(true);
      await fetch(`${API_URL}/api/clinic/summary`, {
        method: "POST",
        headers,
        body: JSON.stringify({ consultationId: sessionId }),
      });
    } catch (e) {
      console.error("[ClinicSession] Failed to request summary:", e);
    }

    setShowPostSession(true);
    pollForSummary();
  }, [sessionId, token]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Poll for AI summary ────────────────────────────────── */
  const pollForSummary = useCallback(() => {
    let attempts = 0;
    const maxAttempts = 15;
    const interval = setInterval(async () => {
      attempts++;
      try {
        const res = await fetch(`${API_URL}/api/clinic/session/${sessionId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          const s = data.session || data;
          if (s.summary) {
            setAiSummary(s.summary);
            setSummaryLoading(false);
            clearInterval(interval);
            return;
          }
          if (s.status === "summarized") {
            setAiSummary(s.summary || "Summary generated.");
            setSummaryLoading(false);
            clearInterval(interval);
            return;
          }
        }
      } catch {
        /* retry */
      }
      if (attempts >= maxAttempts) {
        setSummaryLoading(false);
        clearInterval(interval);
      }
    }, 3000);
  }, [sessionId, token]);

  /* ── Submit rating ──────────────────────────────────────── */
  const handleSubmitRating = async () => {
    if (starRating === 0) return;
    try {
      await fetch(`${API_URL}/api/clinic/session/${sessionId}/rate`, {
        method: "POST",
        headers,
        body: JSON.stringify({ rating: starRating, review: reviewText.trim() }),
      });
      setRatingSubmitted(true);
    } catch (e) {
      console.error("[ClinicSession] Failed to submit rating:", e);
    }
  };

  /* ── Cleanup on unmount ─────────────────────────────────── */
  useEffect(() => {
    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (pcRef.current) {
        pcRef.current.close();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  /* ═══════════════════ RENDER ═══════════════════════════════ */

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center font-body">
        <div className="text-center space-y-4">
          <p className="text-gray-400 text-lg">Please log in to access this session.</p>
          <Link
            to="/clinic"
            className="inline-block px-6 py-2.5 rounded-xl font-semibold bg-gradient-to-r from-[#C9A84C] to-[#E8D48B] text-gray-900"
          >
            Go to Clinic
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-2 border-[#C9A84C]/20" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#C9A84C] animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center font-body">
        <div className="text-center space-y-4 max-w-md px-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M15 9l-6 6M9 9l6 6" />
            </svg>
          </div>
          <p className="text-red-400 text-lg">{error}</p>
          <Link
            to="/clinic"
            className="inline-block px-6 py-2.5 rounded-xl font-semibold border border-gray-600 text-gray-300 hover:bg-gray-800 transition-colors"
          >
            Back to Clinic
          </Link>
        </div>
      </div>
    );
  }

  /* ── Post-session screen ────────────────────────────────── */
  if (showPostSession) {
    return (
      <div className="min-h-screen bg-gray-950 font-body text-white">
        <div className="max-w-2xl mx-auto px-4 py-12 sm:py-20 space-y-8">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="w-20 h-20 mx-auto rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center">
              <svg className="w-10 h-10 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl gold-text">Session Complete</h1>
            <p className="text-gray-400">
              Duration: {formatTime(elapsed)} | {session?.tier || "standard"} session
            </p>
          </div>

          {/* AI Summary */}
          <div className="bg-gray-900/80 backdrop-blur border border-gray-700/50 rounded-2xl p-6">
            <h2 className="font-display text-xl text-[#E8D48B] mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                <rect x="9" y="3" width="6" height="4" rx="1" />
              </svg>
              AI Session Summary
            </h2>
            {summaryLoading ? (
              <div className="flex items-center gap-3 py-4">
                <div className="w-5 h-5 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-400 text-sm">Generating summary...</p>
              </div>
            ) : aiSummary ? (
              <div className="prose prose-invert prose-sm max-w-none">
                <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{aiSummary}</p>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No summary available yet.</p>
            )}
          </div>

          {/* Rating (patient only) */}
          {!isPharmacist && (
            <div className="bg-gray-900/80 backdrop-blur border border-gray-700/50 rounded-2xl p-6">
              <h2 className="font-display text-xl text-[#E8D48B] mb-4">Rate Your Pharmacist</h2>
              {ratingSubmitted ? (
                <div className="text-center py-4">
                  <p className="text-green-400 font-semibold">Thank you for your feedback!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <InteractiveStarRating rating={starRating} onRate={setStarRating} />
                  <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Share your experience (optional)..."
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#C9A84C]/50 focus:ring-1 focus:ring-[#C9A84C]/30 transition-colors resize-none"
                  />
                  <button
                    onClick={handleSubmitRating}
                    disabled={starRating === 0}
                    className="px-6 py-2.5 rounded-xl font-semibold bg-gradient-to-r from-[#C9A84C] to-[#E8D48B] text-gray-900 hover:shadow-lg hover:shadow-[#C9A84C]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Submit Rating
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Back to Clinic */}
          <div className="text-center">
            <Link
              to="/clinic"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-semibold bg-gradient-to-r from-[#C9A84C] to-[#E8D48B] text-gray-900 hover:shadow-lg hover:shadow-[#C9A84C]/20 transition-all duration-300"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Clinic
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ── Active session layout ──────────────────────────────── */
  return (
    <div className="h-screen bg-gray-950 font-body text-white flex flex-col lg:flex-row overflow-hidden">
      {/* ── Video Panel (70%) ──────────────────────────────── */}
      <div
        ref={videoContainerRef}
        className="relative flex-1 lg:w-[70%] flex flex-col min-h-[50vh] lg:min-h-0"
      >
        {/* Connection status badge */}
        <div className="absolute top-4 left-4 z-20 flex items-center gap-3">
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full backdrop-blur ${
              callStatus === "connected"
                ? "bg-green-500/15 text-green-300"
                : "bg-yellow-500/15 text-yellow-300"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                callStatus === "connected"
                  ? "bg-green-400"
                  : "bg-yellow-400 animate-pulse"
              }`}
            />
            {callStatus === "connected" ? "Connected" : "Connecting..."}
          </span>

          {isConnected && (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-blue-500/15 text-blue-300 backdrop-blur">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 00-3-3.87" />
                <path d="M16 3.13a4 4 0 010 7.75" />
              </svg>
              {onlineUsers.length} online
            </span>
          )}
        </div>

        {/* Timer */}
        <div className="absolute top-4 right-4 z-20">
          <span
            className={`inline-flex items-center gap-1.5 text-sm font-mono font-semibold px-3 py-1.5 rounded-full backdrop-blur ${
              isWarning
                ? "bg-red-500/20 text-red-300 animate-pulse"
                : "bg-black/40 text-white"
            }`}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
            {formatTime(elapsed)}
          </span>
        </div>

        {/* Connecting overlay */}
        {callStatus === "connecting" && <ConnectingOverlay />}

        {/* Remote video */}
        <div className="flex-1 bg-black rounded-b-2xl lg:rounded-2xl lg:m-2 overflow-hidden relative">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />

          {/* Audio-only placeholder */}
          {isAudioOnly && callStatus === "connected" && (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
              <div className="text-center space-y-3">
                <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-[#C9A84C]/20 to-[#A8893A]/20 border-2 border-[#C9A84C]/30 flex items-center justify-center">
                  <svg className="w-12 h-12 text-[#C9A84C]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
                    <path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8" />
                  </svg>
                </div>
                <p className="text-[#E8D48B] font-display text-lg">Audio Consultation</p>
                <p className="text-gray-400 text-sm">
                  {isPharmacist ? session?.patient_name || "Patient" : session?.pharmacist_name || "Pharmacist"}
                </p>
              </div>
            </div>
          )}

          {/* No remote video placeholder */}
          {!isAudioOnly && callStatus === "connecting" && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto rounded-full bg-gray-700 flex items-center justify-center mb-4">
                  <svg className="w-10 h-10 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </div>
                <p className="text-gray-400 text-sm">Waiting for participant...</p>
              </div>
            </div>
          )}

          {/* Local video (PiP) */}
          {!isAudioOnly && (
            <div className="absolute bottom-20 right-4 w-36 h-28 sm:w-40 sm:h-30 rounded-lg overflow-hidden border-2 border-[#C9A84C] shadow-lg bg-gray-800 z-10">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                style={{ transform: "scaleX(-1)" }}
              />
              {isCameraOff && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                  <svg className="w-6 h-6 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M12 18.75H4.5a2.25 2.25 0 01-2.25-2.25V7.5A2.25 2.25 0 014.5 5.25h7.5" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75l16.5 16.5" />
                  </svg>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Controls bar ─────────────────────────────────── */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 px-6 py-3 bg-gray-900/90 backdrop-blur rounded-full shadow-xl">
          {/* Mute */}
          <button
            type="button"
            onClick={toggleMute}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              isMuted
                ? "bg-red-600 hover:bg-red-500 text-white"
                : "bg-gray-700 hover:bg-gray-600 text-white"
            }`}
            aria-label={isMuted ? "Unmute" : "Mute"}
            title={isMuted ? "Unmute" : "Mute"}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
              {isMuted && (
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
              )}
            </svg>
          </button>

          {/* Camera (hidden for audio-only) */}
          {!isAudioOnly && (
            <button
              type="button"
              onClick={toggleCamera}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                isCameraOff
                  ? "bg-red-600 hover:bg-red-500 text-white"
                  : "bg-gray-700 hover:bg-gray-600 text-white"
              }`}
              aria-label={isCameraOff ? "Turn on camera" : "Turn off camera"}
              title={isCameraOff ? "Camera on" : "Camera off"}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                {isCameraOff && (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75l16.5 16.5" />
                )}
              </svg>
            </button>
          )}

          {/* Fullscreen */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="w-12 h-12 rounded-full flex items-center justify-center bg-gray-700 hover:bg-gray-600 text-white transition-all"
            aria-label="Toggle fullscreen"
            title="Fullscreen"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {isFullscreen ? (
                <>
                  <path d="M8 3v3a2 2 0 01-2 2H3m18 0h-3a2 2 0 01-2-2V3m0 18v-3a2 2 0 012-2h3M3 16h3a2 2 0 012 2v3" />
                </>
              ) : (
                <>
                  <path d="M8 3H5a2 2 0 00-2 2v3m18-5h-3a2 2 0 00-2 2v3m0 8v3a2 2 0 002 2h3M3 16v3a2 2 0 002 2h3" />
                </>
              )}
            </svg>
          </button>

          {/* End Call */}
          <button
            type="button"
            onClick={handleEndCall}
            className="w-14 h-12 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center transition-all"
            aria-label="End call"
            title="End call"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M1.5 4.5a3 3 0 013-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 01-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 006.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 011.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 01-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5z" />
              <path d="M19.5 4.5l-15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Clinical Toolkit Panel (30%) ───────────────────── */}
      <div className="lg:w-[30%] w-full border-t lg:border-t-0 lg:border-l border-gray-800 bg-gray-950 overflow-hidden flex flex-col max-h-[50vh] lg:max-h-none">
        <ClinicalToolkit
          consultationId={sessionId}
          session={session}
          isPharmacist={isPharmacist}
          token={token}
        />
      </div>
    </div>
  );
}
