package dev.EchoTranscribe.transcripts;

import java.net.URI;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.UriComponentsBuilder;

import dev.EchoTranscribe.service.AssemblyService;
import dev.EchoTranscribe.records.Recording;
import dev.EchoTranscribe.records.RecordingRepository;

@RestController
@RequestMapping("/api/transcripts")
public class TranscriptController {

    private final TranscriptRepository transcriptRepository;
    private final RecordingRepository recordingRepository;
    private final AssemblyService assemblyService;

    public TranscriptController(TranscriptRepository transcriptRepository, RecordingRepository recordingRepository,
            AssemblyService assemblyService) {
        this.transcriptRepository = transcriptRepository;
        this.assemblyService = assemblyService;
        this.recordingRepository = recordingRepository;
    }
    
    @GetMapping()
    private ResponseEntity<List<Transcript>> findAllTranscripts(Pageable pageable){
        Page<Transcript> page = transcriptRepository.findAll(PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(),
                pageable.getSortOr(Sort.by(Sort.Direction.ASC, "transcript_id"))));
        return ResponseEntity.ok(page.getContent());
    }

    @GetMapping("/{id}")
    private ResponseEntity<Transcript> findTranscript(@PathVariable Long id) {
        Optional<Transcript> foundTranscript = transcriptRepository.findById(id);
        if (foundTranscript.isPresent()) {
            return ResponseEntity.ok(foundTranscript.get());
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/{RecordingId}")
    private ResponseEntity<String> createTranscript(@PathVariable Long RecordingId, UriComponentsBuilder ucb) {
        Optional<Recording> foundRecording = recordingRepository.findById(RecordingId);
        Optional<Transcript> foundTranscript = transcriptRepository.findById(foundRecording.get().id());
        if (foundTranscript.isPresent()) {
            return ResponseEntity.status(409).body("The audio already had a transcript");
        }
        if (foundRecording.isPresent()) {
            String[] transcriptInfo = assemblyService.transcript(foundRecording.get().recordingUrl().toString());
            Transcript newTranscript = new Transcript(null, foundRecording.get().id(), transcriptInfo[0], null,
                    transcriptInfo[1]);
            Transcript savedTranscript = transcriptRepository
                    .save(newTranscript.withRecordingId(foundRecording.get().id(), foundRecording.get().id()));
            URI locationOfTheNewTranscript = ucb.path("/transcripts/{id}")
                    .buildAndExpand(savedTranscript.transcript_id()).toUri();
            return ResponseEntity.created(locationOfTheNewTranscript).build();
        }
        return ResponseEntity.status(404).body("your audio couldn't transcript");
    }
    
    @PutMapping("/{id}")
    private ResponseEntity<Void> updateTranscript(@PathVariable Long id, @RequestBody Transcript transcript) {
        Optional<Transcript> foundTranscript = transcriptRepository.findById(id);
        if (foundTranscript.isPresent()) {
            Transcript updatedTranscript = new Transcript(transcript.transcript_id(), transcript.recording_id(),
                    transcript.text(), transcript.summary(), transcript.language());
            transcriptRepository.save(updatedTranscript);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
    @DeleteMapping("{id}")
    private ResponseEntity<Void> deleteTranscript(@PathVariable Long id) {
        Optional<Transcript> foundTranscript = transcriptRepository.findById(id);
        if (foundTranscript.isPresent()) {
            transcriptRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
    
}
