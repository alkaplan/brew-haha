import { useState, useEffect } from 'react';
import { getCoffees } from '../lib/dataSupabase';
import { getOrCreateUser, getStoredUserId } from '../lib/user';
import Header from './Header';

const questions = [
  {
    prompt: 'Welcome to Coffee House! What style coffee would you like?',
    options: [
      { label: 'Smooth', value: 'smooth' },
      { label: 'Fruity', value: 'fruity' },
      { label: 'Intense', value: 'intense' },
      { label: 'Crazy', value: 'crazy' }
    ]
  },
  {
    prompt: 'Pick a coffee shop vibe:',
    options: [
      { label: 'Cozy & Quiet', value: 'cozy' },
      { label: 'Artsy & Funky', value: 'artsy' },
      { label: 'Bustling & Social', value: 'bustling' },
      { label: 'Minimal & Modern', value: 'minimal' }
    ]
  },
  {
    prompt: "What's your ideal coffee companion?",
    options: [
      { label: 'A good book', value: 'book' },
      { label: 'Friends', value: 'friends' },
      { label: 'My thoughts', value: 'thoughts' },
      { label: 'Something sweet', value: 'sweet' }
    ]
  },
  {
    prompt: "Did you get to try Anna's pastries yet?",
    options: [
      { label: 'Yes!', value: 'yes' },
      { label: 'Not yet', value: 'no' }
    ]
  }
];

