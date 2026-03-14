package com.taskpilot.backend.controller;

import com.taskpilot.backend.service.AIService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class AIController {

    private final AIService aiService;

    @PostMapping("/summarize")
    public ResponseEntity<Map<String, String>> summarize(
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "content", required = false) String content) {
        
        String textToSummarize = content;
        
        if (file != null && !file.isEmpty()) {
            String extractedText = aiService.extractTextFromPdf(file);
            if (extractedText != null) {
                textToSummarize = extractedText;
            }
        }
        
        String summary = aiService.summarizeDocument(textToSummarize);
        return ResponseEntity.ok(Map.of("summary", summary != null ? summary : "Could not generate summary."));
    }

    @PostMapping("/extract-text")
    public ResponseEntity<Map<String, String>> extractText(@RequestParam("file") MultipartFile file) {
        String text = aiService.extractTextFromPdf(file);
        return ResponseEntity.ok(Map.of("text", text != null ? text : "Could not extract text."));
    }

    @PostMapping("/key-points")
    public ResponseEntity<Map<String, String>> keyPoints(
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "content", required = false) String content) {
        
        String textToAnalyze = content;
        if (file != null && !file.isEmpty()) {
            String extracted = aiService.extractTextFromPdf(file);
            if (extracted != null) textToAnalyze = extracted;
        }
        
        String points = aiService.generateKeyPoints(textToAnalyze);
        return ResponseEntity.ok(Map.of("points", points != null ? points : "Could not generate key points."));
    }

    @PostMapping("/generate-email")
    public ResponseEntity<Map<String, String>> generateEmail(@RequestBody Map<String, String> request) {
        String prompt = request.get("prompt");
        String emailBody = aiService.generateEmail(prompt);
        return ResponseEntity.ok(Map.of("emailBody", emailBody != null ? emailBody : "Could not generate email."));
    }

    @PostMapping("/parse-intent")
    public ResponseEntity<String> parseIntent(@RequestBody Map<String, String> request) {
        String text = request.get("text");
        String result = aiService.parseIntent(text);
        return ResponseEntity.ok(result);
    }
}
