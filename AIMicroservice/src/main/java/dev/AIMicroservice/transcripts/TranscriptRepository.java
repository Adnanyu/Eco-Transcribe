package dev.AIMicroservice.transcripts;
import java.util.Optional;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;



public interface TranscriptRepository extends CrudRepository<Transcript, Long>, PagingAndSortingRepository<Transcript, Long>{
    
    Optional<Transcript> findByRecordingId(Long recording_id);
    
}

