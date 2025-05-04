import { useState, useEffect } from 'react';
import { getCoffees } from '../lib/data';
import Header from './Header';

const flavorTags = [
  'fruity', 'nutty', 'chocolate', 'floral', 'spicy', 'earthy', 'citrus', 'caramel', 'herbal', 'smoky', 'bright', 'bold'
];

const emojiOptions = ['😋', '😍', '🤔', '😐', '😶', '🤢'];

export default function Taste() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const coffees = getCoffees();
  const [name, setName] = useState('');
  const [coffee, setCoffee] = useState(coffees[0]?.id || 'A');
  const [flavors, setFlavors] = useState([]);
  const [emoji, setEmoji] = useState('');
  const [note, setNote] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('brewHahaName') : '';
    if (stored) setName(stored);
  }, []);

  const handleFlavor = (tag) => {
    if (flavors.includes(tag)) {
      setFlavors(flavors.filter(f => f !== tag));
    } else if (flavors.length < 3) {
      setFlavors([...flavors, tag]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      localStorage.setItem('brewHahaName', name.trim());
    }
    const entry = { name: name.trim(), coffee, flavors, emoji, note, time: Date.now() };
    // Save to localStorage (append to array)
    const prev = JSON.parse(localStorage.getItem('tastings') || '[]');
    localStorage.setItem('tastings', JSON.stringify([...prev, entry]));
    setSubmitted(true);
  };

  if (!mounted) return null;

  if (submitted) {
    return (
      <>
        <Header />
        <div style={{...pageStyle, paddingTop: '5rem'}}>
          <h1 style={{ color: '#6b4f1d' }}>Thank you!</h1>
          <p style={{ color: '#6b4f1d' }}>Your tasting has been logged. Enjoy the next coffee!</p>
          <button style={buttonStyle} onClick={() => {
            setCoffee(coffees[0]?.id || 'A'); setFlavors([]); setEmoji(''); setNote(''); setSubmitted(false);
          }}>Log Another</button>
          <a href="/">
            <button style={{ ...buttonStyle, background: '#e0cba8', color: '#6b4f1d', marginTop: 16 }}>
              Return to Homepage
            </button>
          </a>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div style={{...pageStyle, paddingTop: '5rem'}}>
        <h1 style={{ color: '#6b4f1d' }}>Taste</h1>
        <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 340, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <label style={labelStyle}>
            Your Name:
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Enter your name"
              style={inputStyle}
              required
            />
          </label>
          <label style={labelStyle}>
            Select Coffee:
            <select value={coffee} onChange={e => setCoffee(e.target.value)} style={inputStyle}>
              {coffees.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
          <label style={labelStyle}>
            Pick up to 3 flavors:
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
              {flavorTags.map(tag => (
                <button
                  type="button"
                  key={tag}
                  onClick={() => handleFlavor(tag)}
                  style={{
                    background: flavors.includes(tag) ? '#6b4f1d' : '#e0cba8',
                    color: flavors.includes(tag) ? '#fffbe7' : '#6b4f1d',
                    border: 'none',
                    borderRadius: 16,
                    padding: '0.5rem 1rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    outline: flavors.includes(tag) ? '2px solid #6b4f1d' : 'none',
                    transition: 'background 0.2s'
                  }}
                  disabled={!flavors.includes(tag) && flavors.length >= 3}
                >
                  {tag}
                </button>
              ))}
            </div>
          </label>
          <label style={labelStyle}>
            Emoji reaction (optional):
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              {emojiOptions.map(e => (
                <button
                  type="button"
                  key={e}
                  onClick={() => setEmoji(e)}
                  style={{
                    fontSize: 24,
                    background: emoji === e ? '#6b4f1d' : '#e0cba8',
                    color: emoji === e ? '#fffbe7' : '#6b4f1d',
                    border: 'none',
                    borderRadius: '50%',
                    width: 40,
                    height: 40,
                    cursor: 'pointer',
                    outline: emoji === e ? '2px solid #6b4f1d' : 'none',
                    transition: 'background 0.2s'
                  }}
                >
                  {e}
                </button>
              ))}
            </div>
          </label>
          <label style={labelStyle}>
            Notes (optional):
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              rows={2}
              style={{ ...inputStyle, resize: 'vertical' }}
              placeholder="Describe your experience..."
            />
          </label>
          <button type="submit" style={buttonStyle} disabled={flavors.length === 0}>
            Submit Tasting
          </button>
        </form>
      </div>
    </>
  );
}

const pageStyle = {
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  fontFamily: 'sans-serif',
  background: '#fffbe7',
  padding: '2rem'
};

const buttonStyle = {
  width: '100%',
  padding: '1.2rem',
  fontSize: '1.2rem',
  background: '#6b4f1d',
  color: '#fffbe7',
  border: 'none',
  borderRadius: '1.5rem',
  fontWeight: 'bold',
  letterSpacing: '0.02em',
  cursor: 'pointer',
  boxShadow: '0 2px 8px #0001',
  transition: 'background 0.2s',
  marginTop: 24
};

const labelStyle = {
  color: '#6b4f1d',
  fontWeight: 'bold',
  marginBottom: 8,
  display: 'block'
};

const inputStyle = {
  width: '100%',
  padding: '0.7rem',
  borderRadius: 12,
  border: '1px solid #e0cba8',
  marginTop: 8,
  fontSize: '1rem',
  fontFamily: 'inherit',
  background: '#fffbe7',
  color: '#6b4f1d'
};