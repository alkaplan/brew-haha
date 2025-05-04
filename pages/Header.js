import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const menuItems = [
    { label: 'Home', path: '/' },
    { label: 'Choose', path: '/choose' },
    { label: 'Taste', path: '/taste' },
    { label: 'Review', path: '/review' },
    { label: 'About', path: '/about' },
    { label: 'Admin', path: '/admin' }
  ];

  return (
    <header style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      background: '#fffbe7',
      padding: '1rem',
      zIndex: 1000,
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <Link href="/" style={{ textDecoration: 'none' }}>
        <h1 style={{ 
          margin: 0, 
          color: '#6b4f1d',
          fontSize: '1.5rem',
          fontWeight: 'bold',
          cursor: 'pointer'
        }}>
          Brew Haha
        </h1>
      </Link>
      
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '0.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem'
        }}
      >
        <div style={{
          width: '24px',
          height: '2px',
          background: '#6b4f1d',
          transition: 'transform 0.3s'
        }} />
        <div style={{
          width: '24px',
          height: '2px',
          background: '#6b4f1d',
          transition: 'opacity 0.3s'
        }} />
        <div style={{
          width: '24px',
          height: '2px',
          background: '#6b4f1d',
          transition: 'transform 0.3s'
        }} />
      </button>

      {isOpen && (
        <div style={{
          position: 'fixed',
          top: '4rem',
          right: '1rem',
          background: '#fffbe7',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          padding: '1rem',
          minWidth: '200px',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }}>
          {menuItems.map((item) => (
            <Link key={item.path} href={item.path}>
              <button
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: '#6b4f1d',
                  color: '#fffbe7',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontWeight: router.pathname === item.path ? 'bold' : 'normal'
                }}
              >
                {item.label}
              </button>
            </Link>
          ))}
        </div>
      )}
    </header>
  );
} 