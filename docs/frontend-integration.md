# Frontend Integration Guide

This guide explains how to integrate Omniscribe with your Next.js frontend application.

## Setup

1. **Create a New Next.js Project**
```bash
npx create-next-app@latest omniscribe-frontend
cd omniscribe-frontend
```

2. **Install Dependencies**
```bash
npm install axios @types/node @types/react
```

## API Client Setup

Create a reusable API client:

```typescript
// lib/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
  timeout: 30000,
});

export default api;
```

## React Hooks

### Transcription Hook

```typescript
// hooks/useTranscription.ts
import { useState } from 'react';
import api from '../lib/api';

interface TranscriptionOptions {
  language?: string;
  prompt?: string;
  response_format?: string;
  temperature?: number;
}

export const useTranscription = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const transcribeFile = async (file: File, options?: TranscriptionOptions) => {
    try {
      setLoading(true);
      setError(null);
      
      const formData = new FormData();
      formData.append('file', file);
      
      if (options?.language) formData.append('language', options.language);
      if (options?.prompt) formData.append('prompt', options.prompt);
      if (options?.response_format) formData.append('response_format', options.response_format);
      if (options?.temperature) formData.append('temperature', options.temperature.toString());

      const response = await api.post('/audio/transcriptions', formData);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const listTranscriptions = async (limit = 100, offset = 0) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/audio/transcriptions?limit=${limit}&offset=${offset}`);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    transcribeFile,
    listTranscriptions,
    loading,
    error,
  };
};
```

### Translation Hook

```typescript
// hooks/useTranslation.ts
import { useState } from 'react';
import api from '../lib/api';

interface TranslationOptions {
  prompt?: string;
  response_format?: string;
  temperature?: number;
}

export const useTranslation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const translateFile = async (file: File, options?: TranslationOptions) => {
    try {
      setLoading(true);
      setError(null);
      
      const formData = new FormData();
      formData.append('file', file);
      
      if (options?.prompt) formData.append('prompt', options.prompt);
      if (options?.response_format) formData.append('response_format', options.response_format);
      if (options?.temperature) formData.append('temperature', options.temperature.toString());

      const response = await api.post('/audio/translations', formData);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    translateFile,
    loading,
    error,
  };
};
```

## React Components

### File Upload Component

```typescript
// components/FileUpload.tsx
import { useState } from 'react';
import { useTranscription } from '../hooks/useTranscription';

export const FileUpload = () => {
  const { transcribeFile, loading, error } = useTranscription();
  const [result, setResult] = useState<string>('');

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const response = await transcribeFile(file, {
        language: 'en',
        response_format: 'json',
      });
      setResult(response.text);
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };

  return (
    <div className="p-4">
      <input
        type="file"
        accept="audio/*,video/*"
        onChange={handleUpload}
        disabled={loading}
        className="mb-4"
      />
      
      {loading && <p>Processing file...</p>}
      {error && <p className="text-red-500">{error}</p>}
      
      {result && (
        <div className="mt-4">
          <h3 className="font-bold">Transcription Result:</h3>
          <p className="whitespace-pre-wrap">{result}</p>
        </div>
      )}
    </div>
  );
};
```

### Transcription List Component

```typescript
// components/TranscriptionList.tsx
import { useEffect, useState } from 'react';
import { useTranscription } from '../hooks/useTranscription';

export const TranscriptionList = () => {
  const { listTranscriptions, loading, error } = useTranscription();
  const [transcriptions, setTranscriptions] = useState([]);

  useEffect(() => {
    loadTranscriptions();
  }, []);

  const loadTranscriptions = async () => {
    try {
      const data = await listTranscriptions();
      setTranscriptions(data);
    } catch (err) {
      console.error('Failed to load transcriptions:', err);
    }
  };

  const downloadTranscription = (text: string, filename: string) => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Your Transcriptions</h2>
      
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      
      <div className="grid gap-4">
        {transcriptions.map((trans) => (
          <div key={trans.file_name} className="border p-4 rounded">
            <h3 className="font-bold">{trans.file_name}</h3>
            <p className="text-sm text-gray-600">Language: {trans.language}</p>
            <button
              onClick={() => downloadTranscription(trans.text, trans.file_name)}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
            >
              Download
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
```

## Page Implementation

```typescript
// pages/index.tsx
import { FileUpload } from '../components/FileUpload';
import { TranscriptionList } from '../components/TranscriptionList';

export default function Home() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-8">Omniscribe Transcription Service</h1>
      
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4">Upload New File</h2>
        <FileUpload />
      </section>
      
      <section>
        <TranscriptionList />
      </section>
    </div>
  );
}
```

## Environment Setup

Create a `.env.local` file:

```plaintext
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

## Error Handling

Implement a reusable error handler:

```typescript
// utils/errorHandler.ts
export const handleApiError = (error: any) => {
  if (error.response) {
    // Server responded with error
    return error.response.data.error?.message || 'Server error';
  } else if (error.request) {
    // Request made but no response
    return 'No response from server';
  } else {
    // Request setup error
    return 'Failed to make request';
  }
};
```

## Best Practices

1. **File Validation**
```typescript
const validateFile = (file: File) => {
  const maxSize = 100 * 1024 * 1024; // 100MB
  const validTypes = ['audio/mpeg', 'audio/wav', 'video/mp4'];
  
  if (file.size > maxSize) {
    throw new Error('File too large');
  }
  
  if (!validTypes.includes(file.type)) {
    throw new Error('Unsupported file type');
  }
};
```

2. **Progress Tracking**
```typescript
const uploadWithProgress = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post('/audio/transcriptions', formData, {
    onUploadProgress: (progressEvent) => {
      const progress = (progressEvent.loaded / progressEvent.total) * 100;
      console.log(`Upload Progress: ${progress}%`);
    },
  });
  
  return response.data;
};
```

3. **Retry Logic**
```typescript
const retryRequest = async (fn: () => Promise<any>, retries = 3) => {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0 && error.response?.status >= 500) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return retryRequest(fn, retries - 1);
    }
    throw error;
  }
};
```

## Running the Application

1. Start the development server:
```bash
npm run dev
```

2. Build for production:
```bash
npm run build
npm start
```

## Support

For frontend-specific issues:
1. Check the browser console for errors
2. Verify API endpoint configuration
3. Check network requests in browser dev tools
4. Review component state and props
