package com.taskpilot.backend.service;

import com.razorpay.RazorpayClient;
import com.razorpay.Subscription;
import com.taskpilot.backend.entity.User;
import com.taskpilot.backend.repository.UserRepository;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.time.LocalDateTime;
import java.util.Formatter;

@Service
public class PaymentService {

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    @Autowired
    private UserRepository userRepository;

    public String createSubscription(String email) {
        try {
            RazorpayClient razorpay = new RazorpayClient(razorpayKeyId, razorpayKeySecret);

            JSONObject subscriptionRequest = new JSONObject();
            subscriptionRequest.put("plan_id", "plan_premium_placeholder"); // Create this in Razorpay Dashboard
            subscriptionRequest.put("total_count", 12); // E.g. 12 months recurrent
            subscriptionRequest.put("customer_notify", 1);

            Subscription subscription = razorpay.subscriptions.create(subscriptionRequest);
            return subscription.get("id").toString();
        } catch (Exception e) {
            throw new RuntimeException("Failed to create Razorpay Subscription", e);
        }
    }

    public boolean verifyPaymentSignature(String subscriptionId, String paymentId, String signature) {
        try {
            String payload = paymentId + "|" + subscriptionId;
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
            e.printStackTrace();
            return false;
        }
    }

    public void upgradeUserToPremium(String email, String customerId, String subscriptionId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setSubscriptionPlan(User.SubscriptionPlan.PREMIUM);
        user.setSubscriptionStatus(User.SubscriptionStatus.ACTIVE);
        user.setSubscriptionStartDate(LocalDateTime.now());
        user.setSubscriptionEndDate(LocalDateTime.now().plusMonths(1));
        user.setRazorpayCustomerId(customerId);
        user.setRazorpaySubscriptionId(subscriptionId);

        userRepository.save(user);
    }

    public void cancelSubscription(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        try {
            RazorpayClient razorpay = new RazorpayClient(razorpayKeyId, razorpayKeySecret);
            String subId = user.getRazorpaySubscriptionId();
            if (subId != null && !subId.isEmpty()) {
                razorpay.subscriptions.cancel(subId);
            }
            user.setSubscriptionStatus(User.SubscriptionStatus.CANCELLED);
            userRepository.save(user);
        } catch (Exception e) {
            throw new RuntimeException("Failed to cancel subscription", e);
        }
    }
}
