import { useEffect, useState } from 'react';
import Header from './Header';
import { getCoffees, getTastingsForUser, getReviewsForUser, getAllReviews } from '../lib/dataSupabase';
import { getStoredUserId } from '../lib/user';
import { useRouter } from 'next/router';

export default function Results() {
  const [loading, setLoading] = useState(true);
  const [coffees, setCoffees] = useState([]);
  const [tastings, setTastings] = useState([]);
  const [userReviews, setUserReviews] = useState([]);
  const [allReviews, setAllReviews] = useState([]);
  const [name, setName] = useState('');
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const userId = getStoredUserId();
      const storedName = typeof window !== 'undefined' ? localStorage.getItem('brewHahaName') : '';
      if (storedName) setName(storedName);
      if (!userId) {
        router.replace('/');
        return;
      }
      const [coffeesData, tastingsData, userReviewsData, allReviewsData] = await Promise.all([
        getCoffees(),
        getTastingsForUser(userId),
        getReviewsForUser(userId),
        getAllReviews()
      ]);
      setCoffees(coffeesData);
      setTastings(tastingsData);
      setUserReviews(userReviewsData);
      setAllReviews(allReviewsData);
      setLoading(false);
    }
    fetchData();
  }, []);

  // Only allow access if user has completed review
  useEffect(() => {
    if (!loading && userReviews.length === 0) {
      router.replace('/');
    }
  }, [loading, userReviews, router]);

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>;

  // User's ranked coffees
  const rankedIds = userReviews.length > 0 ? userReviews.sort((a, b) => a.rank - b.rank).map(r => r.coffee_id) : [];
  const tastedIds = tastings.map(t => t.coffee_id);
  const tastedCoffees = coffees.filter(c => tastedIds.includes(c.id));

  // Crowd favorite calculation
  const crowdRanks = {};
  allReviews.forEach(r => {
    if (!crowdRanks[r.coffee_id]) crowdRanks[r.coffee_id] = [];
    crowdRanks[r.coffee_id].push(r.rank);
  });
  const crowdAvgRanks = Object.entries(crowdRanks).map(([id, ranks]) => ({
    id,
    avg: ranks.reduce((a, b) => a + b, 0) / ranks.length
  }));
  crowdAvgRanks.sort((a, b) => a.avg - b.avg);
  const crowdFavoriteId = crowdAvgRanks.length > 0 ? crowdAvgRanks[0].id : null;

  return (
    <>
      <Header />
      <div style={{ minHeight: '100vh', background: '#fffbe7', padding: '2rem', paddingTop: '5rem', fontFamily: 'sans-serif', maxWidth: 700, margin: '0 auto' }}>
        <h1 style={{ color: '#6b4f1d', marginBottom: 24 }}>Your Results</h1>
        <div style={{ color: '#6b4f1d', fontWeight: 'bold', fontSize: 20, marginBottom: 16 }}>
          You tasted <span style={{ color: '#b91c1c' }}>{tastedCoffees.length}</span> coffee{tastedCoffees.length === 1 ? '' : 's'}!
        </div>
        <h2 style={{ color: '#6b4f1d', fontSize: 22, marginTop: 32 }}>Your Tasting Notes</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginTop: 16 }}>
          {tastedCoffees.map(coffee => {
            const t = tastings.find(t => t.coffee_id === coffee.id);
            return (
              <div key={coffee.id} style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #0001', padding: 16 }}>
                <div style={{ fontWeight: 'bold', fontSize: 18, color: '#6b4f1d' }}>{coffee.name}</div>
                <div style={{ marginTop: 4, color: '#6b4f1d' }}>
                  <span style={{ fontWeight: 'bold' }}>Your tags:</span> {(t.flavor_tags || []).join(', ') || <span style={{ color: '#b91c1c' }}>None</span>}
                </div>
                <div style={{ marginTop: 2, color: '#6b4f1d' }}>
                  <span style={{ fontWeight: 'bold' }}>Your emoji:</span> {t.emoji || <span style={{ color: '#b91c1c' }}>None</span>}
                </div>
                <div style={{ marginTop: 2, color: '#6b4f1d' }}>
                  <span style={{ fontWeight: 'bold' }}>Your note:</span> {t.note || <span style={{ color: '#b91c1c' }}>None</span>}
                </div>
                <div style={{ marginTop: 8, color: '#6b4f1d' }}>
                  <span style={{ fontWeight: 'bold' }}>Official notes:</span> {coffee.panel_notes || <span style={{ color: '#b91c1c' }}>None</span>}
                </div>
                {coffee.tags && coffee.tags.length > 0 && (
                  <div style={{ marginTop: 2, color: '#6b4f1d' }}>
                    <span style={{ fontWeight: 'bold' }}>Official tags:</span> {coffee.tags.join(', ')}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <h2 style={{ color: '#6b4f1d', fontSize: 22, marginTop: 40 }}>Favorites Comparison</h2>
        <div style={{ marginTop: 16, color: '#6b4f1d', fontWeight: 'bold', fontSize: 18 }}>
          Your favorite: <span style={{ color: '#b91c1c' }}>{coffees.find(c => c.id === rankedIds[0])?.name || 'N/A'}</span>
        </div>
        <div style={{ marginTop: 8, color: '#6b4f1d', fontWeight: 'bold', fontSize: 18 }}>
          Crowd favorite: <span style={{ color: '#b91c1c' }}>{coffees.find(c => c.id === crowdFavoriteId)?.name || 'N/A'}</span>
        </div>
        {crowdFavoriteId && rankedIds[0] === crowdFavoriteId && (
          <div style={{ marginTop: 12, color: '#15803d', fontWeight: 'bold', fontSize: 20 }}>
            🎉 You picked the crowd favorite!
          </div>
        )}
        <a href="/" style={{ display: 'block', marginTop: 40 }}>
          <button style={{ ...buttonStyle, background: '#e0cba8', color: '#6b4f1d' }}>Return to Homepage</button>
        </a>
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