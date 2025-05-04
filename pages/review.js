import { useState, useEffect, useRef, useCallback } from 'react';
import Header from './Header';
import { getCoffees, getTastingsForUser, getReviewsForUser, submitReview } from '../lib/dataSupabase';
import { getStoredUserId } from '../lib/user';
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

  const [coffees, setCoffees] = useState([]);
  const [tastedCoffees, setTastedCoffees] = useState([]); // only coffees tasted by user
  const [ranked, setRanked] = useState([]); // order of right column
  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const userId = getStoredUserId();
      const storedName = typeof window !== 'undefined' ? localStorage.getItem('brewHahaName') : '';
      if (storedName) setName(storedName);
      const allCoffees = await getCoffees();
      setCoffees(allCoffees);
      if (userId) {
        const tastings = await getTastingsForUser(userId);
        const tastedIds = tastings.map(t => t.coffee_id);
        const tasted = allCoffees.filter(c => tastedIds.includes(c.id));
        setTastedCoffees(tasted);
        setRanked(tasted.map(c => c.id));
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  const moveCoffee = useCallback((from, to) => {
    setRanked(prev => {
      const updated = [...prev];
      const [removed] = updated.splice(from, 1);
      updated.splice(to, 0, removed);
      return updated;
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    const userId = getStoredUserId();
    if (!userId) {
      setErrorMsg('User not found. Please return to the homepage and enter your name.');
      return;
    }
    if (ranked.length === 0) {
      setErrorMsg('Please rank at least one coffee.');
      return;
    }
    const { error } = await submitReview({ userId, ranked });
    if (error) {
      setErrorMsg('Failed to submit review. Please try again.');
      return;
    }
    setSuccessMsg('Review submitted!');
    setSubmitted(true);
  };

  if (!mounted || loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>;

  if (submitted) {
    return (
      <>
        <Header />
        <div style={{...pageStyle, paddingTop: '5rem'}}>
          <h1 style={{ color: '#6b4f1d' }}>Thank you!</h1>
          <p style={{ color: '#6b4f1d' }}>Your rankings have been submitted.</p>
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
    <DndProvider backend={HTML5Backend}>
      <Header />
      <div style={{...pageStyle, paddingTop: '5rem'}}>
        <h1 style={{ color: '#6b4f1d' }}>Rank the Coffees You Tasted</h1>
        <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 800, display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Name is shown, not editable */}
          <div style={{ color: '#6b4f1d', fontWeight: 'bold', marginBottom: 8 }}>Taster: {name}</div>
          <div style={{ display: 'flex', gap: 32, justifyContent: 'center' }}>
            {/* Ranked, drag-and-drop */}
            <div style={{ flex: 1 }}>
              <h3 style={{ color: '#6b4f1d', textAlign: 'center' }}>Ranked</h3>
              <div style={{ minHeight: 120, background: '#fffbe7', borderRadius: 12, padding: 8, border: '1px solid #e0cba8' }}>
                {ranked.map((id, idx) => {
                  const coffee = tastedCoffees.find(c => c.id === id);
                  return coffee ? (
                    <DraggableCoffee key={id} coffee={coffee} index={idx} moveCoffee={moveCoffee} />
                  ) : null;
                })}
              </div>
            </div>
          </div>
          {errorMsg && <div style={{ color: 'red', textAlign: 'center' }}>{errorMsg}</div>}
          {successMsg && <div style={{ color: 'green', textAlign: 'center' }}>{successMsg}</div>}
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