package dev.EchoTranscribe.segments;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

public interface SubTranscriptRepository extends MongoRepository<SubTranscript, Long> {
    Optional<SubTranscript> findByRecordingId(Long recordingId);
}
