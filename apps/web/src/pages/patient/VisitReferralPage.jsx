import React, { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Calendar, 
  Clock, 
  FileText, 
  User, 
  MapPin, 
  Stethoscope, 
  ArrowRight, 
  Plus, 
  Search, 
  Eye, 
  Edit2, 
  Trash2, 
  X, 
  ChevronRight, 
  AlertCircle,
  FileBadge
} from 'lucide-react';
import PublicLayout from '../../layout/PublicLayout';
import { AuthContext } from '../../context/AuthContext';
import { apiRequest } from '../../api/client';
import { fetchVisitsByPatient, createVisit, updateVisit, deleteVisit, fetchReferralsByPatient, createReferral, updateReferral, deleteReferral } from '../../api/visitApi';

const VisitReferralPage = () => {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const isPatient = user?.role === 'patient' || user?.userType === 'patient';
  
  // Always initialize to the first tab (visits) when opening the page
  const [activeTab, setActiveTab] = useState('visits');
  const [loading, setLoading] = useState(false);
  const [visits, setVisits] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('visit'); // 'visit' or 'referral'
  const [currentViewItem, setCurrentViewItem] = useState(null);

  // Form State
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'add'
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [visitFormData, setVisitFormData] = useState({
    member_name: user?.full_name || '',
    member_id: user?.member_id || '',
    address: '',
    household_id: '',
    visit_date: new Date().toISOString().split('T')[0],
    visit_type: 'OPD',
    reason_for_visit: '',
    doctor_notes: '',
    diagnosis: '',
    follow_up_required: false,
    follow_up_date: '',
    created_by_staff_id: 'HO-2024-001'
  });

  const [referralFormData, setReferralFormData] = useState({
    visit_id: '',
    referred_to: 'Base Hospital',
    referral_reason: '',
    urgency_level: 'Routine',
    referral_status: 'Pending'
  });

  useEffect(() => {
    // Priority: user.member_id from context -> user.systemId -> Hardcoded test ID
    const fetchMemberId = user?.member_id || user?.systemId || 'MEM-ANU-PADGNDIV-2026-00003';
    console.log("Fetching for Member ID:", fetchMemberId);
    if (fetchMemberId) {
      loadData(fetchMemberId);
    }
  }, [user, activeTab]);

  const loadData = async (memberId) => {
    setLoading(true);
    try {
      if (activeTab === 'visits') {
        const res = await fetchVisitsByPatient(memberId);
        console.log("Visits Response:", res);
        // Backend returns data: { visits, pagination }
        if (res.success) {
          // Normalize data access: handle both { visits: [] } and raw array []
          const visitsData = res.data?.visits || (Array.isArray(res.data) ? res.data : []);
          setVisits(visitsData);
        }
      } else {
        const res = await fetchReferralsByPatient(memberId);
        console.log("Referrals Response:", res);
        // Backend returns data: { referrals, pagination } or just array from memberId endpoint
        if (res.success) {
          // Normalize data access
          const referralsData = res.data?.referrals || (Array.isArray(res.data) ? res.data : []);
          setReferrals(referralsData);
        }
      }
    } catch (err) {
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleVisitInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setVisitFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleReferralInputChange = (e) => {
    const { name, value } = e.target;
    setReferralFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForms = () => {
    setVisitFormData({
      member_name: user?.full_name || '',
      member_id: user?.member_id || '',
      address: '',
      household_id: user?.household_id || 'ANU-PADGNDIV-00001',
      visit_date: new Date().toISOString().split('T')[0],
      visit_type: 'OPD',
      reason_for_visit: '',
      doctor_notes: '',
      diagnosis: '',
      follow_up_required: false,
      follow_up_date: '',
      created_by_staff_id: 'HO-2024-001'
    });
    setReferralFormData({
      visit_id: '',
      referred_to: 'Base Hospital',
      referral_reason: '',
      urgency_level: 'Routine',
      referral_status: 'Pending'
    });
    setIsEditing(false);
    setEditId(null);
    setViewMode('list');
  };

  const handleSaveVisit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { 
        ...visitFormData, 
        member_id: user.member_id,
        household_id: user.household_id || 'ANU-PADGNDIV-00001',
        created_by_staff_id: 'HO-2024-001'
      };
      const res = isEditing 
        ? await updateVisit(editId, payload)
        : await createVisit(payload);
        
      if (res.success) {
        resetForms();
        loadData();
      } else if (res.errors) {
        // Log validation errors for debugging
        console.error("Validation errors:", res.errors);
        alert(`Validation failed: ${res.errors.map(e => e.msg).join(', ')}`);
      }
    } catch (err) {
      console.error("Error saving visit:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveReferral = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = isEditing
        ? await updateReferral(editId, referralFormData)
        : await createReferral(referralFormData);

      if (res.success) {
        resetForms();
        loadData();
      }
    } catch (err) {
      console.error("Error saving referral:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (item, type) => {
    setCurrentViewItem(item);
    setModalType(type);
    setIsModalOpen(true);
  };

  const handleEditVisit = (visit) => {
    setVisitFormData({
      ...visit,
      visit_date: visit.visit_date?.split('T')[0] || '',
      follow_up_date: visit.follow_up_date?.split('T')[0] || ''
    });
    setEditId(visit._id);
    setIsEditing(true);
    setViewMode('add');
  };

  const handleEditReferral = (ref) => {
    setReferralFormData({ ...ref });
    setEditId(ref._id);
    setIsEditing(true);
    setViewMode('add');
  };

  const handleDelete = async (id, type) => {
    if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;
    try {
      const res = type === 'visit' ? await deleteVisit(id) : await deleteReferral(id);
      if (res.success) loadData();
    } catch (err) {
      console.error("Error deleting:", err);
    }
  };

  const filteredVisits = visits.filter(v => 
    v.reason_for_visit?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredReferrals = referrals.filter(r => 
    r.referral_reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.referred_to?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <PublicLayout>
      <div className="max-w-4xl mx-auto py-8 mt-16 px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="bg-teal-700 px-8 py-6 text-white flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">{t('visits.title')}</h1>
              <p className="text-teal-100 mt-1">{t('visits.subtitle')}</p>
            </div>
            {viewMode === 'list' && !isPatient && (
              <button 
                onClick={() => setViewMode('add')}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add New
              </button>
            )}
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-200 bg-slate-50">
            <button
              onClick={() => { setActiveTab("visits"); setViewMode('list'); }}
              className={`px-8 py-4 text-sm font-semibold transition-colors ${
                activeTab === "visits" 
                ? "bg-white text-teal-700 border-b-2 border-teal-700" 
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
              }`}
            >
              {t('visits.tab.clinical')}
            </button>
            <button
              onClick={() => { setActiveTab("referrals"); setViewMode('list'); }}
              className={`px-8 py-4 text-sm font-semibold transition-colors ${
                activeTab === "referrals" 
                ? "bg-white text-teal-700 border-b-2 border-teal-700" 
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
              }`}
            >
              {t('visits.tab.referrals')}
            </button>
          </div>

          {/* Content */}
          <div className="p-8">
            {viewMode === 'list' ? (
              <div className="space-y-6">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input 
                    type="text" 
                    placeholder={`Search ${activeTab}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all text-sm" 
                  />
                </div>

                <div className="divide-y divide-slate-100">
                  {loading ? (
                    <div className="py-12 flex flex-col items-center justify-center">
                      <div className="w-8 h-8 border-2 border-teal-700 border-t-transparent rounded-full animate-spin mb-3" />
                      <p className="text-slate-400 text-sm font-medium">Loading records...</p>
                    </div>
                  ) : (activeTab === 'visits' ? (
                    <div className="space-y-2">
                      {filteredVisits.length > 0 ? filteredVisits.map(visit => (
                        <div key={visit._id} className="group flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center text-teal-700 group-hover:bg-teal-700 group-hover:text-white transition-all">
                              <Calendar className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-800 text-sm">{visit.reason_for_visit}</h4>
                              <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(visit.visit_date).toLocaleDateString()}</span>
                                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{visit.visit_type}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                            <button onClick={() => handleView(visit, 'visit')} className="p-2 text-slate-400 hover:text-teal-600 transition-colors" title="View"><Eye className="w-4 h-4" /></button>
                            {!isPatient && (
                              <>
                                <button onClick={() => handleEditVisit(visit)} className="p-2 text-slate-400 hover:text-amber-500 transition-colors" title="Edit"><Edit2 className="w-4 h-4" /></button>
                                <button onClick={() => handleDelete(visit._id, 'visit')} className="p-2 text-slate-400 hover:text-rose-500 transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
                              </>
                            )}
                          </div>
                        </div>
                      )) : (
                        <div className="py-12 text-center">
                          <FileText className="w-12 h-12 text-slate-100 mx-auto mb-3" />
                          <p className="text-slate-400 text-sm">{t('visits.empty.noVisits')}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {filteredReferrals.length > 0 ? filteredReferrals.map(ref => (
                        <div key={ref._id} className="group flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-slate-800 group-hover:text-white transition-all">
                              <FileBadge className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-800 text-sm">{ref.referred_to}</h4>
                              <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                                <span className={`flex items-center gap-1 ${ref.urgency_level === 'Emergency' ? 'text-rose-600' : 'text-amber-600'}`}>
                                  <AlertCircle className="w-3 h-3" />{ref.urgency_level}
                                </span>
                                <span className="flex items-center gap-1"><Stethoscope className="w-3 h-3 text-teal-600" />{ref.referral_status}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                            <button onClick={() => handleView(ref, 'referral')} className="p-2 text-slate-400 hover:text-teal-600 transition-colors" title="View"><Eye className="w-4 h-4" /></button>
                            {!isPatient && (
                              <>
                                <button onClick={() => handleEditReferral(ref)} className="p-2 text-slate-400 hover:text-amber-500 transition-colors" title="Edit"><Edit2 className="w-4 h-4" /></button>
                                <button onClick={() => handleDelete(ref._id, 'referral')} className="p-2 text-slate-400 hover:text-rose-500 transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
                              </>
                            )}
                          </div>
                        </div>
                      )) : (
                        <div className="py-12 text-center">
                          <FileBadge className="w-12 h-12 text-slate-100 mx-auto mb-3" />
                          <p className="text-slate-400 text-sm">{t('visits.empty.noReferrals')}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-lg font-bold text-slate-800">
                    {isEditing ? `Update ${activeTab === 'visits' ? 'Visit' : 'Referral'}` : `New ${activeTab === 'visits' ? 'Visit' : 'Referral'}`}
                  </h3>
                  <button onClick={resetForms} className="text-slate-400 hover:text-slate-600 flex items-center gap-1 text-sm font-semibold">
                    <X className="w-4 h-4" /> Cancel
                  </button>
                </div>

                {activeTab === 'visits' ? (
                  <form onSubmit={handleSaveVisit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Current Address</label>
                        <input type="text" name="address" value={visitFormData.address} onChange={handleVisitInputChange} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all text-sm" placeholder="Enter full address" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Visit Date</label>
                        <input type="date" name="visit_date" value={visitFormData.visit_date} onChange={handleVisitInputChange} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all text-sm" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Visit Type</label>
                        <select name="visit_type" value={visitFormData.visit_type} onChange={handleVisitInputChange} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all text-sm">
                          <option value="OPD">OPD Visit</option>
                          <option value="Mobile clinic">Mobile Clinic</option>
                          <option value="Home visit">Home Visit</option>
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Reason for Visit</label>
                        <textarea name="reason_for_visit" value={visitFormData.reason_for_visit} onChange={handleVisitInputChange} rows="2" className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all text-sm" placeholder="Reason for consulting" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Doctor Notes</label>
                        <textarea name="doctor_notes" value={visitFormData.doctor_notes} onChange={handleVisitInputChange} rows="2" className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all text-sm" placeholder="Internal medical notes" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Diagnosis</label>
                        <textarea name="diagnosis" value={visitFormData.diagnosis} onChange={handleVisitInputChange} rows="1" className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all text-sm" placeholder="Clinical diagnosis" />
                      </div>
                      <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <input type="checkbox" id="follow_up" name="follow_up_required" checked={visitFormData.follow_up_required} onChange={handleVisitInputChange} className="w-5 h-5 rounded text-teal-600 focus:ring-teal-500 border-slate-300" />
                        <label htmlFor="follow_up" className="text-sm font-semibold text-slate-700 cursor-pointer">Follow up required</label>
                      </div>
                      {visitFormData.follow_up_required && (
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Follow Up Date</label>
                          <input type="date" name="follow_up_date" value={visitFormData.follow_up_date} onChange={handleVisitInputChange} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all text-sm" />
                        </div>
                      )}
                    </div>
                    <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
                      <button type="button" onClick={resetForms} className="px-6 py-2.5 border border-slate-200 rounded-lg font-bold text-sm text-slate-600 hover:bg-slate-50 transition-all">Discard</button>
                      <button type="submit" className="px-8 py-2.5 bg-teal-700 text-white rounded-lg font-bold text-sm shadow-sm hover:bg-teal-800 transition-all">
                        {isEditing ? 'Update Record' : 'Save Record'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleSaveReferral} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Visit Source</label>
                        <select name="visit_id" value={referralFormData.visit_id} onChange={handleReferralInputChange} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all text-sm">
                          <option value="">Select Visit Record</option>
                          {visits.map(v => (
                            <option key={v._id} value={v._id}>{v.reason_for_visit} ({new Date(v.visit_date).toLocaleDateString()})</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Referred Institution</label>
                        <select name="referred_to" value={referralFormData.referred_to} onChange={handleReferralInputChange} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all text-sm">
                          <option value="Base Hospital">Base Hospital</option>
                          <option value="District Hospital">District Hospital</option>
                          <option value="Specialist Clinic">Specialist Clinic</option>
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Referral Reason</label>
                        <textarea name="referral_reason" value={referralFormData.referral_reason} onChange={handleReferralInputChange} rows="3" className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all text-sm" placeholder="Detailed reason for referral" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Urgency Level</label>
                        <div className="flex gap-2">
                          {['Routine', 'Urgent', 'Emergency'].map(level => (
                            <button
                              key={level}
                              type="button"
                              onClick={() => setReferralFormData(p => ({ ...p, urgency_level: level }))}
                              className={`flex-1 py-2.5 rounded-lg text-xs font-bold border transition-all ${referralFormData.urgency_level === level ? 'bg-slate-800 text-white border-slate-800 shadow-sm' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}
                            >
                              {level}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                        <select name="referral_status" value={referralFormData.referral_status} onChange={handleReferralInputChange} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all text-sm">
                          <option value="Pending">Pending</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>
                    <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
                      <button type="button" onClick={resetForms} className="px-6 py-2.5 border border-slate-200 rounded-lg font-bold text-sm text-slate-600 hover:bg-slate-50 transition-all">Discard</button>
                      <button type="submit" className="px-8 py-2.5 bg-teal-700 text-white rounded-lg font-bold text-sm shadow-sm hover:bg-teal-800 transition-all">
                        {isEditing ? 'Update Referral' : 'Issue Referral'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal matching the simplified clean layout */}
      {isModalOpen && currentViewItem && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl relative animate-in zoom-in-95 duration-300 overflow-hidden border border-slate-200">
            <div className="bg-slate-50 px-8 py-6 border-b border-slate-200 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${modalType === 'visit' ? 'bg-teal-100 text-teal-700' : 'bg-slate-200 text-slate-700'}`}>
                  {modalType === 'visit' ? <Calendar className="w-5 h-5" /> : <FileBadge className="w-5 h-5" />}
                </div>
                <h2 className="text-xl font-bold text-slate-900">
                  {modalType === 'visit' ? 'Visit Summary' : 'Referral Record'}
                </h2>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-slate-200 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {modalType === 'visit' ? (
                  <>
                    <div className="space-y-4">
                      <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Visit Date</p><p className="text-sm font-semibold text-slate-700">{new Date(currentViewItem.visit_date).toLocaleDateString()}</p></div>
                      <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Reason for consultation</p><p className="text-sm font-bold text-slate-800">{currentViewItem.reason_for_visit}</p></div>
                      <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Clinical Diagnosis</p><p className="text-sm font-medium text-slate-600 italic bg-slate-50 p-3 rounded-lg">"{currentViewItem.diagnosis || 'Standard evaluation recorded'}"</p></div>
                    </div>
                    <div className="space-y-4">
                      <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Provider Notes</p><p className="text-xs font-medium text-slate-500 leading-relaxed bg-teal-50/50 p-3 rounded-lg">{currentViewItem.doctor_notes || 'No specific technical notes available'}</p></div>
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                        <span className="text-xs font-bold text-slate-400">Follow Up</span>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${currentViewItem.follow_up_required ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-400'}`}>
                          {currentViewItem.follow_up_required ? 'Required' : 'None'}
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-4">
                      <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Target Institution</p><p className="text-sm font-bold text-slate-800">{currentViewItem.referred_to}</p></div>
                      <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Priority Level</p><span className={`inline-block px-2 py-1 rounded text-[10px] font-bold uppercase ${currentViewItem.urgency_level === 'Emergency' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'}`}>{currentViewItem.urgency_level}</span></div>
                    </div>
                    <div className="space-y-4">
                      <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Referral status</p><p className="text-sm font-bold text-slate-800">{currentViewItem.referral_status}</p></div>
                      <div className="bg-slate-50 p-4 rounded-xl">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Detailed Reason</p>
                        <p className="text-xs text-slate-600 leading-relaxed">{currentViewItem.referral_reason || 'See visit history for clinical logic'}</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
              <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 bg-teal-600 text-white rounded-lg text-sm font-bold hover:bg-teal-700 transition-colors"
                >
                  Close Summary
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PublicLayout>
  );
};

export default VisitReferralPage;
