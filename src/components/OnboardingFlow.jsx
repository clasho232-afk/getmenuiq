import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;700&display=swap');

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
    max-width: 600px;
    background: #FFFFFF;
    border-radius: 16px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.05);
    padding: 3rem;
    display: flex;
    flex-direction: column;
    animation: obFadeUp 0.5s ease both;
  }

  .ob-header {
    font-size: 28px;
    font-weight: 700;
    margin-bottom: 2rem;
    text-align: center;
    color: #111111;
  }

  /* Step 1 */
  .ob-search-input {
    width: 100%;
    padding: 16px 24px;
    font-size: 18px;
    border: none;
    border-radius: 12px;
    background: #F7F5F0;
    box-shadow: inset 0 2px 5px rgba(0,0,0,0.02), 0 2px 10px rgba(0,0,0,0.05);
    outline: none;
    transition: box-shadow 0.2s, background 0.2s;
    font-family: 'DM Sans', sans-serif;
  }
  .ob-search-input:focus {
    background: #FFFFFF;
    box-shadow: 0 0 0 2px #D63B1F, 0 4px 15px rgba(214,59,31,0.1);
  }

  .ob-search-results {
    margin-top: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .ob-result-card {
    padding: 12px 16px;
    background: #FFFFFF;
    border: 1px solid #E2DDD6;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .ob-result-card-img {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    object-fit: cover;
    flex-shrink: 0;
  }
  .ob-result-card:hover {
    border-color: #D63B1F;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(214,59,31,0.08);
  }
  .ob-result-name {
    font-weight: 500;
    font-size: 16px;
    margin-bottom: 4px;
  }
  .ob-result-address {
    font-size: 14px;
    color: #6B6B6B;
  }

  /* Step 2 */
  .ob-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 16px;
    margin-bottom: 2rem;
  }
  .ob-goal-card {
    padding: 24px 16px;
    background: #FFFFFF;
    border: 2px solid #E2DDD6;
    border-radius: 12px;
    cursor: pointer;
    text-align: center;
    transition: all 0.2s ease;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 120px;
    gap: 12px;
  }
  .ob-goal-card.selected {
    border-color: #D63B1F;
    background: rgba(214,59,31,0.03);
    box-shadow: 0 4px 12px rgba(214,59,31,0.08);
  }
  .ob-goal-name {
    font-weight: 600;
    font-size: 16px;
    line-height: 1.3;
  }
  
  .ob-btn {
    width: 100%;
    padding: 16px;
    background: #D63B1F;
    color: #fff;
    border: none;
    border-radius: 8px;
    font-family: 'DM Sans', sans-serif;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s, transform 0.15s;
    margin-top: 1rem;
  }
  .ob-btn:hover { background: #B83018; transform: translateY(-1px); }
  .ob-btn:active { transform: translateY(0); }
  .ob-btn:disabled { opacity: 0.6; cursor: not-allowed; }

  /* Step 3 */
  .ob-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 200px;
  }
  .ob-spinner {
    width: 48px;
    height: 48px;
    border: 3px solid rgba(214,59,31,0.2);
    border-top-color: #D63B1F;
    border-radius: 50%;
    animation: obSpin 1s linear infinite;
    margin-bottom: 24px;
  }
  .ob-loading-text {
    font-size: 18px;
    font-weight: 500;
    color: #111111;
    animation: obPulse 1.5s infinite;
  }

  @keyframes obFadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes obSpin {
    to { transform: rotate(360deg); }
  }
  @keyframes obPulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
  }
