package dev.EchoTranscribe.summaries;

import java.util.Optional;

import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;

public interface SummaryRepository extends CrudRepository<Summary, Long>, PagingAndSortingRepository<Summary, Long>{
    Optional<Summary> findByRecordingId(Long recording_id);
}
