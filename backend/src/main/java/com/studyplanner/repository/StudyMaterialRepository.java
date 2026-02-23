package com.studyplanner.repository;

import com.studyplanner.model.StudyMaterial;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface StudyMaterialRepository extends MongoRepository<StudyMaterial, String> {
    List<StudyMaterial> findByUserId(String userId);
    List<StudyMaterial> findByUserIdAndSubject(String userId, String subject);
}
