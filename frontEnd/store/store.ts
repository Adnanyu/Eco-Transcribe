import { configureStore } from '@reduxjs/toolkit'
import recordingReducer from './slices/recordingSlice'
import recordingsReducer from './slices/recordingsSlice'
import transcriptsReducer from './slices/transcriptsSlice'

export const store = configureStore({
    reducer: {
        recordings: recordingsReducer,
        recording: recordingReducer,
        transcripts: transcriptsReducer,
    },
})

export type RootState = ReturnType<typeof store.getState>

export type AppDispatch = typeof store.dispatch