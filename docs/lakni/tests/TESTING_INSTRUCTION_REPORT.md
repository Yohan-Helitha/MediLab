**Author:** Lakni (IT23772922)  

# Testing Instruction Report

**Author:** Lakni

## Executive Summary

This report provides comprehensive instructions for running all testing suites in the MediLab application, including unit tests, integration tests, and performance tests. It covers environment configuration, setup procedures, and execution commands for both frontend and backend testing frameworks.

---

## Table of Contents

1. [Testing Environment Configuration](#testing-environment-configuration)
2. [Unit Testing Setup & Execution](#unit-testing-setup--execution)
3. [Integration Testing Setup & Execution](#integration-testing-setup--execution)
4. [Performance Testing Setup & Execution](#performance-testing-setup--execution)
5. [Environment Variables & Configuration](#environment-variables--configuration)
6. [Troubleshooting Guide](#troubleshooting-guide)
7. [Test Reporting & Metrics](#test-reporting--metrics)

---

## Testing Environment Configuration

### Backend Environment Setup

#### Prerequisites

- **Node.js:** v18.0.0 or higher
- **npm:** v9.0.0 or higher
- **MongoDB:** v4.4 or higher (local or Atlas)
- **Git:** v2.30.0 or higher

#### Installation Steps

1. **Navigate to backend directory:**

```bash
cd apps/backend
```

2. **Install dependencies:**

```bash
npm install
```

3. **Verify installation:**

```bash
npm --version
node --version
```

#### MongoDB Setup for Testing

**Option 1: Local MongoDB**

```bash
# Windows
mongod

# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

**Option 2: MongoDB Atlas (Cloud)**

```bash
# No installation needed, but connection string required in .env
```

**Verify MongoDB Connection:**

```bash
# Test connection
npm run test:setup
```

### Frontend Environment Setup

#### Prerequisites

- **Node.js:** v18.0.0 or higher
- **npm:** v9.0.0 or higher
- **React:** v18.0.0 or higher
- **Vitest:** Latest version

#### Installation Steps

1. **Navigate to frontend directory:**

```bash
cd apps/web
```

2. **Install dependencies:**

```bash
npm install
```

3. **Install testing dependencies (if not included):**

```bash
npm install --save-dev \
  vitest \
  @testing-library/react \
  @testing-library/jest-dom \
  @testing-library/user-event \
  @vitest/ui
```

4. **Verify installation:**

```bash
npm list vitest
npm list @testing-library/react
```

#### Browser Environment

Testing uses `jsdom` virtual DOM environment. No actual browser needed:

```bash
# Configured in vitest.config.js
environment: 'jsdom'
```

---

## Unit Testing Setup & Execution

### What Are Unit Tests?

Unit tests validate individual functions, services, and components in isolation, using mocks for external dependencies.

### Backend Unit Tests

#### Test Files Location

```
apps/backend/src/modules/
├── auth/__tests__/
│   ├── auth.service.unit.test.js
│   └── auth.controller.unit.test.js
└── patient/__tests__/
    ├── member.service.unit.test.js
    └── member.controller.unit.test.js
```

#### Setup Configuration

**Jest Configuration File:** `apps/backend/jest.config.cjs`

```javascript
module.exports = {
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.unit.test.js"],
  collectCoverageFrom: ["src/**/*.js"],
  coveragePathIgnorePatterns: ["node_modules"],
};
```

#### Execution Commands

**Run all backend unit tests:**

```bash
cd apps/backend
npm test -- --testPathPattern=unit
```

**Run specific module unit tests:**

```bash
# Auth module
npm test -- auth.service.unit.test.js

# Patient module
npm test -- member.service.unit.test.js

# Specific test case
npm test -- --testNamePattern="hashPassword"
```

**Run with coverage report:**

```bash
npm test -- --testPathPattern=unit --coverage
```

**Run in watch mode:**

```bash
npm test -- --testPathPattern=unit --watch
```

**Verbose output:**

```bash
npm test -- --testPathPattern=unit --verbose
```

### Frontend Unit Tests

#### Test Files Location

```
apps/web/src/pages/__tests__/
├── patient.extended.features.test.jsx
├── auth.pages.test.jsx
└── [other feature test files]
```

#### Setup Configuration

**Vitest Configuration File:** `apps/web/vitest.config.js`

```javascript
import react from "@vitejs/plugin-react";

export default {
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.js"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: ["node_modules/"],
    },
  },
};
```

**Test Setup File:** `apps/web/src/test/setup.js`

```javascript
import "@testing-library/jest-dom";
import { expect, afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock;
```

#### Execution Commands

**Run all frontend unit tests:**

```bash
cd apps/web
npm test
```

**Run specific test file:**

```bash
npm test AccountPage -- --run
npm test HealthProfilePage -- --run
npm test AIDoctorChatPage -- --run
```

**Run with coverage:**

```bash
npm test -- --coverage
```

**Watch mode (auto-rerun on file changes):**

```bash
npm test -- --watch
```

**Vitest UI Dashboard:**

```bash
npm test -- --ui
```

Access at: `http://localhost:51204/__vitest__/`

**Specific test pattern:**

```bash
npm test -- --grep "Password Validation"
npm test -- --grep "Allergies Management"
```

#### Unit Test Output Example

```
✓ AccountPage (3 tests)
  ✓ Password Validation
    ✓ should validate minimum 8 characters
    ✓ should require uppercase letter
    ✓ should require special character
  ✓ Phone Formatting
    ✓ should clean phone number
  ✓ Profile Updates
    ✓ should update successfully

Test Files  2 passed (2)
     Tests  12 passed (12)
  Start at  10:30:45
  Duration  2.45s
```

---

## Integration Testing Setup & Execution

### What Are Integration Tests?

Integration tests validate how multiple components/services work together, testing API endpoints, database interactions, and complete workflows.

### Backend Integration Tests

#### Test Files Location

```
apps/backend/src/modules/
├── auth/__tests__/
│   └── auth.integration.test.js
└── patient/__tests__/
    └── patient.integration.test.js
```

#### Database Setup for Integration Tests

**1. Test Database Configuration in `.env`:**

```env
# Testing environment
NODE_ENV=test
MONGODB_URI=mongodb://localhost:27017/medilab_test
JWT_SECRET=test_secret_key
```

**2. Database Cleanup Before Tests:**

```bash
# Automated in test setup
# Each test:
# 1. Connects to test database
# 2. Drops collections
# 3. Runs tests
# 4. Cleans up
```

#### Setup Configuration

**Integration Test Setup Pattern:**

```javascript
// auth.integration.test.js
const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../../../app");

describe("Auth Integration Tests", () => {
  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_URI);
  });

  afterAll(async () => {
    // Cleanup
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear collections before each test
    await User.deleteMany({});
    await Member.deleteMany({});
  });

  test("POST /api/auth/patient/register - registers new patient", async () => {
    const response = await request(app)
      .post("/api/auth/patient/register")
      .send({
        email: "test@example.com",
        password: "TestPassword123!",
        full_name: "Test User",
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("token");
  });
});
```

#### Execution Commands

**Run all backend integration tests:**

```bash
cd apps/backend
npm test -- --testPathPattern=integration
```

**Run specific integration test file:**

```bash
npm test -- auth.integration.test.js
npm test -- patient.integration.test.js
```

**Run with specific test name:**

```bash
npm test -- --testNamePattern="should register new patient"
```

**Run with database logging:**

```bash
npm test -- --testPathPattern=integration --verbose
```

**Run with coverage:**

```bash
npm test -- --testPathPattern=integration --coverage
```

#### API Integration Test Flow

```
Test Start
    ↓
Connect to Test MongoDB
    ↓
Clear Test Database
    ↓
Run First Test
  ├─ Make API Request
  ├─ Verify Response
  ├─ Check Database State
  └─ Verify Side Effects
    ↓
Clean Up Test Data
    ↓
Run Next Test
    ↓
Disconnect MongoDB
    ↓
Test Complete
```

#### Integration Test Example Output

```
PASS  src/modules/auth/__tests__/auth.integration.test.js
  POST /api/auth/patient/register
    ✓ should return 201 with token (125ms)
    ✓ should create member profile (98ms)
    ✓ should reject duplicate email (52ms)
  POST /api/auth/patient/login
    ✓ should return 200 with user data (112ms)
    ✓ should return 401 with wrong password (45ms)
  POST /api/auth/verify
    ✓ should verify valid token (67ms)
    ✓ should reject invalid token (38ms)

Tests:  7 passed, 7 total
Time:   1.234s
MongoDB: Connected and tested
```

### Frontend Integration Tests

#### Test Files Location

```
apps/web/src/pages/__tests__/
├── patient.workflows.integration.test.jsx
└── [workflow test files]
```

#### Setup Configuration

**Integration Test Pattern for Frontend:**

```javascript
// patient.workflows.integration.test.jsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";

describe("Account Setup Workflow", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it("should complete profile initialization workflow", async () => {
    // Step 1: Login
    const { rerender } = renderWithRouter(<LoginPage />);
    // ... test login

    // Step 2: Navigate to account page
    rerender(
      <Router>
        <AccountPage />
      </Router>,
    );
    // ... test profile update

    // Step 3: Verify completion
    expect(screen.getByText(/success/i)).toBeInTheDocument();
  });
});
```

#### Execution Commands

**Run all frontend integration tests:**

```bash
cd apps/web
npm test patient.workflows.integration.test.jsx
```

**Run specific workflow:**

```bash
npm test -- --grep "Account Setup Workflow"
npm test -- --grep "Health Profile"
```

**With coverage:**

```bash
npm test patient.workflows.integration.test.jsx -- --coverage
```

**Watch mode:**

```bash
npm test patient.workflows.integration.test.jsx -- --watch
```

#### Frontend Integration Test Flow

```
Test Start
    ↓
Setup Test Environment
  ├─ Initialize Mocks
  ├─ Clear localStorage
  └─ Setup Router Context
    ↓
Render Component 1
  ├─ Simulate User Input
  ├─ Assert Output
  └─ Trigger Navigation
    ↓
Render Component 2
  ├─ Verify State Persists
  ├─ Continue Workflow
  └─ Assert Results
    ↓
Cleanup
    ↓
Test Complete
```

---

## Performance Testing Setup & Execution

### What Are Performance Tests?

Performance tests measure API response times, throughput, and system behavior under various load conditions (normal, spike, sustained).

### Backend Performance Tests

#### Test Files Location

```
apps/backend/
├── src/modules/__tests__/api.performance.test.js
└── api.performance.config.yaml (Artillery configuration)
```

#### Setup and Dependencies

**Install Performance Testing Tools:**

```bash
cd apps/backend

# Jest for performance benchmarking
npm install --save-dev jest

# Artillery for load testing
npm install -g artillery
```

**Verify Installation:**

```bash
artillery --version
npm test -- api.performance.test.js --listTests
```

#### Jest Performance Test Configuration

```javascript
// api.performance.test.js
const http = require("http");

describe("API Performance Tests", () => {
  const BASE_URL = "http://localhost:3000";
  const TIMEOUT = 5000;

  const makeRequest = (endpoint, method = "GET", data = null) => {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: "localhost",
        port: 3000,
        path: endpoint,
        method: method,
      };

      const startTime = performance.now();
      const req = http.request(options, (res) => {
        const endTime = performance.now();
        resolve({
          status: res.statusCode,
          responseTime: endTime - startTime,
        });
      });

      req.on("error", reject);
      if (data) req.write(JSON.stringify(data));
      req.end();
    });
  };

  test("Register API - Response time < 2000ms", async () => {
    const result = await makeRequest("/api/auth/patient/register", "POST", {
      email: "perf@test.com",
      password: "TestPass123!",
      full_name: "Performance Tester",
    });

    console.log(`Response time: ${result.responseTime}ms`);
    expect(result.responseTime).toBeLessThan(2000);
  });

  test("Login API - Concurrent requests (10x)", async () => {
    const requests = Array(10)
      .fill(null)
      .map(() =>
        makeRequest("/api/auth/patient/login", "POST", {
          email: "test@example.com",
          password: "TestPass123!",
        }),
      );

    const results = await Promise.all(requests);
    const avgTime =
      results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;

    console.log(`Average response time: ${avgTime}ms`);
    expect(avgTime).toBeLessThan(1500);
  });
});
```

#### Execution Commands - Jest Performance Tests

**Run all performance tests:**

```bash
npm test -- api.performance.test.js
```

**Run specific performance test:**

```bash
npm test -- api.performance.test.js --testNamePattern="Concurrent requests"
```

**Run with detailed timing:**

```bash
npm test -- api.performance.test.js --verbose
```

**Run and measure execution time:**

```bash
time npm test -- api.performance.test.js
```

#### Artillery Load Testing Configuration

**File:** `apps/backend/src/modules/__tests__/api.performance.config.yaml`

```yaml
config:
  target: "http://localhost:3000"
  phases:
    - duration: 30
      arrivalRate: 2
      name: "Warm up"
    - duration: 60
      arrivalRate: 10
      name: "Sustained load"
    - duration: 30
      arrivalRate: 20
      name: "Spike"
    - duration: 30
      arrivalRate: 5
      name: "Cool down"

scenarios:
  - name: "Register and Login Flow"
    flow:
      - post:
          url: "/api/auth/patient/register"
          json:
            email: "{{ $randomString(8) }}@test.com"
            password: "TestPass123!"
            full_name: "Test User"
          capture:
            json: "$.token"
            as: "authToken"
      - think: 5
      - get:
          url: "/api/auth/verify"
          headers:
            Authorization: "Bearer {{ authToken }}"
```

#### Execution Commands - Artillery Load Tests

**Prerequisites:**

```bash
# Ensure backend is running
cd apps/backend
npm start &  # Run in background

# Or in separate terminal
npm run dev
```

**Run load test:**

```bash
artillery run src/modules/__tests__/api.performance.config.yaml
```

**Run with custom target:**

```bash
artillery run -t http://prod-server.com:3000 \
  src/modules/__tests__/api.performance.config.yaml
```

**Override load parameters:**

```bash
# Change arrival rate (requests per second)
artillery run -r 25 src/modules/__tests__/api.performance.config.yaml

# Change duration (in seconds)
artillery run -d 120 src/modules/__tests__/api.performance.config.yaml
```

**Generate HTML report:**

```bash
# Run and save output
artillery run src/modules/__tests__/api.performance.config.yaml \
  -o report.json

# Convert to HTML
artillery report report.json

# Open report
open report.html  # macOS
start report.html # Windows
```

#### Performance Test Output Example

```
Scenarios launched:  10
Scenarios completed: 10
Requests completed:  100
RPS sent: 12.5
Request latency:
  min: 45ms
  max: 2341ms
  median: 523ms
  p95: 1845ms
  p99: 2210ms
Codes:
  200: 95
  400: 5
Errors: 0
```

### Frontend Performance Tests

#### Test Files Location

```
apps/web/src/pages/__tests__/
└── patient.pages.performance.test.jsx
```

#### Execution Commands

**Run all frontend performance tests:**

```bash
cd apps/web
npm test patient.pages.performance.test.jsx
```

**Run specific performance scenario:**

```bash
npm test -- --grep "should render.*within.*seconds"
npm test -- --grep "handle.*message.*history"
```

**Measure rendering time:**

```bash
npm test patient.pages.performance.test.jsx -- --reporter=verbose
```

**Profile with Chrome DevTools:**

```bash
# Run with debugging
node --inspect-brk node_modules/.bin/vitest patient.pages.performance.test.jsx
```

---

## Environment Variables & Configuration

### Backend Environment Configuration

**Create `.env` file in `apps/backend/`:**

```env
# Server Configuration
NODE_ENV=development
PORT=3000
HOST=localhost

# Database
MONGODB_URI=mongodb://localhost:27017/medilab
MONGODB_TEST_URI=mongodb://localhost:27017/medilab_test

# Authentication
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d
BCRYPT_ROUNDS=10

# API Keys
SENDGRID_API_KEY=your_sendgrid_key
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token

# Testing
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=TestPassword123!

# Logging
LOG_LEVEL=debug
```

**For Testing (`.env.test`):**

```env
NODE_ENV=test
MONGODB_URI=mongodb://localhost:27017/medilab_test
JWT_SECRET=test_secret_key
LOG_LEVEL=error
SKIP_EMAIL_VERIFICATION=true
```

### Frontend Environment Configuration

**Create `.env.local` file in `apps/web/`:**

```env
# API Configuration
VITE_API_URL=http://localhost:3000
VITE_API_TIMEOUT=10000

# Features
VITE_ENABLE_CACHE=true
VITE_ENABLE_LOGGING=false

# Testing
VITE_TEST_MODE=true
```

**Jest/Vitest Environment.**

```bash
# Load environment during tests
export NODE_ENV=test
npm test
```

### Database Configuration for Tests

#### MongoDB Connection

**Test Database Isolation:**

```javascript
// Before all tests
mongoose.connect(process.env.MONGODB_TEST_URI);

// Before each test
await User.deleteMany({});
await Member.deleteMany({});
await Allergy.deleteMany({});

// After all tests
await mongoose.connection.dropDatabase();
await mongoose.connection.close();
```

#### Seed Test Data

```javascript
// Test data setup
const testPatient = {
  email: "testpatient@example.com",
  password: "TestPassword123!",
  full_name: "Test Patient",
  contact_number: "0712345678",
};

const testHealthOfficer = {
  email: "testofficer@example.com",
  password: "TestPassword123!",
  full_name: "Test Officer",
  contact_number: "0787654321",
};
```

---

## Troubleshooting Guide

### Backend Testing Issues

#### Issue: MongoDB Connection Refused

```
Error: connect ECONNREFUSED 127.0.0.1:27017
```

**Solution:**

```bash
# Ensure MongoDB is running
# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
mongod

# Verify connection
mongosh
```

#### Issue: Port Already in Use

```
Error: listen EADDRINUSE :::3000
```

**Solution:**

```bash
# Kill process on port 3000
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :3000
kill -9 <PID>
```

#### Issue: Timeout in Tests

```
Timeout - Async callback was not invoked within the 5000ms timeout
```

**Solution:**

```javascript
// Increase timeout
jest.setTimeout(10000);

// Or in command
npm test -- --testTimeout=10000
```

#### Issue: Module Not Found

```
Cannot find module '@modules/auth/service'
```

**Solution:**

```bash
# Clear node_modules
rm -rf node_modules package-lock.json
npm install

# Clear Jest cache
npm test -- --clearCache
```

### Frontend Testing Issues

#### Issue: Test Not Found

```
No tests found matching filename pattern
```

**Solution:**

```bash
# Verify file location
ls apps/web/src/pages/__tests__/

# Ensure .test.jsx naming
npm test patient.extended.features -- --listTests
```

#### Issue: Mock Not Working

```
console.error: "The onchange property is not implemented"
```

**Solution:**

```javascript
// Add to src/test/setup.js
Object.defineProperty(window, "onchange", {
  writable: true,
  value: null,
});

// Or mock specific API
vi.mock("../../api/patientApi.js", () => ({
  updateMemberProfile: vi.fn(),
}));
```

#### Issue: localStorage Undefined

```
ReferenceError: localStorage is not defined
```

**Solution:**

```javascript
// Configured in setup.js
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock;
```

### Performance Testing Issues

#### Issue: Artillery Connection Timeout

```
Error: Socket hang up
```

**Solution:**

```bash
# Ensure backend is running
npm start

# Wait for server startup
sleep 3

# Then run Artillery
artillery run api.performance.config.yaml
```

#### Issue: High Error Rate in Load Test

```
Errors: 45 (45%)
```

**Solution:**

```
1. Reduce arrival rate
2. Increase server resources
3. Optimize database queries
4. Check server logs

artillery run -r 5 api.performance.config.yaml
```

---

## Test Reporting & Metrics

### Generate Coverage Reports

#### Backend Coverage

```bash
cd apps/backend

# Generate coverage
npm test -- --coverage

# Generate HTML report
npm test -- --coverage --coverageReporters=html

# View report
open coverage/index.html
```

#### Frontend Coverage

```bash
cd apps/web

# Generate coverage
npm test -- --coverage

# Generate with specific reporters
npm test -- --coverage --coverageReporters=html,lcov,text-summary

# View in terminal
npm test -- --coverage --coverageReporters=text
```

### Coverage Report Output

```
------------|---------|----------|---------|---------|-------------------
File       | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
------------|---------|----------|---------|---------|-------------------
All files  |   88.5  |   85.2   |   90.1  |   88.5  |
 auth      |   92.1  |   88.3   |   94.5  |   92.1  | 45,67,89
 patient   |   85.2  |   82.1   |   86.7  |   85.2  | 23,56
 utils     |   75.3  |   70.2   |   78.9  |   75.3  | 12,34,45
------------|---------|----------|---------|---------|-------------------
```

### Performance Metrics

#### Response Time Metrics

- **p50 (Median):** 50th percentile response time
- **p95:** 95th percentile (good for SLA)
- **p99:** 99th percentile (peak performance)

#### Target Metrics

```
Metric                  Target    Actual    Status
Auth API (P95)         < 2000ms   1845ms    ✓ PASS
Patient API (P95)      < 1500ms   1230ms    ✓ PASS
Concurrent (10x)       < 1500ms   1125ms    ✓ PASS
Error Rate             < 5%       0.5%      ✓ PASS
RPS (Throughput)       > 100      125       ✓ PASS
```

### Test Summary Report Example

```
Test Execution Summary
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Backend Tests
  Unit Tests:          37 passed, 0 failed
  Integration Tests:   33 passed, 0 failed
  Performance Tests:    9 passed, 0 failed
  ─────────────────────────────────────────
  Total:              79 passed, 0 failed

Frontend Tests
  Unit Tests:         250 passed, 0 failed
  Integration Tests:  150 passed, 0 failed
  Performance Tests:  100 passed, 0 failed
  ─────────────────────────────────────────
  Total:             500 passed, 0 failed

Overall Summary
  Total Tests:        579 passed, 0 failed
  Coverage:           88.5% statements
  Execution Time:     18 minutes 42 seconds
  Status:            ✓ ALL TESTS PASSED
```

---

## Quick Reference Commands

### Unit Tests

```bash
# Backend
npm test -- --testPathPattern=unit

# Frontend
npm test -- --run

# With coverage
npm test -- --coverage --run
```

### Integration Tests

```bash
# Backend
npm test -- --testPathPattern=integration

# Frontend
npm test patient.workflows.integration.test.jsx -- --run
```

### Performance Tests

```bash
# Backend Jest
npm test -- api.performance.test.js

# Backend Artillery
artillery run api.performance.config.yaml

# Frontend
npm test patient.pages.performance.test.jsx -- --run
```

### Full Test Suite

```bash
# Backend - All tests with coverage
cd apps/backend
npm test -- --coverage

# Frontend - All tests with coverage
cd apps/web
npm test -- --coverage
```

---

## Best Practices Summary

✅ Always run tests before committing code
✅ Maintain > 80% code coverage
✅ Use descriptive test names
✅ Mock external dependencies
✅ Keep test database isolated
✅ Monitor performance trends
✅ Update tests with code changes
✅ Document test failures and fixes

---

**Document Version:** 1.0  
**Last Updated:** April 2026  
**Status:** Ready for Production
