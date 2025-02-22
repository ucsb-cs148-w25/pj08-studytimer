import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
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
        console.error('Error loading events:', error);
      }
    };

    loadEvents();
  }, []);

  return (
    <div className="calendar-wrapper">
      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        events={events}
        headerToolbar={{
          left: 'prev,next', 
          center: 'title',    
          right: '',          
        }}
        height="100vh"  
        contentHeight="auto"
      />
    </div>
  );
};

export default CalendarEmbed;
