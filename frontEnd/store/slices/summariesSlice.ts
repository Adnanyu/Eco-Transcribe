import { createSummary, deleteSummary, getSummaries, updateSummary } from "@/app/api/api";
import { Recording, Summary, Transcript } from "@/app/types/types";
import { createAsyncThunk, createSlice, isPending, isRejected } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";


export const fetchSummaries = createAsyncThunk('summaries/fetchSummaries', async () => {
    const transcripts = await getSummaries();
    return transcripts
})

export const createSummaryAysnc = createAsyncThunk('summaries/createSummary', async (recording: Recording) => {
    const response = await createSummary(recording);
    return response
})

export const updateSummaryAsync = createAsyncThunk('summaries/updateSummary', async (updatedSummary: Summary) => {
    const response = await updateSummary(updatedSummary);
    if (response != 204) {
        throw new Error('Failed to update Summary');
      }
    return updatedSummary
})

export const deleteSummaryAsync = createAsyncThunk('summaries/deleteTranscript', async (summary: Summary) => {
    const response = await deleteSummary(summary);
    if (response != 204) {
        throw new Error('Failed to Delete Summary');
      }
    return summary
})

// const initialState: Transcript = {
//     transcriptId: 0,
//     recordingId: 0,
//     summary: 0,
//     langauge: '',
//     text: ''
// }


interface SummariesState {
    summaries: Summary[]
    status: 'idle' | 'pending' | 'succeeded' | 'failed'
    error: string | null
}

const initialState: SummariesState = {
    summaries: [],
    status: 'idle',
    error: null
}

export const summariesSlice = createSlice({
    name: 'summaries',
    initialState,
    reducers: {},
    extraReducers: builder => {
        builder.addCase(fetchSummaries.fulfilled, (state, action) => {
            state.status = 'succeeded';
            state.summaries.push(...action.payload);
        })
        .addCase(createSummaryAysnc.fulfilled, (state, action) => {
            state.status = 'succeeded';
            state.summaries.push(action.payload);
        })
        .addCase(updateSummaryAsync.fulfilled, (state, action) => {
            state.status = 'succeeded';
            const updated = action.payload;
            const index = state.summaries.findIndex(summary => summary.summaryId.toString() === updated.summaryId.toString());
            if (index !== -1) {
                state.summaries[index] = updated;
            }
        })
        .addCase(deleteSummaryAsync.fulfilled, (state, action) => {
            state.status = 'succeeded';
            const deleted = action.payload;
            state.summaries.filter(summary => summary.summaryId.toString() !== deleted.summaryId.toString());
        })
        builder.addMatcher(isPending(fetchSummaries, createSummaryAysnc, updateSummaryAsync, deleteSummaryAsync), (state) => {
            state.status = 'pending';
        })
        builder.addMatcher(isRejected(fetchSummaries, createSummaryAysnc, updateSummaryAsync, deleteSummaryAsync), (state, action) => {
            state.status = 'failed';
            state.error = action.error.message ?? 'Unknown Error';
        })
    }
})

// export const { setText } = transcriptSlice.actions

export default summariesSlice.reducer