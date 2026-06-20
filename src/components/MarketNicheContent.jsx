import React, { useState, useMemo, useRef, useCallback } from 'react';
import { MapPin, Search, ChevronUp, ChevronDown, Plus, Minus, Maximize, X } from 'lucide-react';
import Map, { Source, Layer } from 'react-map-gl/maplibre';
import eastLondonGeojson from '../data/east-london-boundaries.json';

const mockNiches = [
  {
    id: 'niche_01',
    areaId: 'whitechapel',
    name: 'Detroit-Style Deep Dish',
    score: '92',
    category: 'Pizza Layouts',
    parentCategory: 'Pizza',
    itemType: 'Mains',
    locationName: '📍 Trending in Whitechapel & Shoreditch',
    description: 'A highly sought-after premium format gaining massive traction in neighboring wards. Zero local competitors currently offer this style.',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
    stat1Label: 'AVG. MARKET PRICE',
    stat1Value: '£14.50',
    stat2Label: 'LOCAL RIVALS',
    stat2Value: '10',
    stat3Label: 'EST. MARGIN',
    stat3Value: '76%',
    areas: ['Whitechapel', 'Shoreditch', 'Bethnal Green'],
    lowPrice: '£9.50',
    highPrice: '£18.50',
    competitors: [
      { name: 'Pizza Union Space', price: '£18.50', image: 'https://ui-avatars.com/api/?name=Pizza+Union+Space&background=random' },
      { name: 'Homeslice East', price: '£17.00', image: 'https://ui-avatars.com/api/?name=Homeslice+East&background=random' },
      { name: 'Franco Manca', price: '£16.50', image: 'https://ui-avatars.com/api/?name=Franco+Manca&background=random' },
      { name: 'Yard Sale Pizza', price: '£15.50', image: 'https://ui-avatars.com/api/?name=Yard+Sale+Pizza&background=random' },
      { name: 'Voodoo Ray', price: '£15.00', image: 'https://ui-avatars.com/api/?name=Voodoo+Ray&background=random' },
      { name: 'Pizza Pilgrims', price: '£14.50', image: 'https://ui-avatars.com/api/?name=Pizza+Pilgrims&background=random' },
      { name: 'Zia Lucia', price: '£13.00', image: 'https://ui-avatars.com/api/?name=Zia+Lucia&background=random' },
      { name: 'Detroit Pizza London', price: '£12.50', image: 'https://ui-avatars.com/api/?name=Detroit+Pizza+London&background=random' },
      { name: 'Crust Bros', price: '£11.00', image: 'https://ui-avatars.com/api/?name=Crust+Bros&background=random' },
      { name: 'Sodo Pizza', price: '£9.50', image: 'https://ui-avatars.com/api/?name=Sodo+Pizza&background=random' }
    ]
  },
  {
    id: 'niche_02',
    areaId: 'bethnal_east',
    name: 'Hand-Pulled Biang Biang',
    score: '84',
    category: 'Noodle Concepts',
    parentCategory: 'Noodles',
    itemType: 'Mains',
    locationName: '📍 Trending in Bethnal Green',
    description: 'Authentic regional Chinese cuisine with high visual appeal for social media. Very low ingredient cost with high perceived value.',
    image: 'https://images.unsplash.com/photo-1552611052-3ba9d739a503?auto=format&fit=crop&w=800&q=80',
    stat1Label: 'AVG. MARKET PRICE',
    stat1Value: '£12.00',
    stat2Label: 'LOCAL RIVALS',
    stat2Value: '1',
    stat3Label: 'EST. MARGIN',
    stat3Value: '82%',
    areas: ['Bethnal Green', 'Hackney'],
    lowPrice: '£10.50',
    highPrice: '£13.50',
    competitors: [
      { name: 'Mian Noodle Bar', price: '£13.50', image: 'https://ui-avatars.com/api/?name=Mian+Noodle+Bar&background=random' }
    ]
  }
];

