package com.studyplanner.model;

import lombok.Data;
import java.util.List;

@Data
public class QnA {
    private String question;
    private List<String> options;
    private String correctAnswer;
    private String userAnswer;
}
