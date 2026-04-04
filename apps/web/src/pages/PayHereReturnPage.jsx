import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import PublicLayout from "../layout/PublicLayout";

function PayHereReturnPage() {
	const navigate = useNavigate();
	const [params] = useSearchParams();

	const status = (params.get("status") || "").toLowerCase();
	const orderId = params.get("order_id") || params.get("order") || "";

	const title = status === "success" ? "Payment Submitted" : "Payment Cancelled";
	const message =
		status === "success"
			? "Your payment was submitted. Your booking will be marked as paid once PayHere sends the confirmation to the system."
			: "You cancelled the payment. You can try again from the booking form.";

	const onNavigate = (name) => {
		switch (name) {
			case "home":
				navigate("/");
				return;
			case "health-centers":
				navigate("/health-centers");
				return;
			default:
				return;
		}
	};

	return (
		<PublicLayout onNavigate={onNavigate}>
			<div className="space-y-6">
				<div className="rounded-2xl bg-white shadow-md border border-slate-200 overflow-hidden">
					<div className="h-1 w-full bg-gradient-to-r from-teal-500 to-emerald-400" />
					<div className="p-6 md:p-7">
						<h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
						<p className="mt-2 text-sm text-slate-700">{message}</p>
						{orderId && (
							<p className="mt-3 text-xs text-slate-500">
								Order/Booking ID: <span className="font-mono">{orderId}</span>
							</p>
						)}
						<div className="mt-6 flex flex-wrap gap-3">
							<button
								type="button"
								onClick={() => navigate("/health-centers")}
								className="rounded-full bg-teal-600 px-6 py-2 text-sm font-semibold text-white hover:bg-teal-700"
							>
								Book another test
							</button>
							<button
								type="button"
								onClick={() => navigate("/dashboard")}
								className="rounded-full bg-slate-100 px-6 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-200"
							>
								Go to dashboard
							</button>
						</div>
					</div>
				</div>
			</div>
		</PublicLayout>
	);
}

export default PayHereReturnPage;
