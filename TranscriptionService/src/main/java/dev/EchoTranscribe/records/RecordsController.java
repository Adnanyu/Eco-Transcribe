package dev.EchoTranscribe.records;
// import org.springframework.web.bind.annotation.ModelAttribute;
import java.util.Optional;
import org.slf4j.LoggerFactory;
import org.cloudinary.json.JSONObject;
import org.slf4j.Logger;
import java.net.URI;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.util.UriComponentsBuilder;

// import com.assemblyai.api.resources.transcripts.types.Transcript;

import dev.EchoTranscribe.service.AssemblyService;
import dev.EchoTranscribe.service.CloudinaryService;
import dev.EchoTranscribe.transcripts.Transcript;
import dev.EchoTranscribe.transcripts.TranscriptRepository;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@RestController
@RequestMapping("/api/recordings")
public class RecordsController {
    private static Logger logger = LoggerFactory.getLogger(RecordsController.class);

    private final RecordingRepository recordingRepository;
    private final CloudinaryService cloudinaryService;
    private final AssemblyService assemblyService;
    private final TranscriptRepository transcriptRepository;

    public RecordsController(RecordingRepository recordingRepository, CloudinaryService cloudinaryService, AssemblyService assemblyService, TranscriptRepository transcriptRepository) {
        this.recordingRepository = recordingRepository;
        this.cloudinaryService = cloudinaryService;
        this.assemblyService = assemblyService;
        this.transcriptRepository = transcriptRepository;
    }

    @GetMapping()
    private ResponseEntity<List<Recording>> findAllRecordings(Pageable pageable){
        Page<Recording> page = recordingRepository.findAll(PageRequest.of(pageable.getPageNumber(),
                pageable.getPageSize(),
                pageable.getSortOr(Sort.by(Sort.Direction.ASC, "recordedDate"))));
        return ResponseEntity.ok(page.getContent());
    }

    @GetMapping("/{id}")
    private ResponseEntity<Recording> findRecording(@PathVariable Long id) {
        Optional<Recording> recording = recordingRepository.findById(id);
        if (recording.isPresent()) {
            return ResponseEntity.ok(recording.get());
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/file")
    private ResponseEntity<String> createRecording(UriComponentsBuilder ucb,
            @RequestParam MultipartFile file) {
        if (!file.isEmpty()) {
            try {
                Map<String, Object> uploadResult = cloudinaryService.uploadAudio(file, file.getOriginalFilename());
                String createdAtString = (String) uploadResult.get("created_at");
                DateTimeFormatter formatter = DateTimeFormatter.ISO_DATE_TIME;
                LocalDateTime recordingDate = LocalDateTime.parse(createdAtString, formatter);

                RestTemplate restTemplate = new RestTemplate();

                String url = "http://localhost:8000/transcrip?url=" + uploadResult.get("url").toString();

                String response = restTemplate.getForObject(url, String.class);

                JSONObject jsonObject = new JSONObject(response);

                String text = jsonObject.getString("text");


                String[] transcriptInfo = assemblyService.transcript(uploadResult.get("url").toString());
                Transcript trancriptedText = new Transcript(null, null, text, null, transcriptInfo[1]);

                Transcript savedTranscript = transcriptRepository.save(trancriptedText);
                logger.info(savedTranscript.transcript_id().toString());

                Recording newRecording = new Recording(null, uploadResult.get("url").toString(),
                        file.getOriginalFilename(), RecordingType.UPLOADED, recordingDate, null, null,
                        savedTranscript.transcript_id(), null,
                        null);
                Recording savedRecording = recordingRepository.save(newRecording);
                transcriptRepository
                        .save(trancriptedText.withRecordingId(savedTranscript.transcript_id(), savedRecording.id()));

                System.out.println(uploadResult.get("url"));
                URI locationOfTheNewRecording = ucb.path("/api/recordings/{id}").buildAndExpand(savedRecording.id())
                        .toUri();
                return ResponseEntity.created(locationOfTheNewRecording).build();
            } catch (IOException e) {
                return ResponseEntity.status(500).body("Failed to upload audio");
            }
        }
        return ResponseEntity.status(500).body("Failed to upload audio");
    }
    @PutMapping("/{id}")
    private ResponseEntity<Void> updateRecording(@PathVariable Long id, @RequestBody Recording recording) {
        Optional<Recording> foundRecoridng = recordingRepository.findById(id);
        if (foundRecoridng.isPresent()) {
            Recording updatedRecording = new Recording(recording.id(), recording.recordingUrl(), recording.title(),
                    recording.recordingType(), recording.recordedDate(), recording.recordingStartTime(),
                    recording.recordingEndTime(), recording.transcript(), recording.subTranscripts(),
                    recording.translatedTranscript());
            recordingRepository.save(updatedRecording);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();

    }

    @DeleteMapping("/{id}")
    private ResponseEntity<Void> deleteTranscript(@PathVariable Long id) {
        Optional<Recording> foundRecording = recordingRepository.findById(id);
        if (foundRecording.isPresent()) {
            recordingRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
    // @PostMapping
    // private ResponseEntity<String> createRecording(@ModelAttribute Recording newRecording, UriComponentsBuilder ucb) {
    //     logger.info(newRecording.title());
    //     if (!file.isEmpty()) {
    //         try {
    //             Map<String, Object> uploadResult = cloudinaryService.uploadAudio(file);

    //             String createdAtString = (String) uploadResult.get("created_at");
    //             DateTimeFormatter formatter = DateTimeFormatter.ISO_DATE_TIME;
    //             LocalDateTime recordingDate = LocalDateTime.parse(createdAtString, formatter);

    //             Recording updatedRecording = newRecording.withRecordingUrl(uploadResult.get("url").toString(),
    //                     recordingDate);
    //             Recording savedRecording = recordingRepository.save(updatedRecording);

    //             System.out.println(uploadResult.get("url"));
    //             URI locationOfTheNewRecording = ucb.path("/api/recordings/{id}").buildAndExpand(savedRecording.id())
    //                     .toUri();
    //             return ResponseEntity.created(locationOfTheNewRecording).build();
    //         } catch (IOException e) {
    //             return ResponseEntity.status(500).body("Failed to upload audio");
    //         }
    //     } else {
    //         return ResponseEntity.status(500).body("Failed to upload audio");
    //     }
    //     return ResponseEntity.status(200).body("hello");
    // }
}
