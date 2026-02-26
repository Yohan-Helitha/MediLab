# Third-Party API Setup Guide

## Test Management Component - Twilio & SendGrid Configuration

### Overview

The Test Management component requires two third-party services:

- **Twilio**: For SMS notifications (test results, appointment reminders)
- **SendGrid**: For email notifications (test result PDFs, booking confirmations)

Both services offer **FREE tiers** suitable for development and testing.

---

## 1. Twilio SMS Setup (10 minutes)

### Step 1: Create Twilio Account

1. Visit: https://www.twilio.com/try-twilio
2. Click **"Sign up for free"**
3. Fill in:
   - Email
   - First & Last Name
   - Password
4. Click **"Start your free trial"**

### Step 2: Verify Email Address

1. Check your email inbox for **"Twilio Email Verification"**
2. Click the verification link in the email
3. This will activate your Twilio account

### Step 3: Verify Phone Number

1. Enter your phone number (will receive verification code)
2. Enter the 6-digit code sent to your phone
3. Complete the verification

### Step 4: Create Account (Subaccount)

**Note**: Twilio now uses an organization structure with subaccounts.

1. After verification, you'll see the **Console Dashboard**
2. If prompted to "Create Account", click it
3. Enter **Account Friendly Name**: `MediLab` (or any name you prefer)
4. Click **"Create"**
5. You'll now see your new account dashboard with credentials

### Step 5: Get Credentials

1. After creating the account, you'll see the **Account Dashboard**
2. Find your credentials (usually in the center or right side):
   - **Account SID**: looks like `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - **Auth Token**: Click "show" to reveal, looks like `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
3. Copy these values - you'll need them for `.env` file

**Note**: Make sure you're looking at **Account SID** (starts with `AC`), NOT Organization SID.

### Step 6: Get a Phone Number

1. Click **"Get a Twilio phone number"** button (on the dashboard)
2. Twilio will assign you a free trial number automatically
3. Click **"Choose this Number"**
4. Your number format: `+1234567890` (includes country code)

### Step 7: Update `.env` File

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+1234567890
```

### Trial Limitations

- **$15.50 USD free credit** (sufficient for testing)
- Can send SMS to **verified numbers only** during trial
- To send to any number, upgrade to paid account (add credit card)
- Verify additional numbers: Console > Phone Numbers > Verified Caller IDs

### Verify Additional Phone Numbers (For Testing)

1. Go to **Phone Numbers** > **Verified Caller IDs**
2. Click **"Add a new number"**
3. Enter phone number in international format (e.g., `+94771234567` for Sri Lanka)
4. Click **"Verify"** and wait for verification code via SMS
5. Enter the 6-digit code received

**Sri Lankan Phone Numbers:**

- ✅ **Supported**: All Sri Lankan mobile operators (Dialog, Mobitel, Hutch, Airtel)
- ✅ **Format**: `+94` (country code) + mobile number without leading `0`
  - Example: `0771234567` → `+94771234567`
  - Example: `0112345678` → `+94112345678`
- ⚠️ **Trial Limitation**: Can only send SMS to verified numbers
- ✅ **Upgrade to Paid**: No restrictions - send to any Sri Lankan number without verification

**Testing with Patient Profiles:**

- Use your verified phone number(s) as patient phone numbers in test data
- Example: Create patient profile with your number `+94771234567`
- This way you'll receive actual SMS notifications during testing
- You can verify 2-3 numbers (yours, teammate's) for testing multiple patient scenarios
- **Note**: If you can only see one verified number, try adding more via "Verified Caller IDs" (trial accounts usually allow up to 10)

---

## 2. SendGrid Email Setup (10 minutes)

### Step 1: Create SendGrid Account

1. Visit: https://sendgrid.com/free/
2. Click **"Start for free"** or **"Sign Up"**
3. Fill in:
   - Email address
   - Password
   - First & Last Name
4. Click **"Create Account"**

### Step 2: Verify Email Address

1. Check your email inbox for **"SendGrid Email Verification"**
2. Click the verification link
3. Complete any additional onboarding steps (can skip questionnaire)

### Step 3: Create API Key

1. After login, navigate to: **Settings** > **API Keys**
2. Click **"Create API Key"** (top right)
3. Choose:
   - **Name**: `MediLab` (or any name you prefer)
   - **Permissions**: Select **"Full Access"** (or at minimum "Mail Send")
4. Click **"Create & View"**

### Step 4: Copy API Key **IMMEDIATELY**

⚠️ **CRITICAL**: The API key is displayed **ONLY ONCE**!

- Copy the key (starts with `SG.`)
- Example: `SG.xxxxxxxxxxxxxxxx.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- Store it securely - you cannot retrieve it later
- If lost, create a new API key

