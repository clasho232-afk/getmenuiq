import React from 'react';
import { Upload, Calendar, Check, MoreHorizontal, Plus, Star } from 'lucide-react';
import './CustomerJourneys.css';

const mockAvatars = [
  'https://i.pravatar.cc/150?u=1',
  'https://i.pravatar.cc/150?u=2',
  'https://i.pravatar.cc/150?u=3',
  'https://i.pravatar.cc/150?u=4',
  'https://i.pravatar.cc/150?u=5',
];

const ActionIcon = ({ icon: Icon }) => (
  <button className="cj-action-btn">
    <Icon size={18} />
  </button>
);

const CustomerJourneys = () => {
  return (
    <div className="cj-container">
      <div className="cj-header-title">Order Fulfillment Flow</div>

      {/* Main Journeys Card */}
      <div className="cj-card">
        <div className="cj-top-row">
          <h2 className="cj-card-title">New Order Workflow</h2>
          
          <div className="cj-avatars-container">
            {/* Top Avatars with numbers */}
            {[
              { img: mockAvatars[0], num: '2', colorClass: 'cj-badge-blue' },
              { img: mockAvatars[1], num: '3', colorClass: 'cj-badge-blue' },
              { img: mockAvatars[2], num: '2', colorClass: 'cj-badge-red' },
              { img: mockAvatars[3], num: '1', colorClass: 'cj-badge-red' },
              { img: mockAvatars[4], num: '+', colorClass: 'cj-badge-yellow' },
              { img: mockAvatars[0], num: '1', colorClass: 'cj-badge-red' },
              { num: '+', colorClass: 'cj-badge-white' },
              { num: '+', colorClass: 'cj-badge-white' },
            ].map((item, i) => (
              <div key={i} className="cj-avatar-wrapper" style={{ zIndex: 10 - i }}>
                {item.img ? (
                  <img src={item.img} className="cj-avatar-img" alt="avatar" />
                ) : (
                  <div className="cj-avatar-placeholder">
                    <Plus size={16} />
                  </div>
                )}
                <div className={`cj-avatar-badge ${item.colorClass}`}>
                  {item.num}
                </div>
              </div>
            ))}
          </div>

          <div className="cj-actions">
            <ActionIcon icon={Plus} />
            <ActionIcon icon={Upload} />
            <ActionIcon icon={Calendar} />
          </div>
        </div>

        {/* Tree Diagram Area */}
        <div className="cj-tree-grid">
          
          {/* Column 1 */}
          <div className="cj-col">
            <div className="cj-box">
              <div className="cj-box-header">
                <img src={mockAvatars[0]} className="cj-avatar-img" alt="" />
                <div className="cj-box-icons">
                  <Check size={18} />
                  <Calendar size={18} />
                </div>
              </div>
              <p className="cj-box-text">Receive Order from Customer</p>
              <div className="cj-dot cj-dot-blue" style={{ top: '80px', right: '-16px' }}></div>
            </div>

            <div className="cj-box">
              <div className="cj-box-header">
                <img src={mockAvatars[0]} className="cj-avatar-img" alt="" />
                <div className="cj-box-icons">
                  <Check size={18} />
                  <Calendar size={18} />
                </div>
              </div>
              <p className="cj-box-text">Send Order Confirmation</p>
              <div className="cj-dot cj-dot-red" style={{ bottom: '80px', right: '-16px' }}></div>
            </div>
            <div className="cj-col-title">Order Reception</div>
          </div>

          {/* Column 2 */}
          <div className="cj-col">
            <div className="cj-list-container">
              {[
                { title: 'Assign Kitchen Station', icon: 'check', avatar: mockAvatars[1], hasDot: true, dotClass: 'cj-dot-blue' },
                { title: 'Prioritize Order Status', icon: 'check', avatar: mockAvatars[2], hasDot: true, dotClass: 'cj-dot-blue' },
                { title: 'Prep Fresh Ingredients', icon: 'check', avatar: mockAvatars[3], hasDot: true, dotClass: 'cj-dot-blue' },
                { title: 'Start Cooking Process', icon: 'dots', avatar: mockAvatars[4], hasDot: true, dotClass: 'cj-dot-red' },
                { title: 'Update Estimated Time', icon: 'dots', avatar: mockAvatars[0], hasDot: true, dotClass: 'cj-dot-red' },
              ].map((item, i) => (
                <div key={i} className="cj-list-item">
                  {item.hasDot && (
                    <div className={`cj-dot ${item.dotClass}`} style={{ top: '50%', left: '-12px', transform: 'translateY(-50%)' }}></div>
                  )}
                  <div className="cj-dot cj-dot-gray" style={{ top: '50%', right: '-12px', transform: 'translateY(-50%)' }}></div>
                  
                  <div className="cj-item-left">
                    <img src={item.avatar} className="cj-item-avatar" alt="" />
                    <span className="cj-item-title active">{item.title}</span>
                  </div>
                  <div className="cj-box-icons" style={{ color: '#000000' }}>
                    {item.icon === 'check' ? (
                      <React.Fragment>
                        <Check size={18} />
                        <Calendar size={18} color="#9CA3AF" />
                      </React.Fragment>
                    ) : (
                      <MoreHorizontal size={18} />
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="cj-col-title">Kitchen Preparation</div>
          </div>

          {/* Column 3 */}
          <div className="cj-col">
            <div className="cj-list-container">
              {[
                { title: 'Check Order Accuracy', icon: 'plus', type: 'icon' },
                { title: 'Package Items Securely', icon: 'plus', type: 'icon' },
                { title: 'Assign Delivery Driver', icon: 'dots', type: 'avatar', avatar: mockAvatars[1], active: true },
                { title: 'Notify Dispatch Team', icon: 'dots', type: 'avatar', avatar: mockAvatars[2] },
                { title: 'Hand off to Delivery', icon: 'plus', type: 'icon' },
              ].map((item, i) => (
                <div key={i} className="cj-list-item">
                  <div className="cj-dot cj-dot-gray" style={{ top: '50%', left: '-12px', transform: 'translateY(-50%)' }}></div>
                  {item.active && (
                    <div className="cj-dot cj-dot-black" style={{ top: '50%', right: '-12px', transform: 'translateY(-50%)' }}></div>
                  )}
                  
                  <div className="cj-item-left">
                    {item.type === 'avatar' ? (
                      <img src={item.avatar} className="cj-item-avatar" alt="" />
                    ) : (
                      <div className="cj-item-icon">
                        <Plus size={16} />
                      </div>
                    )}
                    <span className={`cj-item-title ${item.active ? 'active' : 'inactive'}`}>{item.title}</span>
                  </div>
                  <div className="cj-box-icons" style={{ color: '#000000' }}>
                    {item.icon === 'dots' ? (
                      <MoreHorizontal size={18} />
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
            <div className="cj-col-title">Quality & Packaging</div>
          </div>

          {/* Column 4 */}
          <div className="cj-col">
            <div className="cj-task-grid">
              {[
                { title: 'Out for\nDelivery', active: true },
                { title: 'Order\nDelivered', active: false },
                { title: 'Request\nReview', active: false },
                { title: 'Handle\nSupport', active: false },
                { title: 'Send Promo\nCode', active: false },
                { title: 'Customer\nSatisfaction', active: false },
              ].map((item, i) => (
                <div key={i} className={`cj-task-box ${item.active ? 'active' : 'inactive'}`}>
                  {i === 0 && (
                    <div className="cj-dot cj-dot-black" style={{ top: '50%', left: '-16px', transform: 'translateY(-50%)' }}></div>
                  )}
                  <span className="cj-task-text">
                    {item.title}
                  </span>
                </div>
              ))}
            </div>
            <div className="cj-col-title">Delivery & Feedback</div>
          </div>
          
          {/* SVG Connecting Lines - absolutely positioned over the grid */}
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0, overflow: 'visible' }}>
            {/* Col 1 to Col 2 (Blue Lines) */}
            <path d="M 23 80 C 26 80, 24 40, 27 40" fill="none" stroke="#93C5FD" strokeWidth="1.5" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />
            <path d="M 23 80 C 26 80, 24 120, 27 120" fill="none" stroke="#93C5FD" strokeWidth="1.5" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />
            <path d="M 23 80 C 26 80, 24 200, 27 200" fill="none" stroke="#93C5FD" strokeWidth="1.5" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />
            
            {/* Col 1 to Col 2 (Red Lines) */}
            <path d="M 23 280 C 26 280, 24 280, 27 280" fill="none" stroke="#EF4444" strokeWidth="1.5" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />
            <path d="M 23 280 C 26 280, 24 360, 27 360" fill="none" stroke="#EF4444" strokeWidth="1.5" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />
            
            {/* Col 2 to Col 3 (Gray Lines) */}
            <path d="M 48 40 C 51 40, 49 40, 52 40" fill="none" stroke="#D1D5DB" strokeWidth="1.5" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />
            <path d="M 48 120 C 51 120, 49 120, 52 120" fill="none" stroke="#D1D5DB" strokeWidth="1.5" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />
            <path d="M 48 200 C 51 200, 49 200, 52 200" fill="none" stroke="#EF4444" strokeWidth="1.5" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />
            <path d="M 48 280 C 51 280, 49 280, 52 280" fill="none" stroke="#EF4444" strokeWidth="1.5" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />
            <path d="M 48 360 C 51 360, 49 360, 52 360" fill="none" stroke="#D1D5DB" strokeWidth="1.5" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />
            
            {/* Col 3 to Col 4 (Solid Black Line) */}
            <path d="M 73 200 C 76 200, 75 62.5, 77.5 62.5" fill="none" stroke="#000000" strokeWidth="1.5" markerEnd="url(#arrow)" vectorEffect="non-scaling-stroke" />
            
            <defs>
              <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#000000" />
              </marker>
            </defs>
          </svg>

          {/* Workflow Logic Toggles */}
          <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', gap: '1rem', zIndex: 20, left: '49%', top: '110px', transform: 'translateX(-50%)' }}>
            <button style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'white', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280', zIndex: 30, cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
              <span style={{ fontSize: '1.125rem', lineHeight: 1, marginTop: '-2px' }}>+</span>
            </button>
            <button style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'white', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280', zIndex: 30, marginTop: '60px', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
              <span style={{ fontSize: '1.125rem', lineHeight: 1, marginTop: '-4px' }}>-</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Widgets */}
      <div className="cj-bottom-widgets">
        
        {/* Suggested Knowledge -> Trending Menu Items */}
        <div className="cj-card">
          <div className="cj-top-row">
            <h2 className="cj-card-title">Trending Menu Items</h2>
            <div className="cj-actions">
              <ActionIcon icon={Plus} />
              <ActionIcon icon={Upload} />
              <ActionIcon icon={Calendar} />
            </div>
          </div>
          
          <table className="cj-table">
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Trend</th>
                <th>Orders</th>
                <th>Revenue</th>
                <th className="right">Category</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 600 }}>
                  <Star size={16} color="#9CA3AF" /> Spicy Tuna Roll
                </td>
                <td>
                  <span className="cj-status-pill" style={{ backgroundColor: '#60A5FA' }}>Trending Up</span>
                </td>
                <td style={{ color: '#6B7280', fontWeight: 500 }}>145</td>
                <td style={{ color: '#6B7280', fontWeight: 500 }}>$1,240</td>
                <td style={{ textAlign: 'right', fontWeight: 500 }}>Sushi</td>
              </tr>
              <tr>
                <td style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 600 }}>
                  <Star size={16} color="#000000" fill="#000000" /> Avocado Toast
                </td>
                <td>
                  <span className="cj-status-pill" style={{ backgroundColor: '#F87171' }}>Stable</span>
                </td>
                <td style={{ color: '#6B7280', fontWeight: 500 }}>89</td>
                <td style={{ color: '#6B7280', fontWeight: 500 }}>$750</td>
                <td style={{ textAlign: 'right', fontWeight: 500 }}>Breakfast</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Support Ticket Journey -> Order Status Overview */}
        <div className="cj-card">
          <div className="cj-top-row">
            <h2 className="cj-card-title">Order Status Overview</h2>
            <div className="cj-actions">
              <ActionIcon icon={Plus} />
              <ActionIcon icon={Upload} />
              <ActionIcon icon={Calendar} />
            </div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', height: '160px' }}>
            <div className="cj-donut-container">
              <svg viewBox="0 0 100 100" className="cj-donut-svg">
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#E2E8F0" strokeWidth="20" />
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#93C5FD" strokeWidth="20" strokeDasharray="160 251" />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>184</span>
              </div>
              <div className="cj-donut-label">Completed</div>
            </div>

            <div className="cj-donut-container">
              <svg viewBox="0 0 100 100" className="cj-donut-svg">
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#E2E8F0" strokeWidth="20" />
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#EF4444" strokeWidth="20" strokeDasharray="210 251" />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>27</span>
              </div>
              <div className="cj-donut-label">Preparing</div>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default CustomerJourneys;
