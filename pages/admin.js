import { useState, useEffect } from 'react';
import Header from './Header';
import { getCoffees, updateCoffee, getAllTastings, getAllReviews, getAllUsers, deleteCoffee, deleteUser } from '../lib/dataSupabase';
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

export default function Admin() {
  const [tab, setTab] = useState('config');
  const [coffees, setCoffees] = useState([]);
  const [users, setUsers] = useState([]);
  const [tastings, setTastings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [editingCoffee, setEditingCoffee] = useState(null);
  const [editFields, setEditFields] = useState({ name: '', description: '', tags: '' });
  const [loading, setLoading] = useState(true);
  const [saveMsg, setSaveMsg] = useState('');

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
      tags: (coffee.tags || []).join(', ')
    });
  };

  const handleEditFieldChange = (field, value) => {
    setEditFields(f => ({ ...f, [field]: value }));
  };

  const handleSaveCoffee = async (id) => {
    const tagsArr = editFields.tags.split(',').map(t => t.trim()).filter(Boolean);
    const { error } = await updateCoffee({
      id,
      name: editFields.name,
      description: editFields.description,
      tags: tagsArr
    });
    if (!error) {
      setCoffees(coffees.map(c => c.id === id ? { ...c, ...editFields, tags: tagsArr } : c));
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

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    const { error } = await deleteUser(id);
    if (!error) {
      setUsers(users.filter(u => u.id !== id));
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
          <button onClick={() => setTab('results')} style={tab === 'results' ? tabActiveStyle : tabStyle}>Results</button>
        </div>
        {tab === 'config' && (
          <div>
            <h2 style={{ color: '#6b4f1d' }}>Coffees</h2>
            <table style={{ width: '100%', maxWidth: 800, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #0001', marginBottom: 24 }}>
              <thead>
                <tr style={{ background: '#e0cba8', color: '#6b4f1d' }}>
                  <th style={thStyle}>ID</th>
                  <th style={thStyle}>Name</th>
                  <th style={thStyle}>Description</th>
                  <th style={thStyle}>Tags</th>
                  <th style={thStyle}></th>
                </tr>
              </thead>
              <tbody>
                {coffees.map((c, idx) => (
                  <tr key={c.id} style={{ background: idx % 2 === 0 ? '#f7ecd7' : '#fff' }}>
                    <td style={tdStyle}>{c.id}</td>
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
                        <input value={editFields.tags} onChange={e => handleEditFieldChange('tags', e.target.value)} style={inputStyle} />
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
            {saveMsg && <div style={{ color: 'green', marginBottom: 16 }}>{saveMsg}</div>}
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