# 🏥 NEXUS Hospital Management System (HMS)

A futuristic, high-performance Hospital Management System with a sleek glassmorphic UI, dark/light mode, and real-time operational capabilities.

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green?logo=fastapi)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue?logo=postgresql)
![Vercel](https://img.shields.io/badge/Vercel-Deployed-success?logo=vercel)

## ✨ Features

### 🎨 Modern UI/UX

- **Glassmorphism Design**: Futuristic translucent panels with blur effects
- **Dark/Light Mode**: Seamless theme switching with persistent preferences
- **Neon Accents**: Cyan (#00F0FF) and Purple (#7000FF) color scheme
- **Responsive Design**: Works flawlessly on desktop, tablet, and mobile

### Core Modules

- **Dashboard**: Real-time hospital metrics with interactive charts
- **Staff Management**: Complete staff directory and profiles
- **Shift Scheduling**: Automated shift assignment and calendar view
- **Attendance Tracking**: Clock-in/out system with analytics
- **Leave Requests**: Digital leave management system
- **Payroll System**: Automated salary calculation with PDF generation
- **Reports**: Comprehensive hospital analytics and reporting

### 🔐 Security

- JWT-based authentication
- Role-based access control (Admin, HR, Staff)
- Secure password hashing (bcrypt)
- Protected API routes

### ⚡ Performance

- **Dynamic Imports**: Code splitting for faster initial load
- **Database Indexing**: Optimized PostgreSQL queries
- **Static Generation**: Next.js ISR for instant page loads
- **Async Operations**: Non-blocking database operations

## 🚀 Live Demo

**Frontend:** https://hospital-management-system-iota-beige.vercel.app  
**Backend API:** https://nexus-hms-backend.onrender.com/docs

## 🛠️ Tech Stack

### Frontend

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **UI Components:** Custom glassmorphic components
- **Charts:** Recharts
- **HTTP Client:** Axios
- **Icons:** Lucide React

### Backend

- **Framework:** FastAPI
- **Language:** Python 3.14
- **Database:** PostgreSQL
- **ORM:** SQLAlchemy (Async)
- **Authentication:** JWT (python-jose)
- **Validation:** Pydantic

### DevOps & Deployment

- **Frontend Hosting:** Vercel
- **Backend Hosting:** Render
- **Database:** Render PostgreSQL
- **Version Control:** Git & GitHub

## 📦 Installation & Setup

### Prerequisites

- Node.js 18+ and npm
- Python 3.14+
- PostgreSQL 15+

### Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env with your database credentials

# Run database migrations
python create_tables.py

# Start server
uvicorn app.main:app --reload
```
