import { configureStore } from '@reduxjs/toolkit'
import recordingsReducer from './slices/recordingsSlice'
import transcriptsReducer from './slices/transcriptsSlice'
import summariesReducer from './slices/summariesSlice'
import translatedReducer from './slices/translatedSlice'

export const store = configureStore({
    reducer: {
        recordings: recordingsReducer,
        transcripts: transcriptsReducer,
        summaries: summariesReducer,
        translatedTranscripts: translatedReducer
    },
})

export type RootState = ReturnType<typeof store.getState>

export type AppDispatch = typeof store.dispatch