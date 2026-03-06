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

        task.setUser(user);
        Task savedTask = taskRepository.save(task);

        return new FeatureResponse<>(savedTask, usage);
    }

    public FeatureResponse<List<Task>> getUserTasks(String email) {
        User user = userRepository.findByEmail(email).orElse(null);
        if (user != null) {
            List<Task> tasks = taskRepository.findByUserOrderByDueDateAsc(user);
            UsageResponse usage = featureAccessService.getUsageStats(user, FeatureAccessService.Feature.TASK_CREATE);
            return new FeatureResponse<>(tasks, usage);
        }
        return new FeatureResponse<>(List.of(), null);
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
