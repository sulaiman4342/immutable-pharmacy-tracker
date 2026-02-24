import React from 'react';

const config = {
  VALID:    { color: '#00e676', bg: 'rgba(0,230,118,0.1)',  label: 'VALID'    },
  REDEEMED: { color: '#1e90ff', bg: 'rgba(30,144,255,0.1)', label: 'REDEEMED' },
  REVOKED:  { color: '#ff4d6d', bg: 'rgba(255,77,109,0.1)', label: 'REVOKED'  },
  EXPIRED:  { color: '#ffb703', bg: 'rgba(255,183,3,0.1)',  label: 'EXPIRED'  },
};

export default function StatusBadge({ status, isExpired }) {
  const display = (status === 'VALID' && isExpired) ? 'EXPIRED' : status;
  const c = config[display] || config.VALID;

  return (
    <span style={{
      display:      'inline-flex',
      alignItems:   'center',
      gap:          '6px',
      padding:      '4px 12px',
      borderRadius: '20px',
      border:       `1px solid ${c.color}`,
      background:   c.bg,
      color:        c.color,
      fontSize:     '11px',
      fontFamily:   'var(--font-mono)',
      fontWeight:   700,
      letterSpacing:'0.1em',
    }}>
      <span style={{
        width: '6px', height: '6px',
        borderRadius: '50%',
        background: c.color,
        animation: display === 'VALID' ? 'pulse 2s infinite' : 'none'
      }}/>
      {c.label}
    </span>
  );
}