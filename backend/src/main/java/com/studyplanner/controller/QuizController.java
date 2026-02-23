package com.studyplanner.controller;

import com.studyplanner.dto.DTOs;
import com.studyplanner.model.QnA;
import com.studyplanner.model.QuizSession;
import com.studyplanner.service.QuizService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/quiz")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class QuizController {

    private final QuizService quizService;

    @GetMapping("/generate/{materialId}")
    public ResponseEntity<?> generateQuiz(
            @PathVariable String materialId,
            @RequestParam(defaultValue = "5") int numQuestions) {
        try {
            List<QnA> questions = quizService.generateQuiz(materialId, numQuestions);
            return ResponseEntity.ok(questions);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/submit")
    public ResponseEntity<?> submitQuiz(@RequestBody DTOs.QuizSubmitRequest request) {
        try {
            return ResponseEntity.ok(quizService.submitQuiz(request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<QuizSession>> getUserQuizzes(@PathVariable String userId) {
        return ResponseEntity.ok(quizService.getByUser(userId));
    }
}
