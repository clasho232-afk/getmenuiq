import React, { useEffect, useRef } from 'react';

const AICommandOverlay = ({ isOpen, onClose }) => {
  const overlayRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
    }
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (overlayRef.current && !overlayRef.current.contains(e.target)) {
        onClose();
      }
    };
    if (isOpen) {
      const timer = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 100);
      return () => {
        clearTimeout(timer);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      style={{
        position: 'absolute',
        top: '5.5rem',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: '48rem',
        textAlign: 'center',
        zIndex: 20,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '2.5rem 3rem', // generous padding
        background: '#FDFBF7', // completely solid background
        borderRadius: '24px',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.1)', // high-quality diffuse drop shadow
        animation: 'aiOverlayFadeIn 0.3s ease forwards',
        fontFamily: "'Inter', 'Outfit', system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Massive transparent input on solid background */}
      <input
        ref={inputRef}
        type="text"
        placeholder="Just ask me anything..."
        style={{
          width: '100%',
          background: 'transparent', // no background on input itself
          border: 'none',
          outline: 'none',
          color: '#1F2937',
          fontSize: '2.5rem',
          fontWeight: 300,
          fontFamily: 'inherit',
          textAlign: 'center',
          padding: '0',
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && e.target.value.trim()) {
            e.target.value = '';
            onClose();
          }
        }}
      />

      <style>{`
        @keyframes aiOverlayFadeIn {
          from { opacity: 0; transform: translateX(-50%) translateY(-8px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default AICommandOverlay;
