import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import listPlugin from "@fullcalendar/list";
import timeGridPlugin from "@fullcalendar/timegrid";
import { fetchEvents as fetchGoogleCalendarEvents } from "../../services/CalendarService";
import { db, auth } from "../../firebase";
import { collection, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import "./CalendarEmbed.css";
import EventDetailsModal from "./EventDetailsModal";

const CalendarEmbed = () => {
  const [googleEvents, setGoogleEvents] = useState([]);
  const [firestoreEvents, setFirestoreEvents] = useState([]);
  const [combinedEvents, setCombinedEvents] = useState([]);
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
            description: event.description || "",
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

  // Fetch tasks from Firestore and convert them into calendar events.
  // Here we use the "deadline" field for the event's start time.
  // The end date is set to start date + 1 hour.
  const loadFirestoreEvents = async (uid) => {
    try {
      const listsSnapshot = await getDocs(collection(db, `users/${uid}/lists`));
      const listsData = listsSnapshot.docs.map((docSnap) => docSnap.id);

      let allTasks = [];
      for (const listId of listsData) {
        const tasksSnapshot = await getDocs(
          collection(db, `users/${uid}/lists/${listId}/tasks`)
        );
        const tasksForList = tasksSnapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          listId,
          ...docSnap.data(),
        }));
        allTasks = allTasks.concat(tasksForList);
      }

      const eventsData = allTasks
        .filter((task) => task.deadline)
        .map((task) => {
          const startDate = new Date(task.deadline);
          const isoStart = startDate.toISOString();
          const endDate = new Date(startDate);
          endDate.setHours(endDate.getHours() + 1);
          const isoEnd = endDate.toISOString();
          return {
            id: task.id,
            title: task.text || "No Title",
            start: isoStart,
            end: isoEnd,
            allDay: false,
            description: task.description || "",
          };
        });

      setFirestoreEvents(eventsData);
    } catch (error) {
      console.error("Error fetching Firestore tasks:", error);
    }
  };

  // Listen to auth state changes to fetch Firestore tasks.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        loadFirestoreEvents(currentUser.uid);
      } else {
        setFirestoreEvents([]);
      }
    });
    return () => unsubscribe();
  }, []);

  // Load Google Calendar events on mount.
  useEffect(() => {
    loadGoogleEvents();
  }, []);

  // Combine events from both sources whenever they change.
  useEffect(() => {
    const combined = [...googleEvents, ...firestoreEvents].sort(
      (a, b) => new Date(a.start) - new Date(b.start)
    );
    setCombinedEvents(combined);
  }, [googleEvents, firestoreEvents]);

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
        events={combinedEvents}
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
