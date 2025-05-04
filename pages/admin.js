import { useState, useEffect } from 'react';
import Header from './Header';
import { getReviews, getTastings, getCoffees } from '../lib/data';
import { useRouter } from 'next/router';

const ADMIN_PASSWORD = 'shkelzen';

const defaultCoffees = [
  { id: 'A', name: 'Coffee A', description: 'Bright and fruity, perfect for adventurous palates.', tags: ['fruity', 'bright', 'adventurous'] },
  { id: 'B', name: 'Coffee B', description: 'Smooth and chocolatey, a crowd-pleaser.', tags: ['chocolate', 'smooth', 'classic'] },
  { id: 'C', name: 'Coffee C', description: 'Nutty and balanced, for those who like harmony.', tags: ['nutty', 'balanced', 'mellow'] },
  { id: 'D', name: 'Coffee D', description: 'Bold and intense, for the strong-hearted.', tags: ['bold', 'intense', 'strong'] },
  { id: 'E', name: 'Coffee E', description: 'Floral and delicate, a gentle experience.', tags: ['floral', 'delicate', 'gentle'] }
];

function aggregateResults(coffees, reviews, tastings) {
  return coffees.map(coffee => {
    // Count how many times this coffee appears in each position
    const positionCounts = {};
    reviews.forEach(review => {
      const position = review.ranked.indexOf(coffee.id);
      if (position !== -1) {
        positionCounts[position] = (positionCounts[position] || 0) + 1;
      }
    });

    // Get top 3 flavors from tastings
    const coffeeTastings = tastings.filter(t => t.coffee === coffee.id);
    const flavorCounts = {};
    coffeeTastings.forEach(t => {
      (t.flavors || []).forEach(f => {
        flavorCounts[f] = (flavorCounts[f] || 0) + 1;
      });
    });
    const topFlavors = Object.entries(flavorCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([f]) => f);

    return {
      ...coffee,
      positionCounts,
      topFlavors
    };
  });
}

