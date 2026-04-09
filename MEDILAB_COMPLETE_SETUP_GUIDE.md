# MediLab Complete Setup Guide

**Author:** Lakni (IT23772922)  
**Version:** 1.0  
**Last Updated:** April 2026

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Prerequisites](#prerequisites)
3. [Project Structure](#project-structure)
4. [Backend Setup](#backend-setup)
5. [Frontend Setup](#frontend-setup)
6. [Database Setup](#database-setup)
7. [Environment Configuration](#environment-configuration)
8. [Running the Application](#running-the-application)
9. [Testing](#testing)
10. [Troubleshooting](#troubleshooting)
11. [Documentation Resources](#documentation-resources)

---

## Project Overview

**MediLab** is a comprehensive healthcare management system with:

- **Backend:** Node.js Express server with MongoDB database
- **Frontend:** React 18 with React Router v7 and Tailwind CSS
- **Authentication:** JWT-based with role-based access control (RBAC)
- **Modules:** Auth, Patient, Booking, Lab, Finance, Consultation, Inventory

### Key Features

- ✅ Patient registration and login
- ✅ Healthcare provider accounts
- ✅ Comprehensive health profile management
- ✅ Appointment booking system
- ✅ AI-powered medical consultation
- ✅ Lab test management
- ✅ Finance and payment tracking
- ✅ Multi-language support
- ✅ Responsive design

---

## Prerequisites

### System Requirements

| Requirement      | Minimum                                   | Recommended                             |
| ---------------- | ----------------------------------------- | --------------------------------------- |
| Operating System | Windows 7+ / macOS 10.12+ / Ubuntu 16.04+ | Windows 10+ / macOS 11+ / Ubuntu 20.04+ |
| RAM              | 4 GB                                      | 8 GB+                                   |
| Disk Space       | 2 GB                                      | 5 GB+                                   |
| Node.js          | 14.0.0                                    | 18.0.0 or higher                        |
| npm              | 6.0.0                                     | 9.0.0 or higher                         |

### Required Software

#### 1. Node.js & npm

**Download:** https://nodejs.org/

```bash
# Verify installation
node --version
npm --version

# Expected output (example):
# v18.16.0
# 9.6.7
```

#### 2. MongoDB

You have two options:

**Option A: Local MongoDB Installation**

- **Windows:** Download from https://www.mongodb.com/try/download/community
- **macOS:** `brew install mongodb-community`
- **Ubuntu:** https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/

**Option B: MongoDB Atlas (Cloud)**

- Create account at https://www.mongodb.com/cloud/atlas
- Create a free cluster
- Get connection string
- More beginner-friendly and cloud-based

#### 3. Code Editor

Recommended: **Visual Studio Code**

- Download: https://code.visualstudio.com/
- Extensions to install:
  - ES7+ React/Redux/React-Native snippets
  - Prettier - Code formatter
  - Thunder Client (API testing)
  - MongoDB for VS Code

#### 4. API Testing Tool (Optional)

- **Postman** - https://www.postman.com/downloads/
- **Thunder Client** - VS Code extension
- **cURL** - Command line tool (built-in Windows 10+)

---

## Project Structure

```
MediLab/
├── apps/
│   ├── backend/
│   │   ├── src/
│   │   │   ├── app.js                 # Express app configuration
│   │   │   ├── server.js             # Server entry point
│   │   │   ├── modules/              # Feature modules
│   │   │   │   ├── auth/            # Authentication module
│   │   │   │   ├── patient/         # Patient management
│   │   │   │   ├── booking/         # Appointment booking
│   │   │   │   ├── lab/             # Lab tests
│   │   │   │   ├── finance/         # Finance tracking
│   │   │   │   └── ...
│   │   │   ├── config/              # Configuration files
│   │   │   └── utils/               # Utility functions
│   │   ├── tests/                   # Test files
│   │   ├── package.json
│   │   └── .env                     # Environment variables
│   │
│   └── web/
│       ├── src/
│       │   ├── pages/               # Page components
│       │   │   ├── patient/        # Patient pages
│       │   │   ├── staff/          # Staff pages
│       │   │   └── ...
│       │   ├── components/          # Reusable components
│       │   ├── api/                # API service files
│       │   ├── context/            # React context
│       │   ├── utils/              # Utilities
│       │   └── App.jsx
│       ├── tests/                  # Test files
│       ├── package.json
│       ├── vite.config.mjs
│       └── .env
│
├── docs/                            # Documentation
├── package.json                     # Root package.json
└── README.md
```

---

## Backend Setup

### Step 1: Clone and Navigate

```bash
# Clone the repository (if not already done)
git clone <repository-url>
cd MediLab/apps/backend

# Verify you're in the backend directory
pwd  # Unix/macOS
# or
cd   # Windows (shows current path)
```

### Step 2: Install Dependencies

```bash
# Clear npm cache (optional but recommended)
npm cache clean --force

# Install all dependencies
npm install

# Verify installation
npm list --depth=0
```

**Expected output should show:** express, mongoose, dotenv, cors, etc.

### Step 3: Environment Configuration

Create a `.env` file in `apps/backend/`:

```bash
# Navigate to backend directory
cd apps/backend

# Create .env file
echo > .env        # Windows
touch .env         # macOS/Linux
```

**Content for `.env`:**

```env
# Server Configuration
NODE_ENV=development
PORT=3000
HOST=localhost

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/medilab
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/medilab

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRY=24h

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

# Email Configuration (SendGrid)
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@medilab.com

# Twilio Configuration (SMS)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# AI/Third-party Services
GROQ_API_KEY=your_groq_api_key

# Payment Gateway (PayHere)
PAYHERE_MERCHANT_ID=your_payhere_merchant_id
PAYHERE_API_KEY=your_payhere_api_key

# Application Settings
LOG_LEVEL=debug
MAX_FILE_UPLOAD_SIZE=10mb
```

### Step 4: Verify Database Connection

```bash
# Test MongoDB connection
npm run test:db

# If custom script doesn't exist, test manually
node -e "
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/medilab');
mongoose.connection.on('connected', () => {
  console.log('✓ MongoDB connected successfully');
  process.exit(0);
});
mongoose.connection.on('error', (err) => {
  console.error('✗ MongoDB connection failed:', err.message);
  process.exit(1);
});
"
```

### Step 5: Seed Initial Data (Optional)

```bash
# Run seed scripts to populate initial data
npm run seed

# This will:
# - Create admin accounts
# - Add test data
# - Initialize roles and permissions
```

### Step 6: Start Backend Server

```bash
# Development mode (with hot reload)
npm run dev

# OR Production mode
npm start

# Expected output:
# ✓ Server running on http://localhost:3000
# ✓ MongoDB connected
# ✓ Ready to accept connections
```

**Keep terminal open**, backend should be running on `http://localhost:3000`

---

## Frontend Setup

### Step 1: Navigate to Frontend Directory

```bash
# Open a NEW terminal/command prompt
cd MediLab/apps/web

# Verify you're in the web directory
pwd  # Unix/macOS
# or
cd   # Windows
```

### Step 2: Install Dependencies

```bash
# Clear npm cache
npm cache clean --force

# Install dependencies
npm install

# Verify installation
npm list --depth=0
```

**Expected packages:** react, react-router, tailwindcss, vite, axios, etc.

### Step 3: Environment Configuration

Create `.env` file in `apps/web/`:

```bash
# Create .env file
echo > .env        # Windows
touch .env         # macOS/Linux
```

**Content for `.env`:**

```env
# API Configuration
VITE_API_URL=http://localhost:3000/api
VITE_API_BASE_URL=http://localhost:3000

# Application Settings
VITE_APP_NAME=MediLab
VITE_APP_VERSION=1.0.0

# Feature Flags
VITE_ENABLE_AI_DOCTOR=true
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_MULTI_LANGUAGE=true

# Environment
VITE_NODE_ENV=development
```

### Step 4: Start Frontend Server

```bash
# Development mode (with hot reload)
npm run dev

# Expected output:
# ➜ Local: http://localhost:5173/
# ➜ press h to show help
```

**Frontend runs on `http://localhost:5173`**

---

## Database Setup

### Option A: Local MongoDB

#### Windows

1. Download MongoDB Community from https://www.mongodb.com/try/download/community
2. Run installer
3. Choose `Complete` installation
4. Install MongoDB as a service (recommended)
5. MongoDB will start automatically

```bash
# Verify MongoDB is running
mongosh

# Expected prompt:
# test>
```

#### macOS

```bash
# Install via Homebrew
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB service
brew services start mongodb-community

# Verify
mongosh
```

#### Ubuntu/Linux

```bash
# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-5.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/5.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-5.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod

# Verify
mongosh
```

### Option B: MongoDB Atlas (Cloud)

1. **Create Account**
   - Go to https://www.mongodb.com/cloud/atlas
   - Sign up with email
   - Verify email address

2. **Create Free Cluster**
   - Click "Create a Deployment"
   - Select `M0 Sandbox` (free)
   - Choose region (AWS recommended)
   - Click "Create Cluster"
   - Wait 2-5 minutes for cluster to initialize

3. **Get Connection String**
   - Click "Connect"
   - Choose "Drivers"
   - Select Node.js
   - Copy connection string
   - Format: `mongodb+srv://username:password@cluster.mongodb.net/medilab`

4. **Update Backend .env**

   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/medilab
   ```

5. **Create Database User**
   - Go to "Database Access"
   - Click "Add New Database User"
   - Create username and password
   - Set role to "Read and write to any database"
   - Click "Add User"

### Create Initial Database

```bash
# Using mongosh (if local MongoDB)
mongosh

# Create database
> use medilab
> db.createCollection("users")
> db.users.insertOne({test: true})
> exit

# Verify
mongosh
> use medilab
> db.users.findOne()
```

---

## Environment Configuration

### Backend Environment Variables

**File:** `apps/backend/.env`

#### Essential Variables

```env
# Server
NODE_ENV=development
PORT=3000
HOST=localhost

# Database
MONGODB_URI=mongodb://localhost:27017/medilab

# JWT
JWT_SECRET=your_secret_key_here_change_in_prod
JWT_EXPIRY=24h

# CORS
CORS_ORIGIN=http://localhost:5173

# Logging
LOG_LEVEL=debug
```

#### Optional Variables

```env
# Email (SendGrid)
SENDGRID_API_KEY=sk_...
SENDGRID_FROM_EMAIL=noreply@medilab.com

# SMS (Twilio)
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=auth_token
TWILIO_PHONE_NUMBER=+1234567890

# AI Services
GROQ_API_KEY=gsk_...
GEMINI_API_KEY=AIzaSy...

# Payment
PAYHERE_MERCHANT_ID=1234567890
PAYHERE_API_KEY=api_key
```

### Frontend Environment Variables

**File:** `apps/web/.env`

```env
# API
VITE_API_URL=http://localhost:3000/api

# App
VITE_APP_NAME=MediLab
VITE_APP_VERSION=1.0.0

# Features
VITE_ENABLE_AI_DOCTOR=true
```

---

## Running the Application

### Terminal 1: Backend Server

```bash
cd MediLab/apps/backend
npm run dev

# Output should show:
# ✓ Server running on http://localhost:3000
# ✓ Connected to MongoDB
```

### Terminal 2: Frontend Server

```bash
cd MediLab/apps/web
npm run dev

# Output should show:
# ➜ Local: http://localhost:5173/
# ➜ press h to show help
```

### Open in Browser

```
http://localhost:5173
```

### First Login

**Patient Account:**

- Email: `patient@medilab.com`
- Password: `TestPassword@123`

**Staff Account:**

- Email: `staff@medilab.com`
- Password: `TestPassword@123`

If test accounts don't exist, register new accounts:

1. Click "Register"
2. Enter credentials
3. Click "Sign Up"
4. Use registered account to login

---

## Testing

### Running Tests

#### Backend Tests

```bash
cd apps/backend

# Run all tests
npm test

# Run specific test file
npm test -- auth.integration.test.js

# Run with coverage
npm test -- --coverage
```

#### Frontend Tests

```bash
cd apps/web

# Run all tests
npm test

# Run specific test file
npm test -- patient.pages.test.jsx

# Run with coverage
npm test -- --coverage
```

#### Performance Tests

```bash
cd apps/backend

# Run Artillery load tests
artillery run artillery-auth.yml
artillery run artillery-patient.yml
```

### Test Documentation

See the following documentation files:

- `TEST_QUICKSTART.md` - Quick start guide
- `TESTING_INSTRUCTION_REPORT.md` - Detailed test documentation
- `COMPREHENSIVE_TEST_SUITE.md` - Test case documentation

---

## Troubleshooting

### Common Issues

#### 1. Port Already in Use

```bash
# Check what's using port 3000 (backend)
# Windows
netstat -ano | findstr :3000

# macOS/Linux
lsof -i :3000

# Kill the process
# Windows
taskkill /PID <pid> /F

# macOS/Linux
kill -9 <pid>

# Or use different port in .env
PORT=3001
```

#### 2. MongoDB Connection Failed

```bash
# Check MongoDB is running
# Windows
Get-Service MongoDB

# macOS
brew services list

# Ubuntu
sudo systemctl status mongod

# If not running, start it
# Windows - should start automatically
# macOS
brew services start mongodb-community

# Ubuntu
sudo systemctl start mongod
```

#### 3. Dependencies Installation Issue

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules
rm -rf node_modules
rmdir /s /q node_modules  # Windows

# Delete package lock
rm package-lock.json

# Reinstall
npm install

# If still fails, use older npm version
npm install -g npm@8
npm install
```

#### 4. Frontend Doesn't Load

```bash
# Check .env file has correct API URL
cat .env  # Unix/macOS
type .env  # Windows

# Clear browser cache
# Ctrl+Shift+Delete in Chrome/Firefox

# Try different port
npm run dev -- --port 5174
```

#### 5. CORS Error

```bash
# Ensure backend CORS_ORIGIN in .env is:
CORS_ORIGIN=http://localhost:5173

# Restart backend server
```

#### 6. JWT Token Issues

```bash
# Clear browser localStorage
# In browser console:
localStorage.clear()

# Logout and login again
```

### Getting Help

1. **Check logs:** Review terminal output for error messages
2. **Verify setup:** Re-read relevant section of this guide
3. **Check file permissions:** Ensure you can read/write to directories
4. **Check network:** Ping localhost to verify connectivity
5. **Check documentation:** Review module-specific documentation

---

## Documentation Resources

### API Documentation

- **Auth Module:** `AUTH_API_DOCUMENTATION.md`
  - Registration, login, authentication endpoints
  - Token management
  - Staff authentication

- **Patient Module:** `PATIENT_API_DOCUMENTATION.md`
  - Members management
  - Health profile endpoints
  - Allergies, medications, diseases
  - Emergency contacts
  - Family members

### Frontend Documentation

- **Patient Pages:** `PATIENT_FRONTEND_PAGES_GUIDE.md`
  - Account page
  - Health profile page
  - Household registration
  - Emergency contacts
  - Family tree
  - AI Doctor chat
  - Booking
  - Health reports

### Testing Documentation

- `TEST_QUICKSTART.md` - Quick test execution guide
- `TESTING_INSTRUCTION_REPORT.md` - Comprehensive test documentation
- `COMPREHENSIVE_TEST_SUITE.md` - Test case details
- `PERFORMANCE_TESTING.md` - Performance test guide

### Other Documentation

- `README.md` - Project overview
- `BOOKING_FRONTEND_SETUP.md` - Booking module setup
- `deployment.md` - Production deployment guide

---

## Performance Optimization

### Backend Optimization

```javascript
// Enable compression in app.js
import compression from "compression";
app.use(compression());

// Database indexing
db.users.createIndex({ email: 1 }, { unique: true });
db.members.createIndex({ household_id: 1 });

// Response caching
app.use(cacheMiddleware({ maxAge: "1 hour" }));
```

### Frontend Optimization

```javascript
// Code splitting in routes
const PatientDashboard = lazy(() => import("./pages/PatientDashboard"));
const HealthProfile = lazy(() => import("./pages/HealthProfile"));

// Image optimization
<img src={image} alt="desc" loading="lazy" />;

// API response caching
const cached = useMemo(() => fetchedData, [dependency]);
```

---

## Production Deployment

For production deployment, refer to:

- `deployment.md` - Deployment guidelines
- Environment setup for production
- Security considerations
- Performance tuning

---

## Next Steps

After setup completion:

1. ✅ Create test user accounts
2. ✅ Run integration tests
3. ✅ Review API documentation
4. ✅ Explore patient pages
5. ✅ Test end-to-end workflows
6. ✅ Review test coverage reports
7. ✅ Configure additional services (email, SMS, payments)

---

## Quick Reference Commands

```bash
# Backend
cd apps/backend
npm install              # Install dependencies
npm run dev             # Start dev server
npm test                # Run tests
npm run seed            # Seed database

# Frontend
cd apps/web
npm install             # Install dependencies
npm run dev             # Start dev server
npm test                # Run tests
npm run build           # Build for production

# Database
mongosh                 # Connect to MongoDB
use medilab            # Select database
db.collections()       # List collections
db.users.find()        # Query users
```

---

**Setup Complete!**

Your MediLab application is ready for development. Refer to the documentation files for detailed information about specific modules and features.

**Happy Coding! 🚀**

---

**End of Document**
