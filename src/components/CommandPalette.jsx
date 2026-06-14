import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';

const mockData = {
  competitors: ['Burger King', 'Local Diner'],
  areas: ['Camden', 'Shoreditch', 'E1'],
  menuItems: ['Margherita Pizza', 'Fish & Chips'],
};

const CommandPalette = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setQuery(''); // Reset on open
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredCompetitors = mockData.competitors.filter(item => item.toLowerCase().includes(query.toLowerCase()));
  const filteredAreas = mockData.areas.filter(item => item.toLowerCase().includes(query.toLowerCase()));
  const filteredMenuItems = mockData.menuItems.filter(item => item.toLowerCase().includes(query.toLowerCase()));

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(253, 249, 241, 0.75)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '15vh'
      }}
      onClick={onClose}
    >
      <style>
        {`
          .command-palette-item {
            padding: 0.75rem 1rem;
            border-radius: 8px;
            cursor: pointer;
            transition: background-color 0.2s ease;
            font-size: 0.875rem;
            color: #333;
            margin-bottom: 2px;
          }
          .command-palette-item:hover {
            background-color: rgba(0, 0, 0, 0.05);
          }
        `}
      </style>
      <div 
        style={{
          width: '90%',
          maxWidth: '600px',
          backgroundColor: '#FDF9F1',
          borderRadius: '16px',
          boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: "'Lufga', sans-serif"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', padding: '1.5rem', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
          <Search size={24} color="#A3A3A3" style={{ marginRight: '1rem' }} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              flex: 1,
              border: 'none',
              background: 'transparent',
              fontSize: '1.25rem',
              outline: 'none',
              color: '#000',
              fontFamily: 'inherit'
            }}
          />
        </div>

        <div style={{ padding: '1rem', maxHeight: '60vh', overflowY: 'auto' }}>
          {filteredCompetitors.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ 
                fontSize: '0.75rem', 
                textTransform: 'uppercase', 
                color: '#888', 
                letterSpacing: '0.05em', 
                marginBottom: '0.5rem',
                paddingLeft: '1rem'
              }}>
                Competitors
              </h3>
              {filteredCompetitors.map((item, idx) => (
                <div key={idx} className="command-palette-item">
                  {item}
                </div>
              ))}
            </div>
          )}

          {filteredAreas.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ 
                fontSize: '0.75rem', 
                textTransform: 'uppercase', 
                color: '#888', 
                letterSpacing: '0.05em', 
                marginBottom: '0.5rem',
                paddingLeft: '1rem'
              }}>
                Areas
              </h3>
              {filteredAreas.map((item, idx) => (
                <div key={idx} className="command-palette-item">
                  {item}
                </div>
              ))}
            </div>
          )}

          {filteredMenuItems.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ 
                fontSize: '0.75rem', 
                textTransform: 'uppercase', 
                color: '#888', 
                letterSpacing: '0.05em', 
                marginBottom: '0.5rem',
                paddingLeft: '1rem'
              }}>
                Menu Items
              </h3>
              {filteredMenuItems.map((item, idx) => (
                <div key={idx} className="command-palette-item">
                  {item}
                </div>
              ))}
            </div>
          )}

          {query && filteredAreas.length === 0 && filteredCompetitors.length === 0 && filteredMenuItems.length === 0 && (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#888', fontSize: '0.875rem' }}>
              No results found for "{query}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
