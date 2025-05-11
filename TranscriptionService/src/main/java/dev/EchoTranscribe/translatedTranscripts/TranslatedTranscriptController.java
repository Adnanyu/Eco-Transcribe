package dev.EchoTranscribe.translatedTranscripts;

import org.springframework.web.bind.annotation.RestController;

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
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;
import dev.EchoTranscribe.transcripts.Transcript;
import dev.EchoTranscribe.transcripts.TranscriptRepository;

@RestController
@RequestMapping("/api/translated-transcript")
public class TranslatedTranscriptController {
     private final TranslatedTranscriptRepository translatedTranscriptRepository;
    private final TranscriptRepository transcriptRepository;

    @Autowired
    private RestTemplate restTemplate;

    public TranslatedTranscriptController(TranslatedTranscriptRepository translatedTranscriptRepository, TranscriptRepository transcriptRepository) {
        this.translatedTranscriptRepository = translatedTranscriptRepository;
        this.transcriptRepository = transcriptRepository;
    }

    @GetMapping()
    private ResponseEntity<List<TranslatedTranscript>> findAllSummaries(Pageable pageable) {
        Page<TranslatedTranscript> page = translatedTranscriptRepository.findAll(PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(),
                pageable.getSortOr(Sort.by(Sort.Direction.ASC, "translatedTranscriptId"))));
        return ResponseEntity.ok(page.getContent());
    }

    @GetMapping("/{transcript_id}")
    private ResponseEntity<TranslatedTranscript> findTranslatedTranscript(@PathVariable Long transcript_id) {
        Optional<TranslatedTranscript> foundTranslatedTranscript = translatedTranscriptRepository.findByTranscriptId(transcript_id);
        if (!foundTranslatedTranscript.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(foundTranslatedTranscript.get());
    }

    @PostMapping("/{transcript_id}")
    private ResponseEntity<String> createTranslatedTranscript(@PathVariable Long transcript_id,
            @RequestParam String language, UriComponentsBuilder ucb) {
        Optional<Transcript> foundTranscript = transcriptRepository.findById(transcript_id);

        if (!foundTranscript.isPresent()) {
            return ResponseEntity.status(404).body("No Transcript found to be Translated.");
        }

        Optional<TranslatedTranscript> foundTranslatedTranscript = translatedTranscriptRepository
                .findByTranscriptId(transcript_id);
        if (foundTranslatedTranscript.isPresent()) {
            return ResponseEntity.status(409).body("The Transcript Already Has a Translation");
        }

        try {
            // RestTemplate restTemplate = new RestTemplate();
            String url = "http://AIMicroservice/api/ai/translate/" + foundTranscript.get().getTranscriptId().toString()
                    + "?language=" + language;
            System.out.println(url);
            String response = restTemplate.getForObject(url, String.class);
            TranslatedTranscript newTranslatedTranscript = new TranslatedTranscript(null,
                    foundTranscript.get().getTranscriptId(), foundTranscript.get().getRecordingId(), response,
                    language);
            TranslatedTranscript savedTranslatedTranscript = translatedTranscriptRepository
                    .save(newTranslatedTranscript);
            foundTranscript.get().setTranslatedTranscriptId(savedTranslatedTranscript.getTranslatedTranscriptId());
            transcriptRepository.save(foundTranscript.get());
            URI locationOfTheNewSummary = ucb.path("/api/translated-transcript/{id}")
                    .buildAndExpand(foundTranscript.get().getTranscriptId())
                    .toUri();
            return ResponseEntity.created(locationOfTheNewSummary).build();
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to translate the transcribt: " + e.getMessage());
        }
    }
    
    @PutMapping("/{transcript_id}")
    private ResponseEntity<Void> updateTranslatedTranscript(@PathVariable Long transcript_id, @RequestBody TranslatedTranscript translatedTranscriptUpdate) {
        Optional<TranslatedTranscript> foundTranscript = translatedTranscriptRepository.findByTranscriptId(transcript_id);
        if (foundTranscript.isPresent()) {
            TranslatedTranscript updatedTranscript = new TranslatedTranscript(translatedTranscriptUpdate.getTranslatedTranscriptId(), translatedTranscriptUpdate.getTranscriptId(), translatedTranscriptUpdate.getRecordingId(),
            translatedTranscriptUpdate.getText(), translatedTranscriptUpdate.getLanguage());
            translatedTranscriptRepository.save(updatedTranscript);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
    
    @DeleteMapping("/{transcript_id}")
    private ResponseEntity<Void> deleteTranslatedTranscript(@PathVariable Long transcript_id) {
        Optional<TranslatedTranscript> foundTranslatedTranscript = translatedTranscriptRepository.findByTranscriptId(transcript_id);
        Optional<Transcript> foundTranscript = transcriptRepository.findById(transcript_id);
        if (foundTranslatedTranscript.isPresent()) {
            foundTranscript.ifPresent(t -> {
                t.setTranslatedTranscriptId(null);
                transcriptRepository.save(t);
            });
            translatedTranscriptRepository.deleteById(foundTranslatedTranscript.get().getTranslatedTranscriptId());
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
    
}
