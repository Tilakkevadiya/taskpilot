package com.taskpilot.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "payments")
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, unique = true)
    private String razorpayOrderId;

    private String razorpayPaymentId; // set after webhook confirms capture

    private Long amount; // in paise

    private String currency;

    @Enumerated(EnumType.STRING)
    private PaymentStatus status;

    @Column(updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt = LocalDateTime.now();

    public enum PaymentStatus {
        CREATED,       // order created, user hasn't paid yet
        VERIFIED,      // /verify called and signature OK — waiting for webhook
        CAPTURED,      // webhook payment.captured received — user is PREMIUM
        FAILED         // payment failed or signature invalid
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
