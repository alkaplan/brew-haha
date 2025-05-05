import { useState } from 'react';
import Header from './Header';
import Image from 'next/image';

export default function About() {
  const [activeHost, setActiveHost] = useState(0);
  
  const hosts = [
    {
      name: "Alex",
      role: "Coffee Connoisseur",
      bio: "As the resident coffee expert, Alex brings a refined palette and deep knowledge of coffee varietals. Their passion for the perfect brew inspired the original Coffee House gatherings."
    },
    {
      name: "Anna",
      role: "Pastry Chef",
      bio: "Anna's legendary pastries are the perfect complement to our coffee selection. Her creative recipes and attention to detail ensure every bite is as memorable as the last sip."
    },
    {
      name: "David",
      role: "Vibe Curator",
      bio: "David has a natural talent for creating the perfect atmosphere. From playlist creation to furniture arrangement, he ensures Coffee House always has the ideal ambiance for conversation and connection."
    },
    {
      name: "Niko",
      role: "Ambiance Architect",
      bio: "Niko curates the perfect atmosphere for Coffee House. From music selection to lighting, they ensure every gathering has just the right vibe for connection and conversation."
    },
    {
      name: "Megan",
      role: "Community Builder",
      bio: "Megan's talent for bringing people together is what makes Coffee House special. She makes sure every guest feels welcome and leaves with new friends and memories."
    }
  ];
  
  const handleNext = () => {
    setActiveHost((prev) => (prev === hosts.length - 1 ? 0 : prev + 1));
  };
  
  const handlePrev = () => {
    setActiveHost((prev) => (prev === 0 ? hosts.length - 1 : prev - 1));
  };

  return (
    <>
      <Header />
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: '#fffbe7',
        fontFamily: 'sans-serif',
        padding: '2rem',
        paddingTop: '5rem',
      }}>
        <div style={{
          maxWidth: '800px',
          width: '100%',
          background: '#fff',
          padding: '2rem',
          borderRadius: '12px',
          color: '#6b4f1d',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          marginBottom: '2rem'
        }}>
          <h1 style={{ color: '#6b4f1d', marginBottom: '1.5rem', textAlign: 'center' }}>About Coffee House</h1>
          
          <div style={{ 
            display: 'flex',
            flexDirection: 'column', 
            alignItems: 'center', 
            marginBottom: '2rem' 
          }}>
            <div style={{ 
              position: 'relative', 
              width: '100%', 
              maxWidth: '600px', 
              height: '400px',
              marginBottom: '1.5rem',
              borderRadius: '8px',
              overflow: 'hidden'
            }}>
              <Image 
                src="/roomies.jpg" 
                alt="The Coffee House Roommates" 
                layout="fill" 
                objectFit="cover"
                priority
              />
            </div>
            <p style={{ textAlign: 'center', fontStyle: 'italic', marginTop: '0.5rem' }}>
              The Coffee House crew: Alex, Anna, Niko, and Megan
            </p>
          </div>
          
          <div style={{ lineHeight: '1.6', fontSize: '1.1rem' }}>
            <h2 style={{ color: '#6b4f1d', marginBottom: '1rem' }}>Our Story</h2>
            <p style={{ marginBottom: '1rem' }}>
              Coffee House began as a simple weekend ritual among four roommates who shared a passion for great coffee and meaningful connections. What started as casual gatherings in our living room has grown into something special we're excited to share with the world.
            </p>
            <p style={{ marginBottom: '1rem' }}>
              In the winter of 2019, we found ourselves hosting weekend coffee tastings for friends, comparing different brewing methods and bean origins. As word spread, our apartment became a hub for coffee enthusiasts and friends of friends looking for a cozy place to connect.
            </p>
            <p>
              Today, Coffee House is our way of bringing people together over delicious brews and fresh pastries. We believe that great coffee creates the perfect environment for conversation, connection, and community. Whether you're a coffee aficionado or just looking for a warm, welcoming space, we invite you to join us.
            </p>
          </div>
        </div>
        
        <div style={{
          maxWidth: '800px',
          width: '100%',
          background: '#fff',
          padding: '2rem',
          borderRadius: '12px',
          color: '#6b4f1d',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          marginBottom: '2rem'
        }}>
          <h2 style={{ color: '#6b4f1d', marginBottom: '1.5rem', textAlign: 'center' }}>Meet Your Hosts</h2>
          
          <div style={{ position: 'relative', padding: '0 2rem' }}>
            <div style={{
              background: '#f7ecd7',
              padding: '2rem',
              borderRadius: '8px',
              minHeight: '200px',
              position: 'relative'
            }}>
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ color: '#6b4f1d', fontSize: '1.5rem', marginBottom: '0.5rem' }}>{hosts[activeHost].name}</h3>
                <p style={{ color: '#b91c1c', fontWeight: 'bold' }}>{hosts[activeHost].role}</p>
              </div>
              <p style={{ lineHeight: '1.6' }}>{hosts[activeHost].bio}</p>
            </div>
            
            <button 
              onClick={handlePrev}
              style={{
                position: 'absolute',
                left: 0,
                top: '50%',
                transform: 'translateY(-50%)',
                background: '#6b4f1d',
                color: '#fff',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}
            >
              ←
            </button>
            
            <button 
              onClick={handleNext}
              style={{
                position: 'absolute',
                right: 0,
                top: '50%',
                transform: 'translateY(-50%)',
                background: '#6b4f1d',
                color: '#fff',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}
            >
              →
            </button>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5rem' }}>
            {hosts.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveHost(index)}
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: activeHost === index ? '#6b4f1d' : '#e0cba8',
                  border: 'none',
                  margin: '0 6px',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s'
                }}
              />
            ))}
          </div>
        </div>
        
        <div style={{
          maxWidth: '800px',
          width: '100%',
          background: '#fff',
          padding: '2rem',
          borderRadius: '12px',
          color: '#6b4f1d',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ color: '#6b4f1d', marginBottom: '1.5rem', textAlign: 'center' }}>What is Coffee House?</h2>
          
          <div style={{ lineHeight: '1.6', fontSize: '1.1rem' }}>
            <p style={{ marginBottom: '1rem' }}>
              Coffee House is a weekend gathering where we bring friends together to enjoy delicious coffee brews, fresh pastries, and create meaningful connections in a warm, inviting atmosphere.
            </p>
            <p style={{ marginBottom: '1rem' }}>
              We believe that coffee has a unique way of fostering conversation and community. Each Coffee House event is carefully crafted to create an experience that delights the senses while creating space for authentic connection.
            </p>
            <p>
              From seasoned coffee enthusiasts to casual sippers, everyone is welcome at Coffee House. Join us to discover new flavors, make new friends, and become part of our growing community.
            </p>
          </div>
        </div>
      </div>
    </>
  );
} 