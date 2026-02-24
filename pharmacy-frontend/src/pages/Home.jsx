import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { blockchainAPI } from '../api/blockchain';

const cards = [
  {
    path:  '/doctor',
    icon:  '🩺',
    title: 'Doctor Portal',
    desc:  'Issue and revoke prescriptions on-chain',
    color: '#1e90ff',
  },
  {
    path:  '/pharmacist',
    icon:  '💊',
    title: 'Pharmacist Portal',
    desc:  'Verify and redeem prescriptions atomically',
    color: '#00e676',
  },
  {
    path:  '/admin',
    icon:  '🔐',
    title: 'Admin Registry',
    desc:  'Manage authorized wallet addresses',
    color: '#ffb703',
  },
];

export default function Home() {
  const [nodeStatus, setNodeStatus] = useState('checking');

  useEffect(() => {
    blockchainAPI.health()
      .then(() => setNodeStatus('online'))
      .catch(() => setNodeStatus('offline'));
  }, []);

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '60px 24px' }}>

      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: '64px' }}
           className="animate-in">
        <div style={{
          display:     'inline-block',
          padding:     '6px 16px',
          borderRadius:'20px',
          border:      '1px solid var(--border-bright)',
          background:  'var(--bg-card)',
          fontFamily:  'var(--font-mono)',
          fontSize:    '11px',
          color:       'var(--accent-cyan)',
          letterSpacing:'0.1em',
          marginBottom:'24px',
        }}>
          ◈ BLOCKCHAIN-SECURED · TAMPER-PROOF · IMMUTABLE
        </div>

        <h1 style={{
          fontSize:   'clamp(36px, 6vw, 64px)',
          fontWeight: 600,
          lineHeight: 1.1,
          marginBottom: '20px',
          background: 'linear-gradient(135deg, #e8f0fe 0%, var(--accent-cyan) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          Prescription Integrity<br/>On The Blockchain
        </h1>

        <p style={{
          fontSize:   '17px',
          color:      'var(--text-secondary)',
          maxWidth:   '560px',
          margin:     '0 auto 32px',
          lineHeight: 1.7,
        }}>
          Every prescription is a cryptographic record. Issued once,
          verified instantly, redeemed exactly once — fraud is mathematically impossible.
        </p>

        {/* Node status indicator */}
        <div style={{
          display:    'inline-flex',
          alignItems: 'center',
          gap:        '8px',
          padding:    '8px 20px',
          borderRadius: '20px',
          background: nodeStatus === 'online'
            ? 'rgba(0,230,118,0.08)'
            : nodeStatus === 'offline'
            ? 'rgba(255,77,109,0.08)'
            : 'rgba(255,183,3,0.08)',
          border: `1px solid ${
            nodeStatus === 'online'  ? 'rgba(0,230,118,0.3)'  :
            nodeStatus === 'offline' ? 'rgba(255,77,109,0.3)' :
            'rgba(255,183,3,0.3)'}`,
        }}>
          <span style={{
            width: '8px', height: '8px',
            borderRadius: '50%',
            background:
              nodeStatus === 'online'  ? 'var(--accent-green)' :
              nodeStatus === 'offline' ? 'var(--accent-red)'   :
              'var(--accent-amber)',
            animation: nodeStatus === 'checking' ? 'pulse 1s infinite' : 'none',
          }}/>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize:   '11px',
            color:
              nodeStatus === 'online'  ? 'var(--accent-green)' :
              nodeStatus === 'offline' ? 'var(--accent-red)'   :
              'var(--accent-amber)',
          }}>
            NODE {nodeStatus.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Role cards */}
      <div style={{
        display:             'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap:                 '20px',
      }}>
        {cards.map(({ path, icon, title, desc, color }, i) => (
          <Link key={path} to={path} style={{ textDecoration: 'none' }}>
            <div className="animate-in" style={{
              animationDelay:  `${i * 0.1}s`,
              padding:         '28px',
              background:      'var(--bg-card)',
              border:          '1px solid var(--border)',
              borderRadius:    '12px',
              cursor:          'pointer',
              transition:      'all 0.25s ease',
              position:        'relative',
              overflow:        'hidden',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = color;
              e.currentTarget.style.transform   = 'translateY(-4px)';
              e.currentTarget.style.boxShadow   = `0 12px 40px rgba(0,0,0,0.4)`;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.transform   = 'translateY(0)';
              e.currentTarget.style.boxShadow   = 'none';
            }}>

              {/* Glow accent */}
              <div style={{
                position:     'absolute',
                top:          0, left: 0, right: 0,
                height:       '2px',
                background:   `linear-gradient(90deg, transparent, ${color}, transparent)`,
              }}/>

              <div style={{ fontSize: '32px', marginBottom: '16px' }}>{icon}</div>
              <h3 style={{
                fontSize:     '16px',
                fontWeight:   600,
                marginBottom: '8px',
                color:        'var(--text-primary)',
              }}>{title}</h3>
              <p style={{
                fontSize:  '13px',
                color:     'var(--text-secondary)',
                lineHeight: 1.6,
              }}>{desc}</p>

              <div style={{
                marginTop:  '20px',
                fontFamily: 'var(--font-mono)',
                fontSize:   '11px',
                color,
                letterSpacing: '0.05em',
              }}>
                ENTER PORTAL →
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}