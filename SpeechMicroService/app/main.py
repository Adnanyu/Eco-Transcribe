from fastapi import FastAPI
from routers.transcript import router as transcript_router
from routers.liveTranscript import router as live_transcript_router
import whisper
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI


model = whisper.load_model('base')

app = FastAPI()
# origins = [
#     "http://localhost:8002",  # React Native or Web App
#     "http://127.0.0.1:3000",
#     # Add more origins as needed
# ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # <- allow all
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(transcript_router)
app.include_router(live_transcript_router)

@app.get('/')
async def root():
    return {'message': 'Hello from Adnan!'}
