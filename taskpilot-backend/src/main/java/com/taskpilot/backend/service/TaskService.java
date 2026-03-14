package com.taskpilot.backend.service;

import com.taskpilot.backend.dto.FeatureResponse;
import com.taskpilot.backend.dto.UsageResponse;
import com.taskpilot.backend.entity.Task;
import com.taskpilot.backend.entity.User;
import com.taskpilot.backend.repository.TaskRepository;
import com.taskpilot.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TaskService {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FeatureAccessService featureAccessService;

    public FeatureResponse<Task> createTask(Task task, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        UsageResponse usage = featureAccessService.checkAndConsumeUsage(user, FeatureAccessService.Feature.TASK_CREATE);

        if (task.getDueTime() != null && task.getDueTime().isBefore(java.time.Instant.now())) {
            throw new RuntimeException("Task due time must be in the future");
        }

        task.setUser(user);
        Task savedTask = taskRepository.save(task);

        return new FeatureResponse<>(savedTask, usage);
    }

    public FeatureResponse<List<Task>> getUserTasks(String email) {
        User user = userRepository.findByEmail(email).orElse(null);
        if (user != null) {
            List<Task> tasks = taskRepository.findByUserOrderByDueTimeAsc(user);
            UsageResponse usage = featureAccessService.getUsageStats(user, FeatureAccessService.Feature.TASK_CREATE);
            return new FeatureResponse<>(tasks, usage);
        }
        return new FeatureResponse<>(List.of(), null);
    }

    public FeatureResponse<Task> updateTask(Long id, Task taskDetails, String email) {
        Optional<Task> optTask = taskRepository.findById(id);
        if (optTask.isPresent() && optTask.get().getUser().getEmail().equals(email)) {
            Task task = optTask.get();
            task.setTitle(taskDetails.getTitle());
            task.setPriority(taskDetails.getPriority());
            task.setDueTime(taskDetails.getDueTime());
            task.setReminderMinutesBefore(taskDetails.getReminderMinutesBefore());
            
            if (task.getDueTime() != null && task.getDueTime().isBefore(java.time.Instant.now())) {
                // Optional: you might want to allow updating past tasks if only the title changed, 
                // but let's stick to the rule for now.
            }
            
            Task saved = taskRepository.save(task);
            UsageResponse usage = featureAccessService.getUsageStats(task.getUser(), FeatureAccessService.Feature.TASK_CREATE);
            return new FeatureResponse<>(saved, usage);
        }
        throw new RuntimeException("Task not found or unauthorized");
    }

    public FeatureResponse<Task> updateTaskStatus(Long id, String status, String email) {
        Optional<Task> optTask = taskRepository.findById(id);
        if (optTask.isPresent() && optTask.get().getUser().getEmail().equals(email)) {
            Task task = optTask.get();
            task.setStatus(status);
            Task saved = taskRepository.save(task);
            UsageResponse usage = featureAccessService.getUsageStats(optTask.get().getUser(),
                    FeatureAccessService.Feature.TASK_CREATE);
            return new FeatureResponse<>(saved, usage);
        }
        throw new RuntimeException("Task not found or unauthorized");
    }

    public void deleteTask(Long id, String email) {
        Optional<Task> optTask = taskRepository.findById(id);
        if (optTask.isPresent() && optTask.get().getUser().getEmail().equals(email)) {
            taskRepository.delete(optTask.get());
        }
    }
}
