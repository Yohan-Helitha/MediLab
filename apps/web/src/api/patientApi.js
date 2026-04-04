import { apiRequest } from "./client";

export function fetchLabs() {
  return apiRequest("/api/labs");
}

export function fetchLabById(id) {
  return apiRequest(`/api/labs/${id}`);
}

export function fetchTestTypes() {
  return apiRequest(`/api/test-types`);
}

export async function fetchLabTestsByLab(labId) {
  if (!labId) return [];
  try {
    return await apiRequest(`/api/lab-tests/lab/${labId}`);
  } catch (error) {
    // Backend returns 404 when a lab has no assigned tests.
    // For patient pages, treat it as an empty list.
    if (
      error?.message &&
      (error.message.includes("No tests found for this lab") ||
        error.message.includes("Not Found"))
    ) {
      return [];
    }
    throw error;
  }
}

export function fetchTestInstructionsByDiagnosticTest(diagnosticTestId) {
	return apiRequest(`/api/test-instructions/diagnostic-test/${diagnosticTestId}`);
}

// Member Profile APIs
export async function updateMemberProfile(id, data) {
	// If data is instance of FormData, send as is (multipart/form-data)
	// Otherwise, stringify as JSON
	const isFormData = data instanceof FormData;
	const res = await apiRequest(`/api/members/${id}`, {
		method: "PUT",
		body: isFormData ? data : JSON.stringify(data),
	});

    if (res.success && res.data) {
        // Fetch health details, allergies, past medical history, etc. to attach to the member object
        const memberId = res.data.member_id;
        if (memberId) {
            const [health, allergies, chronic, meds, pastHistory] = await Promise.all([
                fetchHealthDetails(`?member_id=${memberId}`),
                fetchAllergies(`?member_id=${memberId}`),
                fetchChronicDiseases(`?member_id=${memberId}`),
                fetchMedications(`?member_id=${memberId}`),
                fetchPastMedicalHistories(`?member_id=${memberId}`)
            ]);

            if (health.success) res.data.health_info = health.data.healthDetails[0];
            if (allergies.success) res.data.allergies = allergies.data.allergies;
            if (chronic.success) res.data.chronic_diseases = chronic.data.chronicDiseases;
            if (meds.success) res.data.current_medications = meds.data.medications;
            if (pastHistory.success) res.data.medical_history = pastHistory.data.pastMedicalHistories[0];
        }
    }
    return res;
}

export async function fetchMemberProfile(id) {
	const res = await apiRequest(`/api/members/${id}`);
    if (res.success && res.data) {
        const memberId = res.data.member_id;
        if (memberId) {
            const [health, allergies, chronic, meds, pastHistory] = await Promise.all([
                fetchHealthDetails(`?member_id=${memberId}`),
                fetchAllergies(`?member_id=${memberId}`),
                fetchChronicDiseases(`?member_id=${memberId}`),
                fetchMedications(`?member_id=${memberId}`),
                fetchPastMedicalHistories(`?member_id=${memberId}`)
            ]);

            if (health.success) res.data.health_info = health.data.healthDetails[0];
            if (allergies.success) res.data.allergies = allergies.data.allergies;
            if (chronic.success) res.data.chronic_diseases = chronic.data.chronicDiseases;
            if (meds.success) res.data.current_medications = meds.data.medications;
            if (pastHistory.success) res.data.medical_history = pastHistory.data.pastMedicalHistories[0];
        }
    }
    return res;
}

// Health Details APIs
export function fetchHealthDetails(query = "") {
	return apiRequest(`/api/health-details${query}`);
}

export function fetchHealthDetailsById(id) {
	return apiRequest(`/api/health-details/${id}`);
}

export function createHealthDetails(data) {
	return apiRequest(`/api/health-details`, {
		method: "POST",
		body: JSON.stringify(data)
	});
}

export function updateHealthDetails(id, data) {
	return apiRequest(`/api/health-details/${id}`, {
		method: "PUT",
		body: JSON.stringify(data)
	});
}

// Emergency Contact APIs
export function fetchEmergencyContacts(query = "") {
  return apiRequest(`/api/emergency-contacts${query}`);
}

export function fetchEmergencyContactById(id) {
  return apiRequest(`/api/emergency-contacts/${id}`);
}

export function createEmergencyContact(data) {
  return apiRequest(`/api/emergency-contacts`, {
    method: "POST",
    body: JSON.stringify(data)
  });
}

export function updateEmergencyContact(id, data) {
  return apiRequest(`/api/emergency-contacts/${id}`, {
    method: "PUT",
    body: JSON.stringify(data)
  });
}

export function deleteEmergencyContact(id) {
  return apiRequest(`/api/emergency-contacts/${id}`, {
    method: "DELETE"
  });
}

