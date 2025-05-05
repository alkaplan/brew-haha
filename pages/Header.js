import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTheme } from '../lib/themeContext';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();
  const { theme, isMomMode } = useTheme();

  // Add scroll detection
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems = [
    { label: 'Home', path: '/' },
    { label: 'Choose', path: '/choose' },
    { label: 'Taste', path: '/taste' },
    { label: 'Review', path: '/review' },
    { label: 'Pastries', path: '/pastries' },
    { label: 'About', path: '/about' }
  ];

  const adminItem = { label: 'Admin', path: '/admin' };

  return (
    <header style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      background: scrolled ? theme.cardBackground : theme.background,
      padding: '1rem 1.5rem',
      zIndex: 1000,
      boxShadow: scrolled ? theme.boxShadow : '0 2px 8px rgba(0,0,0,0.05)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      transition: 'all 0.3s ease'
    }}>
      <Link href="/" style={{ textDecoration: 'none' }}>
        <h1 
          style={{ 
            margin: 0, 
            color: theme.primary,
            fontSize: scrolled ? '1.3rem' : '1.5rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            letterSpacing: '0.02em',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          Coffee House {isMomMode && <span style={{ marginLeft: 8 }}>🌸</span>}
        </h1>
      </Link>
      
      <div className="desktop-menu" style={{ 
        display: 'none',
        '@media screen and (min-width: 768px)': {
          display: 'flex'
        }
      }}>
        {menuItems.map((item) => (
          <Link key={item.path} href={item.path} style={{ textDecoration: 'none' }}>
            <button
              style={{
                padding: '8px 16px',
                background: 'transparent',
                color: router.pathname === item.path ? theme.secondary : theme.primary,
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                textAlign: 'center',
                fontWeight: router.pathname === item.path ? 'bold' : 'normal',
                margin: '0 4px',
                fontSize: '1rem',
                transition: 'all 0.2s ease',
                position: 'relative',
                ':hover': {
                  color: theme.secondary
                }
              }}
            >
              {item.label}
              {router.pathname === item.path && (
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '20px',
                  height: '2px',
                  background: theme.secondary,
                  borderRadius: '2px'
                }} />
              )}
            </button>
          </Link>
        ))}
      </div>
      
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '0.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem',
          zIndex: 1001
        }}
      >
        <div style={{
          width: '24px',
          height: '2px',
          background: theme.primary,
          transition: 'transform 0.3s',
          transform: isOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none'
        }} />
        <div style={{
          width: '24px',
          height: '2px',
          background: theme.primary,
          transition: 'opacity 0.3s',
          opacity: isOpen ? 0 : 1
        }} />
        <div style={{
          width: '24px',
          height: '2px',
          background: theme.primary,
          transition: 'transform 0.3s',
          transform: isOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none'
        }} />
      </button>

      {isOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: '100%',
          maxWidth: '300px',
          height: '100vh',
          background: theme.background,
          boxShadow: '-2px 0 10px rgba(0,0,0,0.1)',
          padding: '4rem 1.5rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          zIndex: 1000,
          transition: 'all 0.3s ease',
          animation: 'slideIn 0.3s ease'
        }}>
          {menuItems.map((item) => (
            <Link key={item.path} href={item.path} onClick={() => setIsOpen(false)}>
              <button
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  background: router.pathname === item.path ? theme.accent : 'transparent',
                  color: theme.primary,
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontWeight: router.pathname === item.path ? 'bold' : 'normal',
                  fontSize: '1.1rem',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'all 0.2s ease'
                }}
              >
                {item.label}
              </button>
            </Link>
          ))}
          
          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ height: '1px', background: theme.accent, opacity: 0.2, margin: '0.5rem 0' }} />
            
            <Link href={adminItem.path} onClick={() => setIsOpen(false)}>
              <button
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  background: router.pathname === adminItem.path ? theme.accent : 'transparent',
                  color: theme.primary,
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontWeight: router.pathname === adminItem.path ? 'bold' : 'normal',
                  fontSize: '1.1rem',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'all 0.2s ease'
                }}
              >
                {adminItem.label}
              </button>
            </Link>
            
            <div style={{ textAlign: 'center', color: theme.primary, fontSize: '0.9rem', opacity: 0.7 }}>
              © 2025 Coffee House {isMomMode && '🌸'}
            </div>
          </div>
        </div>
      )}
      
      <style jsx global>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        
        @media screen and (min-width: 768px) {
          .desktop-menu {
            display: flex !important;
          }
        }
      `}</style>
    </header>
  );
} 