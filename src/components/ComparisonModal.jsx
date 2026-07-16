import React, { useState, useEffect } from 'react';
import { X, MapPin, Download } from 'lucide-react';
import { supabase } from '../supabase';

// Local helper to mock platform detection
function detectPlatforms(restaurant) {
  if (!restaurant) return [];
  const plats = [];
  const len = restaurant.name ? restaurant.name.length : 0;
  if (restaurant.ubereats_url || len % 2 === 0) plats.push('ubereats');
  if (restaurant.deliveroo_url || len % 3 === 0) plats.push('deliveroo');
  plats.push('justeat');
  
  const uniquePlats = [...new Set(plats)];
  if (uniquePlats.length === 0) uniquePlats.push('ubereats');
  return uniquePlats;
}

const ComparisonModal = ({ isOpen, onClose, ownerRestaurant: initialOwner, competitorRestaurant, competitorsList = [] }) => {
  const [ownerRestaurant, setOwnerRestaurant] = useState(initialOwner);
  const [platformView, setPlatformView] = useState('all');

  useEffect(() => {
    if (initialOwner) {
      setOwnerRestaurant(initialOwner);
    } else if (isOpen && !ownerRestaurant) {
      const fetchOwner = async () => {
        try {
          const { data } = await supabase.from('restaurants').select('*').limit(1);
          if (data && data.length > 0) setOwnerRestaurant(data[0]);
        } catch (e) {
          console.error('Error fetching owner:', e);
        }
      };
      fetchOwner();
    }
  }, [isOpen, initialOwner, ownerRestaurant]);

  // Handle either a single competitor or an array of competitors
  const additionalCompetitors = competitorsList.length > 0 
    ? competitorsList 
    : (competitorRestaurant ? [competitorRestaurant] : []);

  if (!isOpen || !ownerRestaurant || additionalCompetitors.length === 0) return null;

  const competitors = [ownerRestaurant, ...additionalCompetitors];

  const renderRow = (label, getter, isLast = false) => (
    <div style={{ display: 'flex', borderBottom: isLast ? 'none' : '1px solid #E5E7EB' }}>
      <div style={{ flex: '0 0 130px', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', fontSize: '13px', fontWeight: 600, color: '#111' }}>
        {label}
      </div>
      {competitors.map((restaurant, idx) => {
         const isOwner = idx === 0;
         return (
           <div key={`row-${label}-${restaurant.id}`} style={{ flex: '1', minWidth: '140px', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', fontSize: '13px', fontWeight: 500, color: '#4B5563', backgroundColor: isOwner ? '#F0FDF4' : '#fff', borderLeft: '1px solid #E5E7EB' }}>
             {getter(restaurant)}
           </div>
         );
      })}
    </div>
  );

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 99999,
      padding: '2rem'
    }}>
      <div style={{
        backgroundColor: '#F8F9FA',
        borderRadius: '24px',
        width: '100%',
        maxWidth: competitors.length <= 2 ? '700px' : competitors.length === 3 ? '950px' : '1200px',
        maxHeight: '95vh',
        overflowY: 'auto',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        padding: '1.5rem',
        transition: 'max-width 0.3s ease'
      }}>
        {/* Header & Title */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#E86A58', margin: 0, fontFamily: "'Lufga', sans-serif" }}>MenuIQ</h2>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', letterSpacing: '0.1em' }}>INTELLIGENCE</span>
              </div>
              <div style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 600, letterSpacing: '0.02em' }}>
                TIME: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase()} AT {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }).toUpperCase()}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#E5E7EB', padding: '0.25rem', borderRadius: '12px', flexShrink: 0 }}>
              {[{ id: 'all', label: 'Overall' }, { id: 'ubereats', label: 'UberEats', icon: 'ubereats/000000' }, { id: 'deliveroo', label: 'Deliveroo', icon: 'deliveroo/00CCBC' }, { id: 'justeat', label: 'Just Eat', icon: 'justeat/FF8000' }].map(plat => (
                <button
                  key={plat.id}
                  onClick={() => setPlatformView(plat.id)}
                  style={{
                    padding: plat.id !== 'all' && competitors.length <= 2 ? '0.4rem 0.6rem' : '0.4rem 0.75rem',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: platformView === plat.id ? '#fff' : 'transparent',
                    color: platformView === plat.id ? '#111' : '#6B7280',
                    fontWeight: platformView === plat.id ? 700 : 500,
                    fontSize: '11px',
                    cursor: 'pointer',
                    boxShadow: platformView === plat.id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.35rem',
                    whiteSpace: 'nowrap',
                    flexShrink: 0
                  }}
                  title={plat.label}
                >
                  {plat.icon && <img src={`https://cdn.simpleicons.org/${plat.icon}`} alt={plat.label} style={{ width: '12px', height: '12px', filter: platformView !== plat.id ? 'grayscale(100%) opacity(0.6)' : 'none' }} />}
                  {/* Hide text for platforms if competitors <= 2 to save space, but keep 'Overall' */}
                  {(plat.id === 'all' || competitors.length > 2) && plat.label}
                </button>
              ))}
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, justifyContent: 'flex-end' }}>
              <button 
                onClick={() => alert("Downloading Report...")}
                style={{ padding: '0.4rem 0.75rem', borderRadius: '8px', backgroundColor: '#fff', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', transition: 'background-color 0.2s', fontSize: '12px', fontWeight: 700, color: '#111', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
              >
                <Download size={14} color="#111" /> Export
              </button>
              <button 
                onClick={onClose}
                style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#fff', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <X size={16} color="#111" />
              </button>
            </div>
        </div>

        {/* Table Container */}
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '16px',
          border: '1px solid #E5E7EB',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'inherit',
          overflowX: 'auto'
        }}>
          {/* Header Row */}
          <div style={{ display: 'flex', borderBottom: '1px solid #E5E7EB' }}>
            <div style={{ flex: '0 0 130px', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
               <span style={{ fontSize: '13px', fontWeight: 700, color: '#111' }}>Metrics</span>
            </div>
            {competitors.map((restaurant, idx) => {
              const isOwner = idx === 0;
              return (
                <div key={`header-${restaurant.id}`} style={{ flex: '1', minWidth: '140px', padding: '1rem', backgroundColor: isOwner ? '#F0FDF4' : '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', borderLeft: '1px solid #E5E7EB' }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: isOwner ? '#16A34A' : '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                    {isOwner ? 'My Restaurant' : 'Competitor'}
                  </div>
                  <div style={{ position: 'relative', width: '120px', height: '120px', borderRadius: '12px', overflow: 'hidden', marginBottom: '0.75rem' }}>
                    <img src={restaurant.hero_image_url || 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=300&q=80'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={restaurant.name} />
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#111', marginBottom: '2px' }}>{restaurant.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#6B7280', fontWeight: 500 }}>
                    <MapPin size={10} color="#9CA3AF" /> {restaurant.city || 'Ilford, London'}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Data Rows */}
          {renderRow('Health Score', c => {
             const offset = platformView === 'all' ? 0 : platformView === 'ubereats' ? -4 : platformView === 'deliveroo' ? 2 : -2;
             const score = Math.max(0, Math.min(100, (c.score || Math.floor(Math.random() * 30 + 60)) + offset));
             return (
               <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
                 <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#111' }}>{score}</span>
                 <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#9CA3AF' }}>/100</span>
               </div>
             );
          })}
          {renderRow('Platform Rating', c => {
             const platOffset = platformView === 'all' ? 0 : platformView === 'ubereats' ? -0.2 : platformView === 'deliveroo' ? 0.1 : -0.1;
             const rating = parseFloat(c.rating || (Math.random() * 1 + 4).toFixed(1)) + platOffset;
             return `${Math.max(1, Math.min(5, rating)).toFixed(1)} avg`;
          })}
          {renderRow('Delivery Platforms', c => {
             const plats = detectPlatforms(c);
             const displayPlats = platformView === 'all' ? plats : plats.filter(p => p === platformView);
             if (displayPlats.length === 0) return <span style={{ color: '#9CA3AF', fontStyle: 'italic', fontSize: '11px' }}>Not Listed</span>;
             return (
               <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', justifyContent: 'center' }}>
                 {displayPlats.map(p => (
                   <img key={p} src={`https://cdn.simpleicons.org/${p === 'ubereats' ? 'ubereats/06C167' : p === 'deliveroo' ? 'deliveroo/00CCBC' : 'justeat/FF8000'}`} alt={p} style={{ width: '16px', height: '16px' }} />
                 ))}
               </div>
             );
          })}
          {renderRow('Delivery Fee', c => {
            const rawDelivery = parseFloat(c.delivery_fee);
            if (isNaN(rawDelivery)) return 'Free';
            const feeOffset = platformView === 'all' ? 0 : platformView === 'ubereats' ? 0.49 : platformView === 'deliveroo' ? 0.99 : 0;
            const finalFee = rawDelivery + feeOffset;
            return finalFee <= 0 ? 'Free' : `£${finalFee.toFixed(2)}`;
          })}
          {renderRow('Active Promos', c => {
            const promoOffset = platformView === 'all' ? 0 : platformView === 'ubereats' ? -1 : 0;
            const promos = Math.max(0, (c.promo_count || 0) + promoOffset);
            return (
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', justifyContent: 'center' }}>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#111' }}>{promos}</span>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#E86A58', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Promos</span>
              </div>
            );
          }, true)}
        </div>
      </div>
    </div>
  );
};

export default ComparisonModal;

