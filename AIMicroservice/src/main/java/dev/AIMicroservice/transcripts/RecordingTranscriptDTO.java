package dev.AIMicroservice.transcripts;

import java.time.LocalDateTime;

enum RecordingType {
    RECORDED,
    UPLOADED,
    LINK
}


public class RecordingTranscriptDTO {
    private Long transcriptId;
    private Long recordingId;
    private String text;
    private String language;
    private String title;
    private RecordingType recordingType;
    private LocalDateTime recordedDate;
    private LocalDateTime recordingStartTime;
    private LocalDateTime recordingEndTime;
    private double duration;
    
    public String getText() {
        return text;
    }

    public String getTitle() {
        return title;
    }
    
    public Long getTranscriptId() {
        return transcriptId;
    }
    
    public Long getRecordingId() {
        return recordingId;
    }
    
    public String getLanguage() {
        return language;
    }
    
    public RecordingType getRecordingType() {
        return recordingType;
    }
    
    public LocalDateTime getRecordedDate() {
        return recordedDate;
    }
    
    public LocalDateTime getRecordingStartTime() {
        return recordingStartTime;
    }
    
    public LocalDateTime getRecordingEndTime() {
        return recordingEndTime;
    }
    
    public double getDuration() {
        return duration;
    }
    
}