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

        // Inject background wallpaper style block and logo modifier via MutationObserver
        // to handle async bundler and React hydration inside the iframe
        let initialized = false;
        const observer = new MutationObserver(() => {
          const doc = iframe.contentDocument;
          if (!doc) return;

          // Inject custom styles if they haven't been injected yet
          if (!doc.getElementById('menuiq-custom-styles') && doc.head) {
            const style = doc.createElement('style');
            style.id = 'menuiq-custom-styles';
            style.textContent = `
              @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');

              /* Apply Outfit font globally */
              * {
                font-family: 'Outfit', sans-serif !important;
              }

              /* Apply the solid cream background without the wallpaper */
              body, #__bundler_thumbnail, #root {
                background-color: #FAF7F2 !important;
                background-image: none !important;
              }
              
              /* Make middle section wrappers transparent so the body's cream background and wallpaper overlay show through */
              main, section, div[style*="background-color: rgb(250, 247, 242)"], div[class*="bg-[#FAF7F2]"] {
                background-color: transparent !important;
              }
              
              /* Ensure cards and other white overlays remain solid white and high-contrast */
              div.bg-white, div[class*="bg-white"], div[class*="rounded-"], .shadow-sm, form, footer {
                background-color: #ffffff !important;
              }
              
              /* Keep the ticker background dark and contrasty */
              div[style*="background-color: rgb(17, 16, 9)"], div.bg-black, rect[fill="#111009"] {
                background-color: #111009 !important;
                fill: #111009 !important;
              }
            `;
            doc.head.appendChild(style);
          }

          // Modify the "MenuIQ Beta" logo
          const els = doc.querySelectorAll('a, div, span, h1, h2, h3, p');
          for (const el of els) {
            const text = (el.textContent || '').trim().replace(/\s+/g, ' ');
            if (text === 'MenuIQ BETA' || text === 'MenuIQ Beta') {
              el.innerHTML = '<span style="color: #e05046; font-weight: 800; font-size: 1.5rem; font-family: \'Lufga\', sans-serif; letter-spacing: normal;">MenuIQ</span>';
              el.style.textDecoration = 'none';
              // If it's a link, remove underline
              if (el.tagName.toLowerCase() === 'a') {
                el.style.border = 'none';
                el.style.textDecoration = 'none';
              }
            }
          }
        });
        
        observer.observe(iframe.contentDocument, { childList: true, subtree: true, characterData: true });
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
