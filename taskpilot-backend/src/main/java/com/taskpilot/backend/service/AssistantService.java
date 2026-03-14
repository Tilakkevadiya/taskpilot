package com.taskpilot.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.taskpilot.backend.dto.FeatureResponse;
import com.taskpilot.backend.dto.ParseRequest;
import com.taskpilot.backend.dto.ParseResponse;
import com.taskpilot.backend.dto.UsageResponse;
import com.taskpilot.backend.entity.CommandHistory;
import com.taskpilot.backend.entity.User;
import com.taskpilot.backend.repository.CommandHistoryRepository;
import com.taskpilot.backend.repository.UserRepository;
import com.taskpilot.backend.entity.Task;
import com.taskpilot.backend.entity.Meeting;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AssistantService {

    private final CommandHistoryRepository commandHistoryRepository;
    private final UserRepository userRepository;
    private final AIService aiService;
    private final TaskService taskService;
    private final MeetingService meetingService;
    private final UserEmailService userEmailService;
    private final FeatureAccessService featureAccessService;
    private final ObjectMapper objectMapper;

    public FeatureResponse<ParseResponse> processCommand(ParseRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ParseResponse parseResponse = new ParseResponse();
        String executionStatus = "SUCCESS";

        try {
            featureAccessService.checkAndConsumeUsage(user, FeatureAccessService.Feature.AI_REQUEST);

            // 1. Call Groq via AIService
            String groqResponse = aiService.parseIntent(request.getText());
            if (groqResponse == null) {
                throw new RuntimeException("AI Service is temporarily unavailable. Please check your Groq API key.");
            }

            JsonNode root = objectMapper.readTree(groqResponse);
            parseResponse.setIntent(root.path("intent").asText("UNKNOWN"));
            parseResponse.setReply(root.path("reply").asText("Done!"));
            
            Map<String, Object> entities = new HashMap<>();
            root.path("entities").fields().forEachRemaining(entry -> entities.put(entry.getKey(), entry.getValue().asText()));
            parseResponse.setEntities(entities);

            // 2. Execute Action
            String intent = parseResponse.getIntent();
            if ("CREATE_TASK".equalsIgnoreCase(intent)) {
                Task task = new Task();
                task.setTitle((String) entities.getOrDefault("title", "New Task"));
                task.setPriority((String) entities.getOrDefault("priority", "medium"));
                taskService.createTask(task, userEmail);
            } else if ("SEND_EMAIL".equalsIgnoreCase(intent)) {
                featureAccessService.checkAndConsumeUsage(user, FeatureAccessService.Feature.EMAIL);
                String to = (String) entities.get("email");
                String msg = (String) entities.get("message");
                // Assistant using UserEmailService (User mode)
                userEmailService.sendEmail(user, to, "TaskPilot AI Assistant", msg);
            } else if ("CREATE_MEETING".equalsIgnoreCase(intent)) {
                Meeting meeting = new Meeting();
                meeting.setTitle((String) entities.getOrDefault("title", "Meeting"));
                meetingService.createMeeting(meeting, userEmail);
            } else if ("UNKNOWN".equalsIgnoreCase(intent)) {
                executionStatus = "FAILED";
            }
        } catch (Exception e) {
            executionStatus = "FAILED";
            parseResponse.setIntent("UNKNOWN");
            parseResponse.setReply("I understood the command, but there was an error executing it.");
            System.err.println("Assistant execution error: " + e.getMessage());
        }

        saveCommandHistory(request.getText(), parseResponse, executionStatus, user);
        UsageResponse finalUsage = featureAccessService.getUsageStats(user, FeatureAccessService.Feature.AI_REQUEST);
        return new FeatureResponse<>(parseResponse, finalUsage);
    }

    private void saveCommandHistory(String rawText, ParseResponse response, String status, User user) {
        CommandHistory history = new CommandHistory();
        history.setUser(user);
        history.setRawText(rawText);
        history.setDetectedIntent(response.getIntent());
        history.setAssistantReply(response.getReply());
        history.setExecutionStatus(status);
        commandHistoryRepository.save(history);
    }
}
