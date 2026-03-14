package com.taskpilot.backend.service;

import com.taskpilot.backend.entity.Meeting;
import com.taskpilot.backend.entity.Task;
import com.taskpilot.backend.repository.MeetingRepository;
import com.taskpilot.backend.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Component
@RequiredArgsConstructor
public class ReminderScheduler {

    private final TaskRepository taskRepository;
    private final MeetingRepository meetingRepository;
    private final SystemEmailService emailService;

    @Scheduled(fixedRate = 60000)
    @org.springframework.transaction.annotation.Transactional
    public void checkReminders() {
        Instant now = Instant.now();

        // Check Task Reminders
        List<Task> tasks = taskRepository.findByReminderSentFalseAndReminderMinutesBeforeIsNotNull();
        for (Task task : tasks) {
            if (task.getDueTime() != null) {
                Instant reminderTime = task.getDueTime().minus(task.getReminderMinutesBefore(), ChronoUnit.MINUTES);
                if (now.isAfter(reminderTime)) {
                    String email = task.getUser().getEmail();
                    String username = task.getUser().getUsername();
                    emailService.sendTaskReminder(email, username, task);
                    task.setReminderSent(true);
                    taskRepository.save(task);
                }
            }
        }

        // Check Meeting Reminders
        List<Meeting> meetings = meetingRepository.findByReminderSentFalseAndReminderMinutesBeforeIsNotNull();
        for (Meeting meeting : meetings) {
            if (meeting.getMeetingTime() != null) {
                Instant reminderTime = meeting.getMeetingTime().minus(meeting.getReminderMinutesBefore(), ChronoUnit.MINUTES);
                if (now.isAfter(reminderTime)) {
                    String email = meeting.getUser().getEmail();
                    String username = meeting.getUser().getUsername();
                    emailService.sendMeetingReminder(email, username, meeting);
                    meeting.setReminderSent(true);
                    meetingRepository.save(meeting);
                }
            }
        }
    }
}
