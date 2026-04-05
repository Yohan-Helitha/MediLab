import React, { useState, useRef, useEffect } from "react";
import PublicLayout from "../../layout/PublicLayout";
import { consultationApi } from "../../api/consultationApi";
import { useAuth } from "../../context/AuthContext";
import ReactMarkdown from 'react-markdown';
import { toast } from "react-hot-toast";
import { getSafeErrorMessage } from "../../utils/errorHandler";

function SymptomCheckerPage() {
  const { user } = useAuth();

  // Symptom Checker State
  const [symptoms, setSymptoms] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // Always scroll to top on mount (page refresh)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSymptomCheck = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await consultationApi.analyzeSymptoms(symptoms);
      const data = response.data || response;
      setResult({
        diagnosis: data.diagnosis || "Preliminary Analysis Complete",
        recommendations: data.recommendation || data.message || "Please consult a doctor for a formal diagnosis.",
        disclaimer: "This AI-generated analysis is for informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment."
      });
    } catch (error) {
      console.error("AI Analysis Error:", error);
      toast.error(getSafeErrorMessage(error, "symptom-analysis"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      <div className="bg-slate-50/50 py-10 px-4 md:px-8">
        <div className="max-w-[800px] mx-auto space-y-8">
          
          <div className="bg-white rounded-[32px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden min-h-[920px] flex flex-col">
            
            {/* Header Rendering */}
            <div className="bg-teal-700 px-8 py-6 md:px-10 text-white relative overflow-hidden transition-all duration-500">
              <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                </svg>
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0012 18.75c-1.03 0-1.9-.4-2.453-.914l-.547-.547z" />
                    </svg>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-teal-100 italic">
                    AI CLINICAL DIAGNOSTICS
                  </span>
                </div>
                
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                  AI Health Check
                </h1>
                <p className="text-teal-50/70 text-xs font-medium max-w-xl leading-relaxed mt-1 italic">
                  Analyze clinical patterns to provide preliminary insights and health recommendations.
                </p>
              </div>
            </div>

            {/* Content Rendering */}
            <div className="p-8 md:p-12 animate-in fade-in duration-500">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                  <div className="lg:col-span-12">
                      <form onSubmit={handleSymptomCheck} className="space-y-8">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between ml-1">
                                <label className="text-[13px] font-bold text-slate-400 uppercase">Symptom Description</label>
                                <span className="text-[10px] font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded-md">AI POWERED INTAKE</span>
                            </div>
                            <textarea
                              value={symptoms}
                              onChange={(e) => setSymptoms(e.target.value)}
                              className="w-full h-56 rounded-2xl border-2 border-slate-100 bg-slate-50/50 p-6 text-slate-700 text-sm font-medium focus:border-teal-500/30 focus:bg-white focus:ring-4 focus:ring-teal-500/5 outline-none transition-all duration-300 resize-none placeholder:text-slate-300"
                              placeholder="Describe how you are feeling in detail..."
                              required
                            />
                          </div>
                          <div className="flex items-center gap-4">
                            <button
                              type="submit"
                              disabled={loading}
                              className="flex-1 bg-teal-700 text-white font-bold py-4 rounded-2xl hover:bg-teal-800 transition-all shadow-xl shadow-teal-900/10 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 text-sm uppercase tracking-[0.09em]"
                            >
                                {loading ? "Analyzing Data..." : "Run Analysis"}
                            </button>
                            {(symptoms || result) && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSymptoms("");
                                    setResult(null);
                                  }}
                                  className="px-8 py-4 rounded-2xl border-2 border-slate-100 bg-white text-slate-400 font-bold hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-all active:scale-[0.95] flex items-center gap-2 text-sm uppercase tracking-widest"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                  </svg>
                                  Reset
                                </button>
                            )}
                          </div>
                      </form>
                  </div>
                </div>
                {result && (
                  <div className="mt-10 p-8 rounded-3xl bg-slate-50 border border-slate-100 animate-in slide-in-from-bottom-2 duration-500">
                      <div className="flex items-center gap-2 mb-4">
                          <div className="w-2 h-2 rounded-full bg-teal-600" />
                          <span className="text-[10px] font-bold text-teal-600 uppercase tracking-widest">PROBABLE DIAGNOSIS PATHWAY</span>
                      </div>
                      <h2 className="text-3xl font-bold text-slate-900 mb-6 uppercase">{result.diagnosis}</h2>
                      <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm italic text-slate-600 font-bold mb-6">
                          "{result.recommendations}"
                      </div>
                      <div className="text-[10px] text-rose-500 font-bold italic uppercase flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" strokeWidth="2.5" /></svg>
                          Medical Disclaimer: {result.disclaimer}
                      </div>
                  </div>
                )}
            </div>

            {/* Security Footer (Constant) */}
            <div className="bg-slate-50 px-8 py-5 flex flex-col md:flex-row items-center justify-between border-t border-slate-100 gap-4 mt-auto">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[14px] font-bold text-slate-400 uppercase">AES-256 Encrypted</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[14px] font-bold text-slate-400 uppercase">HIPAA Compliant</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[14px] font-bold text-slate-300 uppercase ">MediLab Intelligence Engine v4.2.0</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </PublicLayout>
  );
}

export default SymptomCheckerPage;
