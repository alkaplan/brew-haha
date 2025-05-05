import { useState, useEffect } from 'react';
import Header from './Header';
import { getCoffees, upsertTasting, getTastingsForUser, getFlavorTags } from '../lib/dataSupabase';
import { getStoredUserId } from '../lib/user';

const emojiOptions = ['😋', '😍', '🤔', '😐', '😶', '🤢', '🤯'];

export default function Taste() {
  const [coffees, setCoffees] = useState([]);
  const [selectedCoffee, setSelectedCoffee] = useState('');
  const [allFlavorTags, setAllFlavorTags] = useState([]);
  const [selectedFlavorTags, setSelectedFlavorTags] = useState([]);
  const [emoji, setEmoji] = useState('');
  const [note, setNote] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [userTastings, setUserTastings] = useState([]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const userId = getStoredUserId();
      const storedName = typeof window !== 'undefined' ? localStorage.getItem('coffeeHouseName') : '';
      if (storedName) setName(storedName);
      const coffeeList = await getCoffees();
      setCoffees(coffeeList);
      if (userId) {
        const tastings = await getTastingsForUser(userId);
        setUserTastings(tastings);
      }
      const tags = await getFlavorTags();
      setAllFlavorTags(tags);
      setLoading(false);
    }
    fetchData();
  }, []);

  // Populate form fields if coffee already tasted
  useEffect(() => {
    if (!selectedCoffee) {
      setSelectedFlavorTags([]);
      setEmoji('');
      setNote('');
      return;
    }
    const prev = userTastings.find(t => t.coffee_id === selectedCoffee);
    if (prev) {
      setSelectedFlavorTags(prev.flavor_tags || []);
      setEmoji(prev.emoji || '');
      setNote(prev.note || '');
    } else {
      setSelectedFlavorTags([]);
      setEmoji('');
      setNote('');
    }
  }, [selectedCoffee, userTastings]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setSubmitting(true);
    const userId = getStoredUserId();
    if (!userId) {
      setErrorMsg('User not found. Please return to the homepage and enter your name.');
      setSubmitting(false);
      return;
    }
    if (!selectedCoffee) {
      setErrorMsg('Please select a coffee.');
      setSubmitting(false);
      return;
    }
    // Use upsert to insert or update tasting
    const { error } = await upsertTasting({
      userId,
      coffeeId: selectedCoffee,
      flavor_tags: selectedFlavorTags,
      emoji,
      note
    });
    setSubmitting(false);
    if (error) {
      setErrorMsg('Failed to submit tasting. Please try again.');
      return;
    }
    setSuccessMsg('Tasting saved!');
    // Fetch updated tastings from Supabase
    const updatedTastings = await getTastingsForUser(userId);
    setUserTastings(updatedTastings);
    setSelectedCoffee('');
    setSelectedFlavorTags([]);
    setEmoji('');
    setNote('');
  };

  if (loading) {
    return (
      <>
        <Header />
        <div style={{ minHeight: '100vh', background: '#fffbe7', padding: '2rem', paddingTop: '5rem', fontFamily: 'sans-serif', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ fontSize: 18, color: '#6b4f1d' }}>Loading coffee options...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div style={{ minHeight: '100vh', background: '#fffbe7', padding: '2rem', paddingTop: '5rem', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ 
          width: '100%', 
          maxWidth: 600, 
          background: '#fff', 
          borderRadius: 16, 
          padding: 32, 
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          marginBottom: 24
        }}>
          <h1 style={{ color: '#6b4f1d', marginBottom: 24, textAlign: 'center' }}>Taste a Coffee</h1>
          
          <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', background: '#f7ecd7', padding: '12px 16px', borderRadius: 8 }}>
              <span style={{ color: '#6b4f1d', fontWeight: 'bold', marginRight: 8 }}>Taster:</span> 
              <span style={{ color: '#6b4f1d' }}>{name}</span>
            </div>
            
            <div>
              <label style={{ color: '#6b4f1d', fontWeight: 'bold', display: 'block', marginBottom: 8 }}>
                Select Coffee:
              </label>
              <select
                value={selectedCoffee}
                onChange={e => setSelectedCoffee(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #e0cba8',
                  borderRadius: '8px',
                  fontSize: '16px',
                  color: '#6b4f1d',
                  background: '#fffbe7',
                  boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)',
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236b4f1d' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 16px center',
                  backgroundSize: '16px',
                  paddingRight: '40px'
                }}
                required
              >
                <option value="">-- Select a coffee --</option>
                {coffees.map(c => {
                  const tasted = userTastings.some(t => t.coffee_id === c.id);
                  return (
                    <option key={c.id} value={c.id}>
                      {c.name}{tasted ? ' (tasted)' : ''}
                    </option>
                  );
                })}
              </select>
            </div>
            
            <div>
              <label style={{ color: '#6b4f1d', fontWeight: 'bold', display: 'block', marginBottom: 8 }}>
                Flavor Tags (pick up to 3):
              </label>
              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: 8, 
                background: '#fffbe7', 
                padding: 16, 
                borderRadius: 8,
                border: '1px solid #e0cba8'
              }}>
                {allFlavorTags.map(tag => (
                  <button
                    type="button"
                    key={tag.name}
                    onClick={() => setSelectedFlavorTags(f => f.includes(tag.name) ? f.filter(t => t !== tag.name) : f.length < 3 ? [...f, tag.name] : f)}
                    style={{
                      background: selectedFlavorTags.includes(tag.name) ? '#6b4f1d' : '#e0cba8',
                      color: selectedFlavorTags.includes(tag.name) ? '#fffbe7' : '#6b4f1d',
                      border: 'none',
                      borderRadius: 20,
                      padding: '8px 16px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: '14px',
                      opacity: !selectedFlavorTags.includes(tag.name) && selectedFlavorTags.length >= 3 ? 0.5 : 1,
                      transition: 'all 0.2s ease'
                    }}
                    title={tag.description}
                    disabled={!selectedFlavorTags.includes(tag.name) && selectedFlavorTags.length >= 3}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
              {selectedFlavorTags.length > 0 && (
                <div style={{ marginTop: 8, fontSize: 14, color: '#6b4f1d' }}>
                  Selected: {selectedFlavorTags.join(', ')}
                </div>
              )}
            </div>
            
            <div>
              <label style={{ color: '#6b4f1d', fontWeight: 'bold', display: 'block', marginBottom: 8 }}>
                Reaction:
              </label>
              <div style={{ 
                display: 'flex', 
                gap: 8, 
                justifyContent: 'center',
                background: '#fffbe7', 
                padding: 16, 
                borderRadius: 8,
                border: '1px solid #e0cba8'
              }}>
                {emojiOptions.map(e => (
                  <button
                    type="button"
                    key={e}
                    onClick={() => setEmoji(e)}
                    style={{
                      fontSize: 28,
                      background: emoji === e ? '#6b4f1d' : '#fff',
                      border: `2px solid ${emoji === e ? '#6b4f1d' : '#e0cba8'}`,
                      borderRadius: '50%',
                      width: 56,
                      height: 56,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label style={{ color: '#6b4f1d', fontWeight: 'bold', display: 'block', marginBottom: 8 }}>
                Notes:
              </label>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="What did you notice about this coffee? (optional)"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #e0cba8',
                  borderRadius: '8px',
                  fontSize: '16px',
                  color: '#6b4f1d',
                  background: '#fffbe7',
                  boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)',
                  minHeight: 100,
                  resize: 'vertical'
                }}
                rows={3}
              />
            </div>
            
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
            
            <button 
              type="submit" 
              style={buttonStyle} 
              disabled={submitting || !selectedCoffee}
            >
              {submitting ? 'Submitting...' : 'Save Tasting Notes'}
            </button>
          </form>
        </div>
        
        <div style={{ 
          width: '100%', 
          maxWidth: 600, 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ 
            background: '#fff', 
            padding: '12px 20px', 
            borderRadius: 12, 
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            color: '#6b4f1d', 
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            <span>Coffees tasted:</span>
            <span style={{ 
              background: '#6b4f1d', 
              color: '#fff', 
              borderRadius: 20, 
              padding: '4px 12px', 
              fontSize: 14 
            }}>
              {userTastings.length} / {coffees.length}
            </span>
          </div>
          
          <a href="/">
            <button type="button" style={{ 
              background: '#e0cba8', 
              color: '#6b4f1d', 
              padding: '12px 20px',
              borderRadius: 12,
              border: 'none',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              Return Home
            </button>
          </a>
        </div>
      </div>
    </>
  );
}

const buttonStyle = {
  width: '100%',
  padding: '16px',
  fontSize: '18px',
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