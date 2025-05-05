import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from './Header';
import { getOrCreateUser, getStoredUserId } from '../lib/user';
import { getCoffees, getTastingsForUser, getReviewsForUser } from '../lib/dataSupabase';
import { useTheme } from '../lib/themeContext';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default function Home() {
  const { theme, isMomMode, toggleMomMode } = useTheme();
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
  const [showMomModal, setShowMomModal] = useState(false);
  const [momModeSelected, setMomModeSelected] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

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
      
      // Show mom mode interstitial instead of immediately logging in
      setShowMomModal(true);
      setSubmitting(false);
    }
  };
  
  const handleMomModeSelection = async (isMom) => {
    setMomModeSelected(true);
    
    if (isMom) {
      toggleMomMode(true);
      setShowCelebration(true);
      
      // Hide celebration after 2.5 seconds
      setTimeout(() => {
        finishSignup();
      }, 2500);
    } else {
      toggleMomMode(false);
      finishSignup();
    }
  };
  
  const finishSignup = async () => {
    setSubmitting(true);
    
    localStorage.setItem('coffeeHouseName', name.trim());
    
    // Store mom mode preference along with the name
    if (typeof window !== 'undefined') {
      localStorage.setItem('coffeeHouseIsMomMode', isMomMode.toString());
    }
    
    let user = null;
    let attempts = 0;
    while (!user && attempts < 3) {
      user = await getOrCreateUser(name.trim());
      if (!user) {
        if (attempts === 0) {
          setErrorMsg('This name is already taken. Please choose another one.');
          setSubmitting(false);
          setShowMomModal(false);
          return;
        }
        await sleep(500); // wait 500ms before retry
      }
      attempts++;
    }
    
    if (!user) {
      setErrorMsg('Could not create or fetch user after several tries. Please check your connection and try again.');
      setShowMomModal(false);
      setSubmitting(false);
      return;
    }
    
    setNameSet(true);
    setShowMomModal(false);
    fetchProgress(user.id);
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
        <div style={{ 
          minHeight: '100vh', 
          background: theme.background, 
          padding: '2rem', 
          paddingTop: '5rem', 
          fontFamily: theme.fonts, 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center' 
        }}>
          <div style={{ fontSize: 18, color: theme.primary }}>Loading your coffee journey...</div>
        </div>
      </>
    );
  }

  // Mom Mode Interstitial Modal
  if (showMomModal) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: showCelebration ? '#fff2f9' : theme.background,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1100,
        fontFamily: theme.fonts,
        transition: 'background-color 0.5s ease'
      }}>
        {showCelebration ? (
          <div style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center'
          }}>
            <h1 style={{ 
              fontSize: '2.5rem', 
              color: '#d23f85',
              marginBottom: '1rem',
              animation: 'bounce 1s infinite alternate',
              textShadow: '0 2px 10px rgba(214,129,179,0.3)'
            }}>
              Happy Mother's Day! 🌸
            </h1>
            <div style={{
              fontSize: '4rem',
              lineHeight: 1.5,
              animation: 'fadeIn 2s'
            }}>
              🌸 🌷 🌹 💐 🌺 🌻 🌼 🌸 🌷 🌹
            </div>
            <p style={{ 
              fontSize: '1.5rem', 
              color: '#8a3f8f',
              marginTop: '1rem',
              maxWidth: '600px',
              animation: 'fadeIn 1s'
            }}>
              We're celebrating all the amazing moms today!
            </p>
            
            {/* Flower confetti */}
            {Array(20).fill().map((_, i) => (
              <div key={i} style={{
                position: 'absolute',
                fontSize: '2rem',
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animation: `fall ${2 + Math.random() * 3}s linear ${Math.random() * 2}s infinite`,
                opacity: 0.7
              }}>
                {['🌸', '🌷', '🌹', '💐', '🌺'][Math.floor(Math.random() * 5)]}
              </div>
            ))}
            
            <style jsx global>{`
              @keyframes fall {
                0% { transform: translateY(-100px) rotate(0deg); }
                100% { transform: translateY(calc(100vh + 100px)) rotate(360deg); }
              }
              @keyframes bounce {
                0% { transform: translateY(0); }
                100% { transform: translateY(-20px); }
              }
              @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
              }
            `}</style>
          </div>
        ) : (
          <div style={{ 
            background: 'white', 
            borderRadius: 16, 
            padding: 32, 
            maxWidth: 480,
            width: '90%',
            boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
            textAlign: 'center'
          }}>
            <h2 style={{ 
              fontSize: '1.8rem', 
              color: '#d23f85', 
              marginBottom: '1.5rem'
            }}>
              One special question...
            </h2>
            
            <p style={{ fontSize: '1.2rem', color: '#6b4f1d', marginBottom: '2rem' }}>
              Are you a mom being celebrated today?
            </p>
            
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
              <button 
                onClick={() => handleMomModeSelection(true)}
                style={{
                  padding: '14px 28px',
                  background: '#d23f85',
                  color: 'white',
                  border: 'none',
                  borderRadius: 12,
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 4px 10px rgba(210,63,133,0.3)',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}
                disabled={momModeSelected}
              >
                <span>Yes, I am!</span> <span style={{ fontSize: '1.4rem' }}>🌸</span>
              </button>
              
              <button 
                onClick={() => handleMomModeSelection(false)}
                style={{
                  padding: '14px 28px',
                  background: '#f5f5f5',
                  color: '#6b4f1d',
                  border: 'none',
                  borderRadius: 12,
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                  transition: 'all 0.2s ease'
                }}
                disabled={momModeSelected}
              >
                Not today
              </button>
            </div>
            
            {momModeSelected && (
              <div style={{ 
                marginTop: 24, 
                color: '#8a3f8f',
                animation: 'fadeIn 0.5s'
              }}>
                Just a moment...
              </div>
            )}
          </div>
        )}
      </div>
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
          background: theme.background,
          fontFamily: theme.fonts,
          position: 'relative',
          padding: '2rem',
          paddingTop: '5rem',
        }}>
          <div style={{ 
            maxWidth: 480, 
            background: theme.cardBackground, 
            borderRadius: 16, 
            padding: 32, 
            boxShadow: theme.boxShadow,
            width: '100%'
          }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '1.5rem', textAlign: 'center', color: theme.primary }}>
              Welcome to Coffee House! {isMomMode ? '🌸' : '☕'}
            </h1>
            <p style={{ fontSize: '1.1rem', marginBottom: '2rem', textAlign: 'center', color: theme.primary }}>
              Let's get started by getting to know you.
            </p>
            <form onSubmit={handleNameSubmit} style={{ width: '100%' }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
                <span style={{ color: theme.primary, fontWeight: 'bold' }}>What's your name?</span>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Enter your name"
                  style={{
                    padding: '1rem',
                    border: `1px solid ${theme.accent}`,
                    borderRadius: '0.8rem',
                    fontSize: '1rem',
                    color: theme.primary,
                    background: theme.background,
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
              <button 
                type="submit" 
                style={{
                  ...buttonStyle,
                  background: theme.buttonBackground,
                  color: theme.buttonText
                }} 
                disabled={submitting}
              >
                {submitting ? 'Loading...' : 'Continue'}
              </button>
            </form>
          </div>
          
          {isMomMode && (
            <div style={{
              position: 'absolute',
              pointerEvents: 'none',
              width: '100%',
              height: '100%',
              top: 0,
              left: 0,
              background: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50"><text x="0" y="25" font-size="20">🌸</text></svg>') repeat`,
              opacity: 0.1,
              zIndex: 0
            }} />
          )}
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
        background: theme.background,
        fontFamily: theme.fonts,
        position: 'relative',
        padding: '2rem',
        paddingTop: '5rem',
      }}>
        <div style={{ 
          maxWidth: 600, 
          width: '100%',
          background: theme.cardBackground, 
          borderRadius: 16, 
          padding: 32, 
          boxShadow: theme.boxShadow,
          marginBottom: 32
        }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem', textAlign: 'center', color: theme.primary }}>
            Welcome to Coffee House, {name}! {isMomMode && <span>🌸</span>}
          </h1>
          <p style={{ fontSize: '1.1rem', marginBottom: '2rem', textAlign: 'center', color: theme.primary, lineHeight: 1.6 }}>
            Start your coffee journey by following the steps below.
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Progress Steps */}
            <div style={{ 
              background: theme.accentLight,
              borderRadius: '12px',
              marginBottom: '2rem',
              overflow: 'hidden'
            }}>
              <div style={{ 
                background: theme.accent, 
                padding: '16px 24px', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center'
              }}>
                <h2 style={{ color: theme.primary, margin: 0, fontSize: 20 }}>Your Progress</h2>
                <button 
                  onClick={handleReset}
                  style={{
                    background: theme.background,
                    color: theme.primary,
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
                  border: `1px solid ${progress.choose ? '#15803d' : theme.accent}`
                }}>
                  <div style={{ 
                    width: 28, 
                    height: 28, 
                    borderRadius: '50%', 
                    background: progress.choose ? '#15803d' : theme.primary, 
                    color: '#fff', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontSize: 14,
                    fontWeight: 'bold'
                  }}>1</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: theme.primary, fontWeight: 'bold' }}>Choose Your Coffee</div>
                    {recommendation && (
                      <div style={{ color: theme.primary, fontSize: '0.9em', marginTop: 2 }}>
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
                  border: `1px solid ${progress.taste.count === progress.taste.total ? '#15803d' : theme.accent}`
                }}>
                  <div style={{ 
                    width: 28, 
                    height: 28, 
                    borderRadius: '50%', 
                    background: progress.taste.count === progress.taste.total ? '#15803d' : theme.primary, 
                    color: '#fff', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontSize: 14,
                    fontWeight: 'bold'
                  }}>2</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: theme.primary, fontWeight: 'bold' }}>Taste Coffees</div>
                    <div style={{ color: theme.primary, fontSize: '0.9em', marginTop: 2 }}>
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
                  border: `1px solid ${progress.review ? '#15803d' : theme.accent}`
                }}>
                  <div style={{ 
                    width: 28, 
                    height: 28, 
                    borderRadius: '50%', 
                    background: progress.review ? '#15803d' : theme.primary, 
                    color: '#fff', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontSize: 14,
                    fontWeight: 'bold'
                  }}>3</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: theme.primary, fontWeight: 'bold' }}>Review & Rank</div>
                    <div style={{ color: theme.primary, fontSize: '0.9em', marginTop: 2 }}>
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
                  background: progress.choose ? '#15803d' : theme.buttonBackground,
                  marginBottom: 4
                }}>
                  {progress.choose ? `Recommendation: ${recommendation?.name || ''}` : 'Choose Your Coffee'}
                </button>
              </Link>
              
              <Link href="/taste">
                <button style={{
                  ...buttonStyle,
                  background: progress.taste.count > 0 ? '#15803d' : theme.buttonBackground,
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
                  background: progress.taste.count === progress.taste.total ? '#15803d' : theme.buttonBackground,
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
                    background: theme.secondary,
                  }}>
                    View Your Results
                  </button>
                </Link>
              )}
            </div>
          </div>
        </div>
        
        <Link href="/pastries">
          <button style={{ 
            background: theme.cardBackground, 
            border: `2px dashed ${theme.accent}`, 
            borderRadius: 12, 
            padding: '12px 24px', 
            color: theme.secondary, 
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
      
      {isMomMode && (
        <div style={{
          position: 'fixed',
          pointerEvents: 'none',
          width: '100%',
          height: '100%',
          top: 0,
          left: 0,
          background: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50"><text x="0" y="25" font-size="20">🌸</text></svg>') repeat`,
          opacity: 0.1,
          zIndex: 0
        }} />
      )}
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