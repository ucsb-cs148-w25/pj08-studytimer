import React, { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import listPlugin from "@fullcalendar/list";
import timeGridPlugin from "@fullcalendar/timegrid";
import { useCalendar } from "../../CalendarContext";
import "./CalendarEmbed.css";
import EventDetailsModal from "./EventDetailsModal";

const CalendarEmbed = () => {
  const { events, loading } = useCalendar();
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleEventClick = (clickInfo) => {
    setSelectedEvent({
      title: clickInfo.event.title,
      start: clickInfo.event.start,
      end: clickInfo.event.end,
      description: clickInfo.event.extendedProps.description,
    });
    setModalOpen(true);
  };

  if (loading) return <p>Loading calendar...</p>;

  return (
    <div className="calendar-wrapper">
      <FullCalendar
        timeZone="local"
        plugins={[dayGridPlugin, listPlugin, timeGridPlugin]}
        eventClick={handleEventClick}
        initialView="dayGridMonth"
        initialDate={new Date()}
        events={events} // Now using cached context events
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
