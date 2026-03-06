package com.taskpilot.backend.service;

import com.taskpilot.backend.dto.UsageResponse;
import com.taskpilot.backend.entity.User;
import com.taskpilot.backend.entity.UserDailyUsage;
import com.taskpilot.backend.exception.SubscriptionLimitExceededException;
import com.taskpilot.backend.repository.TaskRepository;
import com.taskpilot.backend.repository.UserDailyUsageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
public class FeatureAccessService {

    @Autowired
    private UserDailyUsageRepository usageRepository;

    @Autowired
    private TaskRepository taskRepository;

    public enum Feature {
        EMAIL, VOICE_COMMAND, MEETING_SCHEDULE, TASK_CREATE
    }

    @Transactional
    public UsageResponse checkAndConsumeUsage(User user, Feature feature) {
        if (user.getSubscriptionPlan() == User.SubscriptionPlan.PREMIUM &&
                user.getSubscriptionStatus() == User.SubscriptionStatus.ACTIVE) {
            return new UsageResponse(true, -1, -1, "PREMIUM", false);
        }

        UserDailyUsage usage = usageRepository.findByUserAndUsageDate(user, LocalDate.now())
                .orElseGet(() -> {
                    UserDailyUsage newUsage = new UserDailyUsage();
                    newUsage.setUser(user);
                    newUsage.setUsageDate(LocalDate.now());
                    return newUsage;
                });

        boolean approved = false;
        int remaining = 0;
        int limit = 0;

        switch (feature) {
            case EMAIL:
                limit = 20;
                if (usage.getEmailsSentCount() < limit) {
                    usage.setEmailsSentCount(usage.getEmailsSentCount() + 1);
                    approved = true;
                }
                remaining = limit - usage.getEmailsSentCount();
                break;
            case VOICE_COMMAND:
                limit = 30;
                if (usage.getVoiceCommandsCount() < limit) {
                    usage.setVoiceCommandsCount(usage.getVoiceCommandsCount() + 1);
                    approved = true;
                }
                remaining = limit - usage.getVoiceCommandsCount();
                break;
            case TASK_CREATE:
                limit = 50;
                // Currently TaskRepository does not have `countActiveTasksByUser`, so we just
                // check total tasks.
                long activeTasks = taskRepository.findByUser(user).stream()
                        .filter(t -> !"COMPLETED".equals(t.getStatus()))
                        .count();
                if (activeTasks < limit) {
                    approved = true;
                }
                remaining = (int) (limit - activeTasks);
                break;
            case MEETING_SCHEDULE:
                limit = 10;
                if (usage.getMeetingsScheduledCount() < limit) {
                    usage.setMeetingsScheduledCount(usage.getMeetingsScheduledCount() + 1);
                    approved = true;
                }
                remaining = limit - usage.getMeetingsScheduledCount();
                break;
        }

        if (approved) {
            usageRepository.save(usage);
        } else {
            throw new SubscriptionLimitExceededException("Upgrade to Premium to continue using " + feature.name());
        }

        return new UsageResponse(approved, remaining, limit, "FREE", !approved);
    }

    @Transactional(readOnly = true)
    public UsageResponse getUsageStats(User user, Feature feature) {
        if (user.getSubscriptionPlan() == User.SubscriptionPlan.PREMIUM &&
                user.getSubscriptionStatus() == User.SubscriptionStatus.ACTIVE) {
            return new UsageResponse(true, -1, -1, "PREMIUM", false);
        }

        UserDailyUsage usage = usageRepository.findByUserAndUsageDate(user, LocalDate.now())
                .orElse(new UserDailyUsage());

        int remaining = 0;
        int limit = 0;

        switch (feature) {
            case EMAIL:
                limit = 20;
                remaining = limit - usage.getEmailsSentCount();
                break;
            case VOICE_COMMAND:
                limit = 30;
                remaining = limit - usage.getVoiceCommandsCount();
                break;
            case TASK_CREATE:
                limit = 50;
                long activeTasks = taskRepository.findByUser(user).stream()
                        .filter(t -> !"COMPLETED".equals(t.getStatus()))
                        .count();
                remaining = (int) (limit - activeTasks);
                break;
            case MEETING_SCHEDULE:
                limit = 10;
                remaining = limit - usage.getMeetingsScheduledCount();
                break;
        }

        return new UsageResponse(true, Math.max(0, remaining), limit, "FREE", false);
    }
}
