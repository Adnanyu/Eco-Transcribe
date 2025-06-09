import os
import base64
import tempfile
import asyncio
import wave
import ffmpeg
import numpy as np
import soundfile as sf
from fastapi import  WebSocket
import whisper
model = whisper.load_model("base")

class Connection:
    def __init__(self, websocket: WebSocket):
        self.ws = websocket
        self.buffer = bytearray()
        self.lock = asyncio.Lock()

    async def process_buffer(self):
        # grab and clear buffer
        async with self.lock:
            data = bytes(self.buffer)
            self.buffer.clear()

        if not data:
            return

        # save raw PCM data to a file for inspection
        pcm_filename = "raw_audio.pcm"
        with open(pcm_filename, "wb") as pcm_file:
            pcm_file.write(data)

        # write to temp WAV for validation
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
            tmp_name = tmp.name
            # write raw PCM to WAV container
            with wave.open(tmp, "wb") as wf:
                wf.setnchannels(1)
                wf.setsampwidth(2)
                wf.setframerate(16000)
                wf.writeframes(data)

        # read back the WAV file into numpy float32
        audio_np, sr = sf.read(tmp_name, dtype="float32")
        os.unlink(tmp_name)

        # check if the audio file has loaded correctly
        print(f"Loaded audio with shape: {audio_np.shape} and sample rate: {sr}")

        # run Whisper on a thread
        result = await asyncio.to_thread(model.transcribe, audio_np)
        text = result["text"].strip()

        # send transcription
        await self.ws.send_json({"type": "transcription", "text": text})
        
        async def decode_chunk(msg):
            raw = base64.b64decode(msg["data"])
            def run():
                out, _ = (
                    ffmpeg
                    .input("pipe:", format="caf")    
                    .output("pipe:", format="f32le", acodec="pcm_f32le", ac=1, ar="16k")
                    .run(input=raw, capture_stdout=True, capture_stderr=True)
                )
                return np.frombuffer(out, dtype=np.float32)
            return await asyncio.to_thread(run)