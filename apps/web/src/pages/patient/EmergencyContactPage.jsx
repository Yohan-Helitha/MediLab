import React, { useState, useEffect } from "react";
import { 
  Search, 
  Trash2, 
  Edit, 
  AlertCircle,
  Phone,
  Shield,
  User,
  MapPin,
  Clock,
  Info,
  CheckCircle2,
  ChevronRight,
  Eye,
  X
} from "lucide-react";
import { 
  fetchEmergencyContacts, 
  createEmergencyContact, 
  updateEmergencyContact, 
  deleteEmergencyContact 
} from "../../api/patientApi";
import { useAuth } from "../../context/AuthContext";
import PublicLayout from "../../layout/PublicLayout";
import { toast } from "react-hot-toast";

const FORM_SECTIONS = ["basic", "location", "availability", "permissions"];

const EmergencyContactPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("list");
  const [formSection, setFormSection] = useState("basic");
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [viewingContact, setViewingContact] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const initialFormState = {
    full_name: "",
    relationship: "",
    primary_phone: "",
    secondary_phone: "",
    address: "",
    gn_division: "",
    landmarks: "",
    contact_priority: "PRIMARY",
    available_24_7: true,
    best_time_to_contact: "ANYTIME",
    receive_medical_results: false,
    decision_permission: false,
    collect_reports_permission: false
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    setLoading(true);
    try {
      // member_id is auto-filtered server-side via JWT token
      const response = await fetchEmergencyContacts();
      // Service returns { emergencyContacts, pagination } wrapped in { success, data }
      let data = [];
      if (response && response.data) {
        data = response.data.emergencyContacts ?? response.data;
      } else if (Array.isArray(response)) {
        data = response;
      }
      setContacts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading contacts:", error);
      toast.error("Failed to load emergency contacts");
      setContacts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    const currentIndex = FORM_SECTIONS.indexOf(formSection);
    if (currentIndex < FORM_SECTIONS.length - 1) {
      setFormSection(FORM_SECTIONS[currentIndex + 1]);
    }
  };

  const isLastSection = formSection === FORM_SECTIONS[FORM_SECTIONS.length - 1];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (!isLastSection) {
        handleNext();
      }
      // On the last section, we don't auto-submit on Enter 
      // to let the user finish selecting checkboxes.
    }
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    
    // Final defensive check to ensure we are actually on the last tab
    if (!isLastSection) {
      handleNext();
      return;
    }

    try {
      if (isEditing) {
        await updateEmergencyContact(currentId, formData);
        toast.success("Emergency contact updated successfully");
      } else {
        const payload = {
          ...formData,
          member_id: user?.member_id
        };
        await createEmergencyContact(payload);
        toast.success("Emergency contact added successfully");
      }
      resetForm();
      loadContacts();
      setActiveTab("list");
    } catch (error) {
      console.error("Error saving contact:", error);
      // Show specific field validation errors if available
      if (error.errors && error.errors.length > 0) {
        console.error("Validation errors:", error.errors);
        const messages = error.errors.map(e => `${e.path}: ${e.msg}`).join("\n");
        toast.error(`Validation errors:\n${messages}`, { duration: 6000 });
      } else {
        toast.error(error.message || "Failed to save emergency contact");
      }
    }
  };

  const handleEdit = (contact) => {
    setFormData({
      full_name: contact.full_name || "",
      relationship: contact.relationship || "",
      primary_phone: contact.primary_phone || "",
      secondary_phone: contact.secondary_phone || "",
      address: contact.address || "",
      gn_division: contact.gn_division || "",
      landmarks: contact.landmarks || "",
      contact_priority: contact.contact_priority || "PRIMARY",
      available_24_7: contact.available_24_7 ?? true,
      best_time_to_contact: contact.best_time_to_contact || "ANYTIME",
      receive_medical_results: contact.receive_medical_results ?? false,
      decision_permission: contact.decision_permission ?? false,
      collect_reports_permission: contact.collect_reports_permission ?? false
    });
    setCurrentId(contact._id);
    setIsEditing(true);
    setActiveTab("registration");
    setFormSection("basic");
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this emergency contact?")) {
      try {
        await deleteEmergencyContact(id);
        toast.success("Contact deleted successfully");
        loadContacts();
      } catch (error) {
        toast.error("Failed to delete contact");
      }
    }
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setIsEditing(false);
    setCurrentId(null);
    setFormSection("basic");
  };

  const filteredContacts = Array.isArray(contacts) ? contacts.filter(contact => 
    (contact.full_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (contact.primary_phone || "").includes(searchTerm)
  ) : [];

  const handleView = (contact) => {
    setViewingContact(contact);
    setIsModalOpen(true);
  };

  return (
    <PublicLayout>
      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* Detail Modal */}
        {isModalOpen && viewingContact && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px] animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-4xl rounded-[2rem] shadow-2xl relative animate-in zoom-in-95 duration-200 overflow-hidden">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-colors z-10 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="p-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                  {/* Left Column: Basic Info */}
                  <div className="space-y-8">
                    <section>
                      <div className="flex items-center gap-2 mb-4 text-teal-700">
                        <User className="w-4 h-4" />
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Basic Information</h3>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">Full Name</p>
                          <p className="text-base font-bold text-slate-800">{viewingContact.full_name}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">Relationship</p>
                          <p className="text-sm font-semibold text-teal-700">{viewingContact.relationship}</p>
                        </div>
                        <div className="flex gap-6">
                          <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">Primary Phone</p>
                            <p className="text-sm font-bold text-slate-700">{viewingContact.primary_phone}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">Secondary</p>
                            <p className="text-sm font-medium text-slate-600">{viewingContact.secondary_phone || "—"}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Priority</p>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black ${
                            viewingContact.contact_priority === 'PRIMARY' 
                            ? 'bg-teal-600 text-white' 
                            : 'bg-slate-100 text-slate-500'
                          }`}>
                            {viewingContact.contact_priority}
                          </span>
                        </div>
                      </div>
                    </section>
                  </div>

                  {/* Middle Column: Location */}
                  <div className="space-y-8">
                    <section>
                      <div className="flex items-center gap-2 mb-4 text-teal-700">
                        <MapPin className="w-4 h-4" />
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Location Details</h3>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">Address</p>
                          <p className="text-sm font-medium text-slate-700 leading-relaxed italic">"{viewingContact.address}"</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">GN Division</p>
                          <p className="text-sm font-bold text-slate-800">{viewingContact.gn_division}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">Landmarks</p>
                          <p className="text-sm font-medium text-slate-500">{viewingContact.landmarks || "None"}</p>
                        </div>
                      </div>
                    </section>
                  </div>

                  {/* Right Column: Status & Permissions */}
                  <div className="space-y-8">
                    <section>
                      <div className="flex items-center gap-2 mb-4 text-teal-700">
                        <Shield className="w-4 h-4" />
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status & Authorizations</h3>
                      </div>
                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-2 mb-4">
                          <span className={`px-2 py-1 rounded text-[9px] font-black ${viewingContact.available_24_7 ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-50 text-slate-400'}`}>
                            {viewingContact.available_24_7 ? "24/7 AVAILABLE" : "LIMITED HOURS"}
                          </span>
                          <p className="text-[10px] font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-100 italic">{viewingContact.best_time_to_contact}</p>
                        </div>
                        {[
                          { val: viewingContact.receive_medical_results, label: "View Medical Results" },
                          { val: viewingContact.decision_permission, label: "Legal Decision Maker" },
                          { val: viewingContact.collect_reports_permission, label: "Collect Reports" }
                        ].map((p, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${p.val ? 'bg-teal-500 text-white' : 'bg-slate-100 text-slate-300'}`}>
                              {p.val ? <CheckCircle2 className="w-2.5 h-2.5" /> : <X className="w-2.5 h-2.5" />}
                            </div>
                            <span className={`text-[11px] font-bold ${p.val ? 'text-slate-700' : 'text-slate-300 line-through'}`}>{p.label}</span>
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-teal-700 px-10 py-8 text-white">
            <h1 className="text-2xl font-bold">Emergency Contacts</h1>
            <p className="text-teal-100 mt-1">Manage your trusted contacts for medical emergencies and authorization</p>
          </div>

          <div className="flex border-b border-slate-200 bg-slate-50">
            <button
              type="button"
              onClick={() => setActiveTab("list")}
              className={`px-8 py-4 text-sm font-semibold transition-colors ${
                activeTab === "list" 
                ? "bg-white text-teal-700 border-b-2 border-teal-700" 
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
              }`}
            >
              Existing Contacts
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab("registration"); if(!isEditing) resetForm(); }}
              className={`px-8 py-4 text-sm font-semibold transition-colors ${
                activeTab === "registration" 
                ? "bg-white text-teal-700 border-b-2 border-teal-700" 
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
              }`}
            >
              {isEditing ? "Edit Contact" : "Add New Contact"}
            </button>
          </div>

          <div className="p-8">
            {activeTab === "registration" ? (
              <div className="flex flex-col md:flex-row gap-8">
                {/* Vertical Sub-Tabs */}
                <div className="w-full md:w-64 flex flex-col gap-1">
                  {[
                    { id: "basic", label: "Basic Contact Information" },
                    { id: "location", label: "Contact Location" },
                    { id: "availability", label: "Availability Details" },
                    { id: "permissions", label: "Permission & Authorization" }
                  ].map((tab, index) => {
                    const currentIndex = FORM_SECTIONS.indexOf(formSection);
                    const tabIndex = FORM_SECTIONS.indexOf(tab.id);
                    const isCompleted = tabIndex < currentIndex;
                    const isCurrent = tab.id === formSection;
                    const isLocked = tabIndex > currentIndex;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => !isLocked && setFormSection(tab.id)}
                        disabled={isLocked}
                        className={`flex items-center gap-3 px-4 py-3 text-left text-sm font-medium rounded-lg transition-all w-full ${
                          isCurrent
                            ? "bg-teal-50 text-teal-700 border-l-4 border-teal-600 shadow-sm"
                            : isCompleted
                            ? "text-teal-600 hover:bg-teal-50/50 border-l-4 border-teal-200"
                            : "text-slate-400 cursor-not-allowed opacity-60"
                        }`}
                      >
                        <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                          isCurrent
                            ? "bg-teal-600 border-teal-600 text-white"
                            : isCompleted
                            ? "bg-teal-50 border-teal-400 text-teal-600"
                            : "bg-slate-100 border-slate-300 text-slate-400"
                        }`}>
                          {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : index + 1}
                        </span>
                        {tab.label}
                      </button>
                    );
                  })}
                  
                  <div className="mt-8 p-5 bg-teal-50 rounded-xl border border-teal-100">
                    <div className="flex items-center gap-2 text-teal-700 mb-2 font-bold text-xs uppercase tracking-wider">
                      <Info className="w-3.5 h-3.5" />
                      Quick Tip
                    </div>
                    <p className="text-[11px] text-teal-600/80 leading-relaxed font-medium">Please ensure the primary contact is available 24/7 for urgent medical updates.</p>
                  </div>
                </div>

                {/* Vertical Tabs Content */}
                <div className="flex-1 bg-white rounded-xl p-6 border border-slate-200 min-h-[500px] shadow-sm">
                  <div className="h-full flex flex-col">
                    <div className="flex-1">
                      {formSection === "basic" && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                          <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-4">Basic Contact Information</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                              <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
                              <input type="text" name="full_name" value={formData.full_name} onChange={handleInputChange} onKeyDown={handleKeyDown} className="w-full rounded-lg border border-slate-300 px-3 py-2.5 focus:ring-1 focus:ring-teal-500 outline-none transition-all" placeholder="Enter contact full name" />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-slate-700 mb-2">Relationship to Patient</label>
                              <select name="relationship" value={formData.relationship} onChange={handleInputChange} onKeyDown={handleKeyDown} className="w-full rounded-lg border border-slate-300 px-3 py-2.5 focus:ring-1 focus:ring-teal-500 outline-none transition-all">
                                <option value="">Select Relationship</option>
                                <option value="MOTHER">Mother</option>
                                <option value="FATHER">Father</option>
                                <option value="SPOUSE">Spouse</option>
                                <option value="SON">Son</option>
                                <option value="DAUGHTER">Daughter</option>
                                <option value="GUARDIAN">Guardian</option>
                                <option value="NEIGHBOR">Neighbor</option>
                                <option value="OTHER">Other</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-slate-700 mb-2">Priority Level</label>
                              <div className="flex gap-3">
                                {["PRIMARY", "SECONDARY"].map((p) => (
                                  <label key={p} className="flex-1 cursor-pointer">
                                    <input type="radio" name="contact_priority" value={p} checked={formData.contact_priority === p} onChange={handleInputChange} className="sr-only peer" />
                                    <div className="text-center py-2.5 rounded-lg border border-slate-200 peer-checked:bg-teal-50 peer-checked:border-teal-500 peer-checked:text-teal-700 font-bold text-xs transition-all">{p}</div>
                                  </label>
                                ))}
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-slate-700 mb-2">Primary Phone</label>
                              <input type="tel" name="primary_phone" value={formData.primary_phone} onChange={handleInputChange} onKeyDown={handleKeyDown} className="w-full rounded-lg border border-slate-300 px-3 py-2.5 focus:ring-1 focus:ring-teal-500 outline-none transition-all" placeholder="07XXXXXXXX" />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-slate-700 mb-2">Secondary Phone</label>
                              <input type="tel" name="secondary_phone" value={formData.secondary_phone} onChange={handleInputChange} onKeyDown={handleKeyDown} className="w-full rounded-lg border border-slate-300 px-3 py-2.5 focus:ring-1 focus:ring-teal-500 outline-none transition-all" placeholder="01XXXXXXXX" />
                            </div>
                          </div>
                        </div>
                      )}

                      {formSection === "location" && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                          <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-4">Contact Location</h3>
                          <div className="space-y-6">
                             <div>
                              <label className="block text-sm font-semibold text-slate-700 mb-2">Detailed Address</label>
                              <textarea name="address" value={formData.address} onChange={handleInputChange} onKeyDown={handleKeyDown} rows="3" className="w-full rounded-lg border border-slate-300 px-3 py-2.5 focus:ring-1 focus:ring-teal-500 outline-none transition-all resize-none" placeholder="Enter residential address"></textarea>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">GN Division</label>
                                <input 
                                  type="text"
                                  name="gn_division" 
                                  value={formData.gn_division} 
                                  onChange={handleInputChange} 
                                  onKeyDown={handleKeyDown}
                                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 focus:ring-1 focus:ring-teal-500 outline-none transition-all"
                                  placeholder="Enter GN Division"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Landmarks</label>
                                <input type="text" name="landmarks" value={formData.landmarks} onChange={handleInputChange} onKeyDown={handleKeyDown} className="w-full rounded-lg border border-slate-300 px-3 py-2.5 focus:ring-1 focus:ring-teal-500 outline-none transition-all" placeholder="e.g. Near Kalutara Temple" />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {formSection === "availability" && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                          <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-4">Availability Details</h3>
                          <div className="space-y-8">
                            <div className="p-5 bg-slate-50 rounded-xl border border-slate-200">
                              <label className="flex items-center justify-between cursor-pointer">
                                <div>
                                  <span className="block font-bold text-slate-800 text-sm">Available 24/7</span>
                                  <span className="text-[11px] text-slate-500">Authorized contact can be reached at any hour</span>
                                </div>
                                <div className="relative inline-flex items-center cursor-pointer">
                                  <input type="checkbox" name="available_24_7" checked={formData.available_24_7} onChange={handleInputChange} className="sr-only peer" />
                                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                                </div>
                              </label>
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-slate-700 mb-4 uppercase tracking-wider text-[11px]">Best time to contact</label>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {["MORNING", "AFTERNOON", "NIGHT"].map((time) => (
                                  <label key={time} className="cursor-pointer">
                                    <input type="radio" name="best_time_to_contact" value={time} checked={formData.best_time_to_contact === time} onChange={handleInputChange} className="sr-only peer" />
                                    <div className="text-center py-3.5 rounded-xl border border-slate-200 peer-checked:bg-teal-50 peer-checked:border-teal-500 peer-checked:text-teal-700 text-xs font-bold transition-all uppercase tracking-widest">{time}</div>
                                  </label>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {formSection === "permissions" && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                          <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-4">Permission & Authorization</h3>
                          <div className="space-y-4">
                            {[
                              { name: "receive_medical_results", label: "Receive medical results?", desc: "Authorized to see lab results and clinical history" },
                              { name: "decision_permission", label: "Make decisions if patient unconscious?", desc: "Legal authority to make medical choices" },
                              { name: "collect_reports_permission", label: "Collect reports/medicines?", desc: "Authorized to pick up physical logs and medicine" }
                            ].map((perm) => (
                              <label key={perm.name} className="flex items-center p-4 bg-white rounded-xl border border-slate-200 hover:border-teal-500/30 transition-all cursor-pointer group">
                                <div className="relative inline-flex items-center cursor-pointer">
                                  <input type="checkbox" name={perm.name} checked={formData[perm.name]} onChange={handleInputChange} className="sr-only peer" />
                                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                                </div>
                                <div className="ml-4">
                                  <span className="block font-bold text-slate-800 text-sm group-hover:text-teal-700 transition-colors">{perm.label}</span>
                                  <span className="text-[11px] text-slate-500 mt-0.5 block">{perm.desc}</span>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between items-center">
                       <button type="button" onClick={() => { resetForm(); setActiveTab("list"); }} className="px-6 py-2 rounded-lg border border-slate-300 text-slate-600 font-semibold hover:bg-slate-50 transition-all text-sm">Cancel</button>
                       <div className="flex gap-3">
                         {!isLastSection ? (
                           <button
                             type="button"
                             onClick={handleNext}
                             className="flex items-center gap-2 px-8 py-2 rounded-lg bg-teal-600 text-white font-bold hover:bg-teal-700 shadow-lg shadow-teal-600/20 active:scale-95 transition-all outline-none text-sm"
                           >
                             Next <ChevronRight className="w-4 h-4" />
                           </button>
                         ) : (
                           <button 
                             type="button" 
                             onClick={handleSave} 
                             className="px-8 py-2 rounded-lg bg-teal-600 text-white font-bold hover:bg-teal-700 shadow-lg shadow-teal-600/20 active:scale-95 transition-all outline-none text-sm"
                           >
                             {isEditing ? "Update Contact" : "Save Emergency Contact"}
                           </button>
                         )}
                       </div>
                     </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div className="relative max-w-2xl">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input type="text" placeholder="Search by name or phone..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-14 pr-6 py-4 rounded-2xl border-2 border-slate-100 focus:border-teal-500 outline-none transition-all bg-slate-50/50 font-medium" />
                </div>
                {loading ? (
                  <div className="flex justify-center py-32"><div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-100 border-t-teal-700"></div></div>
                ) : filteredContacts.length > 0 ? (
                  <div className="flex flex-col gap-1 pr-4">
                    {filteredContacts.map((contact) => (
                      <div 
                        key={contact._id} 
                        className="group flex items-center justify-between p-3 rounded-2xl border border-slate-100 bg-white hover:bg-slate-50/50 hover:border-teal-100 transition-all duration-300"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 ${
                            contact.contact_priority === 'PRIMARY' ? 'bg-teal-700 shadow-lg shadow-teal-700/20' : 'bg-slate-100'
                          }`}>
                            <Shield className={`w-4 h-4 ${contact.contact_priority === 'PRIMARY' ? 'text-white' : 'text-slate-400'}`} />
                          </div>
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-slate-800 text-sm tracking-tight">{contact.full_name}</h4>
                              {contact.contact_priority === 'PRIMARY' && (
                                <span className="bg-teal-50 text-teal-700 text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider">Primary</span>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-[11px] font-bold text-slate-500">
                              <div className="flex items-center gap-1">
                                <Phone className="w-3 h-3 text-teal-600" />
                                {contact.primary_phone}
                              </div>
                              <div className="flex items-center gap-1 uppercase tracking-tight">
                                <User className="w-3 h-3 text-slate-400" />
                                {contact.relationship}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0 pr-1">
                          <button 
                            type="button" 
                            onClick={() => handleView(contact)}
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-teal-600 hover:border-teal-200 hover:shadow-lg hover:shadow-teal-600/10 transition-all active:scale-90"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            type="button" 
                            onClick={() => handleEdit(contact)}
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-amber-600 hover:border-amber-200 hover:shadow-lg hover:shadow-amber-600/10 transition-all active:scale-90"
                            title="Edit Contact"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            type="button" 
                            onClick={() => handleDelete(contact._id)}
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:shadow-lg hover:shadow-rose-600/10 transition-all active:scale-90"
                            title="Delete Contact"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-32 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-200">
                    <AlertCircle className="w-20 h-20 text-slate-200 mx-auto mb-6" />
                    <h2 className="text-2xl font-bold text-slate-400">No Authorized Contacts</h2>
                    <p className="text-slate-400 mt-2 max-w-sm mx-auto">Please add a primary emergency contact to ensure your medical safety.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default EmergencyContactPage;