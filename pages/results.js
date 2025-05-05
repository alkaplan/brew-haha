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
      const storedName = typeof window !== 'undefined' ? localStorage.getItem('coffeeHouseName') : '';
      if (storedName) setName(storedName);
      if (!userId) {
        router.push('/');
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

  if (loading) {
    return (
      <>
        <Header />
        <div style={{ minHeight: '100vh', background: '#fffbe7', padding: '2rem', paddingTop: '5rem', fontFamily: 'sans-serif', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ fontSize: 18, color: '#6b4f1d' }}>Loading your results...</div>
        </div>
      </>
    );
  }

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
      <div style={{ 
        minHeight: '100vh', 
        background: '#fffbe7', 
        padding: '2rem', 
        paddingTop: '5rem', 
        fontFamily: 'sans-serif', 
        width: '100%', 
        maxWidth: '100%', 
        margin: 0, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center' 
      }}>
        <div style={{ 
          maxWidth: 800, 
          width: '100%',
          background: '#fff', 
          borderRadius: 16, 
          padding: 32, 
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          marginBottom: 32,
          textAlign: 'center'
        }}>
          <h1 style={{ color: '#6b4f1d', marginBottom: 24, fontSize: 28 }}>Your Coffee Results</h1>
          <div style={{ 
            color: '#6b4f1d', 
            fontSize: 18, 
            background: '#f7ecd7', 
            borderRadius: 12, 
            padding: '16px 24px', 
            display: 'inline-block',
            marginBottom: 32
          }}>
            You tasted <span style={{ color: '#b91c1c', fontWeight: 'bold' }}>{tastedCoffees.length}</span> coffee{tastedCoffees.length === 1 ? '' : 's'}!
          </div>
          
          <h2 style={{ 
            color: '#6b4f1d', 
            fontSize: 22, 
            marginTop: 24, 
            marginBottom: 24, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: 8 
          }}>
            <span style={{ fontSize: 24 }}>🏆</span> Coffee Medal Table
          </h2>
          
          <div style={{ 
            width: '100%', 
            background: '#f7ecd7', 
            borderRadius: 12, 
            padding: 16, 
            marginBottom: 32,
            overflowX: 'auto'
          }}>
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
                <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, overflow: 'hidden' }}>
                  <thead>
                    <tr>
                      <th style={{ ...thStyle, textAlign: 'left', borderTopLeftRadius: 8 }}>Coffee</th>
                      <th style={thStyle}>🥇</th>
                      <th style={thStyle}>🥈</th>
                      <th style={thStyle}>🥉</th>
                      <th style={thStyle}>Score</th>
                      <th style={{ ...thStyle, borderTopRightRadius: 8 }}>Your Rank</th>
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
          </div>
        </div>
        
        <div style={{ 
          maxWidth: 800, 
          width: '100%',
          background: '#fff', 
          borderRadius: 16, 
          padding: 32, 
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          marginBottom: 32
        }}>
          <h2 style={{ 
            color: '#6b4f1d', 
            fontSize: 22, 
            marginBottom: 24, 
            textAlign: 'center', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: 8 
          }}>
            <span style={{ fontSize: 24 }}>🧪</span> Your Tasting Notes
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {tastedCoffees.map(coffee => {
              const t = tastings.find(t => t.coffee_id === coffee.id);
              const officialTags = coffee.tags || [];
              const userTags = (t.flavor_tags || []);
              // Tag comparison
              const correct = userTags.filter(tag => officialTags.includes(tag));
              const missed = officialTags.filter(tag => !userTags.includes(tag));
              const extra = userTags.filter(tag => !officialTags.includes(tag));
              
              // Calculate user rank for this coffee
              const userRank = userReviews.find(r => r.coffee_id === coffee.id)?.rank;
              const rankDisplay = userRank ? `#${userRank}` : '-';
              
              return (
                <div key={coffee.id} style={{ 
                  background: '#f7ecd7', 
                  borderRadius: 12, 
                  overflow: 'hidden'
                }}>
                  <div style={{ 
                    background: '#e0cba8', 
                    padding: '12px 16px', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center'
                  }}>
                    <div style={{ fontWeight: 'bold', fontSize: 18, color: '#6b4f1d' }}>{coffee.name}</div>
                    {userRank && (
                      <div style={{ 
                        background: '#6b4f1d', 
                        color: '#fff', 
                        borderRadius: '50%', 
                        width: 32, 
                        height: 32, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        fontWeight: 'bold',
                        fontSize: 14
                      }}>
                        #{userRank}
                      </div>
                    )}
                  </div>
                  
                  <div style={{ padding: 20 }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, marginBottom: 16 }}>
                      <div style={{ flex: 1, minWidth: 200 }}>
                        <h3 style={{ color: '#6b4f1d', fontSize: 16, marginBottom: 12 }}>Your Notes</h3>
                        <div style={{ 
                          background: '#fff',
                          borderRadius: 8,
                          padding: 16,
                          color: '#6b4f1d'
                        }}>
                          <div style={{ marginBottom: 8 }}>
                            <strong>Tags:</strong> {userTags.length ? userTags.join(', ') : <span style={{ color: '#b91c1c', fontStyle: 'italic' }}>None provided</span>}
                          </div>
                          <div style={{ marginBottom: 8 }}>
                            <strong>Reaction:</strong> {t.emoji || <span style={{ color: '#b91c1c', fontStyle: 'italic' }}>None provided</span>}
                          </div>
                          <div>
                            <strong>Notes:</strong> {t.note || <span style={{ color: '#b91c1c', fontStyle: 'italic' }}>None provided</span>}
                          </div>
                        </div>
                      </div>

                      <div style={{ flex: 1, minWidth: 200 }}>
                        <h3 style={{ color: '#6b4f1d', fontSize: 16, marginBottom: 12 }}>Official Notes</h3>
                        <div style={{ 
                          background: '#fff',
                          borderRadius: 8,
                          padding: 16,
                          color: '#6b4f1d'
                        }}>
                          <div style={{ marginBottom: officialTags.length > 0 ? 8 : 0 }}>
                            <strong>Notes:</strong> {coffee.panel_notes || <span style={{ color: '#b91c1c', fontStyle: 'italic' }}>None available</span>}
                          </div>
                          {officialTags.length > 0 && (
                            <div>
                              <strong>Tags:</strong> {officialTags.join(', ')}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Tag comparison visualization */}
                    <h3 style={{ color: '#6b4f1d', fontSize: 16, marginBottom: 12 }}>Flavor Match</h3>
                    <div style={{ 
                      background: '#fff',
                      borderRadius: 8,
                      padding: 16
                    }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {officialTags.map(tag => (
                          <span key={tag} style={{
                            background: userTags.includes(tag) ? '#15803d' : '#e0cba8',
                            color: userTags.includes(tag) ? '#fff' : '#6b4f1d',
                            borderRadius: 16,
                            padding: '6px 12px',
                            fontWeight: 'bold',
                            fontSize: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4
                          }}>
                            {tag} {userTags.includes(tag) && <span>✓</span>}
                          </span>
                        ))}
                        
                        {extra.length > 0 && extra.map(tag => (
                          <span key={tag} style={{
                            background: '#fef2f2',
                            color: '#b91c1c',
                            borderRadius: 16,
                            padding: '6px 12px',
                            fontWeight: 'bold',
                            fontSize: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            border: '1px solid #fecaca'
                          }}>
                            {tag} <span>+</span>
                          </span>
                        ))}
                      </div>
                      
                      {correct.length > 0 ? (
                        <div style={{ marginTop: 12, color: '#15803d', fontWeight: 'bold' }}>
                          You correctly identified {correct.length} flavor{correct.length > 1 ? 's' : ''}!
                        </div>
                      ) : (
                        <div style={{ marginTop: 12, color: '#b91c1c', fontWeight: 'bold' }}>
                          You got 0 flavor notes right. Keep practicing!
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        <a href="/" style={{ marginBottom: 40 }}>
          <button style={{
            padding: '16px 32px',
            fontSize: '16px',
            background: '#6b4f1d',
            color: '#fffbe7',
            border: 'none',
            borderRadius: '12px',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            <span>←</span> Return to Homepage
          </button>
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