### Step 5: Update `.env` File

```env
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxx.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=your-verified-email@example.com
SENDGRID_FROM_NAME=MediLab
```

### Important Notes

- **SENDGRID_FROM_EMAIL**: Must be the same email you used to sign up (it's pre-verified)
  - Example: If you signed up with `mohamed_afham@outlook.com`, use that email
  - No additional verification needed - your signup email is automatically verified
- **SENDGRID_FROM_NAME**: Display name patients will see (e.g., "MediLab Notifications")
- **Domain Verification**: NOT required for development/testing (can skip completely)
  - If SendGrid asks to "Authenticate Your Domain", you can skip this step
  - Domain verification is only for production apps with high email volume
  - Your personal email works perfectly for testing and evaluation

### Free Tier Limitations

- **100 emails/day** (sufficient for development & testing)
- All features included (templates, analytics, etc.)
- No credit card required
- To send more emails, upgrade to paid plan

### (Optional) Domain Authentication - FOR PRODUCTION ONLY

**Skip this for development/testing!**

- SendGrid may prompt you to "Authenticate Your Domain"
- This is ONLY needed for production apps sending thousands of emails
- Benefits: Better email deliverability, custom sender domain (noreply@yourdomain.com)
- For your evaluation: Use your personal verified email - works perfectly

**If you want to set it up later (production):**

1. Go to **Settings** > **Sender Authentication** > **Authenticate Your Domain**
2. Follow DNS configuration steps (requires domain registrar access)
3. Verify DNS records (can take 24-48 hours)

---

## 3. Testing the Configuration

### Step 1: Start the Server

```bash
cd apps/backend
npm run dev
```

### Step 2: Check Console Output

You should see:

```
✅ Twilio SMS service initialized
✅ SendGrid email service initialized
```

If you see warnings:

```
⚠️ Twilio credentials not configured. SMS notifications will not be sent.
⚠️ SendGrid credentials not configured. Email notifications will not be sent.
```

→ Double-check your `.env` file for typos or missing values.

### Step 3: Test SMS Endpoint (via Postman)

**POST** `http://localhost:5000/api/notifications/send-sms`

```json
{
  "phoneNumber": "+1234567890",
  "message": "Test SMS from MediLab"
}
```

Expected Response:

```json
{
  "success": true,
  "message": "SMS sent successfully",
  "notification": {
    "type": "sms",
    "recipient": "+1234567890",
    "status": "sent",
    "messageSid": "SM...",
    "provider": "twilio"
  }
}
```

### Step 4: Test Email Endpoint (via Postman)

**POST** `http://localhost:5000/api/notifications/send-email`

```json
{
  "email": "patient@example.com",
  "subject": "Test Email from MediLab",
  "html": "<h1>Test Email</h1><p>This is a test email from MediLab.</p>"
}
```

Expected Response:

```json
{
  "success": true,
  "message": "Email sent successfully",
  "notification": {
    "type": "email",
    "recipient": "patient@example.com",
    "status": "sent",
    "messageId": "...",
    "provider": "sendgrid"
  }
}
```

---

## 4. Troubleshooting

### Twilio Issues

**Error: "Authentication Error - No credentials provided"**

- ✅ Check `.env` file has `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN`
- ✅ Restart the server after updating `.env`

**Error: "Unverified number" (trial account)**

- ✅ Trial accounts can only send to verified numbers
- ✅ Verify recipient number in Twilio Console: Phone Numbers > Verified Caller IDs
- ✅ OR upgrade to paid account to send to any number

**Error: "Invalid phone number format"**

- ✅ Use E.164 format: `+1234567890` (include `+` and country code)
- ✅ US numbers: `+1` prefix, 10 digits
- ✅ Remove spaces, dashes, or parentheses

### SendGrid Issues

**Error: "Forbidden - API key invalid"**

- ✅ Check API key starts with `SG.`
- ✅ Ensure no extra spaces in `.env` file
- ✅ Create a new API key if lost (old one cannot be retrieved)

**Error: "The from email does not match a verified Sender Identity"**

- ✅ Use the same email you signed up with
- ✅ OR verify additional email: Settings > Sender Authentication > Verify a Single Sender

**Emails going to spam**

- ✅ SendGrid provides authenticated sending by default
- ✅ For production: Set up domain authentication (Settings > Sender Authentication > Authenticate Your Domain)

### General Issues

**Console shows warnings after updating `.env`**

- ✅ Restart the server: `Ctrl+C` then `npm run dev`
- ✅ Check `.env` file is in `apps/backend/` directory (not root)

**Values not loading from `.env`**

- ✅ Check `.env` file has no syntax errors
- ✅ Ensure no quotes around values (e.g., `KEY=value` not `KEY="value"`)
- ✅ No spaces around `=` sign

---

## 5. Security Best Practices

### ✅ DO:

- Keep `.env` file in `.gitignore` (never commit)
- Use different API keys for development and production
- Rotate API keys periodically
- Use environment-specific credentials on deployment platforms

### ❌ DON'T:

- Commit `.env` file to Git
- Share API keys in chat/email
- Use production keys in development
- Hardcode credentials in source code

---

## 6. Deployment Checklist

When deploying to **Render** / **Railway** / **Heroku**:

1. Set environment variables in the platform's dashboard:

   ```
   TWILIO_ACCOUNT_SID=ACxxx...
   TWILIO_AUTH_TOKEN=xxx...
   TWILIO_PHONE_NUMBER=+1234567890
   SENDGRID_API_KEY=SG.xxx...
   SENDGRID_FROM_EMAIL=noreply@yourdomain.com
   SENDGRID_FROM_NAME=MediLab
   ```

2. For production SendGrid:
   - Verify domain (Settings > Sender Authentication > Authenticate Your Domain)
   - Use domain-based email (e.g., `noreply@medilab.com`)

3. For production Twilio:
   - Upgrade account (add credit card)
   - Remove trial restrictions
   - Consider getting a dedicated phone number

---

## 7. Cost Estimates

### Development/Testing (FREE)

- **Twilio**: $15.50 trial credit (~500 SMS messages)
- **SendGrid**: 100 emails/day (3,000/month)
- **Total**: $0/month

### Production (Paid - Optional)

- **Twilio**: $0.0075/SMS (~$7.50 for 1,000 SMS)
- **SendGrid**: $0 (100/day) or $19.95/month (40,000 emails)
- **Total**: $0-30/month depending on usage

---

## 8. Quick Reference

| Service  | Free Tier      | Upgrade Trigger   | Cost Example           |
| -------- | -------------- | ----------------- | ---------------------- |
| Twilio   | $15.50 credit  | Credit exhausted  | $20 credit = 2,600 SMS |
| SendGrid | 100 emails/day | Need >3,000/month | $19.95/mo = 40K emails |

### Useful Links

- **Twilio Console**: https://console.twilio.com/
- **Twilio Docs**: https://www.twilio.com/docs/sms
- **SendGrid Dashboard**: https://app.sendgrid.com/
- **SendGrid Docs**: https://docs.sendgrid.com/

---

## ✅ Completion Checklist

- [ ] Created Twilio account
- [ ] Obtained Twilio Account SID and Auth Token
- [ ] Got Twilio phone number
- [ ] Created SendGrid account
- [ ] Obtained SendGrid API key
- [ ] Updated `.env` file with all credentials
- [ ] Restarted backend server
- [ ] Saw "✅ Twilio SMS service initialized" in console
- [ ] Saw "✅ SendGrid email service initialized" in console
- [ ] Tested SMS endpoint via Postman (optional)
- [ ] Tested Email endpoint via Postman (optional)

**Estimated Setup Time**: 20-30 minutes total

---

**Created**: February 25, 2026  
**Component**: Test Management & Lab Operations  
**Owner**: Afham  
**Status**: Ready for Implementation
