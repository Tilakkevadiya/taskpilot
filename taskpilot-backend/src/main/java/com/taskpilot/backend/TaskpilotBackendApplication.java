package com.taskpilot.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import com.taskpilot.backend.entity.User;
import com.taskpilot.backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.jdbc.core.JdbcTemplate;

import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class TaskpilotBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(TaskpilotBackendApplication.class, args);
	}

	@Bean
	CommandLineRunner initTestAccounts(UserRepository userRepository, PasswordEncoder passwordEncoder, JdbcTemplate jdbcTemplate) {
		return args -> {
			try {
				jdbcTemplate.execute("ALTER TABLE users DROP CONSTRAINT IF EXISTS users_subscription_status_check;");
				jdbcTemplate.execute("ALTER TABLE users DROP CONSTRAINT IF EXISTS users_plan_type_check;");
				System.out.println("Dropped old DB check constraints successfully.");
			} catch (Exception e) {
				System.out.println("Could not drop check constraints: " + e.getMessage());
			}

			if (userRepository.findByEmail("free@test.com").isEmpty()) {
				User freeUser = new User();
				freeUser.setUsername("Free Test User");
				freeUser.setEmail("free@test.com");
				freeUser.setPasswordHash(passwordEncoder.encode("password123"));
				freeUser.setPlanType(User.PlanType.FREE);
				freeUser.setEmailVerified(true);
				userRepository.save(freeUser);
				System.out.println("Created test account: free@test.com / password123");
			}

			if (userRepository.findByEmail("premium@test.com").isEmpty()) {
				User premiumUser = new User();
				premiumUser.setUsername("Premium Test User");
				premiumUser.setEmail("premium@test.com");
				premiumUser.setPasswordHash(passwordEncoder.encode("password123"));
				premiumUser.setPlanType(User.PlanType.PREMIUM);
				premiumUser.setSubscriptionStatus(User.SubscriptionStatus.ACTIVE);
				premiumUser.setEmailVerified(true);
				userRepository.save(premiumUser);
				System.out.println("Created test account: premium@test.com / password123");
			}

			userRepository.findByEmail("tilakkevadiya11908@gmail.com").ifPresent(user -> {
				user.setPlanType(User.PlanType.PREMIUM);
				user.setSubscriptionStatus(User.SubscriptionStatus.ACTIVE);
				userRepository.save(user);
				System.out.println("Upgraded tilakkevadiya11908@gmail.com to PREMIUM.");
			});
		};
	}
}
