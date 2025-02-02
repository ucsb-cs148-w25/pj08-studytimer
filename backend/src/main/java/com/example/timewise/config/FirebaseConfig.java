package com.example.timewise.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.springframework.context.annotation.Configuration;

import javax.annotation.PostConstruct;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Configuration
public class FirebaseConfig {

    @PostConstruct
    public void initializeFirebase() {
        try {
            String firebaseConfig = System.getenv("FIREBASE_CONFIG");
            if (firebaseConfig == null || firebaseConfig.isEmpty()) {
                throw new IllegalStateException("FIREBASE_CONFIG environment variable is not set.");
            }
            ByteArrayInputStream serviceAccount = new ByteArrayInputStream(firebaseConfig.getBytes(StandardCharsets.UTF_8));

            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .build();

            FirebaseApp.initializeApp(options);
            System.out.println("Firebase Admin SDK Initialized Successfully.");
        } catch (IOException e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to initialize Firebase Admin SDK", e);
        }
    }
}
