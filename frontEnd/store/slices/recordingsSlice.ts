import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import { createAppAsyncThunk } from "../withTypes";
import { Recording } from "@/app/types/types";
import { getRecordings, updateRecording, uploadFile } from "@/app/api/api";

export const fetchRecordings = createAppAsyncThunk('recordings/fetchRecordings', async () => {
    const recordings = await getRecordings();
    return recordings
})

export const createRecording = createAppAsyncThunk('recordings/uplaodRecording', async (fileUri: string | null) => {
    const recording = await uploadFile(fileUri);
    return recording
})

export const updateRecordingAsync = createAppAsyncThunk('recordings/updateRecording', async (updatedRecording: Recording) => {
    const response = await updateRecording(updatedRecording);
    if (response != 204) {
        throw new Error('Failed to update post');
      }
    return updatedRecording
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
        builder.addCase(fetchRecordings.pending, (state, action) => {
            state.status = 'pending'
        })
            .addCase(fetchRecordings.fulfilled, (state, action) => {
                state.status = 'succeeded'
                state.recordings.push(...action.payload)
            })
            .addCase(fetchRecordings.rejected, (state, action) => {
                state.status = 'failed'
                state.error = action.error.message ?? 'Unknown Error'
            })
            .addCase(updateRecordingAsync.pending, (state, action) => {
                state.status = 'pending'
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
            .addCase(updateRecordingAsync.rejected, (state, action) => {
                state.status = 'failed'
                state.error = action.error.message ?? 'Unknown Error'
            }).addCase(createRecording.pending, (state, action) => {
                state.status = 'pending'
            })
            .addCase(createRecording.fulfilled, (state, action) => {
                state.status = 'succeeded'
                if(action.payload) state.recordings.push(action.payload)
            })
            .addCase(createRecording.rejected, (state, action) => {
                state.status = 'failed'
                state.error = action.error.message ?? 'Unknown Error'
            })
    }
});

export const { addRecording } = recordingsSlice.actions;

export default recordingsSlice.reducer;