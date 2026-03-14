package com.taskpilot.backend.service;

import com.taskpilot.backend.entity.Meeting;
import com.taskpilot.backend.entity.Task;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class SystemEmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Async
    public void sendEmail(String to, String subject, String htmlBody) {
        try {
            jakarta.mail.internet.MimeMessage message = mailSender.createMimeMessage();
            org.springframework.mail.javamail.MimeMessageHelper helper = new org.springframework.mail.javamail.MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom("TaskPilot <" + fromEmail + ">");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);

            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send system email to " + to + ": " + e.getMessage());
        }
    }

    @Async
    public void sendTaskReminder(String email, String username, Task task) {
        String subject = "🔔 Task Reminder: " + task.getTitle();
        String htmlBody = "<h3>Hello " + username + ",</h3>" +
                "<p>Reminder for your task: <strong>" + task.getTitle() + "</strong></p>" +
                "<p>Due: " + task.getDueTime() + "</p>";
        sendEmail(email, subject, htmlBody);
    }

    @Async
    public void sendMeetingReminder(String email, String username, Meeting meeting) {
        String subject = "🗓️ Meeting Reminder: " + meeting.getTitle();
        String htmlBody = "<h3>Hello " + username + ",</h3>" +
                "<p>Upcoming meeting: <strong>" + meeting.getTitle() + "</strong></p>" +
                "<p>Time: " + meeting.getMeetingTime() + "</p>";
        sendEmail(email, subject, htmlBody);
    }
}
