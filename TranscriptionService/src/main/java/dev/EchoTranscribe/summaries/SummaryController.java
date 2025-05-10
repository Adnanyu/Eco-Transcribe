package dev.EchoTranscribe.summaries;

import java.net.URI;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import dev.EchoTranscribe.transcripts.Transcript;
import dev.EchoTranscribe.transcripts.TranscriptRepository;

@RestController
@RequestMapping("/api/summary")
public class SummaryController {
    private final SummaryRepository summaryRepository;
    private final TranscriptRepository transcriptRepository;

    @Autowired
    private RestTemplate restTemplate;

    public SummaryController(SummaryRepository summaryRepository, TranscriptRepository transcriptRepository) {
        this.summaryRepository = summaryRepository;
        this.transcriptRepository = transcriptRepository;
    }

    @GetMapping()
    private ResponseEntity<List<Summary>> findAllSummaries(Pageable pageable) {
        Page<Summary> page = summaryRepository.findAll(PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(),
                pageable.getSortOr(Sort.by(Sort.Direction.ASC, "summaryId"))));
        return ResponseEntity.ok(page.getContent());
    }

    @GetMapping("/{recording_id}")
    private ResponseEntity<Summary> findSummary(@PathVariable Long recording_id) {
        Optional<Summary> foundSummary = summaryRepository.findByRecordingId(recording_id);
        if (!foundSummary.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(foundSummary.get());
    }

    @PostMapping("/{recording_id}")
    private ResponseEntity<String> createSummary(@PathVariable Long recording_id, UriComponentsBuilder ucb) {
        Optional<Transcript> foundTranscript = transcriptRepository.findByRecordingId(recording_id);

        if (!foundTranscript.isPresent()) {
            return ResponseEntity.status(404).body("No Transcript found to be Summaried.");
        }

        Optional<Summary> foundSummary = summaryRepository.findByRecordingId(recording_id);
        if (foundSummary.isPresent()) {
            return ResponseEntity.status(409).body("The Transcript already has a Summary");
        }

        try {
            // RestTemplate restTemplate = new RestTemplate();
            String url = "http://AIMicroservice/api/ai/summary/" + foundTranscript.get().getRecordingId();
            String response = restTemplate.getForObject(url, String.class);
            Summary newSummary = new Summary(null, recording_id, response, "English");
            Summary savedSummary = summaryRepository.save(newSummary);
            foundTranscript.get().setSummary(savedSummary.getSummaryId());
            transcriptRepository.save(foundTranscript.get());
            URI locationOfTheNewSummary = ucb.path("/api/summary/{id}")
                    .buildAndExpand(foundTranscript.get().getRecordingId())
                    .toUri();
            return ResponseEntity.created(locationOfTheNewSummary).build();
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to transcribe the audio: " + e.getMessage());
        }
    }
    @DeleteMapping("/{recording_id}")
    private ResponseEntity<Void> deleteSummary(@PathVariable Long recording_id) {
        Optional<Summary> foundSummary = summaryRepository.findByRecordingId(recording_id);
        Optional<Transcript> foundTranscript = transcriptRepository.findByRecordingId(recording_id);
        if (foundSummary.isPresent()) {
            summaryRepository.deleteById(foundTranscript.get().getSummary());
            foundTranscript.ifPresent(t -> {
                t.setSummary(null);
                transcriptRepository.save(t);
            });
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
    
}
