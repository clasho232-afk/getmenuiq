import React from 'react';

const AIGreeting = ({ onClick }) => {
  return (
    <div 
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
        transition: 'color 0.2s ease, opacity 0.2s ease',
        userSelect: 'none',
        flexShrink: 0,
      }}
      onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.7'; }}
      onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
    >
      <span style={{
        fontSize: '1.25rem', // text-xl
        fontWeight: 500,     // font-medium
        color: '#6B7280',    // text-gray-500
        fontFamily: "'Inter', 'Outfit', system-ui, -apple-system, sans-serif",
        whiteSpace: 'nowrap',
        letterSpacing: '-0.01em',
      }}>
        Hey there, need help?
      </span>
    </div>
  );
};

export default AIGreeting;
