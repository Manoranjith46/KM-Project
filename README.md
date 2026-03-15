<div align="center">

# 🏠 ResidentHub — PG & Hostel Management System

### A modern, full-stack property management platform built for PG owners and their residents.

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-5-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-9-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-Realtime-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io/)

<br />

<img src="https://img.shields.io/badge/status-Production_Ready-brightgreen?style=flat-square" />
<img src="https://img.shields.io/badge/license-Private-red?style=flat-square" />
<img src="https://img.shields.io/badge/deployed_on-Vercel-black?style=flat-square&logo=vercel" />

</div>

---

<br />

## 🧭 Overview

**ResidentHub** is a comprehensive PG/Hostel management system that bridges the gap between property owners and residents. It provides a powerful **Admin Portal** for managing day-to-day operations and a sleek **Resident Portal** for tenants to interact with their hostel digitally — from toggling meals to paying rent.

Built on the **MERN stack** with real-time capabilities, it handles everything from payment verification to kitchen menu management, all wrapped in a glassmorphic dark/light UI.

<br />

## ✨ Features

### 🔐 Authentication & Security
- **Dual JWT tokens** — short-lived access + long-lived refresh tokens in HttpOnly secure cookies
- **Automatic session refresh** — seamless token rotation via Axios interceptors
- **Role-based access control** — Owner, Admin, Resident, and Guest roles
- **NoSQL injection protection** — custom sanitizer middleware
- **Rate limiting** — global + strict auth-specific limits
- **Helmet** security headers & CORS whitelisting

### 👑 Admin Portal
| Feature | Description |
|---------|-------------|
| **Dashboard** | Revenue overview, occupancy rates, pending actions at a glance |
| **Resident Management** | Add, view, edit, and remove residents with ID document uploads |
| **Payment Hub** | Record cash payments, verify online submissions, track dues |
| **Kitchen Manager** | Build weekly menus (breakfast, lunch, dinner) and view participation stats |
| **Maintenance Tracker** | Monitor issue reports with status workflow (Pending → In Progress → Resolved) |
| **Announcements** | Publish notices (urgent, info, rule, general) to the resident notice board |
| **Settings** | Profile management, property configuration, room/rate setup, photo upload |
| **PDF Export** | Export data tables to downloadable PDF reports |

### 🏡 Resident Portal
| Feature | Description |
|---------|-------------|
| **Dashboard** | Room info, hostel status, gate pass QR code |
| **Meal Toggle** | Opt in/out of breakfast, lunch, and dinner with cut-off enforcement |
| **Finance View** | Total spendings, current dues, submit online payment with proof |
| **Report Issues** | File maintenance requests with photo attachments |
| **Notice Board** | View active announcements from administration |

### ⚡ Real-Time & Automation
- **Socket.IO** — live updates pushed to connected clients
- **Cron Jobs** — automatic monthly rent reset on the last day of each month
- **GridFS** — file storage for documents and images directly in MongoDB

<br />

## 🛠️ Tech Stack

<table>
<tr>
<td align="center" width="50%">

### Frontend

| Technology | Purpose |
|:----------:|---------|
| **React 19** | UI framework with React Compiler |
| **Vite 7** | Lightning-fast build tooling |
| **React Router 7** | Client-side routing |
| **Axios** | HTTP client with interceptors |
| **Socket.IO Client** | Real-time communication |
| **CSS Modules** | Scoped component styles |
| **Lucide React** | Icon library |
| **jsPDF** | PDF generation |
| **html5-qrcode** | QR code scanning |
| **react-easy-crop** | Image cropping |

</td>
<td align="center" width="50%">

### Backend

| Technology | Purpose |
|:----------:|---------|
| **Node.js** | Runtime environment |
| **Express 5** | Web framework |
| **MongoDB + Mongoose 9** | Database & ODM |
| **JWT** | Authentication tokens |
| **bcryptjs** | Password hashing |
| **Socket.IO** | WebSocket server |
| **Multer + GridFS** | File upload & storage |
| **node-cron** | Scheduled tasks |
| **Helmet** | Security headers |
| **express-rate-limit** | API rate limiting |

</td>
</tr>
</table>

<br />

## 📁 Project Structure

