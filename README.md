<div align="center">
  
# 🎓 Text2Learn

**An AI-Powered Platform that transforms any topic into a structured, personalized, and interactive course in seconds.**

[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Gemini](https://img.shields.io/badge/Google_Gemini-API-orange.svg)](https://deepmind.google/technologies/gemini/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-1B222D.svg)](https://www.prisma.io/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC.svg)](https://tailwindcss.com/)

</div>

---

## 📌 Overview

**Text2Learn** is a production-grade AI generation pipeline designed for personalized education. Simply input a topic, and the system intelligently curates a complete learning path with modules, structured lessons, YouTube video integrations, and interactive quizzes. 

Built with a focus on **reliability, quality, and scalability**, the platform features a stunning **premium glassmorphic dark UI**, Google Authentication, and a highly resilient background processing architecture.

---

## ✨ Key Features

- 🧠 **Instant Course Generation:** Enter any topic, and the AI generates a complete structured curriculum.
- 📺 **Curated YouTube Videos:** Each lesson automatically embeds highly relevant educational videos via the YouTube Data API.
- 📝 **Interactive Quizzes (MCQs):** Test your knowledge at the end of each module with auto-generated quizzes and instant feedback.
- 🎨 **Premium UI/UX:** A stunning, responsive dark theme featuring glassmorphism, gradient accents, and micro-animations.
- 🔐 **Authentication:** Secure Email/Password login and **1-Click Google Authentication**.
- 📤 **Course Sharing:** Generate public links to share your custom courses with anyone (no login required to view).
- ⚙️ **Robust Backend:** BullMQ-powered asynchronous job processing ensures reliable generation even if the AI API is slow.
- 💾 **State Persistence:** All your courses are saved to your dashboard for future revision.

---

## 🏗️ System Architecture

Text2Learn is built using a **Clean Architecture** approach, ensuring separation of concerns and high scalability.

### End-to-End Flow

1. **User Request:** The client sends a topic prompt to the Express.js API.
2. **Job Queue:** The API immediately responds with a `jobId` and pushes the generation task to a Redis-backed **BullMQ** queue.
3. **Background Worker:** 
   - A worker picks up the job.
   - It constructs a highly structured prompt.
   - It calls the **Google Gemini API** to generate the course structure, text, and quizzes.
   - It calls the **YouTube Data API** to find relevant videos for the generated topics.
4. **Validation & Storage:** The generated JSON is validated. If successful, it is persisted to **PostgreSQL** (via Prisma) and marked as complete.
5. **Client Polling:** The React frontend polls the job status and redirects to the newly generated course upon completion.

---

## 💻 Tech Stack

### Frontend
- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS** (Customized with a premium dark theme and glassmorphism)
- **Lucide React** (Beautiful iconography)
- **React Router v6** (Client-side routing)
- **@react-oauth/google** (Custom Google OAuth integration)

### Backend
- **Node.js** + **Express.js** + **TypeScript**
- **PostgreSQL** + **Prisma ORM** (Relational data storage)
- **Redis** + **BullMQ** (Async job queue processing)
- **Google Gemini API** (LLM content generation)
- **YouTube Data API v3** (Video curation)
- **JWT** (JSON Web Tokens) & **Bcrypt** (Authentication)

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v18 or higher)
- [PostgreSQL](https://www.postgresql.org/)
- [Redis](https://redis.io/)
- Google Gemini API Key
- YouTube Data API v3 Key
- Google OAuth Client ID (for Google Login)

### 1. Clone the repository

```bash
git clone https://github.com/kiyansh13karan/Text2Learn.git
cd Text2Learn
```

### 2. Setup the Backend

```bash
cd server
npm install

# Copy the environment template
cp .env.example .env
```

**Configure `server/.env`:**
```env
DATABASE_URL="postgresql://user:password@localhost:5432/text2learn"
JWT_SECRET="your-super-secure-secret-key"
JWT_EXPIRES_IN="7d"
GEMINI_API_KEY="your-gemini-key"
YOUTUBE_API_KEY="your-youtube-key"
GOOGLE_CLIENT_ID="your-google-oauth-client-id"
REDIS_URL="redis://localhost:6379"
PORT=5000
NODE_ENV="development"
CLIENT_URL="http://localhost:5173"
```

**Initialize Database & Start Server:**
```bash
npx prisma generate
npx prisma db push
npm run dev
```

### 3. Setup the Frontend

```bash
# In a new terminal window
cd client
npm install

# Copy the environment template
cp .env.example .env
```

**Configure `client/.env`:**
```env
VITE_API_URL="http://localhost:5000/api"
VITE_GOOGLE_CLIENT_ID="your-google-oauth-client-id"
```

**Start the Client:**
```bash
npm run dev
```

The application will be running at `http://localhost:5173`.

---

## 📚 API Endpoints

### Auth
- `POST /api/auth/signup` - Register with email/password
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/google` - Login/Signup via Google OAuth

### Course Generation
- `POST /api/generate/course` - Queue a new course generation job
- `GET /api/job/:jobId` - Check the status of a generation job

### Course Management
- `GET /api/courses` - Fetch all saved courses for the authenticated user
- `GET /api/courses/:id` - Fetch a specific course by ID
- `DELETE /api/courses/:id` - Delete a course
- `POST /api/courses/:id/share` - Generate a public share link
- `GET /api/courses/share/:shareId` - Access a publicly shared course (no auth required)

---

## 👨‍💻 Author

**Karan Nayal**

---

<div align="center">
  Made with ❤️ using React, Node.js, and AI.
</div>
