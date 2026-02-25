import React, { useEffect, useState } from 'react';
import { blockchainAPI } from '../api/blockchain';
import RoleBadge from '../components/shared/RoleBadge';
import HashDisplay from '../components/shared/HashDisplay';

const ADMIN_ADDRESS = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';

function RegistryPanel({ title, color, icon, onSubmit, loading, result, error }) {
  const [address, setAddress] = useState('');

  const handleSubmit = () => onSubmit(address);

  return (
    <div style={{
      background: 'var(--bg-card)', border: `1px solid var(--border)`,
      borderRadius: '12px', padding: '28px',
      borderTop: `3px solid ${color}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <span style={{ fontSize: '24px' }}>{icon}</span>
        <h2 style={{
          fontSize: '14px', fontFamily: 'var(--font-mono)',
          color, letterSpacing: '0.1em',
        }}>{title}</h2>
      </div>

      <label style={{
        display: 'block', fontSize: '11px', fontFamily: 'var(--font-mono)',
        color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: '8px',
      }}>WALLET ADDRESS</label>
      <input
        value={address}
        onChange={e => setAddress(e.target.value)}
        placeholder="0x..."
        style={{
          width: '100%', padding: '10px 14px', marginBottom: '12px',
          background: 'var(--bg-primary)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', color: 'var(--text-primary)',
          fontSize: '13px', fontFamily: 'var(--font-mono)', outline: 'none',
        }}
        onFocus={e => e.target.style.borderColor = color}
        onBlur={e  => e.target.style.borderColor = 'var(--border)'}
      />

      {error && (
        <div style={{
          padding: '10px 14px', background: 'rgba(255,77,109,0.08)',
          border: '1px solid rgba(255,77,109,0.3)', borderRadius: 'var(--radius)',
          color: 'var(--accent-red)', fontSize: '12px', marginBottom: '8px',
        }}>⚠ {error}</div>
      )}

      <button onClick={handleSubmit} disabled={loading} style={{
        width: '100%', padding: '12px',
        background: loading ? 'var(--bg-elevated)' : `${color}15`,
        border: `1px solid ${loading ? 'var(--border)' : color}`,
        borderRadius: 'var(--radius)',
        color: loading ? 'var(--text-muted)' : color,
        fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700,
        letterSpacing: '0.1em', cursor: loading ? 'not-allowed' : 'pointer',
      }}>
        {loading ? '⟳ WRITING TO CHAIN...' : `◈ REGISTER ON-CHAIN`}
      </button>

      {result && (
        <div style={{
          marginTop: '16px', padding: '14px',
          background: `${color}0d`, border: `1px solid ${color}33`,
          borderRadius: 'var(--radius)',
        }} className="animate-in">
          <div style={{
            color, fontFamily: 'var(--font-mono)',
            fontSize: '11px', marginBottom: '10px',
          }}>✓ WALLET AUTHORIZED ON-CHAIN</div>
          <HashDisplay hash={result.transactionHash} label="Tx Hash" />
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const [role, setRole] = useState('UNKNOWN');
  const [doctorLoading,     setDoctorLoading]     = useState(false);
  const [doctorResult,      setDoctorResult]      = useState(null);
  const [doctorError,       setDoctorError]       = useState('');
  const [pharmacistLoading, setPharmacistLoading] = useState(false);
  const [pharmacistResult,  setPharmacistResult]  = useState(null);
  const [pharmacistError,   setPharmacistError]   = useState('');

  const handleAuthorizeDoctor = async (address) => {
    setDoctorLoading(true); setDoctorError(''); setDoctorResult(null);
    try {
      setDoctorResult(await blockchainAPI.authorizeDoctor(address));
    } catch (e) { setDoctorError(e.message); }
    finally { setDoctorLoading(false); }
  };

  const handleAuthorizePharmacist = async (address) => {
    setPharmacistLoading(true); setPharmacistError(''); setPharmacistResult(null);
    try {
      setPharmacistResult(await blockchainAPI.authorizePharmacist(address));
    } catch (e) { setPharmacistError(e.message); }
    finally { setPharmacistLoading(false); }
  };

  useEffect(() => {
    blockchainAPI.getRole(ADMIN_ADDRESS)
      .then((result) => setRole(result.role || result.status || 'UNKNOWN'))
      .catch(() => setRole('UNKNOWN'));
  }, []);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 24px' }}>

      <div style={{ marginBottom: '32px' }} className="animate-in">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <span style={{ fontSize: '28px' }}>🔐</span>
          <h1 style={{ fontSize: '24px', fontWeight: 600 }}>Admin Registry</h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Authorize wallet addresses for Doctor and Pharmacist roles on the blockchain
        </p>
        <div style={{ marginTop: '12px', display: 'inline-flex' }}>
          <RoleBadge role={role} />
        </div>
        <div style={{
          marginTop: '16px', padding: '12px 16px',
          background: 'rgba(255,183,3,0.06)', border: '1px solid rgba(255,183,3,0.2)',
          borderRadius: 'var(--radius)', fontSize: '12px', color: 'var(--accent-amber)',
        }}>
          ⚠ These transactions are signed with the Admin private key and permanently
          modify the on-chain registry. Actions are irreversible without a revocation transaction.
        </div>
      </div>

      <div style={{ display: 'grid', gap: '24px' }}>
        <RegistryPanel
          title="AUTHORIZE DOCTOR"
          color="var(--accent-blue)"
          icon="🩺"
          onSubmit={handleAuthorizeDoctor}
          loading={doctorLoading}
          result={doctorResult}
          error={doctorError}
        />
        <RegistryPanel
          title="AUTHORIZE PHARMACIST"
          color="var(--accent-green)"
          icon="💊"
          onSubmit={handleAuthorizePharmacist}
          loading={pharmacistLoading}
          result={pharmacistResult}
          error={pharmacistError}
        />
      </div>
    </div>
  );
}
