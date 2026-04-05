import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import PublicLayout from "../../layout/PublicLayout";
import { 
    updateMemberProfile, 
    createHealthDetails, 
    updateHealthDetails, 
    createPastMedicalHistory, 
    updatePastMedicalHistory,
    createAllergy,
    updateAllergy,
    createChronicDisease,
    createMedication,
    updateMedication,
    deleteAllergy,
    deleteChronicDisease,
    deleteMedication,
    fetchHealthDetails,
    fetchPastMedicalHistories
} from "../../api/patientApi";

const HealthProfilePage = () => {
    const { user, login, loading: authLoading } = useAuth();
    
    // Always initialize to the first tab when opening the page
    const [activeTab, setActiveTab] = useState("personal");
    const [activeSubTab, setActiveSubTab] = useState("basic");

    const profile = user?.profile || user;

    // Calculate age for pregnancy field
    const calculateAge = (dob) => {
        if (!dob) return 0;
        const birthDate = new Date(dob);
        const difference = Date.now() - birthDate.getTime();
        const ageDate = new Date(difference);
        return Math.abs(ageDate.getUTCFullYear() - 1970);
    };

    const userAge = calculateAge(profile?.date_of_birth);
    const showPregnancyField = profile?.gender === "female" && userAge >= 12 && userAge <= 55;

    // Form states
    const [personalData, setPersonalData] = useState({
        full_name: "",
        address: "",
        contact_number: "",
        nic: "",
        date_of_birth: "",
        gender: "male",
        gn_division: "",
        district: "",
        household_id: "",
        photo: null,
    });

    const [photoPreview, setPhotoPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    // Auto-dismiss alerts after 3 seconds
    React.useEffect(() => {
        if (message.text) {
            const timer = setTimeout(() => {
                setMessage({ type: "", text: "" });
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    // Track which categories are showing their "Add New" form
    const [activeAddForms, setActiveAddForms] = useState({});
    const [editingAllergyId, setEditingAllergyId] = useState(null);
    const [editingMedicationId, setEditingMedicationId] = useState(null);

    const [allergyStates, setAllergyStates] = useState({
        "Food": false,
        "Drug": false,
        "Dust/Pollen": false,
        "Latex/Plaster": false,
        "Other": false
    });

    const [chronicStates, setChronicStates] = useState({
        "Diabetes Mellitus": false,
        "Hypertension (High Blood Pressure)": false,
        "Heart Disease (e.g., coronary artery disease)": false,
        "Stroke / Cerebrovascular Disease": false,
        "Asthma": false,
        "Chronic Lung Disease (e.g., COPD)": false,
        "Chronic Kidney Disease": false,
        "Thyroid Disorders (Hypo/Hyperthyroidism)": false,
        "Epilepsy / Seizure Disorders": false,
        "Cancer (any type)": false,
        "Mental Health Disorders (Depression, Anxiety, etc.)": false,
        "Obesity": false,
        "High Cholesterol (Hyperlipidemia)": false,
        "Arthritis (Osteoarthritis / Rheumatoid)": false,
        "Liver Disease (Chronic)": false,
        "Other (Specify)": false
    });

    // Handle "Other" expansion specifically
    const [isOtherExpanded, setIsOtherExpanded] = useState(false);
    const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

    // Initialize allergy and chronic states based on profile data
    React.useEffect(() => {
        if (profile?.allergies?.length > 0) {
            const newStates = { ...allergyStates };
            profile.allergies.forEach(a => {
                if (newStates.hasOwnProperty(a.type)) {
                    newStates[a.type] = true;
                }
            });
            setAllergyStates(newStates);
        }
        if (profile?.chronic_diseases?.length > 0) {
            const newStates = { ...chronicStates };
            // Ensure any recorded chronic disease marks the row as 'Yes'
            profile.chronic_diseases.forEach(c => {
                if (newStates.hasOwnProperty(c.condition)) {
                    newStates[c.condition] = true;
                }
            });
            
            // Special check for 'Other' - if any medical condition exists that isn't in the standard list, mark 'Other' as true
            const standardConditions = [
                "Diabetes Mellitus", "Hypertension (High Blood Pressure)", "Heart Disease (e.g., coronary artery disease)",
                "Stroke / Cerebrovascular Disease", "Asthma", "Chronic Lung Disease (e.g., COPD)",
                "Chronic Kidney Disease", "Thyroid Disorders (Hypo/Hyperthyroidism)", "Epilepsy / Seizure Disorders",
                "Cancer (any type)", "Mental Health Disorders (Depression, Anxiety, etc.)", "Obesity",
                "High Cholesterol (Hyperlipidemia)", "Arthritis (Osteoarthritis / Rheumatoid)", "Liver Disease (Chronic)"
            ];
            const hasOther = profile.chronic_diseases.some(c => !standardConditions.includes(c.disease_name || c.condition));
            if (hasOther) {
                newStates["Other (Specify)"] = true;
            }

            setChronicStates(newStates);
        }
    }, [user]); // Re-run when user/profile changes

    // Health Info States
    const [healthData, setHealthData] = useState({
        height: "",
        weight: "",
        blood_group: "",
        pregnancy_status: "No",
        disability_status: "No"
    });

    const [allergyData, setAllergyData] = useState({
        type: "Food",
        allergen_name: "",
        reaction_type: "Rash",
        severity: "Mild",
        since_year: new Date().getFullYear(),
        symptoms: ""
    });

    const [chronicData, setChronicData] = useState({
        condition: "Diabetes",
        onset_year: "",
        on_medication: false
    });

    const [medicationData, setMedicationData] = useState({
        medicine_name: "",
        dosage: "",
        reason: "",
        prescribed_by: "",
        start_date: ""
    });
    const [medicationErrors, setMedicationErrors] = useState({});

    const [pastHistory, setPastHistory] = useState({
        surgeries: false,
        surgery_location: [""],
        has_admissions: false,
        hospital_admissions: "",
        has_serious_injuries: false,
        serious_injuries: "",
        blood_transfusion: false,
        tuberculosis: false
    });

    const [familyHistory, setFamilyHistory] = useState({
        diabetes: false,
        heart_disease: false,
        genetic_disorders: [""],
        no_known_history: true
    });

    const [lifestyle, setLifestyle] = useState({
        smoking: "Never",
        alcohol: "No",
        occupation: "",
        chemical_exposure: false,
        notes: ""
    });

    const [lifestyleHistory, setLifestyleHistory] = useState([]);
    const [editingLifestyleId, setEditingLifestyleId] = useState(null);

    const addLifestyleEntry = () => {
        if (editingLifestyleId) {
            setLifestyleHistory(lifestyleHistory.map(item => 
                item.id === editingLifestyleId 
                ? {
                    ...item,
                    smoking_status: lifestyle.smoking,
                    alcohol_usage: lifestyle.alcohol,
                    occupation: lifestyle.occupation,
                    chemical_exposure: lifestyle.chemical_exposure,
                    additional_notes: lifestyle.notes,
                }
                : item
            ));
            setEditingLifestyleId(null);
        } else {
            const newEntry = {
                id: Date.now(),
                smoking_status: lifestyle.smoking,
                alcohol_usage: lifestyle.alcohol,
                occupation: lifestyle.occupation,
                chemical_exposure: lifestyle.chemical_exposure,
                additional_notes: lifestyle.notes,
                date: new Date().toISOString()
            };
            setLifestyleHistory([newEntry, ...lifestyleHistory]);
        }
        // Reset inputs
        setLifestyle({
            smoking: "Never",
            alcohol: "No",
            occupation: "",
            chemical_exposure: false,
            notes: ""
        });
    };

    const handleEditLifestyle = (item) => {
        setEditingLifestyleId(item.id);
        setLifestyle({
            smoking: item.smoking_status,
            alcohol: item.alcohol_usage,
            occupation: item.occupation,
            chemical_exposure: item.chemical_exposure,
            notes: item.additional_notes || ""
        });
        // Scroll to form
        const element = document.getElementById("lifestyle-form-section");
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    const deleteLifestyleEntry = (id) => {
        setLifestyleHistory(lifestyleHistory.filter(item => item.id !== id));
    };

    const [additionalNotes, setAdditionalNotes] = useState("");
    const [freeTextNotes, setFreeTextNotes] = useState([]);
    const [voiceNotes, setVoiceNotes] = useState([]);
    const [currentFreeText, setCurrentFreeText] = useState("");
    const [speaker, setSpeaker] = useState("");
    const [editingFreeTextId, setEditingFreeTextId] = useState(null);
    
    const [isRecording, setIsRecording] = useState(false);
    const [recordingCountdown, setRecordingCountdown] = useState(0);
    const [audioBlob, setAudioBlob] = useState(null);
    const [audioUrl, setAudioUrl] = useState(null);
    const mediaRecorderRef = React.useRef(null);

    const addFreeTextNote = () => {
        if (currentFreeText.trim()) {
            if (editingFreeTextId) {
                setFreeTextNotes(freeTextNotes.map(note => 
                    note.id === editingFreeTextId 
                    ? { ...note, text: currentFreeText.trim(), speaker: speaker.trim() || "Patient" }
                    : note
                ));
                setEditingFreeTextId(null);
            } else {
                setFreeTextNotes([...freeTextNotes, { 
                    id: Date.now(), 
                    text: currentFreeText.trim(),
                    speaker: speaker.trim() || "Patient",
                    date: new Date().toLocaleDateString()
                }]);
            }
            setCurrentFreeText("");
            setSpeaker("");
        }
    };

    const handleEditFreeText = (note) => {
        setEditingFreeTextId(note.id);
        setCurrentFreeText(note.text);
        setSpeaker(note.speaker);
        // Scroll to form if needed
        const element = document.getElementById("additional-notes-form");
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    const deleteFreeTextNote = (id) => {
        setFreeTextNotes(freeTextNotes.filter(note => note.id !== id));
    };

    const addVoiceNote = () => {
        if (audioUrl) {
            setVoiceNotes([...voiceNotes, { 
                id: Date.now(), 
                url: audioUrl, 
                blob: audioBlob,
                speaker: speaker.trim() || "Patient",
                date: new Date().toLocaleDateString()
            }]);
            setAudioUrl(null);
            setAudioBlob(null);
            setSpeaker("");
        }
    };

    const deleteVoiceNote = (id) => {
        setVoiceNotes(voiceNotes.filter(note => note.id !== id));
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            // Start 3-second countdown
            let count = 3;
            setRecordingCountdown(count);
            const countdownInterval = setInterval(() => {
                count -= 1;
                setRecordingCountdown(count);
                if (count <= 0) {
                    clearInterval(countdownInterval);
                }
            }, 1000);

            // Wait 3 seconds before actually starting the recorder
            await new Promise(resolve => setTimeout(resolve, 3000));

            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            const chunks = [];

            mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
            mediaRecorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'audio/webm' });
                setAudioBlob(blob);
                setAudioUrl(URL.createObjectURL(blob));
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Error accessing microphone:", err);
            alert("Could not access microphone. Please check permissions.");
            setRecordingCountdown(0);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
    };

    // Sync data when user object is loaded
    React.useEffect(() => {
        if (user) {
            console.log("HealthProfilePage: Syncing data with user profile", profile);
            setPersonalData({
                full_name: profile?.full_name || profile?.fullName || profile?.firstName || "",
                address: profile?.address || "",
                contact_number: profile?.contact_number || "",
                nic: profile?.nic || "",
                date_of_birth: profile?.date_of_birth ? new Date(profile.date_of_birth).toISOString().split('T')[0] : "",
                gender: profile?.gender || "male",
                gn_division: profile?.gn_division || "",
                district: profile?.district || "",
                household_id: profile?.household_id || "",
                photo: null,
            });

            setHealthData({
                height: profile?.health_info?.height_cm || profile?.health_info?.height || profile?.height_cm || profile?.height || "",
                weight: profile?.health_info?.weight_kg || profile?.health_info?.weight || profile?.weight_kg || profile?.weight || "",
                blood_group: profile?.health_info?.blood_group || profile?.blood_group || "",
                pregnancy_status: (profile?.health_info?.pregnancy_status ?? profile?.pregnancy_status) === true ? "Yes" : "No",
                disability_status: (profile?.health_info?.disability_status ?? profile?.disability_status) === true ? "Yes" : "No"
            });

            setPastHistory({
                surgeries: profile?.medical_history?.surgeries ?? profile?.surgeries ?? false,
                surgery_location: Array.isArray(profile?.medical_history?.surgery_location) 
                    ? profile.medical_history.surgery_location 
                    : (profile?.medical_history?.surgery_location ? [profile.medical_history.surgery_location] : [""]),
                has_admissions: !!(profile?.medical_history?.hospital_admissions || profile?.hospital_admissions),
                hospital_admissions: profile?.medical_history?.hospital_admissions ?? profile?.hospital_admissions ?? "",
                has_serious_injuries: !!(profile?.medical_history?.serious_injuries ?? profile?.serious_injuries),
                serious_injuries: profile?.medical_history?.serious_injuries ?? profile?.serious_injuries ?? "",
                blood_transfusion: profile?.medical_history?.blood_transfusion ?? profile?.blood_transfusion ?? false,
                tuberculosis: profile?.medical_history?.tuberculosis ?? profile?.tuberculosis ?? false
            });

            setFamilyHistory({
                diabetes: profile?.health_info?.family_diabetes ?? profile?.family_history?.diabetes ?? profile?.diabetes ?? false,
                heart_disease: profile?.health_info?.family_heart_disease ?? profile?.family_history?.heart_disease ?? profile?.heart_disease ?? false,
                genetic_disorders: Array.isArray(profile?.health_info?.family_genetic_disorders ?? profile?.family_history?.genetic_disorders ?? profile?.genetic_disorders)
                    ? (profile?.health_info?.family_genetic_disorders ?? profile?.family_history?.genetic_disorders ?? profile?.genetic_disorders)
                    : (profile?.health_info?.family_genetic_disorders ?? profile?.family_history?.genetic_disorders ?? profile?.genetic_disorders ? [profile?.health_info?.family_genetic_disorders ?? profile?.family_history?.genetic_disorders ?? profile?.genetic_disorders] : [""]),
                no_known_history: profile?.health_info?.family_no_history ?? profile?.family_history?.no_known_history ?? profile?.no_known_history ?? true
            });

            setLifestyle({
                smoking: profile?.health_info?.smoking_status === "smoker" ? "Current" : (profile?.health_info?.smoking_status === "former smoker" ? "Past" : "Never"),
                alcohol: profile?.health_info?.alcohol_usage ? (profile.health_info.alcohol_usage.charAt(0).toUpperCase() + profile.health_info.alcohol_usage.slice(1)) : "No",
                occupation: profile?.health_info?.occupation || profile?.lifestyle?.occupation || profile?.occupation || "",
                chemical_exposure: profile?.health_info?.chemical_exposure === true || profile?.health_info?.chemical_exposure === "yes",
                notes: ""
            });

            setLifestyleHistory(profile?.health_info?.lifestyle_history || []);

            // Sync Additional Data
            setFreeTextNotes(profile?.health_info?.additional_notes || []);
            setVoiceNotes(profile?.health_info?.voice_notes || []);
            
            if (profile?.photo) {
                const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
                const photoPath = profile.photo.startsWith('/') ? profile.photo : `/${profile.photo}`;
                setPhotoPreview(profile.photo.startsWith('http') ? profile.photo : `${baseUrl}${photoPath}`);
            }
        }
    }, [user]);

    const handleHealthUpdate = async (overrideData = null) => {
        setLoading(true);
        setMessage({ type: "", text: "" });
        
        const memberId = profile.member_id || profile.systemId;

        // 1. Prepare Basic Health Data
        const basicHealthData = {
            member_id: memberId,
            height_cm: healthData.height ? parseFloat(healthData.height) : undefined,
            weight_kg: healthData.weight ? parseFloat(healthData.weight) : undefined,
            blood_group: healthData.blood_group,
            pregnancy_status: String(healthData.pregnancy_status).toLowerCase() === "yes",
            disability_status: String(healthData.disability_status).toLowerCase() === "yes",
            smoking_status: lifestyle.smoking === "Never" ? "non-smoker" : (lifestyle.smoking === "Former" ? "former smoker" : "smoker"),
            alcohol_usage: lifestyle.alcohol.toLowerCase(),
            occupation: lifestyle.occupation,
            chemical_exposure: lifestyle.chemical_exposure ? "yes" : "no",
            family_diabetes: familyHistory.diabetes,
            family_heart_disease: familyHistory.heart_disease,
            family_genetic_disorders: familyHistory.genetic_disorders.filter(d => d.trim() !== ""),
            family_no_history: familyHistory.no_known_history,
            additional_notes: freeTextNotes,
            voice_notes: voiceNotes.map(n => ({ id: n.id, speaker: n.speaker, date: n.date, url: n.url })),
            lifestyle_history: lifestyleHistory
        };

        // 2. Prepare Past Medical History
        const pastMedData = {
            member_id: memberId,
            surgeries: pastHistory.surgeries,
            surgery_location: pastHistory.surgery_location,
            hospital_admissions: pastHistory.has_admissions ? pastHistory.hospital_admissions : "",
            serious_injuries: pastHistory.has_serious_injuries ? pastHistory.serious_injuries : "",
            genetic_disorders: familyHistory.genetic_disorders.filter(d => d.trim() !== ""),
            blood_transfusion_history: pastHistory.blood_transfusion,
            tuberculosis_history: pastHistory.tuberculosis
        };

        try {
            // Update Member Profile (Core personal info + profile completion status)
            const mainUpdate = await updateMemberProfile(profile._id, {
                isProfileComplete: true,
                ...(overrideData || {})
            });

            if (!mainUpdate.success) throw new Error(mainUpdate.message);

            // Check if health details already exists
            const existingHealthRes = await fetchHealthDetails(`?member_id=${memberId}`);
            if (existingHealthRes.success && existingHealthRes.data.healthDetails.length > 0) {
                await updateHealthDetails(existingHealthRes.data.healthDetails[0]._id, basicHealthData);
            } else {
                await createHealthDetails(basicHealthData);
            }
            
            // Check if past medical history already exists
            const existingPastRes = await fetchPastMedicalHistories(`?member_id=${memberId}`);
            if (existingPastRes.success && existingPastRes.data.pastMedicalHistories.length > 0) {
                await updatePastMedicalHistory(existingPastRes.data.pastMedicalHistories[0]._id, pastMedData);
            } else {
                await createPastMedicalHistory(pastMedData);
            }

            // Refresh user session with latest data from backend
            const refreshed = await updateMemberProfile(profile._id, {}); // Fetch latest
            const updatedUser = { ...refreshed.data, userType: profile.userType || "patient" };
            login(updatedUser, localStorage.getItem("token"));
            
            setMessage({ type: "success", text: "Medical profile saved successfully across all modules!" });
        } catch (err) {
            setMessage({ type: "error", text: err.message || "An error occurred during multi-module save." });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAllergy = async (id) => {
        if (!window.confirm("Are you sure you want to remove this allergy record?")) return;
        try {
            const res = await deleteAllergy(id);
            if (res.success) {
                const refreshed = await updateMemberProfile(profile._id, {});
                login({ ...refreshed.data, userType: profile.userType || "patient" }, localStorage.getItem("token"));
                setMessage({ type: "success", text: "Allergy removed successfully." });
            }
        } catch (err) {
            setMessage({ type: "error", text: "Failed to remove allergy." });
        }
    };

    const handleEditAllergy = (allergy) => {
        setEditingAllergyId(allergy._id);
        setAllergyData({
            type: allergy.allergy_type,
            allergen_name: allergy.allergen_name,
            reaction_type: allergy.reaction_type,
            severity: allergy.severity,
            since_year: allergy.since_year || new Date().getFullYear(),
            symptoms: allergy.symptoms || ""
        });
        setActiveAddForms({ [allergy.allergy_type]: true });
        // Scroll to the form
        const element = document.getElementById(`allergy-row-${allergy.allergy_type}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    const handleDeleteChronic = async (id) => {
        if (!window.confirm("Are you sure you want to remove this chronic disease record?")) return;
        try {
            const res = await deleteChronicDisease(id);
            if (res.success) {
                const refreshed = await updateMemberProfile(profile._id, {});
                login({ ...refreshed.data, userType: profile.userType || "patient" }, localStorage.getItem("token"));
                setMessage({ type: "success", text: "Chronic disease record removed successfully." });
            }
        } catch (err) {
            setMessage({ type: "error", text: "Failed to remove chronic disease record." });
        }
    };

    const handleDeleteMedication = async (id) => {
        if (!window.confirm("Are you sure you want to remove this medication?")) return;
        try {
            const res = await deleteMedication(id);
            if (res.success) {
                const refreshed = await updateMemberProfile(profile._id, {});
                login({ ...refreshed.data, userType: profile.userType || "patient" }, localStorage.getItem("token"));
                setMessage({ type: "success", text: "Medication removed successfully." });
            }
        } catch (err) {
            setMessage({ type: "error", text: "Failed to remove medication." });
        }
    };

    const handleAllergySubmit = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                member_id: profile.member_id || profile.systemId,
                allergy_type: allergyData.type,
                allergen_name: allergyData.allergen_name,
                reaction_type: allergyData.reaction_type,
                severity: allergyData.severity,
                since_year: allergyData.since_year || new Date().getFullYear(),
                symptoms: allergyData.symptoms || ""
            };
            
            let res;
            if (editingAllergyId) {
                res = await updateAllergy(editingAllergyId, payload);
            } else {
                res = await createAllergy(payload);
            }

            if (res.success) {
                // Trigger a sync by updating main profile
                const refreshed = await updateMemberProfile(profile._id, {});
                login({ ...refreshed.data, userType: "patient" }, localStorage.getItem("token"));
                setAllergyData({ type: "Food", allergen_name: "", reaction_type: "Rash", severity: "Mild", since_year: new Date().getFullYear(), symptoms: "" });
                setEditingAllergyId(null);
                setActiveAddForms({});
                setMessage({ type: "success", text: editingAllergyId ? "Allergy updated successfully." : "Allergy added successfully." });
            }
        } catch (err) {
            setMessage({ type: "error", text: editingAllergyId ? "Failed to update allergy." : "Failed to add allergy." });
        } finally {
            setLoading(false);
        }
    };

    const handleChronicSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                member_id: profile.member_id || profile.systemId,
                disease_name: chronicData.condition,
                since_year: chronicData.onset_year,
                currently_on_medication: chronicData.on_medication
            };
            
            const res = await createChronicDisease(payload);
            if (res.success) {
                const refreshed = await updateMemberProfile(profile._id, {});
                login({ ...refreshed.data, userType: profile.userType || "patient" }, localStorage.getItem("token"));
                setChronicData({ condition: "Diabetes", onset_year: "", on_medication: false });
            }
        } catch (err) {
            setMessage({ type: "error", text: "Failed to add chronic disease." });
        } finally {
            setLoading(false);
        }
    };

    const handleMedicationSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMedicationErrors({});
        try {
            const payload = {
                member_id: profile.member_id || profile.systemId,
                ...medicationData
            };
            
            let res;
            if (editingMedicationId) {
                res = await updateMedication(editingMedicationId, payload);
            } else {
                res = await createMedication(payload);
            }

            if (res.success) {
                const refreshed = await updateMemberProfile(profile._id, {});
                login({ ...refreshed.data, userType: profile.userType || "patient" }, localStorage.getItem("token"));
                setMedicationData({ medicine_name: "", dosage: "", reason: "", prescribed_by: "", start_date: "" });
                setEditingMedicationId(null);
                setMedicationErrors({});
                setMessage({ type: "success", text: editingMedicationId ? "Medication updated successfully." : "Medication added successfully." });
            }
        } catch (err) {
            if (err.errors) {
                const fieldErrors = {};
                err.errors.forEach(e => {
                    fieldErrors[e.path || e.param] = e.msg;
                });
                setMedicationErrors(fieldErrors);
            } else {
                setMessage({ type: "error", text: editingMedicationId ? "Failed to update medication." : "Failed to add medication." });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleEditMedication = (med) => {
        setEditingMedicationId(med._id);
        // Format date to YYYY-MM-DD for input[type="date"]
        const dateStr = med.start_date ? new Date(med.start_date).toISOString().split('T')[0] : "";
        setMedicationData({
            medicine_name: med.medicine_name,
            dosage: med.dosage,
            reason: med.reason,
            prescribed_by: med.prescribed_by,
            start_date: dateStr
        });
        // Scroll to the form
        const element = document.getElementById("medication-form-section");
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    const handleHealthInputChange = (e) => {
        const { name, value } = e.target;
        setHealthData(prev => ({ ...prev, [name]: value }));
    };

    const handleInputChange = (e) => {
        const { name, value, type, files } = e.target;
        if (type === 'file') {
            const file = files[0];
            if (file) {
                setPersonalData(prev => ({ ...prev, photo: file }));
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPhotoPreview(reader.result);
                };
                reader.readAsDataURL(file);
            }
        } else {
            setPersonalData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handlePersonalSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: "", text: "" });

        const form = new FormData();
        Object.keys(personalData).forEach(key => {
            if (key === 'photo') {
                if (personalData.photo instanceof File) {
                    form.append('photo', personalData.photo);
                }
            } else if (key === 'disability_status' || key === 'pregnancy_status') {
                // Backend expects actual booleans. FormData sends everything as strings.
                // We convert "Yes"/"No" strings from UI to the string "true"/"false" 
                // but express-validator .isBoolean() will correctly parse these strings as boolean values.
                const boolValue = (personalData[key] === "Yes" || personalData[key] === true);
                form.append(key, String(boolValue));
            } else if (key === 'nic' && (personalData[key] === null || personalData[key] === undefined || personalData[key].toString().trim() === '')) {
                // If NIC is missing, send "N/A" to satisfy backend logic for adults
                form.append('nic', 'N/A');
            } else if (personalData[key] !== null && personalData[key] !== undefined && personalData[key] !== "") {
                form.append(key, personalData[key]);
            }
        });

        try {
            const response = await updateMemberProfile(profile._id, form);
            if (response.success) {
                // Preserve userType during update
                const updatedUser = { ...response.data, userType: profile.userType || "patient" };
                login(updatedUser, localStorage.getItem("token"));
                setMessage({ type: "success", text: "Personal details updated successfully!" });
            } else {
                console.error("Profile update failed:", response);
                const errorMsg = response.errors ? 
                    response.errors.map(err => `${err.path}: ${err.msg}`).join(", ") : 
                    (response.message || "Failed to update details.");
                setMessage({ type: "error", text: errorMsg });
            }
        } catch (err) {
            setMessage({ type: "error", text: err.message || "An error occurred." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <PublicLayout>
            <div className="max-w-4xl mx-auto py-8">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    {/* Header */}
                    <div className="bg-teal-700 px-8 py-6 text-white">
                        <h1 className="text-2xl font-bold">Health Profile</h1>
                        <p className="text-teal-100 mt-1">Manage your personal and medical information</p>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-slate-200 bg-slate-50">
                        <button
                            onClick={() => setActiveTab("personal")}
                            className={`px-8 py-4 text-sm font-semibold transition-colors ${
                                activeTab === "personal" 
                                ? "bg-white text-teal-700 border-b-2 border-teal-700" 
                                : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                            }`}
                        >
                            Personal Details
                        </button>
                        <button
                            onClick={() => setActiveTab("health")}
                            className={`px-8 py-4 text-sm font-semibold transition-colors ${
                                activeTab === "health" 
                                ? "bg-white text-teal-700 border-b-2 border-teal-700" 
                                : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                            }`}
                        >
                            Health Details
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-8">
                        {message.text && (
                            <div className={`fixed top-6 right-6 z-[110] w-72 p-4 rounded-xl shadow-2xl border transition-all animate-in slide-in-from-right-10 duration-300 ${
                                message.type === "success" 
                                ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                                : "bg-rose-50 text-rose-700 border-rose-100"
                            }`}>
                                <div className="flex items-start gap-3">
                                    <div className={`p-1 rounded-full ${message.type === "success" ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"}`}>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                            {message.type === "success" ? (
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            ) : (
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            )}
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-bold uppercase tracking-wider mb-0.5">{message.type === 'success' ? 'Success' : 'Error'}</p>
                                        <p className="text-sm font-medium leading-relaxed">{message.text}</p>
                                    </div>
                                    <button onClick={() => setMessage({type:'', text:''})} className="text-slate-400 hover:text-slate-600 transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </div>
                                {/* Progress bar loader */}
                                <div className="absolute bottom-0 left-0 h-1 bg-current opacity-20 w-full animate-progress-shrink origin-left"></div>
                            </div>
                        )}

                        {activeTab === "personal" ? (
                            <form onSubmit={handlePersonalSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="col-span-2 flex items-center gap-6 pb-6 border-b border-slate-100">
                                        <div className="relative group">
                                            <div className="h-28 w-28 rounded-full bg-slate-100 border-2 border-dashed border-teal-200 flex items-center justify-center text-slate-400 overflow-hidden shadow-sm transition-all hover:border-teal-400">
                                                {photoPreview ? (
                                                    <img src={photoPreview} alt="Profile" className="h-full w-full object-cover" />
                                                ) : (
                                                    <span className="text-xs text-center px-2">No Photo</span>
                                                )}
                                                
                                                {photoPreview && (
                                                    <div 
                                                        onClick={() => setIsPhotoModalOpen(true)}
                                                        className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-zoom-in"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className="flex flex-col gap-1">
                                            <label className="cursor-pointer text-sm font-bold text-teal-700 bg-teal-50 px-4 py-2 rounded-lg hover:bg-teal-100 transition-all border border-teal-200 inline-block text-center">
                                                Change Photo
                                                <input type="file" name="photo" className="hidden" accept="image/*" onChange={handleInputChange} />
                                            </label>
                                            <p className="text-[10px] text-slate-400 font-medium">Click image to enlarge</p>
                                        </div>
                                    </div>

                                    {/* Photo Zoom Modal */}
                                    {isPhotoModalOpen && (
                                        <div 
                                            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
                                            onClick={() => setIsPhotoModalOpen(false)}
                                        >
                                            <div className="relative max-w-2xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl transition-all scale-in duration-300">
                                                <button 
                                                    className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors z-10"
                                                    onClick={() => setIsPhotoModalOpen(false)}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l18 18" />
                                                    </svg>
                                                </button>
                                                <img 
                                                    src={photoPreview} 
                                                    alt="Enlarged Profile" 
                                                    className="w-full h-auto max-h-[80vh] object-contain bg-slate-100"
                                                />
                                                <div className="p-4 bg-white flex justify-between items-center">
                                                    <span className="text-sm font-bold text-slate-700">Profile Photo Preview</span>
                                                    <button 
                                                        className="text-xs font-bold text-teal-600 hover:text-teal-700"
                                                        onClick={() => setIsPhotoModalOpen(false)}
                                                    >
                                                        Close View
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                                        <input
                                            type="text"
                                            name="full_name"
                                            value={personalData.full_name}
                                            onChange={handleInputChange}
                                            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-1 focus:ring-teal-500 outline-none"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">NIC Number</label>
                                        <input
                                            type="text"
                                            name="nic"
                                            value={personalData.nic}
                                            onChange={handleInputChange}
                                            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-1 focus:ring-teal-500 outline-none"
                                            required
                                        />
                                    </div>

                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                                        <input
                                            type="text"
                                            name="address"
                                            value={personalData.address}
                                            onChange={handleInputChange}
                                            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-1 focus:ring-teal-500 outline-none"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Contact Number</label>
                                        <input
                                            type="text"
                                            name="contact_number"
                                            value={personalData.contact_number}
                                            onChange={handleInputChange}
                                            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-1 focus:ring-teal-500 outline-none"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth</label>
                                        <input
                                            type="date"
                                            name="date_of_birth"
                                            value={personalData.date_of_birth}
                                            onChange={handleInputChange}
                                            max={new Date().toISOString().split("T")[0]}
                                            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-1 focus:ring-teal-500 outline-none"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
                                        <select
                                            name="gender"
                                            value={personalData.gender}
                                            onChange={handleInputChange}
                                            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-1 focus:ring-teal-500 outline-none"
                                            required
                                        >
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Age</label>
                                        <input
                                            type="text"
                                            value={profile?.age || "0"}
                                            disabled
                                            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-500 cursor-not-allowed"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">GN Division</label>
                                        <input
                                            type="text"
                                            name="gn_division"
                                            value={personalData.gn_division}
                                            onChange={handleInputChange}
                                            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-1 focus:ring-teal-500 outline-none"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">District</label>
                                        <input
                                            type="text"
                                            name="district"
                                            value={personalData.district}
                                            onChange={handleInputChange}
                                            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-1 focus:ring-teal-500 outline-none"
                                            required
                                        />
                                    </div>

                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Household ID</label>
                                        <div className="flex gap-4">
                                            <input
                                                type="text"
                                                name="household_id"
                                                value={personalData.household_id}
                                                onChange={handleInputChange}
                                                className="flex-1 rounded-lg border border-slate-300 px-3 py-2 focus:ring-1 focus:ring-teal-500 outline-none"
                                                placeholder="e.g. ANU-PADGNDIV-12345"
                                            />
                                            <div className="text-xs text-slate-500 flex flex-col justify-center max-w-[200px]">
                                                Use your family's unique Household ID to link records.
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-slate-100 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="rounded-lg bg-teal-600 px-6 py-2.5 font-semibold text-white hover:bg-teal-700 transition-all disabled:opacity-50"
                                    >
                                        {loading ? "Saving Changes..." : "Save Changes"}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="flex flex-col md:flex-row gap-8">
                            {/* Vertical Sub-Tabs */}
                            <div className="w-full md:w-64 flex flex-col gap-1">
                                {[
                                    { id: "basic", label: "Basic Physical Info" },
                                    { id: "allergy", label: "Allergy Information" },
                                    { id: "chronic", label: "Chronic Diseases" },
                                    { id: "meds", label: "Current Medications" },
                                    { id: "past", label: "Past Medical History" },
                                    { id: "family", label: "Family History" },
                                    { id: "lifestyle", label: "Lifestyle" },
                                    { id: "additional", label: "Additional Info" }
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveSubTab(tab.id)}
                                        className={`px-4 py-3 text-left text-sm font-medium rounded-lg transition-all ${
                                            activeSubTab === tab.id
                                                ? "bg-teal-50 text-teal-700 border-l-4 border-teal-600 shadow-sm"
                                                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                        }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* Sub-Tab Content */}
                            <div className="flex-1 bg-white rounded-xl p-6 border border-slate-200 min-h-[500px] shadow-sm">
                                {activeSubTab === "basic" && (
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between border-b pb-4">
                                            <h3 className="text-lg font-bold text-slate-800">Basic Physical Information</h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-1">
                                                <label className="block text-sm font-semibold text-slate-500 uppercase">Height (cm)</label>
                                                <input
                                                    type="number"
                                                    name="height"
                                                    value={healthData.height}
                                                    onChange={handleHealthInputChange}
                                                    placeholder="Enter height"
                                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-1 focus:ring-teal-500 outline-none"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="block text-sm font-semibold text-slate-500 uppercase">Weight (kg)</label>
                                                <input
                                                    type="number"
                                                    name="weight"
                                                    value={healthData.weight}
                                                    onChange={handleHealthInputChange}
                                                    placeholder="Enter weight"
                                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-1 focus:ring-teal-500 outline-none"
                                                />
                                            </div>
                                            {/* ... rest of the basic info fields ... */}
                                            <div className="space-y-1">
                                                <label className="block text-sm font-semibold text-slate-500 uppercase">Blood Group</label>
                                                <select
                                                    name="blood_group"
                                                    value={healthData.blood_group}
                                                    onChange={handleHealthInputChange}
                                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-1 focus:ring-teal-500 outline-none"
                                                >
                                                    <option value="">Select Blood Group</option>
                                                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => (
                                                        <option key={bg} value={bg}>{bg}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="block text-sm font-semibold text-slate-500 uppercase">BMI (Calculated)</label>
                                                <div className="text-xl font-bold text-teal-600 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                                                    {healthData.height && healthData.weight 
                                                        ? (healthData.weight / ((healthData.height/100) ** 2)).toFixed(1)
                                                        : "—"
                                                    }
                                                </div>
                                            </div>
                                            {showPregnancyField && (
                                                <div className="space-y-1">
                                                    <label className="block text-sm font-semibold text-slate-500 uppercase">Pregnancy Status</label>
                                                    <select
                                                        name="pregnancy_status"
                                                        value={healthData.pregnancy_status}
                                                        onChange={handleHealthInputChange}
                                                        className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-1 focus:ring-teal-500 outline-none"
                                                    >
                                                        <option value="No">No</option>
                                                        <option value="Yes">Yes</option>
                                                    </select>
                                                </div>
                                            )}
                                            <div className="space-y-1">
                                                <label className="block text-sm font-semibold text-slate-500 uppercase">Disability Status</label>
                                                <select
                                                    name="disability_status"
                                                    value={healthData.disability_status}
                                                    onChange={handleHealthInputChange}
                                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-1 focus:ring-teal-500 outline-none"
                                                >
                                                    <option value="No">No</option>
                                                    <option value="Yes">Yes</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="pt-6 border-t border-slate-100 flex justify-end">
                                            <button 
                                                onClick={() => handleHealthUpdate()}
                                                disabled={loading}
                                                className="rounded-lg bg-teal-600 px-8 py-3 font-bold text-white hover:bg-teal-700 transition-all disabled:opacity-50 shadow-lg shadow-teal-600/20"
                                            >
                                                {loading ? "Saving Profile..." : "Save Medical Profile"}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {activeSubTab === "allergy" && (
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between border-b pb-4">
                                            <h3 className="text-lg font-bold text-slate-800">Allergy Information</h3>
                                            <span className="px-3 py-1 bg-orange-50 text-orange-700 text-xs font-bold rounded-full uppercase tracking-wider">Alerts</span>
                                        </div>

                                        {/* Allergy Type Question Grid */}
                                        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                                            <table className="w-full text-left border-collapse">
                                                <thead className="bg-slate-50">
                                                    <tr>
                                                        <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Allergy Category</th>
                                                        <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100">
                                                    {[
                                                        { id: "Food", label: "Food Allergy" },
                                                        { id: "Drug", label: "Drug Allergy" },
                                                        { id: "Dust/Pollen", label: "Dust/Pollen" },
                                                        { id: "Latex/Plaster", label: "Latex/Plaster" },
                                                        { id: "Other", label: "Other" }
                                                    ].map((item) => {
                                                        const memberId = profile?.member_id || profile?.systemId;
                                                        const categoryAllergies = profile?.allergies?.filter(a => a.allergy_type === item.id) || [];
                                                        const hasExistingAllergy = categoryAllergies.length > 0;
                                                        
                                                        const isExpanded = activeAddForms[item.id];

                                                        return (
                                                            <React.Fragment key={item.id}>
                                                                <tr className={`hover:bg-slate-50/50 transition-colors ${isExpanded ? 'bg-teal-50/30' : ''}`}>
                                                                    <td className="px-6 py-4">
                                                                        <div className="flex items-center gap-3">
                                                                            <div className="text-sm font-semibold text-slate-700">{item.label}</div>
                                                                            {hasExistingAllergy && (
                                                                                <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-[10px] font-bold rounded-full">
                                                                                    {categoryAllergies.length} {categoryAllergies.length === 1 ? 'Record' : 'Records'}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-6 py-4 text-right">
                                                                        <button
                                                                            onClick={() => setActiveAddForms(prev => ({...prev, [item.id]: !prev[item.id]}))}
                                                                            className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all border ${
                                                                                isExpanded 
                                                                                ? "bg-white text-slate-600 border-slate-200 shadow-sm" 
                                                                                : "bg-teal-50 text-teal-700 border-teal-100 hover:bg-teal-100"
                                                                            }`}
                                                                        >
                                                                            {isExpanded ? (
                                                                                <>
                                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                                                        <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                                                                                    </svg>
                                                                                    COLLAPSE
                                                                                </>
                                                                            ) : (
                                                                                <>
                                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                                                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                                                    </svg>
                                                                                    {hasExistingAllergy ? "ADD ANOTHER" : "ADD ALLERGY"}
                                                                                </>
                                                                            )}
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                                {/* Nested Detail Form for this specifically selected type */}
                                                                {isExpanded && (
                                                                    <tr>
                                                                        <td colSpan="3" className="px-6 py-6 bg-slate-50/80 border-t border-slate-200 shadow-inner">
                                                                            <form 
                                                                                onSubmit={handleAllergySubmit} 
                                                                                className="space-y-4"
                                                                            >
                                                                            <h4 className="text-[10px] font-bold text-teal-700 uppercase tracking-widest flex items-center mb-4">
                                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                                </svg>
                                                                                {item.label} Details
                                                                            </h4>
                                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                                <div>
                                                                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Specific Allergen Name</label>
                                                                                    <input 
                                                                                        type="text"
                                                                                        value={allergyData.allergen_name}
                                                                                        onChange={(e) => setAllergyData({...allergyData, allergen_name: e.target.value})}
                                                                                        placeholder="e.g. Peanuts, Penicillin"
                                                                                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-1 focus:ring-teal-500 outline-none bg-white"
                                                                                        required
                                                                                    />
                                                                                </div>
                                                                                <div>
                                                                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Reaction type</label>
                                                                                    <select
                                                                                        value={["Rash", "Swelling", "Breathing difficulty", "Vomiting"].includes(allergyData.reaction_type) ? allergyData.reaction_type : "Other"}
                                                                                        onChange={(e) => {
                                                                                            const val = e.target.value;
                                                                                            setAllergyData({...allergyData, reaction_type: val, symptoms: val === "Other" ? "" : allergyData.symptoms});
                                                                                        }}
                                                                                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-1 focus:ring-teal-500 outline-none bg-white"
                                                                                        required
                                                                                    >
                                                                                        {["Rash", "Swelling", "Breathing difficulty", "Vomiting", "Other"].map(r => (
                                                                                            <option key={r} value={r}>{r}</option>
                                                                                        ))}
                                                                                    </select>
                                                                                </div>
                                                                                <div>
                                                                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Severity</label>
                                                                                    <select 
                                                                                        value={allergyData.severity}
                                                                                        onChange={(e) => setAllergyData({...allergyData, severity: e.target.value})}
                                                                                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-1 focus:ring-teal-500 outline-none bg-white"
                                                                                    >
                                                                                        <option value="Mild">Mild</option>
                                                                                        <option value="Moderate">Moderate</option>
                                                                                        <option value="Severe">Severe</option>
                                                                                        <option value="Critical">Critical</option>
                                                                                    </select>
                                                                                </div>
                                                                                <div>
                                                                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Severity Level Description</label>
                                                                                    <div className="text-[10px] text-slate-400 mt-1 italic">Mild/Moderate/Severe</div>
                                                                                </div>
                                                                                {(!["Rash", "Swelling", "Breathing difficulty", "Vomiting"].includes(allergyData.reaction_type) || allergyData.reaction_type === "Other") && (
                                                                                    <div className="col-span-1 md:col-span-2">
                                                                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Specify Reaction Type / Symptoms</label>
                                                                                        <input 
                                                                                            type="text"
                                                                                            value={allergyData.reaction_type === "Other" ? "" : (["Rash", "Swelling", "Breathing difficulty", "Vomiting"].includes(allergyData.reaction_type) ? "" : allergyData.reaction_type)}
                                                                                            onChange={(e) => setAllergyData({...allergyData, reaction_type: e.target.value})}
                                                                                            placeholder="Type the symptom here (e.g. Dizziness, Nausea...)"
                                                                                            className="w-full rounded-lg border border-teal-500/30 px-3 py-2 text-sm focus:ring-1 focus:ring-teal-500 outline-none bg-teal-50/20"
                                                                                            required
                                                                                        />
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                            <div className="flex space-x-2">
                                                                                <button 
                                                                                    type="submit" 
                                                                                    disabled={loading}
                                                                                    className="mt-4 flex-1 bg-teal-600 text-white font-bold py-2 rounded-lg hover:bg-teal-700 transition-colors shadow-lg shadow-teal-600/20 disabled:opacity-50"
                                                                                >
                                                                                    {loading ? (editingAllergyId ? "Updating..." : "Adding...") : (editingAllergyId ? "Update Allergy" : `Add ${item.label} Record`)}
                                                                                </button>
                                                                                {editingAllergyId && (
                                                                                    <button 
                                                                                        type="button"
                                                                                        onClick={() => {
                                                                                            setEditingAllergyId(null);
                                                                                            setAllergyData({ type: "Food", allergen_name: "", reaction_type: "Rash", severity: "Mild", since_year: new Date().getFullYear(), symptoms: "" });
                                                                                            setActiveAddForms({});
                                                                                        }}
                                                                                        className="mt-4 px-4 bg-slate-200 text-slate-600 font-bold py-2 rounded-lg hover:bg-slate-300 transition-colors"
                                                                                    >
                                                                                        Cancel
                                                                                    </button>
                                                                                )}
                                                                            </div>
                                                                        </form>
                                                                    </td>
                                                                </tr>
                                                            )}
                                                        </React.Fragment>
                                                    )
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>

                                        {profile?.allergies?.length > 0 ? (
                                            <div className="mt-8 space-y-4">
                                                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Recorded Allergy Details</h4>
                                                {profile.allergies.map((allergy, idx) => (
                                                    <div key={idx} className="p-4 rounded-xl border-l-4 border-orange-500 bg-white shadow-sm border border-slate-200 relative group transition-all hover:shadow-md">
                                                        <div className="absolute top-3 right-3 flex space-x-2 z-10 transition-opacity">
                                                            <button 
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleEditAllergy(allergy);
                                                                }}
                                                                className="p-1.5 rounded-full text-slate-400 bg-slate-50 hover:text-teal-600 hover:bg-teal-50 transition-all border border-slate-100 shadow-sm"
                                                                title="Edit Allergy"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                </svg>
                                                            </button>
                                                            <button 
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleDeleteAllergy(allergy._id);
                                                                }}
                                                                className="p-1.5 rounded-full text-slate-400 bg-slate-50 hover:text-rose-600 hover:bg-rose-50 transition-all border border-slate-100 shadow-sm"
                                                                title="Delete Allergy"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                        <div className="flex justify-between items-start mb-3 pr-20">
                                                            <div>
                                                                <div className="font-bold text-slate-800 text-base">{allergy.allergen_name || "Unknown Allergen"}</div>
                                                                <div className="text-[10px] font-bold text-teal-600 uppercase tracking-wider bg-teal-50 px-2 py-0.5 rounded mt-1 inline-block">
                                                                    {allergy.allergy_type}
                                                                </div>
                                                            </div>
                                                            <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest shadow-sm ${
                                                                allergy.severity === 'Severe' ? 'bg-rose-100 text-rose-700 border border-rose-200' : 
                                                                allergy.severity === 'Moderate' ? 'bg-orange-100 text-orange-700 border border-orange-200' :
                                                                'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                                            }`}>{allergy.severity}</span>
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6 text-xs bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                                                            <div className="flex flex-col gap-1">
                                                                <span className="font-black text-slate-400 text-[10px] uppercase tracking-tighter">Reaction Type</span>
                                                                <span className="text-slate-700 font-medium">{allergy.reaction_type || "N/A"}</span>
                                                            </div>
                                                            <div className="flex flex-col gap-1">
                                                                <span className="font-black text-slate-400 text-[10px] uppercase tracking-tighter">Onset Year</span>
                                                                <span className="text-slate-700 font-medium">{allergy.since_year || "Not Specified"}</span>
                                                            </div>
                                                            {allergy.symptoms && (
                                                                <div className="flex flex-col gap-1 col-span-1 md:col-span-2 border-t border-slate-200/50 pt-2">
                                                                    <span className="font-black text-slate-400 text-[10px] uppercase tracking-tighter">Additional Symptoms / Clinical Notes</span>
                                                                    <span className="text-slate-600 italic leading-relaxed">"{allergy.symptoms}"</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl text-sm border border-emerald-100 flex items-center mt-6">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                                No known allergies recorded.
                                            </div>
                                        )}

                                        <div className="pt-6 border-t border-slate-100 flex justify-end">
                                            <button 
                                                onClick={() => handleHealthUpdate()}
                                                disabled={loading}
                                                className="rounded-lg bg-teal-600 px-8 py-3 font-bold text-white hover:bg-teal-700 transition-all disabled:opacity-50 shadow-lg shadow-teal-600/20"
                                            >
                                                {loading ? "Saving Profile..." : "Save Medical Profile"}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {activeSubTab === "chronic" && (
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between border-b pb-4">
                                            <h3 className="text-lg font-bold text-slate-800">Chronic Diseases</h3>
                                            <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full uppercase tracking-wider">Long-term</span>
                                        </div>

                                        {/* Chronic Disease Question Grid */}
                                        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                                            <table className="w-full text-left border-collapse">
                                                <thead className="bg-slate-50">
                                                    <tr>
                                                        <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Medical Condition</th>
                                                        <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center w-24">Yes</th>
                                                        <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center w-24">No</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100">
                                                    {[
                                                        "Diabetes Mellitus", "Hypertension (High Blood Pressure)", "Heart Disease (e.g., coronary artery disease)",
                                                        "Stroke / Cerebrovascular Disease", "Asthma", "Chronic Lung Disease (e.g., COPD)",
                                                        "Chronic Kidney Disease", "Thyroid Disorders (Hypo/Hyperthyroidism)", "Epilepsy / Seizure Disorders",
                                                        "Cancer (any type)", "Mental Health Disorders (Depression, Anxiety, etc.)", "Obesity",
                                                        "High Cholesterol (Hyperlipidemia)", "Arthritis (Osteoarthritis / Rheumatoid)", "Liver Disease (Chronic)",
                                                        "Other (Specify)"
                                                    ].map((condition) => {
                                                        const memberId = profile?.member_id || profile?.systemId;
                                                        const standardConditions = [
                                                            "Diabetes Mellitus", "Hypertension (High Blood Pressure)", "Heart Disease (e.g., coronary artery disease)",
                                                            "Stroke / Cerebrovascular Disease", "Asthma", "Chronic Lung Disease (e.g., COPD)",
                                                            "Chronic Kidney Disease", "Thyroid Disorders (Hypo/Hyperthyroidism)", "Epilepsy / Seizure Disorders",
                                                            "Cancer (any type)", "Mental Health Disorders (Depression, Anxiety, etc.)", "Obesity",
                                                            "High Cholesterol (Hyperlipidemia)", "Arthritis (Osteoarthritis / Rheumatoid)", "Liver Disease (Chronic)"
                                                        ];
                                                        const alreadyHasCondition = condition !== 'Other (Specify)' && profile?.chronic_diseases?.some(c => (c.condition === condition || c.disease_name === condition));
                                                        
                                                        // Determine if we should show 'Yes' (either because state is true OR because they already have it)
                                                        const isYesChecked = chronicStates[condition] === true || alreadyHasCondition;
                                                        const isNoChecked = chronicStates[condition] === false && !alreadyHasCondition;

                                                        return (
                                                            <React.Fragment key={condition}>
                                                                <tr className="hover:bg-slate-50/50 transition-colors">
                                                                    <td className="px-6 py-4">
                                                                        <div className="flex items-center gap-3">
                                                                            <div className={`text-sm font-semibold ${alreadyHasCondition ? 'text-teal-700' : 'text-slate-700'}`}>
                                                                                {condition}
                                                                                {alreadyHasCondition && (
                                                                                    <span className="ml-2 text-[8px] bg-teal-100 text-teal-700 px-1.5 py-0.5 rounded-full uppercase tracking-tighter">Recorded</span>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-6 py-4 text-center">
                                                                        <div className="flex flex-col items-center gap-2">
                                                                            <input 
                                                                                type="radio" 
                                                                                name={`has_${condition}`} 
                                                                                checked={isYesChecked}
                                                                                onChange={() => {
                                                                                    setChronicStates(prev => ({...prev, [condition]: true}));
                                                                                    if (condition === 'Other (Specify)') {
                                                                                        setIsOtherExpanded(true);
                                                                                    }
                                                                                }}
                                                                                className={`w-4 h-4 text-teal-600 focus:ring-0 transition-all cursor-pointer ${
                                                                                    isYesChecked ? 'scale-110' : ''
                                                                                }`}
                                                                            />
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-6 py-4 text-center">
                                                                        <input 
                                                                            type="radio" 
                                                                            name={`has_${condition}`} 
                                                                            checked={isNoChecked}
                                                                            onChange={() => {
                                                                                setChronicStates(prev => ({...prev, [condition]: false}));
                                                                                if (condition === 'Other (Specify)') setIsOtherExpanded(false);
                                                                            }}
                                                                            className={`w-4 h-4 text-rose-600 focus:ring-0 transition-all cursor-pointer ${
                                                                                isNoChecked ? 'scale-110' : ''
                                                                            }`}
                                                                        />
                                                                    </td>
                                                                </tr>
                                                                {/* Nested Detail Form for this specifically selected condition */}
                                                                {((condition !== 'Other (Specify)' && chronicStates[condition] && !alreadyHasCondition) || (condition === 'Other (Specify)' && isOtherExpanded)) && (
                                                                    <tr>
                                                                        <td colSpan="3" className="px-6 py-6 bg-slate-50/80 border-t border-slate-200 shadow-inner">
                                                                            {condition === 'Other (Specify)' && profile?.chronic_diseases?.some(c => !standardConditions.includes(c.disease_name || c.condition)) && (
                                                                                <button 
                                                                                    type="button"
                                                                                    onClick={() => setIsOtherExpanded(false)}
                                                                                    className="mb-4 text-xs font-bold text-rose-600 flex items-center gap-1 hover:text-rose-700 transition-colors"
                                                                                >
                                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                                                                    </svg>
                                                                                    CANCEL ADDING
                                                                                </button>
                                                                            )}
                                                                            <form 
                                                                                onSubmit={async (e) => {
                                                                                    e.preventDefault();
                                                                                    setLoading(true);
                                                                                    try {
                                                                                        const calculatedMemberId = profile?.member_id || profile?.systemId || profile?._id;
                                                                                        const payload = {
                                                                                            member_id: calculatedMemberId,
                                                                                            disease_name: condition === "Other (Specify)" ? chronicData.condition : condition,
                                                                                            since_year: Number(chronicData.onset_year),
                                                                                            currently_on_medication: !!chronicData.on_medication
                                                                                        };
                                                                                        
                                                                                        console.log("Submitting chronic disease payload:", payload);
                                                                                        const res = await createChronicDisease(payload);
                                                                                        if (res.success) {
                                                                                            // Fetch latest member data to refresh profile
                                                                                            const refreshed = await updateMemberProfile(profile._id, {});
                                                                                            login({ ...refreshed.data, userType: profile.userType || "patient" }, localStorage.getItem("token"));
                                                                                            
                                                                                            // Reset states
                                                                                            setChronicStates(prev => ({...prev, [condition]: false}));
                                                                                            setChronicData({ condition: "Diabetes", onset_year: "", on_medication: false });
                                                                                            if (condition === 'Other') setIsOtherExpanded(false);
                                                                                            
                                                                                            // Collapse the chronic disease drop down
                                                                                            // setActiveSubTab("basic");
                                                                                            setMessage({ type: "success", text: "Chronic disease added successfully!" });
                                                                                        } else {
                                                                                            setMessage({ type: "error", text: res.message || "Failed to add chronic disease." });
                                                                                        }
                                                                                    } catch (error) {
                                                                                        console.error("Error adding chronic disease:", error);
                                                                                        setMessage({ type: "error", text: "An error occurred while adding the record." });
                                                                                    } finally {
                                                                                        setLoading(false);
                                                                                    }
                                                                                }} 
                                                                                className="space-y-4"
                                                                            >
                                                                            <h4 className="text-[10px] font-bold text-teal-700 uppercase tracking-widest flex items-center mb-4">
                                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                                                </svg>
                                                                                {condition === "Other" ? "Specify Other condition" : `${condition} Details`}
                                                                            </h4>
                                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                                {condition === "Other" && (
                                                                                    <div className="col-span-1 md:col-span-2">
                                                                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Disease Name</label>
                                                                                        <input 
                                                                                            type="text"
                                                                                            value={chronicData.condition === "Diabetes" ? "" : chronicData.condition}
                                                                                            onChange={(e) => setChronicData({...chronicData, condition: e.target.value})}
                                                                                            placeholder="Type the disease name here..."
                                                                                            className="w-full rounded-lg border border-teal-500/30 px-3 py-2 text-sm focus:ring-1 focus:ring-teal-500 outline-none bg-teal-50/20"
                                                                                            required
                                                                                        />
                                                                                    </div>
                                                                                )}
                                                                                <div>
                                                                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Onset Year</label>
                                                                                    <input 
                                                                                        type="number"
                                                                                        value={chronicData.onset_year}
                                                                                        onChange={(e) => setChronicData({...chronicData, onset_year: e.target.value})}
                                                                                        placeholder="e.g. 2015"
                                                                                        min={profile?.date_of_birth ? new Date(profile.date_of_birth).getFullYear() : 1900}
                                                                                        max={new Date().getFullYear()}
                                                                                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-1 focus:ring-teal-500 outline-none bg-white font-medium"
                                                                                        required
                                                                                    />
                                                                                    {profile?.date_of_birth && (
                                                                                        <p className="mt-1 text-[9px] text-slate-400 italic">
                                                                                            Must be between {new Date(profile.date_of_birth).getFullYear()} and {new Date().getFullYear()}
                                                                                        </p>
                                                                                    )}
                                                                                </div>
                                                                                <div className="flex items-center gap-3 py-2">
                                                                                    <input 
                                                                                        type="checkbox"
                                                                                        id={`on_medication_${condition}`}
                                                                                        checked={chronicData.on_medication}
                                                                                        onChange={(e) => setChronicData({...chronicData, on_medication: e.target.checked})}
                                                                                        className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                                                                                    />
                                                                                    <label htmlFor={`on_medication_${condition}`} className="text-sm font-medium text-slate-700">Currently on medication</label>
                                                                                </div>
                                                                            </div>
                                                                            <button 
                                                                                type="submit" 
                                                                                disabled={loading}
                                                                                className="mt-4 w-full bg-teal-600 text-white font-bold py-2 rounded-lg hover:bg-teal-700 transition-colors shadow-lg shadow-teal-600/20 disabled:opacity-50"
                                                                            >
                                                                                {loading ? "Adding..." : `Add ${condition} Record`}
                                                                            </button>
                                                                        </form>
                                                                    </td>
                                                                </tr>
                                                            )}
                                                            {condition === "Other" && (
                                                                <tr className="bg-slate-50/10">
                                                                    <td colSpan="3" className="px-6 py-2 pb-4">
                                                                        <button 
                                                                            onClick={() => setIsOtherExpanded(!isOtherExpanded)}
                                                                            className="flex items-center gap-2 text-teal-700 font-bold text-[11px] uppercase tracking-wider hover:text-teal-800 transition-colors group py-1"
                                                                        >
                                                                            <div className={`p-1 rounded-md transition-all flex items-center justify-center ${
                                                                                isOtherExpanded 
                                                                                ? "bg-rose-50 text-rose-600" 
                                                                                : "bg-teal-50 text-teal-600 group-hover:bg-teal-100"
                                                                            } border border-slate-100`}>
                                                                                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform duration-200 ${isOtherExpanded ? 'rotate-45' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                                                                                </svg>
                                                                            </div>
                                                                            SPECIFY OTHER CONDITION
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            )}
                                                        </React.Fragment>
                                                    )
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>

                                        {profile?.chronic_diseases?.length > 0 ? (
                                            <div className="mt-8 space-y-4">
                                                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Recorded Chronic Conditions</h4>
                                                {profile.chronic_diseases.map((disease, idx) => (
                                                    <div key={idx} className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm border-l-4 border-indigo-500 relative group">
                                                        <button 
                                                            onClick={() => handleDeleteChronic(disease._id)}
                                                            className="absolute top-3 right-3 p-1 rounded-full text-slate-400 bg-slate-50 hover:text-rose-600 hover:bg-rose-50 transition-all border border-slate-100 shadow-sm z-10"
                                                            title="Delete Chronic Disease"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                        </button>
                                                        <div className="flex flex-col gap-1 pr-12">
                                                            <div className="font-bold text-slate-800 text-base">{disease.disease_name || disease.condition}</div>
                                                            <div className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded inline-block w-fit">
                                                                Since {disease.since_year || disease.onset_year || "Unknown"}
                                                            </div>
                                                        </div>
                                                        <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-2 w-full">
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">On Medication:</span>
                                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${(disease.currently_on_medication ?? disease.on_medication) ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                                                {(disease.currently_on_medication ?? disease.on_medication) ? "YES" : "NO"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl text-sm border border-emerald-100 flex items-center mt-6">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                                No chronic conditions recorded.
                                            </div>
                                        )}

                                        <div className="pt-6 border-t border-slate-100 flex justify-end">
                                            <button 
                                                onClick={() => handleHealthUpdate()}
                                                disabled={loading}
                                                className="rounded-lg bg-teal-600 px-8 py-3 font-bold text-white hover:bg-teal-700 transition-all disabled:opacity-50 shadow-lg shadow-teal-600/20"
                                            >
                                                {loading ? "Saving Profile..." : "Save Medical Profile"}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {activeSubTab === "meds" && (
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-center border-b pb-4">
                                            <h3 className="text-lg font-bold text-slate-800">Current Medications</h3>
                                            <span className="px-3 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full uppercase tracking-wider">Prescriptions</span>
                                        </div>

                                        {/* Add Medication Form */}
                                        <form id="medication-form-section" onSubmit={handleMedicationSubmit} className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Medicine name</label>
                                                    <input 
                                                        type="text"
                                                        value={medicationData.medicine_name}
                                                        onChange={(e) => setMedicationData({...medicationData, medicine_name: e.target.value})}
                                                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-1 focus:ring-teal-500 outline-none"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Dosage (Per day)</label>
                                                    <input 
                                                        type="text"
                                                        value={medicationData.dosage}
                                                        onChange={(e) => setMedicationData({...medicationData, dosage: e.target.value})}
                                                        placeholder="e.g. 1"
                                                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-1 focus:ring-teal-500 outline-none"
                                                        required
                                                    />
                                                </div>
                                                <div className="col-span-1 md:col-span-2">
                                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Reason for taking</label>
                                                    <input 
                                                        type="text"
                                                        value={medicationData.reason}
                                                        onChange={(e) => setMedicationData({...medicationData, reason: e.target.value})}
                                                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-1 focus:ring-teal-500 outline-none"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Prescribed by</label>
                                                    <input 
                                                        type="text"
                                                        value={medicationData.prescribed_by}
                                                        onChange={(e) => setMedicationData({...medicationData, prescribed_by: e.target.value})}
                                                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-1 focus:ring-teal-500 outline-none"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Start date</label>
                                                    <input 
                                                        type="date"
                                                        value={medicationData.start_date ? new Date(medicationData.start_date).toISOString().split('T')[0] : ""}
                                                        onChange={(e) => {
                                                            setMedicationData({...medicationData, start_date: e.target.value});
                                                            if (medicationErrors.start_date) {
                                                                setMedicationErrors(prev => ({ ...prev, start_date: null }));
                                                            }
                                                        }}
                                                        className={`w-full rounded-lg border px-3 py-2 text-sm focus:ring-1 outline-none ${
                                                            medicationErrors.start_date ? "border-red-500 focus:ring-red-500" : "border-slate-300 focus:ring-teal-500"
                                                        }`}
                                                    />
                                                    {medicationErrors.start_date && (
                                                        <p className="mt-1 text-[10px] font-bold text-red-600 uppercase tracking-tight">
                                                            {medicationErrors.start_date}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex space-x-2">
                                                <button 
                                                    type="submit" 
                                                    disabled={loading}
                                                    className="mt-4 flex-1 bg-teal-600 text-white font-bold py-2 rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 shadow-lg shadow-teal-600/20"
                                                >
                                                    {loading ? (editingMedicationId ? "Updating..." : "Saving...") : (editingMedicationId ? "Update Medication" : "Add Medication")}
                                                </button>
                                                {editingMedicationId && (
                                                    <button 
                                                        type="button"
                                                        onClick={() => {
                                                            setEditingMedicationId(null);
                                                            setMedicationData({ medicine_name: "", dosage: "", reason: "", prescribed_by: "", start_date: "" });
                                                        }}
                                                        className="mt-4 px-4 bg-slate-200 text-slate-600 font-bold py-2 rounded-lg hover:bg-slate-300 transition-colors"
                                                    >
                                                        Cancel
                                                    </button>
                                                )}
                                            </div>
                                        </form>
                                        
                                        {profile?.current_medications?.length > 0 ? (
                                            <div className="space-y-4">
                                                {profile.current_medications.map((med, idx) => (
                                                    <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden border-l-4 border-amber-500 group">
                                                        <div className="absolute top-4 right-4 flex space-x-2 z-10 transition-opacity">
                                                            <button 
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleEditMedication(med);
                                                                }}
                                                                className="p-1.5 rounded-full text-slate-400 bg-slate-50 hover:text-teal-600 hover:bg-teal-50 transition-all border border-slate-100 shadow-sm"
                                                                title="Edit Medication"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                </svg>
                                                            </button>
                                                            <button 
                                                                onClick={() => handleDeleteMedication(med._id)}
                                                                className="p-1.5 rounded-full text-slate-400 bg-slate-50 hover:text-rose-600 hover:bg-rose-50 transition-all border border-slate-100 shadow-sm"
                                                                title="Delete Medication"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                        <h4 className="text-lg font-bold text-teal-700 mb-3 pr-20">{med.medicine_name}</h4>
                                                        <div className="grid grid-cols-2 gap-y-3 text-sm">
                                                            <div><span className="text-slate-400 text-[10px] font-bold uppercase block">Dosage</span> <span className="font-semibold text-slate-700">{med.dosage}</span></div>
                                                            <div><span className="text-slate-400 text-[10px] font-bold uppercase block">Start Date</span> <span className="font-semibold text-slate-700">{med.start_date ? new Date(med.start_date).toISOString().split('T')[0] : "N/A"}</span></div>
                                                            <div className="col-span-2"><span className="text-slate-400 text-[10px] font-bold uppercase block">Reason</span> <span className="text-slate-700">{med.reason}</span></div>
                                                            <div className="col-span-2"><span className="text-slate-400 text-[10px] font-bold uppercase block">Prescribed By</span> <span className="text-slate-600 italic">Dr. {med.prescribed_by}</span></div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                                                <p className="text-slate-400 font-medium">No active medications currently listed.</p>
                                            </div>
                                        )}

                                        <div className="pt-6 border-t border-slate-100 flex justify-end">
                                            <button 
                                                onClick={() => handleHealthUpdate()}
                                                disabled={loading}
                                                className="rounded-lg bg-teal-600 px-8 py-3 font-bold text-white hover:bg-teal-700 transition-all disabled:opacity-50 shadow-lg shadow-teal-600/20"
                                            >
                                                {loading ? "Saving Profile..." : "Save Medical Profile"}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {activeSubTab === "past" && (
                                    <div className="space-y-6">
                                        <div className="border-b pb-4">
                                            <h3 className="text-lg font-bold text-slate-800">Past Major Medical History</h3>
                                        </div>
                                        
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-1 gap-4">
                                                <div className="space-y-3">
                                                    <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-200">
                                                        <span className="font-medium text-slate-700">Surgeries History</span>
                                                        <input 
                                                            type="checkbox" 
                                                            checked={pastHistory.surgeries}
                                                            onChange={(e) => setPastHistory({...pastHistory, surgeries: e.target.checked})}
                                                            className="w-5 h-5 text-teal-600 rounded"
                                                        />
                                                    </div>
                                                    {pastHistory.surgeries && (
                                                        <div className="px-4 pb-2 animate-in fade-in slide-in-from-top-1 duration-200 space-y-3">
                                                            <div className="flex items-center justify-between">
                                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Surgery Location / Hospital</label>
                                                                <button 
                                                                    type="button"
                                                                    onClick={() => setPastHistory(prev => ({...prev, surgery_location: [...prev.surgery_location, ""]}))}
                                                                    className="p-1 rounded-md bg-teal-50 text-teal-600 hover:bg-teal-100 border border-teal-100 transition-all flex items-center justify-center transform hover:scale-110 active:scale-95 shadow-sm"
                                                                    title="Add another location"
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                                                                    </svg>
                                                                </button>
                                                            </div>
                                                            {pastHistory.surgery_location.map((location, idx) => (
                                                                <div key={idx} className="flex gap-2 animate-in fade-in zoom-in-95 duration-200">
                                                                    <div className="relative flex-1 group">
                                                                        <input 
                                                                            type="text" 
                                                                            value={location}
                                                                            onChange={(e) => {
                                                                                const newLocs = [...pastHistory.surgery_location];
                                                                                newLocs[idx] = e.target.value;
                                                                                setPastHistory({...pastHistory, surgery_location: newLocs});
                                                                            }}
                                                                            placeholder={idx === 0 ? "e.g. Hand" : "Enter another surgery..."}
                                                                            className="w-full rounded-lg border border-teal-500/30 bg-teal-50/10 px-3 py-2 text-sm focus:ring-1 focus:ring-teal-500 outline-none pr-8"
                                                                        />
                                                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-teal-600/40 font-bold group-focus-within:hidden">
                                                                            #{idx + 1}
                                                                        </div>
                                                                    </div>
                                                                    {pastHistory.surgery_location.length > 1 && (
                                                                        <button 
                                                                            type="button"
                                                                            onClick={() => {
                                                                                const newLocs = pastHistory.surgery_location.filter((_, i) => i !== idx);
                                                                                setPastHistory({...pastHistory, surgery_location: newLocs});
                                                                            }}
                                                                            className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100 group"
                                                                            title="Remove location"
                                                                        >
                                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform group-hover:rotate-90 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                            </svg>
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="space-y-3">
                                                    <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-200">
                                                        <span className="font-medium text-slate-700">Hospital Admissions (Last 5 years)</span>
                                                        <input 
                                                            type="checkbox" 
                                                            checked={!!pastHistory.has_admissions}
                                                            onChange={(e) => setPastHistory({...pastHistory, has_admissions: e.target.checked})}
                                                            className="w-5 h-5 text-teal-600 rounded"
                                                        />
                                                    </div>
                                                    {pastHistory.has_admissions && (
                                                        <div className="px-4 pb-2 animate-in fade-in slide-in-from-top-1 duration-200">
                                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Admission Details</label>
                                                            <input 
                                                                type="text" 
                                                                value={pastHistory.hospital_admissions}
                                                                onChange={(e) => setPastHistory({...pastHistory, hospital_admissions: e.target.value})}
                                                                placeholder="Enter details of hospitalizations"
                                                                className="w-full rounded-lg border border-teal-500/30 bg-teal-50/10 px-3 py-2 text-sm focus:ring-1 focus:ring-teal-500 outline-none"
                                                            />
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="space-y-3">
                                                    <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-200">
                                                        <span className="font-medium text-slate-700">Serious Injuries</span>
                                                        <input 
                                                            type="checkbox" 
                                                            checked={!!pastHistory.has_serious_injuries}
                                                            onChange={(e) => setPastHistory({...pastHistory, has_serious_injuries: e.target.checked})}
                                                            className="w-5 h-5 text-teal-600 rounded"
                                                        />
                                                    </div>
                                                    {pastHistory.has_serious_injuries && (
                                                        <div className="px-4 pb-2 animate-in fade-in slide-in-from-top-1 duration-200">
                                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Injury Description</label>
                                                            <input 
                                                                type="text" 
                                                                value={pastHistory.serious_injuries}
                                                                onChange={(e) => setPastHistory({...pastHistory, serious_injuries: e.target.value})}
                                                                placeholder="Describe the injury..."
                                                                className="w-full rounded-lg border border-teal-500/30 bg-teal-50/10 px-3 py-2 text-sm focus:ring-1 focus:ring-teal-500 outline-none"
                                                            />
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-200">
                                                    <span className="font-medium text-slate-700">Blood Transfusion History</span>
                                                    <input 
                                                        type="checkbox" 
                                                        checked={pastHistory.blood_transfusion}
                                                        onChange={(e) => setPastHistory({...pastHistory, blood_transfusion: e.target.checked})}
                                                        className="w-5 h-5 text-teal-600 rounded"
                                                    />
                                                </div>
                                                <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-200">
                                                    <span className="font-medium text-slate-700">Tuberculosis History</span>
                                                    <input 
                                                        type="checkbox" 
                                                        checked={pastHistory.tuberculosis}
                                                        onChange={(e) => setPastHistory({...pastHistory, tuberculosis: e.target.checked})}
                                                        className="w-5 h-5 text-teal-600 rounded"
                                                    />
                                                </div>
                                            </div>
                                            <div className="pt-6 border-t border-slate-100 flex justify-end">
                                                <button 
                                                    onClick={() => handleHealthUpdate()}
                                                    disabled={loading}
                                                    className="rounded-lg bg-teal-600 px-8 py-3 font-bold text-white hover:bg-teal-700 transition-all disabled:opacity-50 shadow-lg shadow-teal-600/20"
                                                >
                                                    {loading ? "Saving Profile..." : "Save Medical Profile"}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeSubTab === "family" && (
                                    <div className="space-y-6">
                                        <div className="border-b pb-4">
                                            <h3 className="text-lg font-bold text-slate-800">Family Health & Genetic History</h3>
                                        </div>
                                        
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-200">
                                                    <span className="text-sm font-medium text-slate-700">Diabetes in Family</span>
                                                    <input 
                                                        type="checkbox" 
                                                        checked={familyHistory.diabetes}
                                                        onChange={(e) => {
                                                            const isChecked = e.target.checked;
                                                            setFamilyHistory({
                                                                ...familyHistory, 
                                                                diabetes: isChecked,
                                                                no_known_history: isChecked ? false : familyHistory.no_known_history
                                                            });
                                                        }}
                                                        className="w-5 h-5 text-teal-600 rounded"
                                                    />
                                                </div>
                                                <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-200">
                                                    <span className="text-sm font-medium text-slate-700">Heart Disease in Family</span>
                                                    <input 
                                                        type="checkbox" 
                                                        checked={familyHistory.heart_disease}
                                                        onChange={(e) => {
                                                            const isChecked = e.target.checked;
                                                            setFamilyHistory({
                                                                ...familyHistory, 
                                                                heart_disease: isChecked,
                                                                no_known_history: isChecked ? false : familyHistory.no_known_history
                                                            });
                                                        }}
                                                        className="w-5 h-5 text-teal-600 rounded"
                                                    />
                                                </div>
                                                <div className="col-span-1 md:col-span-2 space-y-3">
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Genetic Disorders</label>
                                                    {familyHistory.genetic_disorders.map((disorder, index) => (
                                                        <div key={index} className="flex gap-2">
                                                            <input 
                                                                type="text" 
                                                                value={disorder}
                                                                placeholder={index === 0 ? "e.g. Dyslipidemia, Thalassemia..." : "Add another disorder..."}
                                                                onChange={(e) => {
                                                                    const newList = [...familyHistory.genetic_disorders];
                                                                    newList[index] = e.target.value;
                                                                    const hasContent = newList.some(item => item.trim() !== "");
                                                                    setFamilyHistory({
                                                                        ...familyHistory, 
                                                                        genetic_disorders: newList,
                                                                        no_known_history: hasContent ? false : familyHistory.no_known_history
                                                                    });
                                                                }}
                                                                className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-1 focus:ring-teal-500 outline-none"
                                                            />
                                                            <div className="flex gap-1">
                                                                {familyHistory.genetic_disorders.length > 1 && (
                                                                    <button 
                                                                        type="button"
                                                                        onClick={() => {
                                                                            const newList = familyHistory.genetic_disorders.filter((_, i) => i !== index);
                                                                            setFamilyHistory({
                                                                                ...familyHistory,
                                                                                genetic_disorders: newList
                                                                            });
                                                                        }}
                                                                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors border border-rose-100"
                                                                        title="Remove"
                                                                    >
                                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                                                        </svg>
                                                                    </button>
                                                                )}
                                                                {index === familyHistory.genetic_disorders.length - 1 && (
                                                                    <button 
                                                                        type="button"
                                                                        onClick={() => setFamilyHistory({
                                                                            ...familyHistory,
                                                                            genetic_disorders: [...familyHistory.genetic_disorders, ""]
                                                                        })}
                                                                        className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors border border-teal-100"
                                                                        title="Add More"
                                                                    >
                                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                                                                        </svg>
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="col-span-1 md:col-span-2 flex items-center gap-3">
                                                    <input 
                                                        type="checkbox" 
                                                        id="no_known_history"
                                                        checked={familyHistory.no_known_history}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setFamilyHistory({
                                                                    diabetes: false,
                                                                    heart_disease: false,
                                                                    genetic_disorders: [""],
                                                                    no_known_history: true
                                                                });
                                                            } else {
                                                                setFamilyHistory({...familyHistory, no_known_history: false});
                                                            }
                                                        }}
                                                        className="w-5 h-5 text-teal-600 rounded"
                                                    />
                                                    <label htmlFor="no_known_history" className="text-sm font-medium text-slate-700">No known family history</label>
                                                </div>
                                            </div>
                                            <div className="pt-6 border-t border-slate-100 flex justify-end">
                                                <button 
                                                    onClick={() => handleHealthUpdate()}
                                                    disabled={loading}
                                                    className="rounded-lg bg-teal-600 px-8 py-3 font-bold text-white hover:bg-teal-700 transition-all disabled:opacity-50 shadow-lg shadow-teal-600/20"
                                                >
                                                    {loading ? "Saving Profile..." : "Save Medical Profile"}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeSubTab === "lifestyle" && (
                                    <div className="space-y-6">
                                        <div className="border-b pb-4 flex justify-between items-center">
                                            <h3 className="text-lg font-bold text-slate-800">Lifestyle Habits History</h3>
                                            <span className="text-xs text-slate-500 italic">Add historical snapshots as your habits or job changes</span>
                                        </div>
                                        
                                        <div id="lifestyle-form-section" className="bg-slate-50 p-6 rounded-2xl border border-dashed border-slate-300 space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-bold text-teal-600 uppercase tracking-widest">Smoking Status</label>
                                                    <select 
                                                        value={lifestyle.smoking}
                                                        onChange={(e) => setLifestyle({...lifestyle, smoking: e.target.value})}
                                                        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:ring-1 focus:ring-teal-500 outline-none bg-white font-medium"
                                                    >
                                                        {["Never", "Past", "Current"].map(s => (
                                                            <option key={s} value={s}>{s}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-bold text-teal-600 uppercase tracking-widest">Alcohol Consumption</label>
                                                    <select 
                                                        value={lifestyle.alcohol}
                                                        onChange={(e) => setLifestyle({...lifestyle, alcohol: e.target.value})}
                                                        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:ring-1 focus:ring-teal-500 outline-none bg-white font-medium"
                                                    >
                                                        {["No", "Occasionally", "Regular"].map(a => (
                                                            <option key={a} value={a}>{a}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-bold text-teal-600 uppercase tracking-widest">Current/Past Occupation</label>
                                                    <input 
                                                        type="text" 
                                                        value={lifestyle.occupation}
                                                        onChange={(e) => setLifestyle({...lifestyle, occupation: e.target.value})}
                                                        placeholder="e.g. Teacher"
                                                        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:ring-1 focus:ring-teal-500 outline-none bg-white font-medium"
                                                    />
                                                </div>
                                                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-300 h-[46px] mt-auto">
                                                    <span className="text-sm font-medium text-slate-700">Chemical Exposure?</span>
                                                    <input 
                                                        type="checkbox" 
                                                        checked={lifestyle.chemical_exposure}
                                                        onChange={(e) => setLifestyle({...lifestyle, chemical_exposure: e.target.checked})}
                                                        className="w-5 h-5 text-teal-600 rounded"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-teal-600 uppercase tracking-widest">Additional Notes</label>
                                                <textarea 
                                                    value={lifestyle.notes}
                                                    onChange={(e) => setLifestyle({...lifestyle, notes: e.target.value})}
                                                    placeholder="Add any specific details about this period (e.g. 'Project stress led to smoking', 'Shift work')"
                                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-1 focus:ring-teal-500 outline-none bg-white min-h-[80px]"
                                                ></textarea>
                                            </div>
                                            <div className="flex justify-end space-x-2">
                                                {editingLifestyleId && (
                                                    <button 
                                                        onClick={() => {
                                                            setEditingLifestyleId(null);
                                                            setLifestyle({
                                                                smoking: "Never",
                                                                alcohol: "No",
                                                                occupation: "",
                                                                chemical_exposure: false,
                                                                notes: ""
                                                            });
                                                        }}
                                                        className="px-6 py-2 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300 transition-all font-bold text-sm"
                                                    >
                                                        Cancel
                                                    </button>
                                                )}
                                                <button 
                                                    onClick={addLifestyleEntry}
                                                    className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all font-bold text-sm shadow-md shadow-teal-600/10"
                                                >
                                                    {editingLifestyleId ? "Update Lifestyle Snapshot" : "Add Lifestyle Snapshot"}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="pt-2 flex justify-end">
                                            <button 
                                                onClick={() => handleHealthUpdate()}
                                                disabled={loading}
                                                className="rounded-lg bg-teal-600 px-8 py-3 font-bold text-white hover:bg-teal-700 transition-all disabled:opacity-50 shadow-lg shadow-teal-600/20"
                                            >
                                                {loading ? "Saving Profile..." : "Save Medical Profile"}
                                            </button>
                                        </div>

                                        <div className="space-y-4 mt-6 max-w-3xl">
                                            {lifestyleHistory.map((item) => (
                                                <div key={item.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm relative hover:shadow-md transition-all group">
                                                    <div className="absolute top-4 right-4 flex space-x-2 z-10 transition-opacity">
                                                        <button 
                                                            onClick={() => handleEditLifestyle(item)}
                                                            className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-full transition-all"
                                                            title="Edit entry"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                                            </svg>
                                                        </button>
                                                        <button 
                                                            onClick={() => deleteLifestyleEntry(item.id)}
                                                            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all"
                                                            title="Delete entry"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                    
                                                    <div className="flex items-center gap-2 mb-4">
                                                        <span className="text-[10px] font-bold bg-teal-50 text-teal-700 px-2 py-0.5 rounded uppercase tracking-wider">
                                                            {new Date(item.date).toLocaleDateString() === "Invalid Date" ? item.date : new Date(item.date).toLocaleDateString()}
                                                        </span>
                                                    </div>

                                                    <div className="space-y-5">
                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                            <div className="md:border-r border-slate-100 pr-2">
                                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mb-0.5">Occupation</p>
                                                                <p className="text-sm font-bold text-slate-700">{item.occupation || 'Not Specified'}</p>
                                                            </div>
                                                            <div className="md:border-r border-slate-100 pr-2">
                                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mb-0.5">Chemical Exp.</p>
                                                                <p className="text-sm font-bold text-slate-700">{item.chemical_exposure ? 'Yes' : 'No'}</p>
                                                            </div>
                                                            <div className="md:border-r border-slate-100 pr-2">
                                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mb-0.5">Smoking Status</p>
                                                                <p className="text-sm font-bold text-slate-700">{item.smoking_status || item.smoking || 'Never'}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mb-0.5">Alcohol Usage</p>
                                                                <p className="text-sm font-bold text-slate-700">{item.alcohol_usage || item.alcohol || 'No'}</p>
                                                            </div>
                                                        </div>

                                                        {(item.additional_notes || item.notes || item.text) && (
                                                            <div className="pt-4 border-t border-slate-100">
                                                                <p className="text-[9px] font-bold text-slate-400 uppercase mb-1.5 tracking-tighter flex items-center gap-1">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                                                        <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
                                                                    </svg>
                                                                    Additional Notes
                                                                </p>
                                                                <div className="bg-slate-50 p-3 rounded-lg border-l-4 border-teal-500/30">
                                                                    <p className="text-xs text-slate-600 leading-relaxed italic">
                                                                        "{item.additional_notes || item.notes || item.text}"
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {activeSubTab === "additional" && (
                                    <div className="space-y-6">
                                        <div id="additional-notes-form" className="bg-teal-50/50 p-5 rounded-2xl border border-teal-100 mb-6">
                                            <div className="space-y-4">
                                                <div className="flex flex-col gap-4">
                                                    <div>
                                                        <label className="block text-[10px] font-bold text-teal-600 uppercase tracking-widest mb-1.5">Speaker Name</label>
                                                        <input 
                                                            type="text" 
                                                            value={speaker}
                                                            onChange={(e) => setSpeaker(e.target.value)}
                                                            placeholder="Who is speaking? (e.g. Patient, Daughter, PHI)"
                                                            className="w-full rounded-lg border border-teal-200 px-3 py-2 text-sm focus:ring-1 focus:ring-teal-500 outline-none bg-white font-medium"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] font-bold text-teal-600 uppercase tracking-widest">Medical Note</label>
                                                        <textarea 
                                                            value={currentFreeText}
                                                            onChange={(e) => setCurrentFreeText(e.target.value)}
                                                            placeholder="Type detailed medical notes here..."
                                                            className="w-full min-h-[120px] rounded-lg border border-teal-200 px-3 py-2 text-sm focus:ring-1 focus:ring-teal-500 outline-none bg-white resize-y shadow-inner"
                                                        ></textarea>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-center justify-between pt-2 border-t border-teal-100/50">
                                                    <div className="flex items-center gap-2">
                                                        <label className="text-[10px] font-bold text-teal-600 uppercase tracking-widest mr-2">Voice Record:</label>
                                                        {!editingFreeTextId && (
                                                            <>
                                                                {!isRecording && !audioUrl && (
                                                                    <div className="flex flex-col items-center">
                                                                        <button 
                                                                            onClick={startRecording}
                                                                            className="flex items-center gap-2 px-3 py-1 bg-rose-50 text-rose-600 rounded-lg border border-rose-200 hover:bg-rose-100 transition-all text-[11px] font-bold h-7"
                                                                        >
                                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                                                            </svg>
                                                                            {recordingCountdown > 0 ? `Wait... ${recordingCountdown}` : "Start Mic"}
                                                                        </button>
                                                                        {recordingCountdown > 0 && (
                                                                            <span className="text-[9px] text-rose-500 font-bold animate-pulse mt-0.5">
                                                                                Prepare to speak...
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                )}
                                                                {isRecording && (
                                                                    <button 
                                                                        onClick={stopRecording}
                                                                        className="flex items-center gap-2 px-3 py-1.5 bg-rose-600 text-white rounded-lg animate-pulse text-xs font-bold"
                                                                    >
                                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                                                                        </svg>
                                                                        Stop & Save
                                                                    </button>
                                                                )}
                                                                {audioUrl && !isRecording && (
                                                                    <div className="flex items-center gap-2 bg-white border border-rose-200 rounded-lg px-2 py-1 shadow-sm">
                                                                        <audio src={audioUrl} className="h-6 w-32" controls />
                                                                        <button onClick={addVoiceNote} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md" title="Add recorded voice">
                                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                            </svg>
                                                                        </button>
                                                                        <button onClick={() => { setAudioUrl(null); setAudioBlob(null); }} className="p-1.5 text-slate-400 hover:text-rose-600">
                                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                                            </svg>
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        {editingFreeTextId && (
                                                            <button 
                                                                onClick={() => {
                                                                    setEditingFreeTextId(null);
                                                                    setCurrentFreeText("");
                                                                    setSpeaker("");
                                                                }}
                                                                className="px-4 py-2 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300 transition-colors font-bold text-sm"
                                                            >
                                                                Cancel
                                                            </button>
                                                        )}
                                                        <button 
                                                            onClick={addFreeTextNote}
                                                            className="flex items-center gap-2 px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors shadow-sm shadow-teal-600/20 font-bold text-sm"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                                            </svg>
                                                            {editingFreeTextId ? "Update Note" : "Add Text Note"}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            {[...freeTextNotes, ...voiceNotes].sort((a,b) => b.id - a.id).map((item) => (
                                                <div key={item.id} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl hover:border-teal-200 transition-colors group">
                                                    <div className="flex items-center gap-4 flex-1">
                                                        <div className={`p-2 rounded-lg ${item.url ? 'bg-rose-50 text-rose-500' : 'bg-teal-50 text-teal-600'}`}>
                                                            {item.url ? (
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                                    <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                                                                </svg>
                                                            ) : (
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                                                </svg>
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-0.5">
                                                                <span className="text-xs font-bold text-slate-700">{item.speaker}</span>
                                                                <span className="text-[10px] text-slate-400 font-medium">• {item.date}</span>
                                                                <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${item.url ? 'bg-rose-100 text-rose-600' : 'bg-teal-100 text-teal-700'}`}>
                                                                    {item.url ? 'Voice' : 'Text'}
                                                                </span>
                                                            </div>
                                                            {item.url ? (
                                                                <audio src={item.url} controls className="h-7 w-48 mt-1" />
                                                            ) : (
                                                                <p className="text-sm text-slate-600 line-clamp-1">{item.text}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        {!item.url && (
                                                            <button 
                                                                onClick={() => handleEditFreeText(item)}
                                                                className="p-1.5 text-slate-300 hover:text-teal-600 transition-colors"
                                                                title="Edit note"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                                                </svg>
                                                            </button>
                                                        )}
                                                        <button 
                                                            onClick={() => item.url ? deleteVoiceNote(item.id) : deleteFreeTextNote(item.id)}
                                                            className="p-1.5 text-slate-300 hover:text-rose-500 transition-colors"
                                                            title="Delete note"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="pt-6 border-t border-slate-100 flex justify-end">
                                            <button 
                                                onClick={() => handleHealthUpdate()}
                                                disabled={loading}
                                                className="rounded-lg bg-teal-600 px-8 py-3 font-bold text-white hover:bg-teal-700 transition-all shadow-lg shadow-teal-600/20"
                                            >
                                                {loading ? "Saving All Health Data..." : "Save All Health Details"}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </PublicLayout>
);
};

export default HealthProfilePage;