package dev.EchoTranscribe.transcripts;


import org.springframework.data.annotation.Id;

public record Transcript(@Id Long transcript_id,
        Long recording_id,
        String text,
        String summary,
        String language) {

    public Transcript withRecordingId(Long transcript_id, Long recording_id) {
    
        return new Transcript(transcript_id, recording_id, text(), summary(), language());
    }
}




// CREATE TABLE
//     IF NOT EXISTS transcripts (
//         transcript_id INT NOT NULL,
//         recording_id INT NOT NULL,
//         text TEXT,
//         summery TEXT,
//         language VARCHAR,
//         PRIMARY KEY (transcript_id),
//         FOREIGN KEY (recording_id) REFERENCES recording(id)
//     );


