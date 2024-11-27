# Groq API Documentation

## Overview

Groq API offers the fastest speech-to-text solution available, with OpenAI-compatible endpoints for real-time transcriptions and translations. Integrate high-quality audio processing into your applications at speeds rivaling human interaction.

## API Endpoints

| Endpoint | Usage | API URL |
|----------|-------|---------|
| Transcriptions | Convert audio to text | https://api.groq.com/openai/v1/audio/transcriptions |
| Translations | Translate audio to English text | https://api.groq.com/openai/v1/audio/translations |

## Supported Models

| Model ID | Model | Languages | Description |
|----------|-------|-----------|-------------|
| whisper-large-v3-turbo | Whisper Large V3 Turbo | Multilingual | Fine-tuned, pruned Whisper Large V3 for fast, multilingual transcription |
| distil-whisper-large-v3-en | Distil-Whisper English | English-only | Distilled Whisper model for faster, lower-cost English speech recognition |
| whisper-large-v3 | Whisper large-v3 | Multilingual | State-of-the-art performance for multilingual transcription and translation |

### Model Selection Guide

- For error-sensitive, multilingual applications: Use `whisper-large-v3`
- For English-only applications with less sensitivity to errors: Use `distil-whisper-large-v3-en`
- For multilingual support with optimal price-performance ratio: Use `whisper-large-v3-turbo`

### Model Comparison

| Model | Cost/Hour | Languages | Transcription | Translation | Real-Time Speed Factor | Word Error Rate |
|-------|-----------|-----------|---------------|-------------|------------------------|-----------------|
| whisper-large-v3 | $0.111 | Multilingual | Yes | Yes | 189 | 10.3% |
| whisper-large-v3-turbo | $0.04 | Multilingual | Yes | No | 216 | 12% |
| distil-whisper-large-v3-en | $0.02 | English only | Yes | No | 250 | 13% |

## Audio File Specifications

- Maximum file size: 25 MB
- Minimum file length: 0.01 seconds
- Minimum billed length: 10 seconds
- Supported file types: mp3, mp4, mpeg, mpga, m4a, wav, webm
- Single audio track processing

## Response Formats

Supported formats: `json`, `verbose_json`, `text`

## Audio Preprocessing

To reduce file size and allow longer uploads, downsample audio to 16,000 Hz mono:

```bash
ffmpeg -i <input_file> -ar 16000 -ac 1 -map 0:a: <output_file>
```

## Using the Transcription Endpoint

### Optional Request Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| prompt | string | None | Context or spelling guidance (max 224 tokens) |
| response_format | string | json | Output format (json, verbose_json, or text) |
| temperature | float | None | Control output randomness (0-1) |
| language | string | None | ISO 639-1 language code (e.g., "en" for English) |

### JavaScript Example

```javascript
import fs from "fs";
import Groq from "groq-sdk";

const groq = new Groq();

async function main() {
  const transcription = await groq.audio.transcriptions.create({
    file: fs.createReadStream("sample_audio.m4a"),
    model: "whisper-large-v3-turbo",
    prompt: "Specify context or spelling",
    response_format: "json",
    language: "en",
    temperature: 0.0,
  });
  console.log(transcription.text);
}
main();
```

## Using the Translation Endpoint

### Optional Request Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| prompt | string | None | Context or spelling guidance (max 224 tokens) |
| response_format | string | json | Output format (json, verbose_json, or text) |
| temperature | float | None | Control output randomness (0-1) |

### JavaScript Example

```javascript
import fs from "fs";
import Groq from "groq-sdk";

const groq = new Groq();

async function main() {
  const translation = await groq.audio.translations.create({
    file: fs.createReadStream("sample_audio.m4a"),
    model: "whisper-large-v3",
    prompt: "Specify context or spelling",
    response_format: "json",
    temperature: 0.0,
  });
  console.log(translation.text);
}
main();
```

## Prompting Guidelines

The `prompt` parameter (max 224 tokens) provides context and stylistic guidance to the model.

### How It Works
- Treated as a prior transcript, influencing style
- Does not execute commands or follow instructions

### Best Practices
- Provide context about the audio content
- Use the same language as the audio
- Guide spelling and writing style
- Keep prompts concise and style-focused

## Use Cases

- Audio Translation
- AI-Powered Customer Service
- Automated Speech-to-Text Systems
- Voice-Controlled Interfaces

We're excited to see your creations with Groq API! 🚀