package com.taskpilot.backend.controller;

import com.taskpilot.backend.dto.FeatureResponse;
import com.taskpilot.backend.entity.Meeting;
import com.taskpilot.backend.service.MeetingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/meetings")
@CrossOrigin(origins = "*")
public class MeetingController {

    @Autowired
    private MeetingService meetingService;

    @GetMapping
    public ResponseEntity<FeatureResponse<List<Meeting>>> getMeetings() {
        String email = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(meetingService.getUserMeetings(email));
    }

    @PostMapping
    public ResponseEntity<FeatureResponse<Meeting>> createMeeting(@RequestBody Meeting meeting) {
        System.out.println("Incoming meeting payload: " + meeting);
        String email = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(meetingService.createMeeting(meeting, email));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMeeting(@PathVariable Long id) {
        String email = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        meetingService.deleteMeeting(id, email);
        return ResponseEntity.noContent().build();
    }
}
