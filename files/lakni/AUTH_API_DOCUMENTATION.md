# MediLab Auth Module - API Documentation

**Author:** Lakni (IT23772922)  
**Version:** 1.0  
**Last Updated:** April 2026

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication & Authorization](#authentication--authorization)
3. [Patient Authentication APIs](#patient-authentication-apis)
4. [Staff Authentication APIs](#staff-authentication-apis)
5. [Common APIs](#common-apis)
6. [Error Handling](#error-handling)
7. [Security Features](#security-features)

---

## Overview

The Auth Module provides comprehensive authentication and authorization services for the MediLab system. It supports two distinct user types:

- **Patients**: Users accessing health services
- **Staff**: Healthcare professionals and administrators

### Key Features

- JWT-based token authentication
- Role-Based Access Control (RBAC)
- Password hashing with bcrypt
- Email and password validation
- Member ID generation
- Token verification and validation
- Logout support

### Base URL

```
http://localhost:3000/api/auth
```

---

## Authentication & Authorization

### JWT Token Structure

After successful login, the server returns a JWT token containing:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": "24h",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "role": "patient"
  }
}
```

### Token Usage

Include the token in the Authorization header for authenticated endpoints:

```
Authorization: Bearer <your_jwt_token>
```

### Supported Roles

- **patient**: Patient accessing their health information
- **MOH**: Medical Officer of Health
- **PHI**: Public Health Inspector
- **Nurse**: Nursing staff
- **Doctor**: Medical doctor
- **Lab_Technician**: Laboratory technician
- **Admin**: System administrator
- **HealthOfficer**: General health officer
- **Staff**: Generic staff member

---

## Patient Authentication APIs

### 1. Register Patient

**Endpoint:** `POST /patient/register`

**Authentication:** Not required (Public)

**Description:** Register a new patient account in the system.

#### Request Body

```json
{
  "full_name": "John Doe",
  "email": "john.doe@example.com",
  "contact_number": "+94712345678",
  "password": "SecurePassword@123"
}
```

#### Validation Rules

| Field            | Rules                                                                                     | Example          |
| ---------------- | ----------------------------------------------------------------------------------------- | ---------------- |
| `full_name`      | Required, 2-150 characters                                                                | John Doe         |
| `email`          | Required, valid email format                                                              | john@example.com |
| `contact_number` | Required, 9-20 characters, valid phone format                                             | +94712345678     |
| `password`       | Required, 8-100 chars, min 1 uppercase, 1 lowercase, 1 number, 1 special char (@$!%\*?&#) | SecurePass@123   |

**Password Requirements:**

- Minimum 8 characters, maximum 100 characters
- At least 1 uppercase letter (A-Z)
- At least 1 lowercase letter (a-z)
- At least 1 number (0-9)
- At least 1 special character (@$!%\*?&#)

#### Success Response (201 Created)

```json
{
  "success": true,
  "message": "Patient registered successfully",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "member_id": "MEM-2024-0001",
    "full_name": "John Doe",
    "email": "john.doe@example.com",
    "contact_number": "+94712345678",
    "role": "patient",
    "created_at": "2026-04-06T10:30:00Z"
  }
}
```

#### Error Response (400 Bad Request)

```json
{
  "success": false,
  "message": "Email already registered",
  "errors": [
    {
      "field": "email",
      "message": "This email is already in use"
    }
  ]
}
```

#### Possible Error Messages

| Error                             | Status | Description                                   |
| --------------------------------- | ------ | --------------------------------------------- |
| Validation failed                 | 400    | One or more fields failed validation          |
| Email already registered          | 400    | Email exists in database                      |
| Contact number already registered | 400    | Phone number already in system                |
| Invalid email format              | 400    | Email doesn't match standard format           |
| Password too weak                 | 400    | Password doesn't meet complexity requirements |

---

### 2. Login Patient

**Endpoint:** `POST /patient/login`

**Authentication:** Not required (Public)

**Description:** Authenticate a patient and receive a JWT token.

#### Request Body

```json
{
  "identifier": "john.doe@example.com",
  "password": "SecurePassword@123"
}
```

**Note:** The `identifier` field accepts any of:

- Email address
- Member ID (e.g., MEM-2024-0001)
- Contact number

#### Validation Rules

| Field        | Rules                                          | Example                           |
| ------------ | ---------------------------------------------- | --------------------------------- |
| `identifier` | Required, email OR member ID OR contact number | john@example.com OR MEM-2024-0001 |
| `password`   | Required, non-empty                            | SecurePassword@123                |

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjUwN2YxZjc3YmNmODZjZDc5OTQzOTAxMSIsImVtYWlsIjoiam9obi5kb2VAZXhhbXBsZS5jb20iLCJyb2xlIjoicGF0aWVudCIsImlhdCI6MTY0NjU0OTIwMH0...",
    "expiresIn": "24h",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "member_id": "MEM-2024-0001",
      "email": "john.doe@example.com",
      "full_name": "John Doe",
      "role": "patient"
    }
  }
}
```

#### Error Response (401 Unauthorized)

```json
{
  "success": false,
  "message": "Invalid credentials",
  "errors": [
    {
      "field": "password",
      "message": "Password is incorrect"
    }
  ]
}
```

#### Possible Error Messages

| Error               | Status | Description                          |
| ------------------- | ------ | ------------------------------------ |
| User not found      | 401    | No patient with that identifier      |
| Invalid credentials | 401    | Password incorrect                   |
| Account disabled    | 403    | Patient account has been deactivated |

---

## Staff Authentication APIs

### 3. Register Staff

**Endpoint:** `POST /staff/register`

**Authentication:** Not required (Public - should be restricted in production)

**Description:** Register a new staff member (healthcare professional).

#### Request Body

```json
{
  "fullName": "Dr. Sarah Smith",
  "email": "sarah.smith@medilab.com",
  "contactNumber": "+94712345679",
  "role": "Doctor",
  "password": "SecurePassword@123"
}
```

#### Validation Rules

| Field           | Rules                                                                                  | Example                 |
| --------------- | -------------------------------------------------------------------------------------- | ----------------------- |
| `fullName`      | Required, 2-150 characters                                                             | Dr. Sarah Smith         |
| `email`         | Required, valid email format                                                           | sarah.smith@medilab.com |
| `contactNumber` | Required, 9-20 characters                                                              | +94712345679            |
| `role`          | Required, one of: MOH, PHI, Nurse, Admin, Lab_Technician, Doctor, HealthOfficer, Staff | Doctor                  |
| `password`      | Required, 8-100 chars, min 1 uppercase, 1 lowercase, 1 number, 1 special char          | SecurePass@123          |

#### Success Response (201 Created)

```json
{
  "success": true,
  "message": "Health officer registered successfully",
  "data": {
    "id": "507f1f77bcf86cd799439012",
    "employee_id": "EMP-2024-0001",
    "fullName": "Dr. Sarah Smith",
    "email": "sarah.smith@medilab.com",
    "contactNumber": "+94712345679",
    "role": "Doctor",
    "created_at": "2026-04-06T10:35:00Z"
  }
}
```

#### Error Response (400 Bad Request)

```json
{
  "success": false,
  "message": "Email already registered",
  "errors": [
    {
      "field": "email",
      "message": "This email is already in use"
    }
  ]
}
```

---

### 4. Login Staff

**Endpoint:** `POST /staff/login`

**Authentication:** Not required (Public)

**Description:** Authenticate a staff member and receive a JWT token.

#### Request Body

```json
{
  "identifier": "sarah.smith@medilab.com",
  "password": "SecurePassword@123"
}
```

**Note:** The `identifier` field accepts any of:

- Email address
- Employee ID
- Username

#### Validation Rules

| Field        | Rules               | Example                 |
| ------------ | ------------------- | ----------------------- |
| `identifier` | Required            | sarah.smith@medilab.com |
| `password`   | Required, non-empty | SecurePassword@123      |

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "24h",
    "user": {
      "id": "507f1f77bcf86cd799439012",
      "employee_id": "EMP-2024-0001",
      "email": "sarah.smith@medilab.com",
      "fullName": "Dr. Sarah Smith",
      "role": "Doctor"
    }
  }
}
```

#### Error Response (401 Unauthorized)

```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

---

## Common APIs

### 5. Get User Profile

**Endpoint:** `GET /profile`

**Authentication:** Required (JWT Token)

**Description:** Retrieve the authenticated user's profile information.

#### Request Headers

```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "full_name": "John Doe",
    "email": "john.doe@example.com",
    "contact_number": "+94712345678",
    "role": "patient",
    "member_id": "MEM-2024-0001",
    "created_at": "2026-04-06T10:30:00Z",
    "updated_at": "2026-04-06T10:30:00Z"
  }
}
```

#### Error Response (401 Unauthorized)

```json
{
  "success": false,
  "message": "Invalid or missing authentication token"
}
```

---

### 6. Verify Token

**Endpoint:** `POST /verify`

**Authentication:** Not required (Public)

**Description:** Verify if a JWT token is valid and not expired.

#### Request Body

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Token is valid",
  "data": {
    "valid": true,
    "expiresAt": "2026-04-07T10:30:00Z"
  }
}
```

#### Error Response (401 Unauthorized)

```json
{
  "success": false,
  "message": "Token is invalid or expired"
}
```

---

### 7. Logout

**Endpoint:** `POST /logout`

**Authentication:** Not required

**Description:** Logout the current user. (Note: Actual logout is handled client-side by removing the token)

#### Request Body

```json
{}
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## Error Handling

