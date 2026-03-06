package com.taskpilot.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
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
    private SubscriptionPlan subscriptionPlan = SubscriptionPlan.FREE;

    private LocalDateTime subscriptionStartDate;
    private LocalDateTime subscriptionEndDate;

    @Enumerated(EnumType.STRING)
    private SubscriptionStatus subscriptionStatus = SubscriptionStatus.ACTIVE;

    private String razorpayCustomerId;
    private String razorpaySubscriptionId;

    @Column(updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum SubscriptionPlan {
        FREE, PREMIUM
    }

    public enum SubscriptionStatus {
        ACTIVE, EXPIRED, CANCELLED
    }
}
