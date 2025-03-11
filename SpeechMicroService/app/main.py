from fastapi import FastAPI
from routers.transcript import router
import whisper


model = whisper.load_model('base')

app = FastAPI()

app.include_router(router)

@app.get('/')
async def root():
    return {'message': 'Hello from Adnan!'}
