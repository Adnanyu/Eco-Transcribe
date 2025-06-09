package dev.EchoTranscribe.records;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

@Table("recording")
public class Recording {

    @Id
    private Long id;
    private String recordingUrl;
    private String title;
    private RecordingType recordingType;
    // private RecordingType recordingType;
    private LocalDateTime recordedDate;
    private LocalDateTime recordingStartTime;
    private LocalDateTime recordingEndTime;
    private double duration;
    private Long transcript;
    private Long subTranscripts;
    private Long translatedTranscript;

    // Constructor
    public Recording(Long id, String recordingUrl, String title, RecordingType recordingType, LocalDateTime recordedDate,
                     LocalDateTime recordingStartTime, LocalDateTime recordingEndTime, double duration,
                     Long transcript, Long subTranscripts, Long translatedTranscript) {
        this.id = id;
        this.recordingUrl = recordingUrl;
        this.title = title;
        this.recordingType = recordingType;
        this.recordedDate = recordedDate;
        this.recordingStartTime = recordingStartTime;
        this.recordingEndTime = recordingEndTime;
        this.duration = duration;
        this.transcript = transcript;
        this.subTranscripts = subTranscripts;
        this.translatedTranscript = translatedTranscript;
    }

    public Long getId() {
        return id;
    }

    public String getRecordingUrl() {
        return recordingUrl;
    }

    public String getTitle() {
        return title;
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

    public Long getTranscript() {
        return transcript;
    }

    public Long getSubTranscripts() {
        return subTranscripts;
    }

    public Long getTranslatedTranscript() {
        return translatedTranscript;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setRecordingUrl(String recordingUrl) {
        this.recordingUrl = recordingUrl;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setRecordingType(RecordingType recordingType) {
        this.recordingType = recordingType;
    }

    public void setRecordedDate(LocalDateTime recordedDate) {
        this.recordedDate = recordedDate;
    }

    public void setRecordingStartTime(LocalDateTime recordingStartTime) {
        this.recordingStartTime = recordingStartTime;
    }

    public void setRecordingEndTime(LocalDateTime recordingEndTime) {
        this.recordingEndTime = recordingEndTime;
    }

    public void setDuration(double duration) {
        this.duration = duration;
    }

    public void setTranscript(Long transcript) {
        this.transcript = transcript;
    }

    public void setSubTranscripts(Long subTranscripts) {
        this.subTranscripts = subTranscripts;
    }

    public void setTranslatedTranscript(Long translatedTranscript) {
        this.translatedTranscript = translatedTranscript;
    }

    
}



















// package dev.EchoTranscribe.records;

// import java.time.LocalDateTime;

// import org.springframework.data.annotation.Id;
// import org.springframework.data.relational.core.mapping.Table;

// @Table("RECORDING")
// public record Recording(@Id Long id,
//         String recordingUrl,
//         String title,
//         RecordingType recordingType ,
//         LocalDateTime recordedDate,
//         LocalDateTime recordingStartTime,
//         LocalDateTime recordingEndTime,
//         double duration,
//         Long transcript,
//         Long subTranscripts,
//         Long translatedTranscript 
              
// ) {
//         public Recording withRecordingUrl(String recordingUrl, LocalDateTime recordedDate, String title,
//                         RecordingType recordingType, Long transcript, double duration) {
//                 return new Recording(id(), recordingUrl, title, recordingType, recordedDate, recordingStartTime(),
//                                 recordingEndTime(), duration(), transcript, subTranscripts(), translatedTranscript());
//         }

//         public Recording withTranscriptId(Long transcriptId) {
//                 return new Recording(id(), recordingUrl(), title(), recordingType(), recordedDate(),
//                                 recordingStartTime(), recordingEndTime(), duration(), transcriptId, subTranscripts(),
//                                 translatedTranscript());
//         }
//         public Recording withoutTranscriptId() {
//                 return new Recording(id(), recordingUrl(), title(), recordingType(), recordedDate(),
//                                 recordingStartTime(), recordingEndTime(), duration(), null, subTranscripts(),
//                                 translatedTranscript());
//         }
        
//         // public Recording withRecordingTitle(String recordingUrl, LocalDateTime recordedDate) {
//         //         return new Recording(id(), recordingUrl, title(), recordingType(), recordedDate, recordingStartTime(),
//         //                         recordingEndTime(), transcript(), subTranscripts(), translatedTranscript());
//         // }
// }
