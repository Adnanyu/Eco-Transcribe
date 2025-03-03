package dev.EchoTranscribe.chat;

import java.util.Optional;

// import org.apache.catalina.User;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import dev.EchoTranscribe.transcripts.Transcript;
import dev.EchoTranscribe.transcripts.TranscriptRepository;

@RestController
@RequestMapping("/api/chat")
public class ChatController {
    private final ChatClient chatClient;
    private final TranscriptRepository transcriptRepository;

    public ChatController(ChatClient.Builder builder, TranscriptRepository transcriptRepository) {
        this.chatClient = builder.defaultSystem("""
            you're a helpfull ai assistant that summirizes transcripts given to you and you also answer questions given to
            you about given transcripts.
                Before summirizing answers a question about a transcript you will be provided with transcript text from the user
            If user asks you a question you'll be provided with transcript which may also me referred as recording, PLEASE answer the question WITHOUT asking for further clearifications
                """).build();
        this.transcriptRepository = transcriptRepository;
    }

    @GetMapping("/transcripts/summary/{id}")
    private ResponseEntity<String> summary(@PathVariable Long id) {
        Optional<Transcript> transcript = transcriptRepository.findById(id);
        if (transcript.isPresent()) {
            String transcriptText = transcript.get().text();
            String fullMessage = "Please summarize this transcript" + "\n\n" + "Transcript: " + transcriptText;
            return ResponseEntity.ok(chatClient.prompt().user(fullMessage).call().content());
        }
        return ResponseEntity.status(404).body("sorry something went wrong");
    }

    @GetMapping("/transcripts/askChat/{id}")
    private ResponseEntity<String> askChat(@PathVariable Long id, @RequestParam String userMessage) {
        Optional<Transcript> transcript = transcriptRepository.findById(id);
        if (transcript.isPresent()) {
            String transcriptText = transcript.get().text();
            String fullMessage = userMessage + "\n\n" + "Transcript: " + transcriptText;
            return ResponseEntity.ok(chatClient.prompt().user(fullMessage).call().content());
        }
        return ResponseEntity.status(404).body("sorry something went wrong");
    }
}
