import axios from "axios";

const API_URL =
  process.env.REACT_APP_API_URL ||
  (window.location.hostname === "localhost"
    ? "http://127.0.0.1:5000"
    : "https://pj08-studytimer.onrender.com");

export const fetchData = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/data`);
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
};
