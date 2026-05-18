import React, { useEffect, useRef } from 'react';
import './LandingPage.css';

export default function LandingPage({ onLaunchDashboard }) {
  const iframeRef = useRef(null);

  useEffect(() => {
    const handleIframeClick = (e) => {
      const target = e.target;
      const clickable = target.closest('a, button, [role="button"]');
      if (clickable) {
        const text = (clickable.textContent || '').toLowerCase().trim();
        // Check if the clicked button or link is a CTA to transition to dashboard/login
        if (
          text.includes('log in') || 
          text.includes('login') || 
          text.includes('start free') || 
          text.includes('free trial') || 
          text.includes('try') || 
          text.includes('book a demo')
        ) {
          e.preventDefault();
          onLaunchDashboard();
        }
      }
    };

    const handleLoad = () => {
      const iframe = iframeRef.current;
      if (iframe && iframe.contentDocument) {
        // Attach click listeners to intercept navigation/CTA triggers
        iframe.contentDocument.addEventListener('click', handleIframeClick);
      }
    };

    const iframe = iframeRef.current;
    if (iframe) {
      iframe.addEventListener('load', handleLoad);
    }

    return () => {
      if (iframe) {
        iframe.removeEventListener('load', handleLoad);
      }
      try {
        if (iframe && iframe.contentDocument) {
          iframe.contentDocument.removeEventListener('click', handleIframeClick);
        }
      } catch (err) {
        console.error(err);
      }
    };
  }, [onLaunchDashboard]);

  return (
    <div className="landing-page-iframe-container">
      <iframe
        ref={iframeRef}
        src="/landing.html"
        className="landing-page-iframe"
        title="MenuIQ Landing Page"
      />
    </div>
  );
}
