package dev.AIMicroservice.chat;

public class ChatMessage {
    private Long recordingId;
    private String userMessage;

    // Getters and setters
    public Long getRecordingId() { return recordingId; }
    public void setRecordingId(Long recordingId) { this.recordingId = recordingId; }

    public String getUserMessage() { return userMessage; }
    public void setUserMessage(String userMessage) { this.userMessage = userMessage; }
}
