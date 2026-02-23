package com.studyplanner.controller;

import com.studyplanner.dto.DTOs;
import com.studyplanner.model.StudyMaterial;
import com.studyplanner.service.MaterialService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/materials")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class MaterialController {

    private final MaterialService materialService;

    @PostMapping("/upload")
    public ResponseEntity<?> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam String userId,
            @RequestParam String subject) {
        try {
            return ResponseEntity.ok(materialService.uploadAndExtract(file, userId, subject));
        } catch (IOException e) {
            return ResponseEntity.badRequest().body("Failed to process file: " + e.getMessage());
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<StudyMaterial>> getByUser(@PathVariable String userId) {
        return ResponseEntity.ok(materialService.getByUser(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<StudyMaterial> getById(@PathVariable String id) {
        return ResponseEntity.ok(materialService.getById(id));
    }

    @PostMapping("/{id}/quiz")
    public ResponseEntity<?> generateQuiz(
            @PathVariable String id,
            @RequestParam(defaultValue = "5") int numQuestions) {
        try {
            return ResponseEntity.ok(Map.of("quiz", materialService.generateQuiz(id, numQuestions)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{id}/ask")
    public ResponseEntity<?> askQuestion(
            @PathVariable String id,
            @RequestBody DTOs.AskQuestionRequest request) {
        try {
            String answer = materialService.askQuestion(id, request.getQuestion());
            return ResponseEntity.ok(Map.of("answer", answer));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{id}/summarize")
    public ResponseEntity<?> summarize(@PathVariable String id) {
        try {
            String summary = materialService.summarize(id);
            return ResponseEntity.ok(Map.of("summary", summary));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        materialService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
