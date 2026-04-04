import React, { useState } from "react";
import { Link } from "react-router-dom";
import { authApi } from "../api/authApi";
import { useAuth } from "../context/AuthContext";

function RegisterPage() {
const { login } = useAuth();
const [step, setStep] = useState(1);
const [formData, setFormData] = useState({
firstName: "",
lastName: "",
email: "",
phone: "",
password: "",
});
const [error, setError] = useState("");
const [loading, setLoading] = useState(false);

const handleChange = (e) => {
setFormData({ ...formData, [e.target.name]: e.target.value });
};

const nextStep = () => setStep(step + 1);
const prevStep = () => setStep(step - 1);

const handleSubmit = async (e) => {
e.preventDefault();
if (step < 3) {
nextStep();
return;
}

setError("");
setLoading(true);

try {
// Patient registration
const patientData = {
full_name: `${formData.firstName} ${formData.lastName}`,
email: formData.email,
password: formData.password,
contact_number: formData.phone
};

const response = await authApi.registerPatient(patientData);

if (response && response.success && response.data.token) {
login(response.data.user, response.data.token);
} else {
setError("Patient registration failed");
}
} catch (err) {
setError(err.message || "An error occurred during registration");
} finally {
setLoading(false);
}
};

return (
<div className="h-screen w-full flex overflow-hidden bg-white">
{/* Left Side: Image */}
<div className="hidden lg:block lg:w-1/2 relative h-full">
<img
src="/images/login-register/patient.png"
alt="Patient Registration"
className="absolute inset-0 h-full w-full object-cover"
/>
<div className="absolute inset-0 bg-teal-900/10" />
</div>

{/* Right Side: Form */}
<div className="w-full lg:w-1/2 flex items-center justify-center p-4 bg-slate-50/50 h-full">
<div className="w-full max-w-md">
<div className="flex flex-col items-center">
<div className="w-full flex justify-end mb-1">
<Link 
to="/staff/register" 
className="group inline-flex items-center gap-2 rounded-full bg-teal-50 px-4 py-1 text-[10px] font-bold text-teal-600 border border-teal-100 transition-all hover:bg-teal-100 hover:scale-105 active:scale-95"
>
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3 group-hover:translate-x-0.5 transition-transform">
<path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
</svg>
Join as Staff
</Link>
</div>

<div className="text-center space-y-1">
<div className="flex justify-center mb-1">
<img src="/images/logo.png" alt="MediLab Logo" className="h-10 w-auto drop-shadow-sm" />
</div>
<h2 className="text-2xl font-bold tracking-tight text-slate-900">
Patient Portal
</h2>
<div className="flex items-center justify-center gap-2">
{[1, 2, 3].map((s) => (
<div 
key={s} 
className={`h-1.5 w-8 rounded-full transition-all duration-300 ${s <= step ? "bg-teal-600" : "bg-slate-200"}`} 
/>
))}
</div>
<p className="text-slate-500 text-sm font-medium">
{step === 1 && "Personal Information"}
{step === 2 && "Contact Details"}
{step === 3 && "Secure your account"}
</p>
</div>
</div>

<form className="mt-2 space-y-4" onSubmit={handleSubmit}>
<div className="min-h-[220px] flex flex-col justify-center">
{step === 1 && (
<div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-500">
<div className="grid grid-cols-2 gap-3">
<div className="space-y-1">
<label htmlFor="firstName" className="text-[11px] font-bold text-slate-700 ml-1 uppercase">First Name</label>
<input
id="firstName"
name="firstName"
type="text"
required
value={formData.firstName}
onChange={handleChange}
className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/10 transition-all font-medium text-sm"
placeholder="First name"
/>
</div>
<div className="space-y-1">
<label htmlFor="lastName" className="text-[11px] font-bold text-slate-700 ml-1 uppercase">Last Name</label>
<input
id="lastName"
name="lastName"
type="text"
required
value={formData.lastName}
onChange={handleChange}
className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/10 transition-all font-medium text-sm"
placeholder="Last name"
/>
</div>
</div>
</div>
)}

{step === 2 && (
<div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-500">
<div className="space-y-1">
<label htmlFor="email" className="text-[11px] font-bold text-slate-700 ml-1 uppercase">Email address</label>
<input
id="email"
name="email"
type="email"
required
value={formData.email}
onChange={handleChange}
className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-sm"
placeholder="Email"
/>
</div>
<div className="space-y-1">
<label htmlFor="phone" className="text-[11px] font-bold text-slate-700 ml-1 uppercase">Phone Number</label>
<input
id="phone"
name="phone"
type="tel"
required
value={formData.phone}
onChange={handleChange}
className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-sm"
placeholder="Phone number"
/>
</div>
</div>
)}

{step === 3 && (
<div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-500">
<div className="space-y-1">
<label htmlFor="password" className="text-[11px] font-bold text-slate-700 ml-1 uppercase">Set Password</label>
<input
id="password"
name="password"
type="password"
required
value={formData.password}
onChange={handleChange}
className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-sm"
placeholder="••••••••"
/>
</div>
<div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
<p className="text-[10px] text-teal-600 font-medium leading-relaxed">
By clicking register, you agree to MediLab\'s patient terms of service and privacy policy.
</p>
</div>
</div>
)}
</div>

{error && (
<div className="p-3 rounded-xl bg-rose-50 border border-rose-100 flex items-center gap-3">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-rose-500">
<path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
</svg>
<p className="text-xs font-semibold text-rose-600">{error}</p>
</div>
)}

<div className="flex flex-col items-center gap-3">
<div className="flex w-full gap-3 justify-center">
{step > 1 && (
<button
type="button"
onClick={prevStep}
className="flex-1 max-w-[100px] rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all active:scale-95"
>
Back
</button>
)}
<button
type="submit"
disabled={loading}
className={`group relative flex justify-center rounded-xl bg-teal-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-teal-500/25 hover:bg-teal-700 hover:-translate-y-0.5 active:scale-[0.98] transition-all disabled:opacity-50 disabled:translate-y-0 ${step === 1 ? "w-48" : "flex-1 max-w-[180px]"}`}
>
{loading ? (
<span className="flex items-center gap-2">
<svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
</svg>
Processing...
</span>
) : step === 3 ? "Complete Registration" : "Next Step"}
</button>
</div>

<div className="text-center pt-2">
<p className="text-slate-500 font-medium text-sm">
Already have an account?{" "}
<Link to="/login" className="text-teal-600 font-bold hover:text-teal-800 transition-colors">
Log in
</Link>
</p>
</div>
</div>
</form>
</div>
</div>
</div>
);
}

export default RegisterPage;
