import { useState, useEffect } from 'react';
import { getCoffees, getFlavorTags } from '../lib/dataSupabase';
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
  const [flavorTags, setFlavorTags] = useState([]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const userId = getStoredUserId();
      const stored = typeof window !== 'undefined' ? localStorage.getItem('coffeeHouseName') : '';
      if (userId && stored) {
        setName(stored);
        setNameSet(true);
      }
      const coffeeList = await getCoffees();
      setCoffees(coffeeList);
      const tags = await getFlavorTags();
      setFlavorTags(tags);
      setLoading(false);
    }
    fetchData();
  }, []);

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

  // After last question, show result
  if (step >= questions.length) {
    const coffee = styleToCoffee[answers[0]] || (coffees.length > 2 ? coffees[2] : null); // fallback to Coffee C
    // Save recommendation to localStorage
    if (coffee && typeof window !== 'undefined') {
      localStorage.setItem('coffeeHouseRecommendation', JSON.stringify({
        coffeeId: coffee.id,
        name: coffee.name,
        description: coffee.description
      }));
    }
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
            textAlign: 'center',
            marginBottom: 24
          }}>
            <h1 style={{ color: '#6b4f1d', marginBottom: 8 }}>Your Coffee Match</h1>
            <h2 style={{ color: '#b91c1c', marginTop: 0, fontSize: 28 }}>{coffee ? coffee.name : ''}</h2>
            <p style={{ color: '#6b4f1d', fontSize: 16, lineHeight: 1.6 }}>{coffee ? coffee.description : ''}</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%', marginTop: 32 }}>
              <a href={coffee ? `/taste?coffee=${coffee.id}` : '#'} style={{ width: '100%' }}>
                <button style={{...buttonStyle, padding: '1.2rem'}} disabled={!coffee}>
                  Go Taste This Coffee
                </button>
              </a>
              <div style={{ display: 'flex', gap: 12 }}>
                <button style={{ ...buttonStyle, background: '#e0cba8', color: '#6b4f1d', flex: 1 }} onClick={resetQuiz}>
                  Start Over
                </button>
                <a href="/" style={{ flex: 1 }}>
                  <button style={{ ...buttonStyle, background: '#e0cba8', color: '#6b4f1d', width: '100%' }}>
                    Return Home
                  </button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Show name prompt before quiz if not set
  if (!nameSet) {
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
            width: '100%'
          }}>
            <h1 style={{ color: '#6b4f1d', textAlign: 'center', marginBottom: 24 }}>Welcome to Coffee House!</h1>
            <form onSubmit={handleNameSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <label style={{ color: '#6b4f1d', fontWeight: 'bold' }}>
                What's your name?
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Enter your name"
                  style={{
                    padding: '1rem',
                    borderRadius: 12,
                    border: '1px solid #e0cba8',
                    fontSize: '1.1rem',
                    fontFamily: 'inherit',
                    background: '#fffbe7',
                    color: '#6b4f1d',
                    width: '100%',
                    marginTop: 8,
                    boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)'
                  }}
                  required
                />
              </label>
              {errorMsg && (
                <div style={{ color: '#b91c1c', padding: '8px 12px', background: '#fee', borderRadius: 8, textAlign: 'center' }}>{errorMsg}</div>
              )}
              <button type="submit" style={{...buttonStyle, marginTop: 8}} disabled={submitting}>
                {submitting ? 'Loading...' : 'Start Coffee Quiz'}
              </button>
            </form>
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
        <div style={{ 
          maxWidth: 480, 
          background: '#fff', 
          borderRadius: 16, 
          padding: 32, 
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          width: '100%'
        }}>
          {/* Progress bar */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ color: '#6b4f1d', fontSize: 14 }}>Question {step + 1}/{questions.length}</span>
              <span style={{ color: '#6b4f1d', fontSize: 14 }}>{Math.round(((step + 1) / questions.length) * 100)}%</span>
            </div>
            <div style={{ height: 8, background: '#e0cba8', borderRadius: 4, overflow: 'hidden' }}>
              <div 
                style={{ 
                  height: '100%', 
                  width: `${((step + 1) / questions.length) * 100}%`, 
                  background: '#6b4f1d', 
                  borderRadius: 4,
                  transition: 'width 0.3s ease'
                }}
              ></div>
            </div>
          </div>
          
          <h1 style={{ color: '#6b4f1d', textAlign: 'center', fontSize: 24, marginBottom: 8 }}>Choose Your Coffee</h1>
          <p style={{ fontWeight: 'bold', color: '#6b4f1d', marginBottom: 28, textAlign: 'center', fontSize: 18 }}>{q.prompt}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {q.options.map((opt) => (
              <div 
                key={opt.value} 
                onClick={() => handleOption(opt.value)}
                style={{ 
                  padding: '16px 20px', 
                  background: '#e0cba8',
                  color: '#6b4f1d',
                  borderRadius: 12,
                  cursor: 'pointer',
                  border: '2px solid #e0cba8',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                  ':hover': {
                    background: '#fffbe7',
                    borderColor: '#6b4f1d',
                  }
                }}
              >
                <input
                  type="radio"
                  name={`q${step}`}
                  value={opt.value}
                  onChange={() => {}}
                  style={{ marginRight: 12 }}
                />
                <span style={{ fontWeight: 'bold', fontSize: 16 }}>{opt.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Pastry popup */}
      {showPastryPopup && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#fff',
            padding: 24,
            borderRadius: 16,
            maxWidth: 400,
            width: '90%',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
          }}>
            <h2 style={{ color: '#b91c1c', marginTop: 0 }}>Missing out on pastries?!</h2>
            <p style={{ color: '#6b4f1d', marginBottom: 24 }}>
              You should really try Anna's amazing pastries! They're legendary and pair perfectly with our coffee.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <a href="/pastries" style={{ marginRight: 12 }}>
                <button
                  type="button"
                  style={{ ...buttonStyle, background: '#b91c1c' }}
                >
                  See Pastries
                </button>
              </a>
              <button
                type="button"
                onClick={handlePastryPopupClose}
                style={{ ...buttonStyle, background: '#e0cba8', color: '#6b4f1d' }}
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}
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
  padding: '1rem',
  fontSize: '1.1rem',
  background: '#6b4f1d',
  color: '#fffbe7',
  border: 'none',
  borderRadius: '0.8rem',
  fontWeight: 'bold',
  cursor: 'pointer',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  transition: 'all 0.2s ease'
};