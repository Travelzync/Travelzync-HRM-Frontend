import { useCallback, useEffect, useRef, useState } from "react";
import { sendActivityHeartbeat } from "../services/activityService";

const IDLE_TIMEOUT = 5 * 60 * 1000; // 5 minutes idle detection

const useActivityTracker = ({ attendanceId, enabled = false }) => {
  // 5-minute mouse inactivity idle tracking removed per user requirement.
  // Employee remains Active continuously throughout the punched-in session.
  return {
    status: "active",
    isActive: true,
    isIdle: false,
  };
};

export default useActivityTracker;
