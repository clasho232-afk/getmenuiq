import React from 'react';
import { X } from 'lucide-react';
import RestaurantProfilePage from './RestaurantProfilePage';
import { ErrorBoundary } from './ErrorBoundary';

const CompetitorSummaryModal = ({ competitor, onClose, asSidebar = false }) => {
  if (!competitor) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#f8fafc',
        zIndex: 999999,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <div style={{ position: 'absolute', top: '1.5rem', right: '2rem', zIndex: 100 }}>
        <button 
          onClick={onClose}
          style={{
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '50%',
            width: '44px',
            height: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            transition: 'transform 0.2s, background-color 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.backgroundColor = '#f1f5f9';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.backgroundColor = 'white';
          }}
        >
          <X size={24} color="#0f172a" />
        </button>
      </div>
      
      <div style={{ flex: 1, width: '100%', position: 'relative' }}>
        <ErrorBoundary key={competitor.id}>
          <RestaurantProfilePage restaurantId={competitor.id} onBack={onClose} />
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default CompetitorSummaryModal;
