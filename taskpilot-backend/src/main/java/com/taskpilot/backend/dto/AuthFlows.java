package com.taskpilot.backend.dto;

import lombok.Data;

public class AuthFlows {

    @Data
    public static class VerifyEmailRequest {
        private String token;
    }

    @Data
    public static class ForgotPasswordRequest {
        private String email;
    }

    @Data
    public static class ResetPasswordRequest {
        private String token;
        private String newPassword;
    }

    @Data
    public static class GoogleAuthRequest {
        private String idToken;
        private String accessToken;
        private String refreshToken;
        private Long expiresIn; // Optional, seconds until expiry
    }
}
