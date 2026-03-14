package com.taskpilot.backend.service;

import com.taskpilot.backend.dto.UsageResponse;
import com.taskpilot.backend.entity.User;
import com.taskpilot.backend.entity.UserDailyUsage;
import com.taskpilot.backend.exception.SubscriptionLimitExceededException;
import com.taskpilot.backend.repository.UserDailyUsageRepository;
import com.taskpilot.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
public class FeatureAccessService {

    @Autowired
    private UserDailyUsageRepository usageRepository;

    @Autowired
    private UserRepository userRepository;

    public enum Feature {
        EMAIL, MEETING_SCHEDULE, TASK_CREATE, AI_REQUEST, DOCUMENT_PROCESS
    }

    // Weekly limits for FREE plan
    private static final int WEEKLY_TASK_LIMIT = 10;
    private static final int WEEKLY_MEETING_LIMIT = 5;
    private static final int WEEKLY_EMAIL_LIMIT = 20;

    /**
     * Resets weekly counters if 7+ days have passed since last reset.
     * Uses the safer plusDays(7).isBefore(today) pattern as recommended.
     */
    private void resetWeeklyUsageIfNeeded(User user) {
        LocalDate today = LocalDate.now();

        boolean needsReset = user.getLastUsageResetDate() == null
                || user.getLastUsageResetDate().plusDays(7).isBefore(today)
                || user.getLastUsageResetDate().plusDays(7).isEqual(today);

        if (needsReset) {
            user.setTasksCreatedThisWeek(0);
            user.setMeetingsCreatedThisWeek(0);
            user.setEmailsSentThisWeek(0);
            user.setLastUsageResetDate(today);
            userRepository.save(user);
        }
    }

    private boolean isPremium(User user) {
        return user.getPlanType() == User.PlanType.PREMIUM &&
                user.getSubscriptionStatus() == User.SubscriptionStatus.ACTIVE;
    }

    @Transactional
    public UsageResponse checkAndConsumeUsage(User user, Feature feature) {
        // Premium-only features gating
        if (feature == Feature.AI_REQUEST || feature == Feature.DOCUMENT_PROCESS) {
            if (!isPremium(user)) {
                throw new SubscriptionLimitExceededException(
                        "AI Assistant and Documents are premium features. Upgrade to unlock! ✨");
            }
            return new UsageResponse(true, -1, -1, "PREMIUM", false);
        }

        // Premium users bypass all limits
        if (isPremium(user)) {
            return new UsageResponse(true, -1, -1, "PREMIUM", false);
        }

        // Auto-reset weekly counters if 7 days have passed
        resetWeeklyUsageIfNeeded(user);

        int limit;
        int currentUsage;

        switch (feature) {
            case TASK_CREATE:
                limit = WEEKLY_TASK_LIMIT;
                currentUsage = user.getTasksCreatedThisWeek();
                if (currentUsage >= limit) {
                    throw new SubscriptionLimitExceededException(
                            "Weekly task limit reached (" + limit + "/week). Upgrade to Premium for unlimited tasks. ✨");
                }
                user.setTasksCreatedThisWeek(currentUsage + 1);
                break;

            case MEETING_SCHEDULE:
                limit = WEEKLY_MEETING_LIMIT;
                currentUsage = user.getMeetingsCreatedThisWeek();
                if (currentUsage >= limit) {
                    throw new SubscriptionLimitExceededException(
                            "Weekly meeting limit reached (" + limit + "/week). Upgrade to Premium for unlimited meetings. ✨");
                }
                user.setMeetingsCreatedThisWeek(currentUsage + 1);
                break;

            case EMAIL:
                limit = WEEKLY_EMAIL_LIMIT;
                currentUsage = user.getEmailsSentThisWeek();

                // Fallback to UserDailyUsage for emails (keep backward compat)
                UserDailyUsage emailUsage = usageRepository.findByUserAndUsageDate(user, LocalDate.now())
                        .orElseGet(() -> {
                            UserDailyUsage newUsage = new UserDailyUsage();
                            newUsage.setUser(user);
                            newUsage.setUsageDate(LocalDate.now());
                            return newUsage;
                        });
                if (user.getEmailsSentThisWeek() >= limit) {
                    throw new SubscriptionLimitExceededException(
                            "Weekly email limit reached (" + limit + "/week). Upgrade to Premium for unlimited emails. ✨");
                }
                user.setEmailsSentThisWeek(currentUsage + 1);
                emailUsage.setEmailsUsed(emailUsage.getEmailsUsed() + 1);
                usageRepository.save(emailUsage);
                break;

            default:
                limit = 0;
                break;
        }

        userRepository.save(user);

        int remaining;
        switch (feature) {
            case TASK_CREATE:
                remaining = WEEKLY_TASK_LIMIT - user.getTasksCreatedThisWeek();
                break;
            case MEETING_SCHEDULE:
                remaining = WEEKLY_MEETING_LIMIT - user.getMeetingsCreatedThisWeek();
                break;
            case EMAIL:
                remaining = WEEKLY_EMAIL_LIMIT - user.getEmailsSentThisWeek();
                break;
            default:
                remaining = 0;
                limit = 0;
        }

        return new UsageResponse(true, Math.max(0, remaining), limit, "FREE", false);
    }

    @Transactional
    public UsageResponse getUsageStats(User user, Feature feature) {
        if (isPremium(user)) {
            return new UsageResponse(true, -1, -1, "PREMIUM", false);
        }

        // Premium-only features — return locked
        if (feature == Feature.AI_REQUEST || feature == Feature.DOCUMENT_PROCESS) {
            return new UsageResponse(false, 0, 0, "FREE", true);
        }

        // Auto-reset if needed (also call during stats check so sidebar is always fresh)
        resetWeeklyUsageIfNeeded(user);

        int remaining;
        int limit;

        switch (feature) {
            case TASK_CREATE:
                limit = WEEKLY_TASK_LIMIT;
                remaining = limit - user.getTasksCreatedThisWeek();
                break;
            case MEETING_SCHEDULE:
                limit = WEEKLY_MEETING_LIMIT;
                remaining = limit - user.getMeetingsCreatedThisWeek();
                break;
            case EMAIL:
                limit = WEEKLY_EMAIL_LIMIT;
                remaining = limit - user.getEmailsSentThisWeek();
                break;
            default:
                limit = 0;
                remaining = 0;
        }

        return new UsageResponse(true, Math.max(0, remaining), limit, "FREE", false);
    }
}
