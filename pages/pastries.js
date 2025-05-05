import { useState, useEffect } from 'react';
import Header from './Header';
import { useRouter } from 'next/router';
import { getPastries, submitPastryFeedback } from '../lib/dataSupabase';
import { getStoredUserId } from '../lib/user';

export default function PastriesPage() {
  const [pastryOptions, setPastryOptions] = useState([]);
  const [selectedPastry, setSelectedPastry] = useState(null);
  const [rated, setRated] = useState([]);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const data = await getPastries();
        if (data && data.length > 0) {
          setPastryOptions(data);
        } else {
          // Fallback data if no pastries in database yet
          setPastryOptions([
            { id: 1, name: 'Chocolate Croissant', image: '🥐', description: 'Buttery, flaky, and filled with chocolate. What\'s not to love?' },
            { id: 2, name: 'Cinnamon Roll', image: '🧁', description: 'Warm, gooey, and guaranteed to make the coffee shop smell amazing.' },
            { id: 3, name: 'Blueberry Muffin', image: '🫐', description: 'The perfect balance of sweet and tart. And yes, it counts as breakfast.' },
            { id: 4, name: 'Apple Turnover', image: '🥮', description: 'Like apple pie, but socially acceptable to eat with your hands.' },
            { id: 5, name: 'Raspberry Danish', image: '🍰', description: 'Cream cheese and raspberries in perfect harmony.' },
            { id: 6, name: 'Almond Biscotti', image: '🍪', description: 'Hard enough to dunk in coffee, delicious enough to eat on its own.' },
            { id: 7, name: 'Lemon Poppy Seed Scone', image: '🍋', description: 'Might make you fail a drug test, but worth the risk.' },
          ]);
        }
      } catch (err) {
        console.error("Error fetching pastries:", err);
        setError("Failed to load pastries. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handlePastrySelect = (pastry) => {
    setSelectedPastry(pastry);
  };

  const handleRate = () => {
    if (!selectedPastry) return;
    
    // No need to save to database, just update local state
    setRated([...rated, { ...selectedPastry, rating: 5 }]);
    setSelectedPastry(null);
    
    // Show completion message after rating 3 pastries
    if (rated.length === 2) {
      setTimeout(() => {
        setSubmitted(true);
      }, 500);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // If user entered comment, save it to pastry_feedback table
    if (comment.trim()) {
      try {
        const userId = getStoredUserId();
        // Get user name from localStorage, fallback to 'Anonymous' if not found
        const userName = typeof window !== 'undefined' ? 
          (localStorage.getItem('coffeeHouseName') || localStorage.getItem('userName') || 'Anonymous') : 
          'Anonymous';
        
        console.log('Submitting feedback:', { userId, userName, feedback: comment.trim() });
        
        await submitPastryFeedback({
          userId: userId || '00000000-0000-0000-0000-000000000000', // Provide fallback UUID if null
          userName: userName,
          feedback: comment.trim()
        });
        
        console.log('Feedback submitted successfully');
      } catch (err) {
        console.error("Error submitting feedback:", err);
        // Continue anyway for better user experience
      }
    }
    
    router.push('/');
  };

  if (loading) {
    return (
      <>
        <Header />
        <div style={{ minHeight: '100vh', background: '#fffbe7', padding: '2rem', paddingTop: '5rem', fontFamily: 'sans-serif', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <p>Loading pastries...</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div style={{ minHeight: '100vh', background: '#fffbe7', padding: '2rem', paddingTop: '5rem', fontFamily: 'sans-serif', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <p style={{ color: '#b91c1c' }}>{error}</p>
        </div>
      </>
    );
  }

  if (submitted) {
    return (
      <>
        <Header />
        <div style={{ minHeight: '100vh', background: '#fffbe7', padding: '2rem', paddingTop: '5rem', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h1 style={{ color: '#6b4f1d', marginBottom: 24, textAlign: 'center' }}>Pastry Evaluation Complete!</h1>
          
          <div style={{ maxWidth: 600, background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', marginBottom: 32 }}>
            <h2 style={{ color: '#6b4f1d', fontSize: 24, marginBottom: 16 }}>Congratulations!</h2>
            <p style={{ fontSize: 18, lineHeight: 1.6, color: '#6b4f1d', marginBottom: 16 }}>
              You've discovered the truth: <strong>all pastries are 5-star worthy</strong> when paired with great coffee!
            </p>
            <p style={{ fontSize: 18, lineHeight: 1.6, color: '#6b4f1d', marginBottom: 16 }}>
              This is why we focus on coffee instead. Pastries never disappoint, but coffee... coffee needs your expert opinion!
            </p>
            
            <div style={{ background: '#f7ecd7', padding: 16, borderRadius: 8, marginTop: 24 }}>
              <p style={{ fontStyle: 'italic', color: '#b91c1c' }}>
                "Life is too short for bad coffee and mediocre pastries."
              </p>
            </div>
            
            <form onSubmit={handleSubmit} style={{ marginTop: 32 }}>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', marginBottom: 8, color: '#6b4f1d', fontWeight: 'bold' }}>
                  Any feedback for our pastry chef? (Optional)
                </label>
                <textarea 
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  style={{ 
                    width: '100%', 
                    padding: 12, 
                    borderRadius: 8, 
                    border: '1px solid #e0cba8',
                    backgroundColor: '#fffbe7', 
                    color: '#6b4f1d',
                    minHeight: 100,
                    fontSize: 16,
                    boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)'
                  }}
                  placeholder="They're all amazing! But if I had to choose..."
                />
              </div>
              
              <button 
                type="submit"
                style={{ 
                  width: '100%', 
                  padding: '1rem', 
                  background: '#6b4f1d', 
                  color: '#fffbe7', 
                  border: 'none', 
                  borderRadius: 8, 
                  fontWeight: 'bold', 
                  fontSize: '1rem',
                  cursor: 'pointer'
                }}
              >
                Return to Coffee (The Real Star)
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
      <div style={{ minHeight: '100vh', background: '#fffbe7', padding: '2rem', paddingTop: '5rem', fontFamily: 'sans-serif' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <h1 style={{ color: '#6b4f1d', marginBottom: 24, textAlign: 'center' }}>Pastry Rating</h1>
          <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', marginBottom: 32 }}>
            <h2 style={{ color: '#b91c1c', fontSize: 20, marginBottom: 16 }}>🍰 Pastry Perfection! 🥐</h2>
            <p style={{ fontSize: 16, lineHeight: 1.6, color: '#6b4f1d', marginBottom: 16 }}>
              While we're known for our coffee, our pastries deserve some love too. 
              Please help us rate them on a scale of... actually, we only accept 5-star ratings for our pastries.
            </p>
            <p style={{ fontSize: 16, fontStyle: 'italic', color: '#b91c1c' }}>
              Because let's be honest, all pastries are amazing.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 24 }}>
            <div style={{ flex: 2 }}>
              <h2 style={{ color: '#6b4f1d', marginBottom: 16 }}>Select a Pastry</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {pastryOptions.filter(p => !rated.some(r => r.id === p.id)).map(pastry => (
                  <div 
                    key={pastry.id} 
                    onClick={() => handlePastrySelect(pastry)}
                    style={{ 
                      padding: 16, 
                      background: selectedPastry?.id === pastry.id ? '#f7ecd7' : '#fff', 
                      borderRadius: 8,
                      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                      cursor: 'pointer',
                      border: selectedPastry?.id === pastry.id ? '2px solid #6b4f1d' : '1px solid #e0cba8',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12
                    }}
                  >
                    <span style={{ fontSize: 32 }}>{pastry.image}</span>
                    <div>
                      <div style={{ fontWeight: 'bold', color: '#6b4f1d' }}>{pastry.name}</div>
                      <div style={{ fontSize: 14, color: '#6b4f1d' }}>{pastry.description}</div>
                    </div>
                  </div>
                ))}
                
                {pastryOptions.filter(p => !rated.some(r => r.id === p.id)).length === 0 && (
                  <div style={{ padding: 24, background: '#f7ecd7', borderRadius: 8, textAlign: 'center' }}>
                    <p style={{ color: '#b91c1c', fontWeight: 'bold' }}>You've rated all our pastries! What a connoisseur!</p>
                  </div>
                )}
              </div>
            </div>

            <div style={{ flex: 1 }}>
              <h2 style={{ color: '#6b4f1d', marginBottom: 16 }}>Your Rating</h2>
              {selectedPastry ? (
                <div style={{ background: '#fff', padding: 16, borderRadius: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ fontSize: 32, marginRight: 12 }}>{selectedPastry.image}</span>
                    <div style={{ fontWeight: 'bold', color: '#6b4f1d' }}>{selectedPastry.name}</div>
                  </div>
                  
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ color: '#6b4f1d', marginBottom: 8 }}>Rating:</div>
                    <div style={{ fontSize: 24, color: '#b91c1c' }}>★★★★★</div>
                    <div style={{ fontSize: 14, fontStyle: 'italic', color: '#6b4f1d', marginTop: 4 }}>
                      (We only accept 5-star ratings for our incredible pastries)
                    </div>
                  </div>
                  
                  <button 
                    onClick={handleRate}
                    style={{ 
                      width: '100%', 
                      padding: '0.8rem', 
                      background: '#6b4f1d', 
                      color: '#fffbe7', 
                      border: 'none', 
                      borderRadius: 8, 
                      fontWeight: 'bold', 
                      cursor: 'pointer'
                    }}
                  >
                    Submit Perfect Rating
                  </button>
                </div>
              ) : (
                <div style={{ background: '#fff', padding: 16, borderRadius: 8, color: '#6b4f1d', textAlign: 'center' }}>
                  Select a pastry to rate
                </div>
              )}
              
              {rated.length > 0 && (
                <div style={{ marginTop: 24 }}>
                  <h3 style={{ color: '#6b4f1d', marginBottom: 12 }}>Your Ratings</h3>
                  <div style={{ background: '#fff', padding: 16, borderRadius: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                    {rated.map((item) => (
                      <div key={item.id} style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        marginBottom: 12,
                        padding: '8px',
                        borderBottom: item.id !== rated[rated.length-1].id ? '1px solid #f7ecd7' : 'none'
                      }}>
                        <span style={{ fontSize: 24, marginRight: 12 }}>{item.image}</span>
                        <div style={{ flex: 1, fontWeight: 'bold', color: '#6b4f1d' }}>{item.name}</div>
                        <div style={{ color: '#b91c1c', fontSize: 18 }}>★★★★★</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 