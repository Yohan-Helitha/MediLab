import React from "react";
import { useTranslation } from "react-i18next";
import PublicLayout from "../../layout/PublicLayout";

const HealthReportsPage = () => {
    const { t } = useTranslation();
    return (
        <PublicLayout>
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-8 py-10 text-white text-center">
                        <h1 className="text-3xl font-bold mb-3">{t("healthReports.title")}</h1>
                        <p className="text-teal-50 opacity-90 max-w-2xl mx-auto">
                            {t("healthReports.subtitle")}
                        </p>
                    </div>

                    <div className="p-12 text-center">
                        <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-semibold text-slate-800 mb-4">{t("healthReports.empty.title")}</h2>
                        <p className="text-slate-600 mb-8 max-w-md mx-auto">
                            {t("healthReports.empty.body")}
                        </p>
                        <button className="bg-teal-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-teal-700 transition-all shadow-md hover:shadow-lg">
                            {t("healthReports.empty.button")}
                        </button>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
};

export default HealthReportsPage;
