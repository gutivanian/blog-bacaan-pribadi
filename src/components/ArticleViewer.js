// components/ArticleViewer.js (FIXED - Mobile Touch Support)
'use client';

import { useEffect, useState, useRef } from 'react';
import LastReadButton from './LastReadButton';
import HighlightManager from './HighlightManager';

export default function ArticleViewer({ article }) {
  const [userSession, setUserSession] = useState(null);
  const contentRef = useRef(null);
  const [lastReadPosition, setLastReadPosition] = useState(null);

  useEffect(() => {
    // Generate or get user session ID
    let session = localStorage.getItem('userSession');
    if (!session) {
      session = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('userSession', session);
    }
    setUserSession(session);

    // Fetch last read position
    fetchLastReadPosition(session);
  }, []);

  useEffect(() => {
    if (!contentRef.current) return;

    // Wait for DOM to be fully rendered
    setTimeout(() => {
      initializeInteractiveFeatures();
    }, 100);

    // Track scroll for last read
    const handleScroll = () => {
      if (userSession) {
        const scrollPosition = window.scrollY;
        
        // Debounce save
        clearTimeout(window.scrollSaveTimeout);
        window.scrollSaveTimeout = setTimeout(() => {
          saveLastReadPosition(scrollPosition);
        }, 1000);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(window.scrollSaveTimeout);
    };
  }, [userSession, article.id]); // Add article.id to dependencies

  const fetchLastReadPosition = async (session) => {
    try {
      const response = await fetch(
        `/api/last-read?articleId=${article.id}&userSession=${session}`
      );
      const data = await response.json();
      setLastReadPosition(data.position);
    } catch (error) {
      console.error('Error fetching last read position:', error);
    }
  };

  const saveLastReadPosition = async (scrollPosition) => {
    try {
      await fetch('/api/last-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleId: article.id,
          userSession,
          scrollPosition,
        }),
      });
    } catch (error) {
      console.error('Error saving last read position:', error);
    }
  };

  const goToLastRead = () => {
    if (lastReadPosition) {
      window.scrollTo({
        top: lastReadPosition.scroll_position,
        behavior: 'smooth'
      });
    }
  };

  const initializeInteractiveFeatures = () => {
    if (!contentRef.current) return;

    // Use event delegation for all interactive elements
    const handleClick = (e) => {
      const target = e.target;

      // Handle toggle buttons (Sembunyikan/Tampilkan)
      if (target.classList.contains('toggle-btn')) {
        e.preventDefault();
        e.stopPropagation();
        
        const sectionHeader = target.closest('.section-header');
        const sectionContent = sectionHeader?.nextElementSibling;
        
        console.log('Toggle clicked:', {
          hasHeader: !!sectionHeader,
          hasContent: !!sectionContent,
          isHidden: sectionContent?.classList.contains('hidden')
        });
        
        if (sectionContent?.classList.contains('section-content')) {
          const isHidden = sectionContent.classList.contains('hidden');
          
          if (isHidden) {
            sectionContent.classList.remove('hidden');
            target.textContent = 'Sembunyikan';
          } else {
            sectionContent.classList.add('hidden');
            target.textContent = 'Tampilkan';
          }
        }
        return;
      }

      // Handle navigation links
      if (target.classList.contains('nav-link')) {
        e.preventDefault();
        const targetId = target.getAttribute('href')?.substring(1);
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
        return;
      }

      // Handle mobile sidebar toggle
      if (target.classList.contains('toggle-nav')) {
        e.preventDefault();
        const sidebar = contentRef.current?.querySelector('.sidebar');
        if (sidebar) {
          sidebar.classList.toggle('active');
        }
        return;
      }

      // Handle back to top button
      if (target.classList.contains('back-to-top')) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    };

    // Add touch event for better mobile support
    const handleTouch = (e) => {
      const target = e.target;
      
      if (target.classList.contains('toggle-btn') || 
          target.classList.contains('nav-link') || 
          target.classList.contains('toggle-nav') ||
          target.classList.contains('back-to-top')) {
        // Add visual feedback
        target.style.opacity = '0.7';
        setTimeout(() => {
          target.style.opacity = '1';
        }, 100);
      }
    };

    // Remove old listeners if any
    contentRef.current.removeEventListener('click', handleClick);
    contentRef.current.removeEventListener('touchstart', handleTouch);

    // Add new listeners with event delegation
    contentRef.current.addEventListener('click', handleClick, true);
    contentRef.current.addEventListener('touchstart', handleTouch, { passive: true });

    // Back to top scroll handler
    const backToTopBtn = contentRef.current?.querySelector('.back-to-top');
    if (backToTopBtn) {
      const handleScroll = () => {
        if (window.scrollY > 300) {
          backToTopBtn.style.display = 'block';
        } else {
          backToTopBtn.style.display = 'none';
        }
      };

      window.removeEventListener('scroll', handleScroll);
      window.addEventListener('scroll', handleScroll);
      handleScroll(); // Initial check
    }

    // Log all interactive elements found
    console.log('Interactive elements initialized:', {
      toggleButtons: contentRef.current.querySelectorAll('.toggle-btn').length,
      navLinks: contentRef.current.querySelectorAll('.nav-link').length,
      sidebar: !!contentRef.current.querySelector('.sidebar'),
      backToTop: !!contentRef.current.querySelector('.back-to-top')
    });
  };

  return (
    <div>
      {lastReadPosition && (
        <LastReadButton onClick={goToLastRead} />
      )}

      <div 
        ref={contentRef}
        className="article-content"
        dangerouslySetInnerHTML={{ __html: article.styled_html }}
      />

      {/* Highlight Manager */}
      {userSession && (
        <HighlightManager
          articleId={article.id}
          userSession={userSession}
          containerRef={contentRef}
        />
      )}
    </div>
  );
}