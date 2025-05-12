export interface Recording {
    id: number,
    recordingUrl: string,
    title: string,
    recordingType: string,
    recordedDate: string,
    duration: number,
    recordingStartTime: string | null,
    recordingEndTime: string | null,
    transcript: number | null,
    subTranscripts: number | null,
    translatedTranscript: number | null,
};
  
export interface Segments {
    id: number,
    start: number,
    end: number,
    text: string,
};
  
export interface Transcript {
    transcriptId: number,
    recordingId: number,
    summary: number,
    langauge: string,
    text: string
};
  
export interface Summary {
    summaryId: number,
    recordingId: number,
    text: number,
    langauge: string,
};
  