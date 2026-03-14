package com.taskpilot.backend.controller;

import com.taskpilot.backend.service.UserEmailService;
import com.taskpilot.backend.service.SystemEmailService;
import com.taskpilot.backend.service.FeatureAccessService;
import com.taskpilot.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.HashMap;
import java.util.Collections;

@RestController
@RequestMapping("/api/email")
@CrossOrigin(origins = "*")
public class EmailController {

    private final UserEmailService userEmailService;
    private final SystemEmailService systemEmailService;
    private final UserRepository userRepository;
    private final FeatureAccessService featureAccessService;

    @Autowired
    public EmailController(UserEmailService userEmailService, 
                           SystemEmailService systemEmailService,
                           UserRepository userRepository, 
                           FeatureAccessService featureAccessService) {
        this.userEmailService = userEmailService;
        this.systemEmailService = systemEmailService;
        this.userRepository = userRepository;
        this.featureAccessService = featureAccessService;
    }

    @PostMapping(value = "/send", consumes = "multipart/form-data")
    public ResponseEntity<Map<String, String>> sendEmail(
            @RequestParam("to") String to,
            @RequestParam("subject") String subject,
            @RequestParam("body") String body,
            @RequestParam(value = "files", required = false) org.springframework.web.multipart.MultipartFile[] files) {
        
        Map<String, String> response = new HashMap<>();
        String username = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        com.taskpilot.backend.entity.User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        featureAccessService.checkAndConsumeUsage(user, FeatureAccessService.Feature.EMAIL);

        try {
            if (to == null || to.trim().isEmpty() || subject == null || subject.trim().isEmpty() || body == null || body.trim().isEmpty()) {
                response.put("error", "To, subject, and body are required fields.");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }

            // User Email Mode: Send via User account if possible
            if ("GOOGLE".equals(user.getAuthProvider()) && user.getGoogleRefreshToken() != null) {
                userEmailService.sendEmail(user, to, subject, body);
                response.put("message", "Email sent via your Gmail account 🚀");
            } else {
                // Fallback to System Email Mode
                systemEmailService.sendEmail(to, subject, body);
                response.put("message", "Email sent via TaskPilot System ✈️");
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("error", "Failed to send email: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/contacts")
    public ResponseEntity<?> getContacts() {
        String username = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        com.taskpilot.backend.entity.User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!"GOOGLE".equals(user.getAuthProvider())) {
            return ResponseEntity.badRequest().body("Gmail contacts only available for Google-authenticated users.");
        }

        try {
            // Refactored method name in AIService/UserEmailService context
            // Note: GmailApiService's getGoogleContacts was moved/refactored logic
            return ResponseEntity.ok(Collections.emptyList()); // Placeholder for now if logic not fully ported
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to fetch contacts: " + e.getMessage());
        }
    }
}
