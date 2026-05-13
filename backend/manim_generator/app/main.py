from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import FileResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import os

from stages.stage1_scenes import generate_scenes
from stages.stage2_manim import generate_manim
from stages.stage3_script import generate_script
from stages.stage4_tts import tts_generate
from stages.stage5_stitch import (
    stitch,
    mux_audio,
    extract_audio_from_final,
    send_to_sadtalker,
)

from utils.generate_uid import generate_video_id
from pathlib import Path

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

PROJECT_ROOT = Path(__file__).resolve().parents[1]


@app.post("/explain")
def explain(
    topic: str,
    level: str = "school",
    persona: str = "teacher",
    face_enabled: bool = False,
):
    video_id = generate_video_id()

    # -------- Stage 1: Scene planning --------
    scenes = generate_scenes(topic, level)

    # -------- Stage 2: Manim rendering --------
    manim_data = generate_manim(scenes)
    scene_ids = manim_data["scene_ids"]

    # -------- Stage 3: Script generation --------
    script = generate_script(
        scenes,
        manim_data["timestamps"],
        persona,
        level,
    )

    # -------- Stage 4: TTS (ONLY surviving scenes) --------
    tts_generate(
        script=script,
        video_id=video_id,
        scene_ids=scene_ids,
    )

    # -------- Stage 5: Audio + Video --------
    mux_audio(video_id, scene_ids)
    final_video_path = stitch(video_id)

    response = {
        "status": "complete",
        "video_id": video_id,
        "video_path": str(final_video_path),
        "face_enabled": face_enabled,
    }

    # -------- Optional: SadTalker --------
    if face_enabled:
        final_audio_path = extract_audio_from_final(video_id)
        job_id = send_to_sadtalker(final_audio_path)

        response.update({
            "sadtalker_job_id": job_id,
            "avatar_status": "processing",
        })

    return response


@app.get("/video/{video_id}")
async def get_video(video_id: str, request: Request):
    """
    Stream video with proper range request support to prevent connection errors
    """
    # Try different possible paths
    possible_paths = [
        PROJECT_ROOT / "outputs" / "videos" / video_id / "final.mp4",
        PROJECT_ROOT / "outputs" / video_id / "final.mp4",
    ]
    
    video_path = None
    for path in possible_paths:
        if path.exists():
            video_path = path
            break
    
    if not video_path:
        raise HTTPException(status_code=404, detail="Video not found")
    
    file_size = os.path.getsize(video_path)
    range_header = request.headers.get("range")
    
    # Handle range requests (for video seeking and chunked loading)
    if range_header:
        byte_range = range_header.replace("bytes=", "").split("-")
        start = int(byte_range[0])
        end = int(byte_range[1]) if byte_range[1] else file_size - 1
        end = min(end, file_size - 1)
        
        chunk_size = end - start + 1
        
        def iterfile():
            with open(video_path, "rb") as video:
                video.seek(start)
                remaining = chunk_size
                while remaining:
                    read_size = min(65536, remaining)  # 64KB chunks
                    data = video.read(read_size)
                    if not data:
                        break
                    remaining -= len(data)
                    yield data
        
        headers = {
            "Content-Range": f"bytes {start}-{end}/{file_size}",
            "Accept-Ranges": "bytes",
            "Content-Length": str(chunk_size),
            "Content-Type": "video/mp4",
            "Cache-Control": "public, max-age=3600",
        }
        
        return StreamingResponse(
            iterfile(),
            status_code=206,  # Partial Content
            headers=headers,
            media_type="video/mp4"
        )
    
    # No range header - return full file
    return FileResponse(
        video_path,
        media_type="video/mp4",
        headers={
            "Accept-Ranges": "bytes",
            "Content-Length": str(file_size),
            "Cache-Control": "public, max-age=3600",
        }
    )


# Alternative simple endpoint for direct access
@app.get("/outputs/{video_id}/final.mp4")
async def get_video_direct(video_id: str, request: Request):
    """
    Direct path access for compatibility with existing URLs
    """
    return await get_video(video_id, request)