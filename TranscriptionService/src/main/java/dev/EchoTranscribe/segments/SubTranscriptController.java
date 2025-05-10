package dev.EchoTranscribe.segments;

import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/segments")
public class SubTranscriptController {
    private final SubTranscriptRepository subTranscriptRespository;

    public SubTranscriptController(SubTranscriptRepository subTranscriptRespository) {
        this.subTranscriptRespository = subTranscriptRespository;
    }

    @GetMapping("/{recordingId}")
    private ResponseEntity<SubTranscript> getSegments(@PathVariable Long recordingId) {
        Optional<SubTranscript> foundSubTranscript = subTranscriptRespository.findByRecordingId(recordingId);
        if (foundSubTranscript.isPresent()) {
            return ResponseEntity.ok(foundSubTranscript.get());
        }
        return ResponseEntity.notFound().build();
    }
}
