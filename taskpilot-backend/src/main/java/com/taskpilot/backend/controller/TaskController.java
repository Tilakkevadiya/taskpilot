package com.taskpilot.backend.controller;

import com.taskpilot.backend.dto.FeatureResponse;
import com.taskpilot.backend.entity.Task;
import com.taskpilot.backend.service.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "*")
public class TaskController {

    @Autowired
    private TaskService taskService;

    @GetMapping
    public ResponseEntity<FeatureResponse<List<Task>>> getTasks(Authentication auth) {
        return ResponseEntity.ok(taskService.getUserTasks(auth.getName()));
    }

    @PostMapping
    public ResponseEntity<FeatureResponse<Task>> createTask(@RequestBody Task task, Authentication auth) {
        return ResponseEntity.ok(taskService.createTask(task, auth.getName()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id, Authentication auth) {
        taskService.deleteTask(id, auth.getName());
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<FeatureResponse<Task>> updateTaskStatus(@PathVariable Long id,
            @RequestBody java.util.Map<String, String> body,
            Authentication auth) {
        String status = body.get("status");
        if (status == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(taskService.updateTaskStatus(id, status, auth.getName()));
    }
}
