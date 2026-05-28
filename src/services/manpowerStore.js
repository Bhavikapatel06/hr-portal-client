// ─────────────────────────────────────────────────────────────
//  services/manpowerStore.js
//  Persistent storage for the Manpower (MRF) file & requirements
//  Uses localStorage so data survives page refreshes.
// ─────────────────────────────────────────────────────────────

const STORAGE_KEY = 'hr_manpower_file'
const CANDIDATES_KEY = 'hr_candidates'

// ── Manpower File ─────────────────────────────────────────────

/**
 * Save manpower file metadata + confirmed requirements.
 * @param {File} file - The uploaded file object
 * @param {object} requirements - Confirmed requirement fields
 */
export function saveManpowerFile(file, requirements = {}) {
  const record = {
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
    uploadedAt: new Date().toISOString(),
    requirements: {
      designation: requirements.designation || '',
      department: requirements.department || '',
      location: requirements.location || '',
      experience: requirements.experience || '',
      minimumQualification: requirements.minimumQualification || '',
      otherKeySkills: requirements.otherKeySkills || '',
      noOfPositions: requirements.noOfPositions || '',
      urgency: requirements.urgency || 'Medium',
      purposeOfJob: requirements.purposeOfJob || '',
      preferredIndustries: requirements.preferredIndustries || '',
    },
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(record))
  } catch (e) {
    console.error('[manpowerStore] Failed to save:', e)
  }
  return record
}

/**
 * Update only the requirements portion of the stored manpower file.
 */
export function updateManpowerRequirements(requirements) {
  const existing = getManpowerFile()
  if (!existing) return null
  const updated = { ...existing, requirements: { ...existing.requirements, ...requirements } }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  } catch (e) {
    console.error('[manpowerStore] Failed to update requirements:', e)
  }
  return updated
}

/**
 * Retrieve the stored manpower file record, or null if not set.
 * @returns {{ fileName, fileSize, fileType, uploadedAt, requirements } | null}
 */
export function getManpowerFile() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

/**
 * Remove the stored manpower file record.
 */
export function clearManpowerFile() {
  localStorage.removeItem(STORAGE_KEY)
}

// ── Candidates ────────────────────────────────────────────────

/**
 * Persist the list of candidate entries (without File objects).
 * @param {Array} entries
 */
export function saveCandidates(entries) {
  const serializable = entries.map(({ id, status, details, matchScore, matchBreakdown }) => ({
    id, status, details, matchScore, matchBreakdown,
    fileName: details._fileName || '',
    fileSize: details._fileSize || 0,
  }))
  try {
    localStorage.setItem(CANDIDATES_KEY, JSON.stringify(serializable))
  } catch (e) {
    console.error('[manpowerStore] Failed to save candidates:', e)
  }
}

/**
 * Load persisted candidates.
 * @returns {Array}
 */
export function getCandidates() {
  try {
    const raw = localStorage.getItem(CANDIDATES_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

/**
 * Clear all stored candidates.
 */
export function clearCandidates() {
  localStorage.removeItem(CANDIDATES_KEY)
}

// ── Helpers ───────────────────────────────────────────────────

export function formatSize(bytes) {
  if (!bytes) return '—'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

export function formatDate(isoString) {
  if (!isoString) return '—'
  return new Date(isoString).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}
