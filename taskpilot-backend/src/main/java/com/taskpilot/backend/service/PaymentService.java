package com.taskpilot.backend.service;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.Utils;
import com.taskpilot.backend.entity.Payment;
import com.taskpilot.backend.entity.User;
import com.taskpilot.backend.repository.PaymentRepository;
import com.taskpilot.backend.repository.UserRepository;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.time.LocalDateTime;
import java.util.Formatter;
import java.util.HashMap;
import java.util.Map;

@Service
public class PaymentService {

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    @Value("${razorpay.webhook.secret}")
    private String razorpayWebhookSecret;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PaymentRepository paymentRepository;


    // ─── 1. Create Razorpay Order ─────────────────────────────────────────────

    /**
     * Creates a Razorpay order and persists a CREATED payment record.
     * Returns {orderId, amount, currency, key} to the frontend.
     */
    @Transactional
    public Map<String, Object> createOrder(String userEmail) {
        // ₹299 = 29900 paise
        long amountInPaise = 29900L;

        try {
            RazorpayClient razorpay = new RazorpayClient(razorpayKeyId, razorpayKeySecret);

            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", amountInPaise);
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "receipt_" + System.currentTimeMillis());
            orderRequest.put("payment_capture", 1); // auto-capture

            Order order = razorpay.orders.create(orderRequest);
            String orderId = order.get("id").toString();

            // Persist payment record
            User user = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new RuntimeException("User not found: " + userEmail));

            Payment payment = new Payment();
            payment.setUser(user);
            payment.setRazorpayOrderId(orderId);
            payment.setAmount(amountInPaise);
            payment.setCurrency("INR");
            payment.setStatus(Payment.PaymentStatus.CREATED);
            paymentRepository.save(payment);

            Map<String, Object> response = new HashMap<>();
            response.put("orderId", orderId);
            response.put("amount", amountInPaise);
            response.put("currency", "INR");
            response.put("key", razorpayKeyId);
            return response;

        } catch (Exception e) {
            throw new RuntimeException("Failed to create Razorpay order: " + e.getMessage(), e);
        }
    }

    // ─── 2. Verify Signature (frontend calls after checkout) ─────────────────

    /**
     * Verifies Razorpay signature for an order-based payment.
     * Formula: HMAC-SHA256(orderId + "|" + paymentId, keySecret)
     * Marks payment as VERIFIED — upgrade happens only after webhook.
     */
    @Transactional
    public boolean verifyAndMarkPayment(String orderId, String paymentId, String signature) {
        // Verify HMAC signature
        boolean isValid = verifyOrderSignature(orderId, paymentId, signature);

        if (isValid) {
            // Mark payment as VERIFIED (not yet CAPTURED — webhook will finalize)
            paymentRepository.findByRazorpayOrderId(orderId).ifPresent(payment -> {
                payment.setRazorpayPaymentId(paymentId);
                payment.setStatus(Payment.PaymentStatus.VERIFIED);
                paymentRepository.save(payment);
            });
        } else {
            // Record failed verification
            paymentRepository.findByRazorpayOrderId(orderId).ifPresent(payment -> {
                payment.setStatus(Payment.PaymentStatus.FAILED);
                paymentRepository.save(payment);
            });
        }
        return isValid;
    }

    private boolean verifyOrderSignature(String orderId, String paymentId, String signature) {
        try {
            String payload = orderId + "|" + paymentId;
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(razorpayKeySecret.getBytes(), "HmacSHA256");
            mac.init(secretKeySpec);
            byte[] hash = mac.doFinal(payload.getBytes());

            Formatter formatter = new Formatter();
            for (byte b : hash) {
                formatter.format("%02x", b);
            }
            String generatedSignature = formatter.toString();
            formatter.close();

            return generatedSignature.equals(signature);
        } catch (Exception e) {
            return false;
        }
    }

    // ─── 3. Upgrade User (called ONLY from webhook) ───────────────────────────

    @Transactional
    public void upgradeUserToPremium(String email, String razorpayPaymentId, String razorpayOrderId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));

        user.setPlanType(User.PlanType.PREMIUM);
        user.setSubscriptionStatus(User.SubscriptionStatus.ACTIVE);
        user.setSubscriptionStartDate(LocalDateTime.now());
        user.setSubscriptionEndDate(LocalDateTime.now().plusMonths(1));
        userRepository.save(user);

        // Update payment record to CAPTURED
        paymentRepository.findByRazorpayOrderId(razorpayOrderId).ifPresent(payment -> {
            payment.setRazorpayPaymentId(razorpayPaymentId);
            payment.setStatus(Payment.PaymentStatus.CAPTURED);
            paymentRepository.save(payment);
        });
    }

    // ─── 4. Generate fresh JWT for upgraded user ───────────────────────────────


    // ─── 5. Webhook Event Handling ────────────────────────────────────────────

    /**
     * Processes a Razorpay webhook.
     * Verifies HMAC signature using webhook secret.
     * On payment.captured: upgrades user.
     * On subscription.cancelled: marks subscription CANCELLED.
     */
    public void handleWebhookEvent(String payload, String razorpaySignature) {
        // 1. Verify webhook signature using Razorpay Utils
        try {
            Utils.verifyWebhookSignature(payload, razorpaySignature, razorpayWebhookSecret);
        } catch (Exception e) {
            throw new SecurityException("Invalid Razorpay webhook signature: " + e.getMessage());
        }

        // 2. Parse event
        JSONObject event = new JSONObject(payload);
        String eventType = event.getString("event");

        switch (eventType) {
            case "payment.captured": {
                JSONObject paymentData = event
                        .getJSONObject("payload")
                        .getJSONObject("payment")
                        .getJSONObject("entity");

                String paymentId = paymentData.getString("id");
                String orderId = paymentData.getString("order_id");

                // Look up payment record → find user → upgrade
                paymentRepository.findByRazorpayOrderId(orderId).ifPresent(payment -> {
                    String userEmail = payment.getUser().getEmail();
                    upgradeUserToPremium(userEmail, paymentId, orderId);
                    System.out.println("[Webhook] Upgraded user " + userEmail + " to PREMIUM via payment " + paymentId);
                });
                break;
            }
            case "subscription.cancelled": {
                // Best-effort: find by subscription ID stored on user
                JSONObject subData = event
                        .getJSONObject("payload")
                        .getJSONObject("subscription")
                        .getJSONObject("entity");
                String subId = subData.getString("id");
                userRepository.findByRazorpaySubscriptionId(subId).ifPresent(user -> {
                    user.setSubscriptionStatus(User.SubscriptionStatus.CANCELLED);
                    userRepository.save(user);
                    System.out.println("[Webhook] Subscription cancelled for user " + user.getEmail());
                });
                break;
            }
            case "payment.failed": {
                JSONObject paymentData = event
                        .getJSONObject("payload")
                        .getJSONObject("payment")
                        .getJSONObject("entity");
                String orderId = paymentData.optString("order_id", null);
                if (orderId != null) {
                    paymentRepository.findByRazorpayOrderId(orderId).ifPresent(payment -> {
                        payment.setStatus(Payment.PaymentStatus.FAILED);
                        paymentRepository.save(payment);
                        System.out.println("[Webhook] Payment failed for order " + orderId);
                    });
                }
                break;
            }
            default:
                System.out.println("[Webhook] Unhandled event type: " + eventType);
        }
    }
}
