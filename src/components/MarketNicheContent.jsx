import React, { useState } from 'react';
import { Target, Plus, X, Search, Diamond, Navigation, TrendingUp } from 'lucide-react';

const mockNiches = [
  {
    id: 101,
    type: 'niche',
    name: 'Handmade Cheesecake',
    category: 'Desserts',
    saturation: 3,
    totalRivals: 25,
    avgPrice: '7.50',
    lowPrice: '6.50',
    highPrice: '8.50',
    image: 'https://images.unsplash.com/photo-1524351199678-941a58a3df50?auto=format&fit=crop&w=500&q=80',
    rivals: [
      { name: 'Artisan Bakery', price: '8.50', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=50&q=80' },
      { name: 'Cafe Deluxe', price: '7.50', image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=50&q=80' },
      { name: 'Bistro 22', price: '6.50', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=50&q=80' }
    ]
  },
  {
    id: 102,
    type: 'niche',
    name: 'Truffle Parmesan Fries',
    category: 'Sides',
    saturation: 2,
    totalRivals: 25,
    avgPrice: '6.20',
    lowPrice: '5.90',
    highPrice: '6.50',
    image: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=500&q=80',
    rivals: [
      { name: 'Premium Burger Co', price: '6.50', image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=50&q=80' },
      { name: 'Steakhouse Grid', price: '5.90', image: 'https://images.unsplash.com/photo-1544148103-0773bf10d330?auto=format&fit=crop&w=50&q=80' }
    ]
  }
];

const MarketNicheContent = () => {
  const [activeItem, setActiveItem] = useState(null);
  const [addedItems, setAddedItems] = useState([]);
  
  const currentNiches = mockNiches.filter(item => !addedItems.includes(item.id));

  const handleAddMenu = (item) => {
    setAddedItems([...addedItems, item.id]);
    setActiveItem(null);
  };

  return (
    <div style={{ padding: '0 1rem', width: '100%', maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontFamily: 'Playfair Display, serif', fontWeight: 700, color: '#111', margin: '0 0 0.5rem 0' }}>Market Niche</h1>
          <p style={{ color: '#6B7280', fontSize: '1.05rem', margin: 0, fontWeight: 500 }}>Scarcity intelligence and exclusivity opportunities.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(255,255,255,0.7)', borderRadius: '9999px', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#4B5563' }}>Menu Variety Score:</span>
            <span style={{ fontSize: '1rem', fontWeight: 700, color: '#10B981' }}>{80 + (addedItems.length * 5)}/100</span>
          </div>
        </div>
      </div>

      {/* Market Niche Card */}
      <div style={{ 
        background: 'rgba(255, 255, 255, 0.65)', 
        backdropFilter: 'blur(16px)', 
        border: '1px solid rgba(255, 255, 255, 0.4)', 
        borderRadius: '24px', 
        padding: '2.5rem', 
        boxShadow: '0 10px 40px -10px rgba(139, 92, 246, 0.15)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '30%', height: '50%', background: 'radial-gradient(circle, rgba(167,139,250,0.2) 0%, rgba(255,255,255,0) 70%)', filter: 'blur(40px)', zIndex: 0, pointerEvents: 'none' }}></div>
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ background: '#F5F3FF', color: '#8B5CF6', padding: '0.75rem', borderRadius: '12px' }}>
              <Diamond size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'Playfair Display, serif', margin: '0 0 0.25rem 0', color: '#111' }}>Exclusivity Auditor</h2>
              <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>Scarcity Intelligence — Premium Underserved Opportunities</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {currentNiches.length === 0 ? (
               <div style={{ padding: '3rem', textAlign: 'center', background: 'rgba(255,255,255,0.5)', borderRadius: '16px' }}>
                <TrendingUp size={32} color="#8B5CF6" style={{ margin: '0 auto 1rem auto' }} />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#111', margin: '0 0 0.5rem 0' }}>All niches captured!</h3>
                <p style={{ color: '#6B7280', margin: 0 }}>You are dominating all high-value gaps in your local market.</p>
              </div>
            ) : currentNiches.map(item => (
              <div key={item.id} style={{ 
                background: '#fff', 
                borderRadius: '16px', 
                padding: '1.5rem 2rem', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                border: '1px solid rgba(0,0,0,0.03)',
                boxShadow: '0 4px 15px rgba(0,0,0,0.02)',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.05)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.02)'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                  <div style={{ width: '60px', height: '60px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0 }}>
                    <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '1.25rem', fontFamily: 'Playfair Display, serif', fontWeight: 700, color: '#111', marginBottom: '0.25rem' }}>{item.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.875rem' }}>
                      <span style={{ color: '#8B5CF6', fontWeight: 600, background: '#F5F3FF', padding: '0.25rem 0.5rem', borderRadius: '6px' }}>High Differentiation</span>
                      <span style={{ color: '#6B7280' }}>Only {item.saturation}/{item.totalRivals} local rivals sell this</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '3rem' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#6B7280', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px', marginBottom: '0.25rem' }}>Avg Niche Price</div>
                    <div style={{ fontSize: '1.5rem', fontFamily: 'Playfair Display, serif', fontWeight: 700, color: '#8B5CF6' }}>£{item.avgPrice}</div>
                  </div>
                  <button 
                    onClick={() => setActiveItem(item)}
                    style={{ background: '#111', color: '#fff', padding: '0.875rem 1.5rem', borderRadius: '9999px', fontSize: '0.9rem', fontWeight: 600, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'background 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#333'}
                    onMouseLeave={e => e.currentTarget.style.background = '#111'}
                  >
                    <Search size={16} /> Analyze Opportunity
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Explore Potential Modal */}
      {activeItem && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }} onClick={() => setActiveItem(null)}>
          <div style={{ background: '#fff', borderRadius: '24px', width: '95%', maxWidth: '1400px', height: '640px', display: 'flex', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', animation: 'modalFadeIn 0.3s ease-out' }} onClick={e => e.stopPropagation()}>
            
            {/* Left Column - The Potential */}
            <div style={{ width: '32%', background: '#F8FAFC', padding: '3rem', display: 'flex', flexDirection: 'column', gap: '2rem', borderRight: '1px solid rgba(0,0,0,0.05)' }}>
              <div style={{ position: 'relative' }}>
                <img src={activeItem.image} alt={activeItem.name} style={{ width: '100%', height: '280px', objectFit: 'cover', borderRadius: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
              </div>
              
              <div>
                <h2 style={{ fontSize: '2.25rem', fontFamily: 'Playfair Display, serif', fontWeight: 700, color: '#111', margin: '0 0 2rem 0', lineHeight: 1.2 }}>{activeItem.name}</h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#6B7280', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px', marginBottom: '0.5rem' }}>Average Niche Price</div>
                    <div style={{ fontSize: '2.5rem', fontFamily: 'Playfair Display, serif', fontWeight: 700, color: '#8B5CF6' }}>£{activeItem.avgPrice}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#6B7280', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px', marginBottom: '0.5rem' }}>Projected Demand</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 600, color: '#111' }}>High (Underserved Market)</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Center Column - The Rivals */}
            <div style={{ width: '40%', padding: '3rem', display: 'flex', flexDirection: 'column', borderRight: '1px solid rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111', fontFamily: 'Playfair Display, serif', marginBottom: '0.25rem' }}>Niche Rivals</div>
              <div style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '2.5rem' }}>The few competitors operating in this space</div>

              <div style={{ marginBottom: '2.5rem' }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#4B5563', marginBottom: '2rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Pricing Landscape</div>
                <div style={{ position: 'relative', height: '12px', background: 'linear-gradient(90deg, #DDD6FE, #8B5CF6, #4C1D95)', borderRadius: '6px', margin: '0 1rem' }}>
                  <div style={{ position: 'absolute', left: '0', top: '100%', marginTop: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#6B7280' }}>£{activeItem.lowPrice}</div>
                  <div style={{ position: 'absolute', right: '0', top: '100%', marginTop: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#6B7280' }}>£{activeItem.highPrice}</div>
                </div>
              </div>

              <div style={{ background: '#F8FAFC', borderRadius: '16px', padding: '1.5rem', border: '1px solid rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1, overflowY: 'auto' }}>
                {activeItem.rivals.map((rival, idx) => (
                  <div key={idx} style={{ background: '#fff', padding: '1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <img src={rival.image} alt={rival.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                      <span style={{ fontSize: '1rem', fontWeight: 600, color: '#111' }}>{rival.name}</span>
                    </div>
                    <span style={{ fontSize: '1.125rem', fontFamily: 'Playfair Display, serif', color: '#6B7280', fontWeight: 700 }}>£{rival.price}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column - Strategy Guide */}
            <div style={{ width: '28%', padding: '3rem', display: 'flex', flexDirection: 'column', background: '#fff' }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                <button onClick={() => setActiveItem(null)} style={{ background: '#F3F4F6', border: 'none', cursor: 'pointer', color: '#4B5563', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#E5E7EB'} onMouseLeave={e => e.currentTarget.style.background = '#F3F4F6'}><X size={20} /></button>
              </div>

              <div style={{ marginTop: 'auto', marginBottom: 'auto', background: 'rgba(139, 92, 246, 0.04)', border: '1px solid rgba(139, 92, 246, 0.15)', borderRadius: '20px', padding: '2.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#6D28D9', fontWeight: 700, fontSize: '1.125rem' }}>
                  <Navigation size={20} /> High-Differentiation Opportunity
                </div>
                <p style={{ fontSize: '1.05rem', color: '#4C1D95', margin: 0, lineHeight: 1.6 }}>
                  Only <span style={{ fontWeight: 700 }}>{Math.round((activeItem.saturation / activeItem.totalRivals) * 100)}% of local rivals</span> offer {activeItem.name}. By adding this to your menu at £{activeItem.avgPrice}, you can capture the 'Premium {activeItem.category}' niche which is currently underserved in a 5-mile radius.
                </p>
                <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '1rem' }}>
                  <button 
                    onClick={() => handleAddMenu(activeItem)}
                    style={{ background: '#8B5CF6', color: '#fff', padding: '1rem 2rem', borderRadius: '9999px', fontSize: '0.9rem', fontWeight: 600, border: 'none', cursor: 'pointer', boxShadow: '0 10px 25px rgba(139, 92, 246, 0.3)', transition: 'transform 0.2s', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <Plus size={18} /> One-Click Draft
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default MarketNicheContent;
