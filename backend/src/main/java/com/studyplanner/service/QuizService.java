package com.studyplanner.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.studyplanner.dto.DTOs;
import com.studyplanner.model.QnA;
import com.studyplanner.model.QuizSession;
import com.studyplanner.repository.QuizSessionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class QuizService {

    private final QuizSessionRepository quizRepository;
    private final MaterialService materialService;
    private final GeminiService geminiService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public List<QnA> generateQuiz(String materialId, int numQuestions) {
        String json = materialService.generateQuiz(materialId, numQuestions);
        String cleanJson = json.replaceAll("```json", "").replaceAll("```", "").trim();
        int startIndex = cleanJson.indexOf('[');
        int endIndex = cleanJson.lastIndexOf(']');
        if (startIndex != -1 && endIndex != -1 && endIndex > startIndex) {
            cleanJson = cleanJson.substring(startIndex, endIndex + 1);
        }

        try {
            return objectMapper.readValue(cleanJson, new TypeReference<>() {});
        } catch (Exception e) {
            log.error("Failed to parse quiz JSON: {}\nCleaned JSON: {}", json, cleanJson);
            throw new RuntimeException("Failed to generate quiz. Please try again.");
        }
    }

    public QuizSession submitQuiz(DTOs.QuizSubmitRequest req) {
        List<QnA> answers = req.getAnswers();
        int correct = (int) answers.stream()
            .filter(q -> q.getCorrectAnswer() != null
                && q.getCorrectAnswer().equals(q.getUserAnswer()))
            .count();

        QuizSession session = new QuizSession();
        session.setUserId(req.getUserId());
        session.setMaterialId(req.getMaterialId());
        session.setSubject(req.getSubject());
        session.setQuestions(answers);
        session.setScore(correct);
        session.setTotalQuestions(answers.size());

        return quizRepository.save(session);
    }

    public List<QuizSession> getByUser(String userId) {
        return quizRepository.findByUserIdOrderByTakenAtDesc(userId);
    }
}
