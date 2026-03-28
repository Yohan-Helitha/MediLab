import React from "react";

function SearchBar({
  value,
  onChange,
  onSubmit,
  placeholder = "Search for labs or tests...",
  size = "lg",
}) {
  const isSmall = size === "sm";

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && onSubmit) {
      e.preventDefault();
      onSubmit(value?.trim?.() ?? "");
    }
  };

  return (
    <div className="w-full max-w-2xl">
      <div
        className={`bg-white rounded-full flex items-center px-3 ${
          isSmall ? "py-1.5 shadow-md" : "py-2 shadow-lg"
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`${isSmall ? "h-4 w-4" : "h-5 w-5"} text-slate-400`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15z"
          />
        </svg>

        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`flex-1 px-4 ${
            isSmall ? "py-1.5 text-xs" : "py-2 text-sm"
          } text-slate-700 placeholder-slate-400 focus:outline-none`}
        />

        <button
          type="button"
          onClick={() => onSubmit && onSubmit(value?.trim?.() ?? "")}
          className={`ml-3 bg-teal-600 text-white rounded-full hover:bg-teal-700 ${
            isSmall ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm"
          }`}
        >
          Search
        </button>
      </div>
    </div>
  );
}

export default SearchBar;
