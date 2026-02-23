package com.studyplanner.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Document(collection = "study_plans")
@Data
public class StudyPlan {
    @Id
    private String id;

    private String userId;
    private String subject;
    private String topic;
    private LocalDate date;
    private int durationMinutes;
    private boolean completed = false;
    private String notes;

    private LocalDateTime createdAt = LocalDateTime.now();
}
