import React from "react";

function SearchBar({ value, onChange, placeholder = "Search for labs or tests..." }) {
  return (
    <div className="w-full max-w-2xl">
      <div className="bg-white rounded-full shadow-lg flex items-center px-3 py-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15z" />
        </svg>

        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 px-4 py-2 text-sm text-slate-700 placeholder-slate-400 focus:outline-none"
        />

        <button className="ml-3 bg-teal-600 text-white px-4 py-2 rounded-full text-sm hover:bg-teal-700">Search</button>
      </div>
    </div>
  );
}

export default SearchBar;
