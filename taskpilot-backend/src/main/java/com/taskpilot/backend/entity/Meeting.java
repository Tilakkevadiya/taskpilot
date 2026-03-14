package com.taskpilot.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.Instant;

@Data
@Entity
@Table(name = "meetings")
public class Meeting {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String title;

    private Instant meetingTime;

    private String participants; // Comma separated list of emails

    private String location;
    private String type;
    private Integer duration;
    private String description;

    private Integer reminderMinutesBefore;
    private boolean reminderSent = false;
}
