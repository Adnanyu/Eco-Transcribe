package dev.EchoTranscribe.records;
// import org.springframework.web.bind.annotation.ModelAttribute;
import java.util.Optional;
import org.slf4j.LoggerFactory;
import org.cloudinary.json.JSONArray;
import org.cloudinary.json.JSONObject;
import org.slf4j.Logger;
import java.net.URI;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
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

import dev.EchoTranscribe.segments.SubTranscriptRepository;
import dev.EchoTranscribe.segments.Segment;
import dev.EchoTranscribe.segments.SubTranscript;
import dev.EchoTranscribe.service.CloudinaryService;
import dev.EchoTranscribe.summaries.Summary;
import dev.EchoTranscribe.summaries.SummaryRepository;
import dev.EchoTranscribe.transcripts.Transcript;
import dev.EchoTranscribe.transcripts.TranscriptRepository;
import dev.EchoTranscribe.translatedTranscripts.TranslatedTranscript;
import dev.EchoTranscribe.translatedTranscripts.TranslatedTranscriptRepository;

import java.io.IOException;
import java.util.ArrayList;
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
    private final TranscriptRepository transcriptRepository;
    private final SubTranscriptRepository subTranscriptRespository;
    private final TranslatedTranscriptRepository translatedTranscriptRepository;
    private final SummaryRepository summaryRepository;

    public RecordsController(RecordingRepository recordingRepository, CloudinaryService cloudinaryService, TranscriptRepository transcriptRepository, SubTranscriptRepository subTranscriptRespository, TranslatedTranscriptRepository translatedTranscriptRepository, SummaryRepository summaryRepository) {
        this.recordingRepository = recordingRepository;
        this.cloudinaryService = cloudinaryService;
        this.transcriptRepository = transcriptRepository;
        this.subTranscriptRespository = subTranscriptRespository;
        this.translatedTranscriptRepository = translatedTranscriptRepository;
        this.summaryRepository = summaryRepository;
    }

    @GetMapping()
    private ResponseEntity<List<Recording>> findAllRecordings(Pageable pageable){
        Page<Recording> page = recordingRepository.findAll(PageRequest.of(pageable.getPageNumber(),
                pageable.getPageSize(),
                pageable.getSortOr(Sort.by(Sort.Direction.DESC, "recordedDate"))));
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
            @RequestParam MultipartFile file, @RequestParam String type) {
        if (!file.isEmpty()) {
            try {
                Map<String, Object> uploadResult = cloudinaryService.uploadAudio(file, file.getOriginalFilename());
                String createdAtString = (String) uploadResult.get("created_at");

                Object durationObj = uploadResult.get("duration");
                double duration = durationObj != null ? ((Number) durationObj).doubleValue() : 0;


                System.out.println("Duration: " + duration + " seconds");
                DateTimeFormatter formatter = DateTimeFormatter.ISO_DATE_TIME;
                LocalDateTime recordingDate = LocalDateTime.parse(createdAtString, formatter);

                logger.info("Durataion of audio:", duration);

                RestTemplate restTemplate = new RestTemplate();

                String url = "http://localhost:8000/transcrip?url=" + uploadResult.get("secure_url").toString();
                System.out.println(uploadResult);

                String response = restTemplate.getForObject(url, String.class);

                JSONObject jsonObject = new JSONObject(response);

                JSONArray jsonSegments = jsonObject.getJSONArray("segments");

                List<Segment> segmentList = new ArrayList<>();

                for (int i = 0; i < jsonSegments.length(); i++) {
                    JSONObject segmentObj = jsonSegments.getJSONObject(i);

                    Segment segment = new Segment(
                            segmentObj.getInt("id"),
                            segmentObj.getDouble("start"),
                            segmentObj.getDouble("end"),
                            segmentObj.getString("text"));

                    segmentList.add(segment);
                }
                
                logger.info(jsonObject.get("segments").toString());
                // logger.info(subTranscript.toString());
                // List<Segments> list = Arrays.asList(subTranscript);
                // logger.info("list is: \n" + list.toString());
                // segmentsRespository.saveAll(list);
                
                String text = jsonObject.getString("text");

                Transcript trancriptedText = new Transcript(null, null, text, null, null,"English");//I wrote english here now but will make it dynamic later

                Transcript savedTranscript = transcriptRepository.save(trancriptedText);
                logger.info(savedTranscript.getTranscriptId().toString());

                List<Recording> recordingNumber = (List<Recording>) recordingRepository.findAll();

                String audioName = "audio_" + (recordingNumber.size() + 1);

                Recording newRecording = new Recording(null, uploadResult.get("secure_url").toString(),
                        audioName, type.equals("UPLOADED") ? RecordingType.UPLOADED : RecordingType.RECORDED,
                        recordingDate, null, null, duration,
                        savedTranscript.getTranscriptId(), null,
                        null);
                Recording savedRecording = recordingRepository.save(newRecording);

                SubTranscript subTranscript = new SubTranscript(null, savedRecording.getId(), segmentList);

                subTranscriptRespository.save(subTranscript);

                // trancriptedText.setRecordingId(savedTranscript.getRecordingId());
                savedTranscript.setRecordingId(savedRecording.getId());
                transcriptRepository.save(savedTranscript);

                System.out.println(uploadResult.get("url"));
                URI locationOfTheNewRecording = ucb.path("/api/recordings/{id}").buildAndExpand(savedRecording.getId())
                        .toUri();
                System.out.println(locationOfTheNewRecording);
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
            Recording updatedRecording = new Recording(recording.getId(), recording.getRecordingUrl(), recording.getTitle(),
                    recording.getRecordingType(), recording.getRecordedDate(), recording.getRecordingStartTime(),
                    recording.getRecordingEndTime(), recording.getDuration(), recording.getTranscript(), recording.getSubTranscripts(),
                    recording.getTranslatedTranscript());
            recordingRepository.save(updatedRecording);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();

    }

    @DeleteMapping("/{id}")
    private ResponseEntity<String> deleteTranscript(@PathVariable Long id) {
        Optional<Recording> foundRecording = recordingRepository.findById(id);

        if (foundRecording.isPresent()) {
            // Optional<Transcript> transcripts = transcriptRepository.findByRecordingId(id);
            // Optional<SubTranscript> foundSegments = subTranscriptRespository.findByRecordingId(id);
            // Optional<TranslatedTranscript> foundTranslated = translatedTranscriptRepository.findByRecordingId(id);
            // if (!transcripts.isEmpty()) {
            //     transcripts.get().setRecordingId(null);
            //     transcripts.get().setTranslatedTranscriptId(null);
            //     foundRecording.get().setTranscript(null);
            //     foundTranslated.get().setTranscriptId(null);
            //     translatedTranscriptRepository.save(foundTranslated.get());
            //     transcriptRepository.deleteById(transcripts.get().getTranscriptId());
            // }
            // if (!foundSegments.isEmpty()) {
            //     // subTranscriptRespository.deleteById(transcripts.get().getRecordingId());
            //     foundRecording.get().setSubTranscripts(null);
            // }
            // if (!foundTranslated.isEmpty()) {
            //     foundTranslated.get().setRecordingId(null);
            //     foundTranslated.get().setTranscriptId(null);
            //     foundRecording.get().setTranslatedTranscript(null);
            //     translatedTranscriptRepository.deleteById(foundTranslated.get().getTranslatedTranscriptId());
            // }

            Optional<Transcript> transcripts = transcriptRepository.findByRecordingId(id);
            Optional<SubTranscript> foundSegments = subTranscriptRespository.findByRecordingId(id);
            Optional<TranslatedTranscript> foundTranslated = translatedTranscriptRepository.findByRecordingId(id);
            Optional<Summary> foundSummary = summaryRepository.findByRecordingId(id);
            

            if (transcripts.isPresent()) {
                // Unlink the transcript before deletion
                if (foundTranslated.isPresent()) {
                    // Unlink the foreign key in TranslatedTranscript table
                    foundTranslated.get().setTranscriptId(null);
                    translatedTranscriptRepository.save(foundTranslated.get());  // Save the change
                }

                if (!foundSegments.isEmpty()) {
                        // subTranscriptRespository.deleteById(transcripts.get().getRecordingId());
                        foundRecording.get().setSubTranscripts(null);
                    }

                // Now you can delete the Transcript safely
                transcriptRepository.deleteById(transcripts.get().getTranscriptId());
            }

            if (foundTranslated.isPresent()) {
                // Unlink and delete the TranslatedTranscript
                foundTranslated.get().setRecordingId(null);
                translatedTranscriptRepository.deleteById(foundTranslated.get().getTranslatedTranscriptId());
            }

            if (foundSummary.isPresent()) {
                foundSummary.get().setRecordingId(null);
                summaryRepository.save(foundSummary.get());
                summaryRepository.deleteById(foundSummary.get().getSummaryId());
            }
            // Finally, delete the recording itself
            recordingRepository.deleteById(id);

            String message = "Recording with ID " + id + " and its associated transcripts have been deleted.";
            return ResponseEntity.noContent().header("Message", message).build();
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Recording with ID " + id + " not found.");
        }

    }
}
