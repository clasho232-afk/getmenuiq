import React, { useState, useMemo } from 'react';
import { MapPin, Star, Truck, Tag, ArrowRight, RotateCcw, Filter, ArrowUpDown, X, Clock, TrendingUp } from 'lucide-react';

const MOCK_COMPETITORS = [
  { id: 1, name: "Pizza Express", cuisine: "Pizza", distance: 0.3, rating: 4.2, reviews: 312, platforms: ["ubereats","deliveroo"], freeDelivery: true, hasPromo: true, promoText: "Buy 1 Get 1 Free on 12\" pizzas", image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=80&q=80" },
  { id: 2, name: "Burger King", cuisine: "Burgers", distance: 0.8, rating: 3.9, reviews: 540, platforms: ["ubereats","deliveroo","justeat"], freeDelivery: false, hasPromo: true, promoText: "2 for £5 Mix & Match", image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=80&q=80" },
  { id: 3, name: "Five Guys", cuisine: "Burgers", distance: 1.2, rating: 4.5, reviews: 289, platforms: ["deliveroo","justeat"], freeDelivery: false, hasPromo: false, promoText: "", image: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=80&q=80" },
  { id: 4, name: "Nando's", cuisine: "Chicken", distance: 1.5, rating: 4.3, reviews: 678, platforms: ["ubereats","deliveroo","justeat"], freeDelivery: true, hasPromo: false, promoText: "", image: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?auto=format&fit=crop&w=80&q=80" },
  { id: 5, name: "Local Diner", cuisine: "Casual Dining", distance: 0.5, rating: 4.0, reviews: 87, platforms: ["justeat"], freeDelivery: true, hasPromo: true, promoText: "20% off all Milkshakes", image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=80&q=80" },
  { id: 6, name: "Golden Dragon", cuisine: "Chinese", distance: 2.1, rating: 4.1, reviews: 203, platforms: ["ubereats","justeat"], freeDelivery: false, hasPromo: false, promoText: "", image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=80&q=80" },
  { id: 7, name: "Spice Garden", cuisine: "Indian", distance: 1.8, rating: 4.6, reviews: 412, platforms: ["ubereats","deliveroo"], freeDelivery: true, hasPromo: true, promoText: "Free Naan with every curry", image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=80&q=80" },
  { id: 8, name: "Sweet Spot", cuisine: "Desserts", distance: 3.2, rating: 4.8, reviews: 156, platforms: ["deliveroo"], freeDelivery: false, hasPromo: false, promoText: "", image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=80&q=80" },
  { id: 9, name: "Papa John's", cuisine: "Pizza", distance: 2.5, rating: 3.7, reviews: 445, platforms: ["ubereats","deliveroo","justeat"], freeDelivery: true, hasPromo: true, promoText: "40% off first order", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=80&q=80" },
  { id: 10, name: "Chicken Cottage", cuisine: "Chicken", distance: 0.9, rating: 3.5, reviews: 198, platforms: ["justeat"], freeDelivery: false, hasPromo: false, promoText: "", image: "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?auto=format&fit=crop&w=80&q=80" },
  { id: 11, name: "Domino's", cuisine: "Pizza", distance: 1.1, rating: 3.8, reviews: 890, platforms: ["ubereats","deliveroo","justeat"], freeDelivery: true, hasPromo: true, promoText: "50% off Tuesdays", image: "https://images.unsplash.com/photo-1590947132387-155cc02f3212?auto=format&fit=crop&w=80&q=80" },
  { id: 12, name: "Wagamama", cuisine: "Casual Dining", distance: 4.5, rating: 4.4, reviews: 523, platforms: ["ubereats","deliveroo"], freeDelivery: false, hasPromo: false, promoText: "", image: "https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?auto=format&fit=crop&w=80&q=80" },
  { id: 13, name: "Bombay Mix", cuisine: "Indian", distance: 3.8, rating: 4.2, reviews: 167, platforms: ["deliveroo","justeat"], freeDelivery: true, hasPromo: false, promoText: "", image: "https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=80&q=80" },
  { id: 14, name: "Wing Stop", cuisine: "Chicken", distance: 5.2, rating: 4.1, reviews: 334, platforms: ["ubereats","deliveroo"], freeDelivery: false, hasPromo: true, promoText: "Free wings with £15+ orders", image: "https://images.unsplash.com/photo-1524114664604-cd8133cd67ad?auto=format&fit=crop&w=80&q=80" },
];

const ALL_CUISINES = [...new Set(MOCK_COMPETITORS.map(c => c.cuisine))];
const ALL_PLATFORMS = ["ubereats", "deliveroo", "justeat"];
const PLATFORM_LABELS = { ubereats: "Uber Eats", deliveroo: "Deliveroo", justeat: "Just Eat" };
const PLATFORM_COLORS = { ubereats: "#06C167", deliveroo: "#00CCBC", justeat: "#F36D00" };

const ThreeWayToggle = ({ value, onChange, label }) => {
  const opts = ['All', 'Yes', 'No'];
  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#111', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '0.5rem' }}>{label}</label>
      <div style={{ display: 'flex', gap: '0.25rem', background: 'rgba(0,0,0,0.03)', borderRadius: '8px', padding: '0.2rem' }}>
        {opts.map(o => (
          <button key={o} onClick={() => onChange(o)} style={{
            flex: 1, padding: '0.4rem', borderRadius: '6px', border: 'none', fontSize: '0.7rem', fontWeight: value === o ? 700 : 500,
            color: value === o ? '#111' : '#9CA3AF', background: value === o ? '#fff' : 'transparent',
            boxShadow: value === o ? '0 1px 3px rgba(0,0,0,0.06)' : 'none', cursor: 'pointer', transition: 'all 0.2s'
          }}>{o}</button>
        ))}
      </div>
    </div>
  );
};

const CompetitorFinderContent = () => {
  const [radius, setRadius] = useState(5);
  const [selectedCuisines, setSelectedCuisines] = useState([...ALL_CUISINES]);
  const [freeDelivery, setFreeDelivery] = useState('All');
  const [activePromos, setActivePromos] = useState('All');
  const [selectedPlatforms, setSelectedPlatforms] = useState([...ALL_PLATFORMS]);
  const [minRating, setMinRating] = useState(3.0);
  const [sortBy, setSortBy] = useState('distance');
  const [hoveredPromo, setHoveredPromo] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [cuisineOpen, setCuisineOpen] = useState(false);

  const toggleCuisine = (c) => {
    setSelectedCuisines(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
  };
  const togglePlatform = (p) => {
    setSelectedPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  };
  const clearAll = () => {
    setRadius(5); setSelectedCuisines([...ALL_CUISINES]); setFreeDelivery('All');
    setActivePromos('All'); setSelectedPlatforms([...ALL_PLATFORMS]); setMinRating(3.0); setSortBy('distance');
  };

  const activeFilterCount = [
    radius !== 5, selectedCuisines.length !== ALL_CUISINES.length, freeDelivery !== 'All',
    activePromos !== 'All', selectedPlatforms.length !== ALL_PLATFORMS.length, minRating > 3.0
  ].filter(Boolean).length;

  const results = useMemo(() => {
    let r = MOCK_COMPETITORS.filter(c => {
      if (c.distance > radius) return false;
      if (!selectedCuisines.includes(c.cuisine)) return false;
      if (freeDelivery === 'Yes' && !c.freeDelivery) return false;
      if (freeDelivery === 'No' && c.freeDelivery) return false;
      if (activePromos === 'Yes' && !c.hasPromo) return false;
      if (activePromos === 'No' && c.hasPromo) return false;
      if (!c.platforms.some(p => selectedPlatforms.includes(p))) return false;
      if (c.rating < minRating) return false;
      return true;
    });
    if (sortBy === 'distance') r.sort((a, b) => a.distance - b.distance);
    else if (sortBy === 'rating') r.sort((a, b) => b.rating - a.rating);
    else if (sortBy === 'promo') r.sort((a, b) => (b.hasPromo ? 1 : 0) - (a.hasPromo ? 1 : 0));
    return r;
  }, [radius, selectedCuisines, freeDelivery, activePromos, selectedPlatforms, minRating, sortBy]);

  const sliderTrack = (val, min, max) => `linear-gradient(to right, #111 0%, #111 ${((val-min)/(max-min))*100}%, rgba(0,0,0,0.08) ${((val-min)/(max-min))*100}%, rgba(0,0,0,0.08) 100%)`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem' }}>
      <h1 style={{ fontSize: '1.875rem', fontWeight: 700, letterSpacing: '-0.02em' }}>Competitor Finder</h1>

      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
        {/* LEFT — Filter Panel */}
        <div className="glass-panel" style={{ width: '280px', minWidth: '280px', padding: '1.5rem', position: 'sticky', top: '1rem', alignSelf: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <Filter size={15} color="#6B7280" strokeWidth={1.5} />
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#111' }}>Filters</span>
            {activeFilterCount > 0 && (
              <span style={{ fontSize: '0.6rem', fontWeight: 700, color: '#fff', background: '#111', padding: '0.12rem 0.4rem', borderRadius: '9999px', marginLeft: 'auto' }}>{activeFilterCount} active</span>
            )}
          </div>

          {/* Radius */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#111', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Radius</label>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#111' }}>{radius.toFixed(1)} km</span>
            </div>
            <input type="range" min="0.5" max="10" step="0.5" value={radius} onChange={e => setRadius(parseFloat(e.target.value))}
              style={{ width: '100%', height: '4px', appearance: 'none', borderRadius: '4px', background: sliderTrack(radius, 0.5, 10), outline: 'none', cursor: 'pointer' }} />
          </div>

          {/* Cuisine */}
          <div style={{ marginBottom: '1.25rem' }}>
            <button onClick={() => setCuisineOpen(!cuisineOpen)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', border: 'none', background: 'none', cursor: 'pointer', padding: 0, marginBottom: cuisineOpen ? '0.5rem' : 0 }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#111', textTransform: 'uppercase', letterSpacing: '0.04em', cursor: 'pointer' }}>Cuisine</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                {!cuisineOpen && selectedCuisines.length < ALL_CUISINES.length && (
                  <span style={{ fontSize: '0.6rem', fontWeight: 700, color: '#fff', background: '#111', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>{selectedCuisines.length}/{ALL_CUISINES.length}</span>
                )}
                <span style={{ fontSize: '0.7rem', color: '#9CA3AF', transition: 'transform 0.2s', display: 'inline-block', transform: cuisineOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>▾</span>
              </div>
            </button>
            {cuisineOpen && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                {ALL_CUISINES.map(c => {
                  const active = selectedCuisines.includes(c);
                  return (
                    <button key={c} onClick={() => toggleCuisine(c)} style={{
                      padding: '0.3rem 0.6rem', borderRadius: '6px', border: `1px solid ${active ? '#111' : 'rgba(0,0,0,0.08)'}`,
                      background: active ? '#111' : 'transparent', color: active ? '#fff' : '#6B7280',
                      fontSize: '0.65rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s'
                    }}>{c}</button>
                  );
                })}
              </div>
            )}
          </div>

          <ThreeWayToggle label="Free Delivery" value={freeDelivery} onChange={setFreeDelivery} />
          <ThreeWayToggle label="Active Promotions" value={activePromos} onChange={setActivePromos} />

          {/* Platform */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#111', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '0.5rem' }}>Platform</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {ALL_PLATFORMS.map(p => {
                const active = selectedPlatforms.includes(p);
                return (
                  <button key={p} onClick={() => togglePlatform(p)} style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.45rem 0.6rem', borderRadius: '6px',
                    border: `1px solid ${active ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.04)'}`,
                    background: active ? 'rgba(0,0,0,0.03)' : 'transparent', cursor: 'pointer', transition: 'all 0.15s'
                  }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: active ? PLATFORM_COLORS[p] : '#D1D5DB', transition: 'background 0.2s' }} />
                    <span style={{ fontSize: '0.7rem', fontWeight: active ? 700 : 500, color: active ? '#111' : '#9CA3AF' }}>{PLATFORM_LABELS[p]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Min Rating */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#111', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Min Rating</label>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#111', display: 'flex', alignItems: 'center', gap: '0.2rem' }}><Star size={11} fill="#111" color="#111" />{minRating.toFixed(1)}</span>
            </div>
            <input type="range" min="3.0" max="5.0" step="0.1" value={minRating} onChange={e => setMinRating(parseFloat(e.target.value))}
              style={{ width: '100%', height: '4px', appearance: 'none', borderRadius: '4px', background: sliderTrack(minRating, 3, 5), outline: 'none', cursor: 'pointer' }} />
          </div>

          {/* Clear */}
          <button onClick={clearAll} style={{
            width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.08)',
            background: 'transparent', color: '#6B7280', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', transition: 'all 0.2s'
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.03)'; e.currentTarget.style.color = '#111'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6B7280'; }}
          ><RotateCcw size={13} /> Clear all filters</button>
        </div>

        {/* RIGHT — Results */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {/* Results Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: '0.85rem', color: '#6B7280' }}>
              <span style={{ fontWeight: 800, color: '#111', fontSize: '1rem' }}>{results.length}</span> restaurants match your filters
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(0,0,0,0.03)', borderRadius: '8px', padding: '0.2rem' }}>
              {[{key:'distance',label:'Distance'},{key:'rating',label:'Rating'},{key:'promo',label:'Promos'}].map(s => (
                <button key={s.key} onClick={() => setSortBy(s.key)} style={{
                  padding: '0.35rem 0.65rem', borderRadius: '6px', border: 'none', fontSize: '0.7rem',
                  fontWeight: sortBy === s.key ? 700 : 500, color: sortBy === s.key ? '#111' : '#9CA3AF',
                  background: sortBy === s.key ? '#fff' : 'transparent',
                  boxShadow: sortBy === s.key ? '0 1px 3px rgba(0,0,0,0.06)' : 'none', cursor: 'pointer', transition: 'all 0.2s'
                }}>{s.label}</button>
              ))}
            </div>
          </div>

          {/* Result Cards */}
          {results.length === 0 ? (
            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
              <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#9CA3AF' }}>No restaurants match your filters</p>
              <p style={{ fontSize: '0.75rem', color: '#D1D5DB', marginTop: '0.35rem' }}>Try widening your radius or removing a filter</p>
            </div>
          ) : results.map(c => (
            <div key={c.id} className="glass-panel" style={{
              padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem',
              transition: 'transform 0.2s, border-color 0.2s', cursor: 'default',
              border: '1px solid rgba(255,255,255,0.8)'
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(4px)'; e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateX(0)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.8)'; }}
            >
              <img src={c.image} alt={c.name} style={{ width: '48px', height: '48px', borderRadius: '10px', objectFit: 'cover', border: '1px solid rgba(0,0,0,0.06)', flexShrink: 0 }} />

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#111' }}>{c.name}</span>
                  <span style={{ fontSize: '0.6rem', fontWeight: 600, color: '#9CA3AF', background: 'rgba(0,0,0,0.03)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>{c.cuisine}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.3rem' }}>
                  <span style={{ fontSize: '0.7rem', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '0.2rem' }}><MapPin size={11} strokeWidth={1.5} />{c.distance} km</span>
                  <span style={{ fontSize: '0.7rem', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '0.2rem' }}><Star size={11} fill="#F59E0B" color="#F59E0B" />{c.rating} <span style={{ color: '#D1D5DB' }}>({c.reviews})</span></span>
                </div>
              </div>

              {/* Platform Icons */}
              <div style={{ display: 'flex', gap: '0.2rem', flexShrink: 0 }}>
                {c.platforms.map(p => (
                  <div key={p} title={PLATFORM_LABELS[p]} style={{ width: '20px', height: '20px', borderRadius: '5px', background: PLATFORM_COLORS[p], display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.6 }}>
                    <span style={{ fontSize: '0.45rem', fontWeight: 800, color: '#fff' }}>{PLATFORM_LABELS[p][0]}</span>
                  </div>
                ))}
              </div>

              {/* Badges */}
              <div style={{ display: 'flex', gap: '0.3rem', flexShrink: 0 }}>
                {c.freeDelivery && (
                  <span style={{ fontSize: '0.6rem', fontWeight: 700, color: '#059669', background: 'rgba(5,150,105,0.08)', padding: '0.2rem 0.45rem', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                    <Truck size={10} /> Free
                  </span>
                )}
                {c.hasPromo && (
                  <span
                    onMouseEnter={() => setHoveredPromo(c.id)}
                    onMouseLeave={() => setHoveredPromo(null)}
                    style={{ fontSize: '0.6rem', fontWeight: 700, color: '#D97706', background: 'rgba(217,119,6,0.08)', padding: '0.2rem 0.45rem', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.2rem', position: 'relative', cursor: 'default' }}
                  >
                    <Tag size={10} /> Promo
                    {hoveredPromo === c.id && (
                      <div style={{ position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: '6px', background: '#111', color: '#fff', padding: '0.4rem 0.6rem', borderRadius: '6px', fontSize: '0.65rem', fontWeight: 600, whiteSpace: 'nowrap', zIndex: 10, pointerEvents: 'none' }}>
                        {c.promoText}
                        <div style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: '5px solid #111' }} />
                      </div>
                    )}
                  </span>
                )}
              </div>

              {/* Action */}
              <button onClick={() => setSelectedProfile(c)} style={{
                padding: '0.45rem 0.85rem', borderRadius: '8px', border: 'none', background: '#111', color: '#fff',
                fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem',
                transition: 'background 0.2s', flexShrink: 0, whiteSpace: 'nowrap'
              }}
                onMouseEnter={e => e.currentTarget.style.background = '#e05046'}
                onMouseLeave={e => e.currentTarget.style.background = '#111'}
              >View Profile <ArrowRight size={12} /></button>
            </div>
          ))}
        </div>
      </div>

      {/* Profile Modal */}
      {selectedProfile && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 100, background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setSelectedProfile(null)}>
          <div className="glass-panel" onClick={e => e.stopPropagation()} style={{ width: '520px', maxWidth: '90%', maxHeight: '85vh', overflowY: 'auto', background: 'rgba(255,255,255,0.95)', border: '1px solid rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column' }}>
            {/* Hero */}
            <div style={{ position: 'relative', height: '180px', overflow: 'hidden', borderRadius: '24px 24px 0 0' }}>
              <img src={selectedProfile.image.replace('w=80', 'w=600')} alt={selectedProfile.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)' }} />
              <button onClick={() => setSelectedProfile(null)} style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}><X size={16} /></button>
              <div style={{ position: 'absolute', bottom: '1rem', left: '1.25rem' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>{selectedProfile.name}</h2>
                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>{selectedProfile.cuisine}</span>
              </div>
            </div>

            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Stats Row */}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <div style={{ flex: 1, background: 'rgba(0,0,0,0.03)', borderRadius: '10px', padding: '0.85rem', textAlign: 'center' }}>
                  <p style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111' }}>{selectedProfile.rating}</p>
                  <p style={{ fontSize: '0.65rem', color: '#9CA3AF', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.2rem', marginTop: '0.15rem' }}><Star size={10} fill="#F59E0B" color="#F59E0B" />{selectedProfile.reviews} reviews</p>
                </div>
                <div style={{ flex: 1, background: 'rgba(0,0,0,0.03)', borderRadius: '10px', padding: '0.85rem', textAlign: 'center' }}>
                  <p style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111' }}>{selectedProfile.distance} km</p>
                  <p style={{ fontSize: '0.65rem', color: '#9CA3AF', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.2rem', marginTop: '0.15rem' }}><MapPin size={10} />from you</p>
                </div>
                <div style={{ flex: 1, background: 'rgba(0,0,0,0.03)', borderRadius: '10px', padding: '0.85rem', textAlign: 'center' }}>
                  <p style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111' }}>{selectedProfile.platforms.length}</p>
                  <p style={{ fontSize: '0.65rem', color: '#9CA3AF', fontWeight: 600, marginTop: '0.15rem' }}>platforms</p>
                </div>
              </div>

              {/* Platforms */}
              <div>
                <h4 style={{ fontSize: '0.7rem', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.5rem' }}>Listed on</h4>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  {selectedProfile.platforms.map(p => (
                    <div key={p} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(0,0,0,0.03)', padding: '0.35rem 0.65rem', borderRadius: '6px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: PLATFORM_COLORS[p] }} />
                      <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#111' }}>{PLATFORM_LABELS[p]}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery & Promo */}
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {selectedProfile.freeDelivery && (
                  <div style={{ flex: 1, background: 'rgba(5,150,105,0.06)', border: '1px solid rgba(5,150,105,0.12)', borderRadius: '8px', padding: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Truck size={16} color="#059669" />
                    <div>
                      <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669' }}>Free Delivery</p>
                      <p style={{ fontSize: '0.65rem', color: '#6B7280' }}>Currently active</p>
                    </div>
                  </div>
                )}
                {selectedProfile.hasPromo && (
                  <div style={{ flex: 1, background: 'rgba(217,119,6,0.06)', border: '1px solid rgba(217,119,6,0.12)', borderRadius: '8px', padding: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Tag size={16} color="#D97706" />
                    <div>
                      <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#D97706' }}>Active Promo</p>
                      <p style={{ fontSize: '0.65rem', color: '#6B7280' }}>{selectedProfile.promoText}</p>
                    </div>
                  </div>
                )}
                {!selectedProfile.freeDelivery && !selectedProfile.hasPromo && (
                  <div style={{ flex: 1, background: 'rgba(0,0,0,0.02)', borderRadius: '8px', padding: '0.75rem', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>No active offers</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button style={{ flex: 1, padding: '0.65rem', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.08)', background: 'transparent', color: '#6B7280', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.03)'; e.currentTarget.style.color = '#111'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6B7280'; }}
                >Add to My Competitors</button>
                <button style={{ flex: 1, padding: '0.65rem', borderRadius: '8px', border: 'none', background: '#111', color: '#fff', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', transition: 'background 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#e05046'}
                  onMouseLeave={e => e.currentTarget.style.background = '#111'}
                ><TrendingUp size={14} /> Compare Prices</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompetitorFinderContent;
