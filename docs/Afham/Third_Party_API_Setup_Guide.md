# Third-Party API Setup Guide

## Test Management Component - Twilio & SendGrid Configuration

### Overview

The Test Management component requires two third-party services:

- **Twilio**: For **WhatsApp notifications** (primary mobile channel) and carrier SMS (disabled — non-functional in Sri Lanka)
- **SendGrid**: For email notifications (test result alerts, booking confirmations)

Both services offer **FREE tiers** suitable for development and testing.

> ⚠️ **Sri Lanka Note:** Twilio carrier SMS does **not** deliver to Sri Lankan numbers despite being listed as supported. WhatsApp via the Twilio sandbox is the confirmed working mobile channel and is **free** (no trial credit consumed).

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
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

> `TWILIO_WHATSAPP_NUMBER` defaults to the Twilio sandbox number. For production, replace with your approved WhatsApp Business number in `whatsapp:+NUMBER` format.

### Trial Limitations

- **$15.50 USD free credit** (sufficient for carrier SMS if needed, not required for WhatsApp)
- WhatsApp sandbox is **completely free** — no credit consumed
- Carrier SMS: Can send to **verified numbers only** during trial
- To send carrier SMS to any number, upgrade to paid account (add credit card)
- Verify additional numbers: Console > Phone Numbers > Verified Caller IDs

### Verify Additional Phone Numbers (For Testing)

1. Go to **Phone Numbers** > **Verified Caller IDs**
2. Click **"Add a new number"**
3. Enter phone number in international format (e.g., `+94771234567` for Sri Lanka)
4. Click **"Verify"** and wait for verification code via SMS
5. Enter the 6-digit code received

**Sri Lankan Phone Numbers:**

- ❌ **Carrier SMS**: Twilio does **not** deliver carrier SMS to Sri Lankan numbers (confirmed April 2026). Do not use for production mobile notifications.
- ✅ **WhatsApp**: Works in Sri Lanka via Twilio sandbox. Free, no carriers involved.
- ✅ **Format**: `+94` (country code) + mobile number without leading `0`
  - Example: `0771234567` → `+94771234567`
  - Example: `0112345678` → `+94112345678`
- ⚠️ **WhatsApp Sandbox Limitation**: Recipient must first send `JOIN <sandbox-keyword>` to `+14155238886` on WhatsApp before they can receive sandbox messages

**Testing with Patient Profiles:**

