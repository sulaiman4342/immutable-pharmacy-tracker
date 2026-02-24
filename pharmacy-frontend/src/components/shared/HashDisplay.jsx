import React, { useState } from 'react';

export default function HashDisplay({ hash, label = 'Hash' }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const short = hash
    ? `${hash.substring(0, 10)}...${hash.substring(hash.length - 8)}`
    : '—';

  return (
    <div style={{
      display:      'flex',
      alignItems:   'center',
      gap:          '10px',
      padding:      '8px 14px',
      background:   'var(--bg-primary)',
      border:       '1px solid var(--border)',
      borderRadius: 'var(--radius)',
    }}>
      <span style={{ color: 'var(--text-muted)', fontSize: '11px', minWidth: '60px' }}>
        {label}
      </span>
      <span style={{
        fontFamily: 'var(--font-mono)',
        fontSize:   '12px',
        color:      'var(--accent-cyan)',
        flex:       1,
      }}>
        {short}
      </span>
      <button onClick={copy} style={{
        background:   copied ? 'rgba(0,230,118,0.1)' : 'transparent',
        border:       '1px solid var(--border)',
        borderRadius: '4px',
        color:        copied ? 'var(--accent-green)' : 'var(--text-muted)',
        cursor:       'pointer',
        fontSize:     '10px',
        padding:      '3px 8px',
        transition:   'all 0.2s',
      }}>
        {copied ? 'COPIED' : 'COPY'}
      </button>
    </div>
  );
}