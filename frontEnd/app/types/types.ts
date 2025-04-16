export type Recording = {
    id: Number,
    recordingUrl: string,
    title: string,
    recordingType: string,
    recordedDate: string,
    duration: number,
    recordingStartTim: string,
    recordingEndTime: string,
    transcript: Number,
    subTranscripts: Number,
    translatedTranscript: Number,
};
  
export type Segments = {
    id: number,
    start: number,
    end: number,
    text: string,
};
  
export type Transcript = {
    transcriptId: number,
    recordingId: number,
    summary: number,
    langauge: string,
    text: string
  };