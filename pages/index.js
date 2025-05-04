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
    const storedName = typeof window !== 'undefined' ? localStorage.getItem('brewHahaName') : '';
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
      const recStr = localStorage.getItem('brewHahaRecommendation');
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
      localStorage.setItem('brewHahaName', name.trim());
      let user = null;
      let attempts = 0;
      while (!user && attempts < 3) {
        user = await getOrCreateUser(name.trim());
        if (!user) {
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
    localStorage.removeItem('brewHahaName');
    localStorage.removeItem('brewHahaUserId');
    localStorage.removeItem('brewHahaRecommendation');
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
    return <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>;
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
          <h1 style={{ fontSize: '2.2rem', marginBottom: '1rem', textAlign: 'center', color: '#6b4f1d' }}>
            Welcome to Brew Haha!
          </h1>
          <p style={{ fontSize: '1.1rem', marginBottom: '2.5rem', textAlign: 'center', color: '#6b4f1d' }}>
            Let's get started by getting to know you.
          </p>
          <form onSubmit={handleNameSubmit} style={{ width: '100%', maxWidth: 400 }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
              <span style={{ color: '#6b4f1d', fontWeight: 'bold' }}>What's your name?</span>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Enter your name"
                style={{
                  padding: '0.8rem',
                  border: '1px solid #6b4f1d',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  color: '#6b4f1d',
                  background: '#fffbe7'
                }}
                required
              />
            </label>
            {errorMsg && (
              <div style={{ color: 'red', marginBottom: 16, textAlign: 'center' }}>{errorMsg}</div>
            )}
            <button type="submit" style={buttonStyle} disabled={submitting}>
              {submitting ? 'Loading...' : 'Continue'}
            </button>
          </form>
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
        justifyContent: 'center',
        alignItems: 'center',
        background: '#fffbe7',
        fontFamily: 'sans-serif',
        position: 'relative',
        padding: '2rem',
        paddingTop: '5rem',
      }}>
        <h1 style={{ fontSize: '2.2rem', marginBottom: '1rem', textAlign: 'center', color: '#6b4f1d' }}>
          Welcome to Brew Haha, {name}!
        </h1>
        <p style={{ fontSize: '1.1rem', marginBottom: '2.5rem', textAlign: 'center', color: '#6b4f1d' }}>
          You're about to taste 5 mysterious brown liquids.<br />
          We'll help you pick, sip, and rate your faves.
        </p>
        <div style={{ width: '100%', maxWidth: 400, display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '1rem',
            background: '#e0cba8',
            padding: '1.5rem',
            borderRadius: '12px',
            marginBottom: '1.5rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <h2 style={{ color: '#6b4f1d', margin: 0 }}>Your Progress</h2>
              <button 
                onClick={handleReset}
                style={{
                  background: '#fffbe7',
                  color: '#6b4f1d',
                  border: '1px solid #6b4f1d',
                  borderRadius: '4px',
                  padding: '0.5rem 1rem',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Start Over
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: '#6b4f1d', fontWeight: 'bold' }}>1.</span>
                <span style={{ color: '#6b4f1d', flex: 1 }}>Choose Your Coffee</span>
                {recommendation && (
                  <span style={{ color: '#6b4f1d', fontWeight: 'bold', fontSize: '0.95em', marginLeft: 6 }}>
                    {recommendation.name}
                  </span>
                )}
                {progress.choose && <span style={{ fontSize: '1.2rem' }}>✅</span>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: '#6b4f1d', fontWeight: 'bold' }}>2.</span>
                <span style={{ color: '#6b4f1d', flex: 1 }}>
                  Taste ({progress.taste.count}/{progress.taste.total} coffees)
                </span>
                {progress.taste.count === progress.taste.total && <span style={{ fontSize: '1.2rem' }}>✅</span>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: '#6b4f1d', fontWeight: 'bold' }}>3.</span>
                <span style={{ color: '#6b4f1d', flex: 1 }}>Review</span>
                {progress.review && <span style={{ fontSize: '1.2rem' }}>✅</span>}
              </div>
            </div>
          </div>

          <Link href={progress.choose ? "/taste" : "/choose"}>
            <button style={{
              ...buttonStyle,
              opacity: progress.choose ? 0.7 : 1,
              cursor: 'pointer'
            }}>
              Choose Your Coffee
            </button>
          </Link>

          <Link href="/taste">
            <button style={{
              ...buttonStyle,
              opacity: !progress.choose ? 0.7 : (progress.taste.count === progress.taste.total ? 0.7 : 1),
              cursor: 'pointer'
            }}>
              Taste
            </button>
          </Link>

          <Link href="/review">
            <button style={{
              ...buttonStyle,
              opacity: !progress.choose ? 0.7 : (progress.review ? 0.7 : 1),
              cursor: 'pointer'
            }}>
              Review
            </button>
          </Link>
        </div>
        <Link href="/admin">
          <button style={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            background: '#e0cba8',
            color: '#6b4f1d',
            border: 'none',
            borderRadius: '50%',
            width: 44,
            height: 44,
            fontSize: 18,
            boxShadow: '0 2px 8px #0001',
            cursor: 'pointer'
          }}>
            🔑
          </button>
        </Link>
      </div>
    </>
  );
}

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
  transition: 'background 0.2s'
};