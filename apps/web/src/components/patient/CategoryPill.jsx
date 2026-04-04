import React from "react";
import { 
  HiBeaker, 
  HiMiniCircleStack, 
  HiEye, 
  HiHeart, 
  HiClipboardDocumentCheck,
  HiOutlineQuestionMarkCircle
} from "react-icons/hi2";

const categoryIcons = {
  "Hematology": <HiBeaker className="w-6 h-6" />,
  "Blood Chemistry": <HiMiniCircleStack className="w-6 h-6" />,
  "Imaging": <HiEye className="w-6 h-6" />,
  "ECG": <HiHeart className="w-6 h-6" />,
  "Clinical Pathology": <HiClipboardDocumentCheck className="w-6 h-6" />,
};

function CategoryPill({ category, count }) {
  const icon = categoryIcons[category] || <HiOutlineQuestionMarkCircle className="w-6 h-6" />;

  return (
    <div className="group relative overflow-hidden rounded-2xl p-px bg-slate-200 hover:bg-gradient-to-br hover:from-teal-400 hover:to-teal-600 transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer">
      <div className="relative rounded-[15px] bg-white px-5 py-6 flex items-center gap-4 transition-all duration-300 group-hover:bg-white/95">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-600 transition-colors group-hover:bg-teal-100 group-hover:text-teal-700">
          {icon}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="font-bold text-slate-800 group-hover:text-teal-900 transition-colors truncate">
            {category}
          </div>
          {typeof count === 'number' && (
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1 h-1 rounded-full bg-slate-300 group-hover:bg-teal-400"></span>
              <span className="text-xs font-medium text-slate-500 group-hover:text-teal-600">
                {count} {count === 1 ? 'test' : 'tests'} available
              </span>
            </div>
          )}
        </div>

        <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
    </div>
  );
}

export default CategoryPill;
