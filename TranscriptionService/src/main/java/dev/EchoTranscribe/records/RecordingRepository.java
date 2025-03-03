package dev.EchoTranscribe.records;

// import org.springframework.data.domain.Page;
// import org.springframework.data.domain.PageRequest;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;

public interface RecordingRepository extends CrudRepository<Recording, Long>, PagingAndSortingRepository<Recording, Long> {

}
