import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Type, Image as ImageIcon, AlertCircle, CheckCircle2, Wrench } from 'lucide-react';

const PhotoAnalysisModal = ({ isOpen, onClose }) => {
  const [focalIssue, setFocalIssue] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);

  React.useEffect(() => {
    setGeneratedImage(null);
  }, [focalIssue?.id]);



  const isFullyOptimized = false; // Based on mock data having issues

  const platformData = {
    'Deliveroo': { color: '#00CCBC', icon: 'https://cdn.simpleicons.org/deliveroo/white' },
    'Uber Eats': { color: '#06C167', icon: 'https://cdn.simpleicons.org/ubereats/white' },
    'Just Eat': { color: '#FF8000', icon: 'https://cdn.simpleicons.org/justeat/white' }
  };

  // Mock Issue Data
  const [issues, setIssues] = useState([
    {
      id: 3,
      category: 'Sides',
      platform: 'Deliveroo',
      type: 'Missing Photos',
      itemName: 'Classic Cheeseburger',
      shortFlaw: 'Missing Image',
      diagnostic: 'Image is completely missing from listing',
      solution: 'AI will generate a highly realistic placeholder image based on the item name and category.',
      severity: 'error',
      resolution: 'N/A',
      imageSrc: null,
      currentDescription: 'Burger with cheese and meat.',
      textFlaw: 'Missing allergen information (Dairy, Gluten).',
      optimizedDescription: 'A juicy, 100% British beef patty topped with melted mature cheddar, crisp lettuce, and our signature house sauce on a toasted brioche bun.',
      textSeverity: 'warning'
    },
    {
      id: 4,
      category: 'Sides',
      platform: 'Uber Eats',
      type: 'Optimal',
      itemName: 'Truffle Parmesan Fries',
      shortFlaw: 'Optimal',
      diagnostic: 'Image meets all quality standards.',
      solution: 'No action required.',
      severity: 'optimal',
      resolution: '1080 x 1080px',
      imageSrc: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=800&q=80',
      currentDescription: 'Crispy golden fries tossed in white truffle oil and generously coated with aged parmesan cheese.',
      textFlaw: 'Optimal',
      optimizedDescription: 'Crispy golden fries tossed in white truffle oil and generously coated with aged parmesan cheese.',
      textSeverity: 'optimal'
    },
    {
      id: 5,
      category: 'Mains',
      platform: 'Just Eat',
      type: 'Text Overlays',
      itemName: 'Spicy BBQ Wings',
      shortFlaw: 'Text/Watermark',
      diagnostic: 'Text/Watermark overlay detected on image',
      solution: 'AI will intelligently remove text overlays and reconstruct the background seamlessly.',
      severity: 'warning',
      resolution: '1080 x 1080px',
      imageSrc: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?auto=format&fit=crop&w=800&q=80',
      currentDescription: '6 pieces of chicken wings with bbq sauce on the side.',
      textFlaw: 'Description is too short and lacks appetizing adjectives.',
      optimizedDescription: 'Tender, bone-in chicken wings tossed in our signature fiery BBQ sauce. Served with a side of cool ranch for the perfect balance of heat and flavor.',
      textSeverity: 'error'
    }
  ]);

  const handleGenerateImage = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const newImage = "https://images.unsplash.com/photo-1608039829572-78524f79c4c7?auto=format&fit=crop&w=800&q=80";
      setGeneratedImage(newImage);
      setIsGenerating(false);
    }, 1500);
  };

  if (!isOpen) return null;

  return createPortal(
    <div 
      className="modal-overlay" 
      style={{ 
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', 
        zIndex: 100000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem',
        background: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
        fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
        overscrollBehavior: 'contain'
      }}
      onClick={onClose}
    >
      <div 
        className="modal-content" 
        style={{ 
          width: '1200px', maxWidth: '100%', height: focalIssue ? 'auto' : '90vh', maxHeight: '90vh', display: 'flex', flexDirection: 'column', 
          background: '#FCFAF6',
          borderRadius: '22px', border: '1px solid rgba(0,0,0,0.06)',
          boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.05)', 
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sleek Top Header */}
        {!focalIssue && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 2rem', borderBottom: '1px solid #E2E8F0', background: 'transparent' }}>
          {/* Title (Left) */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#1E293B', margin: 0, lineHeight: 1, display: 'flex', alignItems: 'center' }}>
              Menu Item Analysis
            </h2>
          </div>

          {/* Grouped Metrics (Right) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            {!focalIssue && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              
              {/* Menu Status */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#111' }}>Menu Status:</span>
                <div style={{ 
                  background: isFullyOptimized ? '#DCFCE7' : '#FEE2E2', 
                  color: isFullyOptimized ? '#16A34A' : '#DC2626', 
                  padding: '0.2rem 0.6rem', 
                  borderRadius: '8px', 
                  fontSize: '12px', 
                  fontWeight: 500,
                  letterSpacing: '0.02em',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  {isFullyOptimized ? <CheckCircle2 size={14} strokeWidth={2} /> : <AlertCircle size={14} strokeWidth={2} />}
                  {isFullyOptimized ? 'Fully Optimized' : 'Needs Optimization'}
                </div>
              </div>

              {/* Images */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#F3F4F6', padding: '0.2rem 0.6rem', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                <ImageIcon size={14} color="#6B7280" />
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#6B7280' }}>Images:</span>
                <span style={{ fontSize: '12px', fontWeight: 500, color: '#DC2626', letterSpacing: '0.02em' }}>2 Issues</span>
              </div>
              
              {/* Description */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#F3F4F6', padding: '0.2rem 0.6rem', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                <Type size={14} color="#6B7280" />
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#6B7280' }}>Description:</span>
                <span style={{ fontSize: '12px', fontWeight: 500, color: '#DC2626', letterSpacing: '0.02em' }}>2 Issues</span>
              </div>
              </div>
            )}

            {/* Close */}
            <button onClick={onClose} style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#F3F4F6', border: 'none', color: '#6B7280', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background-color 0.2s, color 0.2s' }} onMouseEnter={e => { e.currentTarget.style.background = '#E5E7EB'; e.currentTarget.style.color = '#111'; }} onMouseLeave={e => { e.currentTarget.style.background = '#F3F4F6'; e.currentTarget.style.color = '#6B7280'; }}>
              <X size={18} />
            </button>
          </div>
        </div>
        )}

        {/* Content Area - Grid or Focal View */}
        <div className="invisible-scrollbar" style={{ flex: 1, minHeight: 0, overflowY: 'auto', overscrollBehavior: 'contain', transform: 'translateZ(0)', padding: focalIssue ? '0' : '2.5rem', background: 'transparent', display: 'flex', flexDirection: 'column' }}>
          {focalIssue ? (
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0, background: '#F9FAFB', flex: 1 }}>
              {/* Focal View Two Column Layout */}
              <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
                
                {/* Left Column: Current State */}
                <div style={{ flex: 6, padding: '1.5rem', borderRight: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', gap: '2rem', background: '#FFFFFF' }}>
                    {/* Back Button */}
                    <div style={{ display: 'flex', alignItems: 'center', height: '24px' }}>
                      <button onClick={() => setFocalIssue(null)} style={{ background: 'transparent', border: 'none', color: '#6B7280', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', transition: 'color 0.2s', padding: 0 }} onMouseEnter={e => e.currentTarget.style.color = '#111'} onMouseLeave={e => e.currentTarget.style.color = '#6B7280'}>
                        ← Back to Grid
                      </button>
                    </div>

                    {/* Image Section Group */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                      {/* Image Layout */}
                      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'stretch' }}>
                        {/* Left: Image */}
                        <div style={{ position: 'relative', width: '312px', height: '260px', background: '#F3F4F6', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '1px solid #E5E7EB', flexShrink: 0 }}>
                          {focalIssue.imageSrc ? (
                            <img src={focalIssue.imageSrc} alt={focalIssue.itemName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: '#9CA3AF' }}>
                              <ImageIcon size={32} strokeWidth={1.5} />
                              <span style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>No Image Available</span>
                            </div>
                          )}
                        </div>

                        {/* Right: Metrics & Review */}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '0.25rem 0' }}>
                           {/* Menu Item Info */}
                           <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px' }}>
                             <span style={{ fontSize: '0.8rem', color: '#6B7280', fontWeight: 600 }}>Menu Item</span>
                             <span style={{ fontSize: '0.85rem', color: '#111', fontWeight: 600, textAlign: 'right', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={focalIssue.itemName}>{focalIssue.itemName}</span>
                           </div>

                           {/* Platform Info */}
                           {focalIssue.platform && (
                             <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px' }}>
                               <span style={{ fontSize: '0.8rem', color: '#6B7280', fontWeight: 600 }}>Platform</span>
                               <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                 {platformData[focalIssue.platform] && (
                                   <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: platformData[focalIssue.platform].color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                     <img src={platformData[focalIssue.platform].icon} alt={focalIssue.platform} style={{ width: '10px', height: '10px', objectFit: 'contain' }} />
                                   </div>
                                 )}
                                 <span style={{ fontSize: '0.85rem', color: '#111', fontWeight: 600 }}>{focalIssue.platform}</span>
                               </div>
                             </div>
                           )}

                           {/* Image Status Info (Replaces Resolution & Floating Header) */}
                           <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px' }}>
                             <span style={{ fontSize: '0.8rem', color: '#6B7280', fontWeight: 600 }}>Your Image</span>
                             <div style={{ background: focalIssue.severity === 'error' || focalIssue.severity === 'warning' ? '#FEE2E2' : '#DCFCE7', color: focalIssue.severity === 'error' || focalIssue.severity === 'warning' ? '#DC2626' : '#16A34A', padding: '4px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                               {focalIssue.severity === 'error' || focalIssue.severity === 'warning' ? <AlertCircle size={12} strokeWidth={2.5} /> : <CheckCircle2 size={12} strokeWidth={2.5} />}
                               {focalIssue.severity === 'error' ? 'Missing' : focalIssue.severity === 'warning' ? 'Low Quality' : 'Optimized'}
                             </div>
                           </div>

                           {/* Diagnostic Review */}
                           {(focalIssue.severity === 'error' || focalIssue.severity === 'warning') && focalIssue.diagnostic && (
                            <div style={{ padding: '0.875rem', background: '#FEF2F2', border: '1px dashed #FECACA', borderRadius: '8px', color: '#991B1B', display: 'flex', flexDirection: 'column', gap: '8px', marginTop: 'auto' }}>
                              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '1px' }} />
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                  <strong style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Image Review</strong>
                                  <span style={{ fontSize: '0.8rem', lineHeight: 1.4, opacity: 0.9 }}>{focalIssue.diagnostic}</span>
                                </div>
                              </div>
                            </div>
                           )}
                           {focalIssue.severity === 'optimal' && focalIssue.diagnostic && (
                            <div style={{ padding: '0.875rem', background: '#F0FDF4', border: '1px dashed #BBF7D0', borderRadius: '8px', color: '#166534', display: 'flex', flexDirection: 'column', gap: '8px', marginTop: 'auto' }}>
                              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                <CheckCircle2 size={16} style={{ flexShrink: 0, marginTop: '1px' }} />
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                  <strong style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Image Optimized</strong>
                                  <span style={{ fontSize: '0.8rem', lineHeight: 1.4, opacity: 0.9 }}>{focalIssue.diagnostic}</span>
                                </div>
                              </div>
                            </div>
                           )}
                        </div>
                      </div>
                    </div>

                    {/* Description Section Group */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>


                      {/* Description Content Box */}
                      <div style={{ 
                        display: 'flex', flexDirection: 'column', 
                        background: '#FFFFFF', 
                        border: '1px solid #E5E7EB', 
                        borderRadius: '12px', 
                        overflow: 'hidden'
                      }}>
                        {/* Box Header */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.75rem 1rem', background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                           <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#6B7280' }}>Description Status:</span>
                           <div style={{ background: focalIssue.textSeverity === 'error' || focalIssue.textSeverity === 'warning' ? '#FEE2E2' : '#DCFCE7', color: focalIssue.textSeverity === 'error' || focalIssue.textSeverity === 'warning' ? '#DC2626' : '#16A34A', padding: '4px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                             {focalIssue.textSeverity === 'error' || focalIssue.textSeverity === 'warning' ? <AlertCircle size={12} strokeWidth={2.5} /> : <CheckCircle2 size={12} strokeWidth={2.5} />}
                             {focalIssue.textSeverity === 'error' || focalIssue.textSeverity === 'warning' ? 'Needs Fix' : 'Optimized'}
                           </div>
                        </div>
                        
                        {/* Description Text */}
                        <div style={{ padding: '1.5rem', position: 'relative' }}>
                          <span style={{ position: 'absolute', top: '0.5rem', left: '0.5rem', fontSize: '4rem', color: '#F1F5F9', fontFamily: 'Georgia, serif', lineHeight: 1 }}>“</span>
                          <div style={{ position: 'relative', zIndex: 1, fontSize: '1rem', color: '#334155', fontStyle: 'italic', lineHeight: 1.6, fontWeight: 500, paddingLeft: '1.5rem' }}>
                            {focalIssue.currentDescription}
                          </div>
                        </div>

                        {/* Metrics: Issue and Fix */}
                        {(focalIssue.textSeverity === 'error' || focalIssue.textSeverity === 'warning') && focalIssue.textFlaw && (
                          <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px dashed #E5E7EB' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.9rem', color: '#111', lineHeight: 1.5 }}>
                              <AlertCircle size={16} color="#DC2626" style={{ flexShrink: 0, marginTop: '2px' }} />
                              <div>
                                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#DC2626' }}>Issue:</span> {focalIssue.textFlaw}
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.9rem', color: '#111', lineHeight: 1.5 }}>
                              <Wrench size={16} color="#EA580C" style={{ flexShrink: 0, marginTop: '2px' }} />
                              <div>
                                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#EA580C' }}>Fix:</span> Click <strong>Generate Description</strong> on the right to auto-rewrite.
                              </div>
                            </div>
                          </div>
                        )}
                        {focalIssue.textSeverity === 'optimal' && (
                          <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', borderTop: '1px dashed #E5E7EB', background: '#F0FDF4', color: '#166534', borderRadius: '0 0 12px 12px' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.9rem', lineHeight: 1.5 }}>
                              <CheckCircle2 size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                              <div>
                                <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Perfectly Optimized:</span> Highly appetizing and meets all platform guidelines.
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                  </div>
                </div>

                {/* Right Column: AI Recommendations */}
                <div style={{ flex: 4, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', background: '#FAF7F2', position: 'relative' }}>
                  {/* Floating Close Button */}
                  <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', width: '32px', height: '32px', borderRadius: '50%', background: '#FFFFFF', border: '1px solid #E5E7EB', color: '#6B7280', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', zIndex: 10, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }} onMouseEnter={e => { e.currentTarget.style.background = '#F9FAFB'; e.currentTarget.style.color = '#111'; e.currentTarget.style.borderColor = '#D1D5DB'; }} onMouseLeave={e => { e.currentTarget.style.background = '#FFFFFF'; e.currentTarget.style.color = '#6B7280'; e.currentTarget.style.borderColor = '#E5E7EB'; }}>
                    <X size={16} />
                  </button>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '1.25rem', background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>


                        {/* Image Preview Box */}
                        <div style={{ position: 'relative', width: '100%', height: '240px', background: '#FFFFFF', borderRadius: '12px', border: '2px dashed #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginTop: '0.25rem' }}>
                          {isGenerating ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', color: '#94A3B8' }}>
                              <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: '3px solid #E2E8F0', borderTopColor: '#E05046', animation: 'spin 1s linear infinite' }} />
                              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Generating Photo...</span>
                              <style>
                                {`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}
                              </style>
                            </div>
                          ) : generatedImage ? (
                            <img src={generatedImage} alt="Generated AI Photo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: '#CBD5E1' }}>
                              <ImageIcon size={32} strokeWidth={1.5} />
                              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Item Image</span>
                            </div>
                          )}
                        </div>

                        <button 
                          onClick={handleGenerateImage}
                          disabled={isGenerating || generatedImage}
                          style={{ alignSelf: 'center', background: isGenerating || generatedImage ? '#D1D5DB' : focalIssue.severity === 'optimal' ? '#374151' : '#E05046', color: '#FFFFFF', border: 'none', padding: '8px 24px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700, cursor: isGenerating || generatedImage ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', transition: 'background 0.2s', marginTop: '0.25rem' }} 
                          onMouseEnter={e => !(isGenerating || generatedImage) && (e.currentTarget.style.background = focalIssue.severity === 'optimal' ? '#1F2937' : '#C8463D')} 
                          onMouseLeave={e => !(isGenerating || generatedImage) && (e.currentTarget.style.background = focalIssue.severity === 'optimal' ? '#374151' : '#E05046')}
                        >
                          {isGenerating ? 'Generating... ⏳' : <><ImageIcon size={14} /> {focalIssue.severity === 'optimal' ? 'Regenerate Image' : 'Generate Image'}</>}
                        </button>

                        {/* Apply Image Button */}
                        {generatedImage && (
                          <button 
                            onClick={() => {
                              setIssues(prev => prev.map(i => i.id === focalIssue.id ? { ...i, imageSrc: generatedImage, severity: 'optimal' } : i));
                              setFocalIssue(prev => ({ ...prev, imageSrc: generatedImage, severity: 'optimal' }));
                              setGeneratedImage(null);
                            }}
                            style={{ background: '#10B981', color: '#FFF', border: 'none', padding: '8px 14px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', transition: 'background 0.2s', marginTop: '0.25rem' }}
                            onMouseEnter={e => (e.currentTarget.style.background = '#059669')} 
                            onMouseLeave={e => (e.currentTarget.style.background = '#10B981')}
                          >
                            Apply AI Image
                          </button>
                        )}
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '1.25rem', background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                        {/* Text Preview Box */}
                        <div style={{ position: 'relative', width: '100%', minHeight: '140px', background: '#FFFFFF', borderRadius: '12px', border: '2px dashed #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: '#CBD5E1' }}>
                            <Type size={32} strokeWidth={1.5} />
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Item Description</span>
                          </div>
                        </div>
                        <button style={{ alignSelf: 'center', background: focalIssue.textSeverity === 'optimal' ? '#374151' : '#E05046', color: '#FFFFFF', border: 'none', padding: '8px 24px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', transition: 'background-color 0.2s', marginTop: '0.5rem' }} onMouseEnter={e => e.currentTarget.style.background = focalIssue.textSeverity === 'optimal' ? '#1F2937' : '#C8463D'} onMouseLeave={e => e.currentTarget.style.background = focalIssue.textSeverity === 'optimal' ? '#374151' : '#E05046'}>
                          <Type size={14} /> {focalIssue.textSeverity === 'optimal' ? 'Regenerate Description' : 'Generate Description'}
                        </button>
                      </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Grid content
            ['Mains', 'Sides', 'Drinks', 'Optimized'].map(cat => {
              if (activeCategory !== 'All' && activeCategory !== cat) return null;
              
              const catIssues = cat === 'Optimized'
                ? issues.filter(i => i.severity === 'optimal' && i.textSeverity === 'optimal')
                : issues.filter(i => i.category === cat && (i.severity !== 'optimal' || i.textSeverity !== 'optimal'));
                
              if (catIssues.length === 0) return null;

              return (
                <div key={cat} style={{ marginBottom: '4rem' }}>
                  <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.15rem', fontWeight: 600, color: '#1E293B', lineHeight: 1, display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {cat === 'Mains' ? 'Main Items' : cat === 'Sides' ? 'Side Items' : cat === 'Drinks' ? 'Drinks' : 'Perfectly Optimized'}
                    <div style={{ height: '1px', flex: 1, background: 'linear-gradient(90deg, #E5E7EB 0%, transparent 100%)' }} />
                  </h3>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                    {catIssues.map(issue => {
                      const hasError = issue.severity === 'error' || issue.textSeverity === 'error' || issue.textSeverity === 'warning';

                      return (
                        <div key={issue.id} onClick={() => setFocalIssue(issue)} style={{ display: 'flex', flexDirection: 'column', background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E5E7EB', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', cursor: 'pointer' }}>
                          
                          {/* Image Header */}
                          <div style={{ position: 'relative', height: '160px', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {issue.imageSrc ? (
                              <img src={issue.imageSrc} alt={issue.itemName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', color: '#9CA3AF' }}>
                                <ImageIcon size={32} strokeWidth={1.5} />
                                <span style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>No Image</span>
                              </div>
                            )}
                            
                            {/* Platform Badge */}
                            {issue.platform && platformData[issue.platform] && (
                              <div style={{ position: 'absolute', top: '12px', right: '12px', width: '28px', height: '28px', borderRadius: '50%', background: platformData[issue.platform].color, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', border: '2px solid #FFFFFF' }} title={issue.platform}>
                                <img src={platformData[issue.platform].icon} alt={issue.platform} style={{ width: '14px', height: '14px', objectFit: 'contain' }} />
                              </div>
                            )}
                          </div>

                          {/* Content */}
                          <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1, zIndex: 1 }}>
                            <h4 style={{ margin: '-10px 0 8px 0', fontSize: '1.15rem', fontWeight: 800, color: '#111', lineHeight: 1.2 }}>{issue.itemName}</h4>
                            
                            <p style={{ margin: '0 0 16px 0', fontSize: '0.85rem', color: '#6B7280', lineHeight: 1.5, flex: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                              <strong style={{ color: '#111', fontWeight: 700 }}>Description:</strong> {issue.currentDescription}
                            </p>

                            {/* Image & Description Metrics */}
                            <div style={{ display: 'flex', flexWrap: 'nowrap', gap: '6px', marginBottom: '16px', overflowX: 'hidden' }}>
                              {/* Image Metric */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', minWidth: 0 }}>
                                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#111', flexShrink: 0 }}>Image:</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: issue.severity === 'error' || issue.severity === 'warning' ? '#FEE2E2' : '#DCFCE7', color: issue.severity === 'error' || issue.severity === 'warning' ? '#DC2626' : '#16A34A', padding: '4px 6px', borderRadius: '6px', fontSize: '0.65rem', fontWeight: 700, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                                  {issue.severity === 'error' || issue.severity === 'warning' ? <AlertCircle size={10} strokeWidth={2.5} style={{ flexShrink: 0 }} /> : <CheckCircle2 size={10} strokeWidth={2.5} style={{ flexShrink: 0 }} />}
                                  {issue.severity === 'error' ? 'Missing' : issue.severity === 'warning' ? 'Low Quality' : 'Optimized'}
                                </div>
                              </div>
                              
                              {/* Description Metric */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', minWidth: 0 }}>
                                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#111', flexShrink: 0 }}>Description:</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: issue.textSeverity === 'error' || issue.textSeverity === 'warning' ? '#FEE2E2' : '#DCFCE7', color: issue.textSeverity === 'error' || issue.textSeverity === 'warning' ? '#DC2626' : '#16A34A', padding: '4px 6px', borderRadius: '6px', fontSize: '0.65rem', fontWeight: 700, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                                  {issue.textSeverity === 'error' || issue.textSeverity === 'warning' ? <AlertCircle size={10} strokeWidth={2.5} style={{ flexShrink: 0 }} /> : <CheckCircle2 size={10} strokeWidth={2.5} style={{ flexShrink: 0 }} />}
                                  {issue.textSeverity === 'error' || issue.textSeverity === 'warning' ? 'Needs Fix' : 'Optimized'}
                                </div>
                              </div>
                            </div>

                            {/* Action Button */}
                            {hasError && (
                              <button
                                onClick={(e) => { e.stopPropagation(); setFocalIssue(issue); }}
                                style={{ width: '100%', background: '#E05046', color: '#FFFFFF', border: 'none', padding: '10px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background-color 0.2s' }}
                                onMouseEnter={e => { e.currentTarget.style.background = '#C8463D'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = '#E05046'; }}
                              >
                                View Recommendations
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default PhotoAnalysisModal;

