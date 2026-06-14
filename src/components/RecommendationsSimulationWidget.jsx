import React from 'react';

const RecommendationsSimulationWidget = ({ onClick }) => {
  return (
    <div 
      className="bg-[#FAF8F4] h-full w-full rounded-2xl p-5 shadow-sm border border-[rgba(0,0,0,0.05)] flex flex-col cursor-pointer hover:shadow-md transition-all"
      onClick={onClick}
    >
      {/* Header */}
      <div className="mb-4 text-center">
        <span className="text-xs font-bold text-[#E86A58] uppercase tracking-wider">RECOMMENDATIONS</span>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-3 mt-2">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
          <p className="text-sm text-gray-800 font-medium leading-relaxed m-0">
            <span className="font-bold text-[#E86A58]">Promo:</span> 3 local competitors just launched a free delivery campaign on Deliveroo.
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
          <p className="text-sm text-gray-800 font-medium leading-relaxed m-0">
            <span className="font-bold text-[#E86A58]">Pricing:</span> Margherita Pizza is currently underpriced on Just Eat by £1.00.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RecommendationsSimulationWidget;
