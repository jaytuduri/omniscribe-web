# Advanced Usage Guide

This guide covers advanced topics and optimization strategies for using Omniscribe effectively.

## File Processing

### Chunking Strategy

Omniscribe automatically handles large files by splitting them into manageable chunks:

1. **Size-based Chunking**
   - Default chunk size: 25MB
   - Configurable through environment variables
   - Chunks are processed in parallel

```python
# Example configuration in .env
MAX_CHUNK_SIZE=26214400  # 25MB in bytes
MAX_PARALLEL_CHUNKS=4
```

2. **Smart Splitting**
   - Splits at natural breaks in audio
   - Preserves sentence boundaries
   - Maintains context between chunks

### Supported Formats

1. **Audio Formats**
   - MP3 (recommended)
   - WAV
   - M4A
   - AAC
   - OGG
   - FLAC

2. **Video Formats**
   - MP4
   - MOV
   - AVI
   - MKV
   - WebM

## Performance Optimization

### 1. File Preprocessing

```python
# Example of optimizing audio before processing
from pydub import AudioSegment

def optimize_audio(file_path: str) -> str:
    audio = AudioSegment.from_file(file_path)
    
    # Convert to mono if stereo
    if audio.channels > 1:
        audio = audio.set_channels(1)
    
    # Set optimal sample rate
    audio = audio.set_frame_rate(16000)
    
    # Export as MP3
    optimized_path = file_path.rsplit('.', 1)[0] + '_optimized.mp3'
    audio.export(optimized_path, format='mp3', bitrate='128k')
    
    return optimized_path
```

### 2. Caching Strategy

```python
from functools import lru_cache
import hashlib

@lru_cache(maxsize=1000)
def get_cached_transcription(file_hash: str):
    # Implement cache lookup
    pass

def calculate_file_hash(file_path: str) -> str:
    sha256_hash = hashlib.sha256()
    with open(file_path, "rb") as f:
        for byte_block in iter(lambda: f.read(4096), b""):
            sha256_hash.update(byte_block)
    return sha256_hash.hexdigest()
```

### 3. Batch Processing

```python
async def process_batch(files: List[str], batch_size: int = 5):
    for i in range(0, len(files), batch_size):
        batch = files[i:i + batch_size]
        tasks = [process_file(f) for f in batch]
        await asyncio.gather(*tasks)
```

## Advanced Configuration

### 1. Custom Language Models

```python
# Example configuration for different language models
LANGUAGE_MODEL_CONFIG = {
    'en': {
        'model': 'groq-large',
        'temperature': 0.3,
        'prompt_template': 'Transcribe the following audio, focusing on {context}'
    },
    'es': {
        'model': 'groq-multilingual',
        'temperature': 0.4,
        'prompt_template': 'Transcribe el siguiente audio, enfocándose en {context}'
    }
}
```

### 2. Custom Prompts

```python
# Specialized prompts for different domains
DOMAIN_PROMPTS = {
    'medical': """
    This audio contains medical terminology. Pay special attention to:
    - Drug names and dosages
    - Medical procedures
    - Anatomical terms
    - Patient instructions
    """,
    
    'legal': """
    This audio contains legal terminology. Focus on:
    - Legal terms and definitions
    - Case citations
    - Procedural details
    - Contract clauses
    """,
    
    'technical': """
    This audio contains technical content. Emphasize:
    - Technical terms and acronyms
    - Product specifications
    - Process descriptions
    - Technical instructions
    """
}
```

## Error Handling and Recovery

### 1. Retry Strategy

```python
from tenacity import retry, stop_after_attempt, wait_exponential

@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=4, max=10)
)
async def resilient_transcription(file_path: str):
    try:
        return await transcribe_file(file_path)
    except Exception as e:
        logger.error(f"Transcription failed: {str(e)}")
        raise
```

### 2. Error Recovery

```python
class TranscriptionRecovery:
    def __init__(self):
        self.backup_dir = "failed_transcriptions"
        os.makedirs(self.backup_dir, exist_ok=True)

    def backup_failed_job(self, file_path: str, error: Exception):
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_path = os.path.join(
            self.backup_dir,
            f"failed_{timestamp}_{os.path.basename(file_path)}"
        )
        shutil.copy2(file_path, backup_path)
        
        metadata = {
            "original_path": file_path,
            "error": str(error),
            "timestamp": timestamp
        }
        
        with open(f"{backup_path}.meta.json", 'w') as f:
            json.dump(metadata, f)

    async def retry_failed_jobs(self):
        for file in os.listdir(self.backup_dir):
            if file.endswith('.meta.json'):
                with open(os.path.join(self.backup_dir, file)) as f:
                    metadata = json.load(f)
                try:
                    await transcribe_file(metadata['original_path'])
                    # Clean up after successful retry
                    os.remove(os.path.join(self.backup_dir, file))
                    os.remove(os.path.join(
                        self.backup_dir,
                        file.replace('.meta.json', '')
                    ))
                except Exception as e:
                    logger.error(f"Retry failed: {str(e)}")
```

