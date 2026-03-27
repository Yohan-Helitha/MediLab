import React from "react";

function TestCard({ test }) {
  return (
    <div className="rounded-lg bg-white p-4 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <div className="text-sm font-semibold text-slate-900">{test.name}</div>
          <div className="text-xs text-slate-500 mt-1">{test.category}</div>
          <div className="mt-3 text-xs text-slate-600">{test.description}</div>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium text-slate-900">Rs {test.price ? Number(test.price).toFixed(2) : '-'}</div>
          <div className="text-xs text-slate-500 mt-1">{test.estimatedResultTimeHours ? `${test.estimatedResultTimeHours} hours` : ''}</div>
        </div>
      </div>
    </div>
  );
}

export default TestCard;
