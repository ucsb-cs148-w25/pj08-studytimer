import React from 'react';
import './EventDetailsModal.css';

const EventDetailsModal = ({ event, onClose }) => {
  if (!event) return null;

  // Helper to format date/time values
  const formatDateTime = (date) => {
    return new Date(date).toLocaleString();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-button" onClick={onClose}>
          &times;
        </button>
        <h2>{event.title}</h2>
        <p>
          <strong>Start:</strong> {formatDateTime(event.start)}
        </p>
        <p>
          <strong>End:</strong> {formatDateTime(event.end)}
        </p>
        {event.description && (
          <p>
            <strong>Description:</strong> {event.description}
          </p>
        )}
      </div>
    </div>
  );
};

export default EventDetailsModal;
