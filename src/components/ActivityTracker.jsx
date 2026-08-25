import React from "react";
import useActivityTracker from "../../hooks/useActivityTracker";

const ActivityTracker = ({ attendanceId, enabled = false }) => {
  const { status, isActive, isIdle } = useActivityTracker({
    attendanceId,
    enabled,
  });

  if (!enabled || !attendanceId) {
    return null;
  }

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        padding: "8px 12px",
        borderRadius: "8px",
        backgroundColor: "#f5f5f5",
        fontSize: "14px",
      }}
    >
      <span
        style={{
          width: "8px",
          height: "8px",
          borderRadius: "50%",
          backgroundColor: isActive ? "#22c55e" : "#f59e0b",
        }}
      />

      <span>
        {isActive && "Active"}
        {isIdle && "Idle"}
      </span>
    </div>
  );
};

export default ActivityTracker;
