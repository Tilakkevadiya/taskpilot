package com.taskpilot.backend.repository;

import com.taskpilot.backend.entity.CommandHistory;
import com.taskpilot.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommandHistoryRepository extends JpaRepository<CommandHistory, Long> {
    List<CommandHistory> findByUserOrderByCreatedAtDesc(User user);
}
