import React, { useState } from 'react';
import { ethers } from 'ethers';
import { blockchainAPI } from '../api/blockchain';
// import StatusBadge from '../components/shared/StatusBadge';
import HashDisplay from '../components/shared/HashDisplay';

// Hardhat Account #1 — pre-filled for demo
const DOCTOR_ADDRESS = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8';

function Card({ children, style }) {
  return (
    <div style={{
      background:   'var(--bg-card)',
      border:       '1px solid var(--border)',
      borderRadius: '12px',
      padding:      '28px',
      ...style,
    }}>
      {children}
    </div>
  );
}

function Input({ label, value, onChange, placeholder, type = 'text' }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={{
        display:      'block',
        fontSize:     '11px',
        fontFamily:   'var(--font-mono)',
        color:        'var(--text-muted)',
        letterSpacing:'0.1em',
        marginBottom: '8px',
      }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width:       '100%',
          padding:     '10px 14px',
          background:  'var(--bg-primary)',
          border:      '1px solid var(--border)',
          borderRadius:'var(--radius)',
          color:       'var(--text-primary)',
          fontSize:    '13px',
          fontFamily:  'var(--font-mono)',
          outline:     'none',
          transition:  'border-color 0.2s',
        }}
        onFocus={e  => e.target.style.borderColor = 'var(--accent-blue)'}
        onBlur={e   => e.target.style.borderColor = 'var(--border)'}
      />
    </div>
  );
}

function TxButton({ onClick, loading, children, color = 'var(--accent-blue)' }) {
  return (
    <button onClick={onClick} disabled={loading} style={{
      width:        '100%',
      padding:      '12px',
      background:   loading ? 'var(--bg-elevated)' : `linear-gradient(135deg, ${color}22, ${color}11)`,
      border:       `1px solid ${loading ? 'var(--border)' : color}`,
      borderRadius: 'var(--radius)',
      color:        loading ? 'var(--text-muted)' : color,
      fontFamily:   'var(--font-mono)',
      fontSize:     '12px',
      fontWeight:   700,
      letterSpacing:'0.1em',
      cursor:       loading ? 'not-allowed' : 'pointer',
      transition:   'all 0.2s',
      marginTop:    '8px',
    }}>
      {loading ? '⟳ SIGNING TRANSACTION...' : children}
    </button>
  );
}

