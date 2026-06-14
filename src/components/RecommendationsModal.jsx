import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const pricingItems = [
  { id: 1, name: "Margherita Pizza", image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=150&q=80", baseline: "£13.50", status: "-£1.00 Underpriced", platform: "Just Eat", fix: "Match local benchmark." },
  { id: 2, name: "Vegan Burger", image: "https://images.unsplash.com/photo-1594212580737-67eb1c2b53df?auto=format&fit=crop&w=150&q=80", baseline: "£9.50", status: "+£1.50 Overpriced", platform: "Uber Eats", fix: "Lower price to increase conversion." },
  { id: 3, name: "Family Combo", image: "https://images.unsplash.com/photo-1544982503-9f984c14501a?auto=format&fit=crop&w=150&q=80", baseline: "£24.00", status: "Not Offered", platform: "Deliveroo", fix: "Add item to Deliveroo menu." }
];

const promoItems = [
  { id: 1, competitor: "Pizza Express", image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=150&q=80", promo: "Free Delivery over £15", platform: "Deliveroo" },
  { id: 2, competitor: "Burger King", image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=150&q=80", promo: "20% Off Entire Menu", platform: "Uber Eats" },
  { id: 3, competitor: "Local Pasta", image: "https://images.unsplash.com/photo-1621996316564-6fa3fb3c6319?auto=format&fit=crop&w=150&q=80", promo: "Buy 1 Get 1 Free", platform: "Just Eat" }
];

const getPlatformColor = (platform) => {
  if (platform === 'Just Eat') return '#F36D00';
  if (platform === 'Uber Eats') return '#06C167';
  if (platform === 'Deliveroo') return '#00CCBC';
  return '#9CA3AF';
};

const RecommendationsModal = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('Pricing');
  const [selectedPricing, setSelectedPricing] = useState(pricingItems[0]);
  const [selectedPromo, setSelectedPromo] = useState(promoItems[0]);

  const tabs = ['Pricing', 'Promos', '+ Future Feature'];

  const modalContent = (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" style={{ zIndex: 99999 }} onClick={onClose}>
      <div 
        className="bg-[#FDFBF7] rounded-3xl shadow-2xl overflow-hidden w-full max-w-5xl flex border border-white h-[700px] max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Side: Tabs and List */}
        <div className="w-[45%] flex flex-col border-r border-[rgba(0,0,0,0.05)] h-full">
          {/* Top Tabs */}
          <div className="p-8 pb-6 shrink-0">
            <div className="flex gap-6">
              {tabs.map(tab => (
                <button
                  key={tab}
                  onClick={() => tab !== '+ Future Feature' && setActiveTab(tab)}
                  className={`pb-4 px-2 text-sm font-bold border-b-2 transition-all cursor-pointer bg-transparent border-t-0 border-l-0 border-r-0 ${
                    activeTab === tab 
                      ? 'border-[#E86A58] text-[#E86A58]' 
                      : tab === '+ Future Feature'
                        ? 'border-transparent text-gray-400 cursor-not-allowed opacity-60'
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
              {activeTab === 'Pricing' && pricingItems.map(item => (
                <div 
                  key={item.id} 
                  onClick={() => setSelectedPricing(item)}
                  className={`w-full bg-white rounded-2xl p-3 border-2 cursor-pointer transition-all shrink-0 flex items-center justify-between gap-4 ${selectedPricing?.id === item.id ? 'border-[#E86A58] shadow-md' : 'border-transparent shadow-sm hover:shadow'}`}
                >
                  <div className="flex items-center gap-4">
                    <img src={item.image} alt={item.name} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 m-0 mb-1">{item.name}</h4>
                      <p className="text-xs font-semibold text-[#E86A58] m-0">{item.status}</p>
                    </div>
                  </div>
                  <div className="text-xs font-bold uppercase tracking-wider text-right" style={{ color: getPlatformColor(item.platform) }}>
                    {item.platform}
                  </div>
                </div>
              ))}

              {activeTab === 'Promos' && promoItems.map(item => (
                <div 
                  key={item.id} 
                  onClick={() => setSelectedPromo(item)}
                  className={`w-full bg-white rounded-2xl p-3 border-2 cursor-pointer transition-all shrink-0 flex items-center justify-between gap-4 ${selectedPromo?.id === item.id ? 'border-[#E86A58] shadow-md' : 'border-transparent shadow-sm hover:shadow'}`}
                >
                  <div className="flex items-center gap-4">
                    <img src={item.image} alt={item.competitor} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 m-0 mb-1">{item.competitor}</h4>
                      <p className="text-xs font-semibold text-[#E86A58] m-0">{item.promo}</p>
                    </div>
                  </div>
                  <div className="text-xs font-bold uppercase tracking-wider text-right" style={{ color: getPlatformColor(item.platform) }}>
                    {item.platform}
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
            <h2 className="text-3xl font-bold text-[#E86A58] m-0" style={{ fontFamily: 'sans-serif' }}>Recommendations</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-[#E86A58] transition-colors bg-transparent border-none cursor-pointer p-0 flex items-center justify-center">
              <X size={28} />
            </button>
          </div>

          {/* Details Content */}
          <div className="flex-1 overflow-y-auto px-8 pb-8 flex flex-col">
            {activeTab === 'Pricing' && selectedPricing && (
              <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-6 animate-fade-in h-full">
                <div className="flex items-center gap-6">
                  <img src={selectedPricing.image} alt={selectedPricing.name} className="w-32 h-32 rounded-2xl object-cover shadow-sm shrink-0" />
                  <div className="flex-1">
                     <h3 className="text-2xl font-bold text-gray-900 mb-2 mt-0">{selectedPricing.name}</h3>
                     <p className="text-sm text-gray-500 font-medium m-0">Baseline: {selectedPricing.baseline}</p>
                  </div>
                </div>
                
                <div className="flex flex-col justify-between gap-4 bg-[#FAF8F4] p-6 rounded-xl border border-[rgba(0,0,0,0.05)] mt-auto">
                  <div>
                    <div className="text-lg font-bold mb-1" style={{ color: getPlatformColor(selectedPricing.platform) }}>
                      {selectedPricing.platform}: <span className="text-[#E86A58] ml-2">({selectedPricing.status})</span>
                    </div>
                    <div className="text-sm text-gray-700 mt-4 leading-relaxed"><span className="font-bold text-gray-900">→ Recommendation:</span> {selectedPricing.fix}</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Promos' && selectedPromo && (
              <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-6 animate-fade-in h-full">
                <div className="flex items-center gap-6">
                  <img src={selectedPromo.image} alt={selectedPromo.competitor} className="w-32 h-32 rounded-2xl object-cover shadow-sm shrink-0" />
                  <div className="flex-1">
                    <span className="text-xs font-bold text-white bg-[#E86A58] px-3 py-1 rounded-full uppercase tracking-wider inline-block mb-3">High Priority Threat</span>
                    <h3 className="text-2xl font-bold mb-0 mt-0" style={{ color: getPlatformColor(selectedPromo.platform) }}>{selectedPromo.platform} Alert</h3>
                  </div>
                </div>
                
                <div className="flex flex-col justify-between gap-4 bg-[#FAF8F4] p-6 rounded-xl border border-[rgba(0,0,0,0.05)] mt-auto">
                  <p className="text-sm text-gray-800 leading-relaxed m-0">
                    <span className="font-bold">{selectedPromo.competitor}</span> within your delivery radius just launched a <span className="font-bold text-[#E86A58]">{selectedPromo.promo}</span> promotion, threatening your current local search rank position.
                  </p>

                  <div className="mt-2 border-t border-[rgba(0,0,0,0.05)] pt-4">
                    <p className="text-sm text-gray-800 leading-relaxed m-0">
                      <span className="font-bold text-gray-900">Suggestion:</span> Defend your visibility by running a matching basket-incentive promo on <span style={{ color: getPlatformColor(selectedPromo.platform), fontWeight: 'bold' }}>{selectedPromo.platform}</span>.
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
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default RecommendationsModal;
