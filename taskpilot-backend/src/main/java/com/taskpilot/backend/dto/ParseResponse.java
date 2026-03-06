package com.taskpilot.backend.dto;

import lombok.Data;
import java.util.Map;

@Data
public class ParseResponse {
    private String intent;
    private Map<String, Object> entities;
    private String reply;
}
