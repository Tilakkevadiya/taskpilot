package com.taskpilot.backend.service;

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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class AssistantService {

    @Value("${ai.service.url}")
    private String aiServiceUrl;

    @Autowired
    private CommandHistoryRepository commandHistoryRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private TaskService taskService;

    @Autowired
    private MeetingService meetingService;

    @Autowired
    private EmailService emailService;

    @Autowired
    private FeatureAccessService featureAccessService;

    public FeatureResponse<ParseResponse> processCommand(ParseRequest request, String userEmail) {

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        featureAccessService.checkAndConsumeUsage(user,
                FeatureAccessService.Feature.VOICE_COMMAND);

        // 1. Call FastAPI Service
        String url = aiServiceUrl + "/assistant/parse";
        ParseResponse pythonResponse = restTemplate.postForObject(url, request, ParseResponse.class);

        // 2. Execute Action based on Intent
        String executionStatus = "SUCCESS";
        if (pythonResponse != null) {
            String intent = pythonResponse.getIntent();
            try {
                if ("CREATE_TASK".equalsIgnoreCase(intent)) {
                    Task task = new Task();
                    task.setTitle((String) pythonResponse.getEntities().getOrDefault("title", "New Task"));
                    task.setPriority((String) pythonResponse.getEntities().getOrDefault("priority", "medium"));
                    taskService.createTask(task, userEmail);
                } else if ("SEND_EMAIL".equalsIgnoreCase(intent)) {
                    featureAccessService.checkAndConsumeUsage(user, FeatureAccessService.Feature.EMAIL);
                    String to = (String) pythonResponse.getEntities().get("email");
                    String msg = (String) pythonResponse.getEntities().get("message");
                    emailService.sendEmail(to, "Message from TaskPilot AI", msg);
                } else if ("CREATE_MEETING".equalsIgnoreCase(intent)) {
                    Meeting meeting = new Meeting();
                    meeting.setTitle((String) pythonResponse.getEntities().getOrDefault("title", "Meeting"));
                    // For simplified demo, we parse string to simple fields. Actual implementation
                    // parses LocalDateTime
                    // meeting.setMeetingTime(...);
                    meetingService.createMeeting(meeting, userEmail);
                } else if ("UNKNOWN".equalsIgnoreCase(intent)) {
                    executionStatus = "FAILED";
                }
            } catch (Exception e) {
                executionStatus = "FAILED";
                pythonResponse.setReply("I understood the command, but there was an error executing it.");
            }
        } else {
            executionStatus = "FAILED";
            pythonResponse = new ParseResponse();
            pythonResponse.setReply("Could not process command via AI.");
        }

        // 3. Save Command History
        saveCommandHistory(request.getText(), pythonResponse, executionStatus, user);

        // Fetch latest usage stats after whatever actions occurred
        UsageResponse finalUsage = featureAccessService.getUsageStats(user, FeatureAccessService.Feature.VOICE_COMMAND);
        return new FeatureResponse<>(pythonResponse, finalUsage);
    }

    private void saveCommandHistory(String rawText, ParseResponse response, String status, User user) {
        if (user != null) {
            CommandHistory history = new CommandHistory();
            history.setUser(user);
            history.setRawText(rawText);
            history.setDetectedIntent(response.getIntent());
            history.setAssistantReply(response.getReply());
            history.setExecutionStatus(status);
            commandHistoryRepository.save(history);
        }
    }
}
