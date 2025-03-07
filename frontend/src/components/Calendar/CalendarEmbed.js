import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import listPlugin from '@fullcalendar/list';
import timeGridPlugin from '@fullcalendar/timegrid';
import { fetchEvents } from '../../services/CalendarService';
import './CalendarEmbed.css';
import EventDetailsModal from './EventDetailsModal';

const CalendarEmbed = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const data = await fetchEvents();
        setEvents(data);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    loadEvents();
  }, []);

  // NOT WORKING... Events do not load
  // Below is a modification of useEffect to ensure the correct end time is also retrieved.
  // useEffect(() => {
  //   const loadEvents = async () => {
  //     try {
  //       const data = await fetchEvents();
  //       // Transform each event to ensure both start and end times are present
  //       const transformedEvents = data.map(event => ({
  //         title: event.summary,
  //         start: event.start.dateTime || event.start.date, // Use dateTime for timed events, date for all-day events
  //         end: event.end.dateTime || event.end.date,         // Ensure the end time is provided
  //         description: event.description,
  //       }));
  //       setEvents(transformedEvents);
  //     } catch (error) {
  //       console.error('Error fetching events:', error);
  //     }
  //   };

  //   loadEvents();
  // }, []);


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
        events={events}
        headerToolbar={{
          left: 'prev,next',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
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
