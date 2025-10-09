// components/ArticleViewer.js (UPDATED - dengan Highlight Feature)
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

    // Initialize all interactive features
    initializeToggleButtons();
    initializeNavigation();
    initializeBackToTop();

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
  }, [userSession]);

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

  const initializeToggleButtons = () => {
    const toggleButtons = contentRef.current?.querySelectorAll('.toggle-btn');
    
    toggleButtons?.forEach(btn => {
      const handleClick = () => {
        const sectionHeader = btn.closest('.section-header');
        const sectionContent = sectionHeader?.nextElementSibling;
        
        if (sectionContent?.classList.contains('section-content')) {
          const isHidden = sectionContent.classList.contains('hidden');
          
          if (isHidden) {
            sectionContent.classList.remove('hidden');
            btn.textContent = 'Sembunyikan';
          } else {
            sectionContent.classList.add('hidden');
            btn.textContent = 'Tampilkan';
          }
        }
      };

      btn.removeEventListener('click', handleClick);
      btn.addEventListener('click', handleClick);
    });
  };

  const initializeNavigation = () => {
    const navLinks = contentRef.current?.querySelectorAll('.nav-link');
    
    navLinks?.forEach(link => {
      const handleClick = (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href')?.substring(1);
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      };

      link.removeEventListener('click', handleClick);
      link.addEventListener('click', handleClick);
    });

    // Toggle sidebar on mobile
    const toggleNavBtn = contentRef.current?.querySelector('.toggle-nav');
    const sidebar = contentRef.current?.querySelector('.sidebar');

    if (toggleNavBtn && sidebar) {
      const handleToggle = () => {
        sidebar.classList.toggle('active');
      };

      toggleNavBtn.removeEventListener('click', handleToggle);
      toggleNavBtn.addEventListener('click', handleToggle);
    }
  };

  const initializeBackToTop = () => {
    const backToTopBtn = contentRef.current?.querySelector('.back-to-top');
    
    if (backToTopBtn) {
      const handleClick = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      };

      const handleScroll = () => {
        if (window.scrollY > 300) {
          backToTopBtn.style.display = 'block';
        } else {
          backToTopBtn.style.display = 'none';
        }
      };

      backToTopBtn.removeEventListener('click', handleClick);
      backToTopBtn.addEventListener('click', handleClick);
      
      window.removeEventListener('scroll', handleScroll);
      window.addEventListener('scroll', handleScroll);
    }
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

      {/* Highlight Manager - NEW */}
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