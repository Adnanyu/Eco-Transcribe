package dev.EchoTranscribe.translatedTranscripts;

import java.util.Optional;

import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;

public interface TranslatedTranscriptRepository extends CrudRepository<TranslatedTranscript, Long>, PagingAndSortingRepository<TranslatedTranscript, Long>{
    Optional<TranslatedTranscript> findByRecordingId(Long recording_id);
    Optional<TranslatedTranscript> findByTranscriptId(Long transcript_id);
}
