package com.example.timewise.controller;

import com.google.auth.oauth2.AccessToken;
import com.google.auth.oauth2.GoogleCredentials;
import com.google.auth.http.HttpCredentialsAdapter;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.calendar.Calendar;
import com.google.api.services.calendar.model.*;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.*;

@RestController
@RequestMapping("/api/calendar")
@CrossOrigin(origins = {"http://localhost:3000", "https://pj-timewise.netlify.app"})
public class CalendarController {

    private static final String APPLICATION_NAME = "Timewise Calendar";
    private static final JsonFactory JSON_FACTORY = GsonFactory.getDefaultInstance();

    @GetMapping("/events")
    public List<Map<String, String>> getUserCalendarEvents(@RequestHeader("Authorization") String authHeader)
            throws IOException, GeneralSecurityException {

        String oauthToken = authHeader.replace("Bearer ", "").trim();
        if (oauthToken == null || oauthToken.isEmpty()) {
            throw new RuntimeException("No OAuth token provided in Authorization header.");
        }

        // Set expiration time far in the future (1 year)
        Date expirationTime = new Date(System.currentTimeMillis() + 31536000000L);
        AccessToken accessToken = new AccessToken(oauthToken, expirationTime);

        GoogleCredentials credentials = GoogleCredentials
                .create(accessToken)
                .createScoped(Collections.singleton("https://www.googleapis.com/auth/calendar"));

        HttpCredentialsAdapter requestInitializer = new HttpCredentialsAdapter(credentials);

        Calendar service = new Calendar.Builder(new NetHttpTransport(), JSON_FACTORY, requestInitializer)
                .setApplicationName(APPLICATION_NAME)
                .build();

        List<Event> allEvents = new ArrayList<>();
        String pageToken = null;
        do {
            Events eventsPage = service.events().list("primary")
                    .setOrderBy("startTime")
                    .setSingleEvents(true)
                    .setMaxResults(250)
                    .setPageToken(pageToken)
                    .execute();
            allEvents.addAll(eventsPage.getItems());
            pageToken = eventsPage.getNextPageToken();
        } while (pageToken != null);

        List<Map<String, String>> userEvents = new ArrayList<>();
        for (Event event : allEvents) {
            String eventStart = (event.getStart().getDateTime() != null)
                    ? event.getStart().getDateTime().toString()
                    : event.getStart().getDate().toString();
            Map<String, String> eventData = new HashMap<>();
            eventData.put("title", event.getSummary());
            eventData.put("start", eventStart);
            userEvents.add(eventData);
        }
        return userEvents;
    }
}
