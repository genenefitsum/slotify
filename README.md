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

---

## 📁 Proposed Architecture

```bash
slotify/
│
├── client/        # React frontend
├── server/        # Express backend
├── models/        # Database schemas
├── routes/        # API routes
├── controllers/   # Business logic
├── middleware/    # Auth & validation
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

