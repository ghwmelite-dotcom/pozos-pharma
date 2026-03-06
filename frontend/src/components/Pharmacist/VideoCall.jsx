import { useState, useEffect, useRef, useCallback } from "react";
import VideoControls from "./VideoControls";

const RTC_CONFIG = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

/**
 * WebRTC Video Call component for PozosPharma pharmacist consultations.
 *
 * Uses the existing WebSocket connection as a signaling channel.
 *
 * @param {object} props
 * @param {string} props.roomSlug - Current chat room
 * @param {string} props.remoteUserId - Target user to call
 * @param {Function} props.onEnd - Callback when the call ends
 * @param {boolean} props.isInitiator - Whether this side creates the offer
 * @param {Function} props.sendSignal - Function to send signaling messages via WebSocket
 * @param {object|null} props.incomingSignal - Latest incoming signal from the remote peer
 */
export default function VideoCall({
  roomSlug,
  remoteUserId,
  onEnd,
  isInitiator,
  sendSignal,
  incomingSignal,
}) {
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [connectionState, setConnectionState] = useState("connecting");

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const pendingCandidatesRef = useRef([]);
  const hasCreatedOfferRef = useRef(false);

  // Clean up everything
  const cleanUp = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
  }, []);

  // Initialize peer connection + local media
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        // Get local media
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // Create peer connection
        const pc = new RTCPeerConnection(RTC_CONFIG);
        pcRef.current = pc;

        // Add local tracks
        stream.getTracks().forEach((track) => {
          pc.addTrack(track, stream);
        });

        // Handle remote tracks
        pc.ontrack = (event) => {
          if (remoteVideoRef.current && event.streams[0]) {
            remoteVideoRef.current.srcObject = event.streams[0];
          }
        };

        // ICE candidates
        pc.onicecandidate = (event) => {
          if (event.candidate) {
            sendSignal({
              type: "video_ice",
              targetUserId: remoteUserId,
              data: event.candidate,
            });
          }
        };

        // Connection state
        pc.onconnectionstatechange = () => {
          setConnectionState(pc.connectionState);
          if (
            pc.connectionState === "disconnected" ||
            pc.connectionState === "failed"
          ) {
            onEnd();
          }
        };

        // If initiator, create and send the offer
        if (isInitiator && !hasCreatedOfferRef.current) {
          hasCreatedOfferRef.current = true;
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          sendSignal({
            type: "video_offer",
            targetUserId: remoteUserId,
            data: offer,
          });
        }

        // Apply any ICE candidates that arrived before the PC was ready
        for (const candidate of pendingCandidatesRef.current) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
          } catch (e) {
            console.warn("[VideoCall] Failed to add buffered ICE candidate:", e);
          }
        }
        pendingCandidatesRef.current = [];
      } catch (err) {
        console.error("[VideoCall] Init error:", err);
        setConnectionState("failed");
      }
    };

    init();

    return () => {
      cancelled = true;
      cleanUp();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle incoming signals from the remote peer
  useEffect(() => {
    if (!incomingSignal) return;

    const handleSignal = async () => {
      const pc = pcRef.current;

      if (incomingSignal.type === "video_offer") {
        if (!pc) return;
        try {
          await pc.setRemoteDescription(
            new RTCSessionDescription(incomingSignal.data)
          );
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          sendSignal({
            type: "video_answer",
            targetUserId: incomingSignal.fromUserId,
            data: answer,
          });
        } catch (e) {
          console.error("[VideoCall] Error handling offer:", e);
        }
      } else if (incomingSignal.type === "video_answer") {
        if (!pc) return;
        try {
          await pc.setRemoteDescription(
            new RTCSessionDescription(incomingSignal.data)
          );
        } catch (e) {
          console.error("[VideoCall] Error handling answer:", e);
        }
      } else if (incomingSignal.type === "video_ice") {
        if (!pc || !pc.remoteDescription) {
          // Buffer ICE candidates until remote description is set
          pendingCandidatesRef.current.push(incomingSignal.data);
          return;
        }
        try {
          await pc.addIceCandidate(new RTCIceCandidate(incomingSignal.data));
        } catch (e) {
          console.warn("[VideoCall] Failed to add ICE candidate:", e);
        }
      }
    };

    handleSignal();
  }, [incomingSignal, sendSignal]);

  // Toggle mic
  const handleToggleMic = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;
    stream.getAudioTracks().forEach((t) => {
      t.enabled = !t.enabled;
    });
    setMicOn((prev) => !prev);
  }, []);

  // Toggle camera
  const handleToggleCamera = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;
    stream.getVideoTracks().forEach((t) => {
      t.enabled = !t.enabled;
    });
    setCameraOn((prev) => !prev);
  }, []);

  // End call
  const handleEndCall = useCallback(() => {
    cleanUp();
    onEnd();
  }, [cleanUp, onEnd]);

  return (
    <div className="fixed inset-0 z-50 bg-gray-900 flex flex-col">
      {/* Connection status */}
      {connectionState === "connecting" && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 px-4 py-2 rounded-full bg-black/60 text-white text-sm flex items-center gap-2">
          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Connecting...
        </div>
      )}

      {/* Remote video (full screen) */}
      <div className="flex-1 relative">
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />

        {/* No remote video placeholder */}
        {connectionState === "connecting" && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto rounded-full bg-gray-700 flex items-center justify-center mb-4">
                <svg
                  className="w-10 h-10 text-gray-500"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                  />
                </svg>
              </div>
              <p className="text-gray-400 text-sm">Waiting for remote user...</p>
            </div>
          </div>
        )}

        {/* Local video (PiP overlay) */}
        <div className="absolute bottom-24 right-4 w-36 h-28 sm:w-48 sm:h-36 rounded-xl overflow-hidden border-2 border-white/20 shadow-lg bg-gray-800">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover mirror"
            style={{ transform: "scaleX(-1)" }}
          />
          {!cameraOn && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
              <svg
                className="w-8 h-8 text-gray-500"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M12 18.75H4.5a2.25 2.25 0 01-2.25-2.25V7.5A2.25 2.25 0 014.5 5.25h7.5"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 3.75l16.5 16.5"
                />
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Controls bar */}
      <VideoControls
        micOn={micOn}
        cameraOn={cameraOn}
        onToggleMic={handleToggleMic}
        onToggleCamera={handleToggleCamera}
        onEndCall={handleEndCall}
      />
    </div>
  );
}
