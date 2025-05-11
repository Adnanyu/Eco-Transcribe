package dev.EchoTranscribe.transcripts;

import java.net.URI;
import java.util.List;
import java.util.Optional;
import org.cloudinary.json.JSONObject;

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

import dev.EchoTranscribe.records.Recording;
import dev.EchoTranscribe.records.RecordingRepository;
import dev.EchoTranscribe.summaries.Summary;
import dev.EchoTranscribe.summaries.SummaryRepository;
import dev.EchoTranscribe.translatedTranscripts.TranslatedTranscript;
import dev.EchoTranscribe.translatedTranscripts.TranslatedTranscriptRepository;

import org.springframework.web.client.RestTemplate;

@RestController
@RequestMapping("/api/transcripts")
public class TranscriptController {

    private final TranscriptRepository transcriptRepository;
    private final RecordingRepository recordingRepository;
    private final SummaryRepository summaryRepository;
    private final TranslatedTranscriptRepository translatedTranscriptRepository;

    public TranscriptController(TranscriptRepository transcriptRepository, RecordingRepository recordingRepository, SummaryRepository summaryRepository, TranslatedTranscriptRepository translatedTranscriptRepository) {
        this.transcriptRepository = transcriptRepository;
        this.recordingRepository = recordingRepository;
        this.summaryRepository = summaryRepository;
        this.translatedTranscriptRepository = translatedTranscriptRepository;
    }
    
    @GetMapping()
    private ResponseEntity<List<Transcript>> findAllTranscripts(Pageable pageable){
        Page<Transcript> page = transcriptRepository.findAll(PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(),
                pageable.getSortOr(Sort.by(Sort.Direction.ASC, "transcriptId"))));
        return ResponseEntity.ok(page.getContent());
    }

    @GetMapping("/{recording_id}")
    private ResponseEntity<Transcript> findTranscript(@PathVariable Long recording_id) {
        Optional<Transcript> foundTranscript = transcriptRepository.findByRecordingId(recording_id);
        if (foundTranscript.isPresent()) {
            return ResponseEntity.ok(foundTranscript.get());
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/{recording_id}")
    private ResponseEntity<String> createTranscript(@PathVariable Long recording_id, UriComponentsBuilder ucb) {
        Optional<Recording> foundRecording = recordingRepository.findById(recording_id);
        
        if (!foundRecording.isPresent()) {
            return ResponseEntity.status(404).body("Recording not found");
        }

        Optional<Transcript> foundTranscript = transcriptRepository.findByRecordingId(recording_id);
        if (foundTranscript.isPresent()) {
            return ResponseEntity.status(409).body("The audio already has a transcript");
        }

        try {
            Long foundRecordingtId = foundRecording.get().id();
            
            RestTemplate restTemplate = new RestTemplate();
            String url = "http://localhost:8000/transcrip?url=" + foundRecording.get().recordingUrl();
            String response = restTemplate.getForObject(url, String.class);
            
            JSONObject jsonObject = new JSONObject(response);
            String text = jsonObject.getString("text");
            
            Transcript newTranscript = new Transcript(null, foundRecordingtId, text, null, null,"english");
            Transcript savedTranscript = transcriptRepository.save(newTranscript);
            
            foundRecording.ifPresent(r -> {
                Recording updatedTranscript = r.withTranscriptId(savedTranscript.getTranscriptId());
                recordingRepository.save(updatedTranscript);
            });
            
            URI locationOfTheNewTranscript = ucb.path("/api/transcripts/{id}")
                    .buildAndExpand(savedTranscript.getRecordingId()).toUri();
            return ResponseEntity.created(locationOfTheNewTranscript).build();
            
        } catch (Exception e) { 
            return ResponseEntity.status(500).body("Failed to transcribe the audio: " + e.getMessage());
        }
    }

    
    @PutMapping("/{id}")
    private ResponseEntity<Void> updateTranscript(@PathVariable Long id, @RequestBody Transcript transcript) {
        Optional<Transcript> foundTranscript = transcriptRepository.findByRecordingId(id);
        if (foundTranscript.isPresent()) {
            Transcript updatedTranscript = new Transcript(transcript.getTranscriptId(), transcript.getRecordingId(),
                    transcript.getText(), transcript.getSummary(), transcript.getTranslatedTranscriptId(),transcript.getLanguage());
            transcriptRepository.save(updatedTranscript);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
    @DeleteMapping("/{id}")
    private ResponseEntity<Void> deleteTranscript(@PathVariable Long id) {
        //now make this that it removes the trnascript id from the recording it selfe
        Optional<Transcript> foundTranscript = transcriptRepository.findByRecordingId(id);
        Optional<Recording> foundRecording = recordingRepository.findById(id);
        Optional<Summary> foundSummary = summaryRepository.findByRecordingId(id);
        Optional<TranslatedTranscript> foundTranslatedTranscript = translatedTranscriptRepository.findByRecordingId(id);
        // if (foundTranscript.isPresent()) {
        //     foundRecording.ifPresent(r -> {
        //         Recording updatedRecording = r.withoutTranscriptId();
        //         recordingRepository.save(updatedRecording);
        //         if (foundSummary.isPresent()) {
        //             summaryRepository.deleteById(foundTranscript.get().getSummary());
        //         }
        //     });
        //     foundTranslatedTranscript.ifPresent(t -> {
        //         translatedTranscriptRepository.deleteById(foundTranslatedTranscript.get().getTranslatedTranscriptId());
        //     });
        //     transcriptRepository.deleteById(foundTranscript.get().getTranscriptId());
        //     return ResponseEntity.noContent().build();
        // }
        if (foundTranscript.isPresent()) {
            foundRecording.ifPresent(r -> {
                Recording updatedRecording = r.withoutTranscriptId(); // Ensure this properly removes the reference
                recordingRepository.save(updatedRecording); // Save the updated Recording
            });
    
            foundSummary.ifPresent(s -> {
                summaryRepository.deleteById(foundTranscript.get().getSummary());
            });

            foundTranscript.ifPresent(t -> {
                t.setTranslatedTranscriptId(null);
                transcriptRepository.save(t);  
            });
    
            foundTranslatedTranscript.ifPresent(t -> {
                translatedTranscriptRepository.deleteById(t.getTranslatedTranscriptId());
            });
    
            transcriptRepository.deleteById(foundTranscript.get().getTranscriptId());
    
            return ResponseEntity.noContent().build();
        }
    
        return ResponseEntity.notFound().build();
    }
    
}
