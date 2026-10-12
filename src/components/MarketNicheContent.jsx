import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { MapPin, Search, ChevronUp, ChevronDown, Plus, Minus, Maximize, X } from 'lucide-react';
import Map, { Source, Layer, Marker } from 'react-map-gl/maplibre';
import eastLondonGeojson from '../data/east-london-boundaries.json';
import CompetitorPricingTab from './CompetitorPricingTab';

const mockNiches = [
  {
    id: 'niche_01',
    areaId: 'whitechapel',
    name: 'Smash Burger Double',
    score: '95',
    category: 'Burgers Category',
    platform: 'UberEats',
    parentCategory: 'Burgers',
    nicheCategory: 'Burgers',
    type: 'Beef Burger',
    itemType: 'Mains',
    isSuggested: true,
    locationName: 'Trending in Whitechapel',
    description: 'High demand for premium smash burgers. Quick prep time and high margin.',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
    stat1Label: 'AVG. MARKET PRICE',
    stat1Value: '£11.50',
    stat2Label: 'LOCAL RIVALS',
    stat2Value: '12',
    stat3Label: 'EST. MARGIN',
    stat3Value: '72%',
    areas: ['Whitechapel', 'Shoreditch'],
    lowPrice: '£8.50',
    highPrice: '£15.00',
    competitors: [
      { name: 'Burger & Beyond', price: '£14.50', image: 'https://ui-avatars.com/api/?name=Burger+Beyond&background=random' },
      { name: 'Honest Burgers', price: '£12.50', image: 'https://ui-avatars.com/api/?name=Honest+Burgers&background=random' }
    ]
  },
  {
    id: 'niche_02',
    areaId: 'bethnal_east',
    name: 'Peri-Peri Chicken Half',
    score: '88',
    category: 'Chicken Category',
    platform: 'Deliveroo',
    parentCategory: 'Chicken',
    nicheCategory: 'Chicken',
    type: 'Grilled Chicken',
    itemType: 'Mains',
    locationName: 'Trending in Bethnal Green',
    description: 'Spicy grilled chicken is a staple. High volume potential with combo meals.',
    image: 'https://images.unsplash.com/photo-1598514982205-f36b96d1e8d4?auto=format&fit=crop&w=800&q=80',
    stat1Label: 'AVG. MARKET PRICE',
    stat1Value: '£9.00',
    stat2Label: 'LOCAL RIVALS',
    stat2Value: '8',
    stat3Label: 'EST. MARGIN',
    stat3Value: '68%',
    areas: ['Bethnal Green', 'Stepney'],
    lowPrice: '£6.50',
    highPrice: '£12.00',
    competitors: [
      { name: 'Nandos East', price: '£10.50', image: 'https://ui-avatars.com/api/?name=Nandos+East&background=random' },
      { name: 'Roosters Piri Piri', price: '£8.50', image: 'https://ui-avatars.com/api/?name=Roosters+Piri+Piri&background=random' }
    ]
  },
  {
    id: 'niche_03',
    areaId: 'shoreditch',
    name: 'Loaded Beef Nachos',
    score: '82',
    category: 'Sides Category',
    platform: 'Just Eat',
    parentCategory: 'Sides',
    nicheCategory: 'Mexican',
    type: 'Nachos',
    itemType: 'Sides',
    isSuggested: true,
    locationName: 'Trending in Shoreditch',
    description: 'Perfect add-on item for groups. Very low cost of goods.',
    image: 'https://images.unsplash.com/photo-1513442542250-854d436a73f2?auto=format&fit=crop&w=800&q=80',
    stat1Label: 'AVG. MARKET PRICE',
    stat1Value: '£7.50',
    stat2Label: 'LOCAL RIVALS',
    stat2Value: '5',
    stat3Label: 'EST. MARGIN',
    stat3Value: '85%',
    areas: ['Shoreditch', 'Hackney'],
    lowPrice: '£5.00',
    highPrice: '£10.50',
    competitors: [
      { name: 'Tortilla', price: '£8.00', image: 'https://ui-avatars.com/api/?name=Tortilla&background=random' },
      { name: 'Chilango', price: '£7.50', image: 'https://ui-avatars.com/api/?name=Chilango&background=random' }
    ]
  },
  {
    id: 'niche_04',
    areaId: 'hackney',
    name: 'Spicy Buffalo Wings',
    score: '78',
    category: 'Sides Category',
    platform: 'UberEats',
    parentCategory: 'Sides',
    nicheCategory: 'Chicken',
    type: 'Chicken Wings',
    itemType: 'Sides',
    locationName: 'Trending in Hackney',
    description: 'Highly popular late-night item. Easy to prep in large batches.',
    image: 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?auto=format&fit=crop&w=800&q=80',
    stat1Label: 'AVG. MARKET PRICE',
    stat1Value: '£6.50',
    stat2Label: 'LOCAL RIVALS',
    stat2Value: '15',
    stat3Label: 'EST. MARGIN',
    stat3Value: '70%',
    areas: ['Hackney', 'Bethnal Green'],
    lowPrice: '£4.50',
    highPrice: '£9.00',
    competitors: [
      { name: 'Wingstop', price: '£8.50', image: 'https://ui-avatars.com/api/?name=Wingstop&background=random' },
      { name: 'Chicken Shop', price: '£6.00', image: 'https://ui-avatars.com/api/?name=Chicken+Shop&background=random' }
    ]
  }
];

