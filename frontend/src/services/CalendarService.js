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

// Helper to compute the next day in YYYY-MM-DD format (all‑day events require the end date to be exclusive)
const getNextDay = (dateStr) => {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + 1);
  const year = date.getFullYear();
  const month = ('0' + (date.getMonth() + 1)).slice(-2);
  const day = ('0' + date.getDate()).slice(-2);
  return `${year}-${month}-${day}`;
};

/**
 * Creates an all-day event in the user's Google Calendar for the given task.
 * Expects taskData to have the following properties:
 * - title: The task title.
 * - description: (Optional) A description of the task.
 * - date: The date for the task in "YYYY-MM-DD" format.
 */
export const addTaskToCalendar = async (taskData) => {
  const token = localStorage.getItem("googleToken");
  if (!token) {
    throw new Error("No Google token found in localStorage");
  }

  // Prepare the event data as an all-day event.
  // Note: For all-day events, the 'end' date is exclusive, so we set it to the next day.
  const eventData = {
    summary: `Task: ${taskData.title}`,
    description: taskData.description || "",
    start: {
      date: taskData.date, // e.g., "2025-03-01"
    },
    end: {
      date: getNextDay(taskData.date), // e.g., "2025-03-02"
    },
  };

  try {
    const response = await axios.post(
      `${BACKEND_URL}/api/calendar/tasks`,
      eventData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error adding task to calendar:", error);
    throw error;
  }
};