- Use your verified phone number(s) as patient phone numbers in test data
- Example: Create patient profile with your number `+94771234567`
- For WhatsApp: Make sure that number has joined the sandbox first
- You can verify 2-3 numbers (yours, teammate's) for testing multiple patient scenarios

---

## 1.5 Twilio WhatsApp Sandbox Setup (5 minutes)

The WhatsApp sandbox lets you send WhatsApp messages for free during development without applying for a WhatsApp Business account.

### Step 1: Join the Sandbox

1. Open WhatsApp on the phone you want to receive test messages
2. Send a WhatsApp message to: **+1 415 523 8886** (Twilio sandbox number)
3. Message content: `JOIN <your-sandbox-keyword>`
   - Find your keyword in Twilio Console → **Messaging** → **Try it out** → **Send a WhatsApp message**
   - Example: `JOIN silver-tiger`
4. You will receive a confirmation: `You are now connected to the sandbox`
5. Any phone that wants to receive test WhatsApp messages must complete this step

### Step 2: Verify It Works

After joining, test via Postman:
```http
POST /api/notifications/send/result-ready
Authorization: Bearer {{health_officer_token}}
```
Expect a WhatsApp message on the joined phone within seconds.

### Step 3: Production Upgrade

For production, apply for a WhatsApp Business account via Twilio:
1. Twilio Console → **Messaging** → **Senders** → **WhatsApp senders**
2. Apply for a WhatsApp Business profile
3. Once approved, update `.env`: `TWILIO_WHATSAPP_NUMBER=whatsapp:+YOUR_BUSINESS_NUMBER`
4. No code changes required — only the env var changes

**Cost**: WhatsApp sandbox = $0. Production WhatsApp Business = conversation-based pricing (see Twilio docs).

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

- **SENDGRID_FROM_EMAIL**: Must be verified. **Two options:**
  1. Use the same email you used to sign up (attempt auto-verification — may still require Single Sender step)
  2. **Recommended**: Complete Single Sender Verification (see Step 5a below) — this is mandatory to avoid HTTP 403 errors
- **SENDGRID_FROM_NAME**: Display name patients will see (e.g., "MediLab Notifications")
- **Domain Verification**: NOT required for development/testing (can skip completely)
  - If SendGrid asks to "Authenticate Your Domain", you can skip this step
  - Domain verification is only for production apps with high email volume

### Step 5a: Single Sender Verification (MANDATORY)

> ⚠️ **Do this even if you used your signup email as the From address.** Without this step, all email sends will fail with HTTP 403: `The from address does not match a verified Sender Identity`.

1. Go to: [app.sendgrid.com/settings/sender_auth/senders](https://app.sendgrid.com/settings/sender_auth/senders)
2. Click **"Create New Sender"**
3. Fill in:
   - **From Name**: `MediLab`
   - **From Email**: the email in your `SENDGRID_FROM_EMAIL` env var
   - **Reply To**: same email
   - Fill remaining fields (company, address — required by SendGrid)
4. Click **Save**
5. SendGrid sends a verification email to that address — click **"Verify Single Sender"** in that email
6. Re-test: emails will now deliver successfully

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

### Step 3: Test WhatsApp Notification (via Postman)

> Make sure the recipient phone has joined the Twilio WhatsApp sandbox (Section 1.5 Step 1).

**POST** `http://localhost:5000/api/notifications/send/result-ready`

Headers: `Authorization: Bearer {{health_officer_token}}`

```json
{
  "testResult": { "_id": "{{result_id}}" },
  "patient": {
    "_id": "{{patient_id}}",
    "fullName": "Test Patient",
    "contactNumber": "+94764118021"
  },
  "testType": { "_id": "{{blood_glucose_type_id}}", "name": "Blood Glucose Test" },
  "healthCenter": { "name": "Central Medical Laboratory" }
}
```

Expected Response:

```json
{
  "success": true,
  "message": "Result ready notification sent",
  "data": {
    "whatsapp": { "success": true, "sid": "SM..." },
    "email": { "success": true }
  }
}
```

### Step 4: Test Email Endpoint (via Postman)

**POST** `http://localhost:5000/api/notifications/send/result-ready`

Same body as Step 3 but with `"email": "patient@example.com"` added to the `patient` object.

Expected: `data.email.success = true` and email delivered to inbox.

---

## 4. Troubleshooting

### Twilio Issues

**Error: "Authentication Error - No credentials provided"**

- ✅ Check `.env` file has `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN`
- ✅ Restart the server after updating `.env`

**Error: "Unverified number" (trial account carrier SMS)**

- ✅ Trial accounts can only send carrier SMS to verified numbers
- ✅ Verify recipient number in Twilio Console: Phone Numbers > Verified Caller IDs
- ✅ OR upgrade to paid account to send to any number
- ⚠️ **For Sri Lanka**: Use WhatsApp instead — carrier SMS does not deliver

**Error: "Invalid phone number format"**

- ✅ Use E.164 format: `+1234567890` (include `+` and country code)
- ✅ Remove spaces, dashes, or parentheses

**WhatsApp: Message not received**

- ✅ Ensure recipient has joined sandbox: send `JOIN <keyword>` to `+14155238886` on WhatsApp
- ✅ Check `TWILIO_WHATSAPP_NUMBER` is set to `whatsapp:+14155238886` (note the `whatsapp:` prefix)
- ✅ The `to` number must include country code in E.164 format (`+94XXXXXXXXX`)

### SendGrid Issues

**Error: "Forbidden - API key invalid"**

- ✅ Check API key starts with `SG.`
- ✅ Ensure no extra spaces in `.env` file
- ✅ Create a new API key if lost (old one cannot be retrieved)

**Error: "The from address does not match a verified Sender Identity" (HTTP 403)**

- ✅ This means the sender email is not verified — complete Single Sender Verification (Section 2, Step 5a)
- ✅ Go to: https://app.sendgrid.com/settings/sender_auth/senders
- ✅ Create a sender with the email matching `SENDGRID_FROM_EMAIL` in your `.env`
- ✅ Click the verification link in the email SendGrid sends to that address
- ⚠️ Using the same email you signed up with does NOT automatically verify it as a Sender Identity

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
   TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
   SENDGRID_API_KEY=SG.xxx...
   SENDGRID_FROM_EMAIL=noreply@yourdomain.com
   SENDGRID_FROM_NAME=MediLab
   ```

2. For production SendGrid:
   - Verify domain (Settings > Sender Authentication > Authenticate Your Domain)
   - Use domain-based email (e.g., `noreply@medilab.com`)

3. For production Twilio:
   - For WhatsApp Business: apply via Twilio Console > Messaging > Senders > WhatsApp senders
   - Update `TWILIO_WHATSAPP_NUMBER` to your approved WhatsApp Business number
   - For carrier SMS (if re-enabled): upgrade account (add credit card), note Sri Lanka carrier SMS may still not work

---

## 7. Cost Estimates

### Development/Testing (FREE)

- **Twilio WhatsApp sandbox**: $0 (no credit consumed)
- **Twilio carrier SMS**: $15.50 trial credit (not used — non-functional in Sri Lanka)
- **SendGrid**: 100 emails/day (3,000/month)
- **Total**: $0/month

### Production (Paid - Optional)

- **Twilio WhatsApp Business**: conversation-based pricing (see Twilio WhatsApp pricing page)
- **Twilio carrier SMS**: $0.0075/SMS (~$7.50 for 1,000 SMS) — only if re-enabled for supported regions
- **SendGrid**: $0 (100/day) or $19.95/month (40,000 emails)
- **Total**: $0-30/month depending on usage

---

## 8. Quick Reference

| Service         | Free Tier                  | Upgrade Trigger   | Cost Example                          |
| --------------- | -------------------------- | ----------------- | ------------------------------------- |
| Twilio WhatsApp | Sandbox FREE               | Production use    | Conversation-based (see Twilio docs)  |
| Twilio SMS      | $15.50 credit (unused)     | Credit exhausted  | $20 credit = 2,600 SMS                |
| SendGrid        | 100 emails/day             | Need >3,000/month | $19.95/mo = 40K emails                |

### Useful Links

- **Twilio Console**: https://console.twilio.com/
- **Twilio WhatsApp Sandbox**: https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn
- **Twilio WhatsApp Docs**: https://www.twilio.com/docs/whatsapp
- **SendGrid Dashboard**: https://app.sendgrid.com/
- **SendGrid Sender Verification**: https://app.sendgrid.com/settings/sender_auth/senders
- **SendGrid Docs**: https://docs.sendgrid.com/

---

## ✅ Completion Checklist

- [ ] Created Twilio account
- [ ] Obtained Twilio Account SID and Auth Token
- [ ] Got Twilio phone number
- [ ] Joined Twilio WhatsApp sandbox (sent JOIN keyword to +14155238886)
- [ ] Added `TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886` to `.env`
- [ ] Created SendGrid account
- [ ] Obtained SendGrid API key
- [ ] Completed Single Sender Verification for `SENDGRID_FROM_EMAIL` (MANDATORY)
- [ ] Updated `.env` file with all credentials
- [ ] Restarted backend server
- [ ] Saw "✅ Twilio SMS service initialized" in console
- [ ] Saw "✅ SendGrid email service initialized" in console
- [ ] Tested WhatsApp via `POST /api/notifications/send/result-ready` (optional)
- [ ] Tested email via same endpoint with email in patient object (optional)

**Estimated Setup Time**: 25-35 minutes total

---

**Created**: February 25, 2026  
**Updated**: April 9, 2026 (WhatsApp as primary channel, carrier SMS disabled, SendGrid sender verification clarified)  
**Component**: Test Management & Lab Operations  
**Owner**: Afham  
**Status**: Updated — WhatsApp confirmed working, email pending sender verification
