/**
 * Unit Tests for Rule-Based Matching Engine
 */

const {
  calculateMatchScore,
  scoreCategory,
  scoreTitle,
  scoreLocation,
  scoreDescription,
  tokenize,
  extractKeywords,
  computeJaccard
} = require('../src/services/matching.service');

describe('Matching Engine — Unit Tests', () => {
  describe('Helper Functions', () => {
    test('tokenize converts text to lowercase alphanumeric word set', () => {
      const tokens = tokenize('Black Dell Inspiron, 15-inch Laptop!');
      expect(tokens.has('black')).toBe(true);
      expect(tokens.has('dell')).toBe(true);
      expect(tokens.has('inspiron')).toBe(true);
      expect(tokens.has('laptop')).toBe(true);
      // Single character punctuation or letters excluded
      expect(tokens.has(',')).toBe(false);
    });

    test('extractKeywords removes common stopwords', () => {
      const keywords = extractKeywords('Black bag found under the desk with blue sleeve');
      expect(keywords.has('black')).toBe(true);
      expect(keywords.has('sleeve')).toBe(true);
      expect(keywords.has('desk')).toBe(true);
      expect(keywords.has('the')).toBe(false);
      expect(keywords.has('with')).toBe(false);
      expect(keywords.has('under')).toBe(false);
    });

    test('computeJaccard calculates correct set overlap ratio', () => {
      const setA = new Set(['apple', 'banana', 'orange']);
      const setB = new Set(['banana', 'orange', 'grape']);
      // Intersection: {banana, orange} (2), Union: {apple, banana, orange, grape} (4) -> 2/4 = 0.5
      expect(computeJaccard(setA, setB)).toBeCloseTo(0.5, 2);
    });

    test('computeJaccard handles empty sets gracefully', () => {
      expect(computeJaccard(new Set(), new Set())).toBe(0);
      expect(computeJaccard(new Set(['apple']), new Set())).toBe(0);
    });
  });

  describe('Individual Scoring Weights', () => {
    test('scoreCategory awards 30 points for exact match and 0 otherwise', () => {
      expect(scoreCategory('Electronics', 'Electronics')).toBe(30.0);
      expect(scoreCategory('electronics', 'ELECTRONICS')).toBe(30.0);
      expect(scoreCategory('Electronics', 'Documents')).toBe(0.0);
      expect(scoreCategory('', 'Electronics')).toBe(0.0);
    });

    test('scoreTitle awards up to 30 points based on Jaccard similarity', () => {
      // Identical titles
      expect(scoreTitle('Dell Inspiron Laptop', 'Dell Inspiron Laptop')).toBe(30.0);

      // Partial overlap: 2 of 4 tokens
      // Tokens: {'dell', 'inspiron'} overlap in union {'black', 'dell', 'inspiron', 'laptop'} -> 2/4 = 0.5 * 30 = 15.0
      const score = scoreTitle('Dell Inspiron', 'Black Dell Inspiron Laptop');
      expect(score).toBeCloseTo(15.0, 1);

      // Zero overlap
      expect(scoreTitle('Water Bottle', 'Scientific Calculator')).toBe(0.0);
    });

    test('scoreLocation awards 25 points for exact match or substring containment', () => {
      expect(scoreLocation('Central Library', 'Central Library')).toBe(25.0);
      
      // Substring match
      const subScore = scoreLocation('Central Library 2nd Floor', 'Central Library');
      expect(subScore).toBeGreaterThanOrEqual(15.0); // At least 60% of 25

      // Distinct locations
      expect(scoreLocation('Hostel C Block', 'Sports Complex')).toBe(0.0);
    });

    test('scoreDescription awards up to 15 points based on keyword intersection', () => {
      const desc1 = 'Contains black charger, scientific calculator, blue notebook';
      const desc2 = 'Found with black charger and notebook';
      const score = scoreDescription(desc1, desc2);
      expect(score).toBeGreaterThan(5.0);
      expect(score).toBeLessThanOrEqual(15.0);
    });
  });

  describe('Composite calculateMatchScore Function', () => {
    test('same-type items return score 0 and isMatch false', () => {
      const lost1 = { type: 'LOST', category: 'Electronics', title: 'Laptop', location: 'Library', description: 'Dell' };
      const lost2 = { type: 'LOST', category: 'Electronics', title: 'Laptop', location: 'Library', description: 'Dell' };
      const result = calculateMatchScore(lost1, lost2);
      expect(result.score).toBe(0);
      expect(result.isMatch).toBe(false);
    });

    test('Plan Example True Positive: Dell Laptop lost vs found exceeds 60 threshold', () => {
      const lostItem = {
        type: 'LOST',
        category: 'Electronics',
        title: 'Black Dell Laptop',
        location: 'Central Library',
        description: 'Black Dell laptop with charger and blue sleeve'
      };

      const foundItem = {
        type: 'FOUND',
        category: 'Electronics',
        title: 'Black Dell Laptop with accessories',
        location: 'Central Library Reading Hall',
        description: 'Found black Dell laptop, charger, and sleeve on study table'
      };

      const result = calculateMatchScore(lostItem, foundItem);
      expect(result.score).toBeGreaterThan(60.0);
      expect(result.isMatch).toBe(true);
      expect(result.breakdown.category).toBe(30.0);
    });

    test('True Negative: Laptop lost vs Water bottle found stays well below 60 threshold', () => {
      const lostLaptop = {
        type: 'LOST',
        category: 'Electronics',
        title: 'HP Pavilion Laptop',
        location: 'Central Library',
        description: 'Silver HP laptop in black sleeve'
      };

      const foundBottle = {
        type: 'FOUND',
        category: 'Accessories',
        title: 'Milton Steel Water Bottle',
        location: 'Sports Ground',
        description: 'Silver 1L water bottle'
      };

      const result = calculateMatchScore(lostLaptop, foundBottle);
      expect(result.score).toBeLessThan(30.0);
      expect(result.isMatch).toBe(false);
    });
  });
});
