package dev.AIMicroservice.llm;

import java.util.Optional;

// import org.apache.catalina.User;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import dev.AIMicroservice.transcripts.Transcript;
import dev.AIMicroservice.transcripts.TranscriptRepository;

@RestController
@RequestMapping("/api/ai")
public class AIController {
    private final ChatClient chatClient;
    private final TranscriptRepository transcriptRepository;
    

    public AIController(ChatClient.Builder builder, TranscriptRepository transcriptRepository) {
        // this.chatClient = builder.defaultSystem("""
        //     you're a helpfull ai assistant that summirizes transcripts given to you and you also answer questions given to
        //     you about given transcripts.
        //         Before summirizing answers a question about a transcript you will be provided with transcript text from the user
        //     If user asks you a question you'll be provided with transcript which may also me referred as recording, PLEASE answer the question WITHOUT asking for further clearifications
        //         """).build();
        this.chatClient = builder.defaultSystem("""
                you're a helpfull AI that your only job is to summarize and translate transcript texts.
                when you are asked to summarize a trnascript you will be given text and you should summerize it, likewise for translating, You will be given a transcript
                and language to translate to and you should translate. no further clarifications should be asked when you promted. when giving back the response do not give
                any extra information like "here is summary of" or "given langauge Translation: " just give the answer.
                """).build();
        this.transcriptRepository = transcriptRepository;
    }

    @GetMapping("/summary/{id}")
    private ResponseEntity<String> summary(@PathVariable Long id) {
        Optional<Transcript> transcript = transcriptRepository.findByRecordingId(id);
        if (transcript.isPresent()) {
            String transcriptText = transcript.get().getText();
            String fullMessage = "Please summarize this transcript" + "\n\n" + "Transcript: " + transcriptText;
            return ResponseEntity.ok(chatClient.prompt().user(fullMessage).call().content());
        }
        return ResponseEntity.status(404).body("sorry something went wrong");
    }

    @GetMapping("/translate/{id}")
    private ResponseEntity<String> translate(@PathVariable Long id, @RequestParam String language) {
        System.out.println("langauge is: " + language);
        System.out.println("id is: " + id.toString());
        Optional<Transcript> transcript = transcriptRepository.findById(id);
        System.out.println("found trnascript is: " + transcript);
        if (transcript.isPresent()) {
            String transcriptText = transcript.get().getText();
            String fullMessage = "Please translate this transcript to " + language + "." + "\n\n" + "Transcript: " + transcriptText;
            return ResponseEntity.ok(chatClient.prompt().user(fullMessage).call().content());
        }
        return ResponseEntity.status(404).body("sorry something went wrong");
    }

    // @GetMapping("/askChat/{id}")
    // private ResponseEntity<String> askChat(@PathVariable Long id, @RequestParam String userMessage) {
    //     Optional<Transcript> transcript = transcriptRepository.findByRecordingId(id);
    //     if (transcript.isPresent()) {
    //         String transcriptText = transcript.get().text();
    //         String fullMessage = userMessage + "\n\n" + "Transcript: " + transcriptText;
    //         return ResponseEntity.ok(chatClient.prompt().user(fullMessage).call().content());
    //     }
    //     return ResponseEntity.status(404).body("sorry something went wrong");
    // }
}
