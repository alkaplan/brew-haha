import { useState, useEffect } from 'react';
import Header from './Header';
import { getCoffees, updateCoffee, getAllTastings, getAllReviews, getAllUsers, deleteCoffee, deleteUserData, updateTasting, deleteTasting, updateReview, deleteReview } from '../lib/dataSupabase';
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

const flavorTags = [
  'fruity', 'nutty', 'chocolate', 'floral', 'spicy', 'earthy', 'citrus', 'caramel', 'herbal', 'smoky', 'bright', 'bold'
];

export default function Admin() {
  const [tab, setTab] = useState('config');
  const [coffees, setCoffees] = useState([]);
  const [users, setUsers] = useState([]);
  const [tastings, setTastings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [editingCoffee, setEditingCoffee] = useState(null);
  const [editFields, setEditFields] = useState({ name: '', description: '', tags: [] });
  const [loading, setLoading] = useState(true);
  const [saveMsg, setSaveMsg] = useState('');
  const [editingTasting, setEditingTasting] = useState(null);
  const [editTastingFields, setEditTastingFields] = useState({ flavor_tags: '', emoji: '', note: '' });
  const [editingReview, setEditingReview] = useState(null);
  const [editReviewFields, setEditReviewFields] = useState({ rank: '' });

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const [coffeesData, usersData, tastingsData, reviewsData] = await Promise.all([
        getCoffees(),
        getAllUsers(),
        getAllTastings(),
        getAllReviews()
      ]);
      setCoffees(coffeesData);
      setUsers(usersData);
      setTastings(tastingsData);
      setReviews(reviewsData);
      setLoading(false);
    }
    fetchData();
  }, []);

  const handleEditCoffee = (coffee) => {
    setEditingCoffee(coffee.id);
    setEditFields({
      name: coffee.name,
      description: coffee.description,
      tags: coffee.tags || []
    });
  };

  const handleEditFieldChange = (field, value) => {
    setEditFields(f => ({ ...f, [field]: value }));
  };

  const handleTagChange = (tag) => {
    setEditFields(f => ({
      ...f,
      tags: f.tags.includes(tag) 
        ? f.tags.filter(t => t !== tag)
        : [...f.tags, tag]
    }));
  };

  const handleSaveCoffee = async (id) => {
    const { error } = await updateCoffee({
      id,
      name: editFields.name,
      description: editFields.description,
      tags: editFields.tags
    });
    if (!error) {
      setCoffees(coffees.map(c => c.id === id ? { ...c, ...editFields } : c));
      setEditingCoffee(null);
      setSaveMsg('Saved!');
      setTimeout(() => setSaveMsg(''), 1200);
    }
  };

  const handleDeleteCoffee = async (id) => {
    if (!window.confirm('Are you sure you want to delete this coffee?')) return;
    const { error } = await deleteCoffee(id);
    if (!error) {
      setCoffees(coffees.filter(c => c.id !== id));
    }
  };

  const handleEditTasting = (t) => {
    setEditingTasting(t.id);
    setEditTastingFields({
      flavor_tags: (t.flavor_tags || []).join(', '),
      emoji: t.emoji || '',
      note: t.note || ''
    });
  };

  const handleEditTastingFieldChange = (field, value) => {
    setEditTastingFields(f => ({ ...f, [field]: value }));
  };

  const handleSaveTasting = async (id) => {
    const flavorArr = editTastingFields.flavor_tags.split(',').map(t => t.trim()).filter(Boolean);
    const { error } = await updateTasting({
      id,
      flavor_tags: flavorArr,
      emoji: editTastingFields.emoji,
      note: editTastingFields.note
    });
    if (!error) {
      setTastings(tastings.map(t => t.id === id ? { ...t, flavor_tags: flavorArr, emoji: editTastingFields.emoji, note: editTastingFields.note } : t));
      setEditingTasting(null);
    }
  };

  const handleDeleteTasting = async (id) => {
    if (!window.confirm('Delete this tasting?')) return;
    const { error } = await deleteTasting(id);
    if (!error) {
      setTastings(tastings.filter(t => t.id !== id));
    }
  };

  const handleEditReview = (r) => {
    setEditingReview(r.id);
    setEditReviewFields({ rank: r.rank });
  };

  const handleEditReviewFieldChange = (field, value) => {
    setEditReviewFields(f => ({ ...f, [field]: value }));
  };

  const handleSaveReview = async (id) => {
    const { error } = await updateReview({ id, rank: Number(editReviewFields.rank) });
    if (!error) {
      setReviews(reviews.map(r => r.id === id ? { ...r, rank: Number(editReviewFields.rank) } : r));
      setEditingReview(null);
    }
  };

  const handleDeleteReview = async (id) => {
    if (!window.confirm('Delete this review?')) return;
    const { error } = await deleteReview(id);
    if (!error) {
      setReviews(reviews.filter(r => r.id !== id));
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user and all their data?')) return;
    const { error } = await deleteUserData(id);
    if (!error) {
      setUsers(users.filter(u => u.id !== id));
      setTastings(tastings.filter(t => t.user_id !== id));
      setReviews(reviews.filter(r => r.user_id !== id));
    }
  };

  // Metrics
  const coffeeReviewCounts = coffees.map(c => ({
    ...c,
    reviewCount: reviews.filter(r => r.coffee_id === c.id).length,
    avgRank: (() => {
      const ranks = reviews.filter(r => r.coffee_id === c.id).map(r => r.rank);
      return ranks.length ? (ranks.reduce((a, b) => a + b, 0) / ranks.length).toFixed(2) : '-';
    })()
  }));
  const flavorCounts = {};
  tastings.forEach(t => (t.flavor_tags || []).forEach(tag => { flavorCounts[tag] = (flavorCounts[tag] || 0) + 1; }));
  const topFlavors = Object.entries(flavorCounts).sort((a, b) => b[1] - a[1]);

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>;

  return (
    <>
      <Header />
      <div style={{ minHeight: '100vh', background: '#fffbe7', padding: '2rem', paddingTop: '5rem', fontFamily: 'sans-serif' }}>
        <h1 style={{ color: '#6b4f1d', marginBottom: 24 }}>Admin</h1>
        <div style={{ display: 'flex', gap: 16, marginBottom: 32 }}>
          <button onClick={() => setTab('config')} style={tab === 'config' ? tabActiveStyle : tabStyle}>Coffee Config</button>
          <button onClick={() => setTab('users')} style={tab === 'users' ? tabActiveStyle : tabStyle}>Users</button>
          <button onClick={() => setTab('tastings')} style={tab === 'tastings' ? tabActiveStyle : tabStyle}>Tastings</button>
          <button onClick={() => setTab('reviews')} style={tab === 'reviews' ? tabActiveStyle : tabStyle}>Reviews</button>
          <button onClick={() => setTab('results')} style={tab === 'results' ? tabActiveStyle : tabStyle}>Results</button>
        </div>
        {tab === 'config' && (
          <div>
            <h2 style={{ color: '#6b4f1d' }}>Coffee Config</h2>
            <table style={{ width: '100%', maxWidth: 900, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #0001', marginBottom: 24 }}>
              <thead>
                <tr>
                  <th style={thStyle}>Name</th>
                  <th style={thStyle}>Description</th>
                  <th style={thStyle}>Tags</th>
                  <th style={thStyle}></th>
                </tr>
              </thead>
              <tbody>
                {coffees.map((c, idx) => (
                  <tr key={c.id} style={{ background: idx % 2 === 0 ? '#f7ecd7' : '#fff' }}>
                    <td style={tdStyle}>
                      {editingCoffee === c.id ? (
                        <input value={editFields.name} onChange={e => handleEditFieldChange('name', e.target.value)} style={inputStyle} />
                      ) : c.name}
                    </td>
                    <td style={tdStyle}>
                      {editingCoffee === c.id ? (
                        <input value={editFields.description} onChange={e => handleEditFieldChange('description', e.target.value)} style={inputStyle} />
                      ) : c.description}
                    </td>
                    <td style={tdStyle}>
                      {editingCoffee === c.id ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                          {flavorTags.map(tag => (
                            <button
                              key={tag}
                              onClick={() => handleTagChange(tag)}
                              style={{
                                background: editFields.tags.includes(tag) ? '#6b4f1d' : '#e0cba8',
                                color: editFields.tags.includes(tag) ? '#fffbe7' : '#6b4f1d',
                                border: 'none',
                                borderRadius: 16,
                                padding: '0.5rem 1rem',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                fontSize: '0.9rem'
                              }}
                            >
                              {tag}
                            </button>
                          ))}
                        </div>
                      ) : (c.tags || []).join(', ')}
                    </td>
                    <td style={tdStyle}>
                      {editingCoffee === c.id ? (
                        <>
                          <button onClick={() => handleSaveCoffee(c.id)} style={saveBtnStyle}>Save</button>
                          <button onClick={() => setEditingCoffee(null)} style={cancelBtnStyle}>Cancel</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => handleEditCoffee(c)} style={editBtnStyle}>Edit</button>
                          <button onClick={() => handleDeleteCoffee(c.id)} style={{ ...editBtnStyle, background: '#fffbe7', color: '#b91c1c', border: '1px solid #b91c1c', marginLeft: 8 }}>Delete</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {saveMsg && <div style={{ color: 'green', textAlign: 'center', marginTop: 16 }}>{saveMsg}</div>}
          </div>
        )}
        {tab === 'users' && (
          <div>
            <h2 style={{ color: '#6b4f1d' }}>Users</h2>
            <table style={{ width: '100%', maxWidth: 600, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #0001', marginBottom: 24 }}>
              <thead>
                <tr style={{ background: '#e0cba8', color: '#6b4f1d' }}>
                  <th style={thStyle}>Name</th>
                  <th style={thStyle}>Created At</th>
                  <th style={thStyle}></th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, idx) => (
                  <tr key={u.id} style={{ background: idx % 2 === 0 ? '#f7ecd7' : '#fff' }}>
                    <td style={tdStyle}>{u.name}</td>
                    <td style={tdStyle}>{u.created_at ? new Date(u.created_at).toLocaleString() : ''}</td>
                    <td style={tdStyle}>
                      <button onClick={() => handleDeleteUser(u.id)} style={{ ...editBtnStyle, background: '#fffbe7', color: '#b91c1c', border: '1px solid #b91c1c' }}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {tab === 'tastings' && (
          <div>
            <h2 style={{ color: '#6b4f1d' }}>Tastings</h2>
            <table style={{ width: '100%', maxWidth: 900, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #0001', marginBottom: 24 }}>
              <thead>
                <tr>
                  <th style={thStyle}>User</th>
                  <th style={thStyle}>Coffee</th>
                  <th style={thStyle}>Flavor Tags</th>
                  <th style={thStyle}>Emoji</th>
                  <th style={thStyle}>Note</th>
                  <th style={thStyle}></th>
                </tr>
              </thead>
              <tbody>
                {tastings.map((t, idx) => (
                  <tr key={t.id} style={{ background: idx % 2 === 0 ? '#f7ecd7' : '#fff' }}>
                    <td style={tdStyle}>{users.find(u => u.id === t.user_id)?.name || t.user_id}</td>
                    <td style={tdStyle}>{coffees.find(c => c.id === t.coffee_id)?.name || t.coffee_id}</td>
                    <td style={tdStyle}>
                      {editingTasting === t.id ? (
                        <input value={editTastingFields.flavor_tags} onChange={e => handleEditTastingFieldChange('flavor_tags', e.target.value)} style={inputStyle} />
                      ) : (t.flavor_tags || []).join(', ')}
                    </td>
                    <td style={tdStyle}>
                      {editingTasting === t.id ? (
                        <input value={editTastingFields.emoji} onChange={e => handleEditTastingFieldChange('emoji', e.target.value)} style={inputStyle} />
                      ) : t.emoji}
                    </td>
                    <td style={tdStyle}>
                      {editingTasting === t.id ? (
                        <input value={editTastingFields.note} onChange={e => handleEditTastingFieldChange('note', e.target.value)} style={inputStyle} />
                      ) : t.note}
                    </td>
                    <td style={tdStyle}>
                      {editingTasting === t.id ? (
                        <>
                          <button onClick={() => handleSaveTasting(t.id)} style={saveBtnStyle}>Save</button>
                          <button onClick={() => setEditingTasting(null)} style={cancelBtnStyle}>Cancel</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => handleEditTasting(t)} style={editBtnStyle}>Edit</button>
                          <button onClick={() => handleDeleteTasting(t.id)} style={{ ...editBtnStyle, background: '#fffbe7', color: '#b91c1c', border: '1px solid #b91c1c', marginLeft: 8 }}>Delete</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {tab === 'reviews' && (
          <div>
            <h2 style={{ color: '#6b4f1d' }}>Reviews</h2>
            <table style={{ width: '100%', maxWidth: 900, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #0001', marginBottom: 24 }}>
              <thead>
                <tr>
                  <th style={thStyle}>User</th>
                  <th style={thStyle}>Coffee</th>
                  <th style={thStyle}>Rank</th>
                  <th style={thStyle}></th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((r, idx) => (
                  <tr key={r.id} style={{ background: idx % 2 === 0 ? '#f7ecd7' : '#fff' }}>
                    <td style={tdStyle}>{users.find(u => u.id === r.user_id)?.name || r.user_id}</td>
                    <td style={tdStyle}>{coffees.find(c => c.id === r.coffee_id)?.name || r.coffee_id}</td>
                    <td style={tdStyle}>
                      {editingReview === r.id ? (
                        <input value={editReviewFields.rank} onChange={e => handleEditReviewFieldChange('rank', e.target.value)} style={inputStyle} type="number" min={1} />
                      ) : r.rank}
                    </td>
                    <td style={tdStyle}>
                      {editingReview === r.id ? (
                        <>
                          <button onClick={() => handleSaveReview(r.id)} style={saveBtnStyle}>Save</button>
                          <button onClick={() => setEditingReview(null)} style={cancelBtnStyle}>Cancel</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => handleEditReview(r)} style={editBtnStyle}>Edit</button>
                          <button onClick={() => handleDeleteReview(r.id)} style={{ ...editBtnStyle, background: '#fffbe7', color: '#b91c1c', border: '1px solid #b91c1c', marginLeft: 8 }}>Delete</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {tab === 'results' && (
          <div>
            <h2 style={{ color: '#6b4f1d' }}>Results</h2>
            <h3 style={{ color: '#6b4f1d' }}>Top-Rated Coffees</h3>
            <div style={{ maxWidth: 600, margin: '0 auto 32px auto', background: '#fff', borderRadius: 8, padding: 16 }}>
              <Bar
                data={{
                  labels: coffeeReviewCounts.map(c => c.name),
                  datasets: [
                    {
                      label: '# Reviews',
                      data: coffeeReviewCounts.map(c => c.reviewCount),
                      backgroundColor: '#6b4f1d',
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
            </div>
            <h3 style={{ color: '#6b4f1d' }}>Most Selected Flavors</h3>
            <div style={{ maxWidth: 600, margin: '0 auto 32px auto', background: '#fff', borderRadius: 8, padding: 16 }}>
              <Bar
                data={{
                  labels: topFlavors.map(([tag]) => tag),
                  datasets: [
                    {
                      label: 'Count',
                      data: topFlavors.map(([_, count]) => count),
                      backgroundColor: '#b91c1c',
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
            </div>
            <table style={{ width: '100%', maxWidth: 600, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #0001', marginBottom: 24 }}>
              <thead>
                <tr style={{ background: '#e0cba8', color: '#6b4f1d' }}>
                  <th style={thStyle}>Name</th>
                  <th style={thStyle}># Reviews</th>
                  <th style={thStyle}>Avg. Rank</th>
                </tr>
              </thead>
              <tbody>
                {coffeeReviewCounts.map((c, idx) => (
                  <tr key={c.id} style={{ background: idx % 2 === 0 ? '#f7ecd7' : '#fff' }}>
                    <td style={tdStyle}>{c.name}</td>
                    <td style={tdStyle}>{c.reviewCount}</td>
                    <td style={tdStyle}>{c.avgRank}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button style={exportBtnStyle} onClick={() => {
              const data = { coffees, users, tastings, reviews };
              const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'brewhaha-data.json';
              a.click();
            }}>Export JSON</button>
          </div>
        )}
      </div>
    </>
  );
}

const thStyle = { padding: 8, fontWeight: 'bold', fontSize: 16, background: '#6b4f1d', color: '#fffbe7', borderBottom: '2px solid #e0cba8' };
const tdStyle = { padding: 8, fontSize: 15, color: '#3a2a0c', background: '#fff', borderBottom: '1px solid #e0cba8' };
const inputStyle = { padding: 6, fontSize: 15, borderRadius: 4, border: '1px solid #e0cba8', width: '100%' };
const tabStyle = { background: '#e0cba8', color: '#6b4f1d', border: 'none', borderRadius: 8, padding: '0.7rem 1.5rem', fontWeight: 'bold', cursor: 'pointer' };
const tabActiveStyle = { ...tabStyle, background: '#6b4f1d', color: '#fffbe7' };
const editBtnStyle = { background: '#e0cba8', color: '#6b4f1d', border: 'none', borderRadius: 4, padding: '0.4rem 1rem', fontWeight: 'bold', cursor: 'pointer' };
const saveBtnStyle = { background: '#6b4f1d', color: '#fffbe7', border: 'none', borderRadius: 4, padding: '0.4rem 1rem', fontWeight: 'bold', cursor: 'pointer', marginRight: 8 };
const cancelBtnStyle = { background: '#fffbe7', color: '#6b4f1d', border: '1px solid #e0cba8', borderRadius: 4, padding: '0.4rem 1rem', fontWeight: 'bold', cursor: 'pointer' };
const exportBtnStyle = { background: '#6b4f1d', color: '#fffbe7', border: 'none', borderRadius: 8, padding: '0.8rem 2rem', fontWeight: 'bold', fontSize: 16, marginTop: 24, cursor: 'pointer' }; 