package com.c2c.backend.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;

/**
 * Verifies a Google Sign-In ID token by calling Google's tokeninfo endpoint.
 *
 * This is the simplest correct way to verify an ID token server-side without
 * pulling in the full google-auth-library dependency. It's fine for an app
 * at this scale; if login volume grows a lot, switch to verifying the JWT
 * signature locally against Google's public keys instead (avoids the extra
 * network round-trip per login).
 */
@Service
public class GoogleTokenVerifier {

    @Value("${google.client-id:}")
    private String expectedClientId;

    private final WebClient webClient = WebClient.create("https://oauth2.googleapis.com");

    public record GoogleUser(String email, boolean emailVerified) {}

    public GoogleUser verify(String idToken) {
        if (expectedClientId == null || expectedClientId.isBlank()) {
            throw new IllegalStateException(
                    "GOOGLE_CLIENT_ID is not configured on the backend.");
        }

        Map<String, Object> claims = webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/tokeninfo")
                        .queryParam("id_token", idToken)
                        .build())
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        if (claims == null) {
            throw new IllegalArgumentException("Could not verify Google token.");
        }

        String aud = String.valueOf(claims.get("aud"));
        if (!expectedClientId.equals(aud)) {
            throw new IllegalArgumentException("Google token was not issued for this app.");
        }

        String email = String.valueOf(claims.get("email"));
        boolean emailVerified = Boolean.parseBoolean(String.valueOf(claims.get("email_verified")));

        if (email == null || email.isBlank() || "null".equals(email)) {
            throw new IllegalArgumentException("Google token did not contain an email.");
        }

        return new GoogleUser(email.toLowerCase(), emailVerified);
    }
}
