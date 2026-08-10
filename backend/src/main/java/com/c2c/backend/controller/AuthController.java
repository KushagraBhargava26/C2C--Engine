package com.c2c.backend.controller;

import com.c2c.backend.dto.*;
import com.c2c.backend.entity.User;
import com.c2c.backend.repository.UserRepository;
import com.c2c.backend.security.GoogleTokenVerifier;
import com.c2c.backend.security.JwtService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final GoogleTokenVerifier googleTokenVerifier;

    private static final long RESET_TOKEN_VALID_MINUTES = 30;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequestDTO request) {
        String email = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(errorBody("An account with this email already exists."));
        }

        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        userRepository.save(user);

        String token = jwtService.generateToken(user.getEmail());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new AuthResponseDTO(token, user.getEmail(), jwtService.getExpirationSeconds()));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequestDTO request) {
        String email = request.getEmail().trim().toLowerCase();

        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null || !passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(errorBody("Invalid email or password."));
        }

        String token = jwtService.generateToken(user.getEmail());
        return ResponseEntity.ok(new AuthResponseDTO(token, user.getEmail(), jwtService.getExpirationSeconds()));
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorBody("Missing token."));
        }
        String token = authHeader.substring(7);
        if (!jwtService.isValid(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorBody("Invalid or expired token."));
        }
        return ResponseEntity.ok().body(java.util.Map.of("email", jwtService.extractEmail(token)));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequestDTO request) {
        String email = request.getEmail().trim().toLowerCase();
        User user = userRepository.findByEmail(email).orElse(null);

        // Always return 200 here regardless of whether the account exists —
        // otherwise this endpoint becomes a way to enumerate registered emails.
        if (user == null) {
            return ResponseEntity.ok(java.util.Map.of(
                    "message", "If an account exists for that email, a reset link has been generated."));
        }

        String token = UUID.randomUUID().toString();
        user.setResetToken(token);
        user.setResetTokenExpiry(Instant.now().plusSeconds(RESET_TOKEN_VALID_MINUTES * 60));
        userRepository.save(user);

        String resetLink = "/reset-password?token=" + token;

        // TODO: no email service is configured yet. Once you set up SMTP
        // (Spring Mail + Gmail/SendGrid), send `resetLink` to the user's
        // email here instead of returning/logging it directly. Until then
        // this is "test mode" — the link is handed straight back so you can
        // click through the flow yourself.
        System.out.println("[DEV] Password reset link for " + email + ": " + resetLink);

        return ResponseEntity.ok(java.util.Map.of(
                "message", "If an account exists for that email, a reset link has been generated.",
                "devResetLink", resetLink
        ));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequestDTO request) {
        User user = userRepository.findByResetToken(request.getToken()).orElse(null);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(errorBody("This reset link is invalid."));
        }
        if (user.getResetTokenExpiry() == null || user.getResetTokenExpiry().isBefore(Instant.now())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(errorBody("This reset link has expired. Request a new one."));
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);

        return ResponseEntity.ok(java.util.Map.of("message", "Password updated. You can log in now."));
    }

    @PostMapping("/google")
    public ResponseEntity<?> googleAuth(@Valid @RequestBody GoogleAuthRequestDTO request) {
        GoogleTokenVerifier.GoogleUser googleUser;
        try {
            googleUser = googleTokenVerifier.verify(request.getIdToken());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(errorBody("Google sign-in failed: " + e.getMessage()));
        }

        if (!googleUser.emailVerified()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(errorBody("Your Google email isn't verified."));
        }

        User user = userRepository.findByEmail(googleUser.email()).orElse(null);
        if (user == null) {
            user = new User();
            user.setEmail(googleUser.email());
            // Google-created accounts get an unguessable random password hash —
            // they can only ever sign in via Google unless they later use
            // "forgot password" to set a real one.
            user.setPasswordHash(passwordEncoder.encode(UUID.randomUUID().toString()));
            userRepository.save(user);
        }

        String token = jwtService.generateToken(user.getEmail());
        return ResponseEntity.ok(new AuthResponseDTO(token, user.getEmail(), jwtService.getExpirationSeconds()));
    }

    private java.util.Map<String, String> errorBody(String message) {
        return java.util.Map.of("error", message);
    }
}
