# AI Doctor Medical Consultation API Documentation

## MediLab - RapidAPI Integration Guide

**Date:** February 22, 2026  
**Version:** 1.0  
**Module:** Medical Consultation (AI Doctor)

---

## Table of Contents

1. [Overview](#overview)
2. [Module Structure](#module-structure)
3. [Environment Configuration](#environment-configuration)
4. [API Endpoints](#api-endpoints)
5. [Usage Examples](#usage-examples)
6. [Authentication](#authentication)
7. [Error Handling](#error-handling)
8. [Dependencies](#dependencies)

---

## Overview

The AI Doctor Medical Consultation module integrates RapidAPI's AI Doctor chatbot to provide intelligent medical consultation services within the MediLab system. This module enables:

- Medical question answering
- Symptom analysis
- Medication information lookup
- Lifestyle and prevention advice
- Condition-specific medical information

### Key Features

✅ **Modern Implementation** - Uses Axios instead of deprecated `request` library  
✅ **Secure** - All endpoints require JWT authentication  
✅ **Validated** - Input validation using express-validator  
✅ **Error Handling** - Comprehensive error handling with meaningful messages  
✅ **Specialized Methods** - Multiple endpoint types for different use cases  

---

## Module Structure

```
apps/backend/src/modules/consultation/
├── consultation.service.js     - RapidAPI integration logic
├── consultation.controller.js  - Request handlers
├── consultation.routes.js      - API route definitions
└── consultation.validation.js  - Input validation rules
```

### File Descriptions

**consultation.service.js**
- Handles all API calls to RapidAPI AI Doctor
- Manages error handling and response formatting
- Provides specialized methods for different consultation types

**consultation.controller.js**
- Processes HTTP requests
- Validates request data
- Returns formatted responses

**consultation.routes.js**
- Defines API endpoints
- Applies authentication middleware
- Implements validation chains

**consultation.validation.js**
- Defines validation rules for each endpoint
- Ensures data integrity and security

---

## Environment Configuration

### .env File Setup

Add the following variables to your `.env` file:

```env
# JWT Authentication Configuration
JWT_SECRET=c6e0eb85b7a5725bcc74fd266b43bdf45cc88fa791d984b794034ed710313cbbcb476dd17cfd77651f8798f02b739de7b2f880c19ee86d29046b40b77c5978ed
JWT_EXPIRY=7d

# RapidAPI AI Doctor/Medical Chatbot Configuration
RAPIDAPI_AI_DOCTOR_KEY=1c91a24d9emsh66d214e5898ec3ap1d29e7jsn6f7a732883bc
RAPIDAPI_AI_DOCTOR_HOST=ai-doctor-api-ai-medical-chatbot-healthcare-ai-assistant.p.rapidapi.com
RAPIDAPI_AI_DOCTOR_URL=https://ai-doctor-api-ai-medical-chatbot-healthcare-ai-assistant.p.rapidapi.com
```

### Required Dependencies

Install the following packages:

```bash
npm install axios bcryptjs jsonwebtoken express-validator
```

---

## API Endpoints

### Base URL
```
http://localhost:5000/api/consultation
```

### 1. Ask AI Doctor

**Endpoint:** `POST /api/consultation/ask`  
**Authentication:** Required (Bearer Token)  
**Description:** Ask the AI Doctor any medical question

**Request Headers:**
```json
{
  "Authorization": "Bearer <your-jwt-token>",
  "Content-Type": "application/json"
}
```

**Request Body:**
```json
{
  "message": "What are common brain tumors?",
  "specialization": "neurosurgery",
  "language": "en"
}
```

**Parameters:**
- `message` (required, string, 3-1000 chars) - The medical question
- `specialization` (optional, string) - Medical specialty (default: "general")
- `language` (optional, string) - Language code (default: "en")

**Specializations Available:**
- general
- neurosurgery
- cardiology
- orthopedics
- pediatrics
- dermatology
- psychiatry
- ophthalmology
- gynecology
- oncology
- pharmacy
- surgery
- internal_medicine

**Response:**
```json
{
  "success": true,
  "message": "AI Doctor response received",
  "data": {
    // AI Doctor response data
  }
}
```

---

### 2. Get Medical Information

**Endpoint:** `POST /api/consultation/medical-info`  
**Authentication:** Required (Bearer Token)  
**Description:** Get detailed information about a specific medical condition

**Request Body:**
```json
{
  "condition": "diabetes",
  "specialization": "general"
}
```

**Parameters:**
- `condition` (required, string, 2-200 chars) - Medical condition name
- `specialization` (optional, string) - Medical specialty

**Response:**
```json
{
  "success": true,
  "message": "Medical information retrieved",
  "data": {
    // Detailed medical information
  }
}
```

---

### 3. Analyze Symptoms

**Endpoint:** `POST /api/consultation/analyze-symptoms`  
**Authentication:** Required (Bearer Token)  
**Description:** Analyze patient symptoms and get possible conditions

**Request Body:**
```json
{
  "symptoms": ["headache", "fever", "fatigue", "body aches"],
  "patientInfo": {
    "age": 35,
    "gender": "MALE"
  }
}
```

**Parameters:**
- `symptoms` (required, array of strings) - List of symptoms (min 1 symptom)
- `patientInfo` (optional, object) - Additional patient context
  - `age` (optional, number, 0-150) - Patient age
  - `gender` (optional, string) - MALE, FEMALE, or OTHER

**Response:**
```json
{
  "success": true,
  "message": "Symptoms analyzed",
  "data": {
    // Analysis results with possible conditions
  }
}
```

---

### 4. Get Medication Information

**Endpoint:** `POST /api/consultation/medication-info`  
**Authentication:** Required (Bearer Token)  
**Description:** Get comprehensive information about a medication

**Request Body:**
```json
{
  "medicationName": "Aspirin"
}
```

**Parameters:**
- `medicationName` (required, string, 2-200 chars) - Name of the medication

**Response:**
```json
{
  "success": true,
  "message": "Medication information retrieved",
  "data": {
    // Medication details including uses, dosage, side effects
  }
}
```

---

### 5. Get Lifestyle Advice

**Endpoint:** `POST /api/consultation/lifestyle-advice`  
**Authentication:** Required (Bearer Token)  
**Description:** Get lifestyle and prevention recommendations for a condition

**Request Body:**
```json
{
  "condition": "high blood pressure"
}
```

**Parameters:**
- `condition` (required, string, 2-200 chars) - Health condition or concern

**Response:**
```json
{
  "success": true,
  "message": "Lifestyle advice retrieved",
  "data": {
    // Lifestyle recommendations and prevention methods
  }
}
```

---

### 6. Check API Health

**Endpoint:** `GET /api/consultation/health`  
**Authentication:** Not Required  
**Description:** Check if the AI Doctor API is operational

**Response:**
```json
{
  "success": true,
  "message": "AI Doctor API is operational",
  "data": {
    "status": "online"
  }
}
```

---

## Usage Examples

### Example 1: Complete Patient Symptom Analysis Flow

```javascript
// 1. Patient logs in
const loginResponse = await fetch('http://localhost:5000/api/auth/patient/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    identifier: '0771234567',
    password: 'SecurePass123'
  })
});

const { token } = await loginResponse.json();

// 2. Analyze symptoms
const symptomResponse = await fetch('http://localhost:5000/api/consultation/analyze-symptoms', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    symptoms: ['persistent cough', 'chest pain', 'shortness of breath'],
    patientInfo: {
      age: 45,
      gender: 'MALE'
    }
  })
});

const analysis = await symptomResponse.json();
console.log(analysis);
```

### Example 2: Medication Lookup

```javascript
const response = await fetch('http://localhost:5000/api/consultation/medication-info', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${yourToken}`
  },
  body: JSON.stringify({
    medicationName: 'Metformin'
  })
});

const medicationInfo = await response.json();
```

### Example 3: General Medical Query

```javascript
const response = await fetch('http://localhost:5000/api/consultation/ask', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${yourToken}`
  },
  body: JSON.stringify({
    message: 'What are the early warning signs of a heart attack?',
    specialization: 'cardiology',
    language: 'en'
  })
});

const answer = await response.json();
```

---

## Authentication

All endpoints (except `/health`) require JWT authentication.

### Getting a Token

**For Patients:**
```http
POST /api/auth/patient/login
Content-Type: application/json

{
  "identifier": "member_id or NIC or contact_number",
  "password": "your_password"
}
```

**For Health Officers:**
```http
POST /api/auth/health-officer/login
Content-Type: application/json

{
  "identifier": "employeeId or email or username",
  "password": "your_password"
}
```

### Using the Token

Include the token in the Authorization header:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Token Payload

**Patient Token:**
```json
{
  "id": "patient_id",
  "member_id": "MEM-ANU-PADGNDIV-2026-00001",
  "userType": "patient",
  "full_name": "John Doe"
}
```

**Health Officer Token:**
```json
{
  "id": "officer_id",
  "employeeId": "EMP-2024-001",
  "userType": "healthOfficer",
  "role": "Lab_Technician",
  "fullName": "Dr. Jane Smith"
}
```

---

## Error Handling

### Common Error Responses

**Validation Error (400):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "msg": "Message is required",
      "param": "message",
      "location": "body"
    }
  ]
}
```

**Authentication Error (401):**
```json
{
  "success": false,
  "message": "Access denied. No token provided or invalid format. Use: Bearer <token>"
}
```

**Rate Limit Error (429):**
```json
{
  "success": false,
  "message": "API rate limit exceeded. Please try again later."
}
```

**API Authentication Error (401/403):**
```json
{
  "success": false,
  "message": "API authentication failed. Please check your API key."
}
```

**Server Error (500):**
```json
{
  "success": false,
  "message": "Failed to get response from AI Doctor"
}
```

---

## Dependencies

### Required NPM Packages

```json
{
  "dependencies": {
    "axios": "^1.6.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.0",
    "express": "^4.18.2",
    "express-validator": "^7.3.1",
    "mongoose": "^9.2.1",
    "cors": "^2.8.6",
    "dotenv": "^17.3.1",
    "morgan": "^1.10.1"
  }
}
```

### Installation Command

```bash
cd apps/backend
npm install axios bcryptjs jsonwebtoken
```

---

## Integration Checklist

- [x] Install required dependencies (axios, bcryptjs, jsonwebtoken)
- [x] Update `.env` file with RapidAPI credentials
- [x] Create consultation module files
- [x] Integrate routes in `app.js`
- [x] Implement authentication middleware
- [x] Add input validation
- [x] Test API endpoints
- [ ] Set up rate limiting (recommended for production)
- [ ] Add request logging
- [ ] Implement caching for frequent queries (optional)

---

## Best Practices

1. **Always authenticate** - Never expose medical endpoints publicly
2. **Validate input** - Use the provided validation middleware
3. **Handle errors gracefully** - Provide meaningful error messages
4. **Rate limiting** - Implement to prevent API quota exhaustion
5. **Log requests** - Track API usage for monitoring
6. **Cache responses** - Consider caching for frequently asked questions
7. **Sanitize output** - Ensure AI responses are safe before displaying

---

## Security Considerations

### API Key Protection
- Never commit API keys to version control
- Store in environment variables only
- Rotate keys periodically
- Monitor API usage on RapidAPI dashboard

### Authentication
- Use strong JWT secrets
- Set appropriate token expiration
- Validate tokens on every request
- Implement token refresh mechanism

### Input Validation
- Validate all user inputs
- Sanitize strings to prevent injection
- Limit request sizes
- Implement rate limiting

---

## Support and Resources

### RapidAPI Resources
- **API Dashboard:** https://rapidapi.com/developer/dashboard
- **AI Doctor API:** https://rapidapi.com/ai-doctor-api/api/ai-doctor-api-ai-medical-chatbot-healthcare-ai-assistant
- **Documentation:** Check your RapidAPI subscription for detailed docs

### MediLab Resources
- **Backend Code:** `apps/backend/src/modules/consultation/`
- **Environment Config:** `.env` file
- **Main Application:** `apps/backend/src/app.js`

---

## Troubleshooting

### Issue: "API authentication failed"
**Solution:** Verify your `RAPIDAPI_AI_DOCTOR_KEY` in `.env` file

### Issue: "Rate limit exceeded"
**Solution:** Check your RapidAPI subscription limits and implement caching

### Issue: "Token is invalid or expired"
**Solution:** Login again to get a new token

### Issue: "Cannot find module 'axios'"
**Solution:** Run `npm install axios` in the backend directory

---

## Changelog

### Version 1.0 (February 22, 2026)
- Initial implementation
- Basic AI Doctor integration
- Authentication system
- Input validation
- Error handling
- Multiple consultation types

---

## License

This module is part of the MediLab Rural Health Care Management System.

---

**Document End**
