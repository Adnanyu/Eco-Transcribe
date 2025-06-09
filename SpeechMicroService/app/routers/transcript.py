from fastapi import APIRouter
from fastapi import status
from fastapi.responses import JSONResponse
import requests
import io
import whisper
import tempfile
import logging
# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

model = whisper.load_model('base')
router = APIRouter()

@router.get('/transcrip/', tags=["transcripts"])
async def transcribe(url: str):
    print(url)
    response = requests.get(url)
    print(response)
    print(type(response.content))
    if response.status_code == 200:
        audio_bytes = io.BytesIO(response.content)
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=True) as temp_audio:
            temp_audio.write(audio_bytes.getbuffer())  
            temp_audio.flush() 
            result = model.transcribe(temp_audio.name)
        segments = result['segments']

        filtered_response = [
            {
                'id': segment['id'],     
                'start': round(segment['start'], 2),  
                'end': round(segment['end'], 2),    
                'text': segment['text']    
            }
            for segment in segments
        ]
        final_response = {'segments': filtered_response, 'text': result['text']}
        return JSONResponse(status_code=status.HTTP_200_OK, content=final_response)
    else:
        return JSONResponse(status_code=status.HTTP_404_NOT_FOUND, content="Error getting the audio file")