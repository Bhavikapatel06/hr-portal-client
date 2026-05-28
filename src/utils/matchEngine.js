// ─────────────────────────────────────────────────────────────
//  utils/matchEngine.js
//  Scores candidates against manpower requirements.
//
//  Dimensions & weights:
//    Skills match        40%
//    Experience match    30%
//    Qualification match 20%
//    Job title match     10%
// ─────────────────────────────────────────────────────────────

// Qualification hierarchy (higher index = higher level)
const QUAL_LEVELS = [
  '10th / SSC',
  '12th / HSC',
  'Diploma',
  'Graduate (Any)',
  'B.E. / B.Tech',
  'MBA / PGDM',
  'Post Graduate',
  'Doctorate / PhD',
]

/**
 * Tokenize a string into lowercase keywords (min 2 chars).
 */
function tokenize(str = '') {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s.+#]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length >= 2)
}

/**
 * Skills score: overlap between candidate skills and required skills.
 * Returns 0–100.
 */
function scoreSkills(candidateDetails, requirements) {
  const reqSkills = tokenize(requirements.otherKeySkills || '')
  if (!reqSkills.length) return 60 // no requirements = neutral

  const candidateText = [
    candidateDetails.currentTitle,
    candidateDetails.notes,
    candidateDetails.fullName,
  ].join(' ')
  const candidateSkills = tokenize(candidateText)

  if (!candidateSkills.length) return 0

  const matches = reqSkills.filter(rk =>
    candidateSkills.some(ck => ck.includes(rk) || rk.includes(ck))
  )
  return Math.round((matches.length / reqSkills.length) * 100)
}

/**
 * Experience score: how well candidate years match required range.
 * Requirements format: "3-5 years" / "5+ years" / "2 years"
 * Candidate format: "4 years" / "4" / "4.5"
 * Returns 0–100.
 */
function scoreExperience(candidateDetails, requirements) {
  const reqStr = (requirements.experience || '').toLowerCase()
  const candStr = (candidateDetails.totalExp || '').toLowerCase()

  if (!reqStr) return 60 // no requirement = neutral
  if (!candStr) return 20 // candidate didn't fill — assume low

  // Extract candidate years
  const candMatch = candStr.match(/(\d+\.?\d*)/)
  if (!candMatch) return 20
  const candYears = parseFloat(candMatch[1])

  // Parse requirement: range "3-5", "3–5", or "5+"
  const rangeMatch = reqStr.match(/(\d+\.?\d*)\s*[-–to]+\s*(\d+\.?\d*)/)
  if (rangeMatch) {
    const min = parseFloat(rangeMatch[1])
    const max = parseFloat(rangeMatch[2])
    if (candYears >= min && candYears <= max) return 100
    if (candYears > max) return Math.max(60, 100 - (candYears - max) * 10) // overqualified, still ok
    if (candYears < min) return Math.max(0, 100 - (min - candYears) * 20)
  }

  const plusMatch = reqStr.match(/(\d+\.?\d*)\s*\+/)
  if (plusMatch) {
    const min = parseFloat(plusMatch[1])
    if (candYears >= min) return 100
    return Math.max(0, 100 - (min - candYears) * 20)
  }

  const singleMatch = reqStr.match(/(\d+\.?\d*)/)
  if (singleMatch) {
    const req = parseFloat(singleMatch[1])
    const diff = Math.abs(candYears - req)
    return Math.max(0, 100 - diff * 15)
  }

  return 50
}

/**
 * Qualification score: candidate qualification vs minimum required.
 * Returns 0–100.
 */
function scoreQualification(candidateDetails, requirements) {
  const reqQual = (requirements.minimumQualification || '').trim()
  const candQual = (candidateDetails.highestQual || '').trim()

  if (!reqQual) return 70 // no requirement = neutral
  if (!candQual) return 15 // candidate didn't fill

  const reqIdx = QUAL_LEVELS.findIndex(q =>
    q.toLowerCase().includes(reqQual.toLowerCase()) ||
    reqQual.toLowerCase().includes(q.toLowerCase())
  )
  const candIdx = QUAL_LEVELS.findIndex(q =>
    q.toLowerCase().includes(candQual.toLowerCase()) ||
    candQual.toLowerCase().includes(q.toLowerCase())
  )

  if (reqIdx === -1) return 50 // unknown req
  if (candIdx === -1) return 30 // unknown candidate qual

  if (candIdx >= reqIdx) return 100 // meets or exceeds
  const gap = reqIdx - candIdx
  return Math.max(0, 100 - gap * 25)
}

/**
 * Job title score: fuzzy overlap between candidate title and required designation.
 * Returns 0–100.
 */
function scoreJobTitle(candidateDetails, requirements) {
  const reqTitle = tokenize(requirements.designation || '')
  const candTitle = tokenize(candidateDetails.currentTitle || '')

  if (!reqTitle.length) return 60 // no requirement = neutral
  if (!candTitle.length) return 10

  const matches = reqTitle.filter(rt =>
    candTitle.some(ct => ct.includes(rt) || rt.includes(ct))
  )
  return Math.round((matches.length / reqTitle.length) * 100)
}

/**
 * Classify total score into a match level.
 */
function getMatchLevel(score) {
  if (score >= 80) return 'Strong'
  if (score >= 60) return 'Good'
  if (score >= 35) return 'Partial'
  return 'Low'
}

/**
 * Main scoring function.
 * @param {object} candidateDetails - Candidate detail fields from CandidateCard
 * @param {object} requirements     - Manpower requirements from manpowerStore
 * @returns {{ score: number, matchLevel: string, breakdown: object }}
 */
export function scoreCandidate(candidateDetails, requirements) {
  if (!requirements || !Object.keys(requirements).some(k => requirements[k])) {
    return { score: 0, matchLevel: 'Low', breakdown: {} }
  }

  const skills = scoreSkills(candidateDetails, requirements)
  const experience = scoreExperience(candidateDetails, requirements)
  const qualification = scoreQualification(candidateDetails, requirements)
  const jobTitle = scoreJobTitle(candidateDetails, requirements)

  const score = Math.round(
    skills * 0.40 +
    experience * 0.30 +
    qualification * 0.20 +
    jobTitle * 0.10
  )

  return {
    score,
    matchLevel: getMatchLevel(score),
    breakdown: { skills, experience, qualification, jobTitle },
  }
}

/**
 * Score all candidates against requirements and return sorted results.
 * @param {Array} candidates   - Array of candidate entries
 * @param {object} requirements
 * @returns {Array} - candidates with matchScore, matchLevel, matchBreakdown, sorted desc
 */
export function rankCandidates(candidates, requirements) {
  return candidates
    .map(c => {
      const { score, matchLevel, breakdown } = scoreCandidate(c.details || {}, requirements || {})
      return { ...c, matchScore: score, matchLevel, matchBreakdown: breakdown }
    })
    .sort((a, b) => b.matchScore - a.matchScore)
}

export const MATCH_COLORS = {
  Strong:  { text: 'text-emerald-400', bg: 'bg-emerald-400/15', border: 'border-emerald-400/30', ring: '#34d399' },
  Good:    { text: 'text-accent',      bg: 'bg-accent/15',      border: 'border-accent/30',      ring: '#4F8EF7' },
  Partial: { text: 'text-gold',        bg: 'bg-gold/15',        border: 'border-gold/30',        ring: '#F5A623' },
  Low:     { text: 'text-slate-400',   bg: 'bg-slate-400/15',   border: 'border-slate-400/25',   ring: '#94a3b8' },
}
