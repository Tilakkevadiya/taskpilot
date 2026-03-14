package com.taskpilot.backend.service;

import com.taskpilot.backend.repository.UserDailyUsageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Component
public class UsageResetScheduler {

    @Autowired
    private UserDailyUsageRepository usageRepository;

    /**
     * Runs every day at midnight server time.
     * Deletes usage logs older than 30 days to prevent bloat.
     */
    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void cleanupOldUsageLogs() {
        // According to user request: need to effectively "reset" usage.
        // Instead of actively resetting fields on existing rows, our logic in FeatureAccessService
        // queries by `LocalDate.now()`. This means yesterday's logs naturally won't affect today's limits.
        // Thus, keeping `deleteByUsageDateBefore(LocalDate.now().minusDays(30))` is perfectly sufficient 
        // to prevent bloat without breaking the "reset" mechanism, since limits reset automatically 
        // on a new calendar date.
        usageRepository.deleteByUsageDateBefore(LocalDate.now().minusDays(30));
    }
}