const MarketNicheContent = () => {
  const mapRef = useRef(null);

  const [hoveredCardId, setHoveredCardId] = useState(null);
  const [selectedModalNiche, setSelectedModalNiche] = useState(mockNiches[0]);
  const [analysisState, setAnalysisState] = useState('idle'); // 'idle', 'analyzing', 'results'
  const [activePrimaryTab, setActivePrimaryTab] = useState('All');
  const [activeDetailTab, setActiveDetailTab] = useState('Overview');
  const [hoveredAreaId, setHoveredAreaId] = useState(null);
  const [selectedAreaId, setSelectedAreaId] = useState(null);
  const [mapZoom, setMapZoom] = useState(12.5);

  const mockMapLocations = useMemo(() => {
    if (!selectedModalNiche) return [];
    
    // Vary the spread based on the niche id to simulate the user's request
    let baseLat = 51.52;
    let baseLng = -0.05;
    let spread = 0.01; // tight spread
    let numLocations = 8;
    
    if (selectedModalNiche.id === 'niche_02' || selectedModalNiche.id === 'niche_04') {
      spread = 0.08; // wide spread across central & east london
      numLocations = 15;
    } else if (selectedModalNiche.id === 'niche_03') {
      spread = 0.03; // medium spread
      numLocations = 12;
    }
    
    // Seeded random for consistent locations per niche
    const seed = selectedModalNiche.id.charCodeAt(selectedModalNiche.id.length - 1);
    const random = (i) => Math.abs(Math.sin(seed + i) * 10000 % 1); 
    
    const restaurantNames = ['Gourmet Kitchen', 'The Rustic Oven', 'Street Food Co.', 'Local Favorites', 'Bite Club', 'Quick Eats', 'Value Meals', 'Burger Point', 'Flame Grill', 'Smash Bros', 'The Grill House', 'Urban Bites', 'Taste of London', 'City Diner', 'The Food Hub'];
    
    const locations = [];
    for (let i = 0; i < numLocations; i++) {
      locations.push({
        id: i,
        name: restaurantNames[i % restaurantNames.length],
        price: `£${(10 + random(i) * 10).toFixed(2)}`,
        lat: baseLat + (random(i + 10) - 0.5) * spread,
        lng: baseLng + (random(i + 20) - 0.5) * spread,
      });
    }
    return locations;
  }, [selectedModalNiche]);

  const getPlatformLogoUrl = (platform) => {
    switch (platform) {
      case 'UberEats': return 'https://img.icons8.com/color/48/uber-eats-app.png';
      case 'Deliveroo': return 'https://img.icons8.com/color/48/deliveroo.png';
      case 'Just Eat': return 'https://img.icons8.com/color/48/just-eat.png';
      default: return 'https://img.icons8.com/color/48/food-delivery.png';
    }
  };

  const getPlatformPill = (platform) => {
    const iconStyle = { width: '20px', height: '20px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #E5E7EB', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' };
    if (platform === 'UberEats') {
        return <img src="https://www.google.com/s2/favicons?domain=ubereats.com&sz=128" alt="UberEats" style={iconStyle} title="UberEats" />;
    }
    if (platform === 'Deliveroo') {
        return <img src="https://www.google.com/s2/favicons?domain=deliveroo.co.uk&sz=128" alt="Deliveroo" style={iconStyle} title="Deliveroo" />;
    }
    if (platform === 'Just Eat') {
        return <img src="https://www.google.com/s2/favicons?domain=just-eat.co.uk&sz=128" alt="Just Eat" style={iconStyle} title="Just Eat" />;
    }
    return null;
  };
  
  const USER_CATEGORY = 'Pizza';

  const filteredNiches = useMemo(() => {
    let niches = mockNiches;
    if (selectedAreaId) niches = niches.filter(n => n.areaId === selectedAreaId);
    
    if (activePrimaryTab !== 'All') {
      niches = niches.filter(n => n.category.includes('Pizza') || n.score > 85); 
    }
    return niches;
  }, [selectedAreaId, activePrimaryTab]);

  const handleAnalyze = () => {
    setAnalysisState('analyzing');
    setTimeout(() => {
      setAnalysisState('results');
    }, 7000);
  };

  const onMapHover = useCallback(event => {
    const { features } = event;
    const hoveredFeature = features && features[0];
    if (hoveredFeature) {
      setHoveredAreaId(hoveredFeature.properties.id);
    } else {
      if (!hoveredCardId) setHoveredAreaId(null);
    }
  }, [hoveredCardId]);

  const onMapClick = useCallback(event => {
    const { features } = event;
    const clickedFeature = features && features[0];
    if (clickedFeature) {
      setSelectedAreaId(prev => prev === clickedFeature.properties.id ? null : clickedFeature.properties.id);
    } else {
      setSelectedAreaId(null);
    }
  }, []);

  const polygonFillStyle = {
    id: 'areas-fill',
    type: 'fill',
    paint: {
      'fill-color': [
        'case',
        ['==', ['get', 'id'], hoveredAreaId], 'rgba(224, 80, 70, 0.15)',
        ['==', ['get', 'id'], selectedAreaId], 'rgba(224, 80, 70, 0.15)',
        'rgba(0, 0, 0, 0)'
      ]
    }
  };

  const polygonOutlineStyle = {
    id: 'areas-outline',
    type: 'line',
    paint: {
      'line-color': [
        'case',
        ['==', ['get', 'id'], hoveredAreaId], 'rgba(224, 80, 70, 0.8)',
        ['==', ['get', 'id'], selectedAreaId], 'rgba(224, 80, 70, 0.8)',
        'rgba(0, 0, 0, 0.2)'
      ],
      'line-width': [
        'case',
        ['==', ['get', 'id'], hoveredAreaId], 2,
        ['==', ['get', 'id'], selectedAreaId], 2,
        1
      ]
    }
  };

  useEffect(() => {
    if (mapRef.current && mockMapLocations.length > 0) {
      const lats = mockMapLocations.map(l => l.lat);
      const lngs = mockMapLocations.map(l => l.lng);
      
      const minLng = Math.min(...lngs);
      const maxLng = Math.max(...lngs);
      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);
      
      // Calculate a small padding manually if fitBounds padding has issues or just use fitBounds
      mapRef.current.fitBounds(
        [
          [minLng, minLat],
          [maxLng, maxLat]
        ],
        { padding: 60, duration: 1000 }
      );
    }
  }, [mockMapLocations, selectedModalNiche]);

  return (
    <div className="niche-terminal-root">
      
      {/* LEFT PANE: Niche Feed (List View) */}
      <div className="niche-feed-container">
        <div className="feed-header-wrapper" style={{ marginTop: '-5%' }}>
            <h1 className="feed-title sans-serif" style={{ marginBottom: '12px' }}>
                Market Niches
            </h1>

            {/* FILTER CHIPS */}
            <div className="primary-tabs-group" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {['All', 'Uber Eats', 'Deliveroo', 'Just Eat'].map(tab => {
                    const isActive = activePrimaryTab === tab;
                    const opacityStyle = { opacity: 1, cursor: 'pointer', border: '2px solid transparent', transition: 'all 0.2s', transform: isActive ? 'scale(1.05)' : 'scale(1)', filter: isActive ? 'saturate(1.2) brightness(1.05)' : 'saturate(1)' };
                    
                    if (tab === 'All') {
                        return (
                          <button key={tab} onClick={() => setActivePrimaryTab(tab)} style={{ background: '#1A1A1A', padding: '0.4rem 1.2rem', borderRadius: '9999px', display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', ...opacityStyle }}>
                            <span style={{ fontSize: '12px', fontWeight: 700, color: '#FFFFFF', whiteSpace: 'nowrap' }}>All</span>
                          </button>
                        );
                    }
                    if (tab === 'Deliveroo') {
                        return (
                          <button key={tab} onClick={() => setActivePrimaryTab(tab)} style={{ background: '#00CCBC', padding: '0.4rem 0.8rem', borderRadius: '9999px', display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 1px 2px rgba(0, 204, 188, 0.2)', ...opacityStyle }}>
                            <img src="https://cdn.simpleicons.org/deliveroo/white" alt="Deliveroo" style={{ height: '14px', width: '14px' }} />
                            <span style={{ fontSize: '12px', fontWeight: 800, color: '#FFFFFF', whiteSpace: 'nowrap' }}>Deliveroo</span>
                          </button>
                        );
                    }
                    if (tab === 'Uber Eats') {
                        return (
                          <button key={tab} onClick={() => setActivePrimaryTab(tab)} style={{ background: '#06C167', padding: '0.4rem 0.8rem', borderRadius: '9999px', display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 1px 2px rgba(6, 193, 103, 0.2)', ...opacityStyle }}>
                            <img src="https://cdn.simpleicons.org/ubereats/white" alt="UberEats" style={{ height: '14px', width: '14px' }} />
                            <span style={{ fontSize: '12px', fontWeight: 800, color: '#FFFFFF', whiteSpace: 'nowrap' }}>UberEats</span>
                          </button>
                        );
                    }
                    if (tab === 'Just Eat') {
                        return (
                          <button key={tab} onClick={() => setActivePrimaryTab(tab)} style={{ background: '#FF8000', padding: '0.4rem 0.8rem', borderRadius: '9999px', display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 1px 2px rgba(255, 128, 0, 0.2)', ...opacityStyle }}>
                            <img src="https://cdn.simpleicons.org/justeat/white" alt="Just Eat" style={{ height: '14px', width: '14px' }} />
                            <span style={{ fontSize: '12px', fontWeight: 800, color: '#FFFFFF', whiteSpace: 'nowrap' }}>Just Eat</span>
                          </button>
                        );
                    }
                    return null;
                })}
            </div>
        </div>

        <div className="feed-list">
          {filteredNiches.map((niche) => (
            <div 
              key={niche.id} 
              className={`niche-list-row ${selectedModalNiche?.id === niche.id ? 'selected' : ''}`}
              onClick={() => {
                  setSelectedModalNiche(niche);
                  setAnalysisState('idle');
              }}
            >
              <img src={niche.image} alt={niche.name} className="row-image" />
              <div className="row-content">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'auto' }}>
                  <div className="row-category" style={{ marginBottom: 0 }}>{niche.category}</div>
                  {niche.isSuggested && (
                    <div style={{ background: '#FFF0F0', color: '#E05046', padding: '4px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', letterSpacing: '0.5px' }}>
                      SUGGESTED
                    </div>
                  )}
                </div>
                <h3 className="row-title">{niche.name}</h3>
                  <div className="row-metrics expanded-metrics">
                    <div className="metric-group">
                      <span className="metric-label">Market Average:</span>
                      <span className="metric-highlight">{niche.stat1Value}</span> 
                    </div>
                    <span className="metric-separator">|</span> 
                    <div className="metric-group">
                      <span className="metric-label">Sellers:</span>
                      <span className="metric-highlight">{niche.stat2Value}</span>
                    </div>
                    <div style={{ flexBasis: '100%', height: '4px' }}></div>
                    <div className="metric-group">
                      <span className="metric-label">Sold in:</span>
                      <span className="metric-highlight">{niche.areas.length} areas</span>
                    </div>
                    <span className="metric-separator">|</span> 
                    <div className="metric-group" style={{ alignItems: 'center' }}>
                      <span className="metric-label">Platform:</span>
                      {getPlatformPill(niche.platform)}
                    </div>
                  </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT PANE: Detail View & Map */}
      <div className="niche-detail-container" style={{ marginTop: '-1%' }}>
        {selectedModalNiche ? (
          <div className="detail-inner">
            
            {/* Image Gallery */}
            <div className="detail-gallery">
                <img src={selectedModalNiche.image} className="gallery-main" alt="Main" />
                <div className="gallery-side">
                    <img src={selectedModalNiche.image} className="gallery-sub" alt="Sub 1" />
                    <img src={selectedModalNiche.image} className="gallery-sub" alt="Sub 2" />
                </div>
            </div>

            {/* Header Info */}
            <div className="detail-header-row" style={{ position: 'relative', marginBottom: '0' }}>
                <div className="detail-title-col" style={{ paddingRight: '160px' }}>
                    <h2 className="detail-title" style={{ margin: 0, paddingBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: '#64748B', fontWeight: '400' }}>Menu Item:</span>
                        {selectedModalNiche.name}
                    </h2>
                </div>
                <div className="detail-price-col" style={{ display: 'flex', gap: '16px', alignItems: 'center', position: 'absolute', right: 0, top: 0 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                        <div className="detail-price">{selectedModalNiche.stat1Value}</div>
                        <div className="detail-price-label" style={{ color: '#64748B', fontWeight: '500' }}>Avg Market Price</div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="detail-tabs">
                <div 
                  className={`detail-tab ${activeDetailTab === 'Overview' ? 'active' : ''}`}
                  onClick={() => setActiveDetailTab('Overview')}
                >Overview</div>
                <div 
                  className={`detail-tab ${activeDetailTab === 'Competitor Pricing' ? 'active' : ''}`}
                  onClick={() => setActiveDetailTab('Competitor Pricing')}
                >Competitor Pricing</div>
                <div 
                  className={`detail-tab ${activeDetailTab === 'Market Insights' ? 'active' : ''}`}
                  onClick={() => setActiveDetailTab('Market Insights')}
                >Market Insights</div>
            </div>

            {activeDetailTab === 'Overview' && (
              <>
                  {/* Unified Metrics Grid */}
                  <div className="detail-expanded-metrics" style={{ display: 'grid', gridTemplateColumns: 'max-content max-content max-content max-content', paddingBottom: '16px', marginBottom: '16px', borderBottom: '1px solid #E2E8F0' }}>
                      
                      {/* Row 1 */}
                      <div className="metric-group" style={{ gridColumn: 'span 2', paddingTop: '12px', paddingBottom: '12px', borderBottom: '1px solid #E2E8F0', paddingRight: '24px' }}>
                          <span className="metric-label" style={{ color: '#64748B' }}>Niche Category:</span> 
                          <span className="metric-highlight">{selectedModalNiche.nicheCategory}</span>
                      </div>
                      <div className="metric-group" style={{ gridColumn: 'span 2', paddingTop: '12px', paddingBottom: '12px', borderBottom: '1px solid #E2E8F0', borderLeft: '1px solid #E2E8F0', paddingLeft: '24px' }}>
                          <span className="metric-label" style={{ color: '#64748B' }}>Type:</span> 
                          <span className="metric-highlight">{selectedModalNiche.type}</span>
                      </div>

                      {/* Row 2 */}
                      <div className="metric-group" style={{ paddingTop: '12px', paddingRight: '24px' }}>
                          <span className="metric-label" style={{ color: '#64748B' }}>Sellers:</span> 
                          <span className="metric-highlight">{selectedModalNiche.areas ? selectedModalNiche.stat2Value : '12'}</span>
                      </div>
                      <div className="metric-group" style={{ paddingTop: '12px', borderLeft: '1px solid #E2E8F0', paddingLeft: '24px', paddingRight: '24px' }}>
                          <span className="metric-label" style={{ color: '#64748B' }}>Sold In:</span> 
                          <span className="metric-highlight">{selectedModalNiche.areas ? selectedModalNiche.areas.length + ' areas' : '2 areas'}</span>
                      </div>
                      <div className="metric-group" style={{ paddingTop: '12px', borderLeft: '1px solid #E2E8F0', paddingLeft: '24px', paddingRight: '24px' }}>
                          <span className="metric-label" style={{ color: '#64748B' }}>Highest Price:</span> 
                          <span className="metric-highlight">{selectedModalNiche.highPrice || '£15.00'}</span>
                      </div>
                      <div className="metric-group" style={{ paddingTop: '12px', borderLeft: '1px solid #E2E8F0', paddingLeft: '24px' }}>
                          <span className="metric-label" style={{ color: '#64748B' }}>Lowest Price:</span> 
                          <span className="metric-highlight">{selectedModalNiche.lowPrice || '£8.50'}</span>
                      </div>
                  </div>

                {/* Mini Map at the bottom */}
                <div className="detail-minimap-container">
                    <Map
                      ref={mapRef}
                      initialViewState={{ longitude: -0.052, latitude: 51.522, zoom: 12.5, pitch: 0, bearing: 0 }}
                      onMove={evt => setMapZoom(evt.viewState.zoom)}
                      mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
                      interactiveLayerIds={['areas-fill']}
                      onMouseMove={onMapHover}
                      onClick={onMapClick}
                    >
                      <Source id="east-london" type="geojson" data={eastLondonGeojson}>
                        <Layer {...polygonFillStyle} />
                        <Layer {...polygonOutlineStyle} />
                      </Source>
                      
                      {mockMapLocations.map(loc => (
                        <Marker key={loc.id} longitude={loc.lng} latitude={loc.lat} anchor="center">
                          <div className={`mapbox-marker-dot ${mapZoom >= 13.5 ? 'zoomed' : ''}`}>
                            <img src={selectedModalNiche.image} alt="restaurant" />
                            <div className="minimap-card-text">
                              <strong style={{ fontSize: '13px', color: '#1A1A1A' }}>{loc.name}</strong>
                              <span style={{ fontSize: '11px', color: '#64748B' }}>{selectedModalNiche.title}</span>
                              <strong style={{ color: '#E05046', fontSize: '14px', marginTop: '2px' }}>{loc.price}</strong>
                            </div>
                          </div>
                        </Marker>
                      ))}
                    </Map>
                </div>
              </>
            )}

            {activeDetailTab === 'Competitor Pricing' && (
              <CompetitorPricingTab niche={selectedModalNiche} />
            )}

            {activeDetailTab === 'Market Insights' && (
              <div className="niche-insight-container" style={{ padding: '16px 0', animation: 'fadeIn 0.3s ease-out' }}>
                  <div style={{ background: 'linear-gradient(145deg, rgba(249, 115, 22, 0.08) 0%, rgba(249, 115, 22, 0.02) 100%)', border: '1px solid rgba(249, 115, 22, 0.15)', borderRadius: '16px', padding: '24px', marginBottom: '16px', position: 'relative', overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', top: '-10px', right: '-10px', fontSize: '80px', opacity: '0.05', transform: 'rotate(15deg)', pointerEvents: 'none' }}>💡</div>
                      <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#1A1A1A', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800' }}>
                          <span style={{ fontSize: '20px' }}>💡</span> Why is this a Market Niche?
                      </h3>
                      <p style={{ margin: '0 0 20px 0', fontSize: '14px', color: '#334155', lineHeight: '1.6' }}>
                          This item was automatically identified using our <strong>Menu Overlap Method</strong>. We found <strong>10 highly successful local takeaways</strong> whose core menus (mains & drinks) overlap with yours by 70% or more. Out of those close competitors, the vast majority are successfully selling this exact item, while you are currently missing out.
                      </p>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                          <div style={{ background: '#FFF', borderRadius: '12px', padding: '16px', border: '1px solid rgba(249, 115, 22, 0.1)', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                              <span style={{ display: 'block', fontSize: '10px', color: '#64748B', fontWeight: '800', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.5px' }}>Competitor Adoption</span>
                              <span style={{ display: 'block', fontSize: '28px', fontWeight: '900', color: '#F97316', lineHeight: '1' }}>80%</span>
                              <span style={{ display: 'block', fontSize: '12px', color: '#64748B', marginTop: '8px', fontWeight: '500' }}>8 of 10 similar menus sell this</span>
                          </div>
                          <div style={{ background: '#FFF', borderRadius: '12px', padding: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                              <span style={{ display: 'block', fontSize: '10px', color: '#64748B', fontWeight: '800', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.5px' }}>Premium Add-on</span>
                              <span style={{ display: 'block', fontSize: '28px', fontWeight: '900', color: '#1A1A1A', lineHeight: '1' }}>{selectedModalNiche.stat1Value.replace('A', '£')}</span>
                              <span style={{ display: 'block', fontSize: '12px', color: '#64748B', marginTop: '8px', fontWeight: '500' }}>Average market selling price</span>
                          </div>
                      </div>
                  </div>
                  
                  <div style={{ background: '#F8FAFC', borderRadius: '16px', padding: '20px', border: '1px solid #E2E8F0' }}>
                      <h3 style={{ margin: '0 0 8px 0', fontSize: '15px', color: '#1A1A1A', fontWeight: '700' }}>Suggestion Priority: <span style={{ color: '#10B981' }}>High Synergy</span></h3>
                      <p style={{ margin: '0', fontSize: '13px', color: '#475569', lineHeight: '1.6' }}>
                          Because this item acts as a highly desirable side/add-on that bundles perfectly with your existing main dishes, it carries a very low operational risk. Adding this requires minimal new inventory while instantly increasing your average basket value and matching local market expectations.
                      </p>
                  </div>
              </div>
            )}

          </div>
        ) : (
            <div className="detail-empty">Select a niche to view details</div>
        )}
      </div>

    </div>
  );
};

export default MarketNicheContent;
