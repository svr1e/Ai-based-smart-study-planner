package com.studyplanner.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;

@Service
public class GeminiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    private final WebClient webClient = WebClient.builder()
            .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(10 * 1024 * 1024))
            .build();

    public String callGemini(String prompt) {
        Map<String, Object> body = Map.of(
            "contents", List.of(Map.of(
                "parts", List.of(Map.of("text", prompt))
            )),
            "generationConfig", Map.of(
                "temperature", 0.7,
                "maxOutputTokens", 4096
            )
        );

        try {
            Map response = webClient.post()
                .uri(apiUrl + "?key=" + apiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(body)
                .retrieve()
                .bodyToMono(Map.class)
                .block();

            var candidates = (List<?>) response.get("candidates");
            var content = (Map<?, ?>) ((Map<?, ?>) candidates.get(0)).get("content");
            var parts = (List<?>) content.get("parts");
            return (String) ((Map<?, ?>) parts.get(0)).get("text");
        } catch (Exception e) {
            throw new RuntimeException("Gemini API call failed: " + e.getMessage(), e);
        }
    }

    public String generateQuiz(String materialText, int numQuestions) {
        String truncated = materialText.length() > 8000
            ? materialText.substring(0, 8000) : materialText;

        String prompt = String.format("""
            Based on the following study material, generate exactly %d multiple choice questions.
            Return ONLY a valid JSON array, no markdown, no explanation:
            [
              {
                "question": "...",
                "options": ["A. option1", "B. option2", "C. option3", "D. option4"],
                "correctAnswer": "A. option1"
              }
            ]
            
            Study Material:
            %s
            """, numQuestions, truncated);

        return callGemini(prompt);
    }

    public String generateStudySchedule(String subject, String topics, String examDate, int dailyHours) {
        String prompt = String.format("""
            Create a detailed day-by-day study schedule.
            Subject: %s
            Topics to cover: %s
            Exam Date: %s
            Available study hours per day: %d
            
            Return ONLY a valid JSON array, no markdown:
            [
              {
                "date": "YYYY-MM-DD",
                "topic": "...",
                "durationMinutes": 60,
                "notes": "Focus on..."
              }
            ]
            Start from today and go up to 2 days before the exam date.
            """, subject, topics, examDate, dailyHours);

        return callGemini(prompt);
    }

    public String askQuestion(String materialText, String userQuestion) {
        String truncated = materialText.length() > 8000
            ? materialText.substring(0, 8000) : materialText;

        String prompt = String.format("""
            You are a helpful study assistant. Based on the study material below, 
            answer the student's question clearly and concisely. If the answer is not 
            in the material, say so and provide general knowledge if applicable.
            
            Study Material:
            %s
            
            Student's Question: %s
            
            Answer:
            """, truncated, userQuestion);

        return callGemini(prompt);
    }

    public String summarizeMaterial(String materialText) {
        String truncated = materialText.length() > 8000
            ? materialText.substring(0, 8000) : materialText;

        String prompt = String.format("""
            Summarize the following study material into key points and main concepts.
            Format as a clear, structured summary with bullet points.
            
            Material:
            %s
            """, truncated);

        return callGemini(prompt);
    }
}
