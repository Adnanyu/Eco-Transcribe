package dev.EchoTranscribe.records;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

@Table("RECORDING")
public record Recording(@Id Long id,
        String recordingUrl,
        String title,
        RecordingType recordingType ,
        LocalDateTime recordedDate,
        LocalDateTime recordingStartTime,
        LocalDateTime recordingEndTime,
        double duration,
        Long transcript,
        Long subTranscripts,
        Long translatedTranscript 
              
) {
        public Recording withRecordingUrl(String recordingUrl, LocalDateTime recordedDate, String title,
                        RecordingType recordingType, Long transcript, double duration) {
                return new Recording(id(), recordingUrl, title, recordingType, recordedDate, recordingStartTime(),
                                recordingEndTime(), duration(), transcript, subTranscripts(), translatedTranscript());
        }

        public Recording withTranscriptId(Long transcriptId) {
                return new Recording(id(), recordingUrl(), title(), recordingType(), recordedDate(),
                                recordingStartTime(), recordingEndTime(), duration(), transcriptId, subTranscripts(),
                                translatedTranscript());
        }
        
        // public Recording withRecordingTitle(String recordingUrl, LocalDateTime recordedDate) {
        //         return new Recording(id(), recordingUrl, title(), recordingType(), recordedDate, recordingStartTime(),
        //                         recordingEndTime(), transcript(), subTranscripts(), translatedTranscript());
        // }
}
