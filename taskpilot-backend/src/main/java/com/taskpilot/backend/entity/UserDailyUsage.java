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
    private int emailsUsed = 0;
    private int meetingsUsed = 0;
    private int tasksUsed = 0;
}
