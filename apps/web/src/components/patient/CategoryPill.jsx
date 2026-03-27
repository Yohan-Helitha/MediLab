import React from "react";

function CategoryPill({ category, count }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
      <div className="font-medium">{category}</div>
      {typeof count === 'number' && <div className="text-xs text-slate-400">{count} tests</div>}
    </div>
  );
}

export default CategoryPill;
