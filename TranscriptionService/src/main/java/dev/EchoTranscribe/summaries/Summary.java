package dev.EchoTranscribe.summaries;

import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

@EntityScan
@Table(name = "SUMMARY")
public class Summary {
    
    @Id
    private Long summaryId;

    private Long recordingId;

    private String text;

    private String langauge;

    public Summary() {}
    
    public Summary(Long summaryId, Long recordingId, String text, String langauge) {
        this.summaryId = summaryId;
        this.recordingId = recordingId;
        this.text = text;
        this.langauge = langauge;
    }

    public Long getSummaryId() {
        return summaryId;
    }

    public void setSummaryId(Long summaryId) {
        this.summaryId = summaryId;
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

    public String getLanguage() {
        return langauge;
    }

    public void setLanguage(String langauge) {
        this.langauge = langauge;
    }



}
