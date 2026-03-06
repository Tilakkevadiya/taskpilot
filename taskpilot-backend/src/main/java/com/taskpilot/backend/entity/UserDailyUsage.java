package com.taskpilot.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Data
@Entity
@Table(name = "user_daily_usage", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "user_id", "usage_date" })
})
public class UserDailyUsage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "usage_date", nullable = false)
    private LocalDate usageDate;

    // Daily counters
    private int emailsSentCount = 0;
    private int voiceCommandsCount = 0;
    private int meetingsScheduledCount = 0;
    private int tasksCreatedCount = 0;
}
