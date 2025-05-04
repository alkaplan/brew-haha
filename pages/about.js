import Header from './Header';

export default function About() {
  return (
    <>
      <Header />
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#fffbe7',
        fontFamily: 'sans-serif',
        padding: '2rem',
        paddingTop: '5rem',
      }}>
        <h1 style={{ color: '#6b4f1d', marginBottom: '2rem' }}>About Us</h1>
        <div style={{
          maxWidth: '600px',
          background: '#e0cba8',
          padding: '2rem',
          borderRadius: '12px',
          color: '#6b4f1d',
          textAlign: 'center'
        }}>
          <p style={{ fontSize: '1.1rem', lineHeight: '1.6' }}>
            Welcome to our coffeehouse! We're passionate about bringing people together over great coffee.
            Our story and photos will be coming soon.
          </p>
        </div>
      </div>
    </>
  );
} 