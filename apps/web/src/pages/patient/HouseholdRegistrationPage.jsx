import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import PublicLayout from "../../layout/PublicLayout";
import { getSafeErrorMessage } from "../../utils/errorHandler";
import { generateHouseholdPDF } from "../../utils/pdfGenerator";
import { 
    createHousehold,
    updateHousehold,
    fetchHouseholds,
    fetchHouseholdById,
    fetchHouseholdBySubmittedBy
} from "../../api/patientApi";

const HouseholdRegistrationPage = () => {
    const { user, token } = useAuth();
    const navigate = useNavigate();
    
    // Auth-Check: Staff/Admin only (optional, but good practice)
    const isStaff = user?.role === "staff" || user?.role === "admin";

    // Tab states
    const [activeTab, setActiveTab] = useState("registration");

    // Form states
    const [regData, setRegData] = useState({
        head_member_name: "",
        primary_contact_number: "",
        secondary_contact_number: "",
        address: "",
        village_name: "",
        gn_division: "",
        district: "",
        province: "",
        household_id: "" // For display/search
    });

    const [healthData, setHealthData] = useState({
        water_source: "Pipe-borne water",
        well_water_tested: "Not sure",
        ckdu_exposure_area: "Not sure",
        dengue_risk: false,
        sanitation_type: "Indoor toilet",
        waste_disposal: "Municipal collection",
        pesticide_exposure: false,
        chronic_diseases: {
            diabetes: false,
            hypertension: false,
            kidney_disease: false,
            asthma: false,
            heart_disease: false,
            other: "",
            none: false
        }
    });

    const [members, setMembers] = useState([]);

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });
    const [currentHousehold, setCurrentHousehold] = useState(null);

    // Fetch existing household if it exists for the logged-in user
    useEffect(() => {
        const fetchExistingHousehold = async () => {
            const currentUserId = user?.systemId || user?.member_id || user?.employeeId;
            if (!currentUserId && !token) return;
            
            try {
                // Use 'me' to indicate current authenticated user if ID isn't directly available
                const res = await fetchHouseholdBySubmittedBy(currentUserId || 'me');
                if (res.success && res.data) {
                    const house = res.data;
                    console.log("Fetched household data:", house); // Debug log  
                    
                    setCurrentHousehold(house);
                    
                    // Populate Form Data
                    setRegData({
                        head_member_name: house.head_member_name || "",
                        primary_contact_number: house.primary_contact_number || "",
                        secondary_contact_number: house.secondary_contact_number || "",
                        address: house.address || "",
                        village_name: house.village_name || "",
                        gn_division: house.gn_division || "",
                        district: house.district || "",
                        province: house.province || "",
                        household_id: house.household_id || ""
                    });

                    setHealthData({
                        water_source: house.water_source || "Pipe-borne water",
                        well_water_tested: house.well_water_tested || "Not sure",
                        ckdu_exposure_area: house.ckdu_exposure_area || "Not sure",
                        dengue_risk: house.dengue_risk || false,
                        sanitation_type: house.sanitation_type || "Indoor toilet",
                        waste_disposal: house.waste_disposal || "Municipal collection",
                        pesticide_exposure: house.pesticide_exposure || false,
                        chronic_diseases: {
                            diabetes: house.chronic_diseases?.diabetes || false,
                            hypertension: house.chronic_diseases?.hypertension || false,
                            kidney_disease: house.chronic_diseases?.kidney_disease || false,
                            asthma: house.chronic_diseases?.asthma || false,
                            heart_disease: house.chronic_diseases?.heart_disease || false,
                            other: house.chronic_diseases?.other || "",
                            none: house.chronic_diseases?.none || false
                        }
                    });

                            if (house.members_list && Array.isArray(house.members_list)) {
                                setMembers(house.members_list.map(m => ({
                                    family_member_id: m.family_member_id, // PRESERVE ID
                                    full_name: m.full_name,
                                    gender: m.gender,
                                    date_of_birth: m.date_of_birth ? new Date(m.date_of_birth).toISOString().split('T')[0] : "",
                                    relationship: m.isHead ? "Head" : (m.relationship || ""),
                                    isHead: m.isHead || false,
                                    spouse_name: m.spouse_name || "",
                                    parent_name: m.parent_name || ""
                                })));
                            }
                        }
                    } catch (err) {
                console.error("Error fetching existing household:", err);
            }
        };

        fetchExistingHousehold();
    }, [user?.systemId, user?.member_id, user?.employeeId, token]);

    // Update members ONLY when creating a NEW household (head_member_name change)
    useEffect(() => {
        if (!currentHousehold?._id && regData.head_member_name) {
            setMembers(prev => {
                const head = prev.find(m => m.isHead);
                if (head) {
                    return prev.map(m => m.isHead ? { ...m, full_name: regData.head_member_name } : m);
                }
                return [{
                    full_name: regData.head_member_name,
                    gender: "Male",
                    date_of_birth: "",
                    relationship: "Head", // Showing 'Head' for the primary resident
                    isHead: true
                }, ...prev];
            });
        }
    }, [regData.head_member_name, currentHousehold?._id]);

    const handleMemberChange = (index, field, value) => {
        const updatedMembers = [...members];
        updatedMembers[index][field] = value;
        setMembers(updatedMembers);
    };

    const addMember = () => {
        setMembers([...members, { 
            full_name: "", 
            gender: "Male", 
            date_of_birth: "", 
            relationship: "son", 
            isHead: false, 
            spouse_name: "",
            parent_name: "" // Added parent_name field
        }]);
    };

    const removeMember = (index) => {
        if (members[index].isHead) return;
        setMembers(members.filter((_, i) => i !== index));
    };

    // Auto-dismiss alerts
    useEffect(() => {
        if (message.text) {
            const timer = setTimeout(() => setMessage({ type: "", text: "" }), 3000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    const handleRegChange = (e) => {
        const { name, value } = e.target;
        setRegData(prev => ({ ...prev, [name]: value }));
    };

    const handleHealthChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name === "chronic_other") {
            setHealthData(prev => ({
                ...prev,
                chronic_diseases: {
                    ...prev.chronic_diseases,
                    other: value
                }
            }));
        } else if (name.startsWith("chronic_")) {
            const disease = name.replace("chronic_", "");
            setHealthData(prev => ({
                ...prev,
                chronic_diseases: {
                    ...prev.chronic_diseases,
                    [disease]: checked
                }
            }));
        } else {
            setHealthData(prev => ({
                ...prev,
                [name]: type === "checkbox" ? checked : value
            }));
        }
    };

    const handleRegSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const currentUserId = user?.systemId || user?.member_id || user?.employeeId;
        
        try {
            // Auto-populate parent_name for in-law relationships using spouse_name
            const processedMembers = members.map(member => {
                if ((member.relationship?.toLowerCase().includes('son-in-law') || 
                     member.relationship?.toLowerCase().includes('daughter-in-law') ||
                     member.relationship?.toLowerCase().includes('grandson-in-law') ||
                     member.relationship?.toLowerCase().includes('granddaughter-in-law')) && 
                    member.spouse_name && !member.parent_name) {
                    return { ...member, parent_name: member.spouse_name };
                }
                return member;
            });

            // Include health data in registration if it's a new household to satisfy "all fields required"
            const payload = {
                ...regData,
                ...healthData,
                submitted_by: currentUserId, // Automatically include user's member_id/systemId as submitted_by
                members_list: processedMembers // Send processed members to create them alongside household
            };

            // Remove empty household_id so backend doesn't try to validate the format
            if (!payload.household_id) {
                delete payload.household_id;
            }

            let res;
            if (currentHousehold?._id) {
                res = await updateHousehold(currentHousehold._id, payload);
            } else {
                res = await createHousehold(payload);
            }

            if (res.success) {
                // Store members in localStorage for the Family Tree page to consume later
                localStorage.setItem("latest_household_members", JSON.stringify(members));
                
                const house = res.data;
                setCurrentHousehold(house);
                
                // Refresh form from the returned data to ensure everything stays in sync
                setRegData({
                    head_member_name: house.head_member_name || "",
                    primary_contact_number: house.primary_contact_number || "",
                    secondary_contact_number: house.secondary_contact_number || "",
                    address: house.address || "",
                    village_name: house.village_name || "",
                    gn_division: house.gn_division || "",
                    district: house.district || "",
                    province: house.province || "",
                    household_id: house.household_id || ""
                });

                if (house.members_list && Array.isArray(house.members_list)) {
                    setMembers(house.members_list.map(m => ({
                        family_member_id: m.family_member_id, // PRESERVE ID FROM RESPONSE
                        full_name: m.full_name,
                        gender: m.gender,
                        date_of_birth: m.date_of_birth ? new Date(m.date_of_birth).toISOString().split('T')[0] : "",
                        relationship: m.isHead ? "Head" : (m.relationship || ""),
                        isHead: m.isHead || false,
                        spouse_name: m.spouse_name || "",
                        parent_name: m.parent_name || ""
                    })));
                }

                setMessage({ type: "success", text: `Household ${currentHousehold?._id ? "updated" : "registered"} successfully!` });
                // Auto-navigate to health tab after a short delay
                setTimeout(() => {
                    setActiveTab("health");
                    setMessage({ type: "", text: "" });
                }, 1500);
            } else {
                // Handle complex error formats from backend
                let displayMsg = "Operation failed";
                
                if (res.errors && Array.isArray(res.errors)) {
                    displayMsg = res.errors.map(e => `${e.path || e.param}: ${e.msg}`).join(", ");
                } else if (res.message) {
                    displayMsg = getSafeErrorMessage(new Error(res.message), "household");
                } else {
                    displayMsg = getSafeErrorMessage(new Error("Operation failed"), "household");
                }
                
                setMessage({ type: "error", text: displayMsg });
                console.error("Household Registration Error Details:", res.errors || res.message);
            }
        } catch (err) {
            console.error("Registration catch error:", err);
            
            // Extract message from standard error object or custom response
            let displayMsg = "An error occurred during registration";
            
            // If the error object has a structured 'errors' array inside its context/response
            if (err.errors && Array.isArray(err.errors)) {
                displayMsg = err.errors.map(e => `${e.path || e.param}: ${e.msg}`).join(", ");
            } else if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
                displayMsg = err.response.data.errors.map(e => `${e.path || e.param}: ${e.msg}`).join(", ");
            } else if (err.response?.data?.message) {
                displayMsg = getSafeErrorMessage(new Error(err.response.data.message), "household");
            } else {
                displayMsg = getSafeErrorMessage(err, "household");
            }
            
            setMessage({ type: "error", text: displayMsg });
        } finally {
            setLoading(false);
        }
    };

    const handleHealthSubmit = async (e) => {
        e.preventDefault();
        if (!currentHousehold?._id) {
            setMessage({ type: "error", text: "Please register/select a household first" });
            return;
        }
        setLoading(true);
        const currentUserId = user?.systemId || user?.member_id || user?.employeeId;
        
        try {
            // Merge regData and healthData to satisfy "all fields required" in backend
            // Ensure the schema matches precisely what the backend expects
            const payload = {
                ...regData,
                ...healthData,
                submitted_by: currentUserId // Automatically include user's member_id/systemId as submitted_by
            };
            
            // Explicitly handle chronic_diseases to match the nested object structure exactly
            // This ensures we're not losing any nested values
            payload.chronic_diseases = {
                diabetes: !!healthData.chronic_diseases.diabetes,
                hypertension: !!healthData.chronic_diseases.hypertension,
                kidney_disease: !!healthData.chronic_diseases.kidney_disease,
                asthma: !!healthData.chronic_diseases.asthma,
                heart_disease: !!healthData.chronic_diseases.heart_disease,
                none: !!healthData.chronic_diseases.none,
                other: String(healthData.chronic_diseases.other || "")
            };

            const res = await updateHousehold(currentHousehold._id, payload);
            if (res.success) {
                setCurrentHousehold(res.data);
                setMessage({ type: "success", text: "Health information updated successfully!" });
                // Stay on the same page - don't navigate
            } else {
                console.error("Health update failed:", res);
                setMessage({ type: "error", text: getSafeErrorMessage(new Error(res.message || "Update failed"), "household") });
            }
        } catch (err) {
            console.error("Health Update catch error:", err);
            setMessage({ type: "error", text: getSafeErrorMessage(err, "household") });
        } finally {
            setLoading(false);
        }
    };

    const downloadHouseholdPDF = async () => {
        try {
            setLoading(true);
            
            // Prepare health info from healthData
            const householdHealthInfo = {
                water_source: healthData.water_source,
                well_water_tested: healthData.well_water_tested,
                ckdu_exposure_area: healthData.ckdu_exposure_area,
                dengue_risk: healthData.dengue_risk,
                sanitation_type: healthData.sanitation_type,
                waste_disposal: healthData.waste_disposal,
                pesticide_exposure: healthData.pesticide_exposure,
                chronic_diseases: healthData.chronic_diseases
            };
            
            console.log("Household PDF Data:", {
                registrationData: regData,
                members: members,
                health: householdHealthInfo
            });
            
            await generateHouseholdPDF(
                regData,
                members,
                householdHealthInfo
            );
        } catch (err) {
            console.error("Error downloading household record:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <PublicLayout>
            <div className="max-w-4xl mx-auto py-8 px-4">
                {/* Floating Toast Message */}
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
                        <div className="absolute bottom-0 left-0 h-1 bg-current opacity-20 w-full animate-progress-shrink origin-left"></div>
                    </div>
                )}

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    {/* Header */}
                    <div className="bg-teal-700 px-8 py-6 text-white flex items-center justify-between relative overflow-hidden">
                        <div className="relative z-10">
                            <h1 className="text-2xl font-bold text-white">Household Management</h1>
                            <p className="text-teal-100 mt-1">Register households and track environmental health factors</p>
                        </div>
                        <button
                            onClick={downloadHouseholdPDF}
                            disabled={loading || !currentHousehold?._id}
                            className="flex items-center gap-2 px-6 py-3 bg-white text-teal-700 font-semibold rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md"
                            title="Download your complete household record as PDF"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            Download PDF
                        </button>
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <svg className="w-24 h-24 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M19 13H5v-2h14v2z" /></svg>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-slate-200 bg-slate-50">
                        <button
                            onClick={() => setActiveTab("registration")}
                            className={`px-8 py-4 text-sm font-semibold transition-colors ${
                                activeTab === "registration" 
                                ? "bg-white text-teal-700 border-b-2 border-teal-700" 
                                : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                            }`}
                        >
                            Household Registration
                        </button>
                        <button
                            onClick={() => {
                                if (currentHousehold?._id) {
                                    setActiveTab("health");
                                } else {
                                    setMessage({ type: "error", text: "Please complete household registration first" });
                                }
                            }}
                            className={`px-8 py-4 text-sm font-semibold transition-colors ${
                                activeTab === "health" 
                                ? "bg-white text-teal-700 border-b-2 border-teal-700" 
                                : !currentHousehold?._id 
                                    ? "text-slate-300 cursor-not-allowed bg-slate-50/50"
                                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                            }`}
                        >
                            Health Information
                        </button>
                    </div>

                    <div className="p-8">
                        {activeTab === "registration" ? (
                            <form onSubmit={handleRegSubmit} className="space-y-6">
                                <div className="flex items-center justify-between pb-4 border-b border-slate-50">
                                    <h2 className="text-lg font-bold text-slate-800">Basic Registration</h2>
                                    {currentHousehold?.household_id && (
                                        <div className="flex items-center gap-3">
                                            <div className="bg-teal-50 px-4 py-1.5 rounded-lg border border-teal-100">
                                                <span className="text-[10px] text-teal-600 font-bold uppercase tracking-wider block leading-none">Household ID</span>
                                                <span className="text-sm font-bold text-teal-900 leading-none">{currentHousehold.household_id}</span>
                                            </div>
                                            <button 
                                                type="button"
                                                onClick={() => {
                                                    setCurrentHousehold(null);
                                                    setRegData({
                                                        head_member_name: "", primary_contact_number: "", secondary_contact_number: "",
                                                        address: "", village_name: "", gn_division: "", district: "", province: "", household_id: ""
                                                    });
                                                }}
                                                className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                                                title="Reset form"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-10">
                                    {/* Location Info */}
                                    <div className="space-y-8">
                                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-3">
                                            <span className="w-8 h-0.5 bg-teal-500"></span>
                                            Location & Admin
                                        </h3>
                                        
                                        <div className="space-y-6">
                                            <div className="grid grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-sm font-semibold text-slate-700 mb-2">District</label>
                                                    <input
                                                        type="text"
                                                        name="district"
                                                        value={regData.district}
                                                        onChange={handleRegChange}
                                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all outline-none bg-slate-50/30 font-medium"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Province</label>
                                                    <input
                                                        type="text"
                                                        name="province"
                                                        value={regData.province}
                                                        onChange={handleRegChange}
                                                        required
                                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all outline-none bg-slate-50/30 font-medium"
                                                        placeholder="Province"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-sm font-semibold text-slate-700 mb-2">GN Division</label>
                                                    <input
                                                        type="text"
                                                        name="gn_division"
                                                        value={regData.gn_division}
                                                        onChange={handleRegChange}
                                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all outline-none bg-slate-50/30 font-medium"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Village</label>
                                                    <input
                                                        type="text"
                                                        name="village_name"
                                                        value={regData.village_name}
                                                        onChange={handleRegChange}
                                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all outline-none bg-slate-50/30 font-medium"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-2">Household Number</label>
                                                <div className="relative group">
                                                    <input
                                                        type="text"
                                                        name="household_id"
                                                        value={regData.household_id}
                                                        readOnly
                                                        disabled
                                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none bg-slate-100/70 font-mono text-sm cursor-not-allowed text-slate-500"
                                                        placeholder="Auto-generated upon registration"
                                                    />
                                                    {!regData.household_id && (
                                                        <div className="absolute right-3 top-3.5 px-2 py-0.5 bg-slate-200 text-slate-500 text-[10px] font-bold uppercase rounded-md tracking-tighter">Auto-Gen</div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Primary Resident */}
                                    <div className="space-y-8">
                                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-3">
                                            <span className="w-8 h-0.5 bg-teal-500"></span>
                                            Primary Resident Information
                                        </h3>

                                        <div className="space-y-6">
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
                                                <input
                                                    type="text"
                                                    name="head_member_name"
                                                    value={regData.head_member_name}
                                                    onChange={handleRegChange}
                                                    placeholder="Enter head of household name"
                                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all outline-none bg-slate-50/30 font-medium"
                                                    required
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Primary Contact</label>
                                                    <div className="relative">
                                                        <input
                                                            type="tel"
                                                            name="primary_contact_number"
                                                            value={regData.primary_contact_number}
                                                            onChange={handleRegChange}
                                                            placeholder="07XXXXXXXX"
                                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all outline-none bg-slate-50/30 font-medium"
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Secondary Contact</label>
                                                    <input
                                                        type="tel"
                                                        name="secondary_contact_number"
                                                        value={regData.secondary_contact_number}
                                                        onChange={handleRegChange}
                                                        placeholder="Optional"
                                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all outline-none bg-slate-50/30 font-medium"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-2">Street Address</label>
                                                <input
                                                    type="text"
                                                    name="address"
                                                    value={regData.address}
                                                    onChange={handleRegChange}
                                                    placeholder="Stree Address / Postal Address"
                                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all outline-none bg-slate-50/30 font-medium"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Family Members Section */}
                                <div className="pt-8 border-t border-slate-100">
                                    <div className="flex items-center justify-between mb-8">
                                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-3">
                                            <span className="w-8 h-0.5 bg-teal-500"></span>
                                            Family Members
                                        </h3>
                                        <button 
                                            type="button" 
                                            onClick={addMember}
                                            className="flex items-center gap-2 px-4 py-2 bg-teal-50 text-teal-700 font-bold rounded-lg hover:bg-teal-100 transition-all text-xs"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
                                            Add New Member
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        {members.map((member, index) => (
                                            <div key={index} className="p-6 bg-slate-50/50 border border-slate-200 rounded-2xl relative group hover:border-teal-300 hover:bg-white transition-all space-y-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div>
                                                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Full Name</label>
                                                        <input 
                                                            disabled={member.isHead}
                                                            type="text" 
                                                            value={member.full_name} 
                                                            onChange={(e) => handleMemberChange(index, 'full_name', e.target.value)}
                                                            className={`w-full px-4 py-2.5 rounded-xl border ${member.isHead ? 'bg-slate-100 italic' : 'bg-white'} border-slate-200 focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none text-sm font-medium`}
                                                            placeholder="Full Name"
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Gender</label>
                                                            <select 
                                                                value={member.gender} 
                                                                onChange={(e) => handleMemberChange(index, 'gender', e.target.value)}
                                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none text-sm font-medium"
                                                            >
                                                                <option value="Male">Male</option>
                                                                <option value="Female">Female</option>
                                                                <option value="Other">Other</option>
                                                            </select>
                                                        </div>
                                                        <div>
                                                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Date of Birth</label>
                                                            <input 
                                                                type="date" 
                                                                value={member.date_of_birth} 
                                                                onChange={(e) => handleMemberChange(index, 'date_of_birth', e.target.value)}
                                                                max={new Date().toISOString().split("T")[0]}
                                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none text-sm font-medium"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                                                    <div>
                                                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Relationship</label>
                                                        <select 
                                                            disabled={member.isHead}
                                                            value={member.relationship} 
                                                            onChange={(e) => handleMemberChange(index, 'relationship', e.target.value)}
                                                            className={`w-full px-4 py-2.5 rounded-xl border ${member.isHead ? 'bg-slate-100 cursor-not-allowed' : 'bg-white'} border-slate-200 focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none text-sm font-medium`}
                                                        >
                                                            {member.isHead ? (
                                                                <option value="Head">Head</option>
                                                            ) : (
                                                                <>
                                                                    <option value="">Select Relationship</option>
                                                                    <option value="husband">Husband</option>
                                                                    <option value="wife">Wife</option>
                                                                    <option value="son">Son</option>
                                                                    <option value="daughter">Daughter</option>
                                                                    <option value="mother">Mother</option>
                                                                    <option value="father">Father</option>
                                                                    <option value="mother-in-law">Mother-in-law</option>
                                                                    <option value="father-in-law">Father-in-law</option>
                                                                    <option value="daughter-in-law">Daughter-in-law</option>
                                                                    <option value="son-in-law">Son-in-law</option>
                                                                    <option value="aunt">Aunt</option>
                                                                    <option value="uncle">Uncle</option>
                                                                    <option value="niece">Niece</option>
                                                                    <option value="nephew">Nephew</option>
                                                                    <option value="grandson">Grandson</option>
                                                                    <option value="granddaughter">Granddaughter</option>
                                                                    <option value="grandson-in-law">Grandson-in-law</option>
                                                                    <option value="granddaughter-in-law">Granddaughter-in-law</option>
                                                                    <option value="great-grandchild">Great-grandchild</option>
                                                                    <option value="guardian">Guardian</option>
                                                                </>
                                                            )}
                                                        </select>
                                                    </div>
                                                    
                                                    {/* Spouse Selection for In-Laws */}
                                                    {(member.relationship?.toLowerCase().includes('son-in-law') || 
                                                      member.relationship?.toLowerCase().includes('daughter-in-law') ||
                                                      member.relationship?.toLowerCase().includes('grandson-in-law') ||
                                                      member.relationship?.toLowerCase().includes('granddaughter-in-law')) && (
                                                        <div>
                                                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Spouse (Family Member)</label>
                                                            <select
                                                                value={member.spouse_name || ""}
                                                                onChange={(e) => handleMemberChange(index, 'spouse_name', e.target.value)}
                                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none text-sm font-medium"
                                                            >
                                                                <option value="">Select Spouse</option>
                                                                {members
                                                                    .filter((m, i) => i !== index)
                                                                    .map((m, i) => (
                                                                        <option key={i} value={m.full_name}>{m.full_name || `Member ${i + 1}`}</option>
                                                                    ))
                                                                }
                                                            </select>
                                                        </div>
                                                    )}

                                                    {/* Parent Selection for Grandchildren and Great-grandchildren */}
                                                    {((member.relationship?.toLowerCase().includes('grandson') && !member.relationship?.toLowerCase().includes('in-law')) ||
                                                      (member.relationship?.toLowerCase().includes('granddaughter') && !member.relationship?.toLowerCase().includes('in-law')) ||
                                                      member.relationship?.toLowerCase().includes('great-grandchild') ||
                                                      member.relationship?.toLowerCase().includes('niece') ||
                                                      member.relationship?.toLowerCase().includes('nephew')) && (
                                                        <div>
                                                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Parent (Resident Member)</label>
                                                            <select
                                                                value={member.parent_name || ""}
                                                                onChange={(e) => handleMemberChange(index, 'parent_name', e.target.value)}
                                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none text-sm font-medium"
                                                            >
                                                                <option value="">Select Parent</option>
                                                                {members
                                                                    .filter((m, i) => i !== index)
                                                                    .map((m, i) => (
                                                                        <option key={i} value={m.full_name}>{m.full_name || `Member ${i + 1}`}</option>
                                                                    ))
                                                                }
                                                            </select>
                                                        </div>
                                                    )}
                                                </div>

                                                {!member.isHead && (
                                                    <button 
                                                        type="button"
                                                        onClick={() => removeMember(index)}
                                                        className="absolute -right-2 -top-2 w-6 h-6 bg-white border border-rose-100 text-rose-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 shadow-sm hover:bg-rose-50 transition-all"
                                                    >
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex justify-end pt-6 border-t border-slate-100">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="inline-flex items-center gap-2 px-8 py-3 bg-teal-700 text-white font-bold rounded-xl hover:bg-teal-800 active:scale-95 transition-all shadow-lg hover:shadow-teal-100 disabled:opacity-50"
                                    >
                                        {loading ? (
                                            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                                        ) : null}
                                        {loading ? "Processing..." : (currentHousehold?._id ? "Update" : "Register")}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <form onSubmit={handleHealthSubmit} className="space-y-8">
                                <div className="flex items-center justify-between pb-4 border-b border-slate-50">
                                    <h2 className="text-lg font-bold text-slate-800">Health & Environment</h2>
                                    {!currentHousehold?._id && (
                                        <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 border border-rose-100 rounded-lg text-rose-600 text-xs font-bold animate-pulse">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
                                            Complete Registration First
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-10">
                                    {/* Living Conditions */}
                                    <div className="space-y-8">
                                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-3">
                                            <span className="w-8 h-0.5 bg-teal-500"></span>
                                            Living Conditions
                                        </h3>
                                        
                                        <div className="space-y-6">
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-2">Main Water Source</label>
                                                <select
                                                    name="water_source"
                                                    value={healthData.water_source}
                                                    onChange={handleHealthChange}
                                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all outline-none bg-slate-50/30"
                                                >
                                                    <option>Pipe-borne water</option>
                                                    <option>Protected well</option>
                                                    <option>Unprotected well</option>
                                                    <option>River</option>
                                                    <option>Tank</option>
                                                    <option>Bottle water</option>
                                                    <option>Tube well</option>
                                                    <option>Other</option>
                                                </select>
                                            </div>

                                            <div className="grid grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Well Water Tested?</label>
                                                    <select
                                                        name="well_water_tested"
                                                        value={healthData.well_water_tested}
                                                        onChange={handleHealthChange}
                                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all outline-none bg-slate-50/30"
                                                    >
                                                        <option>Yes</option>
                                                        <option>No</option>
                                                        <option>Not sure</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-slate-700 mb-2">CKDu Exposure?</label>
                                                    <select
                                                        name="ckdu_exposure_area"
                                                        value={healthData.ckdu_exposure_area}
                                                        onChange={handleHealthChange}
                                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all outline-none bg-slate-50/30"
                                                    >
                                                        <option>Yes</option>
                                                        <option>No</option>
                                                        <option>Not sure</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-2">Sanitation Type</label>
                                                <select
                                                    name="sanitation_type"
                                                    value={healthData.sanitation_type}
                                                    onChange={handleHealthChange}
                                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all outline-none bg-slate-50/30"
                                                >
                                                    <option value="Indoor toilet">Indoor toilet</option>
                                                    <option value="Outdoor toilet">Outdoor toilet</option>
                                                    <option value="Shared toilet">Shared toilet</option>
                                                    <option value="No proper Sanitation">No proper Sanitation</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-2">Waste Disposal</label>
                                                <select
                                                    name="waste_disposal"
                                                    value={healthData.waste_disposal}
                                                    onChange={handleHealthChange}
                                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all outline-none bg-slate-50/30"
                                                >
                                                    <option value="Municipal collection">Municipal collection</option>
                                                    <option value="Burning">Burning</option>
                                                    <option value="Burying">Burying</option>
                                                    <option value="Open dumping">Open dumping</option>
                                                </select>
                                            </div>

                                            <div className="flex flex-col sm:flex-row gap-4 pt-2">
                                                <div className="flex-1 p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between hover:bg-slate-100/50 transition-colors">
                                                    <span className="text-sm font-bold text-slate-700">Dengue Risk</span>
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input type="checkbox" name="dengue_risk" checked={healthData.dengue_risk} onChange={handleHealthChange} className="sr-only peer" />
                                                        <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-teal-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                                                    </label>
                                                </div>
                                                <div className="flex-1 p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between hover:bg-slate-100/50 transition-colors">
                                                    <span className="text-sm font-bold text-slate-700">Pesticides</span>
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input type="checkbox" name="pesticide_exposure" checked={healthData.pesticide_exposure} onChange={handleHealthChange} className="sr-only peer" />
                                                        <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-teal-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Chronic History */}
                                    <div className="space-y-8">
                                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-3">
                                            <span className="w-8 h-0.5 bg-teal-500"></span>
                                            Area Chronic History
                                        </h3>

                                        <div className="space-y-3">
                                            {["diabetes", "hypertension", "kidney_disease", "asthma", "heart_disease", "none"].map((disease) => (
                                                <label key={disease} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl hover:border-teal-500 hover:shadow-md hover:shadow-teal-500/5 transition-all cursor-pointer group">
                                                    <span className="capitalize font-bold text-slate-700 group-hover:text-teal-700">{disease.replace("_", " ")}</span>
                                                    <div className="relative flex items-center">
                                                        <input 
                                                            type="checkbox"
                                                            name={`chronic_${disease}`}
                                                            checked={healthData.chronic_diseases[disease]}
                                                            onChange={handleHealthChange}
                                                            className="w-6 h-6 rounded-lg border-slate-300 text-teal-600 focus:ring-teal-500 transition-all cursor-pointer"
                                                        />
                                                    </div>
                                                </label>
                                            ))}

                                            <div className="pt-4">
                                                <textarea
                                                    name="chronic_other"
                                                    value={healthData.chronic_diseases.other}
                                                    onChange={handleHealthChange}
                                                    placeholder="Specify other chronic conditions if any..."
                                                    className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all outline-none resize-none bg-slate-50/30 text-sm"
                                                    rows="3"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end pt-6 border-t border-slate-100">
                                    <button
                                        type="submit"
                                        disabled={loading || !currentHousehold?._id}
                                        className="inline-flex items-center gap-2 px-8 py-3 bg-teal-700 text-white font-bold rounded-xl hover:bg-teal-800 active:scale-95 transition-all shadow-lg hover:shadow-teal-100 disabled:opacity-50"
                                    >
                                        {loading ? (
                                            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                                        ) : null}
                                        {loading ? "Saving..." : "Save"}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
};

export default HouseholdRegistrationPage;