// Household APIs
export function fetchHouseholds(query = "") {
  return apiRequest(`/api/households${query}`);
}

export function fetchHouseholdById(id) {
  return apiRequest(`/api/households/${id}`);
}

export function fetchHouseholdBySubmittedBy(id) {
  return apiRequest(`/api/households/submitted-by/${id}`);
}

export function createHousehold(data) {
  return apiRequest(`/api/households`, {
    method: "POST",
    body: JSON.stringify(data)
  });
}

export function updateHousehold(id, data) {
  return apiRequest(`/api/households/${id}`, {
    method: "PUT",
    body: JSON.stringify(data)
  });
}

export function deleteHousehold(id) {
  return apiRequest(`/api/households/${id}`, {
    method: "DELETE"
  });
}

export function deleteHealthDetails(id) {
	return apiRequest(`/api/health-details/${id}`, {
		method: "DELETE"
	});
}

// Allergy APIs
export function fetchAllergies(query = "") {
	return apiRequest(`/api/allergies${query}`);
}

export function fetchAllergyById(id) {
	return apiRequest(`/api/allergies/${id}`);
}

export function createAllergy(data) {
	return apiRequest(`/api/allergies`, {
		method: "POST",
		body: JSON.stringify(data)
	});
}

export function updateAllergy(id, data) {
	return apiRequest(`/api/allergies/${id}`, {
		method: "PUT",
		body: JSON.stringify(data)
	});
}

export function deleteAllergy(id) {
	return apiRequest(`/api/allergies/${id}`, {
		method: "DELETE"
	});
}

// Chronic Disease APIs
export function fetchChronicDiseases(query = "") {
	return apiRequest(`/api/chronic-diseases${query}`);
}

export function fetchChronicDiseaseById(id) {
	return apiRequest(`/api/chronic-diseases/${id}`);
}

export function createChronicDisease(data) {
	return apiRequest(`/api/chronic-diseases`, {
		method: "POST",
		body: JSON.stringify(data)
	});
}

export function updateChronicDisease(id, data) {
	return apiRequest(`/api/chronic-diseases/${id}`, {
		method: "PUT",
		body: JSON.stringify(data)
	});
}

export function deleteChronicDisease(id) {
	return apiRequest(`/api/chronic-diseases/${id}`, {
		method: "DELETE"
	});
}

// Medication APIs
export function fetchMedications(query = "") {
	return apiRequest(`/api/medications${query}`);
}

export function fetchMedicationById(id) {
	return apiRequest(`/api/medications/${id}`);
}

export function createMedication(data) {
	return apiRequest(`/api/medications`, {
		method: "POST",
		body: JSON.stringify(data)
	});
}

export function updateMedication(id, data) {
	return apiRequest(`/api/medications/${id}`, {
		method: "PUT",
		body: JSON.stringify(data)
	});
}

export function deleteMedication(id) {
	return apiRequest(`/api/medications/${id}`, {
		method: "DELETE"
	});
}

// Family Member APIs
export function fetchFamilyMembers(query = "") {
	return apiRequest(`/api/family-members${query}`);
}

export function fetchFamilyMemberById(id) {
	return apiRequest(`/api/family-members/${id}`);
}

export function createFamilyMember(data) {
	return apiRequest(`/api/family-members`, {
		method: "POST",
		body: JSON.stringify(data)
	});
}

export function updateFamilyMember(id, data) {
	return apiRequest(`/api/family-members/${id}`, {
		method: "PUT",
		body: JSON.stringify(data)
	});
}

// Family Relationship APIs
export function fetchFamilyRelationships(query = "") {
	return apiRequest(`/api/family-relationships${query}`);
}

export function fetchFamilyTree(familyMemberId) {
	return apiRequest(`/api/family-relationships/family-tree/${familyMemberId}`);
}

export function fetchChronicDiseasesByMember(memberId) {
	return apiRequest(`/api/chronic-diseases?member_id=${memberId}`);
}

export function createFamilyRelationship(data) {
	return apiRequest(`/api/family-relationships`, {
		method: "POST",
		body: JSON.stringify(data)
	});
}

// Past Medical History APIs
export function fetchPastMedicalHistories(query = "") {
	return apiRequest(`/api/past-medical-history${query}`);
}

export function fetchPastMedicalHistoryById(id) {
	return apiRequest(`/api/past-medical-history/${id}`);
}

export function createPastMedicalHistory(data) {
	return apiRequest(`/api/past-medical-history`, {
		method: "POST",
		body: JSON.stringify(data)
	});
}

export function updatePastMedicalHistory(id, data) {
	return apiRequest(`/api/past-medical-history/${id}`, {
		method: "PUT",
		body: JSON.stringify(data)
	});
}

export function deletePastMedicalHistory(id) {
	return apiRequest(`/api/past-medical-history/${id}`, {
		method: "DELETE"
	});
}
