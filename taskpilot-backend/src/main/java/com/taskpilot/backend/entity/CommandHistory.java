package com.taskpilot.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "command_history")
public class CommandHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 1000)
    private String rawText;

    private String detectedIntent;

    private String executionStatus; // e.g. "SUCCESS", "FAILED"

    @Column(columnDefinition = "TEXT")
    private String assistantReply;

    @Column(updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
