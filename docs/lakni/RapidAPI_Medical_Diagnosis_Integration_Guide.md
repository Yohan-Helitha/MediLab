# 🩺 RapidAPI Medical Diagnosis Integration Guide

## 🚀 **Setup Instructions**

### 1. **Sign up for RapidAPI (FREE Account)**

- Visit: [https://rapidapi.com/hub](https://rapidapi.com/hub)
- Create free account
- Navigate to: [https://rapidapi.com/developer/security](https://rapidapi.com/developer/security)
- Copy your **RapidAPI Key** (X-RapidAPI-Key)

### 2. **Subscribe to Medical API**

Choose one of these popular medical diagnosis APIs:

**Option A: Priaid Symptom Checker API** (Recommended)
- Visit: [https://rapidapi.com/priaid/api/priaid-symptom-checker-v1](https://rapidapi.com/priaid/api/priaid-symptom-checker-v1)
- Click "Subscribe to Test"
- Select **Basic (Free)** plan
- Test endpoints available

**Option B: Medical Diagnosis API**
- Alternative medical diagnosis API
- Similar functionality

### 3. **Update .env file**

```env
RAPIDAPI_KEY=your_rapidapi_key_here
RAPIDAPI_HOST=priaid-symptom-checker-v1.p.rapidapi.com
RAPIDAPI_BASE_URL=https://priaid-symptom-checker-v1.p.rapidapi.com
```

---

## 📋 **Why RapidAPI?**

| Feature | RapidAPI | Others |
|---------|----------|--------|
| **Reliability** | ✅ High uptime | ⚠️ Variable |
| **Free Tier** | ✅ Yes (Basic plan) | ✅ Limited |
| **Easy Setup** | ✅ Single API key | ❌ Multiple credentials |
| **API Marketplace** | ✅ Multiple medical APIs | ❌ Single provider |
| **Documentation** | ✅ Interactive testing | ⚠️ Variable |
| **Support** | ✅ Community + Docs | ⚠️ Limited |

---

## 🔥 **Available Endpoints (Priaid Symptom Checker)**

### 1. **Get All Available Symptoms**

```http
GET /api/diagnosis/symptoms
Authorization: Bearer {your_jwt_token}
```

**Backend Implementation:**
```javascript
GET https://priaid-symptom-checker-v1.p.rapidapi.com/symptoms?language=en-gb&format=json
Headers:
  X-RapidAPI-Key: {RAPIDAPI_KEY}
  X-RapidAPI-Host: priaid-symptom-checker-v1.p.rapidapi.com
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "ID": 10,
      "Name": "Abdominal pain"
    },
    {
      "ID": 238,
      "Name": "Anxiety"
    },
    {
      "ID": 104,
      "Name": "Back pain"
    }
  ],
  "message": "Symptoms fetched successfully"
}
```

---

### 2. **Get Diagnosis from Symptoms**

```http
POST /api/diagnosis/analyze
Authorization: Bearer {your_jwt_token}
Content-Type: application/json

{
  "symptoms": [10, 238],
  "gender": "female",
  "yearOfBirth": 1990
}
```

**Backend Implementation:**
```javascript
GET https://priaid-symptom-checker-v1.p.rapidapi.com/diagnosis?symptoms=[10,238]&gender=female&year_of_birth=1990&language=en-gb
Headers:
  X-RapidAPI-Key: {RAPIDAPI_KEY}
  X-RapidAPI-Host: priaid-symptom-checker-v1.p.rapidapi.com
```

**Response:**
```json
{
  "success": true,
  "data": {
    "diagnosis": [
      {
        "Issue": {
          "ID": 281,
          "Name": "Tension headache",
          "Accuracy": 72.5,
          "Icd": "G44.2",
          "IcdName": "Tension-type headache",
          "ProfName": "Cephalgia tensiva",
          "Ranking": 1
        },
        "Specialisation": [
          {
            "ID": 15,
            "Name": "General practice",
            "SpecialistID": 0
          }
        ]
      }
    ],
    "testRecommendations": [
      {
        "condition": "Tension headache",
        "accuracy": 72.5,
        "icd": "G44.2",
        "urgency": "Routine",
        "recommendedTests": [
          "Complete Blood Count",
          "Basic Metabolic Panel"
        ],
        "specialization": "General practice"
      }
    ],
    "summary": {
      "totalConditions": 1,
      "mostLikelyCondition": "Tension headache",
      "topAccuracy": 72.5
    }
  }
}
```

---

### 3. **Get Specialized Symptoms by Body Location**

```http
GET /api/diagnosis/symptoms/body-location/:locationId?gender=male
Authorization: Bearer {your_jwt_token}
```

**Backend Implementation:**
```javascript
GET https://priaid-symptom-checker-v1.p.rapidapi.com/symptoms/man/6?language=en-gb
// locationId: 6 = Head, 7 = Abdomen, etc.
Headers:
  X-RapidAPI-Key: {RAPIDAPI_KEY}
  X-RapidAPI-Host: priaid-symptom-checker-v1.p.rapidapi.com
```

---

### 4. **Get Body Locations**

```http
GET /api/diagnosis/body-locations
Authorization: Bearer {your_jwt_token}
```

**Backend Implementation:**
```javascript
GET https://priaid-symptom-checker-v1.p.rapidapi.com/body/locations?language=en-gb
Headers:
  X-RapidAPI-Key: {RAPIDAPI_KEY}
  X-RapidAPI-Host: priaid-symptom-checker-v1.p.rapidapi.com
```

**Response:**
```json
{
  "success": true,
  "data": [
    { "ID": 6, "Name": "Head" },
    { "ID": 7, "Name": "Abdomen" },
    { "ID": 15, "Name": "Chest" }
  ]
}
```

---

### 5. **Get Detailed Issue/Condition Information**

```http
GET /api/diagnosis/condition/:issueId
Authorization: Bearer {your_jwt_token}
```

**Backend Implementation:**
```javascript
GET https://priaid-symptom-checker-v1.p.rapidapi.com/issues/281/info?language=en-gb
Headers:
  X-RapidAPI-Key: {RAPIDAPI_KEY}
  X-RapidAPI-Host: priaid-symptom-checker-v1.p.rapidapi.com
```

**Response:**
```json
{
  "success": true,
  "data": {
    "Name": "Tension headache",
    "ProfName": "Cephalgia tensiva",
    "Icd": "G44.2",
    "Description": "Tension headaches are the most common type...",
    "DescriptionShort": "Most common headache type",
    "MedicalCondition": "Headache is characterized by...",
    "TreatmentDescription": "Over-the-counter pain relievers...",
    "PossibleSymptoms": "Mild to moderate pain..."
  }
}
```

---

## 🔧 **Backend Implementation Example**

### **Environment Config (apps/backend/src/config/environment.js)**

```javascript
export const RAPIDAPI_CONFIG = {
  apiKey: process.env.RAPIDAPI_KEY,
  apiHost: process.env.RAPIDAPI_HOST,
  baseUrl: process.env.RAPIDAPI_BASE_URL
};
```

### **RapidAPI Service (apps/backend/src/services/rapidapi.service.js)**

```javascript
import axios from 'axios';
import { RAPIDAPI_CONFIG } from '../config/environment.js';

class RapidAPIService {
  constructor() {
    this.client = axios.create({
      baseURL: RAPIDAPI_CONFIG.baseUrl,
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_CONFIG.apiKey,
        'X-RapidAPI-Host': RAPIDAPI_CONFIG.apiHost
      }
    });
  }

  // Get all symptoms
  async getSymptoms(language = 'en-gb') {
    try {
      const response = await this.client.get('/symptoms', {
        params: { language, format: 'json' }
      });
      return response.data;
    } catch (error) {
      console.error('RapidAPI getSymptoms error:', error.response?.data || error.message);
      throw new Error('Failed to fetch symptoms from RapidAPI');
    }
  }

  // Get symptoms by body location
  async getSymptomsByLocation(locationId, gender = 'male', language = 'en-gb') {
    try {
      const genderPath = gender.toLowerCase() === 'female' ? 'woman' : 'man';
      const response = await this.client.get(`/symptoms/${genderPath}/${locationId}`, {
        params: { language }
      });
      return response.data;
    } catch (error) {
      console.error('RapidAPI getSymptomsByLocation error:', error.response?.data || error.message);
      throw new Error('Failed to fetch symptoms by location');
    }
  }

  // Get body locations
  async getBodyLocations(language = 'en-gb') {
    try {
      const response = await this.client.get('/body/locations', {
        params: { language }
      });
      return response.data;
    } catch (error) {
      console.error('RapidAPI getBodyLocations error:', error.response?.data || error.message);
      throw new Error('Failed to fetch body locations');
    }
  }

  // Get diagnosis from symptoms
  async getDiagnosis(symptoms, gender, yearOfBirth, language = 'en-gb') {
    try {
      // Convert symptoms array to JSON string format
      const symptomsParam = JSON.stringify(symptoms);
      
      const response = await this.client.get('/diagnosis', {
        params: {
          symptoms: symptomsParam,
          gender: gender.toLowerCase(),
          year_of_birth: yearOfBirth,
          language
        }
      });
      return response.data;
    } catch (error) {
      console.error('RapidAPI getDiagnosis error:', error.response?.data || error.message);
      throw new Error('Failed to get diagnosis from RapidAPI');
    }
  }

  // Get issue (condition) information
  async getIssueInfo(issueId, language = 'en-gb') {
    try {
      const response = await this.client.get(`/issues/${issueId}/info`, {
        params: { language }
      });
      return response.data;
    } catch (error) {
      console.error('RapidAPI getIssueInfo error:', error.response?.data || error.message);
      throw new Error('Failed to fetch issue information');
    }
  }

  // Get specializations
  async getSpecializations(language = 'en-gb') {
    try {
      const response = await this.client.get('/specialisations', {
        params: { language }
      });
      return response.data;
    } catch (error) {
      console.error('RapidAPI getSpecializations error:', error.response?.data || error.message);
      throw new Error('Failed to fetch specializations');
    }
  }

  // Combined analysis: diagnosis + test recommendations
  async analyzeSymptoms(symptoms, gender, age, language = 'en-gb') {
    try {
      const currentYear = new Date().getFullYear();
      const yearOfBirth = currentYear - age;

      const diagnosis = await this.getDiagnosis(symptoms, gender, yearOfBirth, language);

      // Map to test recommendations
      const testRecommendations = diagnosis.map(item => ({
        condition: item.Issue.Name,
        accuracy: item.Issue.Accuracy,
        icd: item.Issue.Icd,
        icdName: item.Issue.IcdName,
        ranking: item.Issue.Ranking,
        urgency: this.determineUrgency(item.Issue.Accuracy),
        recommendedTests: this.getTestsForCondition(item.Issue.ID),
        specialization: item.Specialisation?.[0]?.Name || 'General practice'
      }));

      return {
        diagnosis,
        testRecommendations,
        summary: {
          totalConditions: diagnosis.length,
          mostLikelyCondition: diagnosis[0]?.Issue?.Name || 'Unknown',
          topAccuracy: diagnosis[0]?.Issue?.Accuracy || 0
        }
      };
    } catch (error) {
      console.error('RapidAPI analyzeSymptoms error:', error.message);
      throw error;
    }
  }

  // Determine urgency based on accuracy and ranking
  determineUrgency(accuracy) {
    if (accuracy >= 80) return 'High - Immediate consultation recommended';
    if (accuracy >= 60) return 'Moderate - Schedule appointment soon';
    return 'Low - Monitor symptoms';
  }

  // Map conditions to lab tests (customize based on your lab module)
  getTestsForCondition(issueId) {
    const testMap = {
      281: ['Complete Blood Count', 'Basic Metabolic Panel'], // Tension headache
      11: ['Blood Glucose Test', 'HbA1c Test'], // Diabetes
      // Add more mappings based on your test catalog
    };
    return testMap[issueId] || ['Complete Blood Count', 'Basic Health Panel'];
  }
}

export default new RapidAPIService();
```

### **Diagnosis Controller**

```javascript
import rapidAPIService from '../services/rapidapi.service.js';

export const getAllSymptoms = async (req, res, next) => {
  try {
    const { language = 'en-gb' } = req.query;
    
    const symptoms = await rapidAPIService.getSymptoms(language);

    return res.status(200).json({
      success: true,
      data: symptoms,
      message: 'Symptoms fetched successfully'
    });
  } catch (error) {
    console.error('Get symptoms error:', error.message);
    next(error);
  }
};

export const analyzeSymptoms = async (req, res, next) => {
  try {
    const { symptoms, gender, age, language = 'en-gb' } = req.body;

    // Validate input
    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Symptoms array is required'
      });
    }

    if (!gender || !age) {
      return res.status(400).json({
        success: false,
        message: 'Patient gender and age are required'
      });
    }

    // Call RapidAPI
    const result = await rapidAPIService.analyzeSymptoms(symptoms, gender, age, language);

    return res.status(200).json({
      success: true,
      data: result,
      message: 'Diagnosis analysis completed successfully'
    });
  } catch (error) {
    console.error('Diagnosis error:', error.message);
    next(error);
  }
};

export const getBodyLocations = async (req, res, next) => {
  try {
    const { language = 'en-gb' } = req.query;
    
    const locations = await rapidAPIService.getBodyLocations(language);

    return res.status(200).json({
      success: true,
      data: locations,
      message: 'Body locations fetched successfully'
    });
  } catch (error) {
    console.error('Get body locations error:', error.message);
    next(error);
  }
};

export const getConditionInfo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { language = 'en-gb' } = req.query;
    
    const info = await rapidAPIService.getIssueInfo(id, language);

    return res.status(200).json({
      success: true,
      data: info,
      message: 'Condition information fetched successfully'
    });
  } catch (error) {
    console.error('Get condition info error:', error.message);
    next(error);
  }
};
```

---

## 🎯 **Integration with Family Health System**

### **Example: Health Officer Workflow**

1. **Health Officer logs in**
2. **Patient arrives with complaints**
3. **Health Officer selects body location** (e.g., Head)
4. **System shows relevant symptoms** for that location
5. **Health Officer selects applicable symptoms**
6. **System queries RapidAPI** with patient age and gender
7. **AI returns:**
   - Possible conditions (ranked by accuracy)
   - ICD-10 codes
   - Recommended specializations
   - Test recommendations
8. **Health Officer:**
   - Reviews diagnosis suggestions
   - Records clinical notes
   - Creates test bookings
   - Creates referrals if needed

---

## 📊 **Request/Response Examples**

### **Get Symptoms Request**
```http
GET https://priaid-symptom-checker-v1.p.rapidapi.com/symptoms?language=en-gb&format=json
X-RapidAPI-Key: your_key_here
X-RapidAPI-Host: priaid-symptom-checker-v1.p.rapidapi.com
```

### **Diagnosis Request**
```http
GET https://priaid-symptom-checker-v1.p.rapidapi.com/diagnosis?symptoms=[10,238]&gender=female&year_of_birth=1990&language=en-gb
X-RapidAPI-Key: your_key_here
X-RapidAPI-Host: priaid-symptom-checker-v1.p.rapidapi.com
```

---

## 🎓 **Perfect for Campus Project**

✅ **FREE Basic plan** - Good for development  
✅ **Easy setup** - Single API key  
✅ **Interactive testing** - Test in RapidAPI dashboard  
✅ **Reliable** - Hosted on RapidAPI infrastructure  
✅ **Educational use** - Allowed  
✅ **ICD-10 codes** - Standard medical coding  
✅ **Specialization recommendations** - Referral guidance  

---

## 🚨 **Important Notes**

- **Not for real medical use** - Educational/demo purposes only
- **Rate limited** - Check your plan limits
- **Requires internet** - Third-party API dependency
- **Authentication required** - Health Officer role only
- **Language support** - en-gb, de-de, es-es, fr-fr, etc.

---

## 📝 **Error Handling**

### **Common Errors:**

| Status | Error | Solution |
|--------|-------|----------|
| 401 | Unauthorized | Check X-RapidAPI-Key |
| 403 | Forbidden | Subscribe to API in RapidAPI dashboard |
| 429 | Rate limit exceeded | Upgrade plan or wait for reset |
| 400 | Invalid parameters | Check symptom IDs, gender, year_of_birth |

### **Example Error Response:**

```json
{
  "success": false,
  "message": "RapidAPI error: Invalid API key",
  "errorCode": "RAPIDAPI_ERROR",
  "details": {
    "status": 401,
    "rapidapi_message": "Invalid API key. Go to https://docs.rapidapi.com/docs/keys to learn how to get your API key."
  }
}
```

---

## 🔗 **Useful Links**

- **RapidAPI Hub:** https://rapidapi.com/hub
- **Priaid API:** https://rapidapi.com/priaid/api/priaid-symptom-checker-v1
- **API Dashboard:** https://rapidapi.com/developer/dashboard
- **Your Keys:** https://rapidapi.com/developer/security
- **Documentation:** https://rapidapi.com/priaid/api/priaid-symptom-checker-v1/details

---

## 💡 **Testing in RapidAPI Dashboard**

1. Go to API page
2. Click **"Test Endpoint"** tab
3. Select endpoint (e.g., GET /symptoms)
4. Click **"Test Endpoint"** button
5. View response in dashboard
6. Copy working code to your backend

---

**Document Status:** ✅ Complete  
**Integration Status:** Ready for implementation  
**Last Updated:** February 19, 2026

---

*Switched from Infermedica to RapidAPI (Priaid Symptom Checker). RapidAPI provides easier setup with single API key and reliable medical diagnosis capabilities.*


## 🚀 **Setup Instructions**

### 1. **Sign up for Infermedica (FREE Development Account)**

- Visit: [https://developer.infermedica.com/](https://developer.infermedica.com/)
- Create free developer account (500 API calls/month - perfect for campus project)
- Get your credentials from dashboard:
  - **App-Id**
  - **App-Key** (API Key)

### 2. **Update .env file**

```env
INFERMEDICA_APP_ID=your_infermedica_app_id_here
INFERMEDICA_APP_KEY=your_infermedica_app_key_here
INFERMEDICA_API_URL=https://api.infermedica.com/v3
```

---

## 📋 **Why Infermedica over ApiMedic?**

| Feature             | Infermedica                  | ApiMedic               |
| ------------------- | ---------------------------- | ---------------------- |
| **AI Engine**       | Advanced machine learning    | Basic symptom matching |
| **API Reliability** | ✅ High uptime               | ⚠️ Frequent issues     |
| **Documentation**   | ✅ Comprehensive             | ❌ Limited             |
| **Free Tier**       | 500 calls/month              | 1000 calls/month       |
| **Triage Support**  | ✅ Yes (urgency levels)      | ❌ No                  |
| **Risk Factors**    | ✅ Age, sex, risk factors    | ❌ Basic only          |
| **Medical Content** | ✅ ICD-10 codes              | ✅ ICD-10 codes        |
| **Interview Flow**  | ✅ Smart follow-up questions | ❌ Static              |

---

## 🔥 **Available Endpoints**

### 1. **Get All Available Symptoms**

```http
GET /api/diagnosis/symptoms
Authorization: Bearer {your_jwt_token}
```

**Backend Implementation:**

```javascript
GET https://api.infermedica.com/v3/symptoms
Headers:
  App-Id: {INFERMEDICA_APP_ID}
  App-Key: {INFERMEDICA_APP_KEY}
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "s_1",
      "name": "Abdominal pain",
      "common_name": "Stomach ache",
      "sex_filter": "both",
      "category": "Symptoms"
    },
    {
      "id": "s_98",
      "name": "Headache",
      "common_name": "Head pain",
      "sex_filter": "both",
      "category": "Symptoms"
    }
  ],
  "message": "Symptoms fetched successfully"
}
```

---

### 2. **Search Symptoms by Name**

```http
GET /api/diagnosis/symptoms/search?query=headache
Authorization: Bearer {your_jwt_token}
```

**Backend Implementation:**

```javascript
GET https://api.infermedica.com/v3/search?phrase=headache&sex=female&max_results=10
Headers:
  App-Id: {INFERMEDICA_APP_ID}
  App-Key: {INFERMEDICA_APP_KEY}
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "s_98",
      "label": "Headache",
      "type": "symptom"
    },
    {
      "id": "s_1193",
      "label": "Severe headache",
      "type": "symptom"
    }
  ],
  "message": "Search completed successfully"
}
```

---

### 3. **Get Diagnosis with Triage & Test Recommendations**

```http
POST /api/diagnosis/analyze
Authorization: Bearer {your_jwt_token}
Content-Type: application/json

{
  "symptoms": [
    { "id": "s_98", "choice_id": "present", "source": "initial" },
    { "id": "s_107", "choice_id": "present", "source": "initial" }
  ],
  "sex": "female",
  "age": 30,
  "interview_id": null
}
```

**Backend Implementation:**

```javascript
// Step 1: Get Diagnosis
POST https://api.infermedica.com/v3/diagnosis
Headers:
  App-Id: {INFERMEDICA_APP_ID}
  App-Key: {INFERMEDICA_APP_KEY}
  Content-Type: application/json
Body: {
  "sex": "female",
  "age": { "value": 30 },
  "evidence": [
    { "id": "s_98", "choice_id": "present", "source": "initial" },
    { "id": "s_107", "choice_id": "present", "source": "initial" }
  ]
}

// Step 2: Get Triage (urgency level)
POST https://api.infermedica.com/v3/triage
[Same headers and similar body]
```

**Response:**

```json
{
  "success": true,
  "data": {
    "diagnosis": {
      "conditions": [
        {
          "id": "c_62",
          "name": "Tension headache",
          "common_name": "Tension-type headache",
          "probability": 0.67,
          "icd10_code": "G44.2"
        },
        {
          "id": "c_55",
          "name": "Migraine",
          "common_name": "Migraine",
          "probability": 0.45,
          "icd10_code": "G43"
        }
      ],
      "extras": {
        "interview_complete": true
      }
    },
    "triage": {
      "triage_level": "consultation",
      "serious": [
        {
          "id": "c_62",
          "name": "Tension headache",
          "common_name": "Tension-type headache"
        }
      ],
      "teleconsultation_applicable": true
    },
    "testRecommendations": [
      {
        "condition": "Tension headache",
        "accuracy": 67,
        "urgency": "Consultation",
        "recommendedTests": ["Complete Blood Count", "Basic Metabolic Panel"],
        "triageLevel": "consultation",
        "teleconsultationOk": true
      },
      {
        "condition": "Migraine",
        "accuracy": 45,
        "urgency": "Consultation",
        "recommendedTests": [
          "Neurological Examination",
          "CT Scan (if persistent)"
        ],
        "triageLevel": "consultation",
        "teleconsultationOk": true
      }
    ],
    "summary": {
      "topCondition": "Tension headache",
      "triageLevel": "consultation",
      "urgencyDescription": "Consultation with doctor recommended within 24 hours"
    }
  }
}
```

---

### 4. **Smart Interview Mode (Follow-up Questions)**

**Use Case:** AI asks targeted questions to narrow down diagnosis

```http
POST /api/diagnosis/interview
Authorization: Bearer {your_jwt_token}
Content-Type: application/json

{
  "symptoms": [
    { "id": "s_98", "choice_id": "present" }
  ],
  "sex": "female",
  "age": 30
}
```

**Backend Implementation:**

```javascript
POST https://api.infermedica.com/v3/diagnosis
[Returns suggested follow-up questions]
```

**Response:**

```json
{
  "success": true,
  "data": {
    "question": {
      "type": "single",
      "text": "Is the headache throbbing or pulsating?",
      "items": [
        {
          "id": "s_1193",
          "name": "Throbbing headache",
          "choices": [
            { "id": "present", "label": "Yes" },
            { "id": "absent", "label": "No" },
            { "id": "unknown", "label": "Don't know" }
          ]
        }
      ]
    },
    "should_stop": false,
    "interview_id": "abc123def456"
  }
}
```

---

### 5. **Get Triage Assessment (Urgency Level)**

```http
POST /api/diagnosis/triage
Authorization: Bearer {your_jwt_token}

{
  "symptoms": [...],
  "sex": "female",
  "age": 30
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "triage_level": "emergency_ambulance",
    "label": "Emergency",
    "description": "Immediate medical attention required. Call ambulance.",
    "serious_conditions": [
      {
        "id": "c_340",
        "name": "Stroke",
        "common_name": "Stroke"
      }
    ],
    "teleconsultation_applicable": false
  }
}
```

**Triage Levels:**

- `emergency_ambulance` - Call ambulance immediately
- `emergency` - Urgent ER visit needed
- `consultation_24` - See doctor within 24 hours
- `consultation` - Schedule doctor appointment
- `self_care` - Self-care sufficient

---

### 6. **Explain Condition Details**

```http
GET /api/diagnosis/condition/:conditionId
Authorization: Bearer {your_jwt_token}
```

**Backend Implementation:**

```javascript
GET https://api.infermedica.com/v3/conditions/c_62
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "c_62",
    "name": "Tension headache",
    "common_name": "Tension-type headache",
    "icd10_code": "G44.2",
    "category": "Neurological",
    "prevalence": "common",
    "severity": "mild",
    "extras": {
      "hint": "Most common type of headache. Usually caused by stress or muscle tension.",
      "icd10_code": "G44.2"
    }
  }
}
```

---

## 🎯 **Integration with Family Health System**

### **Workflow: Health Officer Records Visit & Gets Test Recommendations**

1. **Health Officer logs in**
2. **Searches for patient record**
3. **Reviews patient allergies and chronic diseases**
4. **Patient reports symptoms during visit**
5. **Health Officer enters symptoms into diagnosis tool**
6. **System queries Infermedica API**
7. **AI provides:**
   - Possible conditions (with probability)
   - Triage urgency level
   - Recommended diagnostic tests
8. **Health Officer:**
   - Records diagnosis in visit notes
   - Creates test booking if needed
   - Creates referral for specialist if urgent

---

## 🔧 **Backend Implementation Example**

### **Environment Config (apps/backend/src/config/environment.js)**

```javascript
export const INFERMEDICA_CONFIG = {
  appId: process.env.INFERMEDICA_APP_ID,
  appKey: process.env.INFERMEDICA_APP_KEY,
  apiUrl: process.env.INFERMEDICA_API_URL || "https://api.infermedica.com/v3",
};
```

### **Infermedica Service (apps/backend/src/services/infermedica.service.js)**

```javascript
import axios from "axios";
import { INFERMEDICA_CONFIG } from "../config/environment.js";

class InfermedicaService {
  constructor() {
    this.client = axios.create({
      baseURL: INFERMEDICA_CONFIG.apiUrl,
      headers: {
        "App-Id": INFERMEDICA_CONFIG.appId,
        "App-Key": INFERMEDICA_CONFIG.appKey,
        "Content-Type": "application/json",
      },
    });
  }

  // Get all symptoms
  async getSymptoms(age, sex) {
    const response = await this.client.get("/symptoms", {
      params: { age: age || 30, sex: sex || "both" },
    });
    return response.data;
  }

  // Search symptoms by phrase
  async searchSymptoms(phrase, sex = "both", maxResults = 10) {
    const response = await this.client.get("/search", {
      params: { phrase, sex, max_results: maxResults, type: "symptom" },
    });
    return response.data;
  }

  // Get diagnosis
  async getDiagnosis(evidence, sex, age) {
    const response = await this.client.post("/diagnosis", {
      sex,
      age: { value: age },
      evidence,
    });
    return response.data;
  }

  // Get triage assessment
  async getTriage(evidence, sex, age) {
    const response = await this.client.post("/triage", {
      sex,
      age: { value: age },
      evidence,
    });
    return response.data;
  }

  // Combined analysis: diagnosis + triage + test recommendations
  async analyzeSymptoms(symptoms, sex, age) {
    const evidence = symptoms.map((s) => ({
      id: s.id,
      choice_id: s.choice_id || "present",
      source: "initial",
    }));

    const [diagnosis, triage] = await Promise.all([
      this.getDiagnosis(evidence, sex, age),
      this.getTriage(evidence, sex, age),
    ]);

    // Map to test recommendations
    const testRecommendations = diagnosis.conditions.map((condition) => ({
      condition: condition.name,
      accuracy: Math.round(condition.probability * 100),
      icd10: condition.icd10_code,
      urgency: this.mapTriageLevel(triage.triage_level),
      recommendedTests: this.getTestsForCondition(condition.id),
      triageLevel: triage.triage_level,
      teleconsultationOk: triage.teleconsultation_applicable,
    }));

    return {
      diagnosis: {
        conditions: diagnosis.conditions,
        extras: diagnosis.extras,
      },
      triage,
      testRecommendations,
      summary: {
        topCondition: diagnosis.conditions[0]?.name || "Unknown",
        triageLevel: triage.triage_level,
        urgencyDescription: this.getUrgencyDescription(triage.triage_level),
      },
    };
  }

  mapTriageLevel(level) {
    const map = {
      emergency_ambulance: "Emergency - Ambulance",
      emergency: "Emergency",
      consultation_24: "Urgent (24h)",
      consultation: "Routine Consultation",
      self_care: "Self-Care",
    };
    return map[level] || "Consultation";
  }

  getUrgencyDescription(level) {
    const descriptions = {
      emergency_ambulance: "Call ambulance immediately",
      emergency: "Seek emergency care now",
      consultation_24: "See doctor within 24 hours",
      consultation: "Schedule doctor appointment",
      self_care: "Self-care measures sufficient",
    };
    return descriptions[level] || "Consult healthcare provider";
  }

  // Map conditions to lab tests (customize based on your lab module)
  getTestsForCondition(conditionId) {
    const testMap = {
      c_62: ["Complete Blood Count", "Basic Metabolic Panel"], // Tension headache
      c_55: ["Neurological Exam", "CT Scan"], // Migraine
      c_340: ["CT Scan", "MRI", "Blood Clotting Tests"], // Stroke
      // Add more mappings based on your test catalog
    };
    return (
      testMap[conditionId] || ["Complete Blood Count", "Basic Health Panel"]
    );
  }
}

export default new InfermedicaService();
```

### **Diagnosis Controller**

```javascript
import infermedicaService from "../services/infermedica.service.js";

export const analyzeSymptoms = async (req, res, next) => {
  try {
    const { symptoms, sex, age } = req.body;

    // Validate input
    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Symptoms array is required",
      });
    }

    if (!sex || !age) {
      return res.status(400).json({
        success: false,
        message: "Patient sex and age are required",
      });
    }

    // Call Infermedica API
    const result = await infermedicaService.analyzeSymptoms(symptoms, sex, age);

    return res.status(200).json({
      success: true,
      data: result,
      message: "Diagnosis analysis completed successfully",
    });
  } catch (error) {
    console.error("Diagnosis error:", error.response?.data || error.message);
    next(error);
  }
};
```

---

## 📊 **Comparison: Request/Response Format**

### **Infermedica Evidence Format**

```javascript
// Symptoms with choices
{
  "evidence": [
    { "id": "s_98", "choice_id": "present", "source": "initial" },
    { "id": "s_107", "choice_id": "absent", "source": "initial" },
    { "id": "s_21", "choice_id": "unknown", "source": "initial" }
  ]
}
```

### **Choice IDs**

- `present` - Symptom is present
- `absent` - Symptom is not present
- `unknown` - Patient doesn't know

---

## 🎓 **Perfect for Campus Project**

✅ **FREE tier** - 500 calls/month  
✅ **Educational use** - Explicitly allowed  
✅ **Advanced AI** - Machine learning diagnostics  
✅ **Triage support** - Urgency assessment  
✅ **Easy integration** - RESTful API  
✅ **Great documentation** - Comprehensive guides  
✅ **Interview mode** - Smart follow-up questions  
✅ **ICD-10 codes** - Standard medical coding

---

## 🚨 **Important Notes**

- **Not for real medical use** - Educational/demo purposes only
- **Rate limited** - 500 calls/month on free tier
- **Requires internet** - Third-party API dependency
- **Authentication required** - Health Officer role only
- **Data privacy** - Don't send real patient identifiable information in development

---

## 🔗 **Useful Links**

- **Developer Portal:** https://developer.infermedica.com/
- **API Documentation:** https://developer.infermedica.com/docs/introduction
- **API Reference:** https://developer.infermedica.com/docs/api
- **Sandbox/Playground:** https://infermedica.com/product/medical-api-sandbox
- **GitHub Examples:** https://github.com/infermedica

---

## 📝 **Error Handling**

### **Common Errors:**

| Status | Error               | Solution                                           |
| ------ | ------------------- | -------------------------------------------------- |
| 401    | Unauthorized        | Check App-Id and App-Key credentials               |
| 400    | Invalid evidence    | Ensure symptom IDs are valid                       |
| 429    | Rate limit exceeded | You've hit 500 calls/month limit                   |
| 422    | Invalid age/sex     | Age must be number, sex must be 'male' or 'female' |

### **Example Error Response:**

```json
{
  "success": false,
  "message": "Infermedica API error: Invalid evidence item",
  "errorCode": "INFERMEDICA_ERROR",
  "details": {
    "status": 400,
    "infermedica_message": "Evidence item with id 's_invalid' not found"
  }
}
```

---

**Document Status:** ✅ Complete  
**Integration Status:** Ready for implementation  
**Last Updated:** February 19, 2026

---

_Switch from ApiMedic to Infermedica completed successfully. Infermedica provides more reliable service with advanced AI capabilities._
