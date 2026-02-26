import React from 'react';

const ROLE_STYLES = {
  ADMIN: {
    label: 'ADMIN',
    color: '#ffb703',
    bg: 'rgba(255,183,3,0.12)',
  },
  DOCTOR: {
    label: 'DOCTOR',
    color: '#1e90ff',
    bg: 'rgba(30,144,255,0.12)',
  },
  PHARMACIST: {
    label: 'PHARMACIST',
    color: '#00e676',
    bg: 'rgba(0,230,118,0.12)',
  },
  UNAUTHORIZED: {
    label: 'UNAUTHORIZED',
    color: '#ff4d6d',
    bg: 'rgba(255,77,109,0.12)',
  },
  UNKNOWN: {
    label: 'UNKNOWN',
    color: '#9aa4b2',
    bg: 'rgba(154,164,178,0.12)',
  },
};

function normalizeRole(role) {
  if (!role) return 'UNKNOWN';

  const normalized = String(role).trim().toUpperCase();

  if (normalized.includes('ADMIN')) return 'ADMIN';
  if (normalized.includes('DOCTOR')) return 'DOCTOR';
  if (normalized.includes('PHARMACIST')) return 'PHARMACIST';
  if (normalized.includes('UNAUTHORIZED') || normalized.includes('NONE')) return 'UNAUTHORIZED';

  return 'UNKNOWN';
}

export default function RoleBadge({ role }) {
  const key = normalizeRole(role);
  const style = ROLE_STYLES[key];

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '5px 10px',
        borderRadius: '999px',
        border: `1px solid ${style.color}`,
        background: style.bg,
        color: style.color,
        fontFamily: 'var(--font-mono)',
        fontSize: '11px',
        fontWeight: 700,
        letterSpacing: '0.08em',
      }}
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: style.color,
        }}
      />
      {style.label}
    </span>
  );
}
