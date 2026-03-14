package com.taskpilot.backend.repository;

import com.taskpilot.backend.entity.Meeting;
import com.taskpilot.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MeetingRepository extends JpaRepository<Meeting, Long> {
    List<Meeting> findByUser(User user);

    List<Meeting> findByUserAndMeetingTimeAfterOrderByMeetingTimeAsc(User user, LocalDateTime time);

    List<Meeting> findByReminderSentFalseAndReminderMinutesBeforeIsNotNull();
}
