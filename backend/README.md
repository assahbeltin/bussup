# BusUp Ticket Reservation Backend Service

Production-ready Node.js TypeScript Express backend for the **Assah Beltine / BusUp Ticket Reservation System**.

## Features

- 🔐 **Authentication & Authorization**: Passenger registration, JWT authentication for Passengers & Admins, password hashing with bcrypt, protected route middleware.
- 🏙️ **Cities & Terminals**: Query Cameroon regions, cities, and bus station terminals (Douala, Yaoundé, Bafoussam, Kribi, Garoua, Maroua, etc.).
- 🚌 **Trip & Route Search**: Filter trips by departure city, destination city, and journey shift (Morning/Afternoon/Night).
- 💺 **Interactive Seat Availability**: Seat status mapping (80 seats total per bus) with real-time pre-booking detection and conflict prevention.
- 🎟️ **Ticket Reservation Engine**: Multi-passenger ticket generation (`#TRV-XXXXX`), QR payload creation, user booking history, and ticket cancellation.
- 💳 **Payment Gateway Integration**: Simulates Mobile Money (MTN MoMo, Orange Money), Credit/Debit Cards, and Pay-on-Board processing.
- 🛡️ **Admin Portal Services**: Fleet management (add/update buses, maintenance status), real-time KPI metrics (revenue, active bookings, fleet count), and central reservation management.

---

## Getting Started

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env` or customize environment variables:
```ini
PORT=5000
NODE_ENV=development
JWT_SECRET=busup_super_secret_jwt_key_2026_cameroon
JWT_EXPIRES_IN=7d
CORS_ORIGIN=*
```

### 3. Development Server
Start the development server with live reload:
```bash
npm run dev
```

### 4. Production Build & Start
Compile TypeScript and run compiled JS:
```bash
npm run build
npm run start
```

---

## Seed Accounts for Testing

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@busup.com` | `admin123` |
| **Passenger** | `jean@example.com` | `password123` |
| **Passenger** | `marie@example.com` | `password123` |

---

## API Endpoints Summary

Base URL: `http://localhost:5000/api/v1`

### Authentication (`/auth`)
- `POST /auth/register` - Passenger registration
- `POST /auth/login` - Passenger or Admin login
- `GET /auth/me` - Fetch authenticated user profile *(Requires JWT)*

### Cities & Locations (`/cities`)
- `GET /cities` - Get available cities and bus terminals

### Trips & Search (`/trips`)
- `GET /trips/search?from=Douala&to=Yaoundé&journeyShift=Morning` - Search trips
- `GET /trips/:id` - Fetch single trip details
- `GET /trips/:id/seats?date=Today` - Fetch seat layout & availability

### Bookings (`/bookings`) *(Requires JWT)*
- `POST /bookings` - Reserve seats and create ticket
- `GET /bookings/my-bookings` - Fetch current user's booking history
- `GET /bookings/:id` - Get ticket details & QR payload
- `POST /bookings/:id/cancel` - Cancel a booking

### Payments (`/payments`)
- `POST /payments/process` - Process payment transaction

### Admin Portal (`/admin`) *(Requires Admin JWT)*
- `GET /admin/dashboard` - Overview KPIs (Revenue, active bookings, fleet count)
- `GET /admin/fleet` - List all buses in fleet
- `POST /admin/fleet` - Add bus to fleet
- `PATCH /admin/fleet/:id/status` - Update bus status (`Available`, `On Route`, `Maintenance`)
- `GET /admin/bookings` - View all reservations across the system
- `PATCH /admin/bookings/:id/status` - Update booking status (`Confirmed`, `Processing`, `Completed`, `Cancelled`)
