// ─────────────────────────────────────────────────────────────
//  services/api.js  –  HR Portal API layer (Axios / Fetch)
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

  /** List all job openings */
  list: () => request('/mrf'),

  /** Get single job opening by ID */
  get: (id) => request(`/mrf/${id}`),

  /** Delete a job opening and its candidates */
  delete: (id) =>
    request(`/mrf/${id}`, { method: 'DELETE' }),
};

// ── Candidates & Resume Matching ────────────────────────────

export const candidateApi = {
  /**
   * Upload batch of resume files linked to a specific jobOpeningId
   * @param {string} jobOpeningId
   * @param {File[]} files
   */
  uploadResumes: (jobOpeningId, files) => {
    const form = new FormData();
    for (const file of files) {
      form.append('resumes', file);
    }

    return fetch(`${BASE_URL}/mrf/${jobOpeningId}/resumes`, {
      method: 'POST',
      body: form, // browser sets boundary
    }).then(async (res) => {
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `HTTP ${res.status}`);
      }
      return res.json();
    });
  },

  /** Get all candidates globally */
  list: () =>
    request('/candidates'),

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

  /** Export candidates to local CSV file directly on user's hard drive */
  exportLocal: (jobOpeningId) =>
    request('/candidates/export-local', {
      method: 'POST',
      body: JSON.stringify({ jobOpeningId }),
    }),

  /** Get download URL for a job's CSV */
  getDownloadUrl: (jobOpeningId) => `${BASE_URL}/mrf/${jobOpeningId}/download-csv`,
};
