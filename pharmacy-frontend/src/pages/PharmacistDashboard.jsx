import React, { useEffect, useState } from 'react';
import { blockchainAPI } from '../api/blockchain';
import StatusBadge from '../components/shared/StatusBadge';
import RoleBadge from '../components/shared/RoleBadge';
import HashDisplay from '../components/shared/HashDisplay';

const PHARMACIST_ADDRESS = '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC';

export default function PharmacistDashboard() {
  const [role, setRole] = useState('UNKNOWN');
  const [verifyHash,    setVerifyHash]    = useState('');
  const [verifyResult,  setVerifyResult]  = useState(null);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError,   setVerifyError]   = useState('');

  const [redeemHash,    setRedeemHash]    = useState('');
  const [redeemResult,  setRedeemResult]  = useState(null);
  const [redeemLoading, setRedeemLoading] = useState(false);
  const [redeemError,   setRedeemError]   = useState('');

  const handleVerify = async () => {
    if (!verifyHash) { setVerifyError('Hash is required'); return; }
    setVerifyLoading(true); setVerifyError(''); setVerifyResult(null);
    try {
      const result = await blockchainAPI.verify(verifyHash);
      setVerifyResult(result);
    } catch (e) {
      setVerifyError(e.message);
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleRedeem = async () => {
    if (!redeemHash) { setRedeemError('Hash is required'); return; }
    setRedeemLoading(true); setRedeemError(''); setRedeemResult(null);
    try {
      const result = await blockchainAPI.redeem(redeemHash, PHARMACIST_ADDRESS);
      setRedeemResult(result);
    } catch (e) {
      setRedeemError(e.message);
    } finally {
      setRedeemLoading(false);
    }
  };

  const canRedeem = verifyResult &&
    verifyResult.status === 'VALID' &&
    !verifyResult.expired;

  useEffect(() => {
    blockchainAPI.getRole(PHARMACIST_ADDRESS)
      .then((result) => setRole(result.role || result.status || 'UNKNOWN'))
      .catch(() => setRole('UNKNOWN'));
  }, []);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 24px' }}>

      <div style={{ marginBottom: '32px' }} className="animate-in">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <span style={{ fontSize: '28px' }}>💊</span>
          <h1 style={{ fontSize: '24px', fontWeight: 600 }}>Pharmacist Portal</h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Verify prescription integrity and atomically redeem against the blockchain
        </p>
        <div style={{ marginTop: '12px', display: 'inline-flex' }}>
          <RoleBadge role={role} />
        </div>
      </div>

      {/* Step 1: Verify */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: '12px', padding: '28px', marginBottom: '24px',
      }}>
        <h2 style={{
          fontSize: '14px', fontFamily: 'var(--font-mono)',
          color: 'var(--accent-cyan)', letterSpacing: '0.1em', marginBottom: '24px',
        }}>
          ◈ STEP 1 — VERIFY PRESCRIPTION
        </h2>

        <div style={{ marginBottom: '16px' }}>
          <label style={{
            display: 'block', fontSize: '11px', fontFamily: 'var(--font-mono)',
            color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: '8px',
          }}>PRESCRIPTION HASH</label>
          <input
            value={verifyHash}
            onChange={e => setVerifyHash(e.target.value)}
            placeholder="0x..."
            style={{
              width: '100%', padding: '10px 14px',
              background: 'var(--bg-primary)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius)', color: 'var(--text-primary)',
              fontSize: '13px', fontFamily: 'var(--font-mono)', outline: 'none',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--accent-cyan)'}
            onBlur={e  => e.target.style.borderColor = 'var(--border)'}
          />
        </div>

        {verifyError && (
          <div style={{
            padding: '10px 14px', background: 'rgba(255,77,109,0.08)',
            border: '1px solid rgba(255,77,109,0.3)', borderRadius: 'var(--radius)',
            color: 'var(--accent-red)', fontSize: '12px', marginBottom: '8px',
          }}>⚠ {verifyError}</div>
        )}

        <button onClick={handleVerify} disabled={verifyLoading} style={{
          width: '100%', padding: '12px',
          background: verifyLoading ? 'var(--bg-elevated)' : 'rgba(0,212,255,0.08)',
          border: `1px solid ${verifyLoading ? 'var(--border)' : 'var(--accent-cyan)'}`,
          borderRadius: 'var(--radius)', color: verifyLoading ? 'var(--text-muted)' : 'var(--accent-cyan)',
          fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700,
          letterSpacing: '0.1em', cursor: verifyLoading ? 'not-allowed' : 'pointer',
        }}>
          {verifyLoading ? '⟳ QUERYING BLOCKCHAIN...' : '◎ VERIFY ON-CHAIN'}
        </button>

        {verifyResult && (
          <div style={{
            marginTop: '20px', padding: '20px',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-bright)',
            borderRadius: 'var(--radius)',
          }} className="animate-in">
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginBottom: '16px',
            }}>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: '11px',
                color: 'var(--text-muted)', letterSpacing: '0.1em',
              }}>PRESCRIPTION STATUS</span>
              <StatusBadge status={verifyResult.status} isExpired={verifyResult.expired} />
            </div>

            <div style={{ display: 'grid', gap: '10px' }}>
              <HashDisplay hash={verifyResult.prescriptionHash} label="Rx Hash" />
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                padding: '8px 14px', background: 'var(--bg-primary)',
                border: '1px solid var(--border)', borderRadius: 'var(--radius)',
              }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  EXPIRY
                </span>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                  {verifyResult.expiryDate}
                </span>
              </div>
              <div style={{
                padding: '8px 14px', background: 'var(--bg-primary)',
                border: '1px solid var(--border)', borderRadius: 'var(--radius)',
              }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  DOCTOR&nbsp;&nbsp;
                </span>
                <span style={{ fontSize: '11px', color: 'var(--accent-blue)', fontFamily: 'var(--font-mono)' }}>
                  {verifyResult.doctorAddress}
                </span>
              </div>
            </div>

            <div style={{
              marginTop: '12px', fontSize: '12px',
              color: canRedeem ? 'var(--accent-green)' : 'var(--accent-red)',
              fontFamily: 'var(--font-mono)',
            }}>
              {canRedeem ? '✓ ELIGIBLE FOR REDEMPTION' : '✕ ' + verifyResult.message}
            </div>
          </div>
        )}
      </div>

      {/* Step 2: Redeem */}
      <div style={{
        background: 'var(--bg-card)',
        border: `1px solid ${canRedeem ? 'rgba(0,230,118,0.3)' : 'var(--border)'}`,
        borderRadius: '12px', padding: '28px',
        opacity: canRedeem ? 1 : 0.5,
        transition: 'all 0.3s',
      }}>
        <h2 style={{
          fontSize: '14px', fontFamily: 'var(--font-mono)',
          color: 'var(--accent-green)', letterSpacing: '0.1em', marginBottom: '24px',
        }}>
          ◈ STEP 2 — ATOMIC REDEMPTION
          {!canRedeem && <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>
            &nbsp;(verify a VALID prescription first)
          </span>}
        </h2>

        <div style={{ marginBottom: '16px' }}>
          <label style={{
            display: 'block', fontSize: '11px', fontFamily: 'var(--font-mono)',
            color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: '8px',
          }}>PRESCRIPTION HASH TO REDEEM</label>
          <input
            value={redeemHash}
            onChange={e => setRedeemHash(e.target.value)}
            placeholder="0x... (paste from Step 1)"
            disabled={!canRedeem}
            style={{
              width: '100%', padding: '10px 14px',
              background: 'var(--bg-primary)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius)', color: 'var(--text-primary)',
              fontSize: '13px', fontFamily: 'var(--font-mono)', outline: 'none',
              cursor: canRedeem ? 'text' : 'not-allowed',
            }}
          />
        </div>

        {redeemError && (
          <div style={{
            padding: '10px 14px', background: 'rgba(255,77,109,0.08)',
            border: '1px solid rgba(255,77,109,0.3)', borderRadius: 'var(--radius)',
            color: 'var(--accent-red)', fontSize: '12px', marginBottom: '8px',
          }}>⚠ {redeemError}</div>
        )}

        <button
          onClick={handleRedeem}
          disabled={!canRedeem || redeemLoading}
          style={{
            width: '100%', padding: '12px',
            background: (!canRedeem || redeemLoading) ? 'var(--bg-elevated)' : 'rgba(0,230,118,0.08)',
            border: `1px solid ${(!canRedeem || redeemLoading) ? 'var(--border)' : 'var(--accent-green)'}`,
            borderRadius: 'var(--radius)',
            color: (!canRedeem || redeemLoading) ? 'var(--text-muted)' : 'var(--accent-green)',
            fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700,
            letterSpacing: '0.1em',
            cursor: (!canRedeem || redeemLoading) ? 'not-allowed' : 'pointer',
          }}>
          {redeemLoading ? '⟳ SUBMITTING TRANSACTION...' : '⚡ REDEEM PRESCRIPTION (ATOMIC)'}
        </button>

        {redeemResult && (
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
              ✓ MEDICINE DISPENSED — STATE IS NOW PERMANENTLY REDEEMED
            </div>
            <HashDisplay hash={redeemResult.transactionHash} label="Tx Hash" />
            <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
              This prescription can never be redeemed again. The blockchain record is immutable.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
