package dev.EchoTranscribe.segments;
import java.util.List;
import org.bson.types.ObjectId;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "sub_transcript")
public record SubTranscript(
    @Id ObjectId subTranId,
    Long recordingId,
    List<Segment> segments
) {
              
}