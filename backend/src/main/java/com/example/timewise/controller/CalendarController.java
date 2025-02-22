package com.example.timewise.controllers;  
import com.google.api.client.googleapis.auth.oauth2.GoogleCredential;
import com.google.api.client.http.HttpTransport;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.jackson2.JacksonFactory;
import com.google.api.services.calendar.Calendar;
import com.google.api.services.calendar.model.*;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.*;

@RestController
@RequestMapping("/api/calendar")
@CrossOrigin(origins = "http://localhost:3000")  // ✅ Correct annotation placement
public class CalendarController {  // ✅ Class definition starts correctly

    private static final String APPLICATION_NAME = "Timewise Calendar";
    private static final JsonFactory JSON_FACTORY = JacksonFactory.getDefaultInstance();
    private static final HttpTransport HTTP_TRANSPORT = new NetHttpTransport();

    @GetMapping("/events")
    public List<Map<String, String>> getUserCalendarEvents(@RequestHeader(name = "Authorization", required = false) String token) throws IOException {
        try {
            if (token == null || !token.startsWith("Bearer ")) {
                throw new RuntimeException("Missing or invalid Authorization token.");
            }

            // Extract Firebase token
            String firebaseToken = token.replace("Bearer ", "");
            FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(firebaseToken);
            String userEmail = decodedToken.getEmail();
            if (userEmail == null) {
                throw new RuntimeException("Invalid Firebase token: No email found.");
            }

            // Authenticate with Google API
            GoogleCredential credential = new GoogleCredential().setAccessToken(firebaseToken);
            Calendar service = new Calendar.Builder(HTTP_TRANSPORT, JSON_FACTORY, credential)
                    .setApplicationName(APPLICATION_NAME)
                    .build();

            // Fetch calendar events
            List<Map<String, String>> userEvents = new ArrayList<>();
            Events events = service.events().list("primary")
                    .setOrderBy("startTime")
                    .setSingleEvents(true)
                    .execute();

            for (Event event : events.getItems()) {
                Map<String, String> eventData = new HashMap<>();
                eventData.put("title", event.getSummary());
                eventData.put("start", event.getStart().getDateTime() != null ?
                        event.getStart().getDateTime().toString() :
                        event.getStart().getDate().toString());
                userEvents.add(eventData);
            }

            return userEvents;

        } catch (Exception e) {
            System.err.println("❌ Error fetching Google Calendar events: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("❌ Error fetching Google Calendar events: " + e.getMessage());
        }
    }
}
