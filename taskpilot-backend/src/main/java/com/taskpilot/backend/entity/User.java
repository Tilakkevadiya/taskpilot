package com.taskpilot.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    private String profession;

    @Column(unique = true, nullable = false)
    private String email;

    private String passwordHash;

    private boolean emailVerified = true;
    private String authProvider; // LOCAL or GOOGLE

    private boolean premiumStatus = false; // Legacy field, keeping for backward compatibility if needed, or we can use
                                           // subscriptionPlan

    @Enumerated(EnumType.STRING)
    private PlanType planType = PlanType.FREE;

    private LocalDateTime subscriptionStartDate;
    private LocalDateTime subscriptionEndDate;

    @Enumerated(EnumType.STRING)
    private SubscriptionStatus subscriptionStatus = SubscriptionStatus.NONE;

    private String razorpayCustomerId;
    private String razorpaySubscriptionId;

    private String googleAccessToken;
    private String googleRefreshToken;
    private LocalDateTime googleTokenExpiry;

    // Weekly usage tracking (resets every 7 days)
    private int tasksCreatedThisWeek = 0;
    private int meetingsCreatedThisWeek = 0;
    private int emailsSentThisWeek = 0;
    private LocalDate lastUsageResetDate;

    @Column(updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum PlanType {
        FREE, PREMIUM
    }

    public enum SubscriptionStatus {
        ACTIVE, EXPIRED, CANCELLED, NONE
    }
}
