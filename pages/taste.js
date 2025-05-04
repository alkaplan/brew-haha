import { useState, useEffect } from 'react';
import Header from './Header';
import { getCoffees, upsertTasting, getTastingsForUser, getFlavorTags } from '../lib/dataSupabase';
import { getStoredUserId } from '../lib/user';

const emojiOptions = ['😋', '😍', '🤔', '😐', '😶', '🤢'];

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
      const storedName = typeof window !== 'undefined' ? localStorage.getItem('brewHahaName') : '';
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
    return <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <>
      <Header />
      <div style={{ minHeight: '100vh', background: '#fffbe7', padding: '2rem', paddingTop: '5rem', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h1 style={{ color: '#6b4f1d', marginBottom: 16 }}>Taste a Coffee</h1>
        <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 400, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ color: '#6b4f1d', fontWeight: 'bold', marginBottom: 8 }}>Taster: {name}</div>
          <label style={{ color: '#6b4f1d', fontWeight: 'bold' }}>
            Select Coffee:
            <select
              value={selectedCoffee}
              onChange={e => setSelectedCoffee(e.target.value)}
              style={{
                padding: '0.8rem',
                border: '1px solid #6b4f1d',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                color: '#6b4f1d',
                background: '#fffbe7',
                marginTop: 8
              }}
              required
            >
              <option value="">-- Select --</option>
              {coffees.map(c => {
                const tasted = userTastings.some(t => t.coffee_id === c.id);
                return (
                  <option key={c.id} value={c.id}>
                    {c.name}{tasted ? ' (tasted)' : ''}
                  </option>
                );
              })}
            </select>
          </label>
          <label style={{ color: '#6b4f1d', fontWeight: 'bold' }}>
            Flavor Tags (pick up to 3):
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
              {allFlavorTags.map(tag => (
                <button
                  type="button"
                  key={tag.name}
                  onClick={() => setSelectedFlavorTags(f => f.includes(tag.name) ? f.filter(t => t !== tag.name) : f.length < 3 ? [...f, tag.name] : f)}
                  style={{
                    background: selectedFlavorTags.includes(tag.name) ? '#6b4f1d' : '#e0cba8',
                    color: selectedFlavorTags.includes(tag.name) ? '#fffbe7' : '#6b4f1d',
                    border: 'none',
                    borderRadius: 16,
                    padding: '0.5rem 1rem',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '1rem'
                  }}
                  disabled={!selectedFlavorTags.includes(tag.name) && selectedFlavorTags.length >= 3}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </label>
          <label style={{ color: '#6b4f1d', fontWeight: 'bold' }}>
            Emoji:
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              {emojiOptions.map(e => (
                <button
                  type="button"
                  key={e}
                  onClick={() => setEmoji(e)}
                  style={{
                    fontSize: 24,
                    background: emoji === e ? '#6b4f1d' : '#e0cba8',
                    color: emoji === e ? '#fffbe7' : '#6b4f1d',
                    border: 'none',
                    borderRadius: '50%',
                    width: 40,
                    height: 40,
                    cursor: 'pointer',
                    outline: emoji === e ? '2px solid #6b4f1d' : 'none',
                    transition: 'background 0.2s'
                  }}
                >
                  {e}
                </button>
              ))}
            </div>
          </label>
          <label style={{ color: '#6b4f1d', fontWeight: 'bold' }}>
            Note:
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Add a note (optional)"
              style={{
                padding: '0.8rem',
                border: '1px solid #6b4f1d',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                color: '#6b4f1d',
                background: '#fffbe7',
                marginTop: 8
              }}
              rows={2}
            />
          </label>
          {errorMsg && <div style={{ color: 'red', textAlign: 'center' }}>{errorMsg}</div>}
          {successMsg && <div style={{ color: 'green', textAlign: 'center' }}>{successMsg}</div>}
          <button type="submit" style={buttonStyle} disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Tasting'}
          </button>
          <a href="/" style={{ width: '100%' }}>
            <button type="button" style={{ ...buttonStyle, background: '#e0cba8', color: '#6b4f1d', marginTop: 12 }}>
              Return to Homepage
            </button>
          </a>
        </form>
        <div style={{ marginTop: 32, color: '#6b4f1d', fontWeight: 'bold' }}>
          Coffees tasted: {userTastings.length} / {coffees.length}
        </div>
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
  transition: 'background 0.2s',
  marginTop: 24
};