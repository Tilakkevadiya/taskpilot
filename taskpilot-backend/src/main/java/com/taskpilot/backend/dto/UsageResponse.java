package com.taskpilot.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UsageResponse {
    private boolean approved; // whether the action can proceed
    private int remaining; // how many allowed actions remain today
    private int limit; // the absolute limit for the day
    private String plan; // 'FREE' or 'PREMIUM'
    private boolean upgradeRequired; // true if approved == false
}