### Standard Error Response Format

All error responses follow this format:

```json
{
  "success": false,
  "message": "Human-readable error message",
  "errors": [
    {
      "field": "fieldName",
      "message": "Specific field error message"
    }
  ]
}
```

### HTTP Status Codes

| Code | Meaning      | Scenario                            |
| ---- | ------------ | ----------------------------------- |
| 200  | OK           | Successful request                  |
| 201  | Created      | Resource created successfully       |
| 400  | Bad Request  | Validation errors or missing fields |
| 401  | Unauthorized | Missing/invalid authentication      |
| 403  | Forbidden    | User lacks required permissions     |
| 404  | Not Found    | Resource not found                  |
| 500  | Server Error | Internal server error               |

---

## Security Features

### Password Security

- **Hashing Algorithm:** bcrypt (12 salt rounds)
- **Complexity Requirements:**
  - Minimum 8 characters
  - Must contain uppercase, lowercase, numbers, and special characters
  - Hashed before storage - original password never stored

### Token Security

- **Algorithm:** HS256 (HMAC SHA-256)
- **Expiration:** 24 hours
- **Storage:** Should be stored in secure, httpOnly cookie or secure storage
- **Never expose in URL or logs**

### Rate Limiting

- **Failed Login Attempts:** Limited to prevent brute force attacks
- **Registration:** Rate limited to prevent account creation spam
- **Token Verification:** Higher rate limit for frequent checks

