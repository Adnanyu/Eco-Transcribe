import { createTranslatedTranscript, deleteTranslatedTranscript, getTranslatedTranscript, getTranslatedTranscripts, updateTranslatedTranscript } from "@/api/api";
import { Transcript, TranslatedTranscript } from "@/types/types";
import { createAsyncThunk, createSlice, isPending, isRejected } from "@reduxjs/toolkit";
import { deleteTranscriptAsync } from "./transcriptsSlice";
import { deleteRecordingAsync } from "./recordingsSlice";

// export const fetchTranslatedTranscript = createAsyncThunk('TranslatedTranscript/TranslatedTranscripts', async (id: number) => {
//     const transcripts = await getTranslatedTranscript(id);
//     return transcripts
// })

export const fetchTranslatedTranscripts = createAsyncThunk('TranslatedTranscripts/TranslatedTranscripts', async () => {
    const transcripts = await getTranslatedTranscripts();
    return transcripts
})

export const createTranslatedTranscriptAysnc = createAsyncThunk('TranslatedTranscripts/createTranslatedTranscripts', async ({ transcript, language }: { transcript: Transcript, language: String }) => {
    const response = await createTranslatedTranscript(transcript, language);
    return response
})

export const updateTranslatedTranscriptAsync = createAsyncThunk('TranslatedTranscripts/updateTranslatedTranscripts', async (updatedTranslatedTranscripts: TranslatedTranscript) => {
    const response = await updateTranslatedTranscript(updatedTranslatedTranscripts);
    if (response != 204) {
        throw new Error('Failed to update TranslatedTranscripts');
      }
    return updatedTranslatedTranscripts
})

export const deleteTranslatedTranscriptAsync = createAsyncThunk('TranslatedTranscripts/deleteTranslatedTranscripts', async (TranslatedTranscripts: TranslatedTranscript) => {
    const response = await deleteTranslatedTranscript(TranslatedTranscripts);
    if (response != 204) {
        throw new Error('Failed to Delete TranslatedTranscripts');
      }
    return TranslatedTranscripts
})


interface TranslatedTranscriptsState {
    translatedTranscripts: TranslatedTranscript[]
    status: 'idle' | 'pending' | 'succeeded' | 'failed'
    error: string | null
}

const initialState: TranslatedTranscriptsState = {
    translatedTranscripts: [],
    status: 'idle',
    error: null
}

export const TranslatedTranscriptsSlice = createSlice({
    name: 'TranslatedTranscriptss',
    initialState,
    reducers: {},
    extraReducers: builder => {
        builder
        //     .addCase(fetchTranslatedTranscript.fulfilled, (state, action) => {
        //     state.status = 'succeeded';
        //     state.translatedTranscripts.push(action.payload);
        // })
        .addCase(fetchTranslatedTranscripts.fulfilled, (state, action) => {
            state.status = 'succeeded';
            state.translatedTranscripts.push(...action.payload);
        })
        .addCase(createTranslatedTranscriptAysnc.fulfilled, (state, action) => {
            state.status = 'succeeded';
            state.translatedTranscripts.push(action.payload);
        })
        .addCase(updateTranslatedTranscriptAsync.fulfilled, (state, action) => {
            state.status = 'succeeded';
            const updated = action.payload;
            const index = state.translatedTranscripts.findIndex(translatedTranscript => translatedTranscript.translatedTranscriptId.toString() === updated.translatedTranscriptId.toString());
            if (index !== -1) {
                state.translatedTranscripts[index] = updated;
            }
        })
        .addCase(deleteTranslatedTranscriptAsync.fulfilled, (state, action) => {
            state.status = 'succeeded';
            const deleted = action.payload;
            state.translatedTranscripts = state.translatedTranscripts.filter(translatedTranscript => translatedTranscript.translatedTranscriptId.toString() !== deleted.translatedTranscriptId.toString());
        })
        .addCase(deleteTranscriptAsync.fulfilled, (state, action) => {
            state.status = 'succeeded';
            const deleted = action.payload;
            state.translatedTranscripts = state.translatedTranscripts.filter(translatedTranscript => translatedTranscript.transcriptId.toString() !== deleted.transcriptId.toString());
        })
        .addCase(deleteRecordingAsync.fulfilled, (state, action) => {
            state.status = 'succeeded';
            const deleted = action.payload;
            state.translatedTranscripts = state.translatedTranscripts.filter(translatedTranscript => translatedTranscript.recordingId !== deleted.id);
        })
        builder.addMatcher(isPending(fetchTranslatedTranscripts, createTranslatedTranscriptAysnc, updateTranslatedTranscriptAsync, deleteTranslatedTranscriptAsync), (state) => {
            state.status = 'pending';
        })
        builder.addMatcher(isRejected(fetchTranslatedTranscripts, createTranslatedTranscriptAysnc, updateTranslatedTranscriptAsync, deleteTranslatedTranscriptAsync), (state, action) => {
            state.status = 'failed';
            state.error = action.error.message ?? 'Unknown Error';
        })
    }
})

// export const { setText } = TranslatedTranscriptsSlice.actions

export default TranslatedTranscriptsSlice.reducer