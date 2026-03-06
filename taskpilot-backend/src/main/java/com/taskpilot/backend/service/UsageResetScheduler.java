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
        usageRepository.deleteByUsageDateBefore(LocalDate.now().minusDays(30));
    }
}
