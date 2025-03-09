import axios from "axios";
import { BACKEND_URL } from "../auth";

/**
 * Fetch events from Google Calendar.
 */
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

/**
 * Creates a timed event in the user's Google Calendar for a deadline task.
 * Expects taskData to have the following properties:
 * - text: The task title.
 * - deadline: The date for the task in "YYYY-MM-DD" format.
 * - description: (Optional) A description of the task.
 *
 * This function forces the event to start at 00:00 and end at 01:00 on the given day.
 */
export const addDeadlineTaskToCalendar = async (taskData) => {
  const token = localStorage.getItem("googleToken");
  if (!token) {
    throw new Error("No Google token found in localStorage");
  }
  try {
    const response = await axios.post(
      `${BACKEND_URL}/api/calendar/tasks`,
      taskData, // send payload directly
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error adding deadline task to calendar:", error);
    throw error;
  }
};

/**
 * Delete an event from Google Calendar.
 */
export const deleteCalendarEvent = async (eventId) => {
  const token = localStorage.getItem("googleToken");
  if (!token) {
    throw new Error("No Google token found in localStorage");
  }
  try {
    const response = await axios.delete(`${BACKEND_URL}/api/calendar/tasks/${eventId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting calendar event:", error);
    throw error;
  }
};

export const updateCalendarEvent = async (eventId, taskData) => {
  const token = localStorage.getItem("googleToken");
  if (!token) {
    throw new Error("No Google token found in localStorage");
  }
  try {
    const response = await axios.put(
      `${BACKEND_URL}/api/calendar/tasks/${eventId}`,
      taskData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating calendar event:", error);
    throw error;
  }
};
