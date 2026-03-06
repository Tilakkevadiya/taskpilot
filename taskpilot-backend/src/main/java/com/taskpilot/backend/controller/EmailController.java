package com.taskpilot.backend.controller;

import com.taskpilot.backend.dto.EmailRequest;
import com.taskpilot.backend.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/email")
@CrossOrigin(origins = "*") // Update to specific origin in production if needed
public class EmailController {

    @Autowired
    private EmailService emailService;

    @PostMapping("/send")
    public ResponseEntity<Map<String, String>> sendEmail(@RequestBody EmailRequest request) {
        Map<String, String> response = new HashMap<>();
        try {
            // Validate inputs
            if (request.getTo() == null || request.getTo().trim().isEmpty() ||
                    request.getSubject() == null || request.getSubject().trim().isEmpty() ||
                    request.getBody() == null || request.getBody().trim().isEmpty()) {

                response.put("error", "To, subject, and body are required fields.");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }

            if (!request.getTo().matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
                response.put("error", "Invalid email format in 'To' field.");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }

            // Send Email
            emailService.sendEmail(request.getTo(), request.getSubject(), request.getBody());

            // Return Success Map
            response.put("message", "Email sent successfully to " + request.getTo());
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("error", "Failed to send email: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
