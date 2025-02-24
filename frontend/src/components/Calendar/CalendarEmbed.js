import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import listPlugin from '@fullcalendar/list';
import timeGridPlugin from '@fullcalendar/timegrid';
import { fetchEvents } from '../../services/CalendarService';
import './CalendarEmbed.css';

const CalendarEmbed = () => {
  const [events, setEvents] = useState([]);

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
  

  return (
    <div className="calendar-wrapper">
      <FullCalendar
        plugins={[dayGridPlugin, listPlugin, timeGridPlugin]}
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
    </div>
  );
};

export default CalendarEmbed;
