import { createTranscript, deleteTrancript, getTranscript, getTranscripts, updateTranscript } from "@/api/api";
import { Recording, Transcript } from "@/types/types";
import { createAsyncThunk, createSlice, isPending, isRejected } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { createSummaryAysnc, deleteSummaryAsync } from "./summariesSlice";
import { deleteTranslatedTranscriptAsync } from "./translatedSlice";
import { deleteRecordingAsync } from "./recordingsSlice";


export const fetchTranscript = createAsyncThunk('transcript/fetchTranscripts', async (transcriptId: number) => {
    const transcripts = await getTranscript(transcriptId);
    return transcripts
})

export const fetchTranscripts = createAsyncThunk('transcripts/fetchTranscripts', async () => {
    const transcripts = await getTranscripts();
    return transcripts
})

export const createTranscriptAysnc = createAsyncThunk('transcripts/createTranscript', async (recording: Recording) => {
    const response = await createTranscript(recording);
    return response
})

export const updateTranscriptAsync = createAsyncThunk('transcripts/updateTranscript', async (updatedTranscript: Transcript) => {
    const response = await updateTranscript(updatedTranscript);
    if (response != 204) {
        throw new Error('Failed to update Transcript');
      }
    return updatedTranscript
})

export const deleteTranscriptAsync = createAsyncThunk('transcripts/deleteTranscript', async (transcript: Transcript) => {
    const response = await deleteTrancript(transcript);
    if (response != 204) {
        throw new Error('Failed to Delete Transcript');
      }
    return transcript
})


interface TranscriptsState {
    transcripts: Transcript[]
    status: 'idle' | 'pending' | 'succeeded' | 'failed'
    error: string | null
}

const initialState: TranscriptsState = {
    transcripts: [],
    status: 'idle',
    error: null
}

export const transcriptsSlice = createSlice({
    name: 'transcripts',
    initialState,
    reducers: {},
    extraReducers: builder => {
        builder.addCase(fetchTranscript.fulfilled, (state, action) => {
            state.status = 'succeeded';
            const newTranscript = action.payload;
            const index = state.transcripts.findIndex(transcript => transcript.transcriptId.toString() === newTranscript.transcriptId.toString());
            if (index !== -1) {
                state.transcripts[index] = newTranscript;
            } else {
                state.transcripts.push(newTranscript);
            }
        })
        .addCase(fetchTranscripts.fulfilled, (state, action) => {
            state.status = 'succeeded';
            state.transcripts.push(...action.payload);
        })
        .addCase(createTranscriptAysnc.fulfilled, (state, action) => {
            state.status = 'succeeded';
            state.transcripts.unshift(action.payload);
        })
        .addCase(updateTranscriptAsync.fulfilled, (state, action) => {
            state.status = 'succeeded';
            const updated = action.payload;
            const index = state.transcripts.findIndex(transcript => transcript.transcriptId.toString() === updated.transcriptId.toString());
            if (index !== -1) {
                state.transcripts[index] = updated;
            }
        })
        .addCase(deleteTranscriptAsync.fulfilled, (state, action) => {
            state.status = 'succeeded';
            const deleted = action.payload;
            state.transcripts = state.transcripts.filter(
                transcript => transcript.transcriptId.toString() !== deleted.transcriptId.toString()
              );
        })
        .addCase(createSummaryAysnc.fulfilled, (state, action) => { 
            state.status = 'succeeded';
        const newSummary = action.payload;
        const transcript = state.transcripts.find(t => t.recordingId == newSummary.recordingId);
        if (transcript) {
            transcript.summary = newSummary.summaryId;
        }
        })
        .addCase(deleteSummaryAsync.fulfilled, (state, action) => { 
            state.status = 'succeeded';
        const deletedSummary = action.payload;
        const transcript = state.transcripts.find(t => t.recordingId == deletedSummary.recordingId);
        if (transcript) {
            transcript.summary = null;
        }
        })
        .addCase(deleteTranslatedTranscriptAsync.fulfilled, (state, action) => { 
            state.status = 'succeeded';
        const deletedTranslation = action.payload;
        const transcript = state.transcripts.find(t => t.recordingId == deletedTranslation.recordingId);
        if (transcript) {
            transcript.translatedTranscript = null;
        }
        })
        .addCase(deleteRecordingAsync.fulfilled, (state, action) => {
            state.status = 'succeeded';
            const deletedReecording = action.payload;
            state.transcripts = state.transcripts.filter(
                transcript => transcript.recordingId.toString() !== deletedReecording.id.toString()
              );
        })
        builder.addMatcher(isPending(fetchTranscript, fetchTranscripts, createTranscriptAysnc, updateTranscriptAsync, deleteTranscriptAsync, createSummaryAysnc), (state) => {
            state.status = 'pending';
        })
        builder.addMatcher(isRejected(fetchTranscript, fetchTranscripts, createTranscriptAysnc, updateTranscriptAsync, deleteTranscriptAsync, createSummaryAysnc), (state, action) => {
            state.status = 'failed';
            state.error = action.error.message ?? 'Unknown Error';
        })
    }
})

// export const { setText } = transcriptSlice.actions

export default transcriptsSlice.reducer