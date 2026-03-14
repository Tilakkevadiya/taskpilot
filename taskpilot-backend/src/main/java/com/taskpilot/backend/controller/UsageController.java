package com.taskpilot.backend.controller;

import com.taskpilot.backend.entity.User;
import com.taskpilot.backend.repository.UserRepository;
import com.taskpilot.backend.service.FeatureAccessService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/usage")
@CrossOrigin(origins = "*")
public class UsageController {

    @Autowired
    private FeatureAccessService featureAccessService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/current")
    public ResponseEntity<Map<String, Object>> getCurrentUsage() {
        String email = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Map<String, Object> response = new HashMap<>();
        response.put("plan", user.getPlanType().name());

        response.put("emailsLeft", featureAccessService.getUsageStats(user, FeatureAccessService.Feature.EMAIL).getRemaining());
        response.put("meetingsLeft", featureAccessService.getUsageStats(user, FeatureAccessService.Feature.MEETING_SCHEDULE).getRemaining());
        response.put("tasksLeft", featureAccessService.getUsageStats(user, FeatureAccessService.Feature.TASK_CREATE).getRemaining());

        return ResponseEntity.ok(response);
    }
}