export default function Choose() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [name, setName] = useState('');
  const [nameSet, setNameSet] = useState(false);
  const [coffees, setCoffees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showPastryPopup, setShowPastryPopup] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const userId = getStoredUserId();
      const stored = typeof window !== 'undefined' ? localStorage.getItem('brewHahaName') : '';
      if (userId && stored) {
        setName(stored);
        setNameSet(true);
      }
      const coffeeList = await getCoffees();
      setCoffees(coffeeList);
      setLoading(false);
    }
    fetchData();
  }, []);

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
          await new Promise(res => setTimeout(res, 500));
        }
        attempts++;
      }
      setSubmitting(false);
      if (!user) {
        setErrorMsg('Could not create or fetch user after several tries. Please check your connection and try again.');
        return;
      }
      setNameSet(true);
    }
  };

  // Simple logic: map style to coffee
  const styleToCoffee = {};
  if (coffees.length > 0) {
    // Map by tag, fallback to first coffee if not found
    const tagToCoffee = {};
    coffees.forEach(c => {
      if (c.tags && Array.isArray(c.tags)) {
        c.tags.forEach(tag => {
          if (!tagToCoffee[tag]) tagToCoffee[tag] = c;
        });
      }
    });
    styleToCoffee.smooth = coffees.find(c => c.tags && c.tags.includes('smooth')) || coffees[0];
    styleToCoffee.fruity = coffees.find(c => c.tags && c.tags.includes('fruity')) || coffees[0];
    styleToCoffee.intense = coffees.find(c => c.tags && c.tags.includes('intense')) || coffees[0];
    styleToCoffee.crazy = coffees.find(c => c.tags && c.tags.includes('floral')) || coffees[0];
  }

  const handleOption = (value) => {
    const newAnswers = [...answers];
    newAnswers[step] = value;
    // If Anna's pastries question and answer is 'no', show popup
    if (step === questions.length - 1 && value === 'no') {
      setShowPastryPopup(true);
    } else {
      setAnswers(newAnswers);
      setStep(step + 1);
    }
  };

  const handlePastryPopupClose = () => {
    setShowPastryPopup(false);
    // Advance the quiz after closing popup
    const newAnswers = [...answers];
    newAnswers[step] = 'no';
    setAnswers(newAnswers);
    setStep(step + 1);
  };

  const resetQuiz = () => {
    setStep(0);
    setAnswers([]);
  };

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>;
  }

  // Show name prompt before quiz if not set
  if (!nameSet) {
    return (
      <>
        <Header />
        <div style={{...pageStyle, paddingTop: '5rem'}}>
          <h1 style={{ color: '#6b4f1d' }}>Welcome to BrewHaha!</h1>
          <form onSubmit={handleNameSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center', minWidth: 260 }}>
            <label style={{ color: '#6b4f1d', fontWeight: 'bold' }}>
              What's your name?
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Enter your name"
                style={{
                  padding: '0.8rem',
                  borderRadius: 12,
                  border: '1px solid #e0cba8',
                  fontSize: '1.1rem',
                  fontFamily: 'inherit',
                  background: '#fffbe7',
                  color: '#6b4f1d',
                  width: '100%',
                  marginTop: 8
                }}
                required
              />
            </label>
            {errorMsg && (
              <div style={{ color: 'red', marginBottom: 16, textAlign: 'center' }}>{errorMsg}</div>
            )}
            <button type="submit" style={buttonStyle} disabled={submitting}>
              {submitting ? 'Loading...' : 'Start Quiz'}
            </button>
          </form>
        </div>
      </>
    );
  }

  // After last question, show result
  if (step >= questions.length) {
    const coffee = styleToCoffee[answers[0]] || (coffees.length > 2 ? coffees[2] : null); // fallback to Coffee C
    // Save recommendation to localStorage
    if (coffee && typeof window !== 'undefined') {
      localStorage.setItem('brewHahaRecommendation', JSON.stringify({
        coffeeId: coffee.id,
        name: coffee.name,
        description: coffee.description
      }));
    }
    return (
      <>
        <Header />
        <div style={{...pageStyle, paddingTop: '5rem'}}>
          <h1 style={{ color: '#6b4f1d' }}>Your Coffee Match</h1>
          <h2 style={{ color: '#6b4f1d', marginTop: 0 }}>{coffee ? coffee.name : ''}</h2>
          <p style={{ maxWidth: 320, textAlign: 'center', color: '#6b4f1d' }}>{coffee ? coffee.description : ''}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%', maxWidth: 320 }}>
            <a href={coffee ? `/taste?coffee=${coffee.id}` : '#'} style={{ width: '100%' }}>
              <button style={buttonStyle} disabled={!coffee}>Go Taste This Coffee</button>
            </a>
            <button style={{ ...buttonStyle, background: '#e0cba8', color: '#6b4f1d' }} onClick={resetQuiz}>
              Start Over
            </button>
            <a href="/" style={{ width: '100%' }}>
              <button style={{ ...buttonStyle, background: '#e0cba8', color: '#6b4f1d' }}>
                Return to Homepage
              </button>
            </a>
          </div>
        </div>
      </>
    );
  }

  const q = questions[step];

  return (
    <>
      <Header />
      <div style={{...pageStyle, paddingTop: '5rem', position: 'relative'}}>
        <h1 style={{ color: '#6b4f1d' }}>Choose Your Coffee</h1>
        <p style={{ fontWeight: 'bold', color: '#6b4f1d', marginBottom: 24 }}>{q.prompt}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%', maxWidth: 320 }}>
          {q.options.map((opt) => (
            <label key={opt.value} style={{
              background: '#e0cba8',
              color: '#6b4f1d',
              borderRadius: 12,
              padding: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              border: '2px solid #e0cba8',
              marginBottom: 4,
              transition: 'border 0.2s'
            }}>
              <input
                type="radio"
                name={`q${step}`}
                value={opt.value}
                onChange={() => handleOption(opt.value)}
                style={{ marginRight: 12 }}
              />
              {opt.label}
            </label>
          ))}
        </div>
        {showPastryPopup && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000
          }}>
            <div style={{
              background: '#fffbe7',
              borderRadius: 16,
              padding: '2rem',
              boxShadow: '0 4px 24px #0003',
              minWidth: 320,
              maxWidth: '90vw',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 24
            }}>
              <button onClick={handlePastryPopupClose} style={{ position: 'absolute', top: 12, right: 16, background: 'none', border: 'none', fontSize: 24, color: '#6b4f1d', cursor: 'pointer' }}>×</button>
              <div style={{ fontSize: 48, marginBottom: 8 }}>🚨</div>
              <div style={{ color: '#b91c1c', fontWeight: 'bold', fontSize: 22, textAlign: 'center' }}>Go get a pastry!</div>
              <button onClick={handlePastryPopupClose} style={{
                background: '#b91c1c',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '0.8rem 2rem',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                marginTop: 8
              }}>Done</button>
            </div>
          </div>
        )}
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