# Omniscribe Documentation

Welcome to the Omniscribe documentation! This guide will help you understand and integrate Omniscribe into your applications.

## Table of Contents

1. [Getting Started](./getting-started.md)
   - Installation and setup
   - Environment configuration
   - Basic usage

2. [API Reference](./api-reference.md)
   - Transcription API
   - Translation API
   - Response formats
   - Error handling

3. [Frontend Integration](./frontend-integration.md)
   - Next.js implementation
   - React components
   - API client setup

4. [Advanced Usage](./advanced-usage.md)
   - File handling
   - Chunking strategy
   - Performance optimization
   - Best practices

## Quick Start

1. **Standard Installation**
```bash
# Clone the repository
git clone https://github.com/your-org/omniscribe.git

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env

# Run the application
uvicorn app.main:app --reload
```

2. **Docker Installation**
```bash
# Build the Docker image
docker build -t omniscribe .

# Run the container
docker run -p 8000:8000 \
  --env-file .env \
  -v $(pwd)/uploads:/app/uploads \
  omniscribe

# Or use docker-compose
docker-compose up
```

For detailed instructions, please refer to our [Getting Started](./getting-started.md) guide.

## Support

If you encounter any issues or have questions, please:
1. Check our documentation
2. Look for existing GitHub issues
3. Create a new issue if needed

## Contributing

We welcome contributions! Please see our [Contributing Guide](./contributing.md) for details.
