import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8081/api',
  headers: { 'Content-Type': 'application/json' }
});

// Intercept errors globally
API.interceptors.response.use(
  response => response.data,
  error => {
    const backendMessage =
      error.response?.data?.message
      || (typeof error.response?.data === 'string' ? error.response.data : null)
      || error.response?.data?.error;

    const message = backendMessage
      || error.message
      || 'Blockchain transaction failed';
    return Promise.reject(new Error(message));
  }
);

export const blockchainAPI = {

  // ── READ ──────────────────────────────────────────────────────
  health: () =>
    API.get('/prescriptions/health'),

  verify: (hash) =>
    API.get(`/prescriptions/verify/${hash}`),

  getRole: (walletAddress) =>
    API.get(`/auth/role/${walletAddress}`),

  // ── DOCTOR ────────────────────────────────────────────────────
  issue: (patientHash, medicineHash, durationInDays, doctorAddress) =>
    API.post('/prescriptions/issue', {
      patientHash,
      medicineHash,
      durationInDays,
      doctorAddress
    }),

  revoke: (prescriptionHash, doctorAddress) =>
    API.post('/prescriptions/revoke', {
      prescriptionHash,
      doctorAddress
    }),

  // ── PHARMACIST ────────────────────────────────────────────────
  redeem: (prescriptionHash, pharmacistAddress) =>
    API.post('/prescriptions/redeem', {
      prescriptionHash,
      pharmacistAddress
    }),

  // ── ADMIN ─────────────────────────────────────────────────────
  authorizeDoctor: (walletAddress) =>
    API.post('/admin/authorize-doctor', { walletAddress }),

  authorizePharmacist: (walletAddress) =>
    API.post('/admin/authorize-pharmacist', { walletAddress }),
};
