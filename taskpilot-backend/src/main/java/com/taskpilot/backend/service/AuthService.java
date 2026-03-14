package com.taskpilot.backend.service;

import com.taskpilot.backend.dto.AuthRequest;
import com.taskpilot.backend.dto.AuthResponse;
import com.taskpilot.backend.dto.RefreshTokenFlow;
import com.taskpilot.backend.dto.RegisterRequest;
import com.taskpilot.backend.entity.RefreshToken;
import com.taskpilot.backend.entity.User;
import com.taskpilot.backend.entity.VerificationToken;
import com.taskpilot.backend.repository.RefreshTokenRepository;
import com.taskpilot.backend.repository.UserRepository;
import com.taskpilot.backend.repository.VerificationTokenRepository;
import com.taskpilot.backend.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;
import java.util.Collections;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.HttpTransport;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.gson.GsonFactory;

import org.springframework.beans.factory.annotation.Value;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private VerificationTokenRepository verificationTokenRepository;

    @Autowired
    private SystemEmailService systemEmailService;

    @Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String googleClientId;

    public void registerUser(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email is already registered");
        }

        User user = new User();
        user.setUsername(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setAuthProvider("LOCAL");
        user.setEmailVerified(false);

        userRepository.save(user);

        // Generate verification token (simple OTP or UUID)
        String token = String.format("%06d", new java.util.Random().nextInt(999999));
        VerificationToken verificationToken = new VerificationToken();
        verificationToken.setToken(token);
        verificationToken.setUser(user);
        verificationToken.calculateExpiryDate(15); // 15 mins
        verificationTokenRepository.save(verificationToken);

        // Send Email
        String subject = "Verify your TaskPilot AI Account";
        String body = "Hello " + user.getUsername() + ",\n\n" +
                "Your verification code is: " + token + "\n\n" +
                "This code will expire in 15 minutes.\n\n" +
                "Thank you,\nThe TaskPilot AI Team";

        systemEmailService.sendEmail(user.getEmail(), subject, body);
    }

    public AuthResponse authenticateUser(AuthRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        String jwt = jwtTokenProvider.generateToken(authentication);
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.isEmailVerified()) {
            throw new RuntimeException("Email not verified. Please verify your email first.");
        }

        RefreshToken refreshToken = createRefreshToken(user);

        AuthResponse.UserDto userDto = new AuthResponse.UserDto(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getPlanType().name());

        return new AuthResponse(jwt, refreshToken.getToken(), userDto);
    }

    public RefreshToken createRefreshToken(User user) {
        RefreshToken refreshToken = refreshTokenRepository.findByUser(user)
                .orElseGet(RefreshToken::new);

        refreshToken.setUser(user);
        refreshToken.setExpiryDate(Instant.now().plusMillis(86400000L * 7)); // 7 days
        refreshToken.setToken(UUID.randomUUID().toString());

        return refreshTokenRepository.save(refreshToken);
    }

    public RefreshTokenFlow.Response refreshToken(RefreshTokenFlow.Request request) {
        String requestRefreshToken = request.getRefreshToken();

        RefreshToken refreshToken = refreshTokenRepository.findByToken(requestRefreshToken)
                .orElseThrow(() -> new RuntimeException("Refresh token is not in database!"));

        if (refreshToken.getExpiryDate().compareTo(Instant.now()) < 0) {
            refreshTokenRepository.delete(refreshToken);
            throw new RuntimeException("Refresh token was expired. Please make a new signin request");
        }

        String jwt = jwtTokenProvider.generateTokenFromEmail(refreshToken.getUser().getEmail(), refreshToken.getUser().getPlanType().name());
        return new RefreshTokenFlow.Response(jwt, requestRefreshToken);
    }

    public AuthResponse googleLogin(com.taskpilot.backend.dto.AuthFlows.GoogleAuthRequest request) {
        String idTokenString = request.getIdToken();
        try {
            HttpTransport transport = new NetHttpTransport();
            JsonFactory jsonFactory = GsonFactory.getDefaultInstance();

            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(transport, jsonFactory)
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();

            GoogleIdToken idToken = verifier.verify(idTokenString);
            if (idToken != null) {
                GoogleIdToken.Payload payload = idToken.getPayload();
                String email = payload.getEmail();
                String name = (String) payload.get("name");

                User user = userRepository.findByEmail(email).orElseGet(() -> {
                    User newUser = new User();
                    newUser.setEmail(email);
                    newUser.setUsername(name);
                    newUser.setAuthProvider("GOOGLE");
                    newUser.setEmailVerified(true);
                    newUser.setPasswordHash(passwordEncoder.encode(java.util.UUID.randomUUID().toString()));
                    return newUser;
                });

                // Update tokens
                if (request.getAccessToken() != null) {
                    user.setGoogleAccessToken(request.getAccessToken());
                }
                if (request.getRefreshToken() != null) {
                    user.setGoogleRefreshToken(request.getRefreshToken());
                }
                if (request.getExpiresIn() != null) {
                    user.setGoogleTokenExpiry(java.time.LocalDateTime.now().plusSeconds(request.getExpiresIn()));
                } else {
                    // Default to 1 hour if not provided
                    user.setGoogleTokenExpiry(java.time.LocalDateTime.now().plusHours(1));
                }

                userRepository.save(user);

                String jwt = jwtTokenProvider.generateTokenFromEmail(user.getEmail(), user.getPlanType().name());
                RefreshToken refreshToken = createRefreshToken(user);

                AuthResponse.UserDto userDto = new AuthResponse.UserDto(
                        user.getId(),
                        user.getUsername(),
                        user.getEmail(),
                        user.getPlanType().name());

                return new AuthResponse(jwt, refreshToken.getToken(), userDto);
            } else {
                throw new RuntimeException("Invalid Google ID token.");
            }
        } catch (Exception e) {
            throw new RuntimeException("Google Authentication Failed: " + e.getMessage());
        }
    }

    public void verifyEmail(String token) {
        VerificationToken verificationToken = verificationTokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid verification token"));

        if (verificationToken.getExpiryDate().isBefore(java.time.LocalDateTime.now())) {
            throw new RuntimeException("Verification token has expired");
        }

        User user = verificationToken.getUser();
        user.setEmailVerified(true);
        userRepository.save(user);

        // Clean up token
        verificationTokenRepository.delete(verificationToken);
    }

    public void forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String token = UUID.randomUUID().toString();
        VerificationToken verificationToken = new VerificationToken();
        verificationToken.setToken(token);
        verificationToken.setUser(user);
        verificationToken.calculateExpiryDate(30); // 30 mins
        verificationTokenRepository.save(verificationToken);

        // Send Link
        String resetLink = "http://localhost:3000/reset-password?token=" + token;
        String subject = "Reset your TaskPilot AI Password";
        String body = "Hello " + user.getUsername() + ",\n\n" +
                "Click the link below to reset your password:\n" + resetLink + "\n\n" +
                "This link will expire in 30 minutes.\n\n" +
                "If you did not request this, please ignore this email.";

        systemEmailService.sendEmail(user.getEmail(), subject, body);
    }

    public void resetPassword(String token, String newPassword) {
        VerificationToken verificationToken = verificationTokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid or expired reset token"));

        if (verificationToken.getExpiryDate().isBefore(java.time.LocalDateTime.now())) {
            throw new RuntimeException("Reset token has expired");
        }

        User user = verificationToken.getUser();
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        verificationTokenRepository.delete(verificationToken);
    }

    /**
     * Generates a fresh JWT token for a user with their current plan type.
     * Usually called after a plan upgrade (e.g. via Razorpay).
     */
    public String refreshTokenForUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));
        
        return jwtTokenProvider.generateTokenFromEmail(user.getEmail(), user.getPlanType().name());
    }
}
