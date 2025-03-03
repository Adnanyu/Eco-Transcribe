package dev.EchoTranscribe.service;

import com.assemblyai.api.AssemblyAI;
import com.assemblyai.api.resources.transcripts.types.*;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class AssemblyService {
    
    private String assemblyApiKey;
    private AssemblyAI client;
    
    public AssemblyService(@Value("${assembly.api.key}") String assemblyApiKey) {
        this.assemblyApiKey = assemblyApiKey;
        this.client = AssemblyAI.builder()
                                .apiKey(assemblyApiKey)
                                .build();
    }
    
    public String[] transcript(String Url) {
        System.out.println("Api key: " + assemblyApiKey);
        Transcript transcript = client.transcripts().transcribe(Url);
        if(transcript.getStatus().equals(TranscriptStatus.ERROR)){
            System.err.println(transcript.getError().get());
            System.exit(1);
        }
        String[] array = { transcript.getText().get(), transcript.getLanguageCode().toString()};
        System.out.println(transcript.getText().get());
        return array;
    }
}
