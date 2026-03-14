package com.taskpilot.backend.controller;

import com.taskpilot.backend.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payment")
@CrossOrigin(origins = "*")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;
 
    @Autowired
    private com.taskpilot.backend.service.AuthService authService;

    // ─── 1. Create Order ──────────────────────────────────────────────────────

    /**
     * Authenticated endpoint.
     * Creates a Razorpay order for the currently logged-in user.
     * Returns { orderId, amount, currency, key } to open the checkout.
     */
    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder() {
        // SECURITY: always get email from JWT token — never from request body
        String email = getAuthenticatedEmail();
        try {
            Map<String, Object> orderDetails = paymentService.createOrder(email);
            return ResponseEntity.ok(orderDetails);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to create payment order: " + e.getMessage()));
        }
    }

    // ─── 2. Verify Signature (called by frontend after checkout success) ───────

    /**
     * Authenticated endpoint.
     * Verifies Razorpay payment signature.
     * Marks payment as VERIFIED — does NOT upgrade user.
     * Actual upgrade happens only after webhook payment.captured.
     */
    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(@RequestBody Map<String, String> payload) {
        String orderId   = payload.get("razorpay_order_id");
        String paymentId = payload.get("razorpay_payment_id");
        String signature = payload.get("razorpay_signature");

        if (orderId == null || paymentId == null || signature == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Missing required payment fields"));
        }

        boolean isValid = paymentService.verifyAndMarkPayment(orderId, paymentId, signature);

        if (isValid) {
            // Return success — client can show "payment received, activating..."
            // Actual upgrade is done by the webhook
            return ResponseEntity.ok(Map.of(
                "status", "verified",
                "message", "Payment received! Your account will be upgraded shortly."
            ));
        } else {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Payment signature verification failed."));
        }
    }

    // ─── 3. Manual Token Refresh after Upgrade ────────────────────────────────

    /**
     * Authenticated endpoint.
     * Generates a fresh JWT for the current user reflecting their updated plan.
     * Frontend calls this after receiving the webhook-triggered upgrade.
     */
    @PostMapping("/refresh-token")
    public ResponseEntity<?> refreshToken() {
        String email = getAuthenticatedEmail();
        try {
            String newToken = authService.refreshTokenForUser(email);
            return ResponseEntity.ok(Map.of("token", newToken));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to refresh token: " + e.getMessage()));
        }
    }

    // ─── 4. Webhook (unauthenticated — Razorpay calls this) ───────────────────

    /**
     * Unauthenticated endpoint (allowed in SecurityConfig).
     * Razorpay sends events here (payment.captured, payment.failed, etc).
     * Signature is verified using webhook secret before processing.
     */
    @PostMapping("/webhook")
    public ResponseEntity<Void> razorpayWebhook(
            @RequestBody String payload,
            @RequestHeader(value = "X-Razorpay-Signature", required = false) String signature) {

        if (signature == null || signature.isBlank()) {
            System.out.println("[Webhook] Rejected: missing signature header");
            return ResponseEntity.badRequest().build();
        }

        try {
            paymentService.handleWebhookEvent(payload, signature);
            return ResponseEntity.ok().build();
        } catch (SecurityException e) {
            System.err.println("[Webhook] Signature mismatch: " + e.getMessage());
            return ResponseEntity.status(401).build();
        } catch (Exception e) {
            System.err.println("[Webhook] Error processing event: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    // ─── Helper ───────────────────────────────────────────────────────────────

    private String getAuthenticatedEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            throw new IllegalStateException("No authenticated user in security context");
        }
        return auth.getName();
    }
}
