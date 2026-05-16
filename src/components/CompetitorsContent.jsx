import React, { useState } from 'react';
import { Map, Maximize2, Minimize2, Star, TrendingUp, TrendingDown, Tag, Plus, Check, Search } from 'lucide-react';
import { MapContainer, TileLayer, Circle, Marker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const LONDON_CENTER = [51.5072, -0.1276];

const MOCK_COMPETITORS = [
  { id: 1, name: 'Burger King', lat: 51.512, lng: -0.134, distance: 2.9, threat: 'red', image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=150&q=80', platforms: ['UberEats', 'Deliveroo'], health: 85, promos: 2, priceChanges: 3 },
  { id: 2, name: 'Five Guys', lat: 51.501, lng: -0.120, distance: 3.8, threat: 'red', image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=150&q=80', platforms: ['UberEats', 'Deliveroo', 'JustEat'], health: 90, promos: 1, priceChanges: 0 },
  { id: 3, name: 'Local Diner', lat: 51.520, lng: -0.105, distance: 4.6, threat: 'amber', image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=150&q=80', platforms: ['UberEats'], health: 60, promos: 0, priceChanges: 1 },
  { id: 4, name: 'Pizza Express', lat: 51.495, lng: -0.145, distance: 5.8, threat: 'amber', image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=150&q=80', platforms: ['Deliveroo'], health: 70, promos: 3, priceChanges: 2 },
  { id: 5, name: 'Vegan Heaven', lat: 51.518, lng: -0.090, distance: 5.0, threat: 'green', image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=150&q=80', platforms: ['JustEat'], health: 40, promos: 0, priceChanges: 0 },
  { id: 6, name: 'Chicken Shop', lat: 51.490, lng: -0.110, distance: 6.6, threat: 'red', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=150&q=80', platforms: ['UberEats', 'JustEat'], health: 80, promos: 1, priceChanges: 4 },
  { id: 7, name: 'Pasta Loco', lat: 51.510, lng: -0.160, distance: 6.1, threat: 'green', image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=150&q=80', platforms: ['Deliveroo'], health: 45, promos: 0, priceChanges: 0 },
];

const customIcon = L.divIcon({
  className: 'custom-leaflet-pin',
  html: `
    <div style="position: relative; display: flex; align-items: center; justify-content: center; cursor: pointer;">
      <div class="pin-halo" style="width: 36px; height: 36px; border-radius: 50%; background: rgba(245, 158, 11, 0.2); position: absolute;"></div>
      <div class="pin-core" style="width: 12px; height: 12px; border-radius: 50%; background: #F59E0B; box-shadow: 0 2px 4px rgba(245, 158, 11, 0.5);"></div>
    </div>
  `,
  iconSize: [36, 36],
  iconAnchor: [18, 18]
});

const ownerIcon = L.divIcon({
  className: 'owner-pin',
  html: `<div style="width: 24px; height: 24px; background: #111; border-radius: 50%; border: 4px solid #fff; box-shadow: 0 4px 10px rgba(0,0,0,0.2);"></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

const CompetitorsContent = () => {
  const [radius, setRadius] = useState(5); // Default to 5 miles
  const [mapExpanded, setMapExpanded] = useState(false);
  const [watchlistIds, setWatchlistIds] = useState([2]); 
  const [activeTab, setActiveTab] = useState('Directory');

  const toggleWatchlist = (id, e) => {
    if (e) e.stopPropagation();
    setWatchlistIds(prev => prev.includes(id) ? prev.filter(wId => wId !== id) : [...prev, id]);
  };

  const visibleCompetitors = MOCK_COMPETITORS.filter(c => c.distance <= radius);
  const watchlistedCompetitors = MOCK_COMPETITORS.filter(c => watchlistIds.includes(c.id));

  const displayCompetitors = activeTab === 'Directory' ? visibleCompetitors : watchlistedCompetitors;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Map Widget Section - Full Bleed Style */}
      <div 
        style={{ position: 'relative', height: mapExpanded ? '70vh' : '50vh', flexShrink: 0, borderRadius: '24px', overflow: 'hidden', transition: 'height 0.4s cubic-bezier(0.4, 0, 0.2, 1)', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
      >
        <MapContainer 
          center={LONDON_CENTER} 
          zoom={13} 
          zoomControl={false}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%', zIndex: 0 }}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
          />

          {/* Owner Pin (Center) */}
          <Marker position={LONDON_CENTER} icon={ownerIcon} />

          {/* Radius Circle */}
          <Circle 
            center={LONDON_CENTER}
            radius={radius * 1609.34}
            pathOptions={{ color: '#F59E0B', fillColor: '#F59E0B', fillOpacity: 0.08, weight: 1, dashArray: '4' }}
          />

          {/* Competitor Pins */}
          {MOCK_COMPETITORS.map(comp => {
            const isVisible = comp.distance <= radius || watchlistIds.includes(comp.id);
            if (!isVisible) return null;
            
            return (
              <Marker 
                key={comp.id}
                position={[comp.lat, comp.lng]}
                icon={customIcon}
              >
                <Tooltip direction="top" offset={[0, -15]} opacity={1} className="custom-tooltip">
                  <div style={{ background: '#111', borderRadius: '16px', padding: '1rem', display: 'flex', gap: '1rem', color: '#fff', boxShadow: '0 10px 25px rgba(0,0,0,0.3)', whiteSpace: 'nowrap', position: 'relative' }}>
                    {/* Small pointer at bottom */}
                    <div style={{ position: 'absolute', bottom: '-4px', left: '50%', transform: 'translateX(-50%) rotate(45deg)', width: '10px', height: '10px', background: '#111' }}></div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingRight: '1rem', borderRight: '1px solid rgba(255,255,255,0.2)' }}>
                      <span style={{ fontSize: '1.5rem', fontWeight: 600 }}>{comp.health}</span>
                      <span style={{ fontSize: '0.65rem', color: '#9CA3AF', marginTop: '0.25rem' }}>Health Score</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingRight: '1rem', borderRight: '1px solid rgba(255,255,255,0.2)' }}>
                      <span style={{ fontSize: '1.5rem', fontWeight: 600 }}>{comp.priceChanges}</span>
                      <span style={{ fontSize: '0.65rem', color: '#9CA3AF', marginTop: '0.25rem' }}>Price Changes</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '1.5rem', fontWeight: 600 }}>{comp.promos}</span>
                      <span style={{ fontSize: '0.65rem', color: '#9CA3AF', marginTop: '0.25rem' }}>Active Promos</span>
                    </div>
                  </div>
                </Tooltip>
              </Marker>
            );
          })}
        </MapContainer>

        {/* Top Bar Overlay (Floating Pills) */}
        <div 
          onMouseDown={(e) => e.stopPropagation()}
          style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', right: '1.5rem', display: 'flex', gap: '0.75rem', zIndex: 30, alignItems: 'center' }}
        >
          <div style={{ flex: 1, background: '#fff', borderRadius: '9999px', padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', boxShadow: '0 4px 15px rgba(0,0,0,0.08)' }}>
            <Search size={18} color="#9CA3AF" />
            <input type="text" placeholder="Search" style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.9rem', color: '#111' }} />
          </div>
          <select style={{ background: '#fff', borderRadius: '9999px', padding: '0.75rem 1.5rem', border: 'none', outline: 'none', fontSize: '0.9rem', boxShadow: '0 4px 15px rgba(0,0,0,0.08)', cursor: 'pointer', color: '#111', fontWeight: 500, appearance: 'none', paddingRight: '2.5rem', backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23111%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem top 50%', backgroundSize: '0.65rem auto' }}><option>Platform</option><option>UberEats</option><option>Deliveroo</option></select>
          <select style={{ background: '#fff', borderRadius: '9999px', padding: '0.75rem 1.5rem', border: 'none', outline: 'none', fontSize: '0.9rem', boxShadow: '0 4px 15px rgba(0,0,0,0.08)', cursor: 'pointer', color: '#111', fontWeight: 500, appearance: 'none', paddingRight: '2.5rem', backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23111%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem top 50%', backgroundSize: '0.65rem auto' }}><option>Threat Level</option><option>High</option><option>Moderate</option></select>
          
          {/* Radius Slider styled as a floating pill */}
          <div style={{ background: '#fff', borderRadius: '9999px', padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', boxShadow: '0 4px 15px rgba(0,0,0,0.08)' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 500, color: '#111' }}>Radius: {radius}mi</span>
            <input type="range" min="1" max="10" value={radius} onChange={(e) => setRadius(parseInt(e.target.value))} style={{ width: '80px', accentColor: '#111' }} />
          </div>

          <button onClick={() => setMapExpanded(!mapExpanded)} style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#111', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
            {mapExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
        </div>

        </div>

      {/* Two Sections: Directory & Watchlist */}
      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: '1rem' }}>
          <button 
            onClick={() => setActiveTab('Directory')}
            style={{ background: 'transparent', border: 'none', fontSize: '1.125rem', fontWeight: activeTab === 'Directory' ? 800 : 500, color: activeTab === 'Directory' ? '#000' : '#6B7280', cursor: 'pointer', position: 'relative' }}
          >
            Directory
            {activeTab === 'Directory' && <div style={{ position: 'absolute', bottom: '-1rem', left: 0, right: 0, height: '3px', background: '#000', borderRadius: '3px 3px 0 0' }}></div>}
          </button>
          <button 
            onClick={() => setActiveTab('Watchlist')}
            style={{ background: 'transparent', border: 'none', fontSize: '1.125rem', fontWeight: activeTab === 'Watchlist' ? 800 : 500, color: activeTab === 'Watchlist' ? '#000' : '#6B7280', cursor: 'pointer', position: 'relative', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            Watchlist
            <span style={{ background: '#F3F4F6', color: '#000', fontSize: '0.75rem', padding: '0.1rem 0.5rem', borderRadius: '9999px', fontWeight: 600 }}>{watchlistIds.length}</span>
            {activeTab === 'Watchlist' && <div style={{ position: 'absolute', bottom: '-1rem', left: 0, right: 0, height: '3px', background: '#000', borderRadius: '3px 3px 0 0' }}></div>}
          </button>
        </div>

        {/* Competitor Grid (Location Style Cards) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem', paddingRight: '0.5rem', paddingBottom: '1rem' }}>
          {displayCompetitors.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center', color: '#6B7280', fontSize: '1rem' }}>
              No competitors found.
            </div>
          ) : displayCompetitors.map(comp => (
            <div key={comp.id} style={{ background: '#fff', borderRadius: '24px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', transition: 'transform 0.2s, box-shadow 0.2s', border: '1px solid rgba(0,0,0,0.04)' }} onMouseEnter={(e) => {e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.06)';}} onMouseLeave={(e) => {e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none';}}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#111' }}>{comp.name}</h3>
                  <div style={{ fontSize: '0.875rem', color: '#6B7280', marginTop: '0.25rem' }}>{comp.distance}mi away • {comp.platforms.join(', ')}</div>
                </div>
                <button onClick={() => toggleWatchlist(comp.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.25rem' }}>
                  <Star size={20} fill={watchlistIds.includes(comp.id) ? '#F59E0B' : 'none'} color={watchlistIds.includes(comp.id) ? '#F59E0B' : '#9CA3AF'} />
                </button>
              </div>

              {/* Data Blocks matching "Location" card */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginTop: 'auto' }}>
                <div style={{ background: '#F8FAFC', padding: '1.25rem 1rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <TrendingUp size={18} color="#9CA3AF" />
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '0.25rem', fontWeight: 500 }}>Health Score</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 500, color: '#111', fontFamily: 'Playfair Display, serif' }}>{comp.health}</div>
                  </div>
                </div>
                <div style={{ background: '#F8FAFC', padding: '1.25rem 1rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <TrendingDown size={18} color="#9CA3AF" />
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '0.25rem', fontWeight: 500 }}>Price Chgs</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 500, color: '#111', fontFamily: 'Playfair Display, serif' }}>{comp.priceChanges}</div>
                  </div>
                </div>
                <div style={{ background: '#F8FAFC', padding: '1.25rem 1rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <Tag size={18} color="#9CA3AF" />
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '0.25rem', fontWeight: 500 }}>Active Promos</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 500, color: '#111', fontFamily: 'Playfair Display, serif' }}>{comp.promos}</div>
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CompetitorsContent;
