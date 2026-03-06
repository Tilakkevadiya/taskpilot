package com.taskpilot.backend.repository;

import com.taskpilot.backend.entity.User;
import com.taskpilot.backend.entity.UserDailyUsage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface UserDailyUsageRepository extends JpaRepository<UserDailyUsage, Long> {

    Optional<UserDailyUsage> findByUserAndUsageDate(User user, LocalDate usageDate);

    @Modifying
    @Query("DELETE FROM UserDailyUsage u WHERE u.usageDate < :date")
    void deleteByUsageDateBefore(LocalDate date);
}
