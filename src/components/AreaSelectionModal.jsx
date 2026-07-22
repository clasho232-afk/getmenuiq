import React, { useState, useEffect } from 'react';
import { X, MapPin, Search, Check, Shield } from 'lucide-react';
import PremiumUpsellModal from './PremiumUpsellModal';

const availableAreas = [
  'Ilford', 'Barking', 'Dagenham', 'Whitechapel', 'Shoreditch', 
  'Camden', 'Hackney', 'Stratford', 'Bethnal Green', 'Stepney',
  'East Ham', 'Romford', 'Islington', 'Walthamstow'
];

const AreaSelectionModal = ({ isOpen, onClose, onAreasUpdated }) => {
  const [selectedAreas, setSelectedAreas] = useState(['Ilford']);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUpsell, setShowUpsell] = useState(false);
  const [targetTier, setTargetTier] = useState('Silver');
  
  // Mock current plan: change this to 'Silver' or 'Platinum' to test
  const currentPlan = 'Standard'; 
  
  const getLimit = () => {
    if (currentPlan === 'Platinum') return Infinity;
    if (currentPlan === 'Silver') return 2;
    return 1;
  };

  useEffect(() => {
    if (isOpen) {
      const stored = localStorage.getItem('menu_iq_monitored_areas');
      if (stored) {
        setSelectedAreas(JSON.parse(stored));
      } else {
        localStorage.setItem('menu_iq_monitored_areas', JSON.stringify(['Ilford']));
        setSelectedAreas(['Ilford']);
      }
    }
  }, [isOpen]);

  if (!isOpen && !showUpsell) return null;

  const handleToggleArea = (area) => {
    const isSelected = selectedAreas.includes(area);
    
    if (isSelected) {
      if (selectedAreas.length <= 1) return; // Prevent 0 areas
      const newAreas = selectedAreas.filter(a => a !== area);
      saveAreas(newAreas);
      return;
    }

    const limit = getLimit();
    if (selectedAreas.length >= limit) {
      setTargetTier(currentPlan === 'Standard' ? 'Silver' : 'Platinum');
      setShowUpsell(true);
      return;
    }

    const newAreas = [...selectedAreas, area];
    saveAreas(newAreas);
  };

  const saveAreas = (areas) => {
    setSelectedAreas(areas);
    localStorage.setItem('menu_iq_monitored_areas', JSON.stringify(areas));
    window.dispatchEvent(new CustomEvent('monitoring-areas-updated', { detail: areas }));
    if (onAreasUpdated) onAreasUpdated(areas);
  };

  const filteredAreas = availableAreas.filter(a => a.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <>
      {isOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '20px',
            width: '100%', maxWidth: '600px',
            maxHeight: '90vh',
            display: 'flex', flexDirection: 'column',
            boxShadow: '0 20px 40px -10px rgba(0,0,0,0.2)',
            overflow: 'hidden'
          }}>
            {/* Header */}
            <div style={{ 
              padding: '1.5rem', borderBottom: '1px solid #F3F4F6',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: '#FAFAFA'
            }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1F2937', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MapPin size={20} color="#E05046" /> Active Territories
                </h2>
                <p style={{ fontSize: '0.85rem', color: '#6B7280', margin: '0.25rem 0 0 0' }}>
                  Select the regions you want MenuIQ to monitor.
                </p>
              </div>
              <button 
                onClick={onClose}
                style={{
                  background: 'rgba(0,0,0,0.05)', border: 'none',
                  color: '#4B5563', width: '36px', height: '36px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', transition: 'background 0.2s'
                , textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.75rem'}}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}
              >
                <X size={18} />
              </button>
            </div>

            {/* Plan Status Banner */}
            <div style={{ 
              background: 'linear-gradient(90deg, rgba(224,80,70,0.05) 0%, rgba(224,80,70,0.01) 100%)',
              padding: '1rem 1.5rem', borderBottom: '1px solid #F3F4F6',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Shield size={16} color="#E05046" />
                <span style={{ fontSize: '0.85rem', color: '#4B5563' , textTransform: 'uppercase', letterSpacing: '0.05em'}}>Current Plan: <span style={{ color: '#111' }}>{currentPlan}</span></span>
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#6B7280' }}>
                <span style={{ color: selectedAreas.length >= getLimit() ? '#DC2626' : '#059669' }}>{selectedAreas.length}</span> / {currentPlan === 'Platinum' ? '∞' : getLimit()} areas
              </div>
            </div>

            {/* Search */}
            <div style={{ padding: '1.5rem 1.5rem 0 1.5rem' }}>
              <div style={{ 
                position: 'relative', 
                background: '#F3F4F6', 
                borderRadius: '12px',
                display: 'flex', alignItems: 'center',
                padding: '0 1rem'
              }}>
                <Search size={18} color="#9CA3AF" />
                <input 
                  type="text" 
                  placeholder="Search areas..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%', padding: '0.8rem 0.5rem',
                    background: 'transparent', border: 'none',
                    outline: 'none', fontSize: '0.95rem',
                    color: '#111'
                  }}
                />
              </div>
            </div>

            {/* Area Grid */}
            <div style={{ 
              padding: '1.5rem', 
              overflowY: 'auto',
              flex: 1,
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
              gap: '0.75rem'
            }}>
              {filteredAreas.map(area => {
                const isSelected = selectedAreas.includes(area);
                const isLimitReached = !isSelected && selectedAreas.length >= getLimit();
                
                return (
                  <div 
                    key={area}
                    onClick={() => handleToggleArea(area)}
                    style={
                      border: `1px solid ${isSelected ? '#E05046' : '#E5E7EB'}`,
                      background: isSelected ? 'rgba(224,80,70,0.04)' : '#fff',
                      padding: '1rem',
                      borderRadius: '12px',
                      cursor: isSelected && selectedAreas.length === 1 ? 'not-allowed' : 'pointer',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      transition: 'all 0.2s',
                      opacity: isLimitReached ? 0.6 : 1
                    }
                  >
                    <span style={{ 
                      fontSize: '0.9rem', 
                      fontWeight: isSelected ? 700 : 500,
                      color: isSelected ? '#111' : '#4B5563'
                    }}>
                      {area}
                    </span>
                    <div style={ 
                      width: '20px', height: '20px', borderRadius: '6px',
                      border: `2px solid ${isSelected ? '#E05046' : '#D1D5DB'}`,
                      background: isSelected ? '#E05046' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }>
                      {isSelected && <Check size={12} color="#fff" strokeWidth={3} />}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Footer */}
            <div style={{ padding: '1.5rem', borderTop: '1px solid #F3F4F6', background: '#FAFAFA', display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                onClick={onClose}
                style={{
                  background: '#111', color: '#fff',
                  border: 'none', padding: '0.75rem 1.5rem',
                  borderRadius: '10px', fontSize: '0.95rem', fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
      
      <PremiumUpsellModal 
        isOpen={showUpsell} 
        onClose={() => setShowUpsell(false)} 
        targetTier={targetTier} 
      />
    </>
  );
};

export default AreaSelectionModal;
