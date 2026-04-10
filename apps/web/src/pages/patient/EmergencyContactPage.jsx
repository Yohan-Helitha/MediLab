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
  X,
  Download
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
import { useTranslation } from "react-i18next";
import { getSafeErrorMessage } from "../../utils/errorHandler";
import { generateEmergencyContactPDF } from "../../utils/pdfGenerator";

const FORM_SECTIONS = ["basic", "location", "availability", "permissions"];

const EmergencyContactPage = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
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
      toast.error(getSafeErrorMessage(error, "contact"));
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

  const downloadEmergencyContactPDF = async () => {
    try {
      await generateEmergencyContactPDF(user, contacts);
    } catch (error) {
      console.error("Error downloading PDF:", error);
    }
  };

  const downloadSingleEmergencyContactPDF = async () => {
    try {
      await generateEmergencyContactPDF(user, [viewingContact]);
    } catch (error) {
      console.error("Error downloading PDF:", error);
    }
  };

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
        toast.error(getSafeErrorMessage(error, "contact"));
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
        console.error("Error deleting contact:", error);
        toast.error(getSafeErrorMessage(error, "contact"));
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
            <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl relative animate-in zoom-in-95 duration-200 overflow-hidden">
              <div className="absolute top-6 right-6 flex items-center gap-2 z-10">
                <button 
                  onClick={downloadSingleEmergencyContactPDF}
                  className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-8">
                {/* Contact Header */}
                <div className="border-b border-slate-200 pb-6 mb-8">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-3xl font-bold text-slate-800 mb-2">{viewingContact.full_name}</h2>
                      <p className="text-sm font-semibold text-teal-700 mb-3">{viewingContact.relationship}</p>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          viewingContact.contact_priority === 'PRIMARY' 
                            ? 'bg-teal-100 text-teal-700' 
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {viewingContact.contact_priority} CONTACT
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          viewingContact.available_24_7
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {viewingContact.available_24_7 ? '24/7 AVAILABLE' : 'LIMITED HOURS'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Three Column Layout */}
                <div className="grid grid-cols-3 gap-6">
                  {/* Contact Information Card */}
                  <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-6">
                    <h3 className="text-sm font-bold uppercase tracking-wide text-slate-600 mb-5 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-teal-600" />
                      Contact Info
                    </h3>
                    <div className="space-y-5">
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase mb-2">Primary Phone</p>
                        <p className="text-base font-bold text-slate-800">{viewingContact.primary_phone}</p>
                      </div>
                      {viewingContact.secondary_phone && (
                        <div>
                          <p className="text-xs font-bold text-slate-500 uppercase mb-2">Secondary Phone</p>
                          <p className="text-base font-bold text-slate-800">{viewingContact.secondary_phone}</p>
                        </div>
                      )}
                      {viewingContact.best_time_to_contact && (
                        <div>
                          <p className="text-xs font-bold text-slate-500 uppercase mb-2">Best Time</p>
                          <p className="text-sm font-semibold text-slate-700 italic">{viewingContact.best_time_to_contact}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Location Card */}
                  <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-6">
                    <h3 className="text-sm font-bold uppercase tracking-wide text-slate-600 mb-5 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-teal-600" />
                      Location
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase mb-2">Address</p>
                        <p className="text-sm font-medium text-slate-700 leading-relaxed bg-white rounded-lg p-2.5 border border-slate-200">
                          {viewingContact.address || "Not provided"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase mb-2">GN Division</p>
                        <p className="text-sm font-bold text-slate-800">{viewingContact.gn_division || "—"}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase mb-2">Landmarks</p>
                        <p className="text-sm text-slate-600">{viewingContact.landmarks || "None"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Permissions Card */}
                  <div className="bg-gradient-to-br from-teal-50 to-teal-100/50 rounded-2xl p-6 border border-teal-200">
                    <h3 className="text-sm font-bold uppercase tracking-wide text-teal-700 mb-5 flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Permissions
                    </h3>
                    <div className="space-y-3">
                      {[
                        { val: viewingContact.receive_medical_results, label: "View Medical Results" },
                        { val: viewingContact.decision_permission, label: "Legal Decision Maker" },
                        { val: viewingContact.collect_reports_permission, label: "Collect Reports" }
                      ].map((perm, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-2.5 rounded-lg bg-white border-2" style={{borderColor: perm.val ? 'rgb(20, 184, 166)' : 'rgb(226, 232, 240)'}}>
                          <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center font-bold text-sm ${
                            perm.val 
                              ? 'bg-teal-600 text-white' 
                              : 'bg-slate-200 text-slate-400'
                          }`}>
                            {perm.val ? '✓' : '✗'}
                          </div>
                          <span className={`text-xs font-semibold ${perm.val ? 'text-slate-800' : 'text-slate-400 line-through'}`}>
                            {perm.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-teal-700 px-10 py-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">{t("navbar.familyCare.emergencyContact")}</h1>
                <p className="text-teal-100 mt-1">{t("emergency.subtitle")}</p>
              </div>
              <button
                onClick={downloadEmergencyContactPDF}
                disabled={loading || contacts.length === 0}
                className="flex items-center gap-2 px-6 py-3 bg-white text-teal-700 font-semibold rounded-lg hover:bg-teal-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                {t("emergency.downloadPdf")}
              </button>
            </div>
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
              {t("emergency.tab.list")}
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
              {isEditing ? t("emergency.tab.edit") : t("emergency.tab.add")}
            </button>
          </div>

          <div className="p-8">
            {activeTab === "registration" ? (
              <div className="flex flex-col md:flex-row gap-8">
                {/* Vertical Sub-Tabs */}
                <div className="w-full md:w-64 flex flex-col gap-1">
                  {[
                    { id: "basic", label: t("emergency.form.step.basic") },
                    { id: "location", label: t("emergency.form.step.location") },
                    { id: "availability", label: t("emergency.form.step.availability") },
                    { id: "permissions", label: t("emergency.form.step.permissions") }
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
                      {t("emergency.quickTip.title")}
                    </div>
                    <p className="text-[11px] text-teal-600/80 leading-relaxed font-medium">{t("emergency.quickTip.body")}</p>
                  </div>
                </div>

                {/* Vertical Tabs Content */}
                <div className="flex-1 bg-white rounded-xl p-6 border border-slate-200 min-h-[500px] shadow-sm">
                  <div className="h-full flex flex-col">
                    <div className="flex-1">
                      {formSection === "basic" && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                          <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-4">{t("emergency.form.step.basic")}</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                              <label className="block text-sm font-semibold text-slate-700 mb-2">{t("healthProfile.form.fullName")}</label>
                              <input type="text" name="full_name" value={formData.full_name} onChange={handleInputChange} onKeyDown={handleKeyDown} className="w-full rounded-lg border border-slate-300 px-3 py-2.5 focus:ring-1 focus:ring-teal-500 outline-none transition-all" placeholder={t("emergency.form.fullNamePlaceholder")} />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-slate-700 mb-2">{t("emergency.form.relationshipLabel")}</label>
                              <select name="relationship" value={formData.relationship} onChange={handleInputChange} onKeyDown={handleKeyDown} className="w-full rounded-lg border border-slate-300 px-3 py-2.5 focus:ring-1 focus:ring-teal-500 outline-none transition-all">
                                <option value="">{t("emergency.form.relationship.select")}</option>
                                <option value="MOTHER">{t("emergency.form.relationship.mother")}</option>
                                <option value="FATHER">{t("emergency.form.relationship.father")}</option>
                                <option value="SPOUSE">{t("emergency.form.relationship.spouse")}</option>
                                <option value="SON">{t("emergency.form.relationship.son")}</option>
                                <option value="DAUGHTER">{t("emergency.form.relationship.daughter")}</option>
                                <option value="GUARDIAN">{t("emergency.form.relationship.guardian")}</option>
                                <option value="NEIGHBOR">{t("emergency.form.relationship.neighbor")}</option>
                                <option value="OTHER">{t("emergency.form.relationship.other")}</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-slate-700 mb-2">{t("emergency.form.priorityLabel")}</label>
                              <div className="flex gap-3">
                                {["PRIMARY", "SECONDARY"].map((p) => (
                                  <label key={p} className="flex-1 cursor-pointer">
                                    <input type="radio" name="contact_priority" value={p} checked={formData.contact_priority === p} onChange={handleInputChange} className="sr-only peer" />
                                    <div className="text-center py-2.5 rounded-lg border border-slate-200 peer-checked:bg-teal-50 peer-checked:border-teal-500 peer-checked:text-teal-700 font-bold text-xs transition-all">{t(`emergency.form.priority.${p.toLowerCase()}`)}</div>
                                  </label>
                                ))}
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-slate-700 mb-2">{t("emergency.form.primaryPhoneLabel")}</label>
                              <input type="tel" name="primary_phone" value={formData.primary_phone} onChange={handleInputChange} onKeyDown={handleKeyDown} className="w-full rounded-lg border border-slate-300 px-3 py-2.5 focus:ring-1 focus:ring-teal-500 outline-none transition-all" placeholder="07XXXXXXXX" />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-slate-700 mb-2">{t("emergency.form.secondaryPhoneLabel")}</label>
                              <input type="tel" name="secondary_phone" value={formData.secondary_phone} onChange={handleInputChange} onKeyDown={handleKeyDown} className="w-full rounded-lg border border-slate-300 px-3 py-2.5 focus:ring-1 focus:ring-teal-500 outline-none transition-all" placeholder="01XXXXXXXX" />
                            </div>
                          </div>
                        </div>
                      )}

                      {formSection === "location" && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                          <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-4">{t("emergency.form.step.location")}</h3>
                          <div className="space-y-6">
                             <div>
                              <label className="block text-sm font-semibold text-slate-700 mb-2">{t("emergency.form.addressLabel")}</label>
                              <textarea name="address" value={formData.address} onChange={handleInputChange} onKeyDown={handleKeyDown} rows="3" className="w-full rounded-lg border border-slate-300 px-3 py-2.5 focus:ring-1 focus:ring-teal-500 outline-none transition-all resize-none" placeholder={t("emergency.form.addressPlaceholder")}></textarea>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">{t("healthProfile.form.gnDivision")}</label>
                                <input 
                                  type="text"
                                  name="gn_division" 
                                  value={formData.gn_division} 
                                  onChange={handleInputChange} 
                                  onKeyDown={handleKeyDown}
                                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 focus:ring-1 focus:ring-teal-500 outline-none transition-all"
                                  placeholder={t("emergency.form.gnDivisionPlaceholder")}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">{t("emergency.form.landmarksLabel")}</label>
                                <input type="text" name="landmarks" value={formData.landmarks} onChange={handleInputChange} onKeyDown={handleKeyDown} className="w-full rounded-lg border border-slate-300 px-3 py-2.5 focus:ring-1 focus:ring-teal-500 outline-none transition-all" placeholder={t("emergency.form.landmarksPlaceholder")} />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {formSection === "availability" && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                          <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-4">{t("emergency.form.step.availability")}</h3>
                          <div className="space-y-8">
                            <div className="p-5 bg-slate-50 rounded-xl border border-slate-200">
                              <label className="flex items-center justify-between cursor-pointer">
                                <div>
                                  <span className="block font-bold text-slate-800 text-sm">{t("emergency.form.available24Title")}</span>
                                  <span className="text-[11px] text-slate-500">{t("emergency.form.available24Desc")}</span>
                                </div>
                                <div className="relative inline-flex items-center cursor-pointer">
                                  <input type="checkbox" name="available_24_7" checked={formData.available_24_7} onChange={handleInputChange} className="sr-only peer" />
                                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                                </div>
                              </label>
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-slate-700 mb-4 uppercase tracking-wider text-[11px]">{t("emergency.form.bestTimeLabel")}</label>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {["MORNING", "AFTERNOON", "NIGHT"].map((time) => (
                                  <label key={time} className="cursor-pointer">
                                    <input type="radio" name="best_time_to_contact" value={time} checked={formData.best_time_to_contact === time} onChange={handleInputChange} className="sr-only peer" />
                                    <div className="text-center py-3.5 rounded-xl border border-slate-200 peer-checked:bg-teal-50 peer-checked:border-teal-500 peer-checked:text-teal-700 text-xs font-bold transition-all uppercase tracking-widest">{t(`emergency.form.bestTime.${time.toLowerCase()}`)}</div>
                                  </label>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {formSection === "permissions" && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                          <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-4">{t("emergency.form.step.permissions")}</h3>
                          <div className="space-y-4">
                            {[
                              { name: "receive_medical_results", label: t("emergency.form.permissions.receiveResults.label"), desc: t("emergency.form.permissions.receiveResults.desc") },
                              { name: "decision_permission", label: t("emergency.form.permissions.decision.label"), desc: t("emergency.form.permissions.decision.desc") },
                              { name: "collect_reports_permission", label: t("emergency.form.permissions.collect.label"), desc: t("emergency.form.permissions.collect.desc") }
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
                        <button type="button" onClick={() => { resetForm(); setActiveTab("list"); }} className="px-6 py-2 rounded-lg border border-slate-300 text-slate-600 font-semibold hover:bg-slate-50 transition-all text-sm">{t("emergency.button.cancel")}</button>
                       <div className="flex gap-3">
                         {!isLastSection ? (
                           <button
                             type="button"
                             onClick={handleNext}
                             className="flex items-center gap-2 px-8 py-2 rounded-lg bg-teal-600 text-white font-bold hover:bg-teal-700 shadow-lg shadow-teal-600/20 active:scale-95 transition-all outline-none text-sm"
                           >
                             {t("register.nextButton")} <ChevronRight className="w-4 h-4" />
                           </button>
                         ) : (
                           <button 
                             type="button" 
                             onClick={handleSave} 
                             className="px-8 py-2 rounded-lg bg-teal-600 text-white font-bold hover:bg-teal-700 shadow-lg shadow-teal-600/20 active:scale-95 transition-all outline-none text-sm"
                           >
                             {isEditing ? t("emergency.button.update") : t("emergency.button.save")}
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
                  <input type="text" placeholder={t("emergency.search.placeholder")} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-14 pr-6 py-4 rounded-2xl border-2 border-slate-100 focus:border-teal-500 outline-none transition-all bg-slate-50/50 font-medium" />
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
                    <h2 className="text-2xl font-bold text-slate-400">{t("emergency.empty.title")}</h2>
                    <p className="text-slate-400 mt-2 max-w-sm mx-auto">{t("emergency.empty.body")}</p>
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