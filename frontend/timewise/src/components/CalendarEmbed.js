import React from 'react';
import "./CalendarEmbed.css";

const CalendarEmbed = () => {
    return (
        <div className="calendar-container">
            <iframe 
                src="https://calendar.google.com/calendar/embed?height=600&wkst=1&ctz=America%2FLos_Angeles&showPrint=0&showNav=0&showTabs=0&showCalendars=0&showTz=0&showTitle=0&mode=WEEK&src=ZW4udXNhI2hvbGlkYXlAZ3JvdXAudi5jYWxlbmRhci5nb29nbGUuY29t&color=%230B8043" 
                style={{ border: "none", width: "90%", height: "70vh" }}
                frameborder="0" 
                title="myCalendar">
            </iframe>
        </div>
    );
};

export default CalendarEmbed;
  