```
KM/
├── client/                         # React Frontend
│   ├── src/
│   │   ├── API/                    # Axios instance & interceptors
│   │   ├── Context/                # Auth & Theme providers
│   │   ├── Components/             # Shared components (ProtectedRoute, FormError, etc.)
│   │   ├── hooks/                  # Custom hooks (useSocket, useFormValidation)
│   │   ├── utils/                  # Validators & utilities
│   │   └── Pages/
│   │       ├── Login/              # Authentication page
│   │       ├── Admin/              # Admin portal (Dashboard, Residents, Payments, Kitchen, etc.)
│   │       └── Resident/           # Resident portal (Dashboard, Finance, Reports, Notices)
│   ├── vite.config.js
│   └── vercel.json                 # Vercel SPA deployment config
│
└── server/                         # Express Backend
    ├── server.js                   # Entry point
    ├── socket.js                   # Socket.IO setup
    ├── config/                     # DB connection & GridFS config
    ├── middleware/                  # Auth, sanitizer, upload middleware
    ├── models/                     # Mongoose schemas (User, Resident, Payment, Kitchen, etc.)
    ├── controllers/                # Route handlers (auth, admin, resident, payment, food, etc.)
    ├── routes/                     # Express route definitions
    ├── cron/                       # Scheduled jobs (monthly rent reset)
    └── Security/                   # Bcrypt utilities
```

<br />

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+
- **MongoDB** instance (local or Atlas)
- **npm** or **yarn**

### 1. Clone the repository

```bash
git clone https://github.com/your-username/KM.git
cd KM
```

### 2. Setup the Server

```bash
cd server
npm install
```

Create a `.env` file in `server/`:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://your-connection-string
JWT_SECRET=your_jwt_secret
REFRESH_SECRET=your_refresh_secret
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d
FRONTEND_URL=http://localhost:5173
RATE_LIMIT_WINDOW=60000
RATE_LIMIT_MAX=10
```

Start the server:

```bash
npm run dev        # Development (with hot-reload)
npm start          # Production
```

### 3. Setup the Client

```bash
cd client
npm install
```

Create a `.env` file in `client/`:

```env
VITE_API_URL=http://localhost:5000/
```

Start the client:

```bash
npm run dev        # Development server on port 5173
npm run build      # Production build
npm run preview    # Preview production build
```

<br />

## 🎨 Design System

The UI follows an **Emerald Glassmorphism** design language:

- **Dark/Light theme** toggle — persisted in localStorage
- **Mobile-first** responsive design with Hub & Spoke navigation model
- **Glass-morphic cards** with backdrop blur and subtle borders
- **Skeleton loaders** for smooth loading states
- **CSS Modules** for zero-conflict scoped styling

<br />

## 🔒 Security Highlights

| Layer | Implementation |
|-------|---------------|
| **Authentication** | HttpOnly + Secure + SameSite cookies with dual JWT rotation |
| **Authorization** | Middleware-enforced role-based access (Owner / Admin / Resident / Guest) |
| **Input Sanitization** | Custom NoSQL injection prevention stripping `$` and `.` operators |
| **Rate Limiting** | Global rate limits + stricter auth endpoint throttling |
| **File Uploads** | 5MB cap, type validation (JPG, PNG, SVG, PDF only) |
| **Passwords** | bcrypt hashing with salt rounds |
| **HTTP Headers** | Helmet.js for XSS, content-type sniffing, and other protections |

<br />

## 📡 API Architecture

The backend follows a clean **MVC pattern**:

```
Request → Route → Middleware (Auth + Sanitization) → Controller → Model → Response
```

**Core API Routes:**

| Route | Purpose |
|-------|---------|
| `/api/auth/*` | Login, logout, token refresh, session info |
| `/api/admin/*` | Dashboard stats, revenue, occupancy data |
| `/api/residents/*` | CRUD operations, announcements, gate pass, reports |
| `/api/payments/*` | Payment recording, verification, dues tracking |
| `/api/food/*` | Meal status, toggle preferences, daily reports |
| `/api/kitchen/*` | Menu management, participation statistics |
| `/api/settings/*` | Profile, property, password, room/rate config |
| `/api/upload/*` | File upload & retrieval via GridFS |

<br />

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

<br />

---

<div align="center">

**Built with ❤️ using the MERN Stack**

<sub>MongoDB · Express · React · Node.js</sub>

</div>
