/**
 * Sanitize error messages for user-friendly display
 * Prevents exposing technical details to end users
 */
export const getSafeErrorMessage = (error, context = "general") => {
  if (!error) return "Something went wrong. Please try again later.";

  const message = error?.response?.data?.message || error?.message || String(error);
  const lowerMsg = message.toLowerCase();

  // Check for network/server errors
  if (error?.code === "ECONNABORTED" || lowerMsg.includes("timeout")) {
    return "Connection timeout. Please check your internet and try again.";
  }

  if (error?.code === "ERR_NETWORK" || lowerMsg.includes("network")) {
    return "Network error. Please check your internet connection.";
  }

  if (error?.response?.status === 500 || lowerMsg.includes("500")) {
    return "Server is temporarily unavailable. Please try again in a few moments.";
  }

  if (error?.response?.status === 401 || lowerMsg.includes("unauthorized")) {
    return "Your session has expired. Please log in again.";
  }

  if (error?.response?.status === 403 || lowerMsg.includes("forbidden")) {
    return "You don't have permission to perform this action.";
  }

  if (error?.response?.status === 404 || lowerMsg.includes("not found")) {
    return "The requested resource was not found.";
  }

  if (error?.response?.status === 422 || lowerMsg.includes("validation")) {
    return "Some of the information you provided is invalid. Please check and try again.";
  }

  // Context-specific messages
  if (context === "password") {
    if (lowerMsg.includes("current")) {
      return "Your current password is incorrect.";
    }
    if (lowerMsg.includes("match") || lowerMsg.includes("mismatch")) {
      return "The new passwords don't match.";
    }
  }

  if (context === "household") {
    if (lowerMsg.includes("member")) {
      return "Could not save household member. Please check the details and try again.";
    }
  }

  if (context === "contact") {
    if (lowerMsg.includes("phone") || lowerMsg.includes("number")) {
      return "Please check the phone number format and try again.";
    }
  }

  // Default fallback for raw error messages that look technical
  if (
    message.includes("{") ||
    message.includes("Error:") ||
    message.includes("at ") ||
    message.startsWith("Cannot") ||
    message.startsWith("TypeError") ||
    message.startsWith("ReferenceError")
  ) {
    return "An error occurred while processing your request. Please try again.";
  }

  // If message looks user-friendly already, return it
  return message;
};

/**
 * Log error for debugging while showing safe message to user
 */
export const handleErrorWithLogging = (error, context = "general") => {
  // Log full error for developers
  console.error(`[${context}]`, error);

  // Return safe message for users
  return getSafeErrorMessage(error, context);
};

/**
 * Convert technical validation errors to user-friendly messages
 * Used for form validation error handling across the application
 */
