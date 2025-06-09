package dev.AIMicroservice.transcripts;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jdbc.repository.query.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;



public interface TranscriptRepository extends CrudRepository<Transcript, Long>, PagingAndSortingRepository<Transcript, Long>{
    Optional<Transcript> findByRecordingId(Long recording_id);

    @Query("""
            SELECT t.transcript_id , t.text, t.language, r.title, r.recording_type,
               r.recorded_date , r.recording_start_time, 
               r.recording_end_time, r.duration
            FROM recording r
            JOIN transcript t ON r.transcript = t.transcript_id
            """)
    List<RecordingTranscriptDTO> findTranscriptWithRecordingData();
    
}
// private Long transcriptId;
//     private Long recordingId;
//     private String text;
//     private String language;
//     private String title;
//     private RecordingType recordingType;
//     private LocalDateTime recordedDate;
//     private LocalDateTime recordingStartTime;
//     private LocalDateTime recordingEndTime;
//     private double duration; 
