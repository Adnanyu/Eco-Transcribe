import base64
import asyncio
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import whisper 
from connection import Connection
router = APIRouter()
model = whisper.load_model("small")


connections: dict[WebSocket, Connection] = {}

@router.websocket("/ws/speech")
async def ws_endpoint(ws: WebSocket):
    await ws.accept()
    conn = Connection(ws)
    connections[ws] = conn

    try:
        while True:
            msg = await ws.receive_json()

            if msg["type"] == "audio":
                pcm = base64.b64decode(msg["data"])
                async with conn.lock:
                    conn.buffer.extend(pcm)

                # trigger transcription every 4 chunks
                if len(conn.buffer) >= 2 * 16000 * 2:  # e.g. 4s of audio
                    # fire and forget
                    asyncio.create_task(conn.process_buffer())

            elif msg["type"] == "end_stream":
                # transcribe what's left
                await conn.process_buffer()
                await ws.send_json({"type": "complete"})
                break

    except WebSocketDisconnect:
        pass
    finally:
        connections.pop(ws, None)