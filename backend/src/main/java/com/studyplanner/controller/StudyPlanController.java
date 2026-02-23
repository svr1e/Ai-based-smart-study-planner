package com.studyplanner.controller;

import com.studyplanner.dto.DTOs;
import com.studyplanner.model.StudyPlan;
import com.studyplanner.service.StudyPlanService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/plans")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class StudyPlanController {

    private final StudyPlanService planService;

    @PostMapping("/generate")
    public ResponseEntity<?> generate(@RequestBody DTOs.GeneratePlanRequest request) {
        try {
            return ResponseEntity.ok(planService.generateAndSavePlan(request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<StudyPlan>> getUserPlans(@PathVariable String userId) {
        return ResponseEntity.ok(planService.getByUser(userId));
    }

    @GetMapping("/user/{userId}/today")
    public ResponseEntity<List<StudyPlan>> getTodayPlans(@PathVariable String userId) {
        return ResponseEntity.ok(planService.getTodayPlans(userId));
    }

    @GetMapping("/user/{userId}/stats")
    public ResponseEntity<DTOs.ProgressStats> getStats(@PathVariable String userId) {
        return ResponseEntity.ok(planService.getStats(userId));
    }

    @PatchMapping("/{id}/complete")
    public ResponseEntity<StudyPlan> markComplete(@PathVariable String id) {
        return ResponseEntity.ok(planService.markComplete(id));
    }

    @PatchMapping("/{id}/incomplete")
    public ResponseEntity<StudyPlan> markIncomplete(@PathVariable String id) {
        return ResponseEntity.ok(planService.markIncomplete(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        planService.deletePlan(id);
        return ResponseEntity.noContent().build();
    }
}
