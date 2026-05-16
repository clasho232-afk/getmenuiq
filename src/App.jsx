import React, { useState } from 'react';
import MenuIQLogin from './components/Login';
import Sidebar from './components/Sidebar';
import TopNav from './components/TopNav';
import DashboardContent from './components/DashboardContent';
import MyMenuContent from './components/MyMenuContent';
import CompetitorsContent from './components/CompetitorsContent';
import BlindSpotContent from './components/BlindSpotContent';
import MarketNicheContent from './components/MarketNicheContent';
import AIInsightsContent from './components/AIInsightsContent';
import CompetitorFinderContent from './components/CompetitorFinderContent';

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('Dashboard');

  if (!loggedIn) {
    return (
      <MenuIQLogin
        onLogin={() => setLoggedIn(true)}
        onGoogleLogin={() => setLoggedIn(true)}
        onSignUp={() => alert('Sign up coming soon')}
        onForgotPassword={() => alert('Password reset coming soon')}
      />
    );
  }

  return (
    <>
      <div className="dashboard-layout" style={{ 
        position: 'relative',
        display: 'flex',
        height: '100vh',
        flexDirection: 'column', 
        backgroundColor: '#F5F3EC',
        backgroundImage: `
          radial-gradient(circle at 85% 20%, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0) 50%),
          radial-gradient(circle at 15% 85%, rgba(228, 206, 191, 0.45) 0%, rgba(228, 206, 191, 0) 50%)
        `
      }}>
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: 'url(/bg-sketch.png)',
          backgroundSize: '1400px',
          backgroundPosition: 'right -50px top -20px',
          backgroundRepeat: 'no-repeat',
          opacity: 0.8,
          mixBlendMode: 'multiply',
          pointerEvents: 'none',
          zIndex: 0
        }} />
        
        {/* Foreground Content */}
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
          <TopNav activeTab={activeTab} setActiveTab={setActiveTab} />
          <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
            <main className="main-content" style={{ padding: '0 2rem 2rem 1rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column' }}>
              {activeTab === 'Dashboard' && <DashboardContent />}
              {activeTab === 'My Menu' && <MyMenuContent />}
              {activeTab === 'Competitors' && <CompetitorsContent />}
              {activeTab === 'Blind Spot' && <BlindSpotContent />}
              {activeTab === 'Market Niche' && <MarketNicheContent />}
              {activeTab === 'AI Strategy' && <AIInsightsContent />}
              {activeTab === 'Competitor Finder' && <CompetitorFinderContent />}
            </main>
          </div>
          
          {/* Mobile Bottom Navigation Bar */}
          <div className="mobile-bottom-nav mobile-only">
            {[
              { id: 'Dashboard', icon: 'Dashboard' },
              { id: 'My Menu', icon: 'Menu' },
              { id: 'AI Strategy', icon: 'AI' },
              { id: 'Market Niche', icon: 'Niche' },
              { id: 'Competitors', icon: 'Comp' }
            ].map((item) => (
              <div 
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{ 
                  display: 'flex', flexDirection: 'column', alignItems: 'center', 
                  gap: '4px', cursor: 'pointer',
                  color: activeTab === item.id ? '#e05046' : '#6B7280'
                }}
              >
                <div style={{ fontWeight: activeTab === item.id ? 800 : 500, fontSize: '0.7rem' }}>{item.icon}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
