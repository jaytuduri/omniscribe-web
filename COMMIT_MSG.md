feat: Implement AI Text Generation and Fix Core Functionality, AI Generation Features and Component Loading

This commit adds AI text generation capabilities, fixes several core functionality issues in the transcription workflow, and addresses issues with AI generation features and component loading.

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

5. Text Generation Mode Fixes
   - Fix mode parameter case in API calls (convert to lowercase)
   - Update blog mode to blog_post to match API expectations
   - Ensure consistent mode values across frontend and API

6. AI Generation Fixes
   - Fixed race condition in AI generation feature initialization
   - Added proper DOM readiness checks before accessing elements
   - Improved event listener setup for AI generation buttons
   - Reorganized button event listener setup for better maintainability
   - Updated component loading to ensure DOM is fully parsed before initialization

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

Technical Changes:
- Added double requestAnimationFrame in components.js for DOM readiness
- Moved AI feature initialization into componentsLoaded event
- Created setupResultScreenButtons function for better organization
- Removed setTimeout delay in favor of proper event handling

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
