import { useState, useEffect } from 'react';
import { getCoffees } from '../lib/data';
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
  const coffees = getCoffees();

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('brewHahaName') : '';
    if (stored) {
      setName(stored);
      setNameSet(true);
    }
  }, []);

  const handleNameSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      localStorage.setItem('brewHahaName', name.trim());
      setNameSet(true);
    }
  };

  // Simple logic: map style to coffee
  const styleToCoffee = {
    smooth: coffees[1], // Coffee B
    fruity: coffees[0], // Coffee A
    intense: coffees[3], // Coffee D
    crazy: coffees[4]   // Coffee E
  };

  const handleOption = (value) => {
    const newAnswers = [...answers];
    newAnswers[step] = value;
    setAnswers(newAnswers);
    setStep(step + 1);
  };

  const resetQuiz = () => {
    setStep(0);
    setAnswers([]);
  };

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
            <button type="submit" style={buttonStyle}>Start Quiz</button>
          </form>
        </div>
      </>
    );
  }

  // After last question, show result
  if (step >= questions.length) {
    const coffee = styleToCoffee[answers[0]] || coffees[2]; // fallback to Coffee C
    // Save recommendation to localStorage
    if (typeof window !== 'undefined') {
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
          <h2 style={{ color: '#6b4f1d', marginTop: 0 }}>{coffee.name}</h2>
          <p style={{ maxWidth: 320, textAlign: 'center', color: '#6b4f1d' }}>{coffee.description}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%', maxWidth: 320 }}>
            <a href={`/taste?coffee=${coffee.id}`} style={{ width: '100%' }}>
              <button style={buttonStyle}>Go Taste This Coffee</button>
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
      <div style={{...pageStyle, paddingTop: '5rem'}}>
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