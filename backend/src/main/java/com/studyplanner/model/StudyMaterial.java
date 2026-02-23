package com.studyplanner.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "study_materials")
@Data
public class StudyMaterial {
    @Id
    private String id;

    private String userId;
    private String title;
    private String subject;
    private String extractedText;
    private String fileName;
    private long fileSize;

    private LocalDateTime uploadedAt = LocalDateTime.now();
}
