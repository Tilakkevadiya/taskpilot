package com.taskpilot.backend.dto;

import lombok.Data;
import lombok.AllArgsConstructor;

public class RefreshTokenFlow {
    @Data
    public static class Request {
        private String refreshToken;
    }

    @Data
    @AllArgsConstructor
    public static class Response {
        private String accessToken;
        private String refreshToken;
    }
}
