package dev.AIMicroservice.chat;

import dev.AIMicroservice.transcripts.Transcript;
import dev.AIMicroservice.transcripts.TranscriptRepository;
import reactor.core.publisher.Flux;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import java.util.Optional;

@Controller
public class ChatWebSocketController {
    private final ChatClient chatClient;
    private final TranscriptRepository transcriptRepository;
    private final SimpMessagingTemplate messagingTemplate;

    // public ChatWebSocketController(ChatClient.Builder builder, TranscriptRepository transcriptRepository, SimpMessagingTemplate messagingTemplate) {
    //     this.chatClient = builder.defaultSystem("""
    //         you're a helpful AI assistant that summarizes transcripts given to you and also answers questions.
    //         You will always be provided with a transcript text before responding.
    //         Please do not ask for clarification—answer based on the provided transcript.
    //         """).build();
    //     this.transcriptRepository = transcriptRepository;
    //     this.messagingTemplate = messagingTemplate;
    // }

    public ChatWebSocketController(ChatClient.Builder builder, TranscriptRepository transcriptRepository,
            SimpMessagingTemplate messagingTemplate) {
        this.chatClient = builder.defaultSystem("""
                you're a helpful AI assistant that summarizes transcripts given to you and also answers questions.
                when user greets you, you should greet back and ask how you can help them like summerize text, translate it or/and ask questions about it. 
                You will always be provided with a transcript text before responding.
                Please do not ask for clarification—answer based on the provided transcript.
                """).build();
        this.transcriptRepository = transcriptRepository;
        this.messagingTemplate = messagingTemplate;
    }
    
    @MessageMapping("/ask")
    public void handleChatMessage(ChatMessage message) {
        Optional<Transcript> transcript = transcriptRepository.findByRecordingId(message.getRecordingId());
        String transcriptText = transcript.map(Transcript::getText).orElse("Transcript not found.");
        String fullMessage = message.getUserMessage() + "\n\nTranscript: " + transcriptText;

        Flux<String> stream = chatClient.prompt().user(fullMessage).stream().content();

        stream.doOnNext(part -> {
            messagingTemplate.convertAndSend("/topic/response", part);
        }).subscribe();
    }
}

