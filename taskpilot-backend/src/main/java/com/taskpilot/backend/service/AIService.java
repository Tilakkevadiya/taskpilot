package com.taskpilot.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;

import java.io.IOException;
import java.util.*;

@Service
@RequiredArgsConstructor
public class AIService {

    @Value("${groq.api.key}")
    private String groqApiKey;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    private static final String GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
    private static final String MODEL = "llama-3.3-70b-versatile";

    public String callGroq(String systemPrompt, String userPrompt, boolean requireJson) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + groqApiKey);

            Map<String, Object> body = new HashMap<>();
            body.put("model", MODEL);
            
            List<Map<String, String>> messages = new ArrayList<>();
            messages.add(Map.of("role", "system", "content", systemPrompt));
            messages.add(Map.of("role", "user", "content", userPrompt));
            
            body.put("messages", messages);
            body.put("temperature", 0.7);
            
            if (requireJson) {
                body.put("response_format", Map.of("type", "json_object"));
            }

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(GROQ_URL, entity, String.class);

            if (response.getStatusCode() == HttpStatus.OK) {
                JsonNode root = objectMapper.readTree(response.getBody());
                return root.path("choices").path(0).path("message").path("content").asText();
            }
            return null;
        } catch (Exception e) {
            System.err.println("Groq API Error: " + e.getMessage());
            return null;
        }
    }

    public String parseIntent(String text) {
        String systemPrompt = "You are TaskPilot AI. Detect intent (CREATE_TASK, SEND_EMAIL, CREATE_MEETING, UNKNOWN) and extract entities. " +
                "Return ONLY JSON with keys: intent, entities (map), reply (natural language). " +
                "Entities for CREATE_TASK: title, priority. " +
                "Entities for SEND_EMAIL: email, message. " +
                "Entities for CREATE_MEETING: title.";
        return callGroq(systemPrompt, text, true);
    }

    public String summarizeDocument(String content) {
        String systemPrompt = "Summarize the following document content concisely. Focus on key action items and insights.";
        return callGroq(systemPrompt, content, false);
    }

    public String generateKeyPoints(String content) {
        String systemPrompt = "Extract the key action items and main insights from this document as a bulleted list.";
        return callGroq(systemPrompt, content, false);
    }

    public String generateEmail(String prompt) {
        String systemPrompt = "Draft a professional email based on the user's prompt. Return ONLY the email body.";
        return callGroq(systemPrompt, prompt, false);
    }

    public String summarizeMeeting(String transcript) {
        String systemPrompt = "Generate meeting minutes from this transcript. Include attendees if mentioned, key points, and action items.";
        return callGroq(systemPrompt, transcript, false);
    }

    public String extractTextFromPdf(MultipartFile file) {
        try (PDDocument document = PDDocument.load(file.getInputStream())) {
            PDFTextStripper stripper = new PDFTextStripper();
            String text = stripper.getText(document);
            if (text != null) text = text.trim();
            return text;
        } catch (IOException e) {
            System.err.println("Error extracting text from PDF: " + e.getMessage());
            return null;
        }
    }
}
