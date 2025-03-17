// CalendarEmbed.js
import React, { useState, useLayoutEffect, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import listPlugin from "@fullcalendar/list";
import timeGridPlugin from "@fullcalendar/timegrid";
import { useCalendar } from "../../CalendarContext";
import "./CalendarEmbed.css";
import EventDetailsModal from "./EventDetailsModal";

const CalendarEmbed = () => {
  const { events, loading, loadEvents } = useCalendar();
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  useLayoutEffect(() => {
    setIsClient(true);
  }, []);

  // Reset initialLoad when calendar page mounts
  useEffect(() => {
    if (initialLoad) {
      loadEvents();
      setInitialLoad(false);
    }
  }, [initialLoad, loadEvents]);

  const handleEventClick = (clickInfo) => {
    setSelectedEvent({
      title: clickInfo.event.title,
      start: clickInfo.event.start,
      end: clickInfo.event.end,
      description: clickInfo.event.extendedProps.description,
    });
    setModalOpen(true);
  };

  const handleCalendarClick = () => {
    loadEvents();
  };

  if (!isClient) {
    return (
      <div
        suppressHydrationWarning
        style={{
          width: "100vw",
          height: "100vh",
          backgroundColor: "#f0f0f0",
        }}
      />
    );
  }

  return (
    <>
      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Loading Calendar...</p>
        </div>
      )}

      <div className="calendar-wrapper">
        <FullCalendar
          timeZone="local"
          plugins={[dayGridPlugin, listPlugin, timeGridPlugin]}
          eventClick={handleEventClick}
          initialView="dayGridMonth"
          initialDate={new Date()}
          events={events}
          headerToolbar={{
            left: "prev,next",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
          }}
          dayMaxEvents={2}
          moreLinkContent="..."
          dateClick={handleCalendarClick}
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
    </>
  );
};

export default CalendarEmbed;
