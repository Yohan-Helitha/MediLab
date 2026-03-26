import React from "react";

function Modal({ isOpen, title, onClose, children }) {
	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40">
			<div className="w-full max-w-xl rounded-2xl bg-white shadow-xl">
				<div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
					<h2 className="text-lg font-semibold text-slate-900">{title}</h2>
					<button
						type="button"
						onClick={onClose}
						className="text-slate-400 hover:text-slate-600"
						aria-label="Close"
					>
						&#10005;
					</button>
				</div>
				<div className="px-6 pb-6 pt-4">{children}</div>
			</div>
		</div>
	);
}

export default Modal;

