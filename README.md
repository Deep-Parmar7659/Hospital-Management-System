# 🏥 NEXUS Hospital Management System (HMS)

A futuristic, high-performance, and fully responsive Hospital Management System built with Next.js and FastAPI. Features a sleek glassmorphic UI, role-based access control, real-time analytics, and automated payroll processing.

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green?logo=fastapi)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue?logo=postgresql)
![Vercel](https://img.shields.io/badge/Vercel-Deployed-success?logo=vercel)

## ✨ Features

### 🎨 Modern UI/UX

- **Glassmorphism Design**: Futuristic translucent panels with backdrop blur effects.
- **Dark/Light Mode**: Seamless theme switching with persistent user preferences.
- **Neon Accents**: Custom cyan and purple color scheme for a modern tech feel.
- **Fully Responsive**: Optimized for desktop, tablet, and mobile devices with a collapsible sidebar.

### 🏥 Core Modules

- **Dashboard**: Real-time hospital metrics with interactive Recharts (Area, Bar, Pie, Radar).
- **Staff Management**: Complete CRUD operations for hospital personnel, departments, and designations.
- **Attendance Tracking**: Real-time clock-in/clock-out system with late-arrival detection.
- **Leave Management**: Digital leave request workflow with Admin/HR approval/rejection capabilities.
- **Payroll System**: Automated salary calculation (base + overtime - deductions) with **PDF payslip generation** (via jsPDF).
- **Reports & Analytics**: High-level operational intelligence, department-wise expenditure, and attendance trends.

### 🔐 Security & Access

- JWT-based stateless authentication.
- Role-Based Access Control (RBAC): Admin, HR, and Staff permissions.
- Secure password hashing (bcrypt).
- Protected API routes and frontend middleware.

### ⚡ Performance

- **Code Splitting**: Dynamic imports for faster initial page loads.
- **Async Database Ops**: Non-blocking SQLAlchemy async queries.
- **Optimized Rendering**: Next.js App Router with efficient client/server component separation.

---

## 🚀 Live Demo

- **Frontend Application**: [https://hospital-management-system-86w8wo19h-deep-parmar7659s-projects.vercel.app](https://hospital-management-system-86w8wo19h-deep-parmar7659s-projects.vercel.app)
- **Backend API Docs**: [https://nexus-hms-backend.onrender.com/docs](https://nexus-hms-backend.onrender.com/docs)

_(Note: Frontend URL may update with new deployments. Check Vercel for the latest production link.)_

---

## 🛠️ Tech Stack

### Frontend

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Charts:** Recharts
- **PDF Generation:** jsPDF
- **HTTP Client:** Axios
- **Icons:** Lucide React

### Backend

- **Framework:** FastAPI
- **Language:** Python 3.14
- **Database:** PostgreSQL
- **ORM:** SQLAlchemy (Async)
- **Authentication:** JWT (`python-jose`)
- **Validation:** Pydantic v2

### DevOps & Deployment

- **Frontend Hosting:** Vercel (Auto-deploy on `main` branch push)
- **Backend Hosting:** Render
- **Database:** Render PostgreSQL
- **Version Control:** Git & GitHub

---

## 📦 Installation & Setup

### Prerequisites

- Node.js 18+ and npm
- Python 3.10+ (Project developed on 3.14)
- PostgreSQL 15+ (Local or Cloud)

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env with your DATABASE_URL, SECRET_KEY, etc.

# Run database migrations (create tables)
python create_tables.py

# Start the development server
uvicorn app.main:app --reload
```

### 2. Frontend Setup

# Navigate to frontend directory

cd frontend

# Install dependencies

npm install

# Configure environment variables

cp .env.example .env.local

# Edit .env.local with your NEXT_PUBLIC_API_URL

# Start the development server

npm run dev
