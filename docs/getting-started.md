# Getting Started with Omniscribe

This guide will walk you through setting up and running Omniscribe on your system.

## Prerequisites

- Python 3.8 or higher
- pip (Python package manager)
- Virtual environment (recommended)
- FFmpeg for audio processing

## Installation

1. **Clone the Repository**
```bash
git clone https://github.com/your-org/omniscribe.git
cd omniscribe
```

2. **Choose Installation Method**

### Option A: Standard Installation

1. **Set Up Virtual Environment (Recommended)**
```bash
python -m venv venv
source venv/bin/activate  # On Unix/macOS
# or
.\venv\Scripts\activate  # On Windows
```

2. **Install Dependencies**
```bash
pip install -r requirements.txt
```

### Option B: Docker Installation

1. **Prerequisites**
- Docker installed on your system
- Docker Compose (optional, but recommended)

2. **Build and Run with Docker**
```bash
# Build the image
docker build -t omniscribe .

# Run the container
docker run -p 8000:8000 \
  --env-file .env \
  -v $(pwd)/uploads:/app/uploads \
  omniscribe
```

3. **Using Docker Compose (Recommended)**

Create a `docker-compose.yml` file:
```yaml
version: '3.8'
services:
  omniscribe:
    build: .
    ports:
      - "8000:8000"
    env_file:
      - .env
    volumes:
      - ./uploads:/app/uploads
    restart: unless-stopped
```

Run with Docker Compose:
```bash
docker-compose up -d
```

4. **Docker Environment Variables**
When using Docker, you can either:
- Use the `--env-file` flag with a `.env` file
- Set environment variables directly in `docker-compose.yml`
- Pass them via command line with `-e` flag

Example with direct environment variables:
```bash
docker run -p 8000:8000 \
  -e API_HOST=0.0.0.0 \
  -e API_PORT=8000 \
  -e GROQ_API_KEY=your_key \
  -v $(pwd)/uploads:/app/uploads \
  omniscribe
```

## Configuration

1. **Environment Variables**

Copy the example environment file and configure your settings:
```bash
cp .env.example .env
```

Required environment variables:
```plaintext
# API Configuration
API_HOST=0.0.0.0
API_PORT=8000

# Groq API Configuration
GROQ_API_KEY=your_groq_api_key

# File Storage
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=100000000  # 100MB in bytes
```

2. **Storage Setup**

Ensure the upload directory exists and has proper permissions:
```bash
mkdir -p uploads
chmod 755 uploads  # On Unix/macOS
```

## Running the Application

1. **Development Mode**
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

2. **Production Mode**
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## Verifying Installation

1. **Check API Status**
```bash
curl http://localhost:8000/health
```

2. **Test Transcription**
```bash
curl -X POST http://localhost:8000/openai/v1/audio/transcriptions \
  -H "Content-Type: multipart/form-data" \
  -F "file=@path/to/your/audio.mp3" \
  -F "language=en"
```

## Common Issues and Solutions

### FFmpeg Not Found
```bash
# On macOS
brew install ffmpeg

# On Ubuntu/Debian
sudo apt-get update
sudo apt-get install ffmpeg

# On Windows (using Chocolatey)
choco install ffmpeg
```

### Docker-Specific Issues

1. **Container Permission Issues**
```bash
# Fix uploads directory permissions
sudo chown -R 1000:1000 uploads/
chmod -R 755 uploads/
```

2. **Container Not Starting**
- Check logs: `docker logs omniscribe`
- Verify port availability: `lsof -i :8000`
- Ensure environment variables are set correctly

3. **Volume Mount Issues**
- Use absolute paths in volume mounts
- Verify directory exists on host
- Check SELinux settings if applicable

4. **Performance Issues**
- Increase container resources in Docker settings
- Monitor container stats: `docker stats omniscribe`
- Consider using Docker volume instead of bind mount for better performance

5. **Networking Issues**
```bash
# Check if container is running
docker ps

# Inspect container networking
docker inspect omniscribe

# Test network connectivity
docker exec omniscribe curl localhost:8000/health
```

### Permission Issues
Ensure proper permissions for the upload directory:
```bash
sudo chown -R $USER:$USER uploads
chmod -R 755 uploads
```

### Large File Upload Issues
1. Check your `max_file_size` setting in `.env`
2. Verify your web server configuration (nginx, apache) allows large file uploads
3. Ensure enough disk space is available

## Next Steps

- Read the [API Reference](./api-reference.md) for detailed endpoint documentation
- Check out [Frontend Integration](./frontend-integration.md) for client implementation
- Explore [Advanced Usage](./advanced-usage.md) for optimization tips

## Support

If you encounter any issues:
1. Check the logs: `tail -f logs/omniscribe.log`
2. Verify your configuration in `.env`
3. Ensure all dependencies are properly installed
4. Check the [GitHub issues](https://github.com/your-org/omniscribe/issues)
