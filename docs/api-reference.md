# API Reference

This document provides detailed information about Omniscribe's API endpoints, request/response formats, and error handling.

## Base URL

```
http://your-server:8000/api/v1
```

## Authentication

Currently, the API uses API key authentication. Include your API key in the environment variables:
```plaintext
GROQ_API_KEY=your_groq_api_key
```

## Endpoints

### 1. Transcription API

#### Transcribe Audio
```http
POST /audio/transcriptions
```

**Request Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| file | File | Yes | The audio file to transcribe |
| language | string | No | ISO 639-1 language code (e.g., "en") |
| prompt | string | No | Context for transcription |
| response_format | string | No | "json", "verbose_json", or "text" |
| temperature | float | No | Value between 0 and 1 |

**Example Request:**
```bash
curl -X POST http://your-server:8000/api/v1/audio/transcriptions \
  -H "Content-Type: multipart/form-data" \
  -F "file=@audio.mp3" \
  -F "language=en" \
  -F "response_format=json"
```

**Example Response:**
```json
{
  "success": true,
  "text": "This is the transcribed text...",
  "file_name": "audio.mp3",
  "language": "en"
}
```

### 2. Translation API

#### Translate Audio to English
```http
POST /audio/translations
```

**Request Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| file | File | Yes | The audio file to translate |
| prompt | string | No | Context for translation |
| response_format | string | No | "json", "verbose_json", or "text" |
| temperature | float | No | Value between 0 and 1 |

**Example Request:**
```bash
curl -X POST http://your-server:8000/api/v1/audio/translations \
  -H "Content-Type: multipart/form-data" \
  -F "file=@spanish_audio.mp3" \
  -F "response_format=json"
```

**Example Response:**
```json
{
  "success": true,
  "text": "This is the English translation...",
  "file_name": "spanish_audio.mp3",
  "language": "en"
}
```

### 3. Storage Management

#### List Transcriptions
```http
GET /audio/transcriptions
```

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| limit | integer | No | Max number of results (default: 100) |
| offset | integer | No | Pagination offset (default: 0) |

**Example Request:**
```bash
curl http://your-server:8000/api/v1/audio/transcriptions?limit=10&offset=0
```

#### Get Specific Transcription
```http
GET /audio/transcriptions/{filename}
```

**Example Request:**
```bash
curl http://your-server:8000/api/v1/audio/transcriptions/audio.mp3
```

#### Delete Transcription
```http
DELETE /audio/transcriptions/{filename}
```

**Example Request:**
```bash
curl -X DELETE http://your-server:8000/api/v1/audio/transcriptions/audio.mp3
```

## Error Handling

The API uses standard HTTP status codes and returns detailed error messages:

### Status Codes

- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 413: Payload Too Large
- 415: Unsupported Media Type
- 500: Internal Server Error

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "error_code",
    "message": "Detailed error message"
  }
}
```

### Common Error Codes

| Code | Description |
|------|-------------|
| file_too_large | File exceeds maximum size limit |
| invalid_format | Unsupported file format |
| processing_error | Error during transcription/translation |
| not_found | Requested resource not found |

## Rate Limiting

- Default: 100 requests per minute per IP
- File size limit: 100MB (configurable in .env)

## Best Practices

1. **File Formats**
   - Supported formats: MP3, WAV, MP4, etc.
   - Recommended: MP3 format for optimal processing
   - Maximum file size: 100MB (configurable)

2. **Language Codes**
   - Use ISO 639-1 language codes
   - Example: "en" for English, "es" for Spanish

3. **Temperature Settings**
   - 0.0: Most focused/deterministic
   - 0.3-0.7: Balanced
   - 1.0: Most creative/variable

4. **Error Handling**
   - Always check response status codes
   - Implement retry logic for 5xx errors
   - Handle rate limiting gracefully

## Example Implementation

```python
import requests

def transcribe_audio(file_path, language="en"):
    url = "http://your-server:8000/api/v1/audio/transcriptions"
    
    with open(file_path, "rb") as f:
        files = {"file": f}
        data = {"language": language}
        
        response = requests.post(url, files=files, data=data)
        
        if response.status_code == 200:
            return response.json()
        else:
            raise Exception(f"Error: {response.json()['error']['message']}")
```

## Support

For API-related issues:
1. Check the error response for detailed information
2. Verify your request format and parameters
3. Check the logs for more details
4. Contact support with the error details and request ID
