import { useState, useEffect, useRef, useCallback } from 'react';
import Header from './Header';
import { getCoffees } from '../lib/data';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const ItemTypes = { COFFEE: 'COFFEE' };

function DraggableCoffee({ coffee, index, moveCoffee }) {
  const ref = useRef(null);
  const [, drop] = useDrop({
    accept: ItemTypes.COFFEE,
    hover(item) {
      if (item.index === index) return;
      moveCoffee(item.index, index);
      item.index = index;
    },
  });
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.COFFEE,
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  drag(drop(ref));
  return (
    <div
      ref={ref}
      style={{
        opacity: isDragging ? 0.5 : 1,
        userSelect: 'none',
        padding: 16,
        margin: '0 0 8px 0',
        background: '#e0cba8',
        borderRadius: 8,
        cursor: 'move',
        fontWeight: 'bold',
        color: '#6b4f1d',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}
    >
      <span style={{ fontWeight: 'bold', fontSize: 18 }}>{index + 1}.</span>
      {coffee.name}
    </div>
  );
}

export default function Review() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const coffees = getCoffees();
  const [name, setName] = useState('');
  const [tastedIds, setTastedIds] = useState([]); // checked coffee ids
  const [ranked, setRanked] = useState([]); // order of right column
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('brewHahaName') : '';
    if (stored) setName(stored);
  }, []);

  // When tastedIds changes, update ranked to keep only checked coffees (preserve order)
  useEffect(() => {
    setRanked(prev => prev.filter(id => tastedIds.includes(id)).concat(tastedIds.filter(id => !prev.includes(id))));
  }, [tastedIds]);

  const handleCheck = (id) => {
    setTastedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const moveCoffee = useCallback((from, to) => {
    setRanked(prev => {
      const updated = [...prev];
      const [removed] = updated.splice(from, 1);
      updated.splice(to, 0, removed);
      return updated;
    });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      localStorage.setItem('brewHahaName', name.trim());
    }
    const entry = {
      name: name.trim(),
      ranked,
      time: Date.now()
    };
    const prev = JSON.parse(localStorage.getItem('reviews') || '[]');
    localStorage.setItem('reviews', JSON.stringify([...prev, entry]));
    setSubmitted(true);
  };

  if (!mounted) return null;

  if (submitted) {
    return (
      <>
        <Header />
        <div style={{...pageStyle, paddingTop: '5rem'}}>
          <h1 style={{ color: '#6b4f1d' }}>Thank you!</h1>
          <p style={{ color: '#6b4f1d' }}>Your rankings have been submitted.</p>
          <button style={buttonStyle} onClick={() => {
            setTastedIds([]); setRanked([]); setSubmitted(false);
          }}>Submit Another</button>
          <a href="/">
            <button style={{ ...buttonStyle, background: '#e0cba8', color: '#6b4f1d', marginTop: 16 }}>
              Return to Homepage
            </button>
          </a>
        </div>
      </>
    );
  }

  // Left: all coffees with checkboxes
  // Right: only checked coffees, reorderable
  return (
    <DndProvider backend={HTML5Backend}>
      <Header />
      <div style={{...pageStyle, paddingTop: '5rem'}}>
        <h1 style={{ color: '#6b4f1d' }}>Rank the Coffees You Tasted</h1>
        <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 800, display: 'flex', flexDirection: 'column', gap: 20 }}>
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
          <div style={{ display: 'flex', gap: 32, justifyContent: 'center' }}>
            {/* Haven't Tasted (checkboxes) */}
            <div style={{ flex: 1 }}>
              <h3 style={{ color: '#6b4f1d', textAlign: 'center' }}>All Coffees</h3>
              <div style={{ minHeight: 120, background: '#fffbe7', borderRadius: 12, padding: 8, border: '1px solid #e0cba8' }}>
                {coffees.map((coffee) => (
                  <label key={coffee.id} style={{ display: 'flex', alignItems: 'center', gap: 12, fontWeight: 'bold', color: '#6b4f1d', marginBottom: 8 }}>
                    <input
                      type="checkbox"
                      checked={tastedIds.includes(coffee.id)}
                      onChange={() => handleCheck(coffee.id)}
                    />
                    {coffee.name}
                  </label>
                ))}
              </div>
            </div>
            {/* Have Tasted (Ranked, drag-and-drop) */}
            <div style={{ flex: 1 }}>
              <h3 style={{ color: '#6b4f1d', textAlign: 'center' }}>Ranked</h3>
              <div style={{ minHeight: 120, background: '#fffbe7', borderRadius: 12, padding: 8, border: '1px solid #e0cba8' }}>
                {ranked.map((id, idx) => {
                  const coffee = coffees.find(c => c.id === id);
                  return (
                    <DraggableCoffee key={id} coffee={coffee} index={idx} moveCoffee={moveCoffee} />
                  );
                })}
              </div>
            </div>
          </div>
          <button type="submit" style={buttonStyle} disabled={ranked.length === 0}>
            Submit Rankings
          </button>
        </form>
      </div>
    </DndProvider>
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
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  fontWeight: 'bold',
  fontSize: 18
};

const inputStyle = {
  padding: '0.8rem',
  border: '1px solid #6b4f1d',
  borderRadius: '0.5rem',
  fontSize: '1rem',
  color: '#6b4f1d'
};