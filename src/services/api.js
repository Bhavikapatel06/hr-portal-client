// ─────────────────────────────────────────────────────────────
//  services/api.js  –  HR Portal API layer
// ─────────────────────────────────────────────────────────────

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return res.json();
}

// ── Manpower Request Forms (Job Openings) ────────────────────

export const mrfApi = {
  /** Submit a new MRF (Creates standard Job Opening in DB) */
  submit: (data) =>
    request('/mrf', { method: 'POST', body: JSON.stringify(data) }),

  /** Update an existing MRF */
  update: (id, data) =>
    request(`/mrf/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  /** List all job openings */
  list: () => request('/mrf'),

  /** Get single job opening by ID */
  get: (id) => request(`/mrf/${id}`),

  /** Delete a job opening and its candidates */
  delete: (id) =>
    request(`/mrf/${id}`, { method: 'DELETE' }),

  /** Upload and parse MRF PDF — returns prefill data, does NOT save to DB */
  parseFile: (file) => {
    const form = new FormData();
    form.append('mrfFile', file);
    return fetch(`${BASE_URL}/mrf/parse`, {
      method: 'POST',
      body: form,
    }).then(async (res) => {
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `HTTP ${res.status}`);
      }
      return res.json();
    });
  },
};

// ── Candidates & Resume Matching ────────────────────────────

export const candidateApi = {
  /**
   * Upload batch of resume files linked to a specific jobOpeningId (HR side)
   */
  uploadResumes: (jobOpeningId, files) => {
    const form = new FormData();
    for (const file of files) form.append('resumes', file);
    return fetch(`${BASE_URL}/mrf/${jobOpeningId}/resumes`, {
      method: 'POST',
      body: form,
    }).then(async (res) => {
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `HTTP ${res.status}`);
      }
      return res.json();
    });
  },

  /**
   * Upload and parse a single resume file (Candidate side) without saving to DB
   */
  parseResume: (jobOpeningId, file) => {
    const form = new FormData();
    form.append('resume', file);
    return fetch(`${BASE_URL}/mrf/${jobOpeningId}/parse-resume`, {
      method: 'POST',
      body: form,
    }).then(async (res) => {
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `HTTP ${res.status}`);
      }
      return res.json();
    });
  },

  /**
   * Candidate applies to a job opening by submitting their details form
   */
  applyToJob: (jobOpeningId, formData) =>
    request(`/mrf/${jobOpeningId}/apply`, {
      method: 'POST',
      body: JSON.stringify(formData),
    }),

  /** Get all candidates globally */
  list: () => request('/candidates'),

  /** Get all candidates for a specific Job Opening (ranked by score) */
  listByJob: (jobOpeningId) =>
    request(`/mrf/${jobOpeningId}/candidates`),

  /** Manually update a candidate's details (triggers auto re-score) */
  updateDetails: (candidateId, details) =>
    request(`/candidates/${candidateId}/details`, {
      method: 'PUT',
      body: JSON.stringify(details),
    }),

  /** Schedule/update an interview for a candidate */
  updateInterview: (candidateId, interviewData) =>
    request(`/candidates/${candidateId}/interview`, {
      method: 'PUT',
      body: JSON.stringify(interviewData),
    }),

  /** Record feedback and final hiring decision */
  saveFeedback: (candidateId, feedbackData) =>
    request(`/candidates/${candidateId}/feedback`, {
      method: 'PUT',
      body: JSON.stringify(feedbackData),
    }),

  /** Delete candidate record & file from disk */
  delete: (candidateId) =>
    request(`/candidates/${candidateId}`, { method: 'DELETE' }),

  /** Get download URL for a job's candidate CSV (FIFO order, streams in-memory) */
  getDownloadUrl: (jobOpeningId) => `${BASE_URL}/mrf/${jobOpeningId}/download-csv`,

  /** Get download URL for MRF details as a formatted text file */
  getMrfDownloadUrl: (jobOpeningId) => `${BASE_URL}/mrf/${jobOpeningId}/download-mrf`,

  /** Get download URL for ALL candidates across all openings (FIFO order) */
  getGlobalDownloadUrl: () => `${BASE_URL}/candidates/download-all`,

  /** Get all applications/statuses for a candidate by email */
  getStatusByEmail: (email) => request(`/candidates/status/${encodeURIComponent(email)}`),
};
