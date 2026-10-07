/**
 * FindIT — Rule-Based Item Matching Engine (No Machine Learning)
 * Calculates similarity between LOST and FOUND items using a deterministic 4-factor formula:
 * 1. Category Match (30%)
 * 2. Item Title Similarity (30%) - Token Jaccard Similarity
 * 3. Location Match (25%) - Substring & Token Jaccard Similarity
 * 4. Description Keyword Overlap (15%) - Stopword-filtered Overlap
 * 
 * Threshold: Total score > 60 triggers a Match record.
 */

// Common English stopwords to filter from description analysis
const STOPWORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and',
  'any', 'are', 'aren', 'as', 'at', 'be', 'because', 'been', 'before', 'being',
  'below', 'between', 'both', 'but', 'by', 'can', 'did', 'do', 'does', 'doing',
  'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had', 'has',
  'have', 'having', 'he', 'her', 'here', 'hers', 'herself', 'him', 'himself',
  'his', 'how', 'i', 'if', 'in', 'into', 'is', 'it', 'its', 'itself', 'just',
  'me', 'more', 'most', 'my', 'myself', 'no', 'nor', 'not', 'now', 'of', 'off',
  'on', 'once', 'only', 'or', 'other', 'our', 'ours', 'ourselves', 'out', 'over',
  'own', 'same', 'she', 'should', 'so', 'some', 'such', 'than', 'that', 'the',
  'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these', 'they',
  'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very',
  'was', 'wasn', 'we', 'were', 'what', 'when', 'where', 'which', 'while',
  'who', 'whom', 'why', 'with', 'found', 'lost', 'near', 'inside'
]);

/**
 * Tokenize a string into lowercase alphabetic/numeric words
 * @param {string} text 
 * @returns {Set<string>}
 */
function tokenize(text) {
  if (!text || typeof text !== 'string') return new Set();
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.trim().length > 1);
  return new Set(words);
}

/**
 * Filter stopwords and tokenize text
 * @param {string} text 
 * @returns {Set<string>}
 */
function extractKeywords(text) {
  const tokens = tokenize(text);
  const filtered = new Set();
  for (const token of tokens) {
    if (!STOPWORDS.has(token)) {
      filtered.add(token);
    }
  }
  return filtered;
}

/**
 * Compute Jaccard Similarity between two token sets: |A ∩ B| / |A ∪ B|
 * @param {Set<string>} setA 
 * @param {Set<string>} setB 
 * @returns {number} Value between 0.0 and 1.0
 */
function computeJaccard(setA, setB) {
  if (setA.size === 0 && setB.size === 0) return 0;
  if (setA.size === 0 || setB.size === 0) return 0;

  let intersectionCount = 0;
  for (const item of setA) {
    if (setB.has(item)) {
      intersectionCount++;
    }
  }

  const unionSize = new Set([...setA, ...setB]).size;
  return unionSize === 0 ? 0 : intersectionCount / unionSize;
}

/**
 * Compute Category Match Score (Weight: 30%)
 * @param {string} cat1 
 * @param {string} cat2 
 * @returns {number}
 */
function scoreCategory(cat1, cat2) {
  if (!cat1 || !cat2) return 0;
  return cat1.trim().toLowerCase() === cat2.trim().toLowerCase() ? 30.0 : 0.0;
}

/**
 * Compute Title Similarity Score (Weight: 30%)
 * Uses Token Jaccard Similarity
 * @param {string} title1 
 * @param {string} title2 
 * @returns {number}
 */
function scoreTitle(title1, title2) {
  const tokens1 = tokenize(title1);
  const tokens2 = tokenize(title2);
  const jaccard = computeJaccard(tokens1, tokens2);
  return Math.round(jaccard * 30.0 * 100) / 100;
}

/**
 * Compute Location Match Score (Weight: 25%)
 * Exact match gives 25. Substring / Token Jaccard scaled to 25.
 * @param {string} loc1 
 * @param {string} loc2 
 * @returns {number}
 */
function scoreLocation(loc1, loc2) {
  if (!loc1 || !loc2) return 0;
  const l1 = loc1.trim().toLowerCase();
  const l2 = loc2.trim().toLowerCase();

  // Exact match
  if (l1 === l2) return 25.0;

  // Substring inclusion (e.g., "Library" in "Central Library 2nd Floor")
  if (l1.includes(l2) || l2.includes(l1)) {
    const tokens1 = tokenize(loc1);
    const tokens2 = tokenize(loc2);
    const jaccard = computeJaccard(tokens1, tokens2);
    // Give at least 60% of weight for substring containment
    return Math.round(Math.max(0.6, jaccard) * 25.0 * 100) / 100;
  }

  const tokens1 = tokenize(loc1);
  const tokens2 = tokenize(loc2);
  const jaccard = computeJaccard(tokens1, tokens2);
  return Math.round(jaccard * 25.0 * 100) / 100;
}

/**
 * Compute Description Keyword Overlap Score (Weight: 15%)
 * Stopword-filtered keyword intersection ratio
 * @param {string} desc1 
 * @param {string} desc2 
 * @returns {number}
 */
function scoreDescription(desc1, desc2) {
  const kw1 = extractKeywords(desc1);
  const kw2 = extractKeywords(desc2);

  if (kw1.size === 0 || kw2.size === 0) return 0;

  let intersectionCount = 0;
  for (const item of kw1) {
    if (kw2.has(item)) {
      intersectionCount++;
    }
  }

  const minSize = Math.min(kw1.size, kw2.size);
  const ratio = minSize === 0 ? 0 : intersectionCount / minSize;
  return Math.round(ratio * 15.0 * 100) / 100;
}

/**
 * Calculate comprehensive match score between two items
 * @param {object} item1 - Newly submitted item
 * @param {object} item2 - Candidate item
 * @returns {{ score: number, breakdown: object, isMatch: boolean }}
 */
function calculateMatchScore(item1, item2) {
  // Items of the same type cannot match (LOST matches FOUND only)
  if (item1.type === item2.type) {
    return {
      score: 0,
      breakdown: { category: 0, title: 0, location: 0, description: 0 },
      isMatch: false
    };
  }

  const catScore = scoreCategory(item1.category, item2.category);
  const titleScore = scoreTitle(item1.title, item2.title);
  const locScore = scoreLocation(item1.location, item2.location);
  const descScore = scoreDescription(item1.description, item2.description);

  const rawScore = catScore + titleScore + locScore + descScore;
  const score = Math.round(rawScore * 100) / 100;

  return {
    score,
    breakdown: {
      category: catScore,
      title: titleScore,
      location: locScore,
      description: descScore
    },
    isMatch: score > 60.0
  };
}

module.exports = {
  calculateMatchScore,
  scoreCategory,
  scoreTitle,
  scoreLocation,
  scoreDescription,
  tokenize,
  extractKeywords,
  computeJaccard
};
