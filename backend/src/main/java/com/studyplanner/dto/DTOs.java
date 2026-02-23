package com.studyplanner.dto;

import lombok.Data;

public class DTOs {

    @Data
    public static class RegisterRequest {
        private String name;
        private String email;
        private String password;
    }

    @Data
    public static class LoginRequest {
        private String email;
        private String password;
    }

    @Data
    public static class AuthResponse {
        private String token;
        private String userId;
        private String name;
        private String email;

        public AuthResponse(String token, String userId, String name, String email) {
            this.token = token;
            this.userId = userId;
            this.name = name;
            this.email = email;
        }
    }

    @Data
    public static class GeneratePlanRequest {
        private String userId;
        private String subject;
        private String topics;
        private String examDate;
        private int dailyHours;
        private String userEmail;
    }

    @Data
    public static class AskQuestionRequest {
        private String question;
    }

    @Data
    public static class QuizSubmitRequest {
        private String userId;
        private String materialId;
        private String subject;
        private java.util.List<com.studyplanner.model.QnA> answers;
    }

    @Data
    public static class ProgressStats {
        private long totalPlans;
        private long completedPlans;
        private long totalQuizzes;
        private double averageScore;
        private long totalMaterials;
    }
}
