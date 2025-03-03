package dev.EchoTranscribe.transcripts;

import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;


public interface TranscriptRepository extends CrudRepository<Transcript, Long>, PagingAndSortingRepository<Transcript, Long>{

}





// interface RecordingRepository extends CrudRepository<Recording, Long>, PagingAndSortingRepository<Recording, Long> {
//     // Page<Recording> findAll(PageRequest pageRequest);
// }
