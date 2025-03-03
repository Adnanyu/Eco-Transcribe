package dev.EchoTranscribe.records;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;

public record Recording(@Id Long id,
        String recordingUrl,
        String title,
        RecordingType recordingType ,
        LocalDateTime recordedDate,
        LocalDateTime recordingStartTime,
        LocalDateTime recordingEndTime,
        Long transcript,
        Long subTranscripts,
        Long translatedTranscript 
              
) {
        public Recording withRecordingUrl(String recordingUrl, LocalDateTime recordedDate, String title,
                        RecordingType recordingType, Long transcript) {
                return new Recording(id(), recordingUrl, title, recordingType, recordedDate, recordingStartTime(),
                                recordingEndTime(), transcript, subTranscripts(), translatedTranscript());
        }
        
        // public Recording withRecordingTitle(String recordingUrl, LocalDateTime recordedDate) {
        //         return new Recording(id(), recordingUrl, title(), recordingType(), recordedDate, recordingStartTime(),
        //                         recordingEndTime(), transcript(), subTranscripts(), translatedTranscript());
        // }
}
