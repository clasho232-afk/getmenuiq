import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const pricingItems = [
  { type: 'pricing', id: 'p1', name: "Margherita Pizza", image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=150&q=80", baseline: "£13.50", status: "-£1.00 Underpriced", platform: "Just Eat", fix: "Match local benchmark." },
  { type: 'pricing', id: 'p2', name: "Vegan Burger", image: "https://images.unsplash.com/photo-1594212580737-67eb1c2b53df?auto=format&fit=crop&w=150&q=80", baseline: "£9.50", status: "+£1.50 Overpriced", platform: "Uber Eats", fix: "Lower price to increase conversion." },
  { type: 'pricing', id: 'p3', name: "Family Combo", image: "https://images.unsplash.com/photo-1544982503-9f984c14501a?auto=format&fit=crop&w=150&q=80", baseline: "£24.00", status: "Not Offered", platform: "Deliveroo", fix: "Add item to Deliveroo menu." }
];

const promoItems = [
  { type: 'promo', id: 'pr1', competitor: "Pizza Express", image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=150&q=80", promo: "Free Delivery over £15", platform: "Deliveroo" },
  { type: 'promo', id: 'pr2', competitor: "Burger King", image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=150&q=80", promo: "20% Off Entire Menu", platform: "Uber Eats" },
  { type: 'promo', id: 'pr3', competitor: "Local Pasta", image: "https://images.unsplash.com/photo-1621996316564-6fa3fb3c6319?auto=format&fit=crop&w=150&q=80", promo: "Buy 1 Get 1 Free", platform: "Just Eat" }
];

const insightsData = [
  { id: 'i1', image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=150&q=80', text: <>Margherita Pizza is <span className="text-[#E86A58] font-bold">£1 underpriced</span> on Just Eat, consider increasing price.</> },
  { id: 'i2', image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=150&q=80', text: <>Vegan Burger is <span className="text-[#E86A58] font-bold">£1.50 overpriced</span> on Uber Eats, consider adjusting.</> },
  { id: 'i3', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=150&q=80', text: <>Family Combo is <span className="text-[#E86A58] font-bold">not offered</span> on Deliveroo, consider adding it.</> },
  { id: 'i4', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=150&q=80', text: <>Al-Balk Pizza has <span className="text-[#E86A58] font-bold">5 active competitor promos</span> nearby.</> },
  { id: 'i5', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=150&q=80', text: <>Double Cheeseburger demand is <span className="text-[#E86A58] font-bold">up 20%</span> this week, promote it!</> },
  { id: 'i6', image: 'https://images.unsplash.com/photo-1559703248-dcaaec9fac92?auto=format&fit=crop&w=150&q=80', text: <>Ice Cream sales are <span className="text-[#E86A58] font-bold">dropping</span> due to weather, consider pausing ads.</> },
  { id: 'i7', image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=150&q=80', text: <>Grilled Chicken Sandwich is <span className="text-[#E86A58] font-bold">£0.50 underpriced</span> on Deliveroo.</> },
  { id: 'i8', image: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=150&q=80', text: <>Fries combo attach rate is <span className="text-[#E86A58] font-bold">down 15%</span> on Uber Eats.</> },
  { id: 'i9', image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=150&q=80', text: <>Spicy Pepperoni is <span className="text-[#E86A58] font-bold">trending locally</span>, push a promo today.</> },
];

const combinedRecommendations = [...pricingItems, ...promoItems];

const getPlatformColor = (platform) => {
  if (platform === 'Just Eat') return '#F36D00';
  if (platform === 'Uber Eats') return '#06C167';
  if (platform === 'Deliveroo') return '#00CCBC';
  return '#9CA3AF';
};

const RecommendationsModal = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('Insights');
  const [selectedItem, setSelectedItem] = useState(combinedRecommendations[0]);
  const [selectedInsight, setSelectedInsight] = useState(insightsData[0]);

  const tabs = ['Insights', 'Recommendations'];

  const modalContent = (
    <div className="fixed inset-0 flex flex-col items-center bg-black/40 backdrop-blur-sm p-4 md:p-8 overflow-y-auto" style={{ zIndex: 99999 }} onClick={onClose}>
      <div 
        className="bg-[#FEFDF9] rounded-3xl shadow-2xl overflow-hidden flex border border-white my-auto shrink-0 h-[700px]"
        style={{ width: '1024px', maxWidth: '95vw' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Side: Tabs and List */}
        <div className="w-[45%] flex flex-col border-r border-[rgba(0,0,0,0.05)] h-full">
          {/* Top Tabs */}
          <div className="p-8 pb-6 shrink-0">
            <h1 className="text-2xl font-bold text-gray-900 mb-6 m-0">Market Insights</h1>
            
            <div className="flex gap-6">
              {tabs.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-4 px-2 text-sm font-bold border-b-2 transition-all cursor-pointer bg-transparent border-t-0 border-l-0 border-r-0 ${
                    activeTab === tab 
                      ? 'border-[#E86A58] text-[#E86A58]' 
                      : 'border-transparent text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Left Scrollable List */}
          <div className="flex-1 overflow-hidden pb-8" style={{ paddingLeft: '32px', paddingRight: '32px' }}>
            <div className="h-full overflow-y-auto flex flex-col gap-4 pr-2">
              {activeTab === 'Recommendations' && combinedRecommendations.map(item => (
                <div 
                  key={item.id} 
                  onClick={() => setSelectedItem(item)}
                  className={`w-full bg-white rounded-2xl p-3 border-2 cursor-pointer transition-all shrink-0 flex items-center justify-between gap-4 ${selectedItem?.id === item.id ? 'border-[#E86A58] shadow-md' : 'border-transparent shadow-sm hover:shadow'}`}
                >
                  <div className="flex items-center gap-4">
                    <img src={item.image} alt={item.type === 'pricing' ? item.name : item.competitor} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 m-0 mb-1">{item.type === 'pricing' ? item.name : item.competitor}</h4>
                      <p className="text-xs font-semibold text-[#E86A58] m-0">{item.type === 'pricing' ? item.status : item.promo}</p>
                    </div>
                  </div>
                  <div className="text-xs font-bold uppercase tracking-wider text-right" style={{ color: getPlatformColor(item.platform) }}>
                    {item.platform}
                  </div>
                </div>
              ))}

              {activeTab === 'Insights' && insightsData.map(item => (
                <div 
                  key={item.id} 
                  onClick={() => setSelectedInsight(item)}
                  className={`w-full bg-white rounded-2xl p-3 border-2 cursor-pointer transition-all shrink-0 flex items-center gap-4 ${selectedInsight?.id === item.id ? 'border-[#E86A58] shadow-md' : 'border-transparent shadow-sm hover:shadow'}`}
                >
                  <img src={item.image} alt="insight" className="w-16 h-16 rounded-xl object-cover shrink-0" />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900 m-0 leading-snug line-clamp-2" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {item.text}
                    </h4>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Header and Details */}
        <div className="w-[55%] flex flex-col h-full relative">
          {/* Header Row on Right Pane */}
          <div className="p-8 pb-4 flex justify-between items-center shrink-0">
            <h2 className="text-3xl font-bold text-[#E86A58] m-0" style={{ fontFamily: 'sans-serif' }}>
              {activeTab === 'Recommendations' ? 'Action Plan' : 'Deep Dive'}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-[#E86A58] transition-colors bg-transparent border-none cursor-pointer p-0 flex items-center justify-center">
              <X size={28} />
            </button>
          </div>

          {/* Details Content */}
          <div className="flex-1 overflow-y-auto px-8 pb-8 flex flex-col">
            {activeTab === 'Recommendations' && selectedItem?.type === 'pricing' && (
              <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-6 animate-fade-in h-full">
                <div className="flex items-center gap-6">
                  <img src={selectedItem.image} alt={selectedItem.name} className="w-32 h-32 rounded-2xl object-cover shadow-sm shrink-0" />
                  <div className="flex-1">
                     <h3 className="text-2xl font-bold text-gray-900 mb-2 mt-0">{selectedItem.name}</h3>
                     <p className="text-sm text-gray-500 font-medium m-0">Baseline: {selectedItem.baseline}</p>
                  </div>
                </div>
                
                <div className="flex flex-col justify-between gap-4 bg-[#FCFAF6] p-6 rounded-xl border border-[rgba(0,0,0,0.05)] mt-auto">
                  <div>
                    <div className="text-lg font-bold mb-1" style={{ color: getPlatformColor(selectedItem.platform) }}>
                      {selectedItem.platform}: <span className="text-[#E86A58] ml-2">({selectedItem.status})</span>
                    </div>
                    <div className="text-sm text-gray-700 mt-4 leading-relaxed"><span className="font-bold text-gray-900">→ Recommendation:</span> {selectedItem.fix}</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Recommendations' && selectedItem?.type === 'promo' && (
              <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-6 animate-fade-in h-full">
                <div className="flex items-center gap-6">
                  <img src={selectedItem.image} alt={selectedItem.competitor} className="w-32 h-32 rounded-2xl object-cover shadow-sm shrink-0" />
                  <div className="flex-1">
                    <span className="text-xs font-bold text-white bg-[#E86A58] px-3 py-1 rounded-full uppercase tracking-wider inline-block mb-3">High Priority Threat</span>
                    <h3 className="text-2xl font-bold mb-0 mt-0" style={{ color: getPlatformColor(selectedItem.platform) }}>{selectedItem.platform} Alert</h3>
                  </div>
                </div>
                
                <div className="flex flex-col justify-between gap-4 bg-[#FCFAF6] p-6 rounded-xl border border-[rgba(0,0,0,0.05)] mt-auto">
                  <p className="text-sm text-gray-800 leading-relaxed m-0">
                    <span className="font-bold">{selectedItem.competitor}</span> within your delivery radius just launched a <span className="font-bold text-[#E86A58]">{selectedItem.promo}</span> promotion, threatening your current local search rank position.
                  </p>

                  <div className="mt-2 border-t border-[rgba(0,0,0,0.05)] pt-4">
                    <p className="text-sm text-gray-800 leading-relaxed m-0">
                      <span className="font-bold text-gray-900">Suggestion:</span> Defend your visibility by running a matching basket-incentive promo on <span style={{ color: getPlatformColor(selectedItem.platform), fontWeight: 'bold' }}>{selectedItem.platform}</span>.
                    </p>
                  </div>

                  <div className="flex justify-end pt-2 mt-2">
                     <button className="px-8 py-3 bg-[#E86A58] text-white text-sm font-bold rounded-xl hover:opacity-90 transition-opacity border-none cursor-pointer shadow-md">
                       Launch Counter-Promo
                     </button>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'Insights' && selectedInsight && (
              <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-6 animate-fade-in h-full">
                <div className="flex items-center gap-6">
                  <img src={selectedInsight.image} alt="insight" className="w-32 h-32 rounded-2xl object-cover shadow-sm shrink-0" />
                  <div className="flex-1">
                    <span className="text-xs font-bold text-white bg-[#E86A58] px-3 py-1 rounded-full uppercase tracking-wider inline-block mb-3">AI Market Insight</span>
                    <h3 className="text-2xl font-bold text-gray-900 leading-tight mt-0">
                      {selectedInsight.text}
                    </h3>
                  </div>
                </div>
                
                <div className="flex flex-col gap-4 bg-[#FCFAF6] p-6 rounded-xl border border-[rgba(0,0,0,0.05)] mt-auto">
                   <p className="text-gray-700 m-0 leading-relaxed font-medium text-sm">
                     This insight was generated in real-time by analyzing local competitor data, pricing models, and current demand patterns within your immediate delivery radius.
                   </p>
                   <div className="flex justify-end mt-4">
                     <button className="px-8 py-3 bg-[#E86A58] text-white text-sm font-bold rounded-xl hover:opacity-90 transition-opacity border-none cursor-pointer shadow-md">
                       Take Action
                     </button>
                   </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default RecommendationsModal;