## Monitoring and Logging

### 1. Advanced Logging

```python
import structlog

logger = structlog.get_logger()

def setup_structured_logging():
    structlog.configure(
        processors=[
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.processors.StackInfoRenderer(),
            structlog.processors.format_exc_info,
            structlog.processors.JSONRenderer()
        ],
        context_class=dict,
        logger_factory=structlog.PrintLoggerFactory(),
        wrapper_class=structlog.BoundLogger,
        cache_logger_on_first_use=True,
    )

def log_transcription_metrics(file_path: str, duration: float, chars: int):
    logger.info(
        "transcription_complete",
        file_path=file_path,
        duration_seconds=duration,
        character_count=chars,
        chars_per_second=chars/duration if duration > 0 else 0
    )
```

### 2. Performance Metrics

```python
from prometheus_client import Counter, Histogram

TRANSCRIPTION_DURATION = Histogram(
    'transcription_duration_seconds',
    'Time spent processing transcription',
    ['language', 'file_type']
)

TRANSCRIPTION_ERRORS = Counter(
    'transcription_errors_total',
    'Total transcription errors',
    ['error_type']
)

async def transcribe_with_metrics(file_path: str, language: str):
    file_type = os.path.splitext(file_path)[1][1:]
    
    with TRANSCRIPTION_DURATION.labels(
        language=language,
        file_type=file_type
    ).time():
        try:
            return await transcribe_file(file_path)
        except Exception as e:
            TRANSCRIPTION_ERRORS.labels(
                error_type=type(e).__name__
            ).inc()
            raise
```

## Security Best Practices

### 1. File Validation

```python
import magic
import hashlib

def validate_file(file_path: str) -> bool:
    # Check file type
    mime = magic.Magic(mime=True)
    file_type = mime.from_file(file_path)
    
    if file_type not in ALLOWED_MIME_TYPES:
        raise ValueError(f"Unsupported file type: {file_type}")
    
    # Check file size
    if os.path.getsize(file_path) > MAX_FILE_SIZE:
        raise ValueError("File too large")
    
    # Calculate checksum
    sha256_hash = hashlib.sha256()
    with open(file_path, "rb") as f:
        for byte_block in iter(lambda: f.read(4096), b""):
            sha256_hash.update(byte_block)
    
    return True
```

### 2. Rate Limiting

```python
from fastapi import HTTPException
from datetime import datetime, timedelta
from collections import defaultdict

class RateLimiter:
    def __init__(self, requests_per_minute: int = 60):
        self.requests_per_minute = requests_per_minute
        self.requests = defaultdict(list)
    
    def check_rate_limit(self, client_ip: str):
        now = datetime.now()
        minute_ago = now - timedelta(minutes=1)
        
        # Clean old requests
        self.requests[client_ip] = [
            req_time for req_time in self.requests[client_ip]
            if req_time > minute_ago
        ]
        
        if len(self.requests[client_ip]) >= self.requests_per_minute:
            raise HTTPException(
                status_code=429,
                detail="Too many requests"
            )
        
        self.requests[client_ip].append(now)
```

## Testing and Quality Assurance

### 1. Load Testing

```python
import asyncio
import aiohttp
import time

async def load_test(
    url: str,
    concurrent_users: int,
    requests_per_user: int
):
    async def user_session(session, user_id: int):
        for i in range(requests_per_user):
            start_time = time.time()
            try:
                async with session.post(url, data={
                    'file': open('test_audio.mp3', 'rb')
                }) as response:
                    await response.json()
                    duration = time.time() - start_time
                    print(f"User {user_id}, Request {i}: {duration:.2f}s")
            except Exception as e:
                print(f"Error: User {user_id}, Request {i}: {str(e)}")

    async with aiohttp.ClientSession() as session:
        tasks = [
            user_session(session, i)
            for i in range(concurrent_users)
        ]
        await asyncio.gather(*tasks)
```

### 2. Integration Testing

```python
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_transcription_pipeline():
    test_files = [
        'test_short.mp3',
        'test_medium.wav',
        'test_long.mp4'
    ]
    
    async with AsyncClient() as client:
        for file_path in test_files:
            response = await client.post(
                '/audio/transcriptions',
                files={'file': open(file_path, 'rb')}
            )
            
            assert response.status_code == 200
            data = response.json()
            assert 'text' in data
            assert len(data['text']) > 0
```

These advanced features and optimizations will help you get the most out of Omniscribe while maintaining high performance and reliability.
