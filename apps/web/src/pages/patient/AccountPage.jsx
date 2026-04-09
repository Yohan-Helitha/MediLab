import React, { useState, useEffect } from "react";
import PublicLayout from "../../layout/PublicLayout";
import { useAuth } from "../../context/AuthContext";
import { authApi } from "../../api/authApi";
import { updateMemberProfile } from "../../api/patientApi";
import { toast } from "react-hot-toast";
import { getSafeErrorMessage } from "../../utils/errorHandler";

const AccountPage = () => {
  const { user, login } = useAuth();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: user?.email || "",
    phoneNumber: user?.contact_number || user?.phoneNumber || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Password validation helper
  const validatePassword = (password) => {
    if (!password) return { isValid: false, checks: {} };
    
    return {
      isValid: 
        password.length >= 8 &&
        /[A-Z]/.test(password) &&
        /[a-z]/.test(password) &&
        /[0-9]/.test(password) &&
        /[@$!%*?&#]/.test(password),
      checks: {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[@$!%*?&#]/.test(password),
      }
    };
  };

  const passwordValidation = validatePassword(formData.newPassword);

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

    // Client-side validation
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      toast.error("New passwords do not match");
      setLoading(false);
      return;
    }

    // Validate password requirements if changing password
    if (formData.newPassword && !passwordValidation.isValid) {
      toast.error("Password must contain at least 8 characters with uppercase, lowercase, number, and special character (@$!%*?&#)");
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
            toast.error("Current password is required to change password");
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
        toast.success("Account updated successfully");
        
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
        toast.error(getSafeErrorMessage({ message: errorMsg }, "password"));
      }
    } catch (err) {
      toast.error(getSafeErrorMessage(err, "password"));
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
                      {formData.newPassword && (
                        <div className="mt-2 p-2.5 rounded-lg bg-slate-50 border border-slate-100 space-y-1.5">
                          <p className="text-[10px] font-bold text-slate-700 uppercase">Password Requirements:</p>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <svg className={`w-3.5 h-3.5 ${passwordValidation.checks.length ? 'text-emerald-500' : 'text-slate-300'}`} fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              <span className={`text-[10px] ${passwordValidation.checks.length ? 'text-emerald-700' : 'text-slate-500'}`}>At least 8 characters</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <svg className={`w-3.5 h-3.5 ${passwordValidation.checks.uppercase ? 'text-emerald-500' : 'text-slate-300'}`} fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              <span className={`text-[10px] ${passwordValidation.checks.uppercase ? 'text-emerald-700' : 'text-slate-500'}`}>One uppercase letter (A-Z)</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <svg className={`w-3.5 h-3.5 ${passwordValidation.checks.lowercase ? 'text-emerald-500' : 'text-slate-300'}`} fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              <span className={`text-[10px] ${passwordValidation.checks.lowercase ? 'text-emerald-700' : 'text-slate-500'}`}>One lowercase letter (a-z)</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <svg className={`w-3.5 h-3.5 ${passwordValidation.checks.number ? 'text-emerald-500' : 'text-slate-300'}`} fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              <span className={`text-[10px] ${passwordValidation.checks.number ? 'text-emerald-700' : 'text-slate-500'}`}>One number (0-9)</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <svg className={`w-3.5 h-3.5 ${passwordValidation.checks.special ? 'text-emerald-500' : 'text-slate-300'}`} fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              <span className={`text-[10px] ${passwordValidation.checks.special ? 'text-emerald-700' : 'text-slate-500'}`}>One special character (@$!%*?&#)</span>
                            </div>
                          </div>
                        </div>
                      )}
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
                      {formData.newPassword && formData.confirmPassword && (
                        <div className={`mt-2 p-2.5 rounded-lg border flex items-center gap-2 ${
                          formData.newPassword === formData.confirmPassword
                            ? 'bg-emerald-50 border-emerald-100'
                            : 'bg-rose-50 border-rose-100'
                        }`}>
                          {formData.newPassword === formData.confirmPassword ? (
                            <>
                              <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              <span className="text-[10px] font-medium text-emerald-700">Passwords match</span>
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4 text-rose-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                              <span className="text-[10px] font-medium text-rose-700">Passwords don't match</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-8 flex items-center justify-center">
                <button
                  type="submit"
                  disabled={loading || (formData.newPassword && !passwordValidation.isValid) || (formData.newPassword && formData.newPassword !== formData.confirmPassword)}
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
