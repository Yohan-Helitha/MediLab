import React from "react";

function CategoryPill({ category, count }) {
  return (
    <div className="rounded-xl p-[1.5px] bg-gradient-to-r from-teal-400 to-teal-800 shadow-sm">
      <div className="rounded-lg bg-white px-4 py-3 text-sm text-slate-700">
        <div className="font-medium">{category}</div>
        {typeof count === 'number' && <div className="text-xs text-slate-400">{count} tests</div>}
      </div>
    </div>
  );
}

export default CategoryPill;
