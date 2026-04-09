**Author:** Lakni (IT23772922)  

# MediLab Testing Documentation

This document outlines the comprehensive testing strategy for the MediLab application, covering unit tests, integration tests, and performance tests for both backend (Node.js/Express) and frontend (React) modules.

## Table of Contents

1. [Overview](#overview)
2. [Backend Testing](#backend-testing)
3. [Frontend Testing](#frontend-testing)
4. [Running Tests](#running-tests)
5. [Test Coverage](#test-coverage)
6. [Performance Testing](#performance-testing)
7. [Best Practices](#best-practices)

---

## Overview

The test suite is organized by module and testing type:

- **Unit Tests**: Test individual functions and components in isolation
- **Integration Tests**: Test how different parts of the application work together
- **Performance Tests**: Test API performance under various loads

### Test File Structure

```
apps/backend/
├── src/
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── __tests__/
│   │   │   │   ├── auth.service.unit.test.js
│   │   │   │   ├── auth.controller.unit.test.js
│   │   │   │   └── auth.integration.test.js
│   │   ├── patient/
│   │   │   ├── __tests__/
│   │   │   │   ├── member.service.unit.test.js
│   │   │   │   ├── member.controller.unit.test.js
│   │   │   │   └── patient.integration.test.js
│   │   └── __tests__/
│   │       ├── api.performance.test.js
│   │       └── api.performance.config.yaml

apps/web/
├── src/
│   ├── pages/
│   │   ├── __tests__/
│   │   │   ├── auth.pages.test.jsx
│   │   │   └── patient.pages.test.jsx
```

---

## Backend Testing

### 1. Auth Module Tests

#### Service Unit Tests (`auth.service.unit.test.js`)

**What it tests:**

- JWT token generation
- Password hashing and comparison
- Patient registration logic
- Health officer registration logic
- Universal login functionality

**Key test cases:**

```javascript
✓ generateToken - Creates valid JWT with payload
✓ hashPassword - Securely hashes passwords using bcryptjs
✓ comparePassword - Correctly validates password matches
✓ registerPatient - Creates new patient account with profile
✓ registerPatient - Rejects duplicate emails
✓ registerHealthOfficer - Creates health officer account
✓ login - Authenticates with valid credentials
✓ login - Rejects invalid credentials
```

**Run:**

```bash
npm test -- auth.service.unit.test.js
```

#### Controller Unit Tests (`auth.controller.unit.test.js`)

**What it tests:**

- HTTP request/response handling
- Status codes returned
- Error message formatting
- Request validation

**Key test cases:**

```javascript
✓ registerPatient - Returns 201 with token on success
✓ registerPatient - Returns 400 on error
✓ loginPatient - Returns 200 with user data on success
✓ loginPatient - Returns 401 on invalid credentials
✓ getProfile - Returns user profile data
✓ verifyToken - Validates JWT tokens
✓ logout - Returns logout message
✓ updateProfile - Updates profile with valid data
```

**Run:**

```bash
npm test -- auth.controller.unit.test.js
```

#### Integration Tests (`auth.integration.test.js`)

**What it tests:**

- Complete auth flow from API endpoint to database
- Email validation and duplicate prevention
- Password validation during registration/login
- Token generation and verification
- Error handling at API level

**Key test cases:**

```javascript
✓ POST /api/auth/patient/register - Registers new patient successfully
✓ POST /api/auth/patient/register - Returns 400 if email already exists
✓ POST /api/auth/patient/login - Logs in with valid credentials
✓ POST /api/auth/patient/login - Returns 401 with wrong password
✓ POST /api/auth/health-officer/register - Registers health officer
✓ POST /api/auth/health-officer/login - Logs in health officer
✓ POST /api/auth/verify - Verifies valid tokens
✓ POST /api/auth/verify - Rejects invalid tokens
✓ POST /api/auth/logout - Returns logout success
```

**Run:**

```bash
npm test -- auth.integration.test.js
```

### 2. Patient Module Tests

#### Service Unit Tests (`member.service.unit.test.js`)

**What it tests:**

- Member CRUD operations at service layer
- Database query logic
- Data validation
- NIC duplication prevention
- Cascade deletion of related records

**Key test cases:**

```javascript
✓ getAllMembers - Retrieves paginated members list
✓ getAllMembers - Applies default pagination
✓ getMemberById - Fetches member with health info
✓ getMemberById - Returns 404 if not found
✓ createMember - Creates new member successfully
✓ updateMember - Updates without NIC conflicts
✓ updateMember - Prevents duplicate NICs
✓ deleteMember - Deletes member and related records
```

**Run:**

```bash
npm test -- member.service.unit.test.js
```

#### Controller Unit Tests (`member.controller.unit.test.js`)

**What it tests:**

- Express request/response handling for member endpoints
- File upload handling for photos
- HTTP status codes
- Error responses

**Key test cases:**

```javascript
✓ getAllMembers - Returns 200 with pagination info
✓ getMemberById - Returns 200 with member data
✓ getMemberById - Returns 404 if not found
✓ createMember - Creates member and returns 201
✓ createMember - Handles file uploads
✓ updateMember - Updates member successfully
✓ updateMember - Prevents NIC duplicates
✓ deleteMember - Deletes successfully
```

**Run:**

```bash
npm test -- member.controller.unit.test.js
```

#### Integration Tests (`patient.integration.test.js`)

**What it tests:**

- Complete patient API workflows
- Database persistence
- Validation across the full stack
- CRUD operation workflows
- Error scenarios

**Key test cases:**

```javascript
✓ GET /api/patient/members - Returns all members with pagination
✓ GET /api/patient/members - Supports page and limit parameters
✓ GET /api/patient/members/:id - Returns specific member
✓ GET /api/patient/members/:id - Returns 404 if not found
✓ POST /api/patient/members - Creates new member
✓ POST /api/patient/members - Prevents duplicate emails
✓ POST /api/patient/members - Handles file uploads
✓ PUT /api/patient/members/:id - Updates member
✓ PUT /api/patient/members/:id - Prevents NIC duplication
✓ DELETE /api/patient/members/:id - Deletes member
✓ DELETE /api/patient/members/:id - Cascade deletes related records
```

**Run:**

```bash
npm test -- patient.integration.test.js
```

### 3. Performance Tests (`api.performance.test.js`)

**What it tests:**

- API response times under normal load
- Throughput and concurrent request handling
- Performance degradation under spike loads
- Error rates during stress testing

**Key test scenarios:**

1. **Auth API Performance**
   - Registration: Handles 10 concurrent requests with < 2000ms avg response
   - Login: Handles 10 concurrent requests with < 1500ms avg response
   - Token Verification: Handles 10 requests with < 1000ms avg response

2. **Patient API Performance**
   - Get Members: < 1000ms avg response time
   - Create Members: Sequential creation with < 2000ms avg response
   - Get Single Member: Handles 10 concurrent with < 800ms avg response

3. **Load Testing**
   - Sustained Load: 10-second test with < 10% error rate
   - Traffic Spike: Gracefully handles 5→20→50 concurrent requests
   - Degradation: < 100% response time increase at peak load

**Run:**

```bash
npm test -- api.performance.test.js
```

**With Artillery (load testing tool):**

```bash
artillery run apps/backend/src/modules/__tests__/api.performance.config.yaml
```

---

## Frontend Testing

### 1. Auth Pages Tests (`auth.pages.test.jsx`)

#### LoginPage Component

**What it tests:**

- Form rendering with email and password fields
- Form validation (required fields, email format)
- Login submission and API call
- Error message display
- Loading states
- Token storage after successful login

**Key test cases:**

```javascript
✓ Renders login form with email and password fields
✓ Shows error for empty email
✓ Shows error for empty password
✓ Shows error for invalid email format
✓ Successfully logs in with valid credentials
✓ Displays error on failed login
✓ Shows loading state while processing
✓ Stores token in localStorage on success
```

**Run:**

```bash
npm test -- auth.pages.test.jsx -- LoginPage
```

#### RegisterPage Component

**What it tests:**

- Registration form rendering
- Password strength validation
- Password confirmation matching
- Terms acceptance requirement
- Duplicate email prevention
- Phone number validation

**Key test cases:**

```javascript
✓ Renders registration form with all fields
✓ Validates required fields
✓ Shows error for invalid email format
✓ Validates password strength
✓ Validates password confirmation
✓ Validates phone number format
✓ Requires terms acceptance
✓ Successfully registers with valid data
✓ Displays error on duplicate email
```

**Run:**

```bash
npm test -- auth.pages.test.jsx -- RegisterPage
```

### 2. Patient Pages Tests (`patient.pages.test.jsx`)

#### AccountPage Component

**What it tests:**

- Profile display
- Edit functionality
- Profile update validation
- Error handling

#### HealthProfilePage Component

**What it tests:**

- Health information display (blood type, height, weight)
- Allergies list management
- Adding/removing allergies
- Health data persistence

#### BookingPage Component

**What it tests:**

- Booking list display
- Create new booking
- Cancel booking
- Reschedule booking
- Empty state handling

#### FamilyTreePage Component

**What it tests:**

- Family member display
- Add family member
- Remove family member
- Relationship management

#### EmergencyContactPage Component

**What it tests:**

- Emergency contact display
- Add emergency contact
- Edit emergency contact
- Delete emergency contact

**Run:**

```bash
npm test -- patient.pages.test.jsx
```

---

## Running Tests

### 1. Backend Tests

#### Run all backend tests:

```bash
cd apps/backend
npm test
```

#### Run specific test file:

```bash
npm test -- auth.service.unit.test.js
npm test -- patient.integration.test.js
```

#### Run with coverage:

```bash
npm test -- --coverage
```

#### Run in watch mode:

```bash
npm test -- --watch
```

#### Run specific test suite:

```bash
npm test -- auth.service.unit.test.js --testNamePattern="hashPassword"
```

### 2. Frontend Tests

#### Install testing dependencies first:

```bash
cd apps/web
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event jest @babel/preset-react
```

#### Run all frontend tests:

```bash
npm test
```

#### Run specific test file:

```bash
npm test -- auth.pages.test.jsx
npm test -- patient.pages.test.jsx
```

#### Run with coverage:

```bash
npm test -- --coverage
```

#### Run in watch mode:

```bash
npm test -- --watch
```

### 3. Performance Tests

#### Run performance tests with Jest:

```bash
npm test -- api.performance.test.js
```

#### Run with Artillery (requires Artillery CLI):

```bash
# Install Artillery globally
npm install -g artillery

# Run the load test
cd apps/backend
artillery run src/modules/__tests__/api.performance.config.yaml

# Generate HTML report
artillery run src/modules/__tests__/api.performance.config.yaml -o report.json
```

---

## Test Coverage

### Backend Coverage Goals

| Module            | Unit | Integration | Coverage Target |
| ----------------- | ---- | ----------- | --------------- |
| Auth Service      | ✓    | ✓           | 90%+            |
| Auth Controller   | ✓    | ✓           | 85%+            |
| Member Service    | ✓    | ✓           | 85%+            |
| Member Controller | ✓    | ✓           | 80%+            |

### Frontend Coverage Goals

| Component    | Unit | Coverage Target |
| ------------ | ---- | --------------- |
| LoginPage    | ✓    | 85%+            |
| RegisterPage | ✓    | 85%+            |
| AccountPage  | ✓    | 80%+            |
| PatientPages | ✓    | 80%+            |

### Check Coverage

**Backend:**

```bash
cd apps/backend
npm test -- --coverage
```

**Frontend:**

```bash
cd apps/web
npm test -- --coverage
```

---

## Performance Testing

### Performance Benchmarks

#### API Response Times (Target SLOs)

| Endpoint                   | Operation | Target   | Current |
| -------------------------- | --------- | -------- | ------- |
| /api/auth/patient/register | Create    | < 2000ms | -       |
| /api/auth/patient/login    | Read      | < 1500ms | -       |
| /api/auth/verify           | Read      | < 1000ms | -       |
| /api/patient/members       | Read      | < 1000ms | -       |
| /api/patient/members       | Create    | < 2000ms | -       |
| /api/patient/members/:id   | Read      | < 800ms  | -       |

#### Load Testing Results

**Sustained Load Test (10 seconds)**

- Expected throughput: 5+ requests/second
- Target error rate: < 10%
- Average response time: < 1000ms

**Traffic Spike Test (5→20→50 concurrent)**

- Phase 1 avg response: Baseline
- Phase 3 degradation: < 100%
- Success rate at peak: > 70%

### Running Performance Tests

```bash
cd apps/backend

# Run with Jest (measures individual requests)
npm test -- api.performance.test.js

# Run with Artillery (full load test)
artillery run src/modules/__tests__/api.performance.config.yaml

# Run with custom load profile
artillery run -t http://localhost:3000 -r 10 -d 60 src/modules/__tests__/api.performance.config.yaml
```

### Interpreting Results

**Artillery Report:**

```
Summary report at 2024-04-05T12:00:00Z

  Artillery 2.0.0
  http://localhost:3000

  Metrics for scenario: Auth API Tests (57 completed)
    http.codes.200: 57
    http.codes.400: 0
    http.codes.401: 0
    http.response_time:
      min: 234.1
      max: 1892.3
      mean: 892.5
      median: 834.0
      p95: 1234.3
      p99: 1567.8
    http.requests: 57
    concurrency: 2.3
    rps: 5.7
    vusers.created_total: 10
    vusers.failed: 0
```

**Key Metrics:**

- `response_time`: How long requests take
- `mean/median`: Average response time
- `p95/p99`: 95th and 99th percentile (tail latency)
- `rps`: Requests per second
- `codes`: HTTP status codes returned

---

## Best Practices

### 1. Test Organization

- **Group related tests** using `describe` blocks
- **Use meaningful test names** that describe what is being tested
- **Keep tests focused** on a single behavior
- **DRY principle**: Use `beforeEach`/`afterEach` for setup/teardown

### 2. Mocking

- **Mock external dependencies** (databases, APIs, services)
- **Mock at appropriate levels** (unit tests mock everything, integration tests use real dependencies)
- **Use factory functions** for creating test data

### 3. Assertions

- **Be specific** with assertions (not just `expect(result).toBeTruthy()`)
- **Test both success and failure** scenarios
- **Test edge cases** (empty values, null, undefined, very large values)

### 4. Performance Testing

- **Set realistic thresholds** based on actual requirements
- **Test under realistic conditions** (proper database size, network latency)
- **Monitor consistently** over time to detect degradation
- **Baseline first** before optimizing

### 5. CI/CD Integration

Add to your CI/CD pipeline:

```yaml
# GitHub Actions example
- name: Run Backend Tests
  run: |
    cd apps/backend
    npm test -- --coverage
    npm test -- api.performance.test.js

- name: Run Frontend Tests
  run: |
    cd apps/web
    npm test -- --coverage
```

### 6. Test Maintenance

- **Update tests** when requirements change
- **Remove flaky tests** and make them more robust
- **Keep dependencies updated**
- **Review test coverage** regularly

---

## Troubleshooting

### Common Issues

**1. Tests timeout**

```javascript
// Increase timeout for slow operations
jest.setTimeout(30000); // 30 seconds
```

**2. Database connection errors**

```javascript
// Ensure test database is running
// Use memory database for unit tests
```

**3. Port already in use (integration tests)**

```javascript
// Use random ports or handle port conflicts
const PORT = process.env.TEST_PORT || 3001;
```

**4. Mock not working**

```javascript
// Clear mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
});
```

---

## Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/react)
- [Artillery Load Testing](https://artillery.io/docs)
- [Node.js Testing Guide](https://nodejs.org/en/docs/guides/testing/)

---

## Contact & Support

For questions or issues with testing:

1. Check existing test examples
2. Refer to this documentation
3. Search GitHub issues
4. Contact the development team
