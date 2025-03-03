package dev.EchoTranscribe.recordings;

import static org.junit.jupiter.api.Assertions.assertAll;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.when;

import java.net.URI;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestClient;


import dev.EchoTranscribe.records.Recording;
import dev.EchoTranscribe.records.RecordingType;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class RecordsControllerTest {


    @LocalServerPort
    int randomServerPort;

    RestClient restClient;

    @BeforeEach
    void setUp() {
        restClient = RestClient.create("http://localhost:" + randomServerPort);
    }
//     @BeforeEach
//     void setup() {
//         // Clear any existing data in the test database
//     recordingRepository.deleteAll();
// }

    @Test
    void shouldReturnARecordingWhenDataIsSaved() {
        ResponseEntity<Recording> response = restClient.get()
                .uri("/api/recordings/99")
                .retrieve()
                .toEntity(Recording.class);

        assertAll(
                () -> assertEquals(HttpStatus.OK, response.getStatusCode()),
                () -> assertNotNull(response.getBody().id()),
                () -> assertEquals(99, response.getBody().id()));

    }
    // @Test
    // void shouldNotReturnARecordingWhenTheIdDoesNotExist() {
    //     ResponseEntity<Void> response = restClient.get().uri("/api/recordings/100").retrieve().toBodilessEntity();

    //     assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    //     assertFalse(response.hasBody());
        
    // }
    @Test
    void shouldCreateAnewRecording() {
        Recording newRecording = new Recording(null,
                null,
                "my intro to cs first class", RecordingType.UPLOADED, null, null, null,
                null, null, null);
        ResponseEntity<Void> createdResponse = restClient.post().uri("/api/recordings").body(newRecording).retrieve()
                .toBodilessEntity();

        assertEquals(HttpStatus.CREATED, createdResponse.getStatusCode());

        URI locationOfTheNewCreatedRecording = createdResponse.getHeaders().getLocation();

        ResponseEntity<Recording> response = restClient.get().uri(locationOfTheNewCreatedRecording).retrieve()
                .toEntity(Recording.class);

        assertAll(
                () -> assertEquals(HttpStatus.OK, response.getStatusCode()),
                () -> assertNotNull(response.getBody().id()),
                () -> assertNotNull(response.getBody().recordingUrl()),
                () -> assertNotNull(response.getBody().recordedDate()));
    }
    @Test
    void shouldReturnAllTheRecordingsWWenRequested() {
        ResponseEntity<Recording> response = restClient.get().uri("/api/recodings").retrieve()
                .toEntity(Recording.class);

        assertAll(
            () -> assertEquals(HttpStatus.OK, response.getStatusCode())
        );
    }
}
