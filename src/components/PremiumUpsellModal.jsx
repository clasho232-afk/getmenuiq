import React from 'react';
import { X, Sparkles, Check, Zap, Crown, TrendingUp } from 'lucide-react';

const PremiumUpsellModal = ({ isOpen, onClose, targetTier = 'Silver' }) => {
  if (!isOpen) return null;

  const features = targetTier === 'Silver' ? [
    'Monitor up to 2 areas simultaneously',
    'Advanced Competitor Intelligence',
    'Real-time Price Drop Alerts',
    'Priority Customer Support'
  ] : [
    'Unlimited Area Monitoring',
    'Global Market Penetration Matrix',
    'Predictive AI Demand Forecasting',
    'Dedicated Success Manager'
  ];

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 10000,
      padding: '1rem',
      animation: 'fadeIn 0.3s ease-out'
    }}>
      <div style={{
        background: 'linear-gradient(145deg, #111 0%, #000000 100%)',
        borderRadius: '24px',
        width: '100%', maxWidth: '480px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
        border: `1px solid ${targetTier === 'Silver' ? 'rgba(192, 192, 192, 0.2)' : 'rgba(255, 215, 0, 0.2)'}`,
        animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        {/* Glow effect */}
        <div style={{
          position: 'absolute', top: '-50%', left: '-50%', right: '-50%', bottom: '-50%',
          background: `radial-gradient(circle at center, ${targetTier === 'Silver' ? 'rgba(192, 192, 192, 0.15)' : 'rgba(255, 215, 0, 0.15)'} 0%, transparent 60%)`,
          pointerEvents: 'none',
        }} />

        <button 
          onClick={onClose}
          style={{
            position: 'absolute', top: '1rem', right: '1rem',
            background: 'rgba(255,255,255,0.1)', border: 'none',
            color: '#fff', width: '32px', height: '32px', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', zIndex: 10,
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
        >
          <X size={16} />
        </button>

        <div style={{ padding: '2.5rem 2rem', position: 'relative', zIndex: 1, color: '#fff', textAlign: 'center' }}>
          <div style={{ 
            width: '64px', height: '64px', borderRadius: '50%', 
            background: targetTier === 'Silver' ? 'linear-gradient(135deg, #E0E0E0, #9E9E9E)' : 'linear-gradient(135deg, #FFD700, #D97706)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.5rem auto',
            boxShadow: `0 0 20px ${targetTier === 'Silver' ? 'rgba(192, 192, 192, 0.4)' : 'rgba(255, 215, 0, 0.4)'}`
          }}>
            {targetTier === 'Silver' ? <Zap size={32} color="#111" /> : <Crown size={32} color="#111" />}
          </div>
          
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
            Upgrade to {targetTier}
          </h2>
          <p style={{ color: '#9CA3AF', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '2rem', padding: '0 1rem' }}>
            You've reached the limit of your current plan. Unlock powerful new capabilities to dominate your market.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left', marginBottom: '2.5rem' }}>
            {features.map((feature, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ 
                  background: targetTier === 'Silver' ? 'rgba(192, 192, 192, 0.1)' : 'rgba(255, 215, 0, 0.1)', 
                  padding: '4px', borderRadius: '50%' 
                }}>
                  <Check size={14} color={targetTier === 'Silver' ? '#E0E0E0' : '#FFD700'} />
                </div>
                <span style={{ fontSize: '0.9rem', color: '#E5E7EB', fontWeight: 700 }}>{feature}</span>
              </div>
            ))}
          </div>

          <button style={{
            width: '100%',
            padding: '1rem',
            borderRadius: '12px',
            border: 'none',
            background: targetTier === 'Silver' ? 'linear-gradient(135deg, #E0E0E0, #9E9E9E)' : 'linear-gradient(135deg, #FFD700, #D97706)',
            color: '#1F2937',
            fontSize: '1rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            boxShadow: `0 4px 15px ${targetTier === 'Silver' ? 'rgba(192, 192, 192, 0.3)' : 'rgba(255, 215, 0, 0.3)'}`,
            transition: 'transform 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          onClick={() => {
            alert(`Redirecting to checkout for ${targetTier} plan...`);
            onClose();
          }}
          >
            <Sparkles size={18} />
            Unlock {targetTier} Now
          </button>
          
          <button 
            onClick={onClose}
            style={{ 
              background: 'transparent', border: 'none', color: '#6B7280', 
              fontSize: '0.85rem', marginTop: '1rem', cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Maybe later
          </button>
        </div>
      </div>
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default PremiumUpsellModal;
