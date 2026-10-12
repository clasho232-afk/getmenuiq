import React, { useState, useEffect } from 'react';
import { Search, Mail, Bell, UtensilsCrossed, Menu, X, MapPin, ChevronDown, Lock, Loader2, Check } from 'lucide-react';
import PremiumUpsellModal from './PremiumUpsellModal';


const TopNav = ({ activeTab, setActiveTab, onOpenCommandPalette }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showUpsell, setShowUpsell] = useState(false);
  const [targetTier, setTargetTier] = useState('Gold');

  const navLinks = [
    { id: 'Dashboard', label: 'Dashboard' },
    { id: 'My Menu', label: 'My Menu' },
    { id: 'Competitors', label: 'Competitors' },
    { id: 'AI Strategy', label: 'AI Strategy' },
    { id: 'Market Niche', label: 'Market Niche' },
    { id: 'Promo Intelligence', label: 'Promo Intel' },
    { id: 'Search', label: 'Search' },
  ];

  return (
    <header className="top-nav" style={{ 
      backgroundColor: 'transparent', 
      borderBottom: 'none', 
      padding: '0 2rem',
      height: '70px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 9999
    }}>
      {/* Logo Area & Workspace Selector */}
      <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
        <div className="flex items-center gap-2" style={{ color: '#e05046', fontFamily: "'Lufga', sans-serif", fontSize: '24px', fontWeight: 800 }}>
          <span>MenuIQ</span>
        </div>
        
      </div>
      
      {/* Desktop Navigation Links */}
      <nav className="desktop-only" style={{ 
        position: 'absolute',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '2rem', 
        fontSize: '0.875rem', 
        fontWeight: 500, 
        color: '#4B5563' 
      }}>
        {navLinks.map(link => (
          <span 
            key={link.id}
            onClick={() => setActiveTab && setActiveTab(link.id)} 
            style={{ 
              cursor: 'pointer', 
              color: activeTab === link.id ? '#000' : '#4B5563', 
              fontWeight: activeTab === link.id ? 700 : 500,
              padding: '0.5rem 0'
            }}
          >
            {link.label}
          </span>
        ))}
      </nav>

      {/* Right Actions */}
      <div className="flex items-center gap-2 sm:gap-4" style={{ flexShrink: 0 }}>
        {/* Mobile Menu Toggle */}
        <button className="mobile-only btn-icon" onClick={() => setIsMenuOpen(!isMenuOpen)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#4B5563' }}>
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <PremiumUpsellModal 
        isOpen={showUpsell} 
        onClose={() => setShowUpsell(false)} 
        targetTier={targetTier} 
      />

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="mobile-only" style={{
          position: 'fixed', top: '70px', left: 0, right: 0, bottom: 0,
          background: 'white', zIndex: 1000, padding: '2rem',
          flexDirection: 'column', gap: '1.5rem'
        }}>
          {navLinks.map(link => (
            <span 
              key={link.id}
              onClick={() => { setActiveTab(link.id); setIsMenuOpen(false); }}
              style={{ fontSize: '1.25rem', fontWeight: activeTab === link.id ? 700 : 500 }}
            >
              {link.label}
            </span>
          ))}
        </div>
      )}

    </header>
  );
};

export default TopNav;
