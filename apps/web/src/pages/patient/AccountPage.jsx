import React, { useState, useEffect } from "react";
import PublicLayout from "../../layout/PublicLayout";
import { useAuth } from "../../context/AuthContext";
import { authApi } from "../../api/authApi";
import { updateMemberProfile } from "../../api/patientApi";

const AccountPage = () => {
  const { user, login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [formData, setFormData] = useState({
    email: user?.email || "",
    phoneNumber: user?.contact_number || user?.phoneNumber || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Update formData when user context changes (e.g. after refresh)
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        email: user.email || prev.email,
        phoneNumber: user.contact_number || user.phoneNumber || prev.phoneNumber,
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    // Client-side validation
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match" });
      setLoading(false);
      return;
    }

    try {
      // 1. Update Profile (Member Schema)
      const profileId = user.profile?._id || user._id;
      
      // Clean phone number (strip spaces/dashes) to meet backend regex requirement (exactly 10 digits)
      const cleanPhone = formData.phoneNumber.replace(/[\s\-\+\(\)]/g, '').slice(-10);

      const profilePromise = updateMemberProfile(profileId, {
        email: formData.email,
        contact_number: cleanPhone,
      });

      // 2. Update Auth (Master Schema) - only if password or email changes
      let authPromise = Promise.resolve({ success: true });
      if (formData.newPassword || formData.email !== user.email) {
        const authData = { email: formData.email };
        if (formData.newPassword) {
          if (!formData.currentPassword) {
            setMessage({ type: "error", text: "Current password is required to change password" });
            setLoading(false);
            return;
          }
          authData.currentPassword = formData.currentPassword;
          authData.newPassword = formData.newPassword;
        }
        authPromise = authApi.updateProfile(authData);
      }

      const [profileRes, authRes] = await Promise.all([profilePromise, authPromise]);
      
      if (profileRes.success && authRes.success) {
        setMessage({ type: "success", text: "Account updated successfully" });
        
        // Refresh local user context
        const updatedUser = {
          ...user,
          ...profileRes.data,
          email: formData.email,
          contact_number: cleanPhone
        };
        login(updatedUser, localStorage.getItem("token"));
        
        // Update input field to show the sanitized number
        setFormData(prev => ({
          ...prev,
          phoneNumber: cleanPhone,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }));
      } else {
        const errorMsg = (!profileRes.success ? profileRes.message : authRes.message) || "Update failed.";
        setMessage({ type: "error", text: errorMsg });
      }
    } catch (err) {
      setMessage({ type: "error", text: err.message || "Something went wrong. Please try again later." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      <div className="max-w-2xl mx-auto py-8 px-4">
        <div className="bg-white rounded-[1.5rem] shadow-lg shadow-slate-200/40 border border-slate-100 overflow-hidden">
          {/* Enhanced Teal Header */}
          <div className="bg-[#108373] px-8 py-6">
            <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Account Settings</h1>
            <p className="text-teal-50/80 font-medium text-sm">Update your email, phone, and security preferences</p>
          </div>

          <div className="p-8 md:p-10">
            {message.text && (
              <div className={`mb-6 p-3.5 rounded-xl text-xs font-medium animate-in fade-in slide-in-from-top-2 duration-300 ${
                message.type === "success" 
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                  : "bg-rose-50 text-rose-700 border border-rose-100"
              }`}>
                {message.type === "success" ? "✓ " : "✕ "}
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                {/* Email Field */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700 ml-1 uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-100 text-sm text-slate-600 focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all font-medium"
                    placeholder="mail@example.com"
                    required
                  />
                  <p className="text-[10px] text-slate-400 ml-1">Used for login and notifications.</p>
                </div>

                {/* Phone Field */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700 ml-1 uppercase tracking-wider">Phone Number</label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-100 text-sm text-slate-600 focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all font-medium"
                    placeholder="+94 7X XXX XXXX"
                  />
                  <p className="text-[10px] text-slate-400 ml-1">Primary contact for appointments.</p>
                </div>
              </div>

              {/* Password Section */}
              <div className="pt-8 border-t border-slate-50">
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-slate-800 tracking-tight">Change Password</h2>
                  <p className="text-slate-400 text-[10px] mt-0.5">Leave blank if you don't want to change it.</p>
                </div>

                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-700 ml-1 uppercase tracking-wider">Current Password</label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-100 text-sm text-slate-600 focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all font-medium"
                      placeholder="Enter current password"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-700 ml-1 uppercase tracking-wider">New Password</label>
                      <input
                        type="password"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-100 text-sm text-slate-600 focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all font-medium"
                        placeholder="Min. 8 chars"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-700 ml-1 uppercase tracking-wider">Confirm New Password</label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-100 text-sm text-slate-600 focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all font-medium"
                        placeholder="Repeat password"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-8 flex items-center justify-center">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full md:w-auto px-12 py-3 bg-teal-600 text-white rounded-full font-bold text-[13px] tracking-wide shadow-md shadow-teal-500/20 hover:bg-teal-700 hover:-translate-y-0.5 active:scale-95 transition-all duration-300 disabled:opacity-70 disabled:translate-y-0"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-3.5 w-3.5 text-white" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      SAVING...
                    </span>
                  ) : "SAVE UPDATES"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default AccountPage;
