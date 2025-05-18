import { createSlice, isPending, isRejected, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import { createAppAsyncThunk } from "../withTypes";
import { Recording } from "@/types/types";
import { deleteRecording, getRecordings, updateRecording, uploadFile } from "@/api/api";
import { createTranscriptAysnc, deleteTranscriptAsync } from "./transcriptsSlice";
import { createTranslatedTranscriptAysnc, deleteTranslatedTranscriptAsync } from "./translatedSlice";

export const fetchRecordings = createAppAsyncThunk('recordings/fetchRecordings', async () => {
    const recordings = await getRecordings();
    return recordings
})

export const createRecording = createAppAsyncThunk('recordings/uplaodRecording', async ({fileUri, type}:{fileUri: string | null, type: string}) => {
    const recording = await uploadFile(fileUri, type);
    return recording
})

export const updateRecordingAsync = createAppAsyncThunk('recordings/updateRecording', async (updatedRecording: Recording) => {
    const response = await updateRecording(updatedRecording);
    if (response != 204) {
        throw new Error('Failed to update post');
      }
    return updatedRecording
})

export const deleteRecordingAsync = createAppAsyncThunk('recordings/deleteRecording', async (recording: Recording) => {
    const response = await deleteRecording(recording);
    if (response != 204) {
        throw new Error('Failed to update post');
      }
    return recording
})

interface RecordingsState {
    recordings: Recording[]
    status: 'idle' | 'pending' | 'succeeded' | 'failed'
    error: string | null
}

const initialState: RecordingsState = {
    recordings: [],
    status: 'idle',
    error: null
}

const recordingsSlice = createSlice({
    name: 'recordings',
    initialState,
    reducers: {
        addRecording: (state, action: PayloadAction<Recording>) => {
            state.recordings.push(action.payload)
        },
        // updateRecording: (state, action: PayloadAction<Recording>) => {
        //     const { id, title } = action.payload;
        //     const recording = state.recordings.find(recording => recording.id.toString() === id.toString())
        //     if (recording) recording.title = title;
        // }
    },
    extraReducers: builder => {
        builder
            .addCase(fetchRecordings.fulfilled, (state, action) => {
                state.status = 'succeeded'
                state.recordings.push(...action.payload)
            })
            .addCase(updateRecordingAsync.fulfilled, (state, action) => {
                state.status = 'succeeded'
                const updated = action.payload
                // const recording = state.recordings.find(recording => recording.id.toString() === updated.id.toString())
                const index = state.recordings.findIndex(recording => recording.id.toString() === updated.id.toString());
                if (index !== -1) {
                    state.recordings[index] = updated;
                }
                // if (recording) recording.title = updated.title;
            })
            .addCase(createRecording.fulfilled, (state, action) => {
                state.status = 'succeeded'
                if(action.payload) state.recordings.unshift(action.payload)
            })
            .addCase(createTranslatedTranscriptAysnc.fulfilled, (state, action) => { 
                state.status = 'succeeded';
                const createdTranslation = action.payload;
                const recording = state.recordings.find(r => r.id == createdTranslation.recordingId);
                if (recording) {
                    recording.translatedTranscript = createdTranslation.translatedTranscriptId;
                }
            })
            .addCase(deleteTranslatedTranscriptAsync.fulfilled, (state, action) => { 
                state.status = 'succeeded';
                const deletedTranslation = action.payload;
                const recording = state.recordings.find(r => r.id == deletedTranslation.recordingId);
                if (recording) {
                    recording.translatedTranscript = null;
                }
            })
            .addCase(createTranscriptAysnc.fulfilled, (state, action) => { 
                state.status = 'succeeded';
                const createdTranscript = action.payload;
                const recording = state.recordings.find(r => r.id == createdTranscript.recordingId);
                if (recording) {
                    recording.transcript = createdTranscript.transcriptId;
                }
            })
            .addCase(deleteTranscriptAsync.fulfilled, (state, action) => { 
                state.status = 'succeeded';
                const createdTranscript = action.payload;
                const recording = state.recordings.find(r => r.id == createdTranscript.recordingId);
                if (recording) {
                    recording.transcript = null;
                }
            })
            .addCase(deleteRecordingAsync.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const deleted = action.payload;
                state.recordings = state.recordings.filter(
                recording => recording.id !== deleted.id
              );
            })
        .addMatcher(isPending(createRecording, updateRecordingAsync, fetchRecordings, deleteRecordingAsync), (state) => {
            state.status = 'pending';
        })
        .addMatcher(isRejected(createRecording, updateRecordingAsync, fetchRecordings, deleteRecordingAsync), (state, action) => {
            state.status = 'failed';
            state.error = action.error.message ?? 'Unknown Error';
        })
    }
});

export const { addRecording } = recordingsSlice.actions;

export default recordingsSlice.reducer;