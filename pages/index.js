import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from './Header';
import { getOrCreateUser, getStoredUserId } from '../lib/user';
import { getCoffees, getTastingsForUser, getReviewsForUser } from '../lib/dataSupabase';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default function Home() {
  const [name, setName] = useState('');
  const [nameSet, setNameSet] = useState(false);
  const [progress, setProgress] = useState({
    choose: false,
    taste: { count: 0, total: 5 },
    review: false
  });
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const storedId = getStoredUserId();
    const storedName = typeof window !== 'undefined' ? localStorage.getItem('coffeeHouseName') : '';
    if (storedId && storedName) {
      setName(storedName);
      setNameSet(true);
      fetchProgress(storedId);
    } else {
      setLoading(false);
    }
  }, []);

  async function fetchProgress(userId) {
    setLoading(true);
    const tastings = await getTastingsForUser(userId);
    const reviews = await getReviewsForUser(userId);
    // Count unique coffees tasted
    const uniqueCoffeesTasted = new Set((tastings || []).map(t => t.coffee_id)).size;
    // Recommendation: get from localStorage for now (could be stored in user profile in future)
    let rec = null;
    if (typeof window !== 'undefined') {
      const recStr = localStorage.getItem('coffeeHouseRecommendation');
      if (recStr) {
        try {
          rec = JSON.parse(recStr);
        } catch {}
      }
    }
    setRecommendation(rec);
    setProgress({
      choose: !!rec,
      taste: {
        count: uniqueCoffeesTasted,
        total: 5
      },
      review: (reviews || []).length > 0
    });
    setLoading(false);
  }

  const handleNameSubmit = async (e) => {
    e.preventDefault();
    if (name.trim()) {
      setSubmitting(true);
      setErrorMsg('');
      localStorage.setItem('coffeeHouseName', name.trim());
      let user = null;
      let attempts = 0;
      while (!user && attempts < 3) {
        user = await getOrCreateUser(name.trim());
        if (!user) {
          if (attempts === 0) {
            setErrorMsg('This name is already taken. Please choose another one.');
            setSubmitting(false);
            return;
          }
          await sleep(500); // wait 500ms before retry
        }
        attempts++;
      }
      setSubmitting(false);
      if (!user) {
        setErrorMsg('Could not create or fetch user after several tries. Please check your connection and try again.');
        return;
      }
      setNameSet(true);
      fetchProgress(user.id);
    }
  };

  const handleReset = async () => {
    // Remove user id and name from localStorage
    localStorage.removeItem('coffeeHouseName');
    localStorage.removeItem('coffeeHouseUserId');
    localStorage.removeItem('coffeeHouseRecommendation');
    setName('');
    setNameSet(false);
    setProgress({
      choose: false,
      taste: { count: 0, total: 5 },
      review: false
    });
    setRecommendation(null);
  };

  if (loading) {
    return (
      <>
        <Header />
        <div style={{ minHeight: '100vh', background: '#fffbe7', padding: '2rem', paddingTop: '5rem', fontFamily: 'sans-serif', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ fontSize: 18, color: '#6b4f1d' }}>Loading your coffee journey...</div>
        </div>
      </>
    );
  }

  if (!nameSet) {
    return (
      <>
        <Header />
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: '#fffbe7',
          fontFamily: 'sans-serif',
          position: 'relative',
          padding: '2rem',
          paddingTop: '5rem',
        }}>
          <div style={{ 
            maxWidth: 480, 
            background: '#fff', 
            borderRadius: 16, 
            padding: 32, 
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            width: '100%'
          }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '1.5rem', textAlign: 'center', color: '#6b4f1d' }}>
              Welcome to Coffee House!
            </h1>
            <p style={{ fontSize: '1.1rem', marginBottom: '2rem', textAlign: 'center', color: '#6b4f1d' }}>
              Let's get started by getting to know you.
            </p>
            <form onSubmit={handleNameSubmit} style={{ width: '100%' }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
                <span style={{ color: '#6b4f1d', fontWeight: 'bold' }}>What's your name?</span>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Enter your name"
                  style={{
                    padding: '1rem',
                    border: '1px solid #e0cba8',
                    borderRadius: '0.8rem',
                    fontSize: '1rem',
                    color: '#6b4f1d',
                    background: '#fffbe7',
                    boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)'
                  }}
                  required
                />
              </label>
              {errorMsg && (
                <div style={{ 
                  color: '#b91c1c', 
                  background: '#fee', 
                  padding: '12px 16px', 
                  borderRadius: 8, 
                  textAlign: 'center',
                  marginBottom: 16,
                  fontWeight: 'bold'
                }}>
                  {errorMsg}
                </div>
              )}
              <button type="submit" style={buttonStyle} disabled={submitting}>
                {submitting ? 'Loading...' : 'Continue'}
              </button>
            </form>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: '#fffbe7',
        fontFamily: 'sans-serif',
        position: 'relative',
        padding: '2rem',
        paddingTop: '5rem',
      }}>
        <div style={{ 
          maxWidth: 600, 
          width: '100%',
          background: '#fff', 
          borderRadius: 16, 
          padding: 32, 
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          marginBottom: 32
        }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem', textAlign: 'center', color: '#6b4f1d' }}>
            Welcome to Coffee House, {name}!
          </h1>
          <p style={{ fontSize: '1.1rem', marginBottom: '2rem', textAlign: 'center', color: '#6b4f1d', lineHeight: 1.6 }}>
            You're about to taste 5 mysterious brown liquids.<br />
            We'll help you pick, sip, and rate your faves.
          </p>
        
          <div style={{ 
            background: '#f7ecd7',
            borderRadius: '12px',
            marginBottom: '2rem',
            overflow: 'hidden'
          }}>
            <div style={{ 
              background: '#e0cba8', 
              padding: '16px 24px', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center'
            }}>
              <h2 style={{ color: '#6b4f1d', margin: 0, fontSize: 20 }}>Your Progress</h2>
              <button 
                onClick={handleReset}
                style={{
                  background: '#fffbe7',
                  color: '#6b4f1d',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 14px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}
              >
                Start Over
              </button>
            </div>
            
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.8rem',
                background: progress.choose ? '#ddf4e4' : '#fff',
                borderRadius: 8,
                padding: '12px 16px',
                border: `1px solid ${progress.choose ? '#15803d' : '#e0cba8'}`
              }}>
                <div style={{ 
                  width: 28, 
                  height: 28, 
                  borderRadius: '50%', 
                  background: progress.choose ? '#15803d' : '#6b4f1d', 
                  color: '#fff', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontSize: 14,
                  fontWeight: 'bold'
                }}>1</div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#6b4f1d', fontWeight: 'bold' }}>Choose Your Coffee</div>
                  {recommendation && (
                    <div style={{ color: '#6b4f1d', fontSize: '0.9em', marginTop: 2 }}>
                      Selected: <span style={{ fontWeight: 'bold' }}>{recommendation.name}</span>
                    </div>
                  )}
                </div>
                {progress.choose && <div style={{ fontSize: '1.2rem', color: '#15803d' }}>✓</div>}
              </div>
              
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.8rem',
                background: progress.taste.count === progress.taste.total ? '#ddf4e4' : '#fff',
                borderRadius: 8,
                padding: '12px 16px',
                border: `1px solid ${progress.taste.count === progress.taste.total ? '#15803d' : '#e0cba8'}`
              }}>
                <div style={{ 
                  width: 28, 
                  height: 28, 
                  borderRadius: '50%', 
                  background: progress.taste.count === progress.taste.total ? '#15803d' : '#6b4f1d', 
                  color: '#fff', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontSize: 14,
                  fontWeight: 'bold'
                }}>2</div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#6b4f1d', fontWeight: 'bold' }}>Taste Coffees</div>
                  <div style={{ color: '#6b4f1d', fontSize: '0.9em', marginTop: 2 }}>
                    Progress: <span style={{ fontWeight: 'bold' }}>{progress.taste.count}/{progress.taste.total}</span>
                  </div>
                </div>
                {progress.taste.count === progress.taste.total && <div style={{ fontSize: '1.2rem', color: '#15803d' }}>✓</div>}
              </div>
              
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.8rem',
                background: progress.review ? '#ddf4e4' : '#fff',
                borderRadius: 8,
                padding: '12px 16px',
                border: `1px solid ${progress.review ? '#15803d' : '#e0cba8'}`
              }}>
                <div style={{ 
                  width: 28, 
                  height: 28, 
                  borderRadius: '50%', 
                  background: progress.review ? '#15803d' : '#6b4f1d', 
                  color: '#fff', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontSize: 14,
                  fontWeight: 'bold'
                }}>3</div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#6b4f1d', fontWeight: 'bold' }}>Review & Rank</div>
                  <div style={{ color: '#6b4f1d', fontSize: '0.9em', marginTop: 2 }}>
                    Status: <span style={{ fontWeight: 'bold' }}>{progress.review ? 'Completed' : 'Not Started'}</span>
                  </div>
                </div>
                {progress.review && <div style={{ fontSize: '1.2rem', color: '#15803d' }}>✓</div>}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Link href={progress.choose ? "/taste" : "/choose"}>
              <button style={{
                ...buttonStyle,
                background: progress.choose ? '#15803d' : '#6b4f1d',
                marginBottom: 4
              }}>
                {progress.choose ? 'Continue to Tasting' : 'Choose Your Coffee'}
              </button>
            </Link>
            
            <Link href="/taste">
              <button style={{
                ...buttonStyle,
                background: progress.taste.count > 0 ? '#15803d' : '#6b4f1d',
                opacity: !progress.choose ? 0.7 : 1,
                cursor: progress.choose ? 'pointer' : 'not-allowed',
                marginBottom: 4
              }} disabled={!progress.choose}>
                {progress.taste.count > 0 ? 'Continue Tasting' : 'Taste Coffees'}
              </button>
            </Link>
            
            <Link href="/review">
              <button style={{
                ...buttonStyle,
                background: progress.taste.count === progress.taste.total ? '#15803d' : '#6b4f1d',
                opacity: progress.taste.count < 1 ? 0.7 : 1,
                cursor: progress.taste.count >= 1 ? 'pointer' : 'not-allowed',
                marginBottom: 4
              }} disabled={progress.taste.count < 1}>
                {progress.review ? 'Review Your Rankings' : 'Rank Your Favorites'}
              </button>
            </Link>
            
            {progress.review && (
              <Link href="/results">
                <button style={{
                  ...buttonStyle,
                  background: '#b91c1c',
                }}>
                  View Your Results
                </button>
              </Link>
            )}
          </div>
        </div>
        
        <Link href="/pastries">
          <button style={{ 
            background: '#fff', 
            border: '2px dashed #e0cba8', 
            borderRadius: 12, 
            padding: '12px 24px', 
            color: '#b91c1c', 
            fontSize: 16, 
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
          }}>
            <span style={{ fontSize: 20 }}>🍰</span>
            Check Out Our Pastries
          </button>
        </Link>
      </div>
    </>
  );
}

const buttonStyle = {
  width: '100%',
  padding: '16px',
  fontSize: '16px',
  background: '#6b4f1d',
  color: '#fffbe7',
  border: 'none',
  borderRadius: '12px',
  fontWeight: 'bold',
  cursor: 'pointer',
  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
  transition: 'all 0.2s ease'
};