package com.taskpilot.backend.controller;

import com.taskpilot.backend.dto.UsageResponse;
import com.taskpilot.backend.entity.User;
import com.taskpilot.backend.repository.UserRepository;
import com.taskpilot.backend.service.FeatureAccessService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
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
    public ResponseEntity<Map<String, Object>> getCurrentUsage(Authentication auth) {
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Map<String, Object> response = new HashMap<>();
        response.put("plan", user.getSubscriptionPlan().name());

        UsageResponse emails = featureAccessService.getUsageStats(user, FeatureAccessService.Feature.EMAIL);
        Map<String, Integer> emailStats = new HashMap<>();
        emailStats.put("used", Math.max(0, emails.getLimit() - emails.getRemaining()));
        emailStats.put("limit", emails.getLimit());
        emailStats.put("remaining", emails.getRemaining());
        response.put("emails", emailStats);

        UsageResponse tasks = featureAccessService.getUsageStats(user, FeatureAccessService.Feature.TASK_CREATE);
        Map<String, Integer> taskStats = new HashMap<>();
        taskStats.put("used", Math.max(0, tasks.getLimit() - tasks.getRemaining()));
        taskStats.put("limit", tasks.getLimit());
        taskStats.put("remaining", tasks.getRemaining());
        response.put("tasks", taskStats);

        UsageResponse voice = featureAccessService.getUsageStats(user, FeatureAccessService.Feature.VOICE_COMMAND);
        Map<String, Integer> voiceStats = new HashMap<>();
        voiceStats.put("used", Math.max(0, voice.getLimit() - voice.getRemaining()));
        voiceStats.put("limit", voice.getLimit());
        voiceStats.put("remaining", voice.getRemaining());
        response.put("voice_commands", voiceStats);

        UsageResponse meetings = featureAccessService.getUsageStats(user,
                FeatureAccessService.Feature.MEETING_SCHEDULE);
        Map<String, Integer> meetingStats = new HashMap<>();
        meetingStats.put("used", Math.max(0, meetings.getLimit() - meetings.getRemaining()));
        meetingStats.put("limit", meetings.getLimit());
        meetingStats.put("remaining", meetings.getRemaining());
        response.put("meetings", meetingStats);

        return ResponseEntity.ok(response);
    }
}
