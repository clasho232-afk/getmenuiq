import React, { useState } from 'react';
import { ArrowRight, Sparkles, X, MapPin, Target, Activity, Zap } from 'lucide-react';

const PromoTrackerModal = ({ isOpen, onClose, livePromos = [] }) => {
  const [platformFilter, setPlatformFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('ilford');
  const [viewMode, setViewMode] = useState('list'); // 'list', 'promo_detail', 'strategy_setup', 'strategy_result'
  const [selectedPromoDetail, setSelectedPromoDetail] = useState(null);
  
  // Strategy setup state
  const [stratLoc, setStratLoc] = useState('ilford');
  const [stratPlat, setStratPlat] = useState('all');

  if (!isOpen) return null;

  const staticPromos = [
    { restaurant: 'Domino\'s Ilford', promo: '25% off selected pizzas', type: 'Discount', active: 'Active', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=64&q=80', watchlisted: true, platform: 'ubereats', location: 'ilford', strategy: 'Your margin on pizzas is 65%. Instead of matching 25% off, offer a free Garlic Bread (Cost: £0.80) to maintain higher overall profitability while matching perceived value.' },
    { restaurant: 'Pizza Palace Barking', promo: 'Buy 1 Get 1 Free', type: 'BOGO', active: 'Active', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=64&q=80', watchlisted: true, platform: 'deliveroo', location: 'neighborhood', strategy: 'Pizza Palace runs this BOGO every Friday. Do not engage; focus your ad spend on Saturday when their promo ends and they lose algorithm rank.' },
    { restaurant: 'Al-Amin Pizza', promo: 'Free Delivery', type: 'Delivery', active: 'Active', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=64&q=80', platform: 'justeats', location: 'ilford', watchlisted: false },
    { restaurant: 'Fire Crust', promo: 'Spend £20 Save £5', type: 'Threshold', active: 'Active', image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=64&q=80', platform: 'ubereats', location: 'neighborhood', watchlisted: false },
    { restaurant: 'Burger Boss Ilford', promo: '20% off entire menu', type: 'Discount', active: 'Active', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=64&q=80', platform: 'deliveroo', location: 'ilford', watchlisted: false },
    { restaurant: 'Wok Master', promo: 'Free Spring Rolls', type: 'Free Item', active: 'Active', image: 'https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&w=64&q=80', platform: 'ubereats', location: 'ilford', watchlisted: false }
  ];

  const locFiltered = staticPromos.filter(p => locationFilter === 'neighborhood' || p.location === 'ilford');
  
  const counts = {
    all: locFiltered.length,
    ubereats: locFiltered.filter(p => p.platform === 'ubereats').length,
    deliveroo: locFiltered.filter(p => p.platform === 'deliveroo').length,
    justeats: locFiltered.filter(p => p.platform === 'justeats').length,
  };

  const displayPromos = locFiltered.filter(p => platformFilter === 'all' || p.platform === platformFilter);

  const handleClose = () => {
    setViewMode('list');
    setSelectedPromoDetail(null);
    onClose();
  };

  const openPromoDetail = (promo) => {
    setSelectedPromoDetail(promo);
    setViewMode('promo_detail');
  };

  const PlatformIcon = ({ platform }) => {
    if (platform === 'ubereats') return <div title="UberEats" style={{ width: 16, height: 16, borderRadius: '50%', background: '#06C167', color: '#fff', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>U</div>;
    if (platform === 'deliveroo') return <div title="Deliveroo" style={{ width: 16, height: 16, borderRadius: '50%', background: '#00CCBC', color: '#fff', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>D</div>;
    if (platform === 'justeats') return <div title="JustEats" style={{ width: 16, height: 16, borderRadius: '50%', background: '#FF8000', color: '#fff', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>J</div>;
    if (platform === 'all') return <div title="All Platforms" style={{ width: 16, height: 16, borderRadius: '50%', background: '#111', color: '#fff', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>A</div>;
    return null;
  };

  const renderStrategyResult = () => {
    const resultPromos = staticPromos.filter(p => (stratLoc === 'neighborhood' || p.location === 'ilford') && (stratPlat === 'all' || p.platform === stratPlat));
    const resultCount = resultPromos.length;

    let recommendation = '';
    if (stratLoc === 'ilford' && stratPlat === 'ubereats') {
      recommendation = `Analyzing the data for Ilford on UberEats, we detected ${resultCount} active promotions. The market is highly saturated with aggressive pizza discounts right now. We recommend a "Free Item with £20 Spend" to maintain basket size while offering perceived value. Do not attempt to match 25% off offers as it will heavily erode your margin.`;
    } else if (stratLoc === 'neighborhood' && stratPlat === 'deliveroo') {
      recommendation = `Analyzing the data for the wider neighborhood on Deliveroo, we detected ${resultCount} active promotions. There is a strong trend of BOGO (Buy One Get One) offers from major competitors. Counter this by running targeted sponsored ads during off-peak hours (2PM-5PM) rather than matching BOGO, protecting your margins while capturing steady volume.`;
    } else {
      recommendation = `Analyzing the data for ${stratLoc === 'ilford' ? 'Ilford' : 'the Neighborhood'} across ${stratPlat === 'all' ? 'all platforms' : stratPlat}, we detected ${resultCount} active promotion(s). To counter this effectively without eroding margins, we recommend launching a highly targeted "Spend £25, Save £5" threshold campaign to capture high-value basket sizes.`;
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', height: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexShrink: 0 }}>
          <button onClick={() => setViewMode('strategy_setup')} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600, color: '#4B5563', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>
            <ArrowRight size={16} style={{ transform: 'rotate(180deg)' }} /> Back
          </button>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111', margin: 0 }}>Strategy Recommendation</h3>
          <button onClick={handleClose} style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid #E5E7EB', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
            <X size={18} color="#111" />
          </button>
        </div>

        <div className="custom-modal-scroll" style={{ flex: 1, overflowY: 'auto', background: '#fff', borderRadius: '16px', padding: '2rem', border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
            <div style={{ background: '#F9FAFB', padding: '12px 24px', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, border: '1px solid #E5E7EB' }}>
              <span style={{ fontSize: '11px', color: '#6B7280', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Area</span>
              <span style={{ fontSize: '16px', color: '#111', fontWeight: 'bold', textTransform: 'capitalize' }}>{stratLoc}</span>
            </div>
            <div style={{ background: '#F9FAFB', padding: '12px 24px', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, border: '1px solid #E5E7EB' }}>
              <span style={{ fontSize: '11px', color: '#6B7280', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Platform</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <PlatformIcon platform={stratPlat} />
                <span style={{ fontSize: '16px', color: '#111', fontWeight: 'bold', textTransform: 'capitalize' }}>{stratPlat}</span>
              </div>
            </div>
            <div style={{ background: '#FFF1F2', padding: '12px 24px', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, border: '1px solid #FECACA' }}>
              <span style={{ fontSize: '11px', color: '#991B1B', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Promotions</span>
              <span style={{ fontSize: '16px', color: '#E85D4E', fontWeight: 'bold' }}>{resultCount} Active</span>
            </div>
          </div>

          <div style={{ width: '100%', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', textAlign: 'left' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem', textAlign: 'left' }}>Targeted Promotions</h3>
            {resultPromos.length > 0 ? resultPromos.map((promo, i) => (
              <div 
                key={i} 
                style={{ background: '#fff', borderRadius: '12px', padding: '0.75rem 1rem', border: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <img src={promo.image} alt={promo.restaurant} style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #F3F4F6', flexShrink: 0 }} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <div style={{ fontWeight: 'bold', color: '#111', fontSize: '15px', fontFamily: 'sans-serif', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {promo.restaurant}
                      <PlatformIcon platform={promo.platform} />
                      {promo.watchlisted && <span style={{ background: '#FEF3C7', color: '#D97706', fontSize: '9px', padding: '2px 4px', borderRadius: '4px', fontWeight: 800 }}>WATCHLIST</span>}
                    </div>
                    <div style={{ fontSize: '13px', color: '#6B7280', fontWeight: 500, fontFamily: 'sans-serif' }}>{promo.promo}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', flexShrink: 0 }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, background: '#F3F4F6', color: '#4B5563', padding: '4px 10px', borderRadius: '6px', fontFamily: 'sans-serif' }}>
                    {promo.type}
                  </span>
                  <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#E85D4E', fontFamily: 'sans-serif' }}>{promo.active}</span>
                </div>
              </div>
            )) : (
              <div style={{ textAlign: 'center', padding: '1rem', color: '#6B7280', fontSize: '14px', fontFamily: 'sans-serif', border: '1px dashed #E5E7EB', borderRadius: '12px' }}>
                No active promotions match this criteria.
              </div>
            )}
          </div>
          
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111', margin: '0 0 1rem 0' }}>Your Action:</h2>
          
          <div style={{ background: '#F9FAFB', padding: '1.5rem', borderRadius: '16px', border: '1px solid #E5E7EB', width: '100%', textAlign: 'left' }}>
            <p style={{ color: '#374151', lineHeight: 1.7, fontSize: '15px', margin: 0 }}>
              {recommendation}
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderStrategySetup = () => (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexShrink: 0 }}>
        <button onClick={() => setViewMode('list')} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600, color: '#4B5563', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>
          <ArrowRight size={16} style={{ transform: 'rotate(180deg)' }} /> Back to Promos
        </button>
        <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111', margin: 0 }}>Strategy Builder</h3>
        <button onClick={handleClose} style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid #E5E7EB', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
          <X size={18} color="#111" />
        </button>
      </div>

      <div className="custom-modal-scroll" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '2rem', paddingRight: '8px' }}>
        <div>
          <h4 style={{ fontSize: '16px', fontWeight: 'bold', color: '#111', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}><MapPin size={18} /> Select Target Area</h4>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={() => setStratLoc('ilford')} style={{ flex: 1, padding: '16px', borderRadius: '16px', border: stratLoc === 'ilford' ? '2px solid #111' : '1px solid #E5E7EB', background: '#fff', fontWeight: 600, color: '#111', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px' }}>Ilford</span>
              <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: 'normal' }}>Local vicinity only</span>
            </button>
            <button onClick={() => setStratLoc('neighborhood')} style={{ flex: 1, padding: '16px', borderRadius: '16px', border: stratLoc === 'neighborhood' ? '2px solid #111' : '1px solid #E5E7EB', background: '#fff', fontWeight: 600, color: '#111', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px' }}>Neighborhood</span>
              <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: 'normal' }}>Ilford + surrounding areas</span>
            </button>
          </div>
        </div>

        <div>
          <h4 style={{ fontSize: '16px', fontWeight: 'bold', color: '#111', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}><Target size={18} /> Select Platform</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            {['all', 'ubereats', 'deliveroo', 'justeats'].map(plat => (
              <button key={plat} onClick={() => setStratPlat(plat)} style={{ padding: '16px', borderRadius: '16px', border: stratPlat === plat ? '2px solid #111' : '1px solid #E5E7EB', background: '#fff', fontWeight: 600, color: '#111', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <PlatformIcon platform={plat} />
                <span style={{ fontSize: '14px', textTransform: 'capitalize' }}>{plat}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ marginTop: '1.5rem', flexShrink: 0 }}>
        <button onClick={() => setViewMode('strategy_result')} style={{ width: '100%', padding: '16px', borderRadius: '9999px', background: '#E85D4E', color: '#fff', fontWeight: 'bold', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '16px', boxShadow: '0 4px 12px rgba(232, 93, 78, 0.3)' }}>
          <Sparkles size={20} /> Analyze
        </button>
      </div>
    </div>
  );

  const renderPromoDetail = () => (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexShrink: 0 }}>
        <button onClick={() => setViewMode('list')} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600, color: '#4B5563', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>
          <ArrowRight size={16} style={{ transform: 'rotate(180deg)' }} /> Back
        </button>
        <button onClick={handleClose} style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid #E5E7EB', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', padding: 0 }}>
          <X size={18} color="#6B7280" />
        </button>
      </div>

      <div className="custom-modal-scroll" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center', textAlign: 'center', overflowY: 'auto', paddingBottom: '1rem', minHeight: 0 }}>
        <img src={selectedPromoDetail.image} alt={selectedPromoDetail.restaurant} style={{ width: '100%', height: '192px', borderRadius: '20px', objectFit: 'cover', border: '1px solid #E5E7EB', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', flexShrink: 0 }} />
        <div style={{ width: '100%', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '8px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111', margin: 0, fontFamily: 'sans-serif' }}>{selectedPromoDetail.restaurant}</h2>
            <PlatformIcon platform={selectedPromoDetail.platform} />
          </div>
          <div style={{ display: 'inline-block', background: '#F3F4F6', padding: '4px 12px', borderRadius: '9999px', fontSize: '14px', fontWeight: 600, color: '#4B5563', marginBottom: '1rem', fontFamily: 'sans-serif' }}>
            {selectedPromoDetail.type}
          </div>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#E85D4E', marginBottom: '1rem', margin: 0, fontFamily: 'sans-serif' }}>{selectedPromoDetail.promo}</h3>
          <p style={{ color: '#4B5563', lineHeight: 1.6, background: '#fff', padding: '1.5rem', borderRadius: '16px', border: '1px solid #E5E7EB', textAlign: 'left', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', margin: 0, fontFamily: 'sans-serif' }}>
            This promotion is currently active in the {selectedPromoDetail.location === 'ilford' ? 'Ilford area' : 'neighborhood'}.
          </p>
          {selectedPromoDetail.watchlisted && selectedPromoDetail.strategy && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '16px', padding: '1.5rem', marginTop: '1rem', textAlign: 'left' }}>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#DC2626', marginBottom: '8px', letterSpacing: '0.05em' }}>COMPETITOR INTEL</div>
              <p style={{ color: '#991B1B', margin: 0, fontSize: '14px', lineHeight: 1.5, fontWeight: 500 }}>{selectedPromoDetail.strategy}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', boxSizing: 'border-box' }}>
      
      {/* Increased max-width to 800px to match requested proportions */}
      <div style={{ position: 'relative', width: '100%', maxWidth: '800px', height: '85vh', background: '#F8F7F4', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', padding: '2rem', display: 'flex', flexDirection: 'column', border: '1px solid rgba(255,255,255,0.5)', boxSizing: 'border-box' }}>
        
        <style>{`
          .custom-modal-scroll::-webkit-scrollbar { width: 4px; }
          .custom-modal-scroll::-webkit-scrollbar-track { background: transparent; }
          .custom-modal-scroll::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 4px; }
        `}</style>

        {viewMode === 'strategy_setup' && renderStrategySetup()}
        {viewMode === 'strategy_result' && renderStrategyResult()}
        {viewMode === 'promo_detail' && renderPromoDetail()}

        {viewMode === 'list' && (
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', height: '100%' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexShrink: 0 }}>
              <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111', fontFamily: 'sans-serif', letterSpacing: '-0.025em', margin: 0 }}>Active Competitor Promotions</h3>
              <button 
                onClick={handleClose} 
                style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid #E5E7EB', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', padding: 0 }}
              >
                <X size={18} color="#111" />
              </button>
            </div>
            
            {/* Row 1: Platform Metrics */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '1rem', flexWrap: 'wrap', flexShrink: 0 }}>
              <button onClick={() => setPlatformFilter('all')} style={{ padding: '8px 16px', borderRadius: '9999px', border: platformFilter === 'all' ? '1px solid #111' : '1px solid #E5E7EB', background: platformFilter === 'all' ? '#111' : '#fff', color: platformFilter === 'all' ? '#fff' : '#4B5563', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                All <span style={{ background: platformFilter === 'all' ? 'rgba(255,255,255,0.2)' : '#F3F4F6', color: platformFilter === 'all' ? '#fff' : '#111', padding: '2px 8px', borderRadius: '9999px', fontSize: '12px' }}>{counts.all}</span>
              </button>
              <button onClick={() => setPlatformFilter('ubereats')} style={{ padding: '8px 16px', borderRadius: '9999px', border: platformFilter === 'ubereats' ? '1px solid #111' : '1px solid #E5E7EB', background: platformFilter === 'ubereats' ? '#111' : '#fff', color: platformFilter === 'ubereats' ? '#fff' : '#4B5563', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                <PlatformIcon platform="ubereats" /> UberEats <span style={{ background: platformFilter === 'ubereats' ? 'rgba(255,255,255,0.2)' : '#F3F4F6', color: platformFilter === 'ubereats' ? '#fff' : '#111', padding: '2px 8px', borderRadius: '9999px', fontSize: '12px' }}>{counts.ubereats}</span>
              </button>
              <button onClick={() => setPlatformFilter('deliveroo')} style={{ padding: '8px 16px', borderRadius: '9999px', border: platformFilter === 'deliveroo' ? '1px solid #111' : '1px solid #E5E7EB', background: platformFilter === 'deliveroo' ? '#111' : '#fff', color: platformFilter === 'deliveroo' ? '#fff' : '#4B5563', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                <PlatformIcon platform="deliveroo" /> Deliveroo <span style={{ background: platformFilter === 'deliveroo' ? 'rgba(255,255,255,0.2)' : '#F3F4F6', color: platformFilter === 'deliveroo' ? '#fff' : '#111', padding: '2px 8px', borderRadius: '9999px', fontSize: '12px' }}>{counts.deliveroo}</span>
              </button>
              <button onClick={() => setPlatformFilter('justeats')} style={{ padding: '8px 16px', borderRadius: '9999px', border: platformFilter === 'justeats' ? '1px solid #111' : '1px solid #E5E7EB', background: platformFilter === 'justeats' ? '#111' : '#fff', color: platformFilter === 'justeats' ? '#fff' : '#4B5563', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                <PlatformIcon platform="justeats" /> JustEats <span style={{ background: platformFilter === 'justeats' ? 'rgba(255,255,255,0.2)' : '#F3F4F6', color: platformFilter === 'justeats' ? '#fff' : '#111', padding: '2px 8px', borderRadius: '9999px', fontSize: '12px' }}>{counts.justeats}</span>
              </button>
            </div>

            {/* Row 2: Location Toggle */}
            <div style={{ marginBottom: '1.5rem', flexShrink: 0 }}>
              <div style={{ display: 'inline-flex', background: '#EBEAE6', padding: '4px', borderRadius: '9999px' }}>
                <button 
                  onClick={() => setLocationFilter('ilford')}
                  style={{ padding: '8px 32px', borderRadius: '9999px', fontSize: '14px', fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.2s', background: locationFilter === 'ilford' ? '#fff' : 'transparent', color: locationFilter === 'ilford' ? '#111' : '#6B7280', boxShadow: locationFilter === 'ilford' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none' }}
                >
                  Ilford
                </button>
                <button 
                  onClick={() => setLocationFilter('neighborhood')}
                  style={{ padding: '8px 32px', borderRadius: '9999px', fontSize: '14px', fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.2s', background: locationFilter === 'neighborhood' ? '#fff' : 'transparent', color: locationFilter === 'neighborhood' ? '#111' : '#6B7280', boxShadow: locationFilter === 'neighborhood' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none' }}
                >
                  Neighborhood
                </button>
              </div>
            </div>
            
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#111', marginBottom: '1rem', flexShrink: 0 }}>
              Promotions
            </div>

            {/* List View - Tighter Layout for More Visibility */}
            <div className="custom-modal-scroll" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingRight: '12px', minHeight: 0, paddingBottom: '1rem' }}>
              {displayPromos.length > 0 ? displayPromos.map((promo, i) => (
                <div 
                  key={i} 
                  onClick={() => openPromoDetail(promo)}
                  style={{ background: '#fff', borderRadius: '12px', padding: '0.75rem 1rem', border: '1px solid #E5E7EB', boxShadow: '0 1px 4px rgba(0,0,0,0.02)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0, transition: 'all 0.2s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.02)'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <img src={promo.image} alt={promo.restaurant} style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #F3F4F6', flexShrink: 0 }} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <div style={{ fontWeight: 'bold', color: '#111', fontSize: '15px', fontFamily: 'sans-serif', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {promo.restaurant}
                        <PlatformIcon platform={promo.platform} />
                        {promo.watchlisted && <span style={{ background: '#FEF3C7', color: '#D97706', fontSize: '9px', padding: '2px 4px', borderRadius: '4px', fontWeight: 800 }}>WATCHLIST</span>}
                      </div>
                      <div style={{ fontSize: '13px', color: '#6B7280', fontWeight: 500, fontFamily: 'sans-serif' }}>{promo.promo}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', flexShrink: 0 }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, background: '#F3F4F6', color: '#4B5563', padding: '4px 10px', borderRadius: '6px', fontFamily: 'sans-serif' }}>
                      {promo.type}
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#E85D4E', fontFamily: 'sans-serif' }}>{promo.active}</span>
                  </div>
                </div>
              )) : (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#6B7280', fontSize: '14px', fontFamily: 'sans-serif', background: '#fff', borderRadius: '12px', border: '1px dashed #E5E7EB' }}>
                  No active promotions found for {platformFilter} in {locationFilter}.
                </div>
              )}
            </div>

            <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #E5E7EB', flexShrink: 0 }}>
              <button 
                onClick={() => setViewMode('strategy_setup')}
                style={{ width: '100%', padding: '14px', borderRadius: '9999px', background: '#111', color: '#fff', fontWeight: 'bold', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '15px', transition: 'background 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#333'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#111'}
              >
                <Sparkles size={18} /> Suggest Strategy
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PromoTrackerModal;
