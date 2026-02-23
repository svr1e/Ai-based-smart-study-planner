package com.studyplanner.repository;

import com.studyplanner.model.StudyPlan;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDate;
import java.util.List;

public interface StudyPlanRepository extends MongoRepository<StudyPlan, String> {
    List<StudyPlan> findByUserId(String userId);
    List<StudyPlan> findByUserIdAndDate(String userId, LocalDate date);
    List<StudyPlan> findByDate(LocalDate date);
    List<StudyPlan> findByUserIdOrderByDateAsc(String userId);
    long countByUserIdAndCompleted(String userId, boolean completed);
}
