package dev.EchoTranscribe.translatedTranscripts;

import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

@EntityScan
@Table(name = "translated_transcript")
public class TranslatedTranscript {
    
    @Id
    private Long translatedTranscriptId;

    private Long transcriptId;

    private Long recordingId;

    private String text;

    // private Long summary;

    private String language;

    public TranslatedTranscript() {}

    public TranslatedTranscript(Long translatedTranscriptId, Long transcriptId, Long recordingId, String text, String language) {
        this.translatedTranscriptId = translatedTranscriptId;
        this.transcriptId = transcriptId;
        this.recordingId = recordingId;
        this.text = text;
        // this.summary = summary;
        this.language = language;
    }

    public Long getTranslatedTranscriptId() {
        return translatedTranscriptId;
    }

    public void setTranslatedTranscriptId(Long translatedTranscriptId) {
        this.translatedTranscriptId = translatedTranscriptId;
    }

    public Long getTranscriptId() {
        return transcriptId;
    }

    public void setTranscriptId(Long transcriptId) {
        this.transcriptId = transcriptId;
    }

    public Long getRecordingId() {
        return recordingId;
    }

    public void setRecordingId(Long recordingId) {
        this.recordingId = recordingId;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    // public Long getSummary() {
    //     return summary;
    // }

    // public void setSummary(Long summary) {
    //     this.summary = summary;
    // }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }
}
