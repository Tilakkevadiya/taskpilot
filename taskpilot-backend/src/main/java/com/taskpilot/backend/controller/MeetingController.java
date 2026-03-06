package com.taskpilot.backend.controller;

import com.taskpilot.backend.dto.FeatureResponse;
import com.taskpilot.backend.entity.Meeting;
import com.taskpilot.backend.service.MeetingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/meetings")
@CrossOrigin(origins = "*")
public class MeetingController {

    @Autowired
    private MeetingService meetingService;

    @GetMapping
    public ResponseEntity<FeatureResponse<List<Meeting>>> getMeetings(Authentication auth) {
        return ResponseEntity.ok(meetingService.getUserMeetings(auth.getName()));
    }

    @PostMapping
    public ResponseEntity<FeatureResponse<Meeting>> createMeeting(@RequestBody Meeting meeting, Authentication auth) {
        return ResponseEntity.ok(meetingService.createMeeting(meeting, auth.getName()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMeeting(@PathVariable Long id, Authentication auth) {
        meetingService.deleteMeeting(id, auth.getName());
        return ResponseEntity.noContent().build();
    }
}
