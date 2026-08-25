import { useCallback, useEffect, useRef, useState } from "react";
import { sendActivityHeartbeat } from "../services/activityService";

const IDLE_TIMEOUT = 10 * 60 * 1000; // 10 minutes

const useActivityTracker = ({ attendanceId, enabled = false }) => {
  const [status, setStatus] = useState("active");

  const lastActivityTimeRef = useRef(Date.now());
  const currentStatusRef = useRef("active");

  const idleTimerRef = useRef(null);

  // =====================================================
  // Send status to backend
  // =====================================================

  const updateStatus = useCallback(
    async (newStatus) => {
      if (!attendanceId) {
        return;
      }

      if (currentStatusRef.current === newStatus) {
        return;
      }

      try {
        await sendActivityHeartbeat(attendanceId, newStatus);

        currentStatusRef.current = newStatus;
        setStatus(newStatus);
      } catch (error) {
        console.error("Failed to update activity status:", error);
      }
    },
    [attendanceId],
  );

  // =====================================================
  // Reset idle timer
  // =====================================================

  const resetIdleTimer = useCallback(() => {
    lastActivityTimeRef.current = Date.now();

    // If currently idle, become active
    if (currentStatusRef.current === "idle") {
      updateStatus("active");
    }

    // Clear previous timer
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }

    // Start new idle timer
    idleTimerRef.current = setTimeout(() => {
      updateStatus("idle");
    }, IDLE_TIMEOUT);
  }, [updateStatus]);

  // =====================================================
  // Activity listeners
  // =====================================================

  useEffect(() => {
    if (!enabled || !attendanceId) {
      return;
    }

    const events = [
      "mousemove",
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
      "click",
    ];

    events.forEach((event) => {
      window.addEventListener(event, resetIdleTimer);
    });

    // Start initial timer
    resetIdleTimer();

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, resetIdleTimer);
      });

      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
    };
  }, [enabled, attendanceId, resetIdleTimer]);

  // =====================================================
  // Return tracker state
  // =====================================================

  return {
    status,
    isActive: status === "active",
    isIdle: status === "idle",
  };
};

export default useActivityTracker;
