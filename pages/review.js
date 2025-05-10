import { useState, useEffect, useRef, useCallback } from 'react';
import Header from './Header';
import { getCoffees, getTastingsForUser, getReviewsForUser, submitReview } from '../lib/dataSupabase';
import { getStoredUserId } from '../lib/user';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { FLAVOR_TAGS } from '../lib/constants';
import { useRouter } from 'next/router';

const ItemTypes = { COFFEE: 'COFFEE' };

function RankedCoffee({ coffee, index, moveCoffee, totalItems }) {
  return (
    <div
      style={{
        padding: '16px 20px',
        margin: '0 0 12px 0',
        background: '#fff',
        borderRadius: 12,
        fontWeight: 'bold',
        color: '#6b4f1d',
        display: 'flex',
        alignItems: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        border: '2px solid #e0cba8',
        transition: 'all 0.2s ease'
      }}
    >
      <div style={{ 
        width: 28, 
        height: 28, 
        borderRadius: '50%', 
        background: '#6b4f1d', 
        color: '#fff', 
        marginRight: 16, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        fontSize: 14
      }}>
        {index + 1}
      </div>
      
      <div style={{ flex: 1 }}>
        {coffee.name}
      </div>
      
      <div style={{ 
        display: 'flex',
        flexDirection: 'column',
        gap: 8
      }}>
        <button
          onClick={() => moveCoffee(index, Math.max(0, index - 1))}
          disabled={index === 0}
          style={{
            padding: '8px',
            background: index === 0 ? '#f5f5f5' : '#6b4f1d',
            color: index === 0 ? '#ccc' : '#fff',
            border: 'none',
            borderRadius: 8,
            cursor: index === 0 ? 'not-allowed' : 'pointer',
            fontSize: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 36,
            height: 36
          }}
        >
          ↑
        </button>
        <button
          onClick={() => moveCoffee(index, Math.min(totalItems - 1, index + 1))}
          disabled={index === totalItems - 1}
          style={{
            padding: '8px',
            background: index === totalItems - 1 ? '#f5f5f5' : '#6b4f1d',
            color: index === totalItems - 1 ? '#ccc' : '#fff',
            border: 'none',
            borderRadius: 8,
            cursor: index === totalItems - 1 ? 'not-allowed' : 'pointer',
            fontSize: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 36,
            height: 36
          }}
        >
          ↓
        </button>
      </div>
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
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const userId = getStoredUserId();
      const storedName = typeof window !== 'undefined' ? localStorage.getItem('coffeeHouseName') : '';
      if (storedName) setName(storedName);
      
      if (!userId) {
        router.push('/');
        return;
      }
      const allCoffees = await getCoffees();
      setCoffees(allCoffees);
      const tastings = await getTastingsForUser(userId);
      const tastedIds = tastings.map(t => t.coffee_id);
      const tasted = allCoffees.filter(c => tastedIds.includes(c.id));
      setTastedCoffees(tasted);
      setRanked(tasted.map(c => c.id));
      setLoading(false);
    }
    fetchData();
  }, [router]);

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
    // Redirect to results page after a short delay
    setTimeout(() => {
      window.location.href = '/results';
    }, 1500);
  };

  if (!mounted || loading) {
    return (
      <>
        <Header />
        <div style={{ minHeight: '100vh', background: '#fffbe7', padding: '2rem', paddingTop: '5rem', fontFamily: 'sans-serif', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ fontSize: 18, color: '#6b4f1d' }}>Loading your tasted coffees...</div>
        </div>
      </>
    );
  }

  if (submitted) {
    return (
      <>
        <Header />
        <div style={{...pageStyle, paddingTop: '5rem'}}>
          <div style={{ 
            maxWidth: 480, 
            background: '#fff', 
            borderRadius: 16, 
            padding: 32, 
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <h1 style={{ color: '#6b4f1d', marginBottom: 16 }}>Thank you!</h1>
            <p style={{ color: '#6b4f1d', fontSize: 18, marginBottom: 32 }}>Your rankings have been submitted.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%' }}>
              <a href="/results" style={{ width: '100%' }}>
                <button style={buttonStyle}>View Results</button>
              </a>
              <a href="/" style={{ width: '100%' }}>
                <button style={{ ...buttonStyle, background: '#e0cba8', color: '#6b4f1d' }}>
                  Return to Homepage
                </button>
              </a>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div style={{...pageStyle, paddingTop: '5rem'}}>
        <div style={{ 
          width: '100%', 
          maxWidth: 700, 
          background: '#fff', 
          borderRadius: 16, 
          padding: 32, 
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          marginBottom: 24
        }}>
          <h1 style={{ color: '#6b4f1d', marginBottom: 24, textAlign: 'center' }}>Rank Your Coffee Favorites</h1>
          
          <div style={{ display: 'flex', alignItems: 'center', background: '#f7ecd7', padding: '12px 16px', borderRadius: 8, marginBottom: 24 }}>
            <span style={{ color: '#6b4f1d', fontWeight: 'bold', marginRight: 8 }}>Taster:</span> 
            <span style={{ color: '#6b4f1d' }}>{name}</span>
          </div>
          
          <div style={{ 
            background: '#fffbe7', 
            padding: '16px 20px', 
            borderRadius: 12, 
            marginBottom: 24,
            border: '1px solid #e0cba8'
          }}>
            <p style={{ color: '#6b4f1d', margin: 0 }}>
              <strong>Instructions:</strong> Use the up and down arrows to rank your coffees from most favorite (#1) to least favorite.
            </p>
          </div>
          
          <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 20 }}>
            {tastedCoffees.length === 0 ? (
              <div style={{ 
                padding: '24px', 
                background: '#f7ecd7', 
                borderRadius: 12, 
                textAlign: 'center',
                marginBottom: 16
              }}>
                <p style={{ color: '#b91c1c', fontWeight: 'bold', marginBottom: 8 }}>
                  You haven't tasted any coffees yet!
                </p>
                <p style={{ color: '#6b4f1d', margin: 0 }}>
                  Go to the Taste page to record your coffee tastings first.
                </p>
                <a href="/taste" style={{ display: 'block', marginTop: 20 }}>
                  <button type="button" style={{ 
                    background: '#6b4f1d', 
                    color: '#fff', 
                    border: 'none', 
                    padding: '12px 20px', 
                    borderRadius: 12, 
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}>
                    Taste Coffees
                  </button>
                </a>
              </div>
            ) : (
              <div style={{ flex: 1 }}>
                <h2 style={{ 
                  color: '#6b4f1d', 
                  textAlign: 'center', 
                  fontSize: 20, 
                  marginBottom: 16,
                  position: 'relative'
                }}>
                  Your Ranking
                  <div style={{ 
                    position: 'absolute', 
                    top: '50%', 
                    right: 0, 
                    transform: 'translateY(-50%)',
                    fontSize: 14,
                    background: '#f7ecd7',
                    padding: '4px 10px',
                    borderRadius: 20,
                    color: '#6b4f1d'
                  }}>
                    {ranked.length} coffees
                  </div>
                </h2>
                <div style={{ 
                  minHeight: 120, 
                  background: '#f7ecd7', 
                  borderRadius: 12, 
                  padding: 16
                }}>
                  {ranked.map((id, idx) => {
                    const coffee = tastedCoffees.find(c => c.id === id);
                    return coffee ? (
                      <RankedCoffee 
                        key={id} 
                        coffee={coffee} 
                        index={idx} 
                        moveCoffee={moveCoffee}
                        totalItems={ranked.length}
                      />
                    ) : null;
                  })}
                  
                  {ranked.length === 0 && (
                    <div style={{ 
                      padding: 24, 
                      textAlign: 'center', 
                      color: '#b91c1c' 
                    }}>
                      No coffees to rank yet
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {errorMsg && (
              <div style={{ 
                color: '#b91c1c', 
                background: '#fee', 
                padding: '12px 16px', 
                borderRadius: 8, 
                textAlign: 'center',
                fontWeight: 'bold' 
              }}>
                {errorMsg}
              </div>
            )}
            
            {successMsg && (
              <div style={{ 
                color: 'green', 
                background: '#efe', 
                padding: '12px 16px', 
                borderRadius: 8, 
                textAlign: 'center',
                fontWeight: 'bold'
              }}>
                {successMsg}
              </div>
            )}
            
            <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
              <button 
                type="submit" 
                style={buttonStyle} 
                disabled={ranked.length === 0}
              >
                Submit Rankings
              </button>
              
              <a href="/" style={{ flex: 1 }}>
                <button 
                  type="button" 
                  style={{ 
                    ...buttonStyle, 
                    background: '#e0cba8', 
                    color: '#6b4f1d',
                    width: '100%'
                  }}
                >
                  Return Home
                </button>
              </a>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

const pageStyle = {
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'center',
  fontFamily: 'sans-serif',
  background: '#fffbe7',
  padding: '2rem'
};

const buttonStyle = {
  flex: 2,
  padding: '16px',
  fontSize: '16px',
  background: '#6b4f1d',
  color: '#fffbe7',
  border: 'none',
  borderRadius: '12px',
  fontWeight: 'bold',
  cursor: 'pointer',
  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
  transition: 'all 0.2s ease',
  opacity: 1,
  ':disabled': {
    opacity: 0.7,
    cursor: 'not-allowed'
  }
};