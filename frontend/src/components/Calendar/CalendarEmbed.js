import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import listPlugin from "@fullcalendar/list";
import timeGridPlugin from "@fullcalendar/timegrid";
import { fetchEvents as fetchGoogleCalendarEvents } from "../../services/CalendarService";
import "./CalendarEmbed.css";
import EventDetailsModal from "./EventDetailsModal";

const CalendarEmbed = () => {
  const [googleEvents, setGoogleEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Fetch Google Calendar events
  const loadGoogleEvents = async () => {
    try {
      const data = await fetchGoogleCalendarEvents();
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
          // Determine if event is all-day: if start doesn't contain "T", assume all-day.
          const isAllDay = !start.includes("T");
          const eventObj = {
            id: event.id || `google-${index}`,
            title: event.summary || event.title || "No Title",
            start,
            allDay: isAllDay,
          };
          // For timed events, include the end property if available.
          if (!isAllDay && end && end.trim() !== "") {
            eventObj.end = end;
          }
          return eventObj;
        })
        .filter((event) => event.start && event.start.trim() !== "");
      setGoogleEvents(transformed);
    } catch (error) {
      console.error("Error fetching Google Calendar events:", error);
    }
  };

  // Load Google Calendar events on mount.
  useEffect(() => {
    loadGoogleEvents();
  }, []);

  const handleEventClick = (clickInfo) => {
    setSelectedEvent({
      title: clickInfo.event.title,
      start: clickInfo.event.start,
      end: clickInfo.event.end,
      description: clickInfo.event.extendedProps.description,
    });
    setModalOpen(true);
  };

  return (
    <div className="calendar-wrapper">
      <FullCalendar
        timeZone="local"
        plugins={[dayGridPlugin, listPlugin, timeGridPlugin]}
        eventClick={handleEventClick}
        initialView="dayGridMonth"
        initialDate={new Date()}
        events={googleEvents}
        headerToolbar={{
          left: "prev,next",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
        }}
        dayMaxEvents={3}
        moreLinkContent="..."
      />
      {modalOpen && (
        <EventDetailsModal
          event={selectedEvent}
          onClose={() => {
            setModalOpen(false);
            setSelectedEvent(null);
          }}
        />
      )}
    </div>
  );
};

export default CalendarEmbed;
