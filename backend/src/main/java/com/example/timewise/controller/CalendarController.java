package com.example.timewise.controller;

import com.example.timewise.dto.TaskEventDTO;
import com.google.api.client.googleapis.json.GoogleJsonResponseException;
import com.google.api.client.util.DateTime;
import com.google.auth.oauth2.AccessToken;
import com.google.auth.oauth2.GoogleCredentials;
import com.google.auth.http.HttpCredentialsAdapter;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.calendar.Calendar;
import com.google.api.services.calendar.model.Event;
import com.google.api.services.calendar.model.EventDateTime;
import com.google.api.services.calendar.model.Events;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.*;

@RestController
@RequestMapping("/api/calendar")
@CrossOrigin(origins = { "http://localhost:3000", "https://pj-timewise.netlify.app" })
public class CalendarController {

    private static final Logger logger = LoggerFactory.getLogger(CalendarController.class);
    private static final String APPLICATION_NAME = "Timewise Calendar";
    private static final JsonFactory JSON_FACTORY = GsonFactory.getDefaultInstance();

    /**
     * Helper method to initialize the Calendar service using the OAuth token.
     */
    private Calendar initializeCalendarService(String authHeader) throws IOException, GeneralSecurityException {
        String oauthToken = authHeader.replace("Bearer ", "").trim();
        if (oauthToken == null || oauthToken.isEmpty()) {
            logger.error("No OAuth token provided in Authorization header.");
            throw new RuntimeException("No OAuth token provided in Authorization header.");
        }
        logger.debug("OAuth token found. Initializing Calendar service.");

        // Set expiration time far in the future (1 year)
        Date expirationTime = new Date(System.currentTimeMillis() + 31536000000L);
        AccessToken accessToken = new AccessToken(oauthToken, expirationTime);

        GoogleCredentials credentials = GoogleCredentials
                .create(accessToken)
                .createScoped(Collections.singleton("https://www.googleapis.com/auth/calendar"));

        HttpCredentialsAdapter requestInitializer = new HttpCredentialsAdapter(credentials);

        Calendar calendarService = new Calendar.Builder(new NetHttpTransport(), JSON_FACTORY, requestInitializer)
                .setApplicationName(APPLICATION_NAME)
                .build();
        logger.debug("Calendar service initialized successfully.");
        return calendarService;
    }

    @GetMapping("/events")
    public List<Map<String, String>> getUserCalendarEvents(@RequestHeader("Authorization") String authHeader)
            throws IOException, GeneralSecurityException {

        logger.debug("Fetching Google Calendar events.");
        Calendar service = initializeCalendarService(authHeader);

        List<Event> allEvents = new ArrayList<>();
        String pageToken = null;
        do {
            logger.debug("Fetching events with page token: {}", pageToken);
            Calendar.Events.List request = service.events().list("primary")
                    .setOrderBy("startTime")
                    .setSingleEvents(true)
                    .setMaxResults(250);
            if (pageToken != null) {
                request.setPageToken(pageToken);
            }
            Events eventsPage = request.execute();
            allEvents.addAll(eventsPage.getItems());
            pageToken = eventsPage.getNextPageToken();
        } while (pageToken != null);

        logger.info("Total events retrieved: {}", allEvents.size());
        List<Map<String, String>> userEvents = new ArrayList<>();
        for (Event event : allEvents) {
            // Extract start time
            String eventStart = (event.getStart().getDateTime() != null)
                    ? event.getStart().getDateTime().toString()
                    : event.getStart().getDate().toString();

            Map<String, String> eventData = new HashMap<>();
            eventData.put("title", event.getSummary());
            eventData.put("start", eventStart);

            // Add description if available.
            if (event.getDescription() != null && !event.getDescription().trim().isEmpty()) {
                eventData.put("description", event.getDescription());
            }

            // Include the "end" property if it exists and is non-empty.
            if (event.getEnd() != null) {
                String eventEnd = (event.getEnd().getDateTime() != null)
                        ? event.getEnd().getDateTime().toString()
                        : event.getEnd().getDate().toString();
                if (eventEnd != null && !eventEnd.trim().isEmpty()) {
                    eventData.put("end", eventEnd);
                }
            }
            userEvents.add(eventData);
        }
        logger.debug("Returning {} events to client.", userEvents.size());
        return userEvents;
    }

    /**
     * Creates a new event (task) in the user's Google Calendar based on TaskBoard
     * data.
     * Expects the event data in the request body as a TaskEventDTO.
     * It uses the "deadline" field (in "YYYY-MM-DD" format) to force a start time
     * of 00:00 and an end time of 01:00.
     */
    @PostMapping("/tasks")
    public Event createCalendarTask(@RequestHeader("Authorization") String authHeader,
            @RequestBody TaskEventDTO taskEventDTO)
            throws IOException, GeneralSecurityException {

        logger.debug("Received request to create a new calendar task. TaskEventDTO: {}", taskEventDTO);

        // Validate that deadline and task title are provided
        if (taskEventDTO.getDeadline() == null || taskEventDTO.getDeadline().isEmpty()) {
            logger.error("Missing deadline in TaskEventDTO");
            throw new IllegalArgumentException("Missing deadline");
        }
        if (taskEventDTO.getText() == null || taskEventDTO.getText().isEmpty()) {
            logger.error("Missing task title in TaskEventDTO");
            throw new IllegalArgumentException("Missing task title");
        }

        Calendar service = initializeCalendarService(authHeader);

        // Build a Google Calendar Event using the provided deadline
        Event eventData = new Event();
        // Use the text property as the event title
        eventData.setSummary(taskEventDTO.getText());
        eventData.setDescription(taskEventDTO.getDescription());

        // Build start and end times based on deadline
        String startDateTimeStr = taskEventDTO.getDeadline() + "T00:00:00Z";
        String endDateTimeStr = taskEventDTO.getDeadline() + "T01:00:00Z";
        logger.debug("Constructed startDateTime: {} and endDateTime: {}", startDateTimeStr, endDateTimeStr);

        EventDateTime start = new EventDateTime().setDateTime(new DateTime(startDateTimeStr));
        EventDateTime end = new EventDateTime().setDateTime(new DateTime(endDateTimeStr));
        eventData.setStart(start);
        eventData.setEnd(end);

        Event createdEvent = null;
        try {
            logger.debug("Inserting event into Google Calendar...");
            createdEvent = service.events().insert("primary", eventData).execute();
            logger.info("Event created successfully with ID: {}", createdEvent.getId());
        } catch (GoogleJsonResponseException e) {
            logger.error("Google API error: {}", e.getDetails(), e);
            throw e;
        } catch (IOException ex) {
            logger.error("Error occurred while inserting event: {}", ex.getMessage(), ex);
            throw ex;
        }

        return createdEvent;
    }
}