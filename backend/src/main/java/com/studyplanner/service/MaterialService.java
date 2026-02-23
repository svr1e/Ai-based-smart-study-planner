package com.studyplanner.service;

import com.studyplanner.model.StudyMaterial;
import com.studyplanner.repository.StudyMaterialRepository;
import lombok.RequiredArgsConstructor;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.pdfbox.pdfparser.PDFParser;
import org.apache.pdfbox.io.RandomAccessReadBuffer;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MaterialService {

    private final StudyMaterialRepository materialRepository;
    private final GeminiService geminiService;

    public StudyMaterial uploadAndExtract(MultipartFile file, String userId, String subject) throws IOException {
        String extractedText = extractText(file);

        StudyMaterial material = new StudyMaterial();
        material.setUserId(userId);
        material.setTitle(file.getOriginalFilename());
        material.setFileName(file.getOriginalFilename());
        material.setSubject(subject);
        material.setExtractedText(extractedText);
        material.setFileSize(file.getSize());

        return materialRepository.save(material);
    }

    private String extractText(MultipartFile file) throws IOException {
        String filename = file.getOriginalFilename() != null ? file.getOriginalFilename().toLowerCase() : "";

        if (filename.endsWith(".pdf")) {
            byte[] bytes = file.getBytes();
            RandomAccessReadBuffer buffer = new RandomAccessReadBuffer(bytes);
            PDFParser parser = new PDFParser(buffer);
            try (PDDocument doc = parser.parse()) {
                PDFTextStripper stripper = new PDFTextStripper();
                return stripper.getText(doc);
            }
        } else if (filename.endsWith(".txt") || filename.endsWith(".md")) {
            return new String(file.getBytes());
        } else {
            // Try as plain text for other formats
            return new String(file.getBytes());
        }
    }

    public List<StudyMaterial> getByUser(String userId) {
        return materialRepository.findByUserId(userId);
    }

    public StudyMaterial getById(String id) {
        return materialRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Material not found"));
    }

    public String generateQuiz(String materialId, int numQuestions) {
        StudyMaterial material = getById(materialId);
        return geminiService.generateQuiz(material.getExtractedText(), numQuestions);
    }

    public String askQuestion(String materialId, String question) {
        StudyMaterial material = getById(materialId);
        return geminiService.askQuestion(material.getExtractedText(), question);
    }

    public String summarize(String materialId) {
        StudyMaterial material = getById(materialId);
        return geminiService.summarizeMaterial(material.getExtractedText());
    }

    public void delete(String id) {
        materialRepository.deleteById(id);
    }
}