### SQL Injection Prevention

- All inputs validated and sanitized
- Parameterized queries used throughout
- Special characters in passwords handled safely

### Data Protection

- Sensitive fields (password hash) never returned in responses
- Email addresses validated before use
- Contact numbers validated for format
- CORS enabled only for frontend origin

---

## Implementation Examples

### JavaScript/Fetch API

#### Patient Registration

```javascript
async function registerPatient() {
  try {
    const response = await fetch(
      "http://localhost:3000/api/auth/patient/register",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          full_name: "John Doe",
          email: "john@example.com",
          contact_number: "+94712345678",
          password: "SecurePassword@123",
        }),
      },
    );

    const data = await response.json();
    if (data.success) {
      console.log("Registration successful:", data.data);
      // Store user info and redirect
    } else {
      console.error("Registration failed:", data.errors);
    }
  } catch (error) {
    console.error("Request error:", error);
  }
}
```

#### Patient Login

```javascript
async function loginPatient() {
  try {
    const response = await fetch(
      "http://localhost:3000/api/auth/patient/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier: "john@example.com",
          password: "SecurePassword@123",
        }),
      },
    );

    const data = await response.json();
    if (data.success) {
      // Store token securely
      localStorage.setItem("authToken", data.data.token);
      console.log("Login successful");
    } else {
      console.error("Login failed:", data.message);
    }
  } catch (error) {
    console.error("Request error:", error);
  }
}
```

#### Get Profile with Authentication

```javascript
async function getProfile() {
  try {
    const token = localStorage.getItem("authToken");
    const response = await fetch("http://localhost:3000/api/auth/profile", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (data.success) {
      console.log("Profile:", data.data);
    } else {
      console.error("Failed to fetch profile:", data.message);
    }
  } catch (error) {
    console.error("Request error:", error);
  }
}
```

### cURL Examples

#### Patient Registration

```bash
curl -X POST http://localhost:3000/api/auth/patient/register \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "John Doe",
    "email": "john@example.com",
    "contact_number": "+94712345678",
    "password": "SecurePassword@123"
  }'
```

#### Patient Login

```bash
curl -X POST http://localhost:3000/api/auth/patient/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "john@example.com",
    "password": "SecurePassword@123"
  }'
```

#### Get Profile

```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer <your_token>"
```

---

## Common Integration Patterns

### Conditional Login Routes

Use the user's role to determine post-login navigation:

```javascript
const loginResponse = await authService.login(credentials);
const userRole = loginResponse.user.role;

if (userRole === "patient") {
  navigate("/patient/dashboard");
} else {
  navigate("/staff/dashboard");
}
```

### Token Refresh Strategy

Implement automatic token refresh before expiration:

```javascript
// Check token expiry and refresh if needed
const isTokenExpiring = () => {
  const token = localStorage.getItem("authToken");
  const decoded = jwt_decode(token);
  const expiresAt = decoded.exp * 1000;
  return Date.now() > expiresAt - 300000; // 5 minutes buffer
};
```

### Protected Route Implementation

```javascript
function ProtectedRoute({ children }) {
  const token = localStorage.getItem("authToken");

  if (!token) {
    return <Navigate to="/login" />;
  }

  return children;
}
```

---

## Troubleshooting

### Common Issues

| Issue                  | Cause                                | Solution                                       |
| ---------------------- | ------------------------------------ | ---------------------------------------------- |
| "Invalid email format" | Email doesn't match standard pattern | Use valid email (user@domain.com)              |
| "Password too weak"    | Doesn't meet complexity requirements | Add uppercase, lowercase, number, special char |
| "Token is invalid"     | Token expired or malformed           | Re-login to get new token                      |
| "User not found"       | Wrong identifier or typo             | Check email/member ID/contact number           |
| "CORS error"           | Cross-origin request blocked         | Check frontend origin in CORS config           |

---

## Best Practices

1. **Never store passwords in plain text**
2. **Always use HTTPS in production**
3. **Implement token refresh mechanism**
4. **Use httpOnly cookies for token storage**
5. **Validate all inputs on both client and server**
6. **Implement rate limiting on authentication endpoints**
7. **Log authentication attempts for security audit**
8. **Clear tokens when user logs out**
9. **Implement password reset functionality**
10. **Use strong password requirements**

---

**End of Document**
