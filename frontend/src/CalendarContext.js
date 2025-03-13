import { createContext, useState, useEffect, useContext } from "react";
import { fetchEvents } from "../src/services/CalendarService.js"

const CalendarContext = createContext();

export const CalendarProvider = ({ children }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEvents = async () => {
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

            const eventObj = {
              id: event.id || `google-${index}`,
              title: event.summary || event.title || "No Title",
              start,
              allDay: isAllDay,
            };

            if (!isAllDay && end.trim() !== "") {
              eventObj.end = end;
            }

            return eventObj;
          })
          .filter((event) => event.start.trim() !== "");

        setEvents(transformed);
      } catch (error) {
        console.error("Error fetching Google Calendar events:", error);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();

    // Optional: Poll every 30 seconds for updates
    const interval = setInterval(loadEvents, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <CalendarContext.Provider value={{ events, setEvents, loading }}>
      {children}
    </CalendarContext.Provider>
  );
};

export const useCalendar = () => useContext(CalendarContext);
