import React, { useState } from 'react';
import { Search, Mail, Bell, UtensilsCrossed, Menu, X } from 'lucide-react';

const TopNav = ({ activeTab, setActiveTab, onOpenCommandPalette }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { id: 'Dashboard', label: 'Dashboard' },
    { id: 'My Menu', label: 'My Menu' },
    { id: 'Competitors', label: 'Competitors' },
    { id: 'AI Strategy', label: 'AI Strategy' },
    { id: 'Market Niche', label: 'Market Niche' },
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
      {/* Logo Area */}
      <div className="flex items-center gap-2" style={{ color: '#e05046', flexShrink: 0, fontFamily: "'Lufga', sans-serif", fontSize: '24px', fontWeight: 800 }}>
        <span>MenuIQ</span>
      </div>
      
      {/* Desktop Navigation Links */}
      <nav className="desktop-only" style={{ 
        flex: 1, 
        justifyContent: 'center', 
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
        <button className="btn-icon desktop-only" onClick={onOpenCommandPalette}>
          <Search size={20} />
        </button>
        <button className="btn-icon">
          <Bell size={20} />
        </button>
        <img src="https://i.pravatar.cc/150?u=admin" alt="Profile" className="avatar avatar-sm" style={{ border: '2px solid white' }} />
        
        {/* Mobile Menu Toggle */}
        <button className="mobile-only btn-icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

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