const MarketNicheContent = () => {
  const mapRef = useRef();
  
  const [hoveredCardId, setHoveredCardId] = useState(null);
  const [selectedModalNiche, setSelectedModalNiche] = useState(null);
  const [modalSections, setModalSections] = useState({ markets: false, pricing: false, rivals: false });
  const [analysisState, setAnalysisState] = useState('idle'); // 'idle', 'analyzing', 'results'
  const [resultsExpanded, setResultsExpanded] = useState({ markets: false, rivals: false });
  
  const toggleModalSection = (section) => {
    setModalSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleResultsExpanded = (section) => {
    setResultsExpanded(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleAnalyze = () => {
    setAnalysisState('analyzing');
    setTimeout(() => {
      setAnalysisState('results');
    }, 7000);
  };
  
  const [hoveredAreaId, setHoveredAreaId] = useState(null);
  const [selectedAreaId, setSelectedAreaId] = useState(null);
  
  const [activePrimaryTab, setActivePrimaryTab] = useState('All');
  const [activeSubFilter, setActiveSubFilter] = useState('Mains');

  // Mock User Profile
  const USER_CATEGORY = 'Pizza';

  // Filter feed by selected map polygon & new UX tabs
  const filteredNiches = useMemo(() => {
    let niches = mockNiches;
    
    // Map Filter
    if (selectedAreaId) {
      niches = niches.filter(n => n.areaId === selectedAreaId);
    }
    
    // Primary Tab Logic
    if (activePrimaryTab === 'Suggested') {
      niches = niches.filter(n => n.parentCategory === USER_CATEGORY);
    }

    // Secondary Filter Logic (only applies when "All" is selected, as per UX note)
    if (activePrimaryTab === 'All' && activeSubFilter) {
      niches = niches.filter(n => n.itemType === activeSubFilter);
    }

    return niches;
  }, [selectedAreaId, activePrimaryTab, activeSubFilter]);

  // Handle card hover -> pan map to area and highlight
  const handleCardHover = (nicheId, areaId) => {
    setHoveredCardId(nicheId);
    setHoveredAreaId(areaId);
    
    // Pan map to area centroid roughly
    if (areaId && mapRef.current) {
      const feature = eastLondonGeojson.features.find(f => f.properties.id === areaId);
      if (feature) {
        // Simple bounding box centroid calculation
        const coords = feature.geometry.coordinates[0];
        const lngs = coords.map(c => c[0]);
        const lats = coords.map(c => c[1]);
        const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;
        const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
        
        mapRef.current.flyTo({ center: [centerLng, centerLat], duration: 1000, zoom: 13.5 });
      }
    }
  };

  const handleCardLeave = () => {
    setHoveredCardId(null);
    setHoveredAreaId(null);
  };

  const handleCardClick = (niche) => {
    setSelectedModalNiche(niche);
    setModalSections({ markets: false, pricing: false, rivals: false });
    setResultsExpanded({ markets: false, rivals: false });
    setAnalysisState('idle');
  };

  const onMapHover = useCallback(event => {
    const { features } = event;
    const hoveredFeature = features && features[0];
    if (hoveredFeature) {
      setHoveredAreaId(hoveredFeature.properties.id);
    } else {
      // Don't clear if we are currently hovering over a card
      if (!hoveredCardId) {
        setHoveredAreaId(null);
      }
    }
  }, [hoveredCardId]);

  const onMapClick = useCallback(event => {
    const { features } = event;
    const clickedFeature = features && features[0];
    if (clickedFeature) {
      // Toggle selection
      setSelectedAreaId(prev => prev === clickedFeature.properties.id ? null : clickedFeature.properties.id);
    } else {
      setSelectedAreaId(null);
    }
  }, []);

  // Mapbox Layer Styles
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

  const building3DStyle = {
    id: '3d-buildings',
    source: 'composite',
    'source-layer': 'building',
    filter: ['==', 'extrude', 'true'],
    type: 'fill-extrusion',
    minzoom: 12,
    paint: {
      'fill-extrusion-color': '#E8EAEB',
      'fill-extrusion-height': ['get', 'height'],
      'fill-extrusion-base': ['get', 'min_height'],
      'fill-extrusion-opacity': 0.8
    }
  };

  const handleZoomIn = () => mapRef.current?.zoomTo(mapRef.current.getZoom() + 1, { duration: 300 });
  const handleZoomOut = () => mapRef.current?.zoomTo(mapRef.current.getZoom() - 1, { duration: 300 });
  const handleTilt = () => {
    const currentPitch = mapRef.current?.getPitch();
    mapRef.current?.easeTo({ pitch: currentPitch === 0 ? 60 : 0, duration: 500 });
  };

  return (
    <div className="niche-terminal-root">
      
      {/* LEFT COLUMN: Map Canvas */}
      <div className="niche-map-container" style={{ background: 'none' }}>
        <Map
          ref={mapRef}
          initialViewState={{
            longitude: -0.05,
            latitude: 51.52,
            zoom: 12.5,
            pitch: 0,
            bearing: 0
          }}
          mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
          interactiveLayerIds={['areas-fill']}
          onMouseMove={onMapHover}
          onClick={onMapClick}
          onMouseLeave={() => { if (!hoveredCardId) setHoveredAreaId(null); }}
        >
          {/* GeoJSON Polygon Sources */}
          <Source id="east-london" type="geojson" data={eastLondonGeojson}>
            <Layer {...polygonFillStyle} />
            <Layer {...polygonOutlineStyle} />
          </Source>
        </Map>

        {/* Floating Map Controls */}
        <div className="map-mockup-controls">
          <button className="map-control-btn" title="Zoom In" onClick={handleZoomIn}><Plus size={20} /></button>
          <button className="map-control-btn" title="Zoom Out" onClick={handleZoomOut}><Minus size={20} /></button>
          <button className="map-control-btn" title="Toggle 3D" onClick={handleTilt}><Maximize size={20} /></button>
        </div>
      </div>

      {/* RIGHT COLUMN: Data Feed */}
      <div className="niche-feed-container">
        
        {/* THE HEADER */}
        <div className="feed-header-wrapper" style={{ padding: '32px 32px 0 32px' }}>
            <h1 className="feed-title sans-serif">
                MARKET NICHE 
                <span className="badge-tangerine-pill">42 Items</span>
            </h1>

            {/* PRIMARY TABS (Strategic) */}
            <div className="primary-tabs-group">
                {['All', 'Suggested'].map(tab => (
                  <button 
                    key={tab}
                    className={`primary-tab ${activePrimaryTab === tab ? 'active' : ''}`}
                    onClick={() => setActivePrimaryTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
            </div>

            {/* SECONDARY FILTERS (Appears when 'All' is active) */}
            {activePrimaryTab === 'All' && (
              <div className="secondary-filters-row slide-down-animation">
                  <button className={`sub-filter-pill ${activeSubFilter === 'Mains' ? 'active' : ''}`} onClick={() => setActiveSubFilter('Mains')}>Mains <span className="pill-count">15</span></button>
                  <button className={`sub-filter-pill ${activeSubFilter === 'Sides' ? 'active' : ''}`} onClick={() => setActiveSubFilter('Sides')}>Sides <span className="pill-count">12</span></button>
                  <button className={`sub-filter-pill ${activeSubFilter === 'Desserts' ? 'active' : ''}`} onClick={() => setActiveSubFilter('Desserts')}>Desserts <span className="pill-count">6</span></button>
                  <button className={`sub-filter-pill ${activeSubFilter === 'Drinks' ? 'active' : ''}`} onClick={() => setActiveSubFilter('Drinks')}>Drinks <span className="pill-count">9</span></button>
              </div>
            )}
        </div>

        <div className="feed-list" style={{ padding: activePrimaryTab !== 'All' ? '24px 32px' : '0 32px' }}>
          {filteredNiches.map((niche, index) => {
            const displayRank = `#${String(index + 1).padStart(2, '0')}`;

            return (
              <div 
                key={niche.id} 
                className="niche-card"
                onMouseEnter={() => handleCardHover(niche.id, niche.areaId)}
                onMouseLeave={handleCardLeave}
                onClick={() => handleCardClick(niche)}
              >
                <div className="image-wrapper" style={{ position: 'relative' }}>
                  <img src={niche.image} alt={niche.name} className="niche-card-image" />
                  {/* THE NEW GEOMETRIC RANK BADGE (Replaces the 92) */}
                  <div className="niche-rank-index">
                    {displayRank}
                  </div>
                  {/* Category Tag */}
                  <div className="niche-category-tag">
                    {niche.category}
                  </div>
                </div>

                <h2 className="niche-card-title">{niche.name}</h2>
                <div className="niche-card-location" style={{ color: '#E05046', fontWeight: 500 }}>
                  Being sold in {niche.areas.length} areas
                </div>

                <div style={{ fontSize: '14px', color: '#666', lineHeight: 1.5 }}>
                  {niche.description}
                </div>

                <div className="data-grid">
                  <div className="data-column">
                    <span className="data-label">{niche.stat1Label}</span>
                    <span className="data-value">{niche.stat1Value}</span>
                  </div>
                  <div className="data-column">
                    <span className="data-label">{niche.stat2Label}</span>
                    <span className="data-value">{niche.stat2Value}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL OVERLAY */}
      {selectedModalNiche && (
        <div className="niche-modal-overlay" onClick={() => setSelectedModalNiche(null)}>
          <div className="niche-modal-content" onClick={e => e.stopPropagation()}>
            <button className="niche-modal-close" onClick={() => setSelectedModalNiche(null)}>
              <X size={24} />
            </button>
            
            {analysisState === 'idle' && (
              <>
                <div className="niche-modal-header">
              <div className="image-wrapper" style={{ position: 'relative' }}>
                <img src={selectedModalNiche.image} alt={selectedModalNiche.name} className="niche-card-image" />
                <div className="niche-category-tag">
                  {selectedModalNiche.category}
                </div>
              </div>
              
              <h2 className="niche-card-title">{selectedModalNiche.name}</h2>
              <div className="niche-card-location" style={{ color: '#E05046', fontWeight: 500 }}>
                Being sold in {selectedModalNiche.areas.length} areas
              </div>
              
              <div style={{ fontSize: '15px', color: '#666', lineHeight: 1.6, marginTop: '16px' }}>
                {selectedModalNiche.description}
              </div>

              <div className="data-grid" style={{ marginTop: '24px' }}>
                <div className="data-column">
                  <span className="data-label">{selectedModalNiche.stat1Label}</span>
                  <span className="data-value" style={{ color: '#E05046' }}>{selectedModalNiche.stat1Value}</span>
                </div>
                <div 
                  className="data-column" 
                  style={{ cursor: 'pointer', transition: 'opacity 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}
                  onClick={() => toggleModalSection('rivals')}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                  <span className="data-label">{selectedModalNiche.stat2Label} (Click to view)</span>
                  <span className="data-value">{selectedModalNiche.stat2Value}</span>
                  
                  {modalSections.rivals && (
                    <div style={{ marginTop: '12px', width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {selectedModalNiche.competitors && selectedModalNiche.competitors.length > 0 ? (
                        selectedModalNiche.competitors.map((comp, idx) => (
                          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                            <img src={comp.image} alt={comp.name} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                            <div style={{ display: 'flex', flex: 1, justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ color: '#1A1A1A', fontWeight: '600', fontSize: '13px', lineHeight: 1.2 }}>{comp.name}</span>
                              <span style={{ color: '#E05046', fontWeight: '700', fontSize: '13px' }}>{comp.price}</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <span style={{ color: '#999', fontSize: '12px' }}>No local rivals.</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="niche-deep-dive" style={{ marginTop: '32px', background: 'transparent', border: 'none', padding: 0 }}>
              {/* Active Markets Accordion */}
              <div className="deep-dive-section" style={{ borderBottom: '1px solid #E5E7EB', paddingBottom: '16px', cursor: 'pointer' }} onClick={() => toggleModalSection('markets')}>
                <div className="deep-dive-section-title" style={{ margin: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Active Markets ({selectedModalNiche.areas.length})</span>
                  {modalSections.markets ? <Minus size={16} /> : <Plus size={16} />}
                </div>
                
                {modalSections.markets && (
                  <div style={{ marginTop: '16px' }}>
                    {selectedModalNiche.areas.map((area, idx) => (
                      <div key={idx} style={{ padding: '8px 0', color: '#666', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 'bold', color: '#1A1A1A' }}>{idx + 1}.</span> {area}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Competitor Pricing Accordion */}
              <div className="deep-dive-section" style={{ paddingTop: '16px', cursor: 'pointer' }} onClick={() => toggleModalSection('pricing')}>
                <div className="deep-dive-section-title" style={{ margin: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Competitor Pricing</span>
                  {modalSections.pricing ? <Minus size={16} /> : <Plus size={16} />}
                </div>

                {!modalSections.pricing ? (
                  <div className="price-spread" style={{ marginTop: '16px' }}>
                    <div className="price-point">
                      <span className="price-lbl">Lowest</span>
                      <span className="price-val">{selectedModalNiche.lowPrice}</span>
                    </div>
                    <div style={{ height: '1px', background: '#E5E7EB', flex: 1, margin: '0 16px' }}></div>
                    <div className="price-point high">
                      <span className="price-lbl">Highest</span>
                      <span className="price-val">{selectedModalNiche.highPrice}</span>
                    </div>
                  </div>
                ) : (
                  <div style={{ marginTop: '16px' }}>
                    {selectedModalNiche.competitors && selectedModalNiche.competitors.length > 0 ? (
                      selectedModalNiche.competitors.map((comp, idx) => (
                        <div key={idx} style={{ padding: '12px 0', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img src={comp.image} alt={comp.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                          <div style={{ display: 'flex', flex: 1, justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ color: '#1A1A1A', fontWeight: '500', fontSize: '15px' }}>{idx + 1}. {comp.name}</span>
                              {idx === 0 && <span style={{ background: '#FEE2E2', color: '#991B1B', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>Highest</span>}
                              {idx === selectedModalNiche.competitors.length - 1 && <span style={{ background: '#DCFCE7', color: '#166534', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>Lowest</span>}
                            </div>
                            <span style={{ color: '#E05046', fontWeight: '800', fontSize: '15px' }}>{comp.price}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div style={{ padding: '8px 0', color: '#999', fontSize: '14px' }}>No local competitors currently offer this style.</div>
                    )}
                  </div>
                )}
              </div>

            </div>
                <button 
                  onClick={handleAnalyze}
                  style={{ width: '100%', marginTop: '32px', background: '#1A1A1A', color: 'white', padding: '14px', borderRadius: '8px', fontWeight: 'bold', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                >
                  <Search size={18} /> Analyze Opportunity
                </button>
              </>
            )}

            {analysisState === 'analyzing' && (
              <div style={{ padding: '64px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
                <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #E05046', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <h3 style={{ marginTop: '24px', color: '#1A1A1A' }}>Analyzing Market Data...</h3>
                <p style={{ color: '#666', marginTop: '8px' }}>Calculating optimal pricing and competitive whitespace</p>
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
              </div>
            )}

            {analysisState === 'results' && (
              <div className="analysis-results">
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                  <img src={selectedModalNiche.image} alt={selectedModalNiche.name} style={{ width: '64px', height: '64px', borderRadius: '8px', objectFit: 'cover' }} />
                  <div>
                    <h2 style={{ margin: 0, fontSize: '20px', color: '#1A1A1A' }}>{selectedModalNiche.name}</h2>
                    <span style={{ color: '#059669', fontWeight: 'bold', fontSize: '13px', background: '#D1FAE5', padding: '2px 8px', borderRadius: '12px', display: 'inline-block', marginTop: '4px' }}>Analysis Complete</span>
                  </div>
                </div>

                <div style={{ background: '#fff', padding: '16px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.05)', marginBottom: '24px' }}>
                  
                  {/* Total Areas Toggle */}
                  <div 
                    onClick={() => toggleResultsExpanded('markets')}
                    style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', paddingBottom: '12px', borderBottom: '1px solid rgba(0,0,0,0.05)', marginBottom: '12px' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#666', fontSize: '13px' }}>Total areas being sold in</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 'bold', color: '#1A1A1A' }}>{selectedModalNiche.areas.length}</span>
                        {resultsExpanded.markets ? <ChevronUp size={14} color="#666" /> : <ChevronDown size={14} color="#666" />}
                      </div>
                    </div>
                    {resultsExpanded.markets && (
                      <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {selectedModalNiche.areas.map((area, idx) => (
                          <div key={idx} style={{ fontSize: '13px', color: '#444' }}>• {area}</div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid rgba(0,0,0,0.05)', marginBottom: '12px' }}>
                    <span style={{ color: '#666', fontSize: '13px' }}>Highest Price</span>
                    <span style={{ fontWeight: 'bold', color: '#1A1A1A', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                      {selectedModalNiche.competitors?.[0] && (
                        <img src={selectedModalNiche.competitors[0].image} style={{ width: '16px', height: '16px', borderRadius: '50%', objectFit: 'cover' }} />
                      )}
                      {selectedModalNiche.competitors?.[0]?.name || '-'} 
                      <span style={{ color: '#E05046', marginLeft: '4px', fontSize: '14px' }}>{selectedModalNiche.highPrice}</span>
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid rgba(0,0,0,0.05)', marginBottom: '12px' }}>
                    <span style={{ color: '#666', fontSize: '13px' }}>Lowest Price</span>
                    <span style={{ fontWeight: 'bold', color: '#1A1A1A', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                      {selectedModalNiche.competitors?.[selectedModalNiche.competitors.length - 1] && (
                        <img src={selectedModalNiche.competitors[selectedModalNiche.competitors.length - 1].image} style={{ width: '16px', height: '16px', borderRadius: '50%', objectFit: 'cover' }} />
                      )}
                      {selectedModalNiche.competitors?.[selectedModalNiche.competitors.length - 1]?.name || '-'} 
                      <span style={{ color: '#E05046', marginLeft: '4px', fontSize: '14px' }}>{selectedModalNiche.lowPrice}</span>
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid rgba(0,0,0,0.05)', marginBottom: '12px' }}>
                    <span style={{ color: '#666', fontSize: '13px' }}>Average Price</span>
                    <span style={{ fontWeight: 'bold', color: '#1A1A1A' }}>{selectedModalNiche.stat1Value}</span>
                  </div>

                  {/* Local Rivals Toggle */}
                  <div 
                    onClick={() => toggleResultsExpanded('rivals')}
                    style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#666', fontSize: '13px' }}>Local Rivals</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 'bold', color: '#1A1A1A' }}>{selectedModalNiche.competitors?.length || 0}</span>
                        {resultsExpanded.rivals ? <ChevronUp size={14} color="#666" /> : <ChevronDown size={14} color="#666" />}
                      </div>
                    </div>
                    {resultsExpanded.rivals && (
                      <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {selectedModalNiche.competitors?.map((comp, idx) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <img src={comp.image} style={{ width: '16px', height: '16px', borderRadius: '50%', objectFit: 'cover' }} />
                              <span style={{ fontSize: '13px', color: '#1A1A1A', fontWeight: '500' }}>{comp.name}</span>
                            </div>
                            <span style={{ color: '#E05046', fontWeight: 'bold', fontSize: '13px' }}>{comp.price}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {(!selectedModalNiche.competitors || selectedModalNiche.competitors.length === 0) ? (
                  <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', padding: '16px', borderRadius: '8px', color: '#991B1B', fontSize: '14px', lineHeight: 1.5 }}>
                    It's not being sold by the primary location or neighboring areas.
                  </div>
                ) : (
                  <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '16px', borderRadius: '8px', color: '#065F46', fontSize: '14px', lineHeight: 1.5 }}>
                    This item is in high demand and being sold in {selectedModalNiche.areas.length} other areas. With the highest price at {selectedModalNiche.highPrice}, you can select for like £12.00.
                  </div>
                )}
                
                <div style={{ marginTop: '24px', textAlign: 'center', color: '#1A1A1A', fontWeight: 'bold', fontSize: '16px' }}>
                  You should add this into your menu and try this to increase your revenue!
                </div>
                
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default MarketNicheContent;
