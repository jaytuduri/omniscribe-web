# Omniscribe Web

A modern web application for transcribing audio and video files using a clean, intuitive interface.

🔗 **[Live Demo](https://jaytuduri.github.io/omniscribe-web/)**

## Features

- **Multiple Input Methods**
  - Upload audio/video files
  - Record directly from microphone
- **Real-time Preview**
  - Preview audio before transcription
  - Supports multiple audio formats
- **AI-Powered Processing**
  - Advanced audio transcription
  - AI-assisted text cleanup and formatting
- **Modern UI**
  - Clean, responsive design
  - Progress indicators
  - Step-by-step workflow

## Technical Details

- Pure HTML, CSS, and JavaScript implementation
- Modular JavaScript architecture
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
├── index.html          # Main HTML file
├── css/               # Stylesheet directory
├── styles/
│   └── main.css       # Main styles
├── js/
│   ├── aiCleanup.js   # AI text cleanup functionality
│   ├── aiGenerate.js  # AI generation features
│   ├── api.js         # API interaction handlers
│   └── config.js      # Configuration settings
└── docs/              # Documentation directory
```

## Core Components

- **AI Processing Modules**
  - `aiGenerate.js`: Handles AI-powered text generation
  - `aiCleanup.js`: Manages text cleanup and formatting
- **API Integration**
  - `api.js`: Manages all API interactions
  - `config.js`: Contains configuration and API settings

## API Endpoint

The application uses the Omniscribe API endpoint:
`https://omniscribe-production.up.railway.app/api/v1/audio/transcriptions`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
