feat: Implement AI Text Generation and Fix Core Functionality

This commit adds AI text generation capabilities and fixes several core functionality issues in the transcription workflow.

New Files:
- `js/config.js`: Central configuration for API endpoints and supported media formats
- `js/api.js`: API client for transcription and text generation endpoints
- `js/aiCleanup.js`: Handles AI-powered text cleanup functionality
- `js/aiGenerate.js`: Manages AI content generation (summaries, tweets, blog posts)

Key Changes:
1. API Integration
   - Added support for both audio and video file transcription
   - Implemented text generation endpoints (/api/v1/text/cleanup, /api/v1/text/generate)
   - Better error handling and user feedback

2. UI Improvements
   - Fixed preview section visibility
   - Added proper screen transitions
   - Improved theme switcher reliability
   - Enhanced error message display

3. Audio Recording
   - Fixed MediaRecorder implementation
   - Added proper cleanup of media streams
   - Improved recording state management

4. File Management
   - Added support for more media formats
   - Better file type validation
   - Improved file preview handling

File Details:

config.js:
- Centralized configuration for API endpoints
- Supported MIME types for audio/video files
- Environment-specific settings

api.js:
- uploadAudio(): Handles file uploads with proper FormData
- generateText(): Manages text generation requests
- Error handling and response parsing

aiCleanup.js:
- Handles AI-powered text cleanup
- Integrates with the text generation API
- Manages cleanup results display

aiGenerate.js:
- Supports multiple generation modes:
  * Summary generation
  * Tweet thread creation
  * Blog post generation
  * Custom content generation
- Handles generation options and results

Testing:
- Verified file upload and transcription
- Tested audio recording functionality
- Confirmed theme switching works
- Validated AI text generation features

Next Steps:
1. Add more comprehensive error handling
2. Implement rate limiting for API calls
3. Add progress indicators for long operations
4. Enhance the UI for generated content
