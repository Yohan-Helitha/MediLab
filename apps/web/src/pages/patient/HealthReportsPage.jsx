import React from "react";
import PublicLayout from "../../layout/PublicLayout";

const HealthReportsPage = () => {
    return (
        <PublicLayout>
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-8 py-10 text-white text-center">
                        <h1 className="text-3xl font-bold mb-3">User Health Reports</h1>
                        <p className="text-teal-50 opacity-90 max-w-2xl mx-auto">
                            Access and manage your medical laboratory reports, imaging results, and health summaries in one secure location.
                        </p>
                    </div>

                    <div className="p-12 text-center">
                        <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-semibold text-slate-800 mb-4">No Reports Found Yet</h2>
                        <p className="text-slate-600 mb-8 max-w-md mx-auto">
                            Your health reports will appear here once they are processed by the lab. You can view, download, and share them with your doctors.
                        </p>
                        <button className="bg-teal-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-teal-700 transition-all shadow-md hover:shadow-lg">
                            Find Health Centers
                        </button>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
};

export default HealthReportsPage;
