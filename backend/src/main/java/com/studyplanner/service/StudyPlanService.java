package com.studyplanner.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.studyplanner.dto.DTOs;
import com.studyplanner.model.StudyPlan;
import com.studyplanner.model.User;
import com.studyplanner.repository.StudyPlanRepository;
import com.studyplanner.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class StudyPlanService {

    private final StudyPlanRepository planRepository;
    private final UserRepository userRepository;
    private final GeminiService geminiService;
    private final JavaMailSender mailSender;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public List<StudyPlan> generateAndSavePlan(DTOs.GeneratePlanRequest req) {
        String json = geminiService.generateStudySchedule(
            req.getSubject(), req.getTopics(), req.getExamDate(), req.getDailyHours()
        );

        // Extract only the JSON array between [ and ]
        String cleanJson = json.replaceAll("```json", "").replaceAll("```", "").trim();
        int startIndex = cleanJson.indexOf('[');
        int endIndex = cleanJson.lastIndexOf(']');
        if (startIndex != -1 && endIndex != -1 && endIndex > startIndex) {
            cleanJson = cleanJson.substring(startIndex, endIndex + 1);
        }

        List<Map<String, Object>> sessions;
        try {
            sessions = objectMapper.readValue(cleanJson, new TypeReference<>() {});
        } catch (Exception e) {
            log.error("Failed to parse Gemini response: {}\nCleaned JSON: {}", json, cleanJson);
            throw new RuntimeException("Failed to parse AI-generated schedule. Please try again.");
        }

        List<StudyPlan> plans = sessions.stream().map(s -> {
            StudyPlan plan = new StudyPlan();
            plan.setUserId(req.getUserId());
            plan.setSubject(req.getSubject());
            plan.setTopic(String.valueOf(s.get("topic")));
            plan.setDate(LocalDate.parse(String.valueOf(s.get("date"))));
            plan.setDurationMinutes(s.get("durationMinutes") instanceof Integer
                ? (Integer) s.get("durationMinutes") : 60);
            plan.setNotes(s.get("notes") != null ? String.valueOf(s.get("notes")) : "");
            return plan;
        }).collect(Collectors.toList());

        return planRepository.saveAll(plans);
    }

    public List<StudyPlan> getByUser(String userId) {
        return planRepository.findByUserIdOrderByDateAsc(userId);
    }

    public List<StudyPlan> getTodayPlans(String userId) {
        return planRepository.findByUserIdAndDate(userId, LocalDate.now());
    }

    public StudyPlan markComplete(String planId) {
        StudyPlan plan = planRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Plan not found"));
        plan.setCompleted(true);
        return planRepository.save(plan);
    }

    public StudyPlan markIncomplete(String planId) {
        StudyPlan plan = planRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Plan not found"));
        plan.setCompleted(false);
        return planRepository.save(plan);
    }

    public void deletePlan(String planId) {
        planRepository.deleteById(planId);
    }

    public DTOs.ProgressStats getStats(String userId) {
        DTOs.ProgressStats stats = new DTOs.ProgressStats();
        stats.setTotalPlans(planRepository.countByUserIdAndCompleted(userId, false)
            + planRepository.countByUserIdAndCompleted(userId, true));
        stats.setCompletedPlans(planRepository.countByUserIdAndCompleted(userId, true));
        return stats;
    }

    // Runs every day at 8:00 AM
    @Scheduled(cron = "0 0 8 * * *")
    public void sendDailyReminders() {
        log.info("Running daily study reminders...");
        LocalDate today = LocalDate.now();
        List<StudyPlan> todaysPlans = planRepository.findByDate(today);

        // Group by userId
        Map<String, List<StudyPlan>> byUser = todaysPlans.stream()
            .collect(Collectors.groupingBy(StudyPlan::getUserId));

        byUser.forEach((userId, plans) -> {
            userRepository.findById(userId).ifPresent(user -> {
                try {
                    sendReminderEmail(user, plans);
                } catch (Exception e) {
                    log.error("Failed to send reminder to {}: {}", user.getEmail(), e.getMessage());
                }
            });
        });
    }

    private void sendReminderEmail(User user, List<StudyPlan> plans) {
        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setTo(user.getEmail());
        msg.setSubject("📚 Your Study Plan for Today - " + LocalDate.now());

        StringBuilder body = new StringBuilder();
        body.append("Hi ").append(user.getName()).append("!\n\n");
        body.append("Here are your study sessions for today:\n\n");

        plans.forEach(p -> body.append("• ")
            .append(p.getTopic())
            .append(" (").append(p.getDurationMinutes()).append(" mins)")
            .append("\n"));

        body.append("\nTotal study time: ")
            .append(plans.stream().mapToInt(StudyPlan::getDurationMinutes).sum())
            .append(" minutes\n\n");
        body.append("Good luck with your studies! 🎯\n");
        body.append("- Your AI Study Planner");

        msg.setText(body.toString());
        mailSender.send(msg);
        log.info("Reminder sent to {}", user.getEmail());
    }
}