export const formatValidationError = (errorObj) => {
  const field = errorObj.path || errorObj.param || '';
  const msg = errorObj.msg || '';

  // Map field names to user-friendly labels
  // Comprehensive mapping from all patient-related backend models
  const fieldLabels = {
    // Common fields
    'member_id': 'Member ID',
    'household_id': 'Household ID',
    'full_name': 'Full Name',
    'email': 'Email Address',
    'address': 'Address',
    'contact_number': 'Phone Number',
    'nic': 'National ID Number',
    'date_of_birth': 'Date of Birth',
    'gender': 'Gender',
    'gn_division': 'GN Division',
    'district': 'District',
    'photo': 'Photo',
    'age': 'Age',

    // Member specific
    'password_hash': 'Password',
    'disability_status': 'Disability Status',
    'pregnancy_status': 'Pregnancy Status',
    'isProfileComplete': 'Profile Complete',
    'diseases': 'Diseases',

    // Household registration
    'head_member_name': 'Head Member Name',
    'submitted_by': 'Submitted By',
    'primary_contact_number': 'Primary Contact Number',
    'secondary_contact_number': 'Secondary Contact Number',
    'village_name': 'Village Name',
    'province': 'Province',
    'registration_date': 'Registration Date',
    'water_source': 'Water Source',
    'well_water_tested': 'Well Water Tested',
    'ckdu_exposure_area': 'CKDU Exposure Area',
    'dengue_risk': 'Dengue Risk',
    'sanitation_type': 'Sanitation Type',
    'waste_disposal': 'Waste Disposal',
    'pesticide_exposure': 'Pesticide Exposure',
    'chronic_diseases': 'Chronic Diseases',

    // Emergency Contact
    'relationship': 'Relationship',
    'primary_phone': 'Primary Phone Number',
    'secondary_phone': 'Secondary Phone Number',
    'contact_priority': 'Contact Priority',
    'available_24_7': 'Available 24/7',
    'best_time_to_contact': 'Best Time to Contact',
    'landmarks': 'Landmarks',
    'receive_medical_results': 'Receive Medical Results',
    'decision_permission': 'Decision Permission',
    'collect_reports_permission': 'Collect Reports Permission',

    // Health Details/Health Profile
    'height_cm': 'Height',
    'weight_kg': 'Weight',
    'blood_group': 'Blood Group',
    'bmi': 'BMI',
    'smoking_status': 'Smoking Status',
    'alcohol_usage': 'Alcohol Usage',
    'occupation': 'Occupation',
    'chemical_exposure': 'Chemical Exposure',
    'family_diabetes': 'Family History - Diabetes',
    'family_heart_disease': 'Family History - Heart Disease',
    'family_genetic_disorders': 'Family History - Genetic Disorders',
    'family_no_history': 'Family History - No History',
    'free_text': 'Additional Notes',
    'voice_recording': 'Voice Recording',
    'lifestyle_history': 'Lifestyle History',
    'additional_notes': 'Additional Notes',
    'voice_notes': 'Voice Notes',

    // Allergy
    'allergy_type': 'Allergy Type',
    'allergen_name': 'Allergen Name',
    'reaction_type': 'Reaction Type',
    'severity': 'Severity',
    'since_year': 'Since Year',

    // Chronic Disease
    'disease_name': 'Disease Name',
    'currently_on_medication': 'Currently on Medication',

    // Medication
    'medicine_name': 'Medicine Name',
    'dosage': 'Dosage',
    'reason': 'Reason',
    'prescribed_by': 'Prescribed By',
    'start_date': 'Start Date',
    'prescription_photo': 'Prescription Photo',

    // Family Member
    'family_member_id': 'Family Member ID',
    'isHead': 'Head of Household',
    'spouse_name': 'Spouse Name',
    'parent_name': 'Parent Name',

    // Past Medical History
    'surgeries': 'Surgeries',
    'surgery_location': 'Surgery Location',
    'hospital_admissions': 'Hospital Admissions',
    'serious_injuries': 'Serious Injuries',
    'genetic_disorders': 'Genetic Disorders',
    'blood_transfusion_history': 'Blood Transfusion History',
    'tuberculosis_history': 'Tuberculosis History',

    // Visit
    'visit_id': 'Visit ID',
    'visit_date': 'Visit Date',
    'visit_type': 'Visit Type',
    'reason_for_visit': 'Reason for Visit',
    'doctor_notes': 'Doctor Notes',
    'diagnosis': 'Diagnosis',
    'follow_up_required': 'Follow Up Required',
    'follow_up_date': 'Follow Up Date',
    'created_by_staff_id': 'Created By Staff ID',

    // Referral
    'referral_id': 'Referral ID',
    'visit_id': 'Visit ID',
    'referred_to': 'Referred To',
    'referral_reason': 'Referral Reason',
    'urgency_level': 'Urgency Level',
    'referral_status': 'Referral Status',

    // Family Relationship
    'family_member1_id': 'Family Member 1 ID',
    'family_member2_id': 'Family Member 2 ID',
    'relationship_type': 'Relationship Type'
  };

  // Map friendly field references in error messages
  const friendlyLabels = {
    'NIC': 'National ID Number',
    'nic': 'National ID Number',
    'contact_number': 'Phone Number',
    'email': 'Email Address'
  };

  // Build user-friendly message
  let userMessage = msg;

  // Replace technical field references with friendly names
  Object.entries(friendlyLabels).forEach(([tech, friendly]) => {
    userMessage = userMessage.replace(new RegExp(tech, 'gi'), friendly);
  });

  // If error contains field path, use friendly label
  if (field) {
    const friendlyField = fieldLabels[field] || field;
    return `${friendlyField}: ${userMessage}`;
  }

  return userMessage;
};

