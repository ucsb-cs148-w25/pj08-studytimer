package com.example.timewise.controllers;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.auth.http.HttpCredentialsAdapter;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.jackson2.JacksonFactory;
import com.google.api.services.calendar.Calendar;
import com.google.api.services.calendar.model.*;

import org.springframework.core.io.ClassPathResource;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.*;

@RestController
@RequestMapping("/api/calendar")
@CrossOrigin(origins = "http://localhost:3000")
public class CalendarController {

    private static final String APPLICATION_NAME = "Timewise Calendar";
    private static final JsonFactory JSON_FACTORY = JacksonFactory.getDefaultInstance();

    private GoogleIdToken verifyFirebaseToken(String firebaseToken) throws GeneralSecurityException, IOException {
        GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), JSON_FACTORY)
                .setAudience(Collections.singletonList("YOUR_FIREBASE_CLIENT_ID")) // 🔹 Replace with your Firebase Client ID
                .build();

        return verifier.verify(firebaseToken);
    }

    @GetMapping("/events")
    public List<Map<String, String>> getUserCalendarEvents(@RequestHeader("Authorization") String authHeader)
            throws IOException, GeneralSecurityException {

        String firebaseToken = authHeader.replace("Bearer ", "");
        GoogleIdToken idToken = verifyFirebaseToken(firebaseToken);

        if (idToken == null) {
            throw new RuntimeException("Invalid Firebase token");
        }

        GoogleCredentials credentials = GoogleCredentials
                .fromStream(new ClassPathResource("serviceAccountKey.json").getInputStream())
                .createScoped(Collections.singleton("https://www.googleapis.com/auth/calendar"));

        credentials.refreshIfExpired();
        HttpCredentialsAdapter requestInitializer = new HttpCredentialsAdapter(credentials);

        Calendar service = new Calendar.Builder(new com.google.api.client.http.javanet.NetHttpTransport(),
                JSON_FACTORY, requestInitializer)
                .setApplicationName(APPLICATION_NAME)
                .build();

        List<Map<String, String>> userEvents = new ArrayList<>();
        Events events = service.events().list("primary")
                .setOrderBy("startTime")
                .setSingleEvents(true)
                .execute();

        for (Event event : events.getItems()) {
            Map<String, String> eventData = new HashMap<>();
            eventData.put("title", event.getSummary());
            eventData.put("start",
                    event.getStart().getDateTime() != null ? event.getStart().getDateTime().toString()
                            : event.getStart().getDate().toString());
            userEvents.add(eventData);
        }

        return userEvents;
    }

    @PostMapping("/events")
    public String createEvent(@RequestHeader("Authorization") String authHeader,
                              @RequestBody Map<String, String> eventDetails)
            throws IOException, GeneralSecurityException {

        String firebaseToken = authHeader.replace("Bearer ", "");
        GoogleIdToken idToken = verifyFirebaseToken(firebaseToken);

        if (idToken == null) {
            throw new RuntimeException("Invalid Firebase token");
        }

        GoogleCredentials credentials = GoogleCredentials
                .fromStream(new ClassPathResource("serviceAccountKey.json").getInputStream())
                .createScoped(Collections.singleton("https://www.googleapis.com/auth/calendar"));

        credentials.refreshIfExpired();
        HttpCredentialsAdapter requestInitializer = new HttpCredentialsAdapter(credentials);
        Calendar service = new Calendar.Builder(new com.google.api.client.http.javanet.NetHttpTransport(),
                JSON_FACTORY, requestInitializer)
                .setApplicationName(APPLICATION_NAME)
                .build();

        Event event = new Event()
                .setSummary(eventDetails.get("title"))
                .setDescription(eventDetails.get("description"));

        EventDateTime start = new EventDateTime()
                .setDateTime(new com.google.api.client.util.DateTime(eventDetails.get("start")))
                .setTimeZone("America/Los_Angeles");
        event.setStart(start);

        EventDateTime end = new EventDateTime()
                .setDateTime(new com.google.api.client.util.DateTime(eventDetails.get("end")))
                .setTimeZone("America/Los_Angeles");
        event.setEnd(end);

        event = service.events().insert("primary", event).execute();
        return "Event created: " + event.getHtmlLink();
    }
}
