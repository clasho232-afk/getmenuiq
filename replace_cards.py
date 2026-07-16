import sys

def replace_in_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        
    card_replacement = """          {/* Pricing Overview Consolidated Card */}
          <div className="glass-panel" style={{ gridColumn: '1', gridRow: '2', height: '100%', padding: '1.75rem 2rem', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontFamily: '"Playfair Display", serif', fontSize: '1.5rem', fontWeight: 700, color: '#111', marginBottom: '1.5rem', letterSpacing: '-0.01em' }}>Pricing Overview</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1, justifyContent: 'center' }}>
              {[
                { title: 'Underpriced', count: 8, color: '#F59E0B', items: [
                  { name: 'Vegan Wrap', category: 'Wraps', price: '£5.50', image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=120&q=80', description: 'Our signature wrap is priced 15% below market average in East London.' },
                  { name: 'Milkshake', category: 'Drinks', price: '£3.20', image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=120&q=80', description: 'Premium milkshakes are underpriced compared to local dessert parlors.' },
                  { name: 'Sweet Potato Fries', category: 'Sides', price: '£3.50', image: 'https://images.unsplash.com/photo-1596649285097-70b1cb3b3209?auto=format&fit=crop&w=120&q=80', description: 'High margin item that can sustain a 50p increase easily.' },
                  { name: 'Iced Coffee', category: 'Drinks', price: '£2.80', image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba1?auto=format&fit=crop&w=120&q=80', description: 'Below the £3.50 standard for specialty iced coffees locally.' }
                ]},
                { title: 'Priced Right', count: 45, color: '#10B981', items: [
                  { name: 'Classic Cheeseburger', category: 'Mains', price: '£8.50', image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=120&q=80', description: 'Perfectly positioned against 12 local competitors.' },
                  { name: 'Onion Rings', category: 'Sides', price: '£4.00', image: 'https://images.unsplash.com/photo-1639024471283-03518883512d?auto=format&fit=crop&w=120&q=80', description: 'Standard market rate, good margin.' },
                  { name: 'BBQ Wings', category: 'Starters', price: '£6.50', image: 'https://images.unsplash.com/photo-1524114664604-cd8133cd67ad?auto=format&fit=crop&w=120&q=80', description: 'Competitive pricing driving high volume.' }
                ]},
                { title: 'Overpriced', count: 12, color: '#EF4444', items: [
                  { name: 'Spicy Chicken Burger', category: 'Mains', price: '£12.50', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=120&q=80', description: 'Priced 20% higher than local average, sales dropping.' },
                  { name: 'Truffle Fries', category: 'Sides', price: '£7.00', image: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?auto=format&fit=crop&w=120&q=80', description: 'Premium pricing is causing low attachment rate.' },
                  { name: 'Margherita Pizza', category: 'Mains', price: '£14.00', image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=120&q=80', description: 'Significant drop in orders compared to Q1.' },
                  { name: 'Cola Zero', category: 'Drinks', price: '£3.00', image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=120&q=80', description: 'Way above the £2.00 market standard for canned sodas.' }
                ]}
              ].map((row, i) => (
                <div 
                  key={i}
                  onClick={() => setSelectedCard({ title: row.title, items: row.items, color: row.color })}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s', border: '1px solid transparent' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.6)'; e.currentTarget.style.borderColor = 'rgba(0,0,0,0.05)'; e.currentTarget.querySelector('.chevron').style.opacity = '1'; e.currentTarget.querySelector('.chevron').style.transform = 'translateX(0)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.querySelector('.chevron').style.opacity = '0'; e.currentTarget.querySelector('.chevron').style.transform = 'translateX(-8px)'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: row.color }}></div>
                    <span style={{ fontSize: '1.1rem', fontWeight: 600, color: '#374151' }}>{row.title}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111' }}>{row.count}</span>
                    <span className="chevron" style={{ opacity: 0, transform: 'translateX(-8px)', transition: 'all 0.2s', color: '#9CA3AF', display: 'flex', alignItems: 'center' }}>
                      <ArrowRight size={18} />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
"""

    modal_replacement = """      {/* Modal Overlay for "Pricing Overview" Drill-down */}
      {selectedCard && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 100, background: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-panel modal-content" style={{ width: '800px', maxWidth: '95%', maxHeight: '90vh', padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '2rem', background: 'rgba(250,248,244,0.95)', border: '1px solid #E5E7EB', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontFamily: '"Playfair Display", serif', fontSize: '2rem', fontWeight: 700, color: selectedCard.color || '#000', margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ display: 'inline-block', width: '14px', height: '14px', borderRadius: '50%', background: selectedCard.color || '#000' }}></span>
                {selectedCard.title} Items
              </h3>
              <button onClick={() => setSelectedCard(null)} style={{ width: '44px', height: '44px', borderRadius: '50%', border: '1px solid #E5E7EB', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.2s, transform 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.background = '#f3f4f6'; e.currentTarget.style.transform = 'scale(1.05)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.transform = 'scale(1)'; }}>
                <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>×</span>
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'auto', paddingRight: '1rem' }}>
              {selectedCard.items.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '1.5rem', background: '#fff', borderRadius: '16px', padding: '1.25rem', border: '1px solid #E5E7EB', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', alignItems: 'center' }}>
                  <img src={item.image} alt={item.name} style={{ width: '100px', height: '100px', borderRadius: '12px', objectFit: 'cover' }} />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <span style={{ display: 'inline-block', background: '#F3F4F6', color: '#4B5563', fontSize: '0.75rem', fontWeight: 600, padding: '0.2rem 0.6rem', borderRadius: '9999px', marginBottom: '0.5rem' }}>{item.category || 'Category'}</span>
                        <h4 style={{ fontFamily: '"Playfair Display", serif', fontSize: '1.25rem', fontWeight: 700, color: '#111', margin: 0 }}>{item.name}</h4>
                      </div>
                      <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111' }}>{item.price || '£--'}</span>
                    </div>
                    <p style={{ fontSize: '0.9rem', color: '#6B7280', margin: 0, lineHeight: 1.5 }}>
                      {item.description || 'Detailed item performance and market positioning information goes here.'}
                    </p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', minWidth: '160px' }}>
                    <button 
                      onClick={() => alert(`Analyzing ${item.name} against 30 local competitors in East London...`)}
                      style={{ background: 'transparent', color: '#111', padding: '0.6rem 1rem', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: 600, border: '1px solid #111', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'all 0.2s' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#111'; e.currentTarget.style.color = '#fff'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#111'; }}
                    >
                      <BarChart3 size={16} /> Analyze Market
                    </button>
                    <button style={{ background: '#111', color: '#fff', padding: '0.6rem 1rem', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#374151'} onMouseLeave={(e) => e.currentTarget.style.background = '#111'}>
                      Adjust Price
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
"""

    new_lines = lines[:240] + [card_replacement + "\n"] + lines[288:633] + [modal_replacement + "\n"] + lines[664:]
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.writelines(new_lines)

replace_in_file('src/components/DashboardContent.jsx')
