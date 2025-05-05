import { useState, useEffect } from 'react';
import Header from './Header';
import { getCoffees, updateCoffee, getAllTastings, getAllReviews, getAllUsers, deleteCoffee, deleteUserData, updateTasting, deleteTasting, updateReview, deleteReview, getFlavorTags, addFlavorTag, updateFlavorTag, deleteFlavorTag, getPastries, addPastry, updatePastry, deletePastry, getAllPastryFeedback } from '../lib/dataSupabase';
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
  const [flavorTags, setFlavorTags] = useState([]);
  const [editingTag, setEditingTag] = useState(null);
  const [editTagFields, setEditTagFields] = useState({ name: '', description: '' });
  const [tagMsg, setTagMsg] = useState('');
  const [passwordEntered, setPasswordEntered] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [pastries, setPastries] = useState([]);
  const [pastryFeedback, setPastryFeedback] = useState([]);
  const [editingPastry, setEditingPastry] = useState(null);
  const [editPastryFields, setEditPastryFields] = useState({ name: '', description: '', image: '' });
  const [pastryMsg, setPastryMsg] = useState('');

  useEffect(() => {
    if (!passwordEntered) return;
    
    async function fetchData() {
      setLoading(true);
      const [coffeesData, usersData, tastingsData, reviewsData, tagsData, pastriesData, pastryFeedbackData] = await Promise.all([
        getCoffees(),
        getAllUsers(),
        getAllTastings(),
        getAllReviews(),
        getFlavorTags(),
        getPastries(),
        getAllPastryFeedback()
      ]);
      setCoffees(coffeesData);
      setUsers(usersData);
      setTastings(tastingsData);
      setReviews(reviewsData);
      setFlavorTags(tagsData);
      setPastries(pastriesData);
      setPastryFeedback(pastryFeedbackData);
      setLoading(false);
    }
    fetchData();
  }, [passwordEntered]);

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (password === 'shkelzen') {
      setPasswordEntered(true);
      setPasswordError(false);
    } else {
      setPasswordError(true);
    }
  };

  if (!passwordEntered) {
    return (
      <>
        <Header />
        <div style={{ minHeight: '100vh', background: '#fffbe7', padding: '2rem', paddingTop: '5rem', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ 
            maxWidth: 480, 
            background: '#fff', 
            borderRadius: 16, 
            padding: 32, 
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            width: '100%'
          }}>
            <h1 style={{ color: '#6b4f1d', marginBottom: 24, textAlign: 'center' }}>Admin Access</h1>
            <form onSubmit={handlePasswordSubmit} style={{ width: '100%' }}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, color: '#6b4f1d', fontWeight: 'bold' }}>
                  Password:
                </label>
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ 
                    width: '100%', 
                    padding: '1rem', 
                    borderRadius: 8, 
                    border: passwordError ? '2px solid #b91c1c' : '1px solid #e0cba8',
                    background: '#fffbe7',
                    color: '#000',
                    fontSize: '1rem',
                    boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)'
                  }}
                />
                {passwordError && (
                  <p style={{ color: '#b91c1c', marginTop: 8, fontSize: 14 }}>Incorrect password</p>
                )}
              </div>
              <button 
                type="submit" 
                style={{
                  width: '100%', 
                  padding: '1rem', 
                  background: '#6b4f1d', 
                  color: '#fffbe7', 
                  border: 'none', 
                  borderRadius: 8, 
                  fontWeight: 'bold', 
                  fontSize: '1rem',
                  cursor: 'pointer',
                  marginTop: 16,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  transition: 'all 0.2s ease'
                }}
              >
                Login
              </button>
            </form>
          </div>
        </div>
      </>
    );
  }

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

  const handleEditTag = (tag) => {
    setEditingTag(tag.id);
    setEditTagFields({ name: tag.name, description: tag.description || '' });
  };

  const handleEditTagFieldChange = (field, value) => {
    setEditTagFields(f => ({ ...f, [field]: value }));
  };

  const handleSaveTag = async (id) => {
    const { error, data } = await updateFlavorTag({ id, ...editTagFields });
    if (!error) {
      setFlavorTags(flavorTags.map(t => t.id === id ? data : t));
      setEditingTag(null);
      setTagMsg('Saved!');
      setTimeout(() => setTagMsg(''), 1200);
    }
  };

  const handleAddTag = async () => {
    if (!editTagFields.name.trim()) return;
    const { error, data } = await addFlavorTag(editTagFields);
    if (!error) {
      setFlavorTags([...flavorTags, data]);
      setEditTagFields({ name: '', description: '' });
      setTagMsg('Added!');
      setTimeout(() => setTagMsg(''), 1200);
    }
  };

  const handleDeleteTag = async (id) => {
    if (!window.confirm('Delete this flavor tag?')) return;
    const { error } = await deleteFlavorTag(id);
    if (!error) {
      setFlavorTags(flavorTags.filter(t => t.id !== id));
    }
  };

  const handleEditPastry = (pastry) => {
    setEditingPastry(pastry.id);
    setEditPastryFields({
      name: pastry.name,
      description: pastry.description || '',
      image: pastry.image || ''
    });
  };

  const handleEditPastryFieldChange = (field, value) => {
    setEditPastryFields(f => ({ ...f, [field]: value }));
  };

  const handleSavePastry = async (id) => {
    const { error } = await updatePastry({
      id,
      name: editPastryFields.name,
      description: editPastryFields.description,
      image: editPastryFields.image
    });
    if (!error) {
      setPastries(pastries.map(p => p.id === id ? { ...p, ...editPastryFields } : p));
      setEditingPastry(null);
      setPastryMsg('Saved!');
      setTimeout(() => setPastryMsg(''), 1200);
    }
  };

  const handleAddPastry = async () => {
    if (!editPastryFields.name.trim()) return;
    const { error, data } = await addPastry(editPastryFields);
    if (!error) {
      setPastries([...pastries, data]);
      setEditPastryFields({ name: '', description: '', image: '' });
      setPastryMsg('Added!');
      setTimeout(() => setPastryMsg(''), 1200);
    }
  };

  const handleDeletePastry = async (id) => {
    if (!window.confirm('Delete this pastry?')) return;
    const { error } = await deletePastry(id);
    if (!error) {
      setPastries(pastries.filter(p => p.id !== id));
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

  const menuTabs = () => (
    <div style={{ 
      display: 'flex', 
      borderBottom: '1px solid #e0cba8', 
      marginBottom: 24, 
      overflowX: 'auto',
      background: '#fff',
      borderTopLeftRadius: 8,
      borderTopRightRadius: 8,
      padding: '0 16px'
    }}>
      {['config', 'coffees', 'tastings', 'reviews', 'users', 'tags', 'pastries'].map(t => (
        <div
          key={t}
          onClick={() => setTab(t)}
          style={{
            padding: '16px 24px',
            cursor: 'pointer',
            fontWeight: tab === t ? 'bold' : 'normal',
            color: '#6b4f1d',
            borderBottom: tab === t ? '3px solid #6b4f1d' : '3px solid transparent',
            textTransform: 'capitalize',
            whiteSpace: 'nowrap',
            transition: 'all 0.2s ease'
          }}
        >
          {t}
        </div>
      ))}
    </div>
  );

  const renderPastryFeedback = () => {
    return (
      <div style={{ marginTop: 32 }}>
        <h2 style={{ color: '#6b4f1d', marginBottom: 16 }}>Pastry Feedback</h2>
        
        {pastryFeedback.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', borderRadius: 8, overflow: 'hidden' }}>
              <thead>
                <tr>
                  <th style={thStyle}>User</th>
                  <th style={thStyle}>Feedback</th>
                  <th style={thStyle}>Date</th>
                </tr>
              </thead>
              <tbody>
                {pastryFeedback.map(feedback => (
                  <tr key={feedback.id} style={{ background: '#fff' }}>
                    <td style={tdStyle}>{feedback.user_name || 'Anonymous'}</td>
                    <td style={tdStyle}>{feedback.feedback}</td>
                    <td style={tdStyle}>{new Date(feedback.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: 16, background: '#f7ecd7', borderRadius: 8, textAlign: 'center', color: '#6b4f1d' }}>
            No feedback submitted yet.
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <>
        <Header />
        <div style={{ minHeight: '100vh', background: '#fffbe7', padding: '2rem', paddingTop: '5rem', fontFamily: 'sans-serif', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ fontSize: 18, color: '#6b4f1d' }}>Loading admin dashboard...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div style={{ minHeight: '100vh', background: '#fffbe7', padding: '2rem', paddingTop: '5rem', fontFamily: 'sans-serif' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h1 style={{ color: '#6b4f1d', marginBottom: 24, fontSize: 28 }}>Admin Dashboard</h1>
          
          <div style={{ 
            background: '#fff', 
            borderRadius: 12, 
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)', 
            marginBottom: 32,
            overflow: 'hidden'
          }}>
            {menuTabs()}
            
            <div style={{ padding: 24 }}>
              {tab === 'config' && (
                <div>
                  <h2 style={{ color: '#6b4f1d', marginBottom: 16 }}>Website Configuration</h2>
                  <p style={{ color: '#6b4f1d', marginBottom: 24 }}>
                    Welcome to the admin dashboard. Use the tabs above to manage your coffee data.
                  </p>
                  
                  <div style={{ 
                    background: '#f7ecd7', 
                    padding: 20, 
                    borderRadius: 12,
                    marginBottom: 24
                  }}>
                    <h3 style={{ color: '#6b4f1d', marginBottom: 12 }}>Quick Stats</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                      <div style={{ 
                        flex: '1 0 200px', 
                        background: '#fff', 
                        padding: 16, 
                        borderRadius: 8,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                      }}>
                        <div style={{ color: '#6b4f1d', fontWeight: 'bold', marginBottom: 4 }}>Coffees</div>
                        <div style={{ fontSize: 24, color: '#6b4f1d' }}>{coffees.length}</div>
                      </div>
                      <div style={{ 
                        flex: '1 0 200px', 
                        background: '#fff', 
                        padding: 16, 
                        borderRadius: 8,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                      }}>
                        <div style={{ color: '#6b4f1d', fontWeight: 'bold', marginBottom: 4 }}>Users</div>
                        <div style={{ fontSize: 24, color: '#6b4f1d' }}>{users.length}</div>
                      </div>
                      <div style={{ 
                        flex: '1 0 200px', 
                        background: '#fff', 
                        padding: 16, 
                        borderRadius: 8,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                      }}>
                        <div style={{ color: '#6b4f1d', fontWeight: 'bold', marginBottom: 4 }}>Tastings</div>
                        <div style={{ fontSize: 24, color: '#6b4f1d' }}>{tastings.length}</div>
                      </div>
                      <div style={{ 
                        flex: '1 0 200px', 
                        background: '#fff', 
                        padding: 16, 
                        borderRadius: 8,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                      }}>
                        <div style={{ color: '#6b4f1d', fontWeight: 'bold', marginBottom: 4 }}>Reviews</div>
                        <div style={{ fontSize: 24, color: '#6b4f1d' }}>{reviews.length}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {tab === 'coffees' && (
                <div>
                  <h2 style={{ color: '#6b4f1d', marginBottom: 24 }}>Manage Coffees</h2>
                  
                  <div className="overflow-auto" style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, overflow: 'hidden' }}>
                      <thead>
                        <tr>
                          <th style={thStyle}>Name</th>
                          <th style={thStyle}>Description</th>
                          <th style={thStyle}>Tags</th>
                          <th style={thStyle}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {coffees.map(coffee => (
                          <tr key={coffee.id}>
                            <td style={tdStyle}>
                              {editingCoffee === coffee.id ? (
                                <input
                                  type="text"
                                  value={editFields.name}
                                  onChange={e => handleEditFieldChange('name', e.target.value)}
                                  style={{ 
                                    width: '100%', 
                                    padding: '0.5rem', 
                                    borderRadius: 4, 
                                    border: '1px solid #e0cba8',
                                    fontSize: '1rem'
                                  }}
                                />
                              ) : (
                                coffee.name
                              )}
                            </td>
                            <td style={tdStyle}>
                              {editingCoffee === coffee.id ? (
                                <textarea
                                  value={editFields.description}
                                  onChange={e => handleEditFieldChange('description', e.target.value)}
                                  rows={2}
                                  style={{ 
                                    width: '100%', 
                                    padding: '0.5rem', 
                                    borderRadius: 4, 
                                    border: '1px solid #e0cba8',
                                    fontSize: '1rem'
                                  }}
                                />
                              ) : (
                                coffee.description
                              )}
                            </td>
                            <td style={tdStyle}>
                              {editingCoffee === coffee.id ? (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                  {flavorTags.map(tag => (
                                    <label key={tag.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, cursor: 'pointer', padding: '4px 8px', borderRadius: 4, background: editFields.tags.includes(tag.name) ? '#f7ecd7' : 'transparent' }}>
                                      <input
                                        type="checkbox"
                                        checked={editFields.tags.includes(tag.name)}
                                        onChange={() => handleTagChange(tag.name)}
                                        style={{ marginRight: 4 }}
                                      />
                                      {tag.name}
                                    </label>
                                  ))}
                                </div>
                              ) : (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                  {(coffee.tags || []).map(tag => (
                                    <span key={tag} style={{ 
                                      background: '#e0cba8', 
                                      color: '#6b4f1d', 
                                      padding: '2px 8px', 
                                      borderRadius: 12,
                                      fontSize: 14
                                    }}>
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </td>
                            <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>
                              {editingCoffee === coffee.id ? (
                                <div style={{ display: 'flex', gap: 8 }}>
                                  <button 
                                    onClick={() => handleSaveCoffee(coffee.id)}
                                    style={{ 
                                      padding: '6px 12px', 
                                      background: '#15803d', 
                                      color: '#fff', 
                                      border: 'none', 
                                      borderRadius: 4, 
                                      cursor: 'pointer',
                                      fontSize: 14
                                    }}
                                  >
                                    Save
                                  </button>
                                  <button 
                                    onClick={() => setEditingCoffee(null)}
                                    style={{ 
                                      padding: '6px 12px', 
                                      background: '#e0cba8', 
                                      color: '#6b4f1d', 
                                      border: 'none', 
                                      borderRadius: 4, 
                                      cursor: 'pointer',
                                      fontSize: 14
                                    }}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <div style={{ display: 'flex', gap: 8 }}>
                                  <button 
                                    onClick={() => handleEditCoffee(coffee)}
                                    style={{ 
                                      padding: '6px 12px', 
                                      background: '#6b4f1d', 
                                      color: '#fff', 
                                      border: 'none', 
                                      borderRadius: 4, 
                                      cursor: 'pointer',
                                      fontSize: 14
                                    }}
                                  >
                                    Edit
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteCoffee(coffee.id)}
                                    style={{ 
                                      padding: '6px 12px', 
                                      background: '#b91c1c', 
                                      color: '#fff', 
                                      border: 'none', 
                                      borderRadius: 4, 
                                      cursor: 'pointer',
                                      fontSize: 14
                                    }}
                                  >
                                    Delete
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              
              {tab === 'tastings' && (
                <div>
                  <h2 style={{ color: '#6b4f1d', marginBottom: 24 }}>Manage Tastings</h2>
                  
                  <div className="overflow-auto" style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, overflow: 'hidden' }}>
                      <thead>
                        <tr>
                          <th style={thStyle}>User</th>
                          <th style={thStyle}>Coffee</th>
                          <th style={thStyle}>Flavor Tags</th>
                          <th style={thStyle}>Emoji</th>
                          <th style={thStyle}>Note</th>
                          <th style={thStyle}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tastings.map(tasting => (
                          <tr key={tasting.id}>
                            <td style={tdStyle}>{users.find(u => u.id === tasting.user_id)?.name || tasting.user_id}</td>
                            <td style={tdStyle}>{coffees.find(c => c.id === tasting.coffee_id)?.name || tasting.coffee_id}</td>
                            <td style={tdStyle}>
                              {editingTasting === tasting.id ? (
                                <input
                                  value={editTastingFields.flavor_tags}
                                  onChange={e => handleEditTastingFieldChange('flavor_tags', e.target.value)}
                                  style={{ 
                                    width: '100%', 
                                    padding: '0.5rem', 
                                    borderRadius: 4, 
                                    border: '1px solid #e0cba8',
                                    fontSize: '1rem'
                                  }}
                                />
                              ) : (tasting.flavor_tags || []).join(', ')}
                            </td>
                            <td style={tdStyle}>
                              {editingTasting === tasting.id ? (
                                <input
                                  value={editTastingFields.emoji}
                                  onChange={e => handleEditTastingFieldChange('emoji', e.target.value)}
                                  style={{ 
                                    width: '100%', 
                                    padding: '0.5rem', 
                                    borderRadius: 4, 
                                    border: '1px solid #e0cba8',
                                    fontSize: '1rem'
                                  }}
                                />
                              ) : tasting.emoji}
                            </td>
                            <td style={tdStyle}>
                              {editingTasting === tasting.id ? (
                                <input
                                  value={editTastingFields.note}
                                  onChange={e => handleEditTastingFieldChange('note', e.target.value)}
                                  style={{ 
                                    width: '100%', 
                                    padding: '0.5rem', 
                                    borderRadius: 4, 
                                    border: '1px solid #e0cba8',
                                    fontSize: '1rem'
                                  }}
                                />
                              ) : tasting.note}
                            </td>
                            <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>
                              {editingTasting === tasting.id ? (
                                <div style={{ display: 'flex', gap: 8 }}>
                                  <button 
                                    onClick={() => handleSaveTasting(tasting.id)}
                                    style={{ 
                                      padding: '6px 12px', 
                                      background: '#15803d', 
                                      color: '#fff', 
                                      border: 'none', 
                                      borderRadius: 4, 
                                      cursor: 'pointer',
                                      fontSize: 14
                                    }}
                                  >
                                    Save
                                  </button>
                                  <button 
                                    onClick={() => setEditingTasting(null)}
                                    style={{ 
                                      padding: '6px 12px', 
                                      background: '#e0cba8', 
                                      color: '#6b4f1d', 
                                      border: 'none', 
                                      borderRadius: 4, 
                                      cursor: 'pointer',
                                      fontSize: 14
                                    }}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <div style={{ display: 'flex', gap: 8 }}>
                                  <button 
                                    onClick={() => handleEditTasting(tasting)}
                                    style={{ 
                                      padding: '6px 12px', 
                                      background: '#6b4f1d', 
                                      color: '#fff', 
                                      border: 'none', 
                                      borderRadius: 4, 
                                      cursor: 'pointer',
                                      fontSize: 14
                                    }}
                                  >
                                    Edit
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteTasting(tasting.id)}
                                    style={{ 
                                      padding: '6px 12px', 
                                      background: '#b91c1c', 
                                      color: '#fff', 
                                      border: 'none', 
                                      borderRadius: 4, 
                                      cursor: 'pointer',
                                      fontSize: 14
                                    }}
                                  >
                                    Delete
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              
              {tab === 'reviews' && (
                <div>
                  <h2 style={{ color: '#6b4f1d', marginBottom: 24 }}>Manage Reviews</h2>
                  
                  <div className="overflow-auto" style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, overflow: 'hidden' }}>
                      <thead>
                        <tr>
                          <th style={thStyle}>User</th>
                          <th style={thStyle}>Coffee</th>
                          <th style={thStyle}>Rank</th>
                          <th style={thStyle}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reviews.map(review => (
                          <tr key={review.id}>
                            <td style={tdStyle}>{users.find(u => u.id === review.user_id)?.name || review.user_id}</td>
                            <td style={tdStyle}>{coffees.find(c => c.id === review.coffee_id)?.name || review.coffee_id}</td>
                            <td style={tdStyle}>
                              {editingReview === review.id ? (
                                <input
                                  type="number"
                                  value={editReviewFields.rank}
                                  onChange={e => handleEditReviewFieldChange('rank', e.target.value)}
                                  style={{ 
                                    width: '100%', 
                                    padding: '0.5rem', 
                                    borderRadius: 4, 
                                    border: '1px solid #e0cba8',
                                    fontSize: '1rem'
                                  }}
                                />
                              ) : review.rank}
                            </td>
                            <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>
                              {editingReview === review.id ? (
                                <div style={{ display: 'flex', gap: 8 }}>
                                  <button 
                                    onClick={() => handleSaveReview(review.id)}
                                    style={{ 
                                      padding: '6px 12px', 
                                      background: '#15803d', 
                                      color: '#fff', 
                                      border: 'none', 
                                      borderRadius: 4, 
                                      cursor: 'pointer',
                                      fontSize: 14
                                    }}
                                  >
                                    Save
                                  </button>
                                  <button 
                                    onClick={() => setEditingReview(null)}
                                    style={{ 
                                      padding: '6px 12px', 
                                      background: '#e0cba8', 
                                      color: '#6b4f1d', 
                                      border: 'none', 
                                      borderRadius: 4, 
                                      cursor: 'pointer',
                                      fontSize: 14
                                    }}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <div style={{ display: 'flex', gap: 8 }}>
                                  <button 
                                    onClick={() => handleEditReview(review)}
                                    style={{ 
                                      padding: '6px 12px', 
                                      background: '#6b4f1d', 
                                      color: '#fff', 
                                      border: 'none', 
                                      borderRadius: 4, 
                                      cursor: 'pointer',
                                      fontSize: 14
                                    }}
                                  >
                                    Edit
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteReview(review.id)}
                                    style={{ 
                                      padding: '6px 12px', 
                                      background: '#b91c1c', 
                                      color: '#fff', 
                                      border: 'none', 
                                      borderRadius: 4, 
                                      cursor: 'pointer',
                                      fontSize: 14
                                    }}
                                  >
                                    Delete
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              
              {tab === 'users' && (
                <div>
                  <h2 style={{ color: '#6b4f1d', marginBottom: 24 }}>Manage Users</h2>
                  
                  <div className="overflow-auto" style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, overflow: 'hidden' }}>
                      <thead>
                        <tr>
                          <th style={thStyle}>Name</th>
                          <th style={thStyle}>Created At</th>
                          <th style={thStyle}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map(user => (
                          <tr key={user.id}>
                            <td style={tdStyle}>{user.name}</td>
                            <td style={tdStyle}>{user.created_at ? new Date(user.created_at).toLocaleString() : ''}</td>
                            <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>
                              <div style={{ display: 'flex', gap: 8 }}>
                                <button 
                                  onClick={() => handleDeleteUser(user.id)}
                                  style={{ 
                                    padding: '6px 12px', 
                                    background: '#b91c1c', 
                                    color: '#fff', 
                                    border: 'none', 
                                    borderRadius: 4, 
                                    cursor: 'pointer',
                                    fontSize: 14
                                  }}
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              
              {tab === 'tags' && (
                <div>
                  <h2 style={{ color: '#6b4f1d', marginBottom: 24 }}>Manage Flavor Tags</h2>
                  
                  <div className="overflow-auto" style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, overflow: 'hidden' }}>
                      <thead>
                        <tr>
                          <th style={thStyle}>Name</th>
                          <th style={thStyle}>Description</th>
                          <th style={thStyle}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {flavorTags.map(tag => (
                          <tr key={tag.id}>
                            <td style={tdStyle}>
                              {editingTag === tag.id ? (
                                <input
                                  value={editTagFields.name}
                                  onChange={e => handleEditTagFieldChange('name', e.target.value)}
                                  style={{ 
                                    width: '100%', 
                                    padding: '0.5rem', 
                                    borderRadius: 4, 
                                    border: '1px solid #e0cba8',
                                    fontSize: '1rem'
                                  }}
                                />
                              ) : tag.name}
                            </td>
                            <td style={tdStyle}>
                              {editingTag === tag.id ? (
                                <input
                                  value={editTagFields.description}
                                  onChange={e => handleEditTagFieldChange('description', e.target.value)}
                                  style={{ 
                                    width: '100%', 
                                    padding: '0.5rem', 
                                    borderRadius: 4, 
                                    border: '1px solid #e0cba8',
                                    fontSize: '1rem'
                                  }}
                                />
                              ) : tag.description}
                            </td>
                            <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>
                              {editingTag === tag.id ? (
                                <div style={{ display: 'flex', gap: 8 }}>
                                  <button 
                                    onClick={() => handleSaveTag(tag.id)}
                                    style={{ 
                                      padding: '6px 12px', 
                                      background: '#15803d', 
                                      color: '#fff', 
                                      border: 'none', 
                                      borderRadius: 4, 
                                      cursor: 'pointer',
                                      fontSize: 14
                                    }}
                                  >
                                    Save
                                  </button>
                                  <button 
                                    onClick={() => setEditingTag(null)}
                                    style={{ 
                                      padding: '6px 12px', 
                                      background: '#e0cba8', 
                                      color: '#6b4f1d', 
                                      border: 'none', 
                                      borderRadius: 4, 
                                      cursor: 'pointer',
                                      fontSize: 14
                                    }}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <div style={{ display: 'flex', gap: 8 }}>
                                  <button 
                                    onClick={() => handleEditTag(tag)}
                                    style={{ 
                                      padding: '6px 12px', 
                                      background: '#6b4f1d', 
                                      color: '#fff', 
                                      border: 'none', 
                                      borderRadius: 4, 
                                      cursor: 'pointer',
                                      fontSize: 14
                                    }}
                                  >
                                    Edit
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteTag(tag.id)}
                                    style={{ 
                                      padding: '6px 12px', 
                                      background: '#b91c1c', 
                                      color: '#fff', 
                                      border: 'none', 
                                      borderRadius: 4, 
                                      cursor: 'pointer',
                                      fontSize: 14
                                    }}
                                  >
                                    Delete
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              
              {tab === 'pastries' && (
                <div>
                  <h2 style={{ color: '#6b4f1d', marginBottom: 24 }}>Manage Pastries</h2>
                  
                  <div className="overflow-auto" style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, overflow: 'hidden' }}>
                      <thead>
                        <tr>
                          <th style={thStyle}>Image</th>
                          <th style={thStyle}>Name</th>
                          <th style={thStyle}>Description</th>
                          <th style={thStyle}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pastries.map(pastry => (
                          <tr key={pastry.id}>
                            <td style={tdStyle}>
                              {editingPastry === pastry.id ? (
                                <input
                                  value={editPastryFields.image}
                                  onChange={e => handleEditPastryFieldChange('image', e.target.value)}
                                  style={{ 
                                    width: '100%', 
                                    padding: '0.5rem', 
                                    borderRadius: 4, 
                                    border: '1px solid #e0cba8',
                                    fontSize: '1rem'
                                  }}
                                />
                              ) : pastry.image}
                            </td>
                            <td style={tdStyle}>
                              {editingPastry === pastry.id ? (
                                <input
                                  value={editPastryFields.name}
                                  onChange={e => handleEditPastryFieldChange('name', e.target.value)}
                                  style={{ 
                                    width: '100%', 
                                    padding: '0.5rem', 
                                    borderRadius: 4, 
                                    border: '1px solid #e0cba8',
                                    fontSize: '1rem'
                                  }}
                                />
                              ) : pastry.name}
                            </td>
                            <td style={tdStyle}>
                              {editingPastry === pastry.id ? (
                                <input
                                  value={editPastryFields.description}
                                  onChange={e => handleEditPastryFieldChange('description', e.target.value)}
                                  style={{ 
                                    width: '100%', 
                                    padding: '0.5rem', 
                                    borderRadius: 4, 
                                    border: '1px solid #e0cba8',
                                    fontSize: '1rem'
                                  }}
                                />
                              ) : pastry.description}
                            </td>
                            <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>
                              {editingPastry === pastry.id ? (
                                <div style={{ display: 'flex', gap: 8 }}>
                                  <button 
                                    onClick={() => handleSavePastry(pastry.id)}
                                    style={{ 
                                      padding: '6px 12px', 
                                      background: '#15803d', 
                                      color: '#fff', 
                                      border: 'none', 
                                      borderRadius: 4, 
                                      cursor: 'pointer',
                                      fontSize: 14
                                    }}
                                  >
                                    Save
                                  </button>
                                  <button 
                                    onClick={() => setEditingPastry(null)}
                                    style={{ 
                                      padding: '6px 12px', 
                                      background: '#e0cba8', 
                                      color: '#6b4f1d', 
                                      border: 'none', 
                                      borderRadius: 4, 
                                      cursor: 'pointer',
                                      fontSize: 14
                                    }}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <div style={{ display: 'flex', gap: 8 }}>
                                  <button 
                                    onClick={() => handleEditPastry(pastry)}
                                    style={{ 
                                      padding: '6px 12px', 
                                      background: '#6b4f1d', 
                                      color: '#fff', 
                                      border: 'none', 
                                      borderRadius: 4, 
                                      cursor: 'pointer',
                                      fontSize: 14
                                    }}
                                  >
                                    Edit
                                  </button>
                                  <button 
                                    onClick={() => handleDeletePastry(pastry.id)}
                                    style={{ 
                                      padding: '6px 12px', 
                                      background: '#b91c1c', 
                                      color: '#fff', 
                                      border: 'none', 
                                      borderRadius: 4, 
                                      cursor: 'pointer',
                                      fontSize: 14
                                    }}
                                  >
                                    Delete
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {renderPastryFeedback()}
                </div>
              )}
            </div>
          </div>
          
          <div style={{ marginTop: 40, textAlign: 'center' }}>
            <a href="/">
              <button style={{
                padding: '12px 24px',
                background: '#e0cba8',
                color: '#6b4f1d',
                border: 'none',
                borderRadius: 8,
                fontWeight: 'bold',
                fontSize: '1rem',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                Return to Homepage
              </button>
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

const inputStyle = { padding: 6, fontSize: 15, borderRadius: 4, border: '1px solid #e0cba8', width: '100%' };
const tabStyle = { background: '#e0cba8', color: '#6b4f1d', border: 'none', borderRadius: 8, padding: '0.7rem 1.5rem', fontWeight: 'bold', cursor: 'pointer' };
const tabActiveStyle = { ...tabStyle, background: '#6b4f1d', color: '#fffbe7' };
const editBtnStyle = { background: '#e0cba8', color: '#6b4f1d', border: 'none', borderRadius: 4, padding: '0.4rem 1rem', fontWeight: 'bold', cursor: 'pointer' };
const saveBtnStyle = { background: '#6b4f1d', color: '#fffbe7', border: 'none', borderRadius: 4, padding: '0.4rem 1rem', fontWeight: 'bold', cursor: 'pointer', marginRight: 8 };
const cancelBtnStyle = { background: '#fffbe7', color: '#6b4f1d', border: '1px solid #e0cba8', borderRadius: 4, padding: '0.4rem 1rem', fontWeight: 'bold', cursor: 'pointer' };
const exportBtnStyle = { background: '#6b4f1d', color: '#fffbe7', border: 'none', borderRadius: 8, padding: '0.8rem 2rem', fontWeight: 'bold', fontSize: 16, marginTop: 24, cursor: 'pointer' }; 