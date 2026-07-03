import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { MapPin, Search, ChevronUp, ChevronDown, Plus, Minus, Maximize, X } from 'lucide-react';
import Map, { Source, Layer } from 'react-map-gl/maplibre';
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
  const mapRef = useRef();
  
  const getPlatformLogoUrl = (platform) => {
    switch (platform) {
      case 'UberEats': return 'https://img.icons8.com/color/48/uber-eats-app.png';
      case 'Deliveroo': return 'https://img.icons8.com/color/48/deliveroo.png';
      case 'Just Eat': return 'https://img.icons8.com/color/48/just-eat.png';
      default: return 'https://img.icons8.com/color/48/uber-eats-app.png';
    }
  };
  
  const [hoveredCardId, setHoveredCardId] = useState(null);
  const [selectedModalNiche, setSelectedModalNiche] = useState(mockNiches[0]);
  const [analysisState, setAnalysisState] = useState('idle'); // 'idle', 'analyzing', 'results'
  const [activePrimaryTab, setActivePrimaryTab] = useState('All');
  const [activeDetailTab, setActiveDetailTab] = useState('Overview');
  const [hoveredAreaId, setHoveredAreaId] = useState(null);
  const [selectedAreaId, setSelectedAreaId] = useState(null);
  
  const USER_CATEGORY = 'Pizza';

  const filteredNiches = useMemo(() => {
    let niches = mockNiches;
    if (selectedAreaId) niches = niches.filter(n => n.areaId === selectedAreaId);
    
    if (activePrimaryTab === 'Suggested') {
      niches = niches.filter(n => n.parentCategory === USER_CATEGORY);
    } else if (activePrimaryTab !== 'All') {
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
    if (selectedModalNiche && mapRef.current && eastLondonGeojson) {
        const feature = eastLondonGeojson.features.find(f => f.properties.id === selectedModalNiche.areaId);
        if (feature) {
            const coords = feature.geometry.coordinates[0];
            const lngs = coords.map(c => c[0]);
            const lats = coords.map(c => c[1]);
            const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;
            const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
            mapRef.current.flyTo({ center: [centerLng, centerLat], duration: 1000, zoom: 13.5 });
        }
    }
  }, [selectedModalNiche]);

  return (
    <div className="niche-terminal-root">
      
      {/* LEFT PANE: Niche Feed (List View) */}
      <div className="niche-feed-container">
        <div className="feed-header-wrapper">
            <h1 className="feed-title sans-serif">
                Market Niches
            </h1>

            {/* FILTER CHIPS */}
            <div className="primary-tabs-group">
                {['All', 'Suggested', 'Just Eat', 'Uber Eats', 'Deliveroo'].map(tab => (
                  <button 
                    key={tab}
                    className={`filter-chip ${activePrimaryTab === tab ? 'active' : ''}`}
                    onClick={() => setActivePrimaryTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
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
                <div className="row-category">{niche.category}</div>
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
                    <div className="metric-group">
                      <span className="metric-label">Platform:</span>
                      <img 
                        src={getPlatformLogoUrl(niche.platform)} 
                        alt="platform" 
                        className="platform-micro-icon" 
                      />
                    </div>
                  </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT PANE: Detail View & Map */}
      <div className="niche-detail-container">
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
            <div className="detail-header-row" style={{ position: 'relative', marginBottom: '8px' }}>
                <div className="detail-title-col" style={{ paddingRight: '160px' }}>
                    <h2 className="detail-title" style={{ margin: 0, paddingBottom: '4px' }}>{selectedModalNiche.name}</h2>
                </div>
                <div className="detail-price-col" style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', position: 'absolute', right: 0, top: 0 }}>
                    <div className="detail-platform" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <img 
                          src={getPlatformLogoUrl(selectedModalNiche.platform)} 
                          alt="platform" 
                          style={{ width: '28px', height: '28px', borderRadius: '50%', marginBottom: '2px', objectFit: 'cover' }} 
                        />
                      <span style={{ fontSize: '11px', color: '#E05046', fontWeight: '600' }}>{selectedModalNiche.platform}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                        <div className="detail-price">{selectedModalNiche.stat1Value}</div>
                        <div className="detail-price-label" style={{ color: '#E05046' }}>Avg Market Price</div>
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
                  className={`detail-tab ${activeDetailTab === 'Local Rivals' ? 'active' : ''}`}
                  onClick={() => setActiveDetailTab('Local Rivals')}
                >Local Rivals</div>
            </div>

            {activeDetailTab === 'Overview' && (
              <>
                {/* Niche Taxonomy */}
                <div className="detail-taxonomy" style={{ display: 'flex', gap: '32px', marginBottom: '8px', fontSize: '13px', color: '#444' }}>
                    <div>
                        <strong>Niche Category:</strong> <span style={{ color: '#E05046', fontWeight: '500' }}>{selectedModalNiche.nicheCategory}</span>
                    </div>
                    <div>
                        <strong>Type:</strong> <span style={{ color: '#E05046', fontWeight: '500' }}>{selectedModalNiche.type}</span>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="row-metrics expanded-metrics detail-expanded-metrics" style={{ marginTop: '-4px', marginBottom: '24px' }}>
                    <div className="metric-group">
                      <span className="metric-label" style={{ color: '#E05046' }}>Sellers:</span>
                      <span className="metric-highlight">{selectedModalNiche.stat2Value}</span>
                    </div>
                    <span className="metric-separator">|</span> 
                    <div className="metric-group">
                      <span className="metric-label" style={{ color: '#E05046' }}>Sold in:</span>
                      <span className="metric-highlight">{selectedModalNiche.areas.length} areas</span>
                    </div>
                    <span className="metric-separator">|</span> 
                    <div className="metric-group">
                      <span className="metric-label" style={{ color: '#E05046' }}>Highest Price:</span>
                      <span className="metric-highlight">{selectedModalNiche.highPrice}</span> 
                    </div>
                    <span className="metric-separator">|</span> 
                    <div className="metric-group">
                      <span className="metric-label" style={{ color: '#E05046' }}>Lowest Price:</span>
                      <span className="metric-highlight">{selectedModalNiche.lowPrice}</span> 
                    </div>
                </div>

                {/* Mini Map at the bottom */}
                <div className="detail-minimap-container">
                    <div className="minimap-overlay-card">
                        <img src={selectedModalNiche.image} alt="thumb" />
                        <div className="minimap-card-text">
                            <strong>{selectedModalNiche.name}</strong>
                            <span>Being sold in {selectedModalNiche.areas[0]}</span>
                        </div>
                    </div>
                    <Map
                      ref={mapRef}
                      initialViewState={{ longitude: -0.05, latitude: 51.52, zoom: 13, pitch: 0, bearing: 0 }}
                      mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
                      interactiveLayerIds={['areas-fill']}
                      onMouseMove={onMapHover}
                      onClick={onMapClick}
                    >
                      <Source id="east-london" type="geojson" data={eastLondonGeojson}>
                        <Layer {...polygonFillStyle} />
                        <Layer {...polygonOutlineStyle} />
                      </Source>
                    </Map>
                </div>
              </>
            )}

            {activeDetailTab === 'Competitor Pricing' && (
              <CompetitorPricingTab niche={selectedModalNiche} />
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
