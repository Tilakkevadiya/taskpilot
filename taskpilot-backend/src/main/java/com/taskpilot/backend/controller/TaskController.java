package com.taskpilot.backend.controller;

import com.taskpilot.backend.dto.FeatureResponse;
import com.taskpilot.backend.entity.Task;
import com.taskpilot.backend.service.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "*")
public class TaskController {

    @Autowired
    private TaskService taskService;

    @GetMapping
    public ResponseEntity<FeatureResponse<List<Task>>> getTasks() {
        String email = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(taskService.getUserTasks(email));
    }

    @PostMapping
    public ResponseEntity<FeatureResponse<Task>> createTask(@RequestBody Task task) {
        System.out.println("Incoming task payload: " + task);
        String email = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(taskService.createTask(task, email));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        String email = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        taskService.deleteTask(id, email);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<FeatureResponse<Task>> updateTask(@PathVariable Long id, @RequestBody Task task) {
        String email = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(taskService.updateTask(id, task, email));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<FeatureResponse<Task>> updateTaskStatus(@PathVariable Long id,
            @RequestBody java.util.Map<String, String> body) {
        String status = body.get("status");
        if (status == null) {
            return ResponseEntity.badRequest().build();
        }
        String email = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(taskService.updateTaskStatus(id, status, email));
    }
}
