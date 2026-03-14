package com.taskpilot.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponse {
    private String accessToken;
    private String refreshToken;
    private UserDto user;

    @Data
    @AllArgsConstructor
    public static class UserDto {
        @com.fasterxml.jackson.annotation.JsonProperty("user_id")
        private Long id;
        private String name;
        private String email;
        @com.fasterxml.jackson.annotation.JsonProperty("plan_type")
        private String planType;
    }
}
