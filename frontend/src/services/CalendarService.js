import axios from "axios";
import { BACKEND_URL } from "../auth";

// Fetch events from Google Calendar.
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
  const month = ("0" + (date.getMonth() + 1)).slice(-2);
  const day = ("0" + date.getDate()).slice(-2);
  return `${year}-${month}-${day}`;
};

/**
 * Creates an all‑day event in the user's Google Calendar for the given task.
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

  // For all‑day events, the 'end' date is exclusive, so we set it to the next day.
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

/**
 * Creates a timed event in the user's Google Calendar for the given task.
 * Expects taskData to have the following properties:
 * - title: The task title.
 * - description: (Optional) A description of the task.
 * - dateTime: The date for the event in ISO format. The time portion will be ignored and replaced.
 *
 * This function forces the event to start at 00:00 and end at 01:00 on the given day.
 */
export const addTimedTaskToCalendar = async (taskData) => {
  const token = localStorage.getItem("googleToken");
  if (!token) {
    throw new Error("No Google token found in localStorage");
  }

  // Create a date object from the provided dateTime, then force start time to 00:00
  const providedDate = new Date(taskData.dateTime);
  providedDate.setHours(0, 0, 0, 0);
  const startISO = providedDate.toISOString();

  // Set the end time to exactly one hour later (01:00)
  const endDate = new Date(providedDate);
  endDate.setHours(endDate.getHours() + 1);
  const endISO = endDate.toISOString();

  const eventData = {
    summary: `Task: ${taskData.title}`,
    description: taskData.description || "",
    start: {
      dateTime: startISO, // forced to 00:00 of the day
    },
    end: {
      dateTime: endISO, // forced to 01:00 of the day
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
    console.error("Error adding timed task to calendar:", error);
    throw error;
  }
};

/**
 * Helper function to build an event object for a deadline task.
 * Expects taskData.deadline in "YYYY-MM-DD" format and taskData.text as the task title.
 * This will force the event to start at 00:00 and end at 01:00 on the given day.
 */
const buildTimedEventFromDeadline = (taskData) => {
  // Construct start and end ISO strings for the given date.
  const startDateTime = `${taskData.deadline}T00:00:00Z`;
  const endDateTime = `${taskData.deadline}T01:00:00Z`;
  return {
    summary: `Task: ${taskData.text}`, // using taskData.text now
    description: taskData.description || "",
    start: {
      dateTime: startDateTime,
    },
    end: {
      dateTime: endDateTime,
    },
  };
};

/**
 * Creates a timed event in the user's Google Calendar for the given task.
 * Expects taskData to have the following properties:
 * - text: The task title.
 * - deadline: The date for the task in "YYYY-MM-DD" format.
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