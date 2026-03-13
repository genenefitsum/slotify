# 🚀 Slotify

**Slotify** is a multi-vendor booking marketplace built with **React** and **Node.js** that allows customers to discover, compare, and book service providers seamlessly.

Vendors can manage services, availability, and bookings through a dedicated dashboard, while admins oversee the entire platform.

Slotify is designed with **scalability**, **clean architecture**, and **real-world SaaS principles** in mind.

---

## 🌍 Vision

Slotify aims to simplify appointment scheduling in Ethiopia by providing a centralized marketplace where customers can book trusted professionals efficiently while vendors manage their business digitally.

---

## 🧠 Core Features

### 👤 Authentication & Authorization
- JWT-based authentication
- Role-based access control (**Customer**, **Vendor**, **Admin**)
- Secure password hashing
- Protected routes

### 🔎 Marketplace
- Vendor listing page
- Search & filter functionality
- Vendor profile pages
- Service display

### 📅 Booking System
- Dynamic time slot generation
- Conflict prevention (no double bookings)
- Booking status management (**Pending**, **Confirmed**, **Cancelled**, **Completed**)
- Booking history

### 🧑‍💼 Vendor Dashboard
- Add / edit / delete services
- Manage availability schedule
- View and manage bookings
- Basic earnings overview

### 🛠 Admin Dashboard
- Manage vendors and users
- Approve or suspend vendors
- Monitor bookings
- Platform analytics overview

---

## 🏗 Tech Stack

### Frontend
- React
- Tailwind CSS
- Axios
- React Router

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT Authentication
- Bcrypt
- Cloudinary for vendor image hosting

---

## 📁 Project Structure

```bash
slotify/
│
├── frontend/      # React + Vite frontend app
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/       # Node.js + Express backend API
│   ├── src/
│   │   └── server.js
│   └── package.json
│
└── README.md
```

---

## 🎯 MVP Scope

- User authentication
- Vendor profile management
- Service management
- Availability scheduling
- Appointment booking with conflict prevention
- Basic dashboards

### Future Phases
- Online payments
- Reviews & ratings
- Email notifications
- Advanced analytics
- SMS reminders

---

## 🔐 Security Considerations

- Password hashing using bcrypt
- JWT access tokens
- Role-based middleware
- Input validation
- Proper error handling
- Rate limiting (planned)

---

## 🧪 Local Seed Data

To quickly test authentication roles and vendor discovery/detail flows with realistic data:

```bash
cd backend
npm run seed:local
```

This command inserts or refreshes deterministic local fixtures for:
- Users (admin, customer, vendor owners)
- Vendors (active and non-active)
- Services (for active vendors)
- Reviews (for active vendors)

Default local test credentials:
- `admin@slotify.local` / `SlotifyPass123!`
- `customer@slotify.local` / `SlotifyPass123!`
- `owner.one@slotify.local` / `SlotifyPass123!`
- `owner.two@slotify.local` / `SlotifyPass123!`

## Image Storage

Vendor images support two storage modes:

- Default fallback: stored in MongoDB and returned as inline data URLs.
- Recommended deployment mode: uploaded to Cloudinary and returned as hosted URLs.

To enable Cloudinary in `backend/.env`:

```bash
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CLOUDINARY_VENDOR_FOLDER=slotify/vendors
```

---

