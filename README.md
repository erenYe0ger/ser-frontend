# ser-frontend

Modern React frontend for a Speech Emotion Recognition (SER) system, built as a portfolio project demonstrating production-oriented frontend engineering practices.

## Live Demo

https://ser-frontend-eight.vercel.app

---

## Features

* Audio file upload with format validation
* Real-time emotion prediction with confidence percentage
* Confidence bar visualization for all 8 emotions
* Cache/model source badge showing where the prediction originated
* Prediction history loaded on demand

---

## Tech Stack

| Technology | Purpose                                   |
| ---------- | ----------------------------------------- |
| React      | UI framework                              |
| Vite       | Fast development tooling and build system |
| Axios      | HTTP client for backend communication     |
| Vercel     | Frontend hosting and deployment           |

---

## How It Works

1. User uploads an audio file through the web interface.
2. Frontend sends a multipart/form-data POST request to the FastAPI backend.
3. Backend processes the audio and returns:

   * Predicted emotion
   * Confidence score
   * Probability distribution across all emotions
   * Cache/model source indicator
4. Frontend renders:

   * Primary predicted emotion
   * Confidence percentage
   * Emotion probability bars
   * Cache/model badge
5. The History section fetches previous predictions from the backend using a dedicated API endpoint.

---

## Local Development

### Clone Repository

```bash
git clone https://github.com/erenYe0ger/ser-frontend.git
cd ser-frontend
```

### Create .env

```env
VITE_API_URL=http://localhost:8000
```

### Install Dependencies

```bash
npm install
```

### Start Development Server

```bash
npm run dev
```

Application will be available at:

```text
http://localhost:5173
```

---

## Environment Variables

| Variable     | Description                         |
| ------------ | ----------------------------------- |
| VITE_API_URL | Base URL of the FastAPI backend API |

---

## Related Repos

### ser-backend

Production-grade FastAPI backend providing:

* Speech emotion inference orchestration
* Redis caching
* PostgreSQL persistence
* HuggingFace Spaces integration
* REST API endpoints

Repository:

https://github.com/erenYe0ger/ser-backend
