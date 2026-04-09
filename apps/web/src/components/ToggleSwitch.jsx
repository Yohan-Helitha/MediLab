import React from "react";

function ToggleSwitch({ checked, onChange, disabled = false, label }) {
	return (
		<button
			type="button"
			className={`inline-flex items-center gap-2 rounded-full px-2 py-1 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-1 ${
				disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
			}`}
			onClick={() => {
				if (!disabled && onChange) onChange(!checked);
			}}
			disabled={disabled}
		>
			<span
				className={`relative flex h-5 w-9 items-center rounded-full border transition-colors ${
					checked
						? "border-teal-500 bg-teal-500"
						: "border-slate-300 bg-slate-200"
				}`}
			>
				<span
					className={`h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
						checked ? "translate-x-3" : "translate-x-0"
					}`}
				/>
			</span>
			{label && (
				<span className={checked ? "text-teal-600" : "text-slate-500"}>{label}</span>
			)}
		</button>
	);
}

export default ToggleSwitch;