export default function DoctorDashboard() {
  // Issue form
  const [patientId,  setPatientId]  = useState('');
  const [medicine,   setMedicine]   = useState('');
  const [duration,   setDuration]   = useState('30');
  const [issueResult, setIssueResult] = useState(null);
  const [issueLoading, setIssueLoading] = useState(false);
  const [issueError,   setIssueError]   = useState('');

  // Revoke form
  const [revokeHash,    setRevokeHash]    = useState('');
  const [revokeResult,  setRevokeResult]  = useState(null);
  const [revokeLoading, setRevokeLoading] = useState(false);
  const [revokeError,   setRevokeError]   = useState('');

  const handleIssue = async () => {
    if (!patientId || !medicine || !duration) {
      setIssueError('All fields are required'); return;
    }
    setIssueLoading(true); setIssueError(''); setIssueResult(null);
    try {
      // Hash sensitive data client-side — never send raw PII to chain
      const patientHash  = ethers.keccak256(ethers.toUtf8Bytes(patientId));
      const medicineHash = ethers.keccak256(ethers.toUtf8Bytes(medicine));
      const result = await blockchainAPI.issue(
        patientHash, medicineHash, parseInt(duration), DOCTOR_ADDRESS
      );
      setIssueResult(result);
    } catch (e) {
      setIssueError(e.message);
    } finally {
      setIssueLoading(false);
    }
  };

  const handleRevoke = async () => {
    if (!revokeHash) { setRevokeError('Prescription hash is required'); return; }
    setRevokeLoading(true); setRevokeError(''); setRevokeResult(null);
    try {
      const result = await blockchainAPI.revoke(revokeHash, DOCTOR_ADDRESS);
      setRevokeResult(result);
    } catch (e) {
      setRevokeError(e.message);
    } finally {
      setRevokeLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 24px' }}>

      {/* Header */}
      <div style={{ marginBottom: '32px' }} className="animate-in">
        <div style={{
          display: 'flex', alignItems: 'center',
          gap: '12px', marginBottom: '8px',
        }}>
          <span style={{ fontSize: '28px' }}>🩺</span>
          <h1 style={{ fontSize: '24px', fontWeight: 600 }}>Doctor Portal</h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Issue cryptographically signed prescriptions to the blockchain
        </p>
        <div style={{
          marginTop: '12px', padding: '8px 14px',
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', display: 'inline-block',
        }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            SIGNING AS&nbsp;
          </span>
          <span style={{ fontSize: '11px', color: 'var(--accent-blue)', fontFamily: 'var(--font-mono)' }}>
            {DOCTOR_ADDRESS}
          </span>
        </div>
      </div>

      {/* Issue Prescription */}
      <Card style={{ marginBottom: '24px' }} className="animate-in">
        <h2 style={{
          fontSize: '14px', fontFamily: 'var(--font-mono)',
          color: 'var(--accent-blue)', letterSpacing: '0.1em',
          marginBottom: '24px',
        }}>
          ◈ ISSUE NEW PRESCRIPTION
        </h2>

        <Input
          label="PATIENT ID"
          value={patientId}
          onChange={setPatientId}
          placeholder="e.g. PAT-2026-001 (will be hashed)"
        />
        <Input
          label="MEDICINE + DOSAGE"
          value={medicine}
          onChange={setMedicine}
          placeholder="e.g. Amoxicillin 500mg (will be hashed)"
        />
        <Input
          label="VALIDITY (DAYS)"
          type="number"
          value={duration}
          onChange={setDuration}
          placeholder="30"
        />

        <div style={{
          padding: '10px 14px', background: 'rgba(30,144,255,0.06)',
          border: '1px solid rgba(30,144,255,0.2)', borderRadius: 'var(--radius)',
          fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '8px',
        }}>
          🔒 Patient ID and medicine details are hashed locally before being sent
          to the blockchain. Raw data never leaves your browser.
        </div>

        {issueError && (
          <div style={{
            padding: '10px 14px', background: 'rgba(255,77,109,0.08)',
            border: '1px solid rgba(255,77,109,0.3)', borderRadius: 'var(--radius)',
            color: 'var(--accent-red)', fontSize: '12px', marginBottom: '8px',
          }}>
            ⚠ {issueError}
          </div>
        )}

        <TxButton onClick={handleIssue} loading={issueLoading}>
          ⛓ ISSUE PRESCRIPTION ON-CHAIN
        </TxButton>

        {issueResult && (
          <div style={{
            marginTop: '20px', padding: '16px',
            background: 'rgba(0,230,118,0.06)',
            border: '1px solid rgba(0,230,118,0.2)',
            borderRadius: 'var(--radius)',
          }} className="animate-in">
            <div style={{
              color: 'var(--accent-green)', fontFamily: 'var(--font-mono)',
              fontSize: '11px', marginBottom: '12px', letterSpacing: '0.1em',
            }}>
              ✓ TRANSACTION CONFIRMED
            </div>
            <HashDisplay hash={issueResult.prescriptionHash} label="Rx Hash" />
            <HashDisplay hash={issueResult.transactionHash}  label="Tx Hash" />
            <div style={{
              marginTop: '10px', fontSize: '12px', color: 'var(--text-secondary)',
            }}>
              {issueResult.message}
            </div>
          </div>
        )}
      </Card>

      {/* Revoke Prescription */}
      <Card>
        <h2 style={{
          fontSize: '14px', fontFamily: 'var(--font-mono)',
          color: 'var(--accent-red)', letterSpacing: '0.1em',
          marginBottom: '24px',
        }}>
          ◈ REVOKE PRESCRIPTION
        </h2>

        <Input
          label="PRESCRIPTION HASH"
          value={revokeHash}
          onChange={setRevokeHash}
          placeholder="0x..."
        />

        {revokeError && (
          <div style={{
            padding: '10px 14px', background: 'rgba(255,77,109,0.08)',
            border: '1px solid rgba(255,77,109,0.3)', borderRadius: 'var(--radius)',
            color: 'var(--accent-red)', fontSize: '12px', marginBottom: '8px',
          }}>
            ⚠ {revokeError}
          </div>
        )}

        <TxButton
          onClick={handleRevoke}
          loading={revokeLoading}
          color="var(--accent-red)"
        >
          ✕ REVOKE PRESCRIPTION ON-CHAIN
        </TxButton>

        {revokeResult && (
          <div style={{
            marginTop: '20px', padding: '16px',
            background: 'rgba(255,77,109,0.06)',
            border: '1px solid rgba(255,77,109,0.2)',
            borderRadius: 'var(--radius)',
          }} className="animate-in">
            <div style={{
              color: 'var(--accent-red)', fontFamily: 'var(--font-mono)',
              fontSize: '11px', marginBottom: '12px',
            }}>
              ✓ PRESCRIPTION REVOKED
            </div>
            <HashDisplay hash={revokeResult.transactionHash} label="Tx Hash" />
          </div>
        )}
      </Card>
    </div>
  );
}