package com.taskpilot.backend.controller;

import com.taskpilot.backend.dto.FeatureResponse;
import com.taskpilot.backend.dto.ParseRequest;
import com.taskpilot.backend.dto.ParseResponse;
import com.taskpilot.backend.service.AssistantService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/assistant")
@CrossOrigin(origins = "*")
public class AssistantController {

    @Autowired
    private AssistantService assistantService;

    @PostMapping("/execute")
    public ResponseEntity<FeatureResponse<ParseResponse>> executeCommand(@RequestBody ParseRequest request) {
        String email = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        FeatureResponse<ParseResponse> response = assistantService.processCommand(request, email);
        return ResponseEntity.ok(response);
    }
}
