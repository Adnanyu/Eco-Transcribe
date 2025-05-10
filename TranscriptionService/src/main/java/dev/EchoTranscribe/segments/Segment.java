package dev.EchoTranscribe.segments;

import org.springframework.data.annotation.Id;

public record Segment(
    @Id int id,
    double start,
    double end,
    String text
) {
              
}

// sub_transcript_id INT,
// --         recording_id INT,
// --         text VARCHAR,
// --         start_time VARCHAR,
// --         end_time VARCHAR,
// --         PRIMARY KEY (sub_transcript_id),
// --         FOREIGN KEY (recording_id) REFERENCES recordings(recording_id)