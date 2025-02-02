package com.example.timewise.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.springframework.context.annotation.Configuration;

import javax.annotation.PostConstruct;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.io.InputStream;

@Configuration
public class FirebaseConfig {

    @PostConstruct
    public void initializeFirebase() {
        try {
            FirebaseOptions options;

            if ("production".equals(System.getenv("ENVIRONMENT"))) {
                // Use FIREBASE_CONFIG environment variable in production
                String firebaseConfig = System.getenv("FIREBASE_CONFIG");
                if (firebaseConfig == null || firebaseConfig.isEmpty()) {
                    throw new IllegalStateException("FIREBASE_CONFIG environment variable is not set.");
                }
                ByteArrayInputStream serviceAccount = new ByteArrayInputStream(firebaseConfig.getBytes(StandardCharsets.UTF_8));
                options = FirebaseOptions.builder()
                        .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                        .build();

                System.out.println("🔥 Using FIREBASE_CONFIG from environment variables (Production Mode)");
            } else {
                // Use local serviceAccountKey.json in development
                InputStream serviceAccount = getClass().getClassLoader().getResourceAsStream("serviceAccountKey.json");
                if (serviceAccount == null) {
                    throw new IllegalStateException("serviceAccountKey.json file is missing in resources folder.");
                }

                options = FirebaseOptions.builder()
                        .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                        .build();

                System.out.println("⚡ Using serviceAccountKey.json (Development Mode)");
            }

            FirebaseApp.initializeApp(options);
            System.out.println("Firebase Admin SDK Initialized Successfully.");
        } catch (IOException e) {
            throw new RuntimeException("Failed to initialize Firebase Admin SDK", e);
        }
    }
}
