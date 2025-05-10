package dev.AIMicroservice.transcripts;

import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

@EntityScan
@Table(name = "TRANSCRIPT")
public class Transcript {

    @Id
    private Long transcriptId;

    private Long recordingId;

    private String text;

    private Long summary;

    private String language;

    public Transcript() {}

    public Transcript(Long transcriptId, Long recordingId, String text, Long summary, String language) {
        this.transcriptId = transcriptId;
        this.recordingId = recordingId;
        this.text = text;
        this.summary = summary;
        this.language = language;
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

    public Long getSummary() {
        return summary;
    }

    public void setSummary(Long summary) {
        this.summary = summary;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

}


// @Table("TRANSCRIPT")
// public record Transcript(@Id Long transcript_id,
//         Long recordingId,
//         String text,
//         String summary,
//         String language) {

//     public Transcript withrecording_id(Long transcript_id, Long recording_id) {
//         return new Transcript(transcript_id, recording_id, text(), summary(), language());
//     }
// }

// CREATE TABLE
//     IF NOT EXISTS transcripts (
//         transcript_id INT NOT NULL,
//         recording_id INT NOT NULL,
//         text TEXT,
//         summery TEXT,
//         language VARCHAR,
//         PRIMARY KEY (transcript_id),
//         FOREIGN KEY (recording_id) REFERENCES recording(id)
//     );
