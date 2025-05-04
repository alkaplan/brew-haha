import { useEffect, useState } from 'react';
import Header from './Header';
import { getCoffees, getTastingsForUser, getReviewsForUser, getAllReviews } from '../lib/dataSupabase';
import { getStoredUserId } from '../lib/user';
import { useRouter } from 'next/router';
import { FLAVOR_TAGS } from '../lib/constants';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const thStyle = { padding: 8, fontWeight: 'bold', fontSize: 16, background: '#6b4f1d', color: '#fffbe7', borderBottom: '2px solid #e0cba8' };
const tdStyle = { padding: 8, fontSize: 15, color: '#3a2a0c', background: '#fff', borderBottom: '1px solid #e0cba8' };

export default function Results() {
  const [loading, setLoading] = useState(true);
  const [coffees, setCoffees] = useState([]);
  const [tastings, setTastings] = useState([]);
  const [userReviews, setUserReviews] = useState([]);
  const [allReviews, setAllReviews] = useState([]);
  const [name, setName] = useState('');
  const [selectedCoffeeId, setSelectedCoffeeId] = useState('');
  const router = useRouter();

  // User's ranked coffees
  const rankedIds = userReviews.length > 0 ? userReviews.slice().sort((a, b) => a.rank - b.rank).map(r => r.coffee_id) : [];
  const tastedIds = tastings.map(t => t.coffee_id);
  const tastedCoffees = coffees.filter(c => tastedIds.includes(c.id));

  useEffect(() => {
    // Only set selectedCoffeeId after loading is done and data is available
    if (!loading && !selectedCoffeeId) {
      if (tastedCoffees.length > 0) {
        setSelectedCoffeeId(tastedCoffees[0].id);
      } else if (coffees.length > 0) {
        setSelectedCoffeeId(coffees[0].id);
      }
    }
  }, [loading, selectedCoffeeId, tastedCoffees, coffees]);

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

  // Calculate favorite counts and rankings for medal table
  const favoriteCounts = {};
  allReviews.forEach(r => {
    if (r.rank === 1) favoriteCounts[r.coffee_id] = (favoriteCounts[r.coffee_id] || 0) + 1;
  });
  const coffeeList = coffees;
  const sortedByFavorites = [...coffeeList].sort((a, b) => (favoriteCounts[b.id] || 0) - (favoriteCounts[a.id] || 0));
  const medals = ['🥇', '🥈', '🥉'];
  const userRanks = {};
  userReviews.forEach(r => { userRanks[r.coffee_id] = r.rank; });

  return (
    <>
      <Header />
      <div style={{ minHeight: '100vh', background: '#fffbe7', padding: '2rem', paddingTop: '5rem', fontFamily: 'sans-serif', width: '100vw', maxWidth: '100vw', margin: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h1 style={{ color: '#6b4f1d', marginBottom: 24 }}>Your Results</h1>
        <div style={{ color: '#6b4f1d', fontWeight: 'bold', fontSize: 20, marginBottom: 16 }}>
          You tasted <span style={{ color: '#b91c1c' }}>{tastedCoffees.length}</span> coffee{tastedCoffees.length === 1 ? '' : 's'}!
        </div>
        <h2 style={{ color: '#6b4f1d', fontSize: 22, marginTop: 32 }}>Your Tasting Notes</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginTop: 16, width: '100%', maxWidth: 700 }}>
          {tastedCoffees.map(coffee => {
            const t = tastings.find(t => t.coffee_id === coffee.id);
            const officialTags = coffee.tags || [];
            const userTags = (t.flavor_tags || []);
            // Tag comparison
            const correct = userTags.filter(tag => officialTags.includes(tag));
            const missed = officialTags.filter(tag => !userTags.includes(tag));
            const extra = userTags.filter(tag => !officialTags.includes(tag));
            return (
              <div key={coffee.id} style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #0001', padding: 16 }}>
                <div style={{ fontWeight: 'bold', fontSize: 18, color: '#6b4f1d' }}>{coffee.name}</div>
                <div style={{ marginTop: 4, color: '#6b4f1d' }}>
                  <span style={{ fontWeight: 'bold' }}>Your tags:</span> {userTags.length ? userTags.join(', ') : <span style={{ color: '#b91c1c' }}>None</span>}
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
                {officialTags.length > 0 && (
                  <div style={{ marginTop: 2, color: '#6b4f1d' }}>
                    <span style={{ fontWeight: 'bold' }}>Official tags:</span> {officialTags.join(', ')}
                  </div>
                )}
                {/* Tag comparison visualization */}
                <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                  {officialTags.map(tag => (
                    <span key={tag} style={{
                      background: userTags.includes(tag) ? '#15803d' : '#e0cba8',
                      color: userTags.includes(tag) ? '#fff' : '#6b4f1d',
                      borderRadius: 16,
                      padding: '0.4rem 1rem',
                      fontWeight: 'bold',
                      fontSize: '1rem',
                      border: userTags.includes(tag) ? '2px solid #15803d' : '2px solid #e0cba8',
                      marginRight: 4
                    }}>
                      {tag} {userTags.includes(tag) ? '✔️' : ''}
                    </span>
                  ))}
                  {extra.length > 0 && (
                    <span style={{ marginLeft: 12, color: '#b91c1c', fontWeight: 'bold' }}>
                      {extra.map(tag => (
                        <span key={tag} style={{
                          background: '#b91c1c',
                          color: '#fff',
                          borderRadius: 16,
                          padding: '0.4rem 1rem',
                          fontWeight: 'bold',
                          fontSize: '1rem',
                          border: '2px solid #b91c1c',
                          marginRight: 4
                        }}>{tag} ❌</span>
                      ))}
                    </span>
                  )}
                </div>
                <div style={{ marginTop: 8, color: '#15803d', fontWeight: 'bold' }}>
                  {correct.length > 0 && `You got ${correct.length} flavor${correct.length > 1 ? 's' : ''} right!`}
                </div>
              </div>
            );
          })}
        </div>
        <h2 style={{ color: '#6b4f1d', fontSize: 22, marginTop: 40 }}>Coffee Medal Table</h2>
        <div style={{ width: '100%', maxWidth: 700, background: '#fff', borderRadius: 8, padding: 16, marginBottom: 32, marginTop: 24 }}>
          {/* Calculate medal counts and weighted scores */}
          {(() => {
            const medalCounts = {};
            const rankPoints = {};
            
            // Calculate medal counts and points
            allReviews.forEach(r => {
              if (!medalCounts[r.coffee_id]) {
                medalCounts[r.coffee_id] = { first: 0, second: 0, third: 0, total: 0 };
                rankPoints[r.coffee_id] = 0;
              }
              
              if (r.rank === 1) {
                medalCounts[r.coffee_id].first += 1;
                rankPoints[r.coffee_id] += 3;
              } else if (r.rank === 2) {
                medalCounts[r.coffee_id].second += 1;
                rankPoints[r.coffee_id] += 2;
              } else if (r.rank === 3) {
                medalCounts[r.coffee_id].third += 1;
                rankPoints[r.coffee_id] += 1;
              }
              medalCounts[r.coffee_id].total += 1;
            });
            
            // Calculate weighted scores
            const weightedScores = {};
            coffees.forEach(c => {
              if (medalCounts[c.id]) {
                const totalReviews = allReviews.filter(r => r.coffee_id === c.id).length;
                weightedScores[c.id] = totalReviews > 0 ? 
                  (rankPoints[c.id] / totalReviews).toFixed(2) : 0;
              } else {
                weightedScores[c.id] = 0;
              }
            });
            
            // Sort coffees by weighted score
            const sortedCoffees = [...coffees].sort((a, b) => {
              // First by medal count
              if ((medalCounts[b.id]?.first || 0) !== (medalCounts[a.id]?.first || 0)) {
                return (medalCounts[b.id]?.first || 0) - (medalCounts[a.id]?.first || 0);
              }
              // Then by weighted score
              return weightedScores[b.id] - weightedScores[a.id];
            });
            
            const medals = ['🥇', '🥈', '🥉'];
            const userRanks = {};
            userReviews.forEach(r => { userRanks[r.coffee_id] = r.rank; });
            
            return (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ ...thStyle, textAlign: 'left' }}>Coffee</th>
                    <th style={thStyle}>🥇</th>
                    <th style={thStyle}>🥈</th>
                    <th style={thStyle}>🥉</th>
                    <th style={thStyle}>Score</th>
                    <th style={thStyle}>Your Rank</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedCoffees.map((c, idx) => {
                    const isUser = userRanks[c.id] !== undefined;
                    const medal = idx < 3 ? medals[idx] : '';
                    const count = medalCounts[c.id] || { first: 0, second: 0, third: 0 };
                    
                    return (
                      <tr key={c.id} style={{ 
                        background: isUser ? '#fffbe7' : idx % 2 === 0 ? '#f7ecd7' : '#fff', 
                        fontWeight: isUser ? 'bold' : 'normal', 
                        border: isUser ? '2px solid #b91c1c' : undefined 
                      }}>
                        <td style={{ ...tdStyle, display: 'flex', alignItems: 'center', gap: 8 }}>
                          {medal && <span style={{ fontSize: 20 }}>{medal}</span>}
                          {c.name}
                        </td>
                        <td style={{ ...tdStyle, textAlign: 'center' }}>{count.first || 0}</td>
                        <td style={{ ...tdStyle, textAlign: 'center' }}>{count.second || 0}</td>
                        <td style={{ ...tdStyle, textAlign: 'center' }}>{count.third || 0}</td>
                        <td style={{ ...tdStyle, textAlign: 'center', fontWeight: 'bold' }}>{weightedScores[c.id]}</td>
                        <td style={{ 
                          ...tdStyle, 
                          color: isUser ? '#b91c1c' : '#3a2a0c',
                          textAlign: 'center',
                          fontWeight: isUser ? 'bold' : 'normal'
                        }}>
                          {isUser ? userRanks[c.id] : ''}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            );
          })()}
          <div style={{ marginTop: 12, color: '#6b4f1d', fontStyle: 'italic' }}>
            Score is calculated as 3 points for 1st place, 2 points for 2nd place, and 1 point for 3rd place, averaged per review.
          </div>
          <div style={{ marginTop: 8, color: '#6b4f1d', fontWeight: 'bold' }}>
            {Object.values(userRanks).length > 0 ? 'Your rankings are highlighted.' : 'You did not rank any coffees.'}
          </div>
        </div>
        <h2 style={{ color: '#6b4f1d', fontSize: 22, marginTop: 40 }}>Flavor Notes by Coffee</h2>
        {selectedCoffeeId && (
          <div style={{ width: '100%', maxWidth: 700, background: '#fff', borderRadius: 8, padding: 16, marginBottom: 32 }}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ color: '#6b4f1d', fontWeight: 'bold', marginRight: 12 }}>Select coffee:</label>
              <select value={selectedCoffeeId} onChange={e => setSelectedCoffeeId(e.target.value)} style={{ padding: '0.5rem', borderRadius: 8, border: '1px solid #e0cba8', fontSize: '1rem', color: '#6b4f1d', background: '#fffbe7' }}>
                {coffees.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            {(() => {
              const selectedCoffee = coffees.find(c => c.id === selectedCoffeeId);
              const allTastingsForCoffee = tastings.filter(t => t.coffee_id === selectedCoffeeId);
              const flavorCounts = {};
              allTastingsForCoffee.forEach(t => (t.flavor_tags || []).forEach(tag => { flavorCounts[tag] = (flavorCounts[tag] || 0) + 1; }));
              const sortedFlavors = Object.entries(flavorCounts).sort((a, b) => b[1] - a[1]);
              const yourTasting = tastings.find(t => t.coffee_id === selectedCoffeeId);
              const yourTags = (yourTasting && yourTasting.flavor_tags) || [];
              return (
                <>
                  <Bar
                    data={{
                      labels: sortedFlavors.map(([tag]) => tag),
                      datasets: [
                        {
                          label: 'Count',
                          data: sortedFlavors.map(([_, count]) => count),
                          backgroundColor: sortedFlavors.map(([tag]) => yourTags.includes(tag) ? '#15803d' : '#b91c1c'),
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: { display: false },
                        title: { display: false }
                      },
                      scales: {
                        x: { ticks: { color: '#6b4f1d', font: { weight: 'bold' } } },
                        y: { beginAtZero: true, ticks: { color: '#6b4f1d' } }
                      }
                    }}
                  />
                  <div style={{ marginTop: 16, color: '#6b4f1d', fontWeight: 'bold' }}>
                    Your tags for this coffee: {yourTags.length ? yourTags.join(', ') : <span style={{ color: '#b91c1c' }}>None</span>}
                  </div>
                </>
              );
            })()}
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