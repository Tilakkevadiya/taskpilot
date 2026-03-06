package com.taskpilot.backend.service;

import com.taskpilot.backend.dto.FeatureResponse;
import com.taskpilot.backend.dto.UsageResponse;
import com.taskpilot.backend.entity.Meeting;
import com.taskpilot.backend.entity.User;
import com.taskpilot.backend.repository.MeetingRepository;
import com.taskpilot.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MeetingService {

    @Autowired
    private MeetingRepository meetingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FeatureAccessService featureAccessService;

    public FeatureResponse<Meeting> createMeeting(Meeting meeting, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        UsageResponse usage = featureAccessService.checkAndConsumeUsage(user,
                FeatureAccessService.Feature.MEETING_SCHEDULE);

        meeting.setUser(user);
        Meeting saved = meetingRepository.save(meeting);
        return new FeatureResponse<>(saved, usage);
    }

    public FeatureResponse<List<Meeting>> getUserMeetings(String email) {
        User user = userRepository.findByEmail(email).orElse(null);
        if (user != null) {
            List<Meeting> meetings = meetingRepository.findByUser(user);
            UsageResponse usage = featureAccessService.getUsageStats(user,
                    FeatureAccessService.Feature.MEETING_SCHEDULE);
            return new FeatureResponse<>(meetings, usage);
        }
        return new FeatureResponse<>(List.of(), null);
    }

    public void deleteMeeting(Long id, String email) {
        meetingRepository.findById(id).ifPresent(meeting -> {
            if (meeting.getUser().getEmail().equals(email)) {
                meetingRepository.delete(meeting);
            }
        });
    }
}
