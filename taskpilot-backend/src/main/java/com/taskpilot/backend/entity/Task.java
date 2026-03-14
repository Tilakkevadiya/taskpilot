package com.taskpilot.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.Instant;

@Data
@Entity
@Table(name = "tasks")
public class Task {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String title;

    private String description;

    private String priority; // e.g., "high", "medium", "low"

    private String status = "PENDING"; // e.g., "PENDING", "COMPLETED"

    private Instant dueTime;
    private Integer reminderMinutesBefore;
    private boolean reminderSent = false;
}
