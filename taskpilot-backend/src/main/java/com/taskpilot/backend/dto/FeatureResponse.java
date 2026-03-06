package com.taskpilot.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FeatureResponse<T> {
    private T data;
    private UsageResponse usage;
}
