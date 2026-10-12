import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Zap, Smartphone, Mail, ShieldAlert, TrendingDown, Eye, Plus, X, Settings2, Trash2, Tag, Activity, Users, ChevronRight, ChevronLeft } from 'lucide-react';
import { UberEatsIcon, DeliverooIcon, JustEatIcon } from './PlatformIcons';

const AlertSystemModal = ({ isOpen, onClose }) => {
  // We default to the first category, or 'configuration' if that button is clicked.
  const [activeCategory, setActiveCategory] = useState('watchlist');
  const [mounted, setMounted] = useState(false);

  // Simple Contact Settings
  const [emails, setEmails] = useState(['alerts@restaurant.com']);
  const [newEmail, setNewEmail] = useState('');
  const [phones, setPhones] = useState(['+44 7700 900000']);
  const [newPhone, setNewPhone] = useState('');

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!isOpen || !mounted) return null;

  const handleAddEmail = (e) => {
    if (e.key === 'Enter' && newEmail) {
      setEmails([...emails, newEmail]);
      setNewEmail('');
    }
  };

  const handleAddPhone = (e) => {
    if (e.key === 'Enter' && newPhone) {
      setPhones([...phones, newPhone]);
      setNewPhone('');
    }
  };

  const removeEmail = (index) => setEmails(emails.filter((_, i) => i !== index));
  const removePhone = (index) => setPhones(phones.filter((_, i) => i !== index));

  const CATEGORIES = [
    { id: 'watchlist', label: 'Watchlist Alerts', icon: Eye, color: '#E86A58', count: 2 },
    { id: 'overall', label: 'Overall Competitors', icon: Users, color: '#3B82F6', count: 5 },
    { id: 'market', label: 'Market Activity', icon: Activity, color: '#8B5CF6', count: 1 },
    { id: 'promos', label: 'Promo Alerts', icon: Tag, color: '#F59E0B', count: 3 },
    { id: 'pricing', label: 'Price Changes', icon: TrendingDown, color: '#10B981', count: 4 },
  ];

  const MOCK_ALERTS = [
    { id: 1, category: 'watchlist', title: 'Pizza Palace', message: 'Lowered price of "Large Margherita".', oldPrice: '£12.99', newPrice: '£10.99', time: '10 mins ago', color: '#E86A58', typeLabel: 'PRICE DROP', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=150&q=80' },
    { id: 2, category: 'watchlist', title: 'Burger King Ilford', message: 'Activated "Buy 1 Get 1 Free" on all sides.', time: '2 hours ago', color: '#E86A58', typeLabel: 'PROMO ACTIVE', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=150&q=80' },
    { id: 3, category: 'overall', title: 'Domino\'s Pizza', message: 'Increased delivery fee across all zones.', oldPrice: '£1.99', newPrice: '£2.99', time: '1 day ago', color: '#3B82F6', typeLabel: 'FEE CHANGE', image: 'https://images.unsplash.com/photo-1590947132387-155cc3ad46a3?w=150&q=80' },
    { id: 4, category: 'overall', title: 'McDonald\'s', message: 'Removed "McFlurry" from the dessert menu.', time: '2 days ago', color: '#3B82F6', typeLabel: 'MENU UPDATE', image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=150&q=80' },
    { id: 5, category: 'market', title: 'New Market Entrant', message: '"The Chicken Shop" has come online on UberEats within your 2-mile radius.', time: '4 hours ago', color: '#8B5CF6', typeLabel: 'MARKET UPDATE', image: 'https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?w=150&q=80' },
    { id: 6, category: 'promos', title: 'KFC High Street', message: 'Launched "20% Off Minimum Spend £20" campaign.', time: 'Just now', color: '#F59E0B', typeLabel: 'NEW CAMPAIGN', image: 'https://images.unsplash.com/photo-1516684732162-798a0062be99?w=150&q=80' },
    { id: 7, category: 'promos', title: 'Subway Central', message: 'Activated "Free Delivery" for lunch peak hours.', time: '2 hours ago', color: '#F59E0B', typeLabel: 'PROMO ACTIVE', image: 'https://images.unsplash.com/photo-1619881589316-56c7f9e6b587?w=150&q=80' },
    { id: 8, category: 'pricing', title: 'Subway Central', message: 'Raised prices on all Footlong subs.', oldPrice: '£5.99', newPrice: '£6.49', time: '3 hours ago', color: '#10B981', typeLabel: 'PRICE INCREASE', image: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=150&q=80' },
    { id: 9, category: 'pricing', title: 'Pizza Express', message: 'Lowered price of "Dough Balls".', oldPrice: '£5.50', newPrice: '£4.50', time: '5 hours ago', color: '#10B981', typeLabel: 'PRICE DROP', image: 'https://images.unsplash.com/photo-1579697096985-41fe1430e5f6?w=150&q=80' },
  ];

  const activeCatData = CATEGORIES.find(c => c.id === activeCategory);
  const displayedAlerts = MOCK_ALERTS.filter(a => a.category === activeCategory);

  return ReactDOM.createPortal(
    <div style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.45)' }} />
      
      <div style={{ position: 'relative', zIndex: 1, width: 'min(95vw, 850px)', height: 'min(90vh, 750px)', backgroundColor: '#FCFAF6', borderRadius: '20px', boxShadow: '0 24px 80px rgba(0,0,0,0.2)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        
        {/* HEADER */}
        <div style={{ display: 'flex', width: '100%', borderBottom: '1px solid #F3F4F6', flexShrink: 0, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'space-between', padding: '20px 28px', boxSizing: 'border-box' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={24} color="#E86A58" fill="#E86A58" />
              Alert Center
            </h2>

            {/* INLINE GLOBAL OVERVIEW */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', borderLeft: '1px solid #E5E7EB', paddingLeft: '24px' }}>
              <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#4B5563', display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                <span style={{ color: '#E86A58', fontWeight: 800, fontSize: '1.3rem' }}>9</span> Total Alerts
              </span>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#D1D5DB' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <UberEatsIcon size={20} color="#06C167" />
                  <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#4B5563' }}>5</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <DeliverooIcon size={20} color="#00CCBC" />
                  <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#4B5563' }}>2</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <JustEatIcon size={20} color="#FF8000" />
                  <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#4B5563' }}>2</span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button 
              onClick={() => activeCategory === 'configuration' ? setActiveCategory('watchlist') : setActiveCategory('configuration')}
              style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid #E5E7EB', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#F9FAFB'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#FFFFFF'; }}
            >
              {activeCategory === 'configuration' ? (
                <ChevronLeft size={20} color="#6B7280" style={{ marginLeft: '-2px' }} />
              ) : (
                <Settings2 size={20} color="#6B7280" />
              )}
            </button>
            
            <div style={{ width: '1px', height: '24px', backgroundColor: '#E5E7EB' }} />
            
            <button onClick={onClose} style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid #E5E7EB', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <X size={20} color="#6B7280" />
            </button>
          </div>
        </div>

        {/* SPLIT CONTENT AREA */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          
          {/* LEFT SIDEBAR - CATEGORY CARDS */}
          {activeCategory !== 'configuration' && (
            <div className="invisible-scrollbar" style={{ flex: '0 0 35%', backgroundColor: '#FFFFFF', borderRight: '1px solid #F3F4F6', display: 'flex', flexDirection: 'column', padding: '24px', gap: '12px', overflowY: 'auto' }}>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Categories</span>
              
              {CATEGORIES.map(cat => {
                const isActive = activeCategory === cat.id;
                const Icon = cat.icon;
                return (
                  <div 
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    style={{ 
                      borderRadius: '12px', cursor: 'pointer', 
                      background: isActive ? '#E86A580C' : '#FFFFFF',
                      border: isActive ? '1px solid #E86A5830' : '1px solid rgba(0,0,0,0.05)',
                      boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.02)' : '0 1px 4px rgba(0,0,0,0.02)',
                      transition: 'all 0.2s', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px'
                    }}
                    onMouseEnter={e => { if(!isActive) e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.04)'; }}
                    onMouseLeave={e => { if(!isActive) e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = isActive ? '0 2px 8px rgba(0,0,0,0.02)' : '0 1px 4px rgba(0,0,0,0.02)'; }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
                      <Icon size={18} color={isActive ? '#E86A58' : '#9CA3AF'} flexShrink={0} />
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: isActive ? '#111827' : '#4B5563', margin: 0, letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cat.label}</h4>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {cat.count > 0 && (
                        <span style={{ background: '#EF4444', color: '#FFF', fontSize: '12px', fontWeight: 800, padding: '2px 8px', minWidth: '20px', textAlign: 'center', borderRadius: '99px' }}>
                          {cat.count}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* RIGHT MAIN AREA */}
          <div className="invisible-scrollbar" style={{ flex: 1, padding: '32px', overflowY: 'auto', backgroundColor: '#FCFAF6' }}>
            
            {activeCategory === 'configuration' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '700px', margin: '0 auto' }}>
                <div style={{ background: '#FFFFFF', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#111', marginBottom: '2rem', marginTop: 0 }}>Contact & Delivery Settings</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
                    
                    {/* WhatsApp */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Smartphone size={18} color="#25D366" />
                        <span style={{ fontSize: '14px', fontWeight: 700, color: '#374151' }}>WhatsApp Numbers</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {phones.map((phone, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px' }}>
                            <span style={{ fontSize: '13px', color: '#111', fontWeight: 600 }}>{phone}</span>
                            <button onClick={() => removePhone(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}><Trash2 size={16} color="#9CA3AF" /></button>
                          </div>
                        ))}
                        <input 
                          type="text" 
                          placeholder="Add number & press Enter..." 
                          value={newPhone}
                          onChange={(e) => setNewPhone(e.target.value)}
                          onKeyDown={handleAddPhone}
                          style={{ padding: '10px 14px', borderRadius: '8px', border: '1px dashed #D1D5DB', fontSize: '13px', background: '#FFFFFF', outline: 'none' }}
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Mail size={18} color="#3B82F6" />
                        <span style={{ fontSize: '14px', fontWeight: 700, color: '#374151' }}>Email Addresses</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {emails.map((email, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px' }}>
                            <span style={{ fontSize: '13px', color: '#111', fontWeight: 600 }}>{email}</span>
                            <button onClick={() => removeEmail(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}><Trash2 size={16} color="#9CA3AF" /></button>
                          </div>
                        ))}
                        <input 
                          type="email" 
                          placeholder="Add email & press Enter..." 
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          onKeyDown={handleAddEmail}
                          style={{ padding: '10px 14px', borderRadius: '8px', border: '1px dashed #D1D5DB', fontSize: '13px', background: '#FFFFFF', outline: 'none' }}
                        />
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            ) : (
              activeCatData && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '700px' }}>
                  


                  {displayedAlerts.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem 1rem', background: '#FFFFFF', borderRadius: '16px', border: '1px dashed rgba(0,0,0,0.1)' }}>
                      <Zap size={40} color="#E5E7EB" style={{ marginBottom: '1rem' }} />
                      <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#4B5563', margin: '0 0 0.5rem 0' }}>No active alerts</h4>
                      <p style={{ fontSize: '13px', margin: 0, color: '#9CA3AF' }}>When new {activeCatData.label.toLowerCase()} occur, they will appear here.</p>
                    </div>
                  ) : (
                    displayedAlerts.map(alert => (
                      <div 
                        key={alert.id} 
                        style={{ 
                          padding: '16px', borderRadius: '12px', background: '#FFFFFF', 
                          display: 'flex', gap: '16px', alignItems: 'flex-start',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                          border: '1px solid rgba(0,0,0,0.05)',
                          cursor: 'pointer', transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'; }}
                      >
                        <img 
                          src={alert.image} 
                          alt="" 
                          style={{ width: '64px', height: '64px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} 
                        />
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <span style={{ background: `${alert.color}15`, color: alert.color, fontSize: '10px', fontWeight: 800, padding: '4px 8px', borderRadius: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                {alert.typeLabel}
                            </span>
                          </div>
                          <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#111', margin: '4px 0 0 0' }}>{alert.title}</h4>
                          <p style={{ fontSize: '13px', color: '#4B5563', margin: 0, lineHeight: 1.5 }}>{alert.message}</p>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginLeft: 'auto', paddingLeft: '16px' }}>
                          <span style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: 600, marginBottom: (alert.oldPrice && alert.newPrice) ? '8px' : '0' }}>{alert.time}</span>
                          {alert.oldPrice && alert.newPrice && (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                              <span style={{ fontSize: '13px', color: '#9CA3AF', textDecoration: 'line-through', fontWeight: 600 }}>{alert.oldPrice}</span>
                              <span style={{ fontSize: '16px', color: '#E86A58', fontWeight: 800 }}>{alert.newPrice}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )
            )}
          </div>

        </div>
      </div>
    </div>,
    document.body
  );
};

export default AlertSystemModal;
