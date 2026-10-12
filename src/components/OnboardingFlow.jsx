import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';
import { DeliverooIcon, UberEatsIcon, JustEatIcon } from './PlatformIcons';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap');

  .onboarding-flow * { box-sizing: border-box; margin: 0; padding: 0; }

  .onboarding-flow {
    font-family: 'DM Sans', sans-serif;
    background: #F7F5F0;
    color: #111111;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
  }

  .ob-container {
    width: 100%;
    max-width: 580px;
    background: #FFFFFF;
    border-radius: 20px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.03), 0 20px 40px rgba(0,0,0,0.07);
    padding: 2.5rem 2.75rem 2rem;
    display: flex;
    flex-direction: column;
    animation: obFadeUp 0.45s cubic-bezier(0.22, 1, 0.36, 1) both;
  }

  /* ── Brand Header ── */
  .ob-brand {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 2rem;
  }
  .ob-brand-logo {
    color: #e05046;
    font-size: 40px;
    font-weight: 800;
    line-height: 1;
    letter-spacing: -1px;
    margin-bottom: 0.35rem;
  }
  .ob-brand-sub {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .ob-brand-line {
    width: 28px;
    height: 2.5px;
    background: #e05046;
    border-radius: 2px;
  }
  .ob-brand-tag {
    font-size: 11px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: #e05046;
    font-weight: 600;
  }

  .ob-header {
    font-size: 22px;
    font-weight: 700;
    margin-bottom: 1.5rem;
    text-align: center;
    color: #111111;
  }

  /* ── Search Inputs ── */
  .ob-search-group {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 1.25rem;
  }
  .ob-search-input {
    width: 100%;
    padding: 14px 18px;
    font-size: 15px;
    border: 1.5px solid #E5E0D8;
    border-radius: 10px;
    background: #FAFAF8;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
    font-family: 'DM Sans', sans-serif;
    color: #111;
  }
  .ob-search-input::placeholder { color: #A8A29E; }
  .ob-search-input:focus {
    background: #FFFFFF;
    border-color: #D63B1F;
    box-shadow: 0 0 0 3px rgba(214,59,31,0.08);
  }
  .ob-search-input.secondary {
    font-size: 14px;
    padding: 11px 18px;
  }

  /* ── Empty State ── */
  .ob-empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem 1rem 1.5rem;
    gap: 10px;
  }
  .ob-empty-icon {
    width: 52px;
    height: 52px;
    background: #FEF3F0;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 0.25rem;
  }
  .ob-empty-icon svg { width: 24px; height: 24px; }
  .ob-empty-heading {
    font-size: 15px;
    font-weight: 600;
    color: #1C1917;
  }
  .ob-empty-sub {
    font-size: 13px;
    color: #9CA3AF;
    text-align: center;
    line-height: 1.5;
  }

  /* ── Results ── */
  .ob-search-results {
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-height: 340px;
    overflow-y: auto;
    scroll-behavior: smooth;
  }
  .ob-search-results::-webkit-scrollbar { width: 4px; }
  .ob-search-results::-webkit-scrollbar-track { background: transparent; }
  .ob-search-results::-webkit-scrollbar-thumb { background: #E2DDD6; border-radius: 4px; }

  .ob-result-card {
    padding: 11px 14px;
    background: #FFFFFF;
    border: 1.5px solid #EAE6DF;
    border-radius: 10px;
    cursor: pointer;
    transition: border-color 0.18s, box-shadow 0.18s, transform 0.18s;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .ob-result-card:hover {
    border-color: #D63B1F;
    transform: translateY(-1px);
    box-shadow: 0 4px 14px rgba(214,59,31,0.07);
  }
  .ob-result-card-img {
    width: 38px;
    height: 38px;
    border-radius: 8px;
    object-fit: cover;
    flex-shrink: 0;
    background: #F3F1EC;
  }
  .ob-result-card-avatar {
    width: 38px;
    height: 38px;
    border-radius: 8px;
    background: linear-gradient(135deg, #FEE2DC 0%, #FECDC6 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    font-size: 15px;
    font-weight: 700;
    color: #D63B1F;
  }
  .ob-result-name {
    font-weight: 600;
    font-size: 14px;
    color: #111;
    margin-bottom: 2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .ob-result-address {
    font-size: 12px;
    color: #9CA3AF;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .ob-result-rating {
    font-size: 12px;
    font-weight: 600;
    color: #F59E0B;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 2px;
  }

  /* ── Searching indicator ── */
  .ob-searching {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0.75rem 0;
    font-size: 13px;
    color: #9CA3AF;
  }
  .ob-dot-pulse {
    display: flex;
    gap: 4px;
  }
  .ob-dot-pulse span {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: #D63B1F;
    animation: obDotPulse 1.2s infinite;
    opacity: 0.4;
  }
  .ob-dot-pulse span:nth-child(2) { animation-delay: 0.2s; }
  .ob-dot-pulse span:nth-child(3) { animation-delay: 0.4s; }

  /* ── No Results ── */
  .ob-no-results {
    text-align: center;
    padding: 1.25rem 0;
    font-size: 13px;
    color: #9CA3AF;
    line-height: 1.6;
  }

  /* ── Can't find it ── */
  .ob-cant-find {
    margin-top: 1.25rem;
    padding-top: 1.25rem;
    border-top: 1px solid #F0EDE8;
    text-align: center;
    font-size: 13px;
    color: #9CA3AF;
  }
  .ob-cant-find-link {
    color: #D63B1F;
    font-weight: 600;
    cursor: pointer;
    text-decoration: none;
    margin-left: 4px;
    transition: opacity 0.15s;
  }
  .ob-cant-find-link:hover { opacity: 0.75; }

  /* ── Manual Form ── */
  .ob-manual-form {
    margin-top: 1rem;
    padding: 1.25rem;
    background: #FEF9F8;
    border: 1.5px solid #F5C9C1;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    animation: obFadeUp 0.3s ease both;
  }
  .ob-manual-form-title {
    font-size: 13px;
    font-weight: 600;
    color: #111;
    margin-bottom: 2px;
  }
  .ob-manual-input {
    width: 100%;
    padding: 10px 14px;
    font-size: 14px;
    border: 1.5px solid #E5E0D8;
    border-radius: 8px;
    background: #FFFFFF;
    outline: none;
    font-family: 'DM Sans', sans-serif;
    color: #111;
    transition: border-color 0.2s;
  }
  .ob-manual-input::placeholder { color: #B0A8A0; }
  .ob-manual-input:focus { border-color: #D63B1F; }
  .ob-btn {
    width: 100%;
    padding: 13px;
    background: #D63B1F;
    color: #fff;
    border: none;
    border-radius: 9px;
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
    letter-spacing: 0.01em;
  }
  .ob-btn:hover {
    background: #B83018;
    transform: translateY(-1px);
    box-shadow: 0 4px 14px rgba(214,59,31,0.2);
  }
  .ob-btn:active { transform: translateY(0); box-shadow: none; }
  .ob-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; }
  .ob-btn-cancel {
    background: none;
    border: none;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    color: #9CA3AF;
    cursor: pointer;
    text-align: center;
    margin-top: -4px;
    padding: 4px;
    transition: color 0.15s;
  }
  .ob-btn-cancel:hover { color: #111; }

  /* ── Loading Step ── */
  .ob-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 220px;
    gap: 20px;
  }
  .ob-spinner-ring {
    width: 52px;
    height: 52px;
    border-radius: 50%;
    border: 3px solid #F3EDE9;
    border-top-color: #D63B1F;
    animation: obSpin 0.8s linear infinite;
  }
  .ob-loading-text {
    font-size: 15px;
    font-weight: 500;
    color: #555;
    text-align: center;
    max-width: 280px;
    line-height: 1.5;
    animation: obPulse 1.8s ease-in-out infinite;
  }

  /* ── Animations ── */
  @keyframes obFadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes obSpin { to { transform: rotate(360deg); } }
  @keyframes obPulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.55; }
  }
  @keyframes obDotPulse {
    0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
    40% { opacity: 1; transform: scale(1); }
  }
`;

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#D63B1F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

export default function OnboardingFlow({ onComplete }) {
  const [step, setStep] = useState(1);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);

  // Search state
  const [nameQuery, setNameQuery] = useState('');
  const [areaQuery, setAreaQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Manual entry state
  const [showManual, setShowManual] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualAddress, setManualAddress] = useState('');
  const [manualPostcode, setManualPostcode] = useState('');

  // Loading texts for step 2
  const [loadingTextIndex, setLoadingTextIndex] = useState(0);
  const loadingTexts = [
    `Finding competitors near ${selectedRestaurant?.name || 'your restaurant'}...`,
    'Mapping your delivery radius...',
    'Pulling live platform data...',
    'Intelligence feed ready.',
  ];

  // ── Live search (debounced) ──
  useEffect(() => {
    if (!nameQuery || nameQuery.length < 2) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }
    setSearchLoading(true);
    const timer = setTimeout(async () => {
        let query = supabase
          .from('restaurants')
          .select('id, name, hero_image_url, address, city, cuisines, areas, rating, platform, lat, lng, master_id');

        const words = nameQuery.trim().split(/\s+/);
        words.forEach(w => {
          query = query.ilike('name', `%${w}%`);
        });

      if (areaQuery.trim().length >= 2) {
        // Filter by area OR address containing the area query
        query = query.or(`areas.ilike.%${areaQuery.trim()}%,address.ilike.%${areaQuery.trim()}%`);
      }

        const { data, error } = await query.limit(40);
        if (!error && data) {
          const grouped = {};
          data.forEach(res => {
            const key = res.master_id || res.id;
            if (!grouped[key]) {
              grouped[key] = {
                ...res,
                platforms: res.platform ? [res.platform] : [],
                all_ids: [res.id]
              };
            } else {
              if (res.platform && !grouped[key].platforms.includes(res.platform)) {
                grouped[key].platforms.push(res.platform);
              }
              if (!grouped[key].all_ids.includes(res.id)) {
                grouped[key].all_ids.push(res.id);
              }
              // Inherit coordinates from any sibling row (e.g. Deliveroo rows often lack lat/lng)
              if ((!grouped[key].lat || !grouped[key].lng) && res.lat && res.lng) {
                grouped[key].lat = res.lat;
                grouped[key].lng = res.lng;
              }
              if ((!grouped[key].areas || grouped[key].areas.length === 0) && res.areas && res.areas.length > 0) {
                grouped[key].areas = res.areas;
              }
            }
          });
          const results = Object.values(grouped);
          setSearchResults(results.slice(0, 8));
        }
      setSearchLoading(false);
    }, 320);
    return () => clearTimeout(timer);
  }, [nameQuery, areaQuery]);

  // When area changes but name is already typed, re-trigger search
  useEffect(() => {
    if (nameQuery.length >= 2 && areaQuery.length >= 2) {
      setSearchLoading(true); // will re-fire from nameQuery/areaQuery dep
    }
  }, [areaQuery]);

  // ── Loading step cycle ──
  useEffect(() => {
    if (step !== 2) return;
    let idx = 0;
    const interval = setInterval(() => {
      idx++;
      if (idx >= loadingTexts.length) {
        clearInterval(interval);
        setTimeout(() => {
          onComplete({ restaurant: selectedRestaurant, goal: null });
        }, 400);
      } else {
        setLoadingTextIndex(idx);
      }
    }, 2200);
    return () => clearInterval(interval);
  }, [step]);

  const handleSelectRestaurant = (restaurant) => {
    console.log('🎯 Onboarding selection. Target ID:', restaurant.id);
    localStorage.setItem('menu_iq_active_store_id', restaurant.id);
    localStorage.removeItem('macro_zoom_active');
    setSelectedRestaurant(restaurant);
    setStep(2);
  };

  const handleManualSubmit = () => {
    if (!manualName.trim()) return;
    const manualRestaurant = {
      id: `manual-${Date.now()}`,
      name: manualName.trim(),
      address: [manualAddress.trim(), manualPostcode.trim()].filter(Boolean).join(', ') || 'London',
      city: 'London',
      hero_image_url: null,
    };
    console.log('🎯 Manual restaurant entry:', manualRestaurant.name);
    localStorage.setItem('menu_iq_active_store_id', manualRestaurant.id);
    localStorage.removeItem('macro_zoom_active');
    setSelectedRestaurant(manualRestaurant);
    setStep(2);
  };

  const hasQuery = nameQuery.length >= 2;
  const showEmpty = !hasQuery && !showManual;
  const showResults = hasQuery && !searchLoading && searchResults.length > 0;
  const showNoResults = hasQuery && !searchLoading && searchResults.length === 0;

  return (
    <>
      <style>{styles}</style>
      <div className="onboarding-flow">
        <div className="ob-container">

          {/* ── Step 1: Search ── */}
          {step === 1 && (
            <div key="step1">
              {/* Brand */}
              <div className="ob-brand">
                <div className="ob-brand-logo">MenuIQ</div>
                <div className="ob-brand-sub">
                  <div className="ob-brand-line" />
                  <span className="ob-brand-tag">London Competitor Intelligence Tool</span>
                </div>
              </div>

              <h2 className="ob-header">Find your restaurant</h2>

              {/* Search fields */}
              <div className="ob-search-group">
                <input
                  id="ob-name-search"
                  type="text"
                  className="ob-search-input"
                  placeholder="Restaurant name…"
                  value={nameQuery}
                  onChange={(e) => { setNameQuery(e.target.value); setShowManual(false); }}
                  autoFocus
                  autoComplete="off"
                />
                <input
                  id="ob-area-search"
                  type="text"
                  className="ob-search-input secondary"
                  placeholder="Area or postcode (optional)"
                  value={areaQuery}
                  onChange={(e) => setAreaQuery(e.target.value)}
                  autoComplete="off"
                />
              </div>

              {/* Results area */}
              <div className="ob-search-results">
                {/* Searching indicator */}
                {searchLoading && (
                  <div className="ob-searching">
                    <div className="ob-dot-pulse">
                      <span /><span /><span />
                    </div>
                    Searching restaurants…
                  </div>
                )}

                {/* Empty state */}
                {showEmpty && (
                  <div className="ob-empty-state">
                    <div className="ob-empty-icon"><SearchIcon /></div>
                    <div className="ob-empty-heading">Search for your restaurant</div>
                    <div className="ob-empty-sub">
                      Type at least 2 characters to see matching results.<br />
                      You can also filter by area or postcode.
                    </div>
                  </div>
                )}

                {/* Results */}
                {showResults && searchResults.map(res => (
                  <div
                    key={res.id}
                    className="ob-result-card"
                    onClick={() => handleSelectRestaurant(res)}
                  >
                    {res.hero_image_url ? (
                      <img src={res.hero_image_url} alt={res.name} className="ob-result-card-img" />
                    ) : (
                      <div className="ob-result-card-avatar">
                        {res.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                        <div className="ob-result-name" style={{ marginBottom: 0 }}>{res.name}</div>
                        {res.platforms && res.platforms.length > 0 && (
                          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                            {res.platforms.map(p => {
                              const config = {
                                deliveroo: { color: '#00CCBC', Icon: DeliverooIcon, label: 'Deliveroo' },
                                ubereats: { color: '#06C167', Icon: UberEatsIcon, label: 'UberEats' },
                                justeat: { color: '#FF8000', Icon: JustEatIcon, label: 'Just Eat' },
                              }[p?.toLowerCase().replace(/\s+/g, '')];
                              if (!config) return null;
                              const { color, Icon, label } = config;
                              return (
                                <div key={p} style={{ background: color, width: '18px', height: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 1px 2px ${color}40` }} title={label}>
                                  <Icon color="#ffffff" size={10} />
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                      <div className="ob-result-address">{res.address || res.city || 'London'}</div>
                    </div>
                    {res.rating && (
                      <div className="ob-result-rating">
                        <span>★</span> {res.rating}
                      </div>
                    )}
                  </div>
                ))}

                {/* No results */}
                {showNoResults && !showManual && (
                  <div className="ob-no-results">
                    No results for <strong>"{nameQuery}"</strong>
                    {areaQuery && <> in <strong>{areaQuery}</strong></>}.
                  </div>
                )}
              </div>

              {/* Can't find it / Manual entry */}
              {!showManual && (
                <div className="ob-cant-find">
                  Can't find your restaurant?
                  <span
                    className="ob-cant-find-link"
                    onClick={() => setShowManual(true)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && setShowManual(true)}
                  >
                    Add it manually →
                  </span>
                </div>
              )}

              {showManual && (
                <div className="ob-manual-form">
                  <div className="ob-manual-form-title">Enter your restaurant details</div>
                  <input
                    id="ob-manual-name"
                    type="text"
                    className="ob-manual-input"
                    placeholder="Restaurant name *"
                    value={manualName}
                    onChange={(e) => setManualName(e.target.value)}
                    autoFocus
                  />
                  <input
                    id="ob-manual-address"
                    type="text"
                    className="ob-manual-input"
                    placeholder="Street address"
                    value={manualAddress}
                    onChange={(e) => setManualAddress(e.target.value)}
                  />
                  <input
                    id="ob-manual-postcode"
                    type="text"
                    className="ob-manual-input"
                    placeholder="Postcode"
                    value={manualPostcode}
                    onChange={(e) => setManualPostcode(e.target.value)}
                  />
                  <button
                    className="ob-btn"
                    onClick={handleManualSubmit}
                    disabled={!manualName.trim()}
                  >
                    Continue →
                  </button>
                  <button className="ob-btn-cancel" onClick={() => setShowManual(false)}>
                    Cancel
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── Step 2: Loading ── */}
          {step === 2 && (
            <div key="step2">
              <div className="ob-loading">
                <div className="ob-spinner-ring" />
                <div className="ob-loading-text">
                  {loadingTexts[loadingTextIndex]}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
