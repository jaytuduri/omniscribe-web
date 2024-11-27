# Omniscribe Web

A modern web application for transcribing audio and video files using a clean, intuitive interface.

## Features

- **Multiple Input Methods**
  - Upload audio/video files
  - Record directly from microphone
- **Real-time Preview**
  - Preview audio before transcription
  - Supports multiple audio formats
- **Modern UI**
  - Clean, responsive design
  - Progress indicators
  - Step-by-step workflow

## Technical Details

- Pure HTML, CSS, and JavaScript implementation
- No external dependencies required
- Uses modern Web APIs:
  - MediaRecorder API for audio recording
  - Web Audio API for audio processing
  - Fetch API for file upload

## Browser Support

- Chrome
- Firefox
- Edge
- Safari (latest versions)

## Getting Started

1. Clone the repository
2. Open `index.html` in your browser
3. Choose to either upload a file or record audio
4. Preview your audio
5. Click "Transcribe" to get your transcription

## Project Structure

```
omniscribe-web/
├── index.html      # Main HTML file
├── styles/
│   └── main.css    # Styles
└── js/
    └── app.js      # Application logic
```

## API Endpoint

The application uses the Omniscribe API endpoint:
`https://omniscribe-production.up.railway.app/api/v1/audio/transcriptions`
