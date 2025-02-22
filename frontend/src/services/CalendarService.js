import axios from "axios";  // ✅ Fix: Import axios
import { getAuth } from "firebase/auth";  // ✅ Fix: Import Firebase Auth

// ✅ Define API base URL (Uses env variable or defaults to localhost)
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080/api/calendar";

export const fetchEvents = async () => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      console.error("No logged-in user, cannot fetch events."); // debug
      return [];
    }

    // ✅ Get Firebase authentication token
    const token = await user.getIdToken();

    // ✅ Send request to backend
    const response = await axios.get(`${API_BASE_URL}/events`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log("✅ Response Data:", response.data);
    return response.data.map(event => ({
      title: event.title,
      start: event.start
    }));

  } catch (error) {
    console.error("Error fetching events:", error.response?.data || error.message); // debug
    throw error;
  }
};
