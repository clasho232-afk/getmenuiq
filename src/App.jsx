import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import CommandPalette from './components/CommandPalette';
import MenuIQLogin from './components/Login';
import OnboardingFlow from './components/OnboardingFlow';
import Sidebar from './components/Sidebar';
import TopNav from './components/TopNav';
import DashboardContent from './components/DashboardContent';
import MyMenuContent from './components/MyMenuContent';
import CompetitorsContent from './components/CompetitorsContent';
import BlindSpotContent from './components/BlindSpotContent';
import MarketNicheContent from './components/MarketNicheContent';
import IntelligenceHub from './components/IntelligenceHub';
import CompetitorFinderContent from './components/CompetitorFinderContent';
import SearchContent from './components/SearchContent';


function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [userGoal, setUserGoal] = useState(null);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [analyzeTrigger, setAnalyzeTrigger] = useState(0);

  useEffect(() => {
    const handleOpenAnalysis = () => {
      setActiveTab('My Menu');
      setAnalyzeTrigger(prev => prev + 1);
    };
    window.addEventListener('open-menu-analysis', handleOpenAnalysis);
    return () => window.removeEventListener('open-menu-analysis', handleOpenAnalysis);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (showLanding) {
    return <LandingPage onLaunchDashboard={() => setShowLanding(false)} />;
  }

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

  if (!onboardingComplete) {
    return <OnboardingFlow onComplete={({ restaurant, goal }) => { setSelectedRestaurant(restaurant); setUserGoal(goal); setOnboardingComplete(true); }} />;
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
        {/* Background sketch overlay */}
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
          <TopNav activeTab={activeTab} setActiveTab={setActiveTab} onOpenCommandPalette={() => setIsCommandPaletteOpen(true)} />

          <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
            {activeTab !== 'AI Strategy' && <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />}
            <main
              className="main-content"
              style={{
                padding: activeTab === 'AI Strategy' || activeTab === 'Market Niche' ? '0' : '0 2rem 2rem 1rem',
                overflowY: activeTab === 'AI Strategy' || activeTab === 'Market Niche' ? 'hidden' : 'auto',
                overflow: activeTab === 'AI Strategy' || activeTab === 'Market Niche' ? 'hidden' : undefined,
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
              }}
            >
              {activeTab === 'Dashboard' && <DashboardContent userGoal={userGoal} selectedRestaurant={selectedRestaurant} />}
              {activeTab === 'My Menu' && <MyMenuContent selectedRestaurant={selectedRestaurant} analyzeTrigger={analyzeTrigger} />}
              {activeTab === 'Competitors' && <CompetitorsContent />}
              {activeTab === 'Blind Spot' && <BlindSpotContent />}
              {activeTab === 'Market Niche' && <MarketNicheContent />}
              {activeTab === 'AI Strategy' && <IntelligenceHub />}
              {activeTab === 'Competitor Finder' && <CompetitorFinderContent />}
              {activeTab === 'Search' && <SearchContent />}
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
      <CommandPalette isOpen={isCommandPaletteOpen} onClose={() => setIsCommandPaletteOpen(false)} />
    </>
  );
}

export default App;
