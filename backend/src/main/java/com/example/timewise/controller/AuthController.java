package com.example.timewise.controller;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @PostMapping("/google")
    public ResponseEntity<?> verifyGoogleLogin(@RequestHeader("Authorization") String token) {
        try {
            // Extract token from "Bearer <token>"
            String idToken = token.replace("Bearer ", "");

            // Verify the Firebase ID token
            FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(idToken);
            String uid = decodedToken.getUid(); 
            String email = decodedToken.getEmail(); 

            // Return JSON response with user info
            return ResponseEntity.ok(Map.of("uid", uid, "email", email));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid token: " + e.getMessage()));
        }
    }

    @GetMapping("/google")
    public ResponseEntity<?> testGoogleEndpoint() {
        return ResponseEntity.ok(Map.of("message", "Google auth endpoint is live. Please use POST."));
    }
}
