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

  const healthScores = React.useMemo(() => {
    return competitors.map(c => {
      const strId = c.id ? String(c.id) : (c.name || 'rand');
      const fallbackScore = 60 + ((strId.length * 7) % 30);
      const offset = platformView === 'all' ? 0 : platformView === 'ubereats' ? -4 : platformView === 'deliveroo' ? 2 : -2;
      return Math.max(0, Math.min(100, (c.score || fallbackScore) + offset));
    });
  }, [competitors, platformView]);

  const maxHealthScore = Math.max(...healthScores);

  const renderRow = (label, computeValue, renderer, direction, isLast = false) => {
    const values = competitors.map((c, i) => computeValue(c, i));
    const numericValues = values.filter(v => typeof v === 'number' && !isNaN(v));
    let max = -Infinity, min = Infinity;
    if (numericValues.length > 0) {
      max = Math.max(...numericValues);
      min = Math.min(...numericValues);
    }
    
    return (
      <div style={{ display: 'flex', borderBottom: isLast ? 'none' : '1px solid #E5E7EB' }}>
        <div style={{ flex: '0 0 130px', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', fontSize: '13px', fontWeight: 600, color: '#111' }}>
          {label}
        </div>
        {competitors.map((restaurant, idx) => {
           const isOwner = idx === 0;
           const val = values[idx];
           let color = '#111';
           if (typeof val === 'number' && min !== max) {
             if (direction === 'high') {
               if (val === max) color = '#16A34A';
               else if (val === min) color = '#DC2626';
             } else if (direction === 'low') {
               if (val === min) color = '#16A34A';
               else if (val === max) color = '#DC2626';
             }
           }
           
           return (
             <div key={`row-${label}-${restaurant.id}`} style={{ flex: '1', minWidth: '140px', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', fontSize: '13px', fontWeight: 500, color: '#4B5563', backgroundColor: isOwner ? '#F0FDF4' : '#fff', borderLeft: '1px solid #E5E7EB' }}>
               {renderer(val, restaurant, idx, color)}
             </div>
           );
        })}
      </div>
    );
  };

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
        minHeight: '95vh',
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
                  {plat.icon && <img src={`https://cdn.simpleicons.org/${plat.icon}`} alt={plat.label} style={{ width: '12px', height: '12px' }} />}
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
               <span style={{ fontSize: '13px', fontWeight: 700, color: '#111' }}>Platform Health</span>
            </div>
            {competitors.map((restaurant, idx) => {
              const isOwner = idx === 0;
              const isWinner = healthScores[idx] === maxHealthScore && competitors.length > 1 && maxHealthScore > Math.min(...healthScores);
              return (
                <div key={`header-${restaurant.id}`} style={{ position: 'relative', flex: '1', minWidth: '140px', padding: '1rem', backgroundColor: isOwner ? '#F0FDF4' : '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', borderLeft: '1px solid #E5E7EB' }}>
                  {isWinner && (
                    <div style={{ position: 'absolute', top: '-12px', zIndex: 10, display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#16A34A', color: '#FFF', padding: '4px 10px', borderRadius: '12px', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', boxShadow: '0 4px 6px -1px rgba(22, 163, 74, 0.4)' }}>
                      <span style={{ fontSize: '12px' }}>🏆</span> Overall Leader
                    </div>
                  )}
                  <div style={{ fontSize: '11px', fontWeight: 800, color: isOwner ? '#16A34A' : '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem', marginTop: isWinner ? '8px' : '0' }}>
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
          {renderRow('Health Score', 
             (c, idx) => healthScores[idx],
             (val, c, idx, color) => (
               <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
                 <span style={{ fontSize: '1.1rem', fontWeight: 800, color }}>{val}</span>
                 <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#9CA3AF' }}>/100</span>
               </div>
             ),
             'high'
          )}
          {renderRow('Platform Rating', 
             c => {
               const platOffset = platformView === 'all' ? 0 : platformView === 'ubereats' ? -0.2 : platformView === 'deliveroo' ? 0.1 : -0.1;
               return parseFloat(c.rating || (Math.random() * 1 + 4).toFixed(1)) + platOffset;
             },
             (val, c, idx, color) => (
               <span style={{ color, fontWeight: 700 }}>{Math.max(1, Math.min(5, val)).toFixed(1)} avg</span>
             ),
             'high'
          )}
          {renderRow('Search Visibility', 
             c => c.search_visibility || Math.floor(Math.random() * 20 + 5),
             (val, c, idx, color) => (
               <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', justifyContent: 'center' }}>
                 <span style={{ fontSize: '11px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>Top</span>
                 <span style={{ fontSize: '14px', fontWeight: 800, color }}>{val}%</span>
               </div>
             ),
             'low'
          )}
          {renderRow('Menu Overlap', 
             (c, idx) => {
               if (idx === 0) return null;
               return c.menu_overlap || Math.floor(Math.random() * 40 + 40);
             },
             (val, c, idx, color) => {
               if (idx === 0) return <span style={{ fontSize: '13px', fontWeight: 600, color: '#9CA3AF' }}>-</span>;
               return (
                 <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', justifyContent: 'center' }}>
                   <span style={{ fontSize: '14px', fontWeight: 800, color: '#111' }}>{val}%</span>
                   <span style={{ fontSize: '11px', fontWeight: 600, color: '#6B7280' }}>Match</span>
                 </div>
               );
             },
             'neutral'
          )}
          {renderRow('Price Variance', 
             (c, idx) => {
               const strId = c.id ? String(c.id) : c.name;
               const variance = ((strId.length * 7) % 15) + 1;
               const isCheaper = strId.length % 2 === 0;
               return isCheaper ? -variance : variance;
             },
             (val, c, idx, color) => {
               return (
                 <span style={{ fontSize: '14px', fontWeight: 700, color }}>
                   {val > 0 ? '+' : ''}{val}%
                 </span>
               );
             },
             'low'
          )}
          {renderRow('Delivery Platforms', 
             c => {
               const plats = detectPlatforms(c);
               return platformView === 'all' ? plats : plats.filter(p => p === platformView);
             },
             (displayPlats, c, idx, color) => {
               if (displayPlats.length === 0) return <span style={{ color: '#9CA3AF', fontStyle: 'italic', fontSize: '11px' }}>Not Listed</span>;
               return (
                 <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', justifyContent: 'center' }}>
                   {displayPlats.map(p => (
                     <img key={p} src={`https://cdn.simpleicons.org/${p === 'ubereats' ? 'ubereats/06C167' : p === 'deliveroo' ? 'deliveroo/00CCBC' : 'justeat/FF8000'}`} alt={p} style={{ width: '16px', height: '16px' }} />
                   ))}
                 </div>
               );
             },
             'neutral'
          )}
          {renderRow('Delivery Fee', 
             c => {
               const rawDelivery = parseFloat(c.delivery_fee);
               if (isNaN(rawDelivery)) return 0;
               const feeOffset = platformView === 'all' ? 0 : platformView === 'ubereats' ? 0.49 : platformView === 'deliveroo' ? 0.99 : 0;
               return rawDelivery + feeOffset;
             },
             (val, c, idx, color) => {
               return <span style={{ fontWeight: 700, color }}>{val <= 0 ? 'Free' : `£${val.toFixed(2)}`}</span>;
             },
             'low'
          )}
          {renderRow('Active Promos', 
             c => {
               const promoOffset = platformView === 'all' ? 0 : platformView === 'ubereats' ? -1 : 0;
               return Math.max(0, (c.promo_count || 0) + promoOffset);
             },
             (val, c, idx, color) => (
               <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', justifyContent: 'center' }}>
                 <span style={{ fontSize: '14px', fontWeight: 700, color }}>{val}</span>
                 <span style={{ fontSize: '12px', fontWeight: 800, color: '#E86A58', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Promos</span>
               </div>
             ),
             'high',
             true
          )}
        </div>
      </div>
    </div>
  );
};

export default ComparisonModal;

