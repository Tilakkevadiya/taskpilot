package com.taskpilot.backend.service;

import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.gmail.Gmail;
import com.google.api.services.gmail.model.Message;
import com.google.auth.http.HttpCredentialsAdapter;
import com.google.auth.oauth2.AccessToken;
import com.google.auth.oauth2.UserCredentials;
import com.taskpilot.backend.entity.User;
import com.taskpilot.backend.repository.UserRepository;
import jakarta.mail.Session;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeBodyPart;
import jakarta.mail.internet.MimeMessage;
import jakarta.mail.internet.MimeMultipart;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Base64;
import java.util.Date;
import java.util.Properties;

@Service
@RequiredArgsConstructor
public class UserEmailService {

    private final UserRepository userRepository;

    @Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String clientId;

    @Value("${spring.security.oauth2.client.registration.google.client-secret}")
    private String clientSecret;

    private static final String APPLICATION_NAME = "TaskPilot AI";

    private UserCredentials getCredentials(User user) throws IOException {
        if (user.getGoogleTokenExpiry() == null || 
            user.getGoogleTokenExpiry().isBefore(LocalDateTime.now().plusMinutes(5))) {
            refreshUserToken(user);
        }

        return UserCredentials.newBuilder()
                .setClientId(clientId)
                .setClientSecret(clientSecret)
                .setRefreshToken(user.getGoogleRefreshToken())
                .setAccessToken(new AccessToken(user.getGoogleAccessToken(), 
                        Date.from(user.getGoogleTokenExpiry().atZone(ZoneId.systemDefault()).toInstant())))
                .build();
    }

    private void refreshUserToken(User user) throws IOException {
        UserCredentials credentials = UserCredentials.newBuilder()
                .setClientId(clientId)
                .setClientSecret(clientSecret)
                .setRefreshToken(user.getGoogleRefreshToken())
                .build();

        AccessToken token = credentials.refreshAccessToken();
        user.setGoogleAccessToken(token.getTokenValue());
        if (token.getExpirationTime() != null) {
            user.setGoogleTokenExpiry(LocalDateTime.ofInstant(token.getExpirationTime().toInstant(), ZoneId.systemDefault()));
        } else {
            user.setGoogleTokenExpiry(LocalDateTime.now().plusHours(1));
        }
        userRepository.save(user);
    }

    public void sendEmail(User user, String to, String subject, String body) throws Exception {
        UserCredentials credentials = getCredentials(user);
        Gmail service = new Gmail.Builder(GoogleNetHttpTransport.newTrustedTransport(), GsonFactory.getDefaultInstance(), new HttpCredentialsAdapter(credentials))
                .setApplicationName(APPLICATION_NAME)
                .build();

        MimeMessage mimeMessage = createEmail(to, user.getEmail(), subject, body);
        Message message = createMessageWithEmail(mimeMessage);
        service.users().messages().send("me", message).execute();
    }

    private MimeMessage createEmail(String to, String from, String subject, String bodyText) throws Exception {
        Properties props = new Properties();
        Session session = Session.getDefaultInstance(props, null);
        MimeMessage email = new MimeMessage(session);

        email.setFrom(new InternetAddress(from));
        email.addRecipient(jakarta.mail.Message.RecipientType.TO, new InternetAddress(to));
        email.setSubject(subject);

        MimeMultipart multipart = new MimeMultipart();
        MimeBodyPart mimeBodyPart = new MimeBodyPart();
        mimeBodyPart.setContent(bodyText, "text/html; charset=utf-8");
        multipart.addBodyPart(mimeBodyPart);

        email.setContent(multipart);
        return email;
    }

    private Message createMessageWithEmail(MimeMessage emailContent) throws Exception {
        ByteArrayOutputStream buffer = new ByteArrayOutputStream();
        emailContent.writeTo(buffer);
        byte[] bytes = buffer.toByteArray();
        String encodedEmail = Base64.getEncoder().encodeToString(bytes);
        Message message = new Message();
        message.setRaw(encodedEmail);
        return message;
    }
}
