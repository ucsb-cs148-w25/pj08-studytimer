import axios from "axios";

const API_URL =
  process.env.REACT_APP_API_URL ||
  (window.location.hostname === "localhost"
    ? "http://127.0.0.1:5000"
    : "https://pj08-studytimer.onrender.com");

// Function to fetch user data
export const fetchUser = async () => {
  try {
    const response = await axios.get(`${API_URL}/get-user`, {
      withCredentials: true, // Ensures cookies are sent with the request
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching user data:", error.response?.data || error.message);
    return { user: null, error: "Failed to fetch user data" };
  }
};