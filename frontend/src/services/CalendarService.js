import axios from "axios";
import { BACKEND_URL } from "../auth";

export const fetchEvents = async () => {
  const token = localStorage.getItem("googleToken");
  if (!token) {
    throw new Error("No Google token found in localStorage");
  }
  try {
    const response = await axios.get(`${BACKEND_URL}/api/calendar/events`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
