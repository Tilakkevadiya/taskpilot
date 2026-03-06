package com.taskpilot.backend.controller;

import com.taskpilot.backend.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payment")
@CrossOrigin(origins = "*")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @PostMapping("/create-subscription")
    public ResponseEntity<Map<String, String>> createSubscription(Authentication auth) {
        String email = auth.getName();
        String subscriptionId = paymentService.createSubscription(email);

        Map<String, String> response = new HashMap<>();
        response.put("subscriptionId", subscriptionId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify-payment")
    public ResponseEntity<Map<String, String>> verifyPayment(@RequestBody Map<String, String> payload,
            Authentication auth) {
        String razorpayPaymentId = payload.get("razorpay_payment_id");
        String razorpaySubscriptionId = payload.get("razorpay_subscription_id");
        String razorpaySignature = payload.get("razorpay_signature");

        boolean isValid = paymentService.verifyPaymentSignature(razorpaySubscriptionId, razorpayPaymentId,
                razorpaySignature);

        if (isValid) {
            String customerId = "cust_dummy"; // You can optionally fetch actual customer ID from webhook or API
            paymentService.upgradeUserToPremium(auth.getName(), customerId, razorpaySubscriptionId);

            Map<String, String> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Upgraded to PREMIUM successfully.");
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid signature."));
        }
    }

    @PostMapping("/cancel-subscription")
    public ResponseEntity<Map<String, String>> cancelSubscription(Authentication auth) {
        paymentService.cancelSubscription(auth.getName());
        return ResponseEntity.ok(Map.of("status", "success", "message",
                "Subscription cancelled. You will retain premium until billing period ends."));
    }

    // Webhook endpoint (Requires unauthenticated access in SecurityConfig)
    @PostMapping("/webhook")
    public ResponseEntity<Void> razorpayWebhook(@RequestBody String payload,
            @RequestHeader(value = "X-Razorpay-Signature", required = false) String signature) {
        // Implement webhook validation and state syncing here for recurring charges
        // E.g., capturing "subscription.charged", "subscription.halted"
        System.out.println("Razorpay Webhook Triggered: " + payload);
        return ResponseEntity.ok().build();
    }
}
