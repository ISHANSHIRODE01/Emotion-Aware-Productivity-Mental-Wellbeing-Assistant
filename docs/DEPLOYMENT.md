# Production Deployment Guide

## Environment Variables

Create a `.env` file in the root directory:

```env
# Backend Configuration
BACKEND_HOST=0.0.0.0
BACKEND_PORT=8000
LOG_LEVEL=INFO

# Database
DATABASE_PATH=data/wellbeing.db

# Model Configuration
TEXT_MODEL=j-hartmann/emotion-english-distilroberta-base
AUDIO_MODEL=superb/wav2vec2-base-superb-er
USE_TFLITE=true

# Security (for production)
ALLOWED_ORIGINS=http://localhost:5173,https://yourdomain.com
API_KEY_ENABLED=false
```

## Docker Deployment

### Build Docker Image
```bash
docker build -t emotion-wellbeing-assistant .
```

### Run with Docker Compose
```bash
docker-compose up -d
```

## Cloud Deployment Options

### Recommended: Split Deployment Strategy

Due to the heavy AI models (`torch`, `transformers`) required by the backend, we recommend a **Split Deployment Strategy**:

1.  **Frontend (React)**: Deploy to **Vercel** (Best for static sites/SPAs)
2.  **Backend (FastAPI)**: Deploy to **Render** or **Railway** (Best for Docker/Python containers)

#### 1. Frontend Deployment (Vercel)

1.  **Push Code to GitHub**: Ensure your project is in a GitHub repository.
2.  **Log in to Vercel**: Go to [vercel.com](https://vercel.com) and sign in with GitHub.
3.  **Import Project**:
    -   Click "Add New..." -> "Project"
    -   Select your repository
4.  **Configure Project**:
    -   **Root Directory**: Set to `frontend-react` (Click Edit next to Root Directory)
    -   **Framework Preset**: Select `Vite`
    -   **Build Command**: `vite build`
    -   **Output Directory**: `dist`
    -   **Environment Variables**:
        -   `VITE_BACKEND_URL`: `https://your-backend-url.onrender.com` (Add this *after* deploying the backend)
5.  **Deploy**: Click "Deploy". Your frontend is now live!

#### 2. Backend Deployment (Render.com)

1.  **Log in to Render**: Go to [render.com](https://render.com).
2.  **Create Web Service**:
    -   Click "New +" -> "Web Service".
    -   Connect your GitHub repository.
3.  **Configure Service**:
    -   **Root Directory**: `.` (Root)
    -   **Runtime**: `Python 3`
    -   **Build Command**: `pip install -r requirements.txt`
    -   **Start Command**: `uvicorn backend.api:app --host 0.0.0.0 --port $PORT`
4.  **Environment Variables**:
    -   `PYTHON_VERSION`: `3.9.13`
5.  **Deploy**: Click "Create Web Service".
    -   *Note*: The first build may take a few minutes as it installs heavy AI libraries.

#### 3. Connecting Them

1.  Copy the **Render Backend URL** (e.g., `https://wellbeing-api.onrender.com`).
2.  Go to your **Vercel Project Settings** -> **Environment Variables**.
3.  Add/Edit `VITE_BACKEND_URL` with the Render URL.
4.  Redeploy the Frontend (Go to Deployments -> Redeploy).

### Alternative: AWS EC2 (All-in-One)

If you prefer to control the infrastructure:

```bash
# Install dependencies
sudo apt update
sudo apt install python3-pip ffmpeg -y

# Clone and setup
git clone <repo-url>
cd Emotion-Aware-Productivity-Mental-Wellbeing-Assistant
pip3 install -r requirements.txt

# Run with systemd
sudo cp deploy/backend.service /etc/systemd/system/
sudo systemctl enable backend
sudo systemctl start backend
```

## Performance Optimization

### 1. Model Caching
Models are cached on first load. Ensure sufficient disk space (~2GB).

### 2. GPU Acceleration
For faster inference, install CUDA-enabled PyTorch:
```bash
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
```

### 3. Load Balancing
Use Nginx or similar for production traffic:
```nginx
upstream backend {
    server localhost:8000;
}

server {
    listen 80;
    server_name yourdomain.com;
    
    location / {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Monitoring

### Health Checks
```bash
# Backend health
curl http://localhost:8000/

# Expected: {"message": "Emotion-Wellbeing Assistant Backend is running"}
```

### Logs
```bash
# View backend logs
tail -f logs/backend.log

# View React logs (if using pm2 or similar)
tail -f logs/frontend.log
```

## Security Considerations

1. **API Rate Limiting**: Implement rate limiting for production
2. **HTTPS**: Always use HTTPS in production
3. **Input Validation**: All inputs are validated via Pydantic
4. **File Upload Limits**: Max 10MB per file
5. **CORS**: Configure allowed origins properly

## Backup & Recovery

### Database Backup
```bash
# Backup
cp data/wellbeing.db backups/wellbeing_$(date +%Y%m%d).db

# Restore
cp backups/wellbeing_20260216.db data/wellbeing.db
```

## Troubleshooting

### Common Issues

**1. FFmpeg not found**
```bash
# Windows
winget install Gyan.FFmpeg

# Linux
sudo apt install ffmpeg
```

**2. Model download fails**
- Check internet connection
- Verify HuggingFace is accessible
- Use mirror: `export HF_ENDPOINT=https://hf-mirror.com`

**3. Port already in use**
```bash
# Find process
lsof -i :8000

# Kill process
kill -9 <PID>
```

**4. Out of memory**
- Reduce batch size in model inference
- Use TFLite models (enabled by default)
- Increase system swap space
