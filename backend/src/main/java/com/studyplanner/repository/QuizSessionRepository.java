package com.studyplanner.repository;

import com.studyplanner.model.QuizSession;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface QuizSessionRepository extends MongoRepository<QuizSession, String> {
    List<QuizSession> findByUserId(String userId);
    List<QuizSession> findByUserIdOrderByTakenAtDesc(String userId);
}
