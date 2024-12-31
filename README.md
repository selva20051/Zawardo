# StudyBuddy Learning Platform

An intelligent educational platform that combines classroom management, interactive learning, and AI-powered assistance.

## Getting Started

1. Download and extract the ML model:
   - Download [ModelB-0.1.0](https://drive.google.com/drive/folders/13fcNaZbPRmINb1D2p-nDHkK43sL16X8h?usp=sharing)
   - Place the ModelB-0.1.0 folder in the project root directory

## Project Architecture

The platform follows a microservices architecture with three main components:

### 1. Frontend (React + Vite)
- Modern UI built with React 18 and Vite
- Styling with Tailwind CSS
- Features:
  - Responsive and animated interface
  - Classroom management dashboard
  - Interactive quiz system
  - Real-time chat with AI assistant
  - Study group collaboration
  - Course content viewer

### 2. Backend (Node.js Microservices)
- Built with Node.js, Express, and TypeScript
- PostgreSQL database with Prisma ORM
- Features:
  - User authentication (Local + Google OAuth)
  - Classroom CRUD operations
  - Assignment management
  - Task tracking system
  - File upload/download
  - RESTful API endpoints

### 3. ML Model Component (Python)
- AI-powered learning assistant
- Features:
  - Natural language processing
  - Question-answering system
  - Content recommendations
  - Learning progress analysis
  - YouTube video integration
  - Dataset management for Q&A

## Tech Stack

### Frontend
- React 18
- Vite
- Tailwind CSS
- Framer Motion (animations)
- Axios (HTTP client)
- React Router DOM
- React Icons

### Backend
- Node.js
- Express
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT Authentication
- Passport.js
- Express Session

### ML Component
- Python
- Flask
- TensorFlow
- Transformers
- BERT
- YouTube API
- Scikit-learn

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/Zawardo.git
cd Zawardo
```

## Project Structure

```markdown
studybuddy/
├── Frontend/               # React frontend
├── nodejs-microservices/  # Node.js backend
└── ModelB-0.1.0/         # Python ML service
```