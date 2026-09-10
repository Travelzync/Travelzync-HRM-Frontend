import apiClient from "./apiClient";

// =====================================================
// Activity Heartbeat
// =====================================================

export const sendActivityHeartbeat = async (attendanceId, status) => {
  try {
    const response = await apiClient.post("/activity/heartbeat", {
      attendanceId,
      status,
    });

    return response.data;
  } catch (error) {
    console.error(
      "Activity heartbeat error:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

// =====================================================
// Get My Activity
// =====================================================

export const getMyActivity = async () => {
  try {
    const response = await apiClient.get("/activity/my");

    return response.data;
  } catch (error) {
    console.error(
      "Get my activity error:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

