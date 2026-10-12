import React, { useState, useEffect } from 'react';
import { Star, ChevronRight } from 'lucide-react';

const WatchlistWidget = ({ onClick }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const updateCount = () => {
      try {
        const wl = JSON.parse(localStorage.getItem('menuiq_watchlist') || '[]');
        setCount(wl.length);
      } catch {
        setCount(0);
      }
    };

    updateCount();
    // Listen for custom event in case items are starred/unstarred in modals
    window.addEventListener('watchlist-updated', updateCount);
    // Also listen for regular storage events (across tabs)
    window.addEventListener('storage', updateCount);

    return () => {
      window.removeEventListener('watchlist-updated', updateCount);
      window.removeEventListener('storage', updateCount);
    };
  }, []);

  return (
    <div 
      onClick={onClick}
      style={{
        backgroundColor: '#fff',
        borderRadius: '16px',
        padding: '16px 20px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
        border: '1px solid #F3F4F6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)';
        e.currentTarget.style.borderColor = '#FCD34D';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)';
        e.currentTarget.style.borderColor = '#F3F4F6';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '12px',
          backgroundColor: '#FEF3C7',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid #FDE68A'
        }}>
          <Star size={20} color="#D97706" fill="#F59E0B" />
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '14px', fontWeight: 800, color: '#111827', letterSpacing: '-0.3px' }}>
            My Watchlist
          </span>
          <span style={{ fontSize: '11px', fontWeight: 600, color: '#6B7280' }}>
            {count} saved item{count !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      <div style={{
        width: '28px',
        height: '28px',
        borderRadius: '50%',
        backgroundColor: '#F9FAFB',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid #F3F4F6'
      }}>
        <ChevronRight size={14} color="#9CA3AF" />
      </div>
    </div>
  );
};

export default WatchlistWidget;
