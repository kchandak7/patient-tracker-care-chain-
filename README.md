<p align="center">
  <img src="https://img.shields.io/badge/MEDCARE-Healthcare%20Management-0066cc?style=for-the-badge&labelColor=1a2b4a" alt="MedCare" />
</p>

<h1 align="center">🏥 MedCare — Patient Tracker & Care Chain</h1>

<p align="center">
  A full-stack <strong>Healthcare Management System</strong> with role-based dashboards for <strong>Admins</strong>, <strong>Doctors</strong>, and <strong>Nurses</strong> — enabling seamless patient tracking, task assignment, appointment management, and prescription generation.
</p>

<p align="center">
  <a href="https://patient-tracker-care-chain.vercel.app"><img src="https://img.shields.io/badge/🌐 Live Demo-Vercel-000?style=for-the-badge&logo=vercel" /></a>
  <a href="https://patient-tracker-care-chain-production.up.railway.app"><img src="https://img.shields.io/badge/⚙️ API-Railway-0B0D0E?style=for-the-badge&logo=railway" /></a>
</p>

---

## 📸 Screenshots

| Admin Dashboard | Doctor Dashboard | Nurse Dashboard |
|:---:|:---:|:---:|
| ![Admin](https://img.shields.io/badge/Admin-Dashboard-1a2b4a?style=flat-square) | ![Doctor](https://img.shields.io/badge/Doctor-Dashboard-0066cc?style=flat-square) | ![Nurse](https://img.shields.io/badge/Nurse-Dashboard-2d8f4e?style=flat-square) |

### 📄 Prescription PDF Sample

The system generates downloadable PDF prescriptions for patients with doctor details, diagnosis, and medication info — powered by **jsPDF**.

<p align="center">
  <img src="./frontend/public/prescription-sample.png" alt="Prescription PDF" width="500" />
</p>

> *Place your prescription screenshot at `frontend/public/prescription-sample.png` to display it here.*

---

## 🚀 Live Deployment

| Service | URL |
|---------|-----|
| **Frontend** | [https://patient-tracker-care-chain.vercel.app](https://patient-tracker-care-chain.vercel.app) |
| **Backend API** | [https://patient-tracker-care-chain-production.up.railway.app](https://patient-tracker-care-chain-production.up.railway.app) |

### Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@hospital.com` | `Admin@123` |

> Doctors and Nurses are created by the Admin from the dashboard.

---

## ✨ Features

### 🔐 Authentication & Authorization
- JWT cookie-based authentication with role-based access control
- Secure cross-domain cookie handling (`sameSite: none`, `secure: true` in production)
- Auto-created default admin on first server boot
- Protected routes with middleware guards

### 👨‍💼 Admin Dashboard
- **Overview** — System-wide statistics (total doctors, nurses, patients)
- **Manage Doctors** — Create, view, and delete doctors with auto-generated credentials
- **Manage Nurses** — Create, view, and delete nurses with auto-generated credentials
- **Manage Patients** — Register patients with assigned doctor & appointment scheduling
- **Cascading Delete** — Deleting a patient also removes all associated tasks
- **Ghost Data Prevention** — Reassign patients/tasks when deleting a doctor
- **Delete Confirmations** — Safe deletion with confirmation dialogs
- **Credential Display** — Copy-to-clipboard for generated login credentials

### 🩺 Doctor Dashboard
- **Overview** — Patient count, task stats, today's appointments, donut charts
- **My Patients** — Full patient list with inline diagnosis editing, flagged patient alerts (🔴 glowing dot)
- **Tasks** — View and manage all tasks assigned to patients via nurses
- **Appointments** — Today's scheduled appointments with patient details
- **Prescription PDF** — Generate and download prescription PDFs (jsPDF)

### 👩‍⚕️ Nurse Dashboard
- **Overview** — Task statistics, status/type donut charts, upcoming tasks (top 3), assigned doctor info
- **My Tasks** — Full task list with status filter pills, task update modal with image upload (Cloudinary)
- **My Patients** — Patient cards with expandable per-patient tasks, **flag urgent patients** for doctor attention

### 🚩 Patient Flagging System
- Nurses can flag patients as urgent
- Doctors see a glowing red pulsing dot next to flagged patient names
- Real-time visual indicator across dashboard and patient list

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| **React 19** | UI library |
| **Vite 7** | Build tool & dev server |
| **Tailwind CSS 3** | Utility-first styling |
| **DaisyUI 5** | UI component library |
| **Zustand 5** | Lightweight state management |
| **React Router 7** | Client-side routing |
| **Axios** | HTTP client |
| **jsPDF** | Prescription PDF generation |
| **React Hot Toast** | Toast notifications |

### Backend
| Technology | Purpose |
|-----------|---------|
| **Node.js** | Runtime environment |
| **Express 5** | Web framework |
| **MongoDB** | NoSQL database |
| **Mongoose 9** | ODM for MongoDB |
| **JWT** | Authentication tokens |
| **bcryptjs** | Password hashing |
| **Cloudinary** | Image upload & storage |
| **cookie-parser** | Cookie handling |
| **CORS** | Cross-origin resource sharing |
| **dotenv** | Environment variable management |

### Deployment
| Service | Usage |
|---------|-------|
| **Vercel** | Frontend hosting |
| **Railway** | Backend hosting |
| **MongoDB Atlas** | Cloud database |
| **Cloudinary** | Media storage |

---

## 📁 Project Structure

```
Healthcare/
├── backend/
│   ├── package.json
│   └── src/
│       ├── server.js                  # Express entry point
│       ├── controllers/
│       │   ├── admin.controller.js    # Admin CRUD operations
│       │   ├── auth.controller.js     # Login / Logout
│       │   ├── doctor.controller.js   # Doctor endpoints
│       │   └── nurse.controller.js    # Nurse endpoints
│       ├── lib/
│       │   ├── createDefaultAdmin.js  # Auto-seed admin user
│       │   ├── db.js                  # MongoDB connection
│       │   ├── generator.js           # Credential generator
│       │   └── util.js                # JWT & cookie utilities
│       ├── middleware/
│       │   ├── admin.middleware.js     # Admin role guard
│       │   └── auth.middleware.js      # JWT verification
│       ├── models/
│       │   ├── Doctor.js
│       │   ├── Nurse.js
│       │   ├── Patient.js
│       │   ├── Task.js
│       │   └── User.js
│       └── routes/
│           ├── admin.route.js
│           ├── auth.route.js
│           ├── doctor.route.js
│           └── nurse.route.js
│
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vercel.json                    # Vercel SPA config
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx                    # Route definitions
│       ├── main.jsx                   # Entry point
│       ├── admin/
│       │   ├── components/            # Modals & reusable UI
│       │   ├── layout/                # Sidebar, Topbar, Layout
│       │   └── pages/
│       │       ├── AdminDashboard.jsx
│       │       ├── AdminDoctors.jsx
│       │       ├── AdminNurses.jsx
│       │       └── AdminPatients.jsx
│       ├── doctor/
│       │   ├── components/            # Prescription modal, etc.
│       │   ├── layout/
│       │   └── pages/
│       │       ├── DoctorDashboard.jsx
│       │       ├── DoctorPatients.jsx
│       │       ├── DoctorTasks.jsx
│       │       └── DoctorAppointments.jsx
│       ├── nurse/
│       │   ├── components/            # Task modals, badges
│       │   ├── layout/
│       │   └── pages/
│       │       ├── NurseDashboard.jsx
│       │       ├── NurseTasks.jsx
│       │       └── NursePatients.jsx
│       ├── components/                # Shared (LoadingSpinner)
│       ├── pages/                     # LoginPage, LandingPage
│       ├── store/                     # Zustand stores
│       └── lib/                       # Utility helpers
│
├── package.json                       # Root build scripts
└── README.md
```

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)

```env
PORT=3000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/<db>
JWT_SECRET=your_jwt_secret
NODE_ENV=production
CLIENT_URL=https://your-frontend-url.vercel.app

ADMIN_NAME=System Admin
ADMIN_EMAIL=admin@hospital.com
ADMIN_PASSWORD=Admin@123

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=https://your-backend-url.up.railway.app/api
```

---

## 🏃‍♂️ Getting Started (Local Development)

### Prerequisites
- Node.js ≥ 20
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account

### 1. Clone the repository

```bash
git clone https://github.com/your-username/patient-tracker-care-chain.git
cd patient-tracker-care-chain
```

### 2. Setup Backend

```bash
cd backend
npm install
```

Create `backend/.env` with the variables listed above, then:

```bash
npm run dev
```

Backend runs at `http://localhost:3000`

### 3. Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`

---

## 🚢 Deployment Guide

### Backend → Railway

1. Push code to GitHub
2. Create a new project on [Railway](https://railway.com)
3. Connect your GitHub repo
4. Set **Root Directory** to `/backend`
5. Add all environment variables from the backend `.env`
6. Set `NODE_ENV=production` and `CLIENT_URL` to your Vercel URL
7. Deploy — Railway auto-detects `npm start`

### Frontend → Vercel

1. Import your GitHub repo on [Vercel](https://vercel.com)
2. Set **Root Directory** to `frontend`
3. Set **Build Command** to `npm run build`
4. Set **Output Directory** to `dist`
5. Add environment variable: `VITE_API_URL=https://your-backend.up.railway.app/api`
6. Deploy

---

## 📝 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login with email & password |
| POST | `/api/auth/logout` | Logout (clear cookie) |
| GET | `/api/auth/me` | Get current user |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/getAllDoctors` | List all doctors |
| POST | `/api/admin/createDoctor` | Create a doctor |
| DELETE | `/api/admin/deleteDoctor/:id` | Delete a doctor |
| GET | `/api/admin/getAllNurses` | List all nurses |
| POST | `/api/admin/createNurse` | Create a nurse |
| DELETE | `/api/admin/deleteNurse/:id` | Delete a nurse |
| GET | `/api/admin/getAllPatients` | List all patients |
| POST | `/api/admin/createPatient` | Register a patient |
| DELETE | `/api/admin/deletePatient/:id` | Delete a patient |

### Doctor
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/doctor/profile` | Get doctor profile |
| GET | `/api/doctor/patients` | Get assigned patients |
| GET | `/api/doctor/tasks` | Get all tasks |
| GET | `/api/doctor/appointments` | Today's appointments |
| GET | `/api/doctor/nurses` | Get nurses for doctor |
| PUT | `/api/doctor/patients/:id/diagnosis` | Update diagnosis |
| POST | `/api/doctor/patients/:id/prescription` | Save prescription |

### Nurse
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/nurse/profile` | Get nurse profile |
| GET | `/api/nurse/tasks` | Get assigned tasks |
| GET | `/api/nurse/patients` | Get assigned patients |
| POST | `/api/nurse/tasks/:id` | Update task status |
| PUT | `/api/nurse/patients/:id/flag` | Toggle patient flag |

---

## 🎨 Design System

| Element | Color | Usage |
|---------|-------|-------|
| `#1a2b4a` | Dark Navy | Sidebar, headers, primary bg |
| `#0066cc` | Primary Blue | Buttons, links, accents |
| `#f0f4f8` | Light Gray | Page backgrounds |
| `#2d8f4e` | Green | Success states, online badges |
| `#dc2626` | Red | Alerts, flagged patients, delete |
| `#f59e0b` | Amber | Warning, pending states |

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">
  Built with ❤️ using React, Express & MongoDB
</p>
