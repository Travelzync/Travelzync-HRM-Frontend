import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// =====================================================
// Activity Heartbeat
// =====================================================

export const sendActivityHeartbeat = async (attendanceId, status) => {
  try {
    const token = localStorage.getItem("token");

    const response = await axios.post(
      `${API_URL}/activity/heartbeat`,
      {
        attendanceId,
        status,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

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
    const token = localStorage.getItem("token");

    const response = await axios.get(`${API_URL}/activity/my`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error(
      "Get my activity error:",
      error.response?.data || error.message,
    );

    throw error;
  }
};
