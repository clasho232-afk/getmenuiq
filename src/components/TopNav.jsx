import React from 'react';
import { Search, Mail, Bell, UtensilsCrossed } from 'lucide-react';

const TopNav = ({ activeTab, setActiveTab }) => {
  return (
    <header className="top-nav" style={{ backgroundColor: 'transparent', borderBottom: 'none', padding: '1.5rem 2rem' }}>
      <div className="flex items-center gap-2 font-bold text-xl" style={{ width: '200px', color: '#e05046' }}>
        <UtensilsCrossed size={24} fill="none" color="#e05046" />
        <span>MenuIQ</span>
      </div>
      
      <nav className="flex items-center gap-6" style={{ fontSize: '0.875rem', fontWeight: 500, color: '#4B5563' }}>
        <span 
          onClick={() => setActiveTab && setActiveTab('Dashboard')} 
          style={{ cursor: 'pointer', color: activeTab === 'Dashboard' ? '#000' : '#4B5563', fontWeight: activeTab === 'Dashboard' ? 700 : 500 }}
        >Dashboard</span>
        <span 
          onClick={() => setActiveTab && setActiveTab('My Menu')} 
          style={{ cursor: 'pointer', color: activeTab === 'My Menu' ? '#000' : '#4B5563', fontWeight: activeTab === 'My Menu' ? 700 : 500 }}
        >My Menu</span>
        <span 
          onClick={() => setActiveTab && setActiveTab('Competitors')} 
          style={{ cursor: 'pointer', color: activeTab === 'Competitors' ? '#000' : '#4B5563', fontWeight: activeTab === 'Competitors' ? 700 : 500 }}
        >Competitors</span>
        <span 
          onClick={() => setActiveTab && setActiveTab('Competitor Finder')} 
          style={{ cursor: 'pointer', color: activeTab === 'Competitor Finder' ? '#000' : '#4B5563', fontWeight: activeTab === 'Competitor Finder' ? 700 : 500 }}
        >Finder</span>
        <span style={{ cursor: 'pointer' }}>Orders</span>
        <span style={{ backgroundColor: 'black', color: 'white', padding: '0.5rem 1.25rem', borderRadius: '9999px', cursor: 'pointer' }}>Workflows</span>
        <span 
          onClick={() => setActiveTab && setActiveTab('Blind Spot')} 
          style={{ cursor: 'pointer', color: activeTab === 'Blind Spot' ? '#000' : '#4B5563', fontWeight: activeTab === 'Blind Spot' ? 700 : 500 }}
        >Blind Spot</span>
        <span 
          onClick={() => setActiveTab && setActiveTab('Market Niche')} 
          style={{ cursor: 'pointer', color: activeTab === 'Market Niche' ? '#000' : '#4B5563', fontWeight: activeTab === 'Market Niche' ? 700 : 500 }}
        >Market Niche</span>
        <span 
          onClick={() => setActiveTab && setActiveTab('AI Strategy')} 
          style={{ cursor: 'pointer', color: activeTab === 'AI Strategy' ? '#000' : '#4B5563', fontWeight: activeTab === 'AI Strategy' ? 700 : 500, position: 'relative', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
        >
          AI Strategy
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#EF4444', display: 'inline-block', animation: 'pulse 2s infinite' }} />
        </span>
        <span style={{ cursor: 'pointer' }}>Settings</span>
      </nav>

      <div className="flex gap-4 items-center" style={{ width: '200px', justifyContent: 'flex-end' }}>
        <button className="btn-icon" style={{ backgroundColor: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <Search size={18} strokeWidth={2} color="#000" />
        </button>
        <button className="btn-icon" style={{ backgroundColor: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <Mail size={18} strokeWidth={2} color="#000" />
        </button>
        <div style={{ position: 'relative' }}>
          <button className="btn-icon" style={{ backgroundColor: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <Bell size={18} strokeWidth={2} color="#000" />
          </button>
          <div style={{ position: 'absolute', top: '0', right: '0', width: '8px', height: '8px', backgroundColor: 'transparent', borderRadius: '50%', border: '2px solid white' }}></div>
        </div>
        <img src="https://i.pravatar.cc/150?u=admin" alt="Profile" className="avatar avatar-sm ml-2" style={{ border: '2px solid white' }} />
      </div>
    </header>
  );
};

export default TopNav;
