import { createTranscript, deleteTrancript, getTranscripts, updateTranscript } from "@/app/api/api";
import { Recording, Transcript } from "@/app/types/types";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";


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

// const initialState: Transcript = {
//     transcript_id: 0,
//     recordingId: 0,
//     summary: 0,
//     langauge: '',
//     text: ''
// }


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
    reducers: {
        // setText: (state, action: PayloadAction<string>) => {
        //     state.text = action.payload;
        // }
    },
    extraReducers: builder => {
        builder.addCase(fetchTranscripts.pending, (state, action) => {
            state.status = 'pending';
                })
                    .addCase(fetchTranscripts.fulfilled, (state, action) => {
                        state.status = 'succeeded';
                        state.transcripts.push(...action.payload);
                    })
                    .addCase(fetchTranscripts.rejected, (state, action) => {
                        state.status = 'failed';
                        state.error = action.error.message ?? 'Unknown Error';
                    })
                    .addCase(createTranscriptAysnc.pending, (state, action) => {
                        state.status = 'pending';
                            })
                    .addCase(createTranscriptAysnc.fulfilled, (state, action) => {
                        state.status = 'succeeded';
                        state.transcripts.push(action.payload);
                    })
                    .addCase(createTranscriptAysnc.rejected, (state, action) => {
                        state.status = 'failed';
                        state.error = action.error.message ?? 'Unknown Error';
                    })
                    .addCase(updateTranscriptAsync.pending, (state, action) => {
                        state.status = 'pending';
                    })
                    .addCase(updateTranscriptAsync.fulfilled, (state, action) => {
                        state.status = 'succeeded';
                        const updated = action.payload;
                        const index = state.transcripts.findIndex(transcript => transcript.transcript_id.toString() === updated.transcript_id.toString());
                        if (index !== -1) {
                            state.transcripts[index] = updated;
                        }
                    })
                    .addCase(updateTranscriptAsync.rejected, (state, action) => {
                        state.status = 'failed';
                        state.error = action.error.message ?? 'Unknown Error';
                    })
                    .addCase(deleteTranscriptAsync.pending, (state, action) => {
                        state.status = 'pending';
                    })
                    .addCase(deleteTranscriptAsync.fulfilled, (state, action) => {
                        state.status = 'succeeded';
                        const deleted = action.payload;
                        state.transcripts.filter(transcript => transcript.transcript_id.toString() !== deleted.transcript_id.toString());
                    })
                    .addCase(deleteTranscriptAsync.rejected, (state, action) => {
                        state.status = 'failed';
                        state.error = action.error.message ?? 'Unknown Error';
                    })
    }
})

// export const { setText } = transcriptSlice.actions

export default transcriptsSlice.reducer