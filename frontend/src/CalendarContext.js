import { createContext, useState, useEffect, useContext, useCallback } from "react";
import { fetchEvents } from "../src/services/CalendarService.js";

const CalendarContext = createContext();

export const CalendarProvider = ({ children }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false); // Track if events have already been fetched

  const loadEvents = useCallback(async () => {
    if (hasLoaded) return; // Prevent re-triggering loading screen when switching tabs

    setLoading(true); // Show loading only on first fetch
    try {
      const data = await fetchEvents();
      const transformed = Object.values(data)
        .map((event, index) => {
          const start =
            typeof event.start === "string"
              ? event.start
              : event.start?.dateTime || event.start?.date || "";
          const end =
            event.end
              ? typeof event.end === "string"
                ? event.end
                : event.end?.dateTime || event.end?.date || ""
              : "";
          const isAllDay = !start.includes("T");

          return {
            id: event.id || `google-${index}`,
            title: event.summary || event.title || "No Title",
            start,
            end: isAllDay ? null : end,
            allDay: isAllDay,
          };
        })
        .filter((event) => event.start.trim() !== "");

      setEvents(transformed);
      setHasLoaded(true); // Mark that events have been fetched
    } catch (error) {
      console.error("Error fetching Google Calendar events:", error);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 500);
    }
  }, [hasLoaded]);

  useEffect(() => {
    loadEvents();
    const interval = setInterval(loadEvents, 30000);
    return () => clearInterval(interval);
  }, [loadEvents]);

  return (
    <CalendarContext.Provider value={{ events, setEvents, loading, loadEvents, hasLoaded }}>
      {children}
    </CalendarContext.Provider>
  );
};

export const useCalendar = () => useContext(CalendarContext);