function exportData(type, coffees, reviews, tastings) {
  if (type === 'json') {
    const data = { coffees, reviews, tastings };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'brew-haha-data.json';
    a.click();
    URL.revokeObjectURL(url);
  } else if (type === 'csv') {
    let csv = 'Type,Time,Name,Coffee,Flavors,Emoji,Note,Rankings\n';
    tastings.forEach(t => {
      csv += `Tasting,${new Date(t.time).toISOString()},${t.name||''},${t.coffee},${(t.flavors||[]).join(';')},${t.emoji||''},"${t.note||''}",\n`;
    });
    reviews.forEach(r => {
      const rankings = r.ranked.map((id, idx) => {
        const coffee = coffees.find(c => c.id === id);
        return `${idx + 1}. ${coffee?.name || id}`;
      }).join(';');
      csv += `Review,${new Date(r.time).toISOString()},${r.name||''},,,,'',"${rankings}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'brew-haha-data.csv';
    a.click();
    URL.revokeObjectURL(url);
  }
}

export default function Admin() {
  const router = useRouter();
  const [input, setInput] = useState('');
  const [authed, setAuthed] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('config');
  const [coffees, setCoffees] = useState(defaultCoffees);
  const [saved, setSaved] = useState(false);
  const [results, setResults] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [tastings, setTastings] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem('adminCoffees');
    if (stored) setCoffees(JSON.parse(stored));
  }, []);

  useEffect(() => {
    if (tab === 'results') {
      const coffeesNow = getCoffees();
      const reviewsNow = getReviews();
      const tastingsNow = getTastings();
      setReviews(reviewsNow);
      setTastings(tastingsNow);
      setResults(aggregateResults(coffeesNow, reviewsNow, tastingsNow));
    }
  }, [tab]);

  useEffect(() => {
    const isAuthed = localStorage.getItem('adminAuthed') === 'true';
    setAuthed(isAuthed);
  }, []);

  const handleCoffeeChange = (idx, field, value) => {
    setCoffees(cs => cs.map((c, i) => i === idx ? { ...c, [field]: value } : c));
  };

  const handleTagChange = (idx, value) => {
    setCoffees(cs => cs.map((c, i) => i === idx ? { ...c, tags: value.split(',').map(t => t.trim()).filter(Boolean) } : c));
  };

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem('adminCoffees', JSON.stringify(coffees));
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input === ADMIN_PASSWORD) {
      setAuthed(true);
      setError('');
      localStorage.setItem('adminAuthed', 'true');
    } else {
      setError('Incorrect password.');
    }
  };

  const handleLogout = () => {
    setAuthed(false);
    localStorage.removeItem('adminAuthed');
    router.push('/');
  };

  if (!authed) {
    return (
      <>
        <Header />
        <div style={{...pageStyle, paddingTop: '5rem'}}>
          <h1 style={{ color: '#6b4f1d' }}>Admin Login</h1>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 260, alignItems: 'center' }}>
            <input
              type="password"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Enter password"
              style={{
                padding: '0.8rem',
                borderRadius: 12,
                border: '1px solid #e0cba8',
                fontSize: '1.1rem',
                fontFamily: 'inherit',
                background: '#fffbe7',
                color: '#6b4f1d',
                width: '100%'
              }}
            />
            <button type="submit" style={buttonStyle}>Login</button>
            {error && <div style={{ color: 'crimson', fontWeight: 'bold' }}>{error}</div>}
          </form>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div style={{...pageStyle, paddingTop: '5rem'}}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ color: '#6b4f1d' }}>Admin Dashboard</h1>
          <button onClick={handleLogout} style={{...buttonStyle, width: 'auto', background: '#e0cba8', color: '#6b4f1d'}}>
            Logout
          </button>
        </div>
        <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
          <button
            style={{ ...tabButtonStyle, background: tab === 'config' ? '#6b4f1d' : '#e0cba8', color: tab === 'config' ? '#fffbe7' : '#6b4f1d' }}
            onClick={() => setTab('config')}
          >
            Config
          </button>
          <button
            style={{ ...tabButtonStyle, background: tab === 'results' ? '#6b4f1d' : '#e0cba8', color: tab === 'results' ? '#fffbe7' : '#6b4f1d' }}
            onClick={() => setTab('results')}
          >
            Results
          </button>
        </div>
        {tab === 'config' && (
          <form onSubmit={handleSave} style={{ width: '100%', maxWidth: 500, display: 'flex', flexDirection: 'column', gap: 24 }}>
            {coffees.map((c, idx) => (
              <div key={c.id} style={{ background: '#e0cba8', borderRadius: 16, padding: '1rem', color: '#6b4f1d', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ fontWeight: 'bold', fontSize: 18 }}>{c.id}</div>
                <label style={labelStyle}>
                  Name:
                  <input
                    type="text"
                    value={c.name}
                    onChange={e => handleCoffeeChange(idx, 'name', e.target.value)}
                    style={inputStyle}
                  />
                </label>
                <label style={labelStyle}>
                  Description:
                  <input
                    type="text"
                    value={c.description}
                    onChange={e => handleCoffeeChange(idx, 'description', e.target.value)}
                    style={inputStyle}
                  />
                </label>
                <label style={labelStyle}>
                  Vibe tags (comma separated):
                  <input
                    type="text"
                    value={c.tags.join(', ')}
                    onChange={e => handleTagChange(idx, e.target.value)}
                    style={inputStyle}
                  />
                </label>
              </div>
            ))}
            <button type="submit" style={buttonStyle}>Save Changes</button>
            {saved && <div style={{ color: 'green', fontWeight: 'bold', textAlign: 'center' }}>Saved!</div>}
          </form>
        )}
        {tab === 'results' && (
          <div>
            <h2 style={{ color: '#6b4f1d' }}>Results</h2>
            <div style={{ marginBottom: 16 }}>
              <button style={{ ...buttonStyle, width: 'auto', marginRight: 8 }} onClick={() => exportData('json', coffees, reviews, tastings)}>Export JSON</button>
              <button style={{ ...buttonStyle, width: 'auto' }} onClick={() => exportData('csv', coffees, reviews, tastings)}>Export CSV</button>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ borderCollapse: 'collapse', minWidth: 400 }}>
                <thead>
                  <tr style={{ background: '#e0cba8', color: '#6b4f1d' }}>
                    <th style={thStyle}>Coffee</th>
                    <th style={thStyle}>1st Place</th>
                    <th style={thStyle}>2nd Place</th>
                    <th style={thStyle}>3rd Place</th>
                    <th style={thStyle}>Top Flavors</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map(r => (
                    <tr key={r.id} style={{ background: '#fffbe7', color: '#6b4f1d', borderBottom: '1px solid #e0cba8' }}>
                      <td style={tdStyle}>{r.name}</td>
                      <td style={tdStyle}>{r.positionCounts[0] || 0}</td>
                      <td style={tdStyle}>{r.positionCounts[1] || 0}</td>
                      <td style={tdStyle}>{r.positionCounts[2] || 0}</td>
                      <td style={tdStyle}>{r.topFlavors.join(', ')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* List all tastings */}
            <h3 style={{ color: '#6b4f1d', marginTop: 32 }}>All Tastings</h3>
            <div style={{ overflowX: 'auto', marginBottom: 24 }}>
              <table style={{ borderCollapse: 'collapse', minWidth: 400 }}>
                <thead>
                  <tr style={{ background: '#e0cba8', color: '#6b4f1d' }}>
                    <th style={thStyle}>Name</th>
                    <th style={thStyle}>Coffee</th>
                    <th style={thStyle}>Flavors</th>
                    <th style={thStyle}>Emoji</th>
                    <th style={thStyle}>Note</th>
                    <th style={thStyle}>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {tastings.map((t, i) => (
                    <tr key={i} style={{ background: '#fffbe7', color: '#6b4f1d', borderBottom: '1px solid #e0cba8' }}>
                      <td style={tdStyle}>{t.name || ''}</td>
                      <td style={tdStyle}>{t.coffee}</td>
                      <td style={tdStyle}>{(t.flavors||[]).join(', ')}</td>
                      <td style={tdStyle}>{t.emoji}</td>
                      <td style={tdStyle}>{t.note}</td>
                      <td style={tdStyle}>{t.time ? new Date(t.time).toLocaleString() : ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* List all reviews */}
            <h3 style={{ color: '#6b4f1d', marginTop: 32 }}>All Reviews</h3>
            <div style={{ overflowX: 'auto', marginBottom: 24 }}>
              <table style={{ borderCollapse: 'collapse', minWidth: 400 }}>
                <thead>
                  <tr style={{ background: '#e0cba8', color: '#6b4f1d' }}>
                    <th style={thStyle}>Name</th>
                    <th style={thStyle}>Rankings</th>
                    <th style={thStyle}>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map((r, i) => (
                    <tr key={i} style={{ background: '#fffbe7', color: '#6b4f1d', borderBottom: '1px solid #e0cba8' }}>
                      <td style={tdStyle}>{r.name || ''}</td>
                      <td style={tdStyle}>
                        {r.ranked.map((id, idx) => {
                          const coffee = coffees.find(c => c.id === id);
                          return `${idx + 1}. ${coffee?.name || id}`;
                        }).join(', ')}
                      </td>
                      <td style={tdStyle}>{r.time ? new Date(r.time).toLocaleString() : ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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

const tabButtonStyle = {
  padding: '0.7rem 1.5rem',
  border: 'none',
  borderRadius: 12,
  fontWeight: 'bold',
  fontSize: '1.1rem',
  cursor: 'pointer',
  boxShadow: '0 2px 8px #0001',
  transition: 'background 0.2s',
};

const labelStyle = {
  color: '#6b4f1d',
  fontWeight: 'bold',
  marginBottom: 8,
  display: 'block'
};

const inputStyle = {
  width: '100%',
  padding: '0.7rem',
  borderRadius: 12,
  border: '1px solid #e0cba8',
  marginTop: 8,
  fontSize: '1rem',
  fontFamily: 'inherit',
  background: '#fffbe7',
  color: '#6b4f1d'
};

const thStyle = {
  padding: '0.75rem',
  textAlign: 'left',
  fontWeight: 'bold',
  color: '#6b4f1d'
};

const tdStyle = {
  padding: '0.75rem',
  textAlign: 'left',
  color: '#6b4f1d'
}; 