`;





export default function OnboardingFlow({ onComplete }) {
  const [step, setStep] = useState(1);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [userGoal, setUserGoal] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [initialResults, setInitialResults] = useState([]);
  
  const [loadingTextIndex, setLoadingTextIndex] = useState(0);
  const loadingTexts = [
    `Mapping delivery radius for ${selectedRestaurant?.name || 'your restaurant'}...`,
    "Identifying direct competitors in local area...",
    `Calibrating intelligence feed for ${userGoal || 'your goals'}...`,
    "Market tracking initialized."
  ];

  useEffect(() => {
    if (step === 3) {
      let currentIndex = 0;
      const interval = setInterval(() => {
        currentIndex++;
        if (currentIndex >= loadingTexts.length) {
          clearInterval(interval);
          setTimeout(() => {
            setStep(4);
          }, 500);
        } else {
          setLoadingTextIndex(currentIndex);
        }
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [step, loadingTexts.length]);

  // Fetch a few popular restaurants on mount for initial display
  useEffect(() => {
    const fetchInitial = async () => {
      const { data } = await supabase
        .from('restaurants')
        .select('id, name, hero_image_url, address, city, cuisines, areas, rating')
        .order('rating_count', { ascending: false })
        .limit(5);
      if (data) setInitialResults(data);
    };
    fetchInitial();
  }, []);

  // Debounced live search
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }
    setSearchLoading(true);
    const timer = setTimeout(async () => {
      const { data, error } = await supabase
        .from('restaurants')
        .select('id, name, hero_image_url, address, city, cuisines, areas, rating')
        .ilike('name', `%${searchQuery}%`)
        .limit(8);
      if (!error && data) setSearchResults(data);
      setSearchLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (step === 4) {
      onComplete({ restaurant: selectedRestaurant, goal: userGoal });
    }
  }, [step, onComplete, userGoal, selectedRestaurant]);

  const handleSelectRestaurant = (restaurant) => {
    console.log("🎯 Onboarding selection recorded. Target ID:", restaurant.id);
    localStorage.setItem('menu_iq_active_store_id', restaurant.id);
    localStorage.removeItem('macro_zoom_active');
    setSelectedRestaurant(restaurant);
    setStep(2);
  };

  const displayResults = searchQuery.length >= 2 ? searchResults : initialResults;

  return (
    <>
      <style>{styles}</style>
      <div className="onboarding-flow">
        <div className="ob-container">
          {step === 1 && (
            <div className="ob-step" key="step1">
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div style={{ color: '#e05046', fontFamily: "'Lufga', sans-serif", fontSize: '42px', fontWeight: 800, marginBottom: '0.25rem', lineHeight: 1 }}>
                  MenuIQ
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '32px', height: '3px', background: '#e05046', borderRadius: '2px' }}></div>
                  <span style={{ fontSize: '12px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#e05046', fontWeight: 600 }}>
                    London Competitor Intelligence Tool
                  </span>
                </div>
              </div>
              <h2 className="ob-header">Find your restaurant</h2>
              <input 
                type="text" 
                className="ob-search-input" 
                placeholder="Search by name or address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              <div className="ob-search-results">
                {searchLoading && (
                  <div style={{ textAlign: 'center', color: '#6B6B6B', padding: '1rem', fontSize: '14px' }}>
                    Searching restaurants...
                  </div>
                )}
                {!searchLoading && displayResults.map(res => (
                  <div 
                    key={res.id} 
                    className="ob-result-card"
                    onClick={() => handleSelectRestaurant(res)}
                  >
                    {res.hero_image_url ? (
                      <img src={res.hero_image_url} alt={res.name} className="ob-result-card-img" />
                    ) : (
                      <div className="ob-result-card-img" style={{ background: '#F3F1EC', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700, color: '#9CA3AF' }}>
                        {res.name?.charAt(0) || '?'}
                      </div>
                    )}
                    <div style={{ flex: 1 }}>
                      <div className="ob-result-name" style={{ marginBottom: '2px' }}>{res.name}</div>
                      <div className="ob-result-address">{res.address || res.city || 'London'}</div>
                    </div>
                    {res.rating && (
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#F59E0B', flexShrink: 0 }}>★ {res.rating}</div>
                    )}
                  </div>
                ))}
                {searchQuery.length >= 2 && !searchLoading && displayResults.length === 0 && (
                  <div style={{ textAlign: 'center', color: '#6B6B6B', padding: '1rem' }}>
                    No restaurants found for "{searchQuery}"
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="ob-step" key="step2">
              <h2 className="ob-header">What is your primary focus?</h2>
              <div className="ob-grid">
                {['Optimize Pricing', 'Track Promotions', 'Maximize Delivery Reach'].map(goal => {
                  const isSelected = userGoal === goal;
                  return (
                    <div 
                      key={goal}
                      className={`ob-goal-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => setUserGoal(goal)}
                    >
                      <span className="ob-goal-name">{goal}</span>
                    </div>
                  );
                })}
              </div>
              <button 
                className="ob-btn"
                onClick={() => setStep(3)}
                disabled={!userGoal}
              >
                Calibrate Engine
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="ob-step" key="step3">
              <div className="ob-loading">
                <div className="ob-spinner"></div>
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
