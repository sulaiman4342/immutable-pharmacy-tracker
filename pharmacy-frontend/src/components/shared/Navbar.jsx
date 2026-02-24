import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const links = [
  { path: '/',          label: 'HOME'       },
  { path: '/doctor',    label: 'DOCTOR'     },
  { path: '/pharmacist',label: 'PHARMACIST' },
  { path: '/admin',     label: 'ADMIN'      },
];

export default function Navbar() {
  const { pathname } = useLocation();

  return (
    <nav style={{
      position:     'sticky',
      top:          0,
      zIndex:       100,
      borderBottom: '1px solid var(--border)',
      background:   'rgba(7,11,20,0.95)',
      backdropFilter: 'blur(12px)',
      padding:      '0 40px',
      display:      'flex',
      alignItems:   'center',
      justifyContent: 'space-between',
      height:       '64px',
    }}>

      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '32px', height: '32px',
          background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))',
          borderRadius: '8px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '16px',
        }}>⛓</div>
        <div>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize:   '13px',
            fontWeight: 700,
            color:      'var(--text-primary)',
            letterSpacing: '0.05em',
          }}>RxChain</div>
          <div style={{
            fontSize: '9px',
            color:    'var(--text-muted)',
            letterSpacing: '0.15em',
          }}>IMMUTABLE PRESCRIPTION TRACKER</div>
        </div>
      </div>

      {/* Navigation links */}
      <div style={{ display: 'flex', gap: '4px' }}>
        {links.map(({ path, label }) => {
          const active = pathname === path;
          return (
            <Link key={path} to={path} style={{
              padding:      '8px 16px',
              borderRadius: 'var(--radius)',
              fontFamily:   'var(--font-mono)',
              fontSize:     '11px',
              letterSpacing:'0.1em',
              fontWeight:   700,
              textDecoration: 'none',
              transition:   'all 0.2s',
              background:   active ? 'rgba(30,144,255,0.15)' : 'transparent',
              color:        active ? 'var(--accent-blue)' : 'var(--text-muted)',
              border:       active ? '1px solid rgba(30,144,255,0.3)' : '1px solid transparent',
            }}>
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}