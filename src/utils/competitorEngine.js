/**
 * competitorEngine.js
 * ─────────────────────────────────────────────────────────────────────────────
 * MenuIQ — Core logic for defining who the real competitors of any restaurant
 * are, based on shared delivery areas, physical proximity and cuisine match.
 *
 * PHILOSOPHY
 * Two restaurants are competitors only if they compete for the SAME customer's
 * order at the SAME moment.  That is determined by:
 *   1. Shared delivery zone  — do both restaurants serve the same postcodes?
 *   2. Cuisine match         — pizza vs pizza, not pizza vs chicken
 *   3. Physical distance     — closer = stronger competitive pressure
 *
 * TIER SYSTEM
 *   Tier 1 – Direct    : same area(s) + same cuisine + ≤ 3 km
 *   Tier 2 – Adjacent  : neighbouring area OR same area but 3–6 km
 *   Tier 3 – Distant   : no area overlap, > 6 km  (excluded by default)
 *
 * USAGE
 *   import { classifyCompetitor, getCompetitorTier, buildSupabaseQuery,
 *            calcPriceBenchmark, sortByRelevance } from '../utils/competitorEngine';
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ─── 1. AREA NAMES ────────────────────────────────────────────────────────────
// These are the canonical area names used in the `restaurants.areas` Supabase
// column AND in the east_london_areas.json GeoJSON file.
// Keep this list in sync with whatever values the scraper writes to the DB.

export const AREAS = {
  BARKING_AND_DAGENHAM:    'Barking and Dagenham',
  GREENWICH:               'Greenwich',
  HACKNEY:                 'Hackney',
  NEWHAM:                  'Newham',
  ILFORD:                  'Ilford (Redbridge)',
  WHITECHAPEL:             'Whitechapel (Tower Hamlets)',
  WALTHAM_FOREST:          'Waltham Forest',
  // Sub-areas / scraper granular names (map to parent borough for adjacency)
  SEVEN_KINGS:             'Seven Kings',
  GOODMAYES:               'Goodmayes',
  CHADWELL_HEATH:          'Chadwell Heath',
  BARKING:                 'Barking',
  DAGENHAM:                'Dagenham',
  STRATFORD:               'Stratford',
  MARYLAND:                'Maryland',
  FOREST_GATE:             'Forest Gate',
  WEST_HAM:                'West Ham',
  BETHNAL_GREEN:           'Bethnal Green',
  STEPNEY:                 'Stepney',
  MILE_END:                'Mile End',
  WALTHAMSTOW:             'Walthamstow',
  LEYTON:                  'Leyton',
  LEYTONSTONE:             'Leytonstone',
  EAST_HAM:                'East Ham',
  MANOR_PARK:              'Manor Park',
  PLAISTOW:                'Plaistow',
  UPTON_PARK:              'Upton Park',
};


// ─── 2. AREA ADJACENCY MAP ────────────────────────────────────────────────────
// Defines which areas share a border or are close enough that some customers
// sit on the boundary between both.  Relationship is bi-directional.
//
// HOW TO READ:
//   'Ilford (Redbridge)': [...] means an Ilford restaurant's Tier-2 pool
//   includes all of these bordering areas.
//
// Derived from the GeoJSON polygon boundaries in east_london_areas.json.

export const AREA_ADJACENCY = {
  // ── Borough-level ────────────────────────────────────────────────────────
  [AREAS.ILFORD]: [
    AREAS.BARKING_AND_DAGENHAM,
    AREAS.WALTHAM_FOREST,
    AREAS.NEWHAM,
    // granular sub-areas that border Ilford
    AREAS.SEVEN_KINGS,
    AREAS.GOODMAYES,
    AREAS.CHADWELL_HEATH,
    AREAS.BARKING,
    AREAS.EAST_HAM,
  ],

  [AREAS.BARKING_AND_DAGENHAM]: [
    AREAS.ILFORD,
    AREAS.NEWHAM,
    AREAS.GREENWICH,
    AREAS.BARKING,
    AREAS.DAGENHAM,
    AREAS.CHADWELL_HEATH,
  ],

  [AREAS.NEWHAM]: [
    AREAS.BARKING_AND_DAGENHAM,
    AREAS.ILFORD,
    AREAS.HACKNEY,
    AREAS.WHITECHAPEL,
    AREAS.WALTHAM_FOREST,
    AREAS.STRATFORD,
    AREAS.WEST_HAM,
    AREAS.FOREST_GATE,
    AREAS.EAST_HAM,
    AREAS.PLAISTOW,
    AREAS.UPTON_PARK,
    AREAS.MANOR_PARK,
  ],

  [AREAS.HACKNEY]: [
    AREAS.WHITECHAPEL,
    AREAS.NEWHAM,
    AREAS.WALTHAM_FOREST,
    AREAS.BETHNAL_GREEN,
    AREAS.STRATFORD,
    AREAS.LEYTON,
    AREAS.LEYTONSTONE,
  ],

  [AREAS.WHITECHAPEL]: [
    AREAS.HACKNEY,
    AREAS.NEWHAM,
    AREAS.BETHNAL_GREEN,
    AREAS.STEPNEY,
    AREAS.MILE_END,
  ],

  [AREAS.WALTHAM_FOREST]: [
    AREAS.ILFORD,
    AREAS.NEWHAM,
    AREAS.HACKNEY,
    AREAS.WALTHAMSTOW,
    AREAS.LEYTON,
    AREAS.LEYTONSTONE,
    AREAS.FOREST_GATE,
  ],

  [AREAS.GREENWICH]: [
    AREAS.BARKING_AND_DAGENHAM,
  ],

  // ── Granular sub-areas (pointing back to borough + own neighbours) ────────
  [AREAS.SEVEN_KINGS]:    [AREAS.ILFORD, AREAS.GOODMAYES, AREAS.FOREST_GATE],
  [AREAS.GOODMAYES]:      [AREAS.ILFORD, AREAS.SEVEN_KINGS, AREAS.CHADWELL_HEATH],
  [AREAS.CHADWELL_HEATH]: [AREAS.GOODMAYES, AREAS.BARKING_AND_DAGENHAM, AREAS.BARKING],
  [AREAS.BARKING]:        [AREAS.BARKING_AND_DAGENHAM, AREAS.ILFORD, AREAS.EAST_HAM, AREAS.DAGENHAM],
  [AREAS.DAGENHAM]:       [AREAS.BARKING_AND_DAGENHAM, AREAS.BARKING, AREAS.CHADWELL_HEATH],
  [AREAS.STRATFORD]:      [AREAS.NEWHAM, AREAS.HACKNEY, AREAS.WEST_HAM, AREAS.MARYLAND, AREAS.FOREST_GATE],
  [AREAS.MARYLAND]:       [AREAS.STRATFORD, AREAS.FOREST_GATE, AREAS.WALTHAM_FOREST],
  [AREAS.FOREST_GATE]:    [AREAS.NEWHAM, AREAS.STRATFORD, AREAS.MARYLAND, AREAS.EAST_HAM, AREAS.ILFORD, AREAS.WALTHAM_FOREST],
  [AREAS.WEST_HAM]:       [AREAS.NEWHAM, AREAS.STRATFORD, AREAS.PLAISTOW, AREAS.UPTON_PARK],
  [AREAS.BETHNAL_GREEN]:  [AREAS.HACKNEY, AREAS.WHITECHAPEL, AREAS.STEPNEY, AREAS.MILE_END],
  [AREAS.STEPNEY]:        [AREAS.WHITECHAPEL, AREAS.BETHNAL_GREEN, AREAS.MILE_END],
  [AREAS.MILE_END]:       [AREAS.STEPNEY, AREAS.BETHNAL_GREEN, AREAS.WHITECHAPEL],
  [AREAS.WALTHAMSTOW]:    [AREAS.WALTHAM_FOREST, AREAS.LEYTON, AREAS.LEYTONSTONE],
  [AREAS.LEYTON]:         [AREAS.WALTHAM_FOREST, AREAS.HACKNEY, AREAS.WALTHAMSTOW, AREAS.LEYTONSTONE, AREAS.STRATFORD],
  [AREAS.LEYTONSTONE]:    [AREAS.WALTHAM_FOREST, AREAS.HACKNEY, AREAS.LEYTON, AREAS.FOREST_GATE],
  [AREAS.EAST_HAM]:       [AREAS.NEWHAM, AREAS.ILFORD, AREAS.BARKING, AREAS.UPTON_PARK, AREAS.MANOR_PARK, AREAS.FOREST_GATE],
  [AREAS.MANOR_PARK]:     [AREAS.NEWHAM, AREAS.EAST_HAM, AREAS.FOREST_GATE],
  [AREAS.PLAISTOW]:       [AREAS.NEWHAM, AREAS.WEST_HAM, AREAS.UPTON_PARK],
  [AREAS.UPTON_PARK]:     [AREAS.NEWHAM, AREAS.EAST_HAM, AREAS.WEST_HAM, AREAS.PLAISTOW],
};


// ─── 3. CUISINE NORMALISATION ─────────────────────────────────────────────────
// The scraper may record slightly different cuisine strings across restaurants.
// We normalise to a canonical slug before comparing.

const CUISINE_ALIASES = {
  pizza:        ['pizza', 'pizzas', 'italian pizza', 'neapolitan'],
  burger:       ['burger', 'burgers', 'gourmet burgers', 'smashburger'],
  chicken:      ['chicken', 'fried chicken', 'grilled chicken', 'wings', 'peri peri'],
  kebab:        ['kebab', 'kebabs', 'shawarma', 'doner', 'ocakbasi', 'adana'],
  indian:       ['indian', 'curry', 'bangladeshi', 'pakistani', 'south asian'],
  chinese:      ['chinese', 'cantonese', 'dim sum', 'noodles'],
  sushi:        ['sushi', 'japanese', 'ramen'],
  fish_chips:   ['fish and chips', 'fish & chips', 'chippy'],
  vegan:        ['vegan', 'plant based', 'plant-based', 'vegetarian'],
  halal:        ['halal'],
  dessert:      ['dessert', 'desserts', 'ice cream', 'waffles', 'crepes'],
  caribbean:    ['caribbean', 'jamaican', 'jerk'],
};

/**
 * Normalise a cuisine string to a canonical slug.
 * Returns the original lowercase string if no alias matches.
 * @param {string} cuisine
 * @returns {string} canonical slug
 */
export function normaliseCuisine(cuisine) {
  if (!cuisine) return '';
  const lower = cuisine.toLowerCase().trim();
  for (const [canonical, aliases] of Object.entries(CUISINE_ALIASES)) {
    if (aliases.some(alias => lower.includes(alias))) return canonical;
  }
  return lower;
}

/**
 * Check whether two cuisine arrays share at least one canonical type.
 * @param {string[]} cuisinesA
 * @param {string[]} cuisinesB
 * @returns {boolean}
 */
export function cuisinesOverlap(cuisinesA = [], cuisinesB = []) {
  const normA = new Set(cuisinesA.map(normaliseCuisine));
  return cuisinesB.some(c => normA.has(normaliseCuisine(c)));
}


// ─── 4. GEOGRAPHICAL HELPERS ──────────────────────────────────────────────────

/**
 * Haversine formula — great-circle distance between two lat/lng points.
 * @param {number} lat1
 * @param {number} lon1
 * @param {number} lat2
 * @param {number} lon2
 * @returns {number} distance in kilometres
 */
export function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Return all areas that are neighbours of at least one area in the input set.
 * The input areas themselves are NOT included in the result.
 * @param {string[]} areas  — the owner's delivery areas
 * @returns {string[]}      — unique list of neighbouring areas
 */
export function getNeighbouringAreas(areas = []) {
  const ownerSet = new Set(areas);
  const neighbours = new Set();
  for (const area of areas) {
    const adj = AREA_ADJACENCY[area] || [];
    for (const n of adj) {
      if (!ownerSet.has(n)) neighbours.add(n);
    }
  }
  return [...neighbours];
}


// ─── 5. COMPETITOR CLASSIFICATION ────────────────────────────────────────────

/**
 * TIER CONSTANTS
 *
 * Tier is determined PURELY by area relationship — not by distance.
 * Distance only influences the relevance SCORE within a tier.
 *
 *   Tier 1 — Direct   : candidate serves AT LEAST ONE of the owner's same areas
 *   Tier 2 — Adjacent : candidate serves a BORDERING area (but not the same area)
 *   Tier 3 — Distant  : no area connection whatsoever (excluded by default)
 *   null   — None     : different cuisine, not a competitor at all
 */
export const TIER = {
  DIRECT:   1,   // 🔴 Serves same area(s) as owner  — fights for the same customers
  ADJACENT: 2,   // 🟡 Serves a bordering area        — some customer overlap at boundaries
  DISTANT:  3,   // ⚪ No area connection              — excluded by default
  NONE:     null // ✖  Different cuisine               — not a competitor at all
};

/**
 * Classify a candidate restaurant against the owner restaurant.
 *
 * RULE (simple and clear):
 *   Tier 1 → candidate.areas overlaps with owner.areas          (same area)
 *   Tier 2 → candidate.areas overlaps with owner's NEIGHBOURS   (bordering area)
 *   Tier 3 → no area connection at all
 *   null   → different cuisine
 *
 * Distance (haversine) is computed here for use in scoring but does NOT
 * change which tier a restaurant belongs to.
 *
 * @param {object} owner      — { id, areas: string[], cuisines: string[], lat?, lng? }
 * @param {object} candidate  — { id, areas: string[], cuisines: string[], lat?, lng? }
 * @returns {{ tier, sharedAreas, neighbouringAreas, distanceKm, reason }}
 */
export function classifyCompetitor(owner, candidate) {
  // Can't compete with yourself
  if (owner.id === candidate.id) return null;

  // ── Step 1: cuisine gate — must share at least one cuisine type ──────────
  if (!cuisinesOverlap(owner.cuisines, candidate.cuisines)) {
    return {
      tier: TIER.NONE,
      sharedAreas: [],
      neighbouringAreas: [],
      distanceKm: null,
      reason: 'Different cuisine — not a competitor',
    };
  }

  // ── Step 2: area analysis ────────────────────────────────────────────────
  const ownerAreaSet    = new Set(owner.areas || []);
  const ownerNeighbours = new Set(getNeighbouringAreas(owner.areas || []));

  // Areas the candidate serves that are IDENTICAL to the owner's areas
  const sharedAreas = (candidate.areas || []).filter(a => ownerAreaSet.has(a));

  // Areas the candidate serves that BORDER the owner's areas (but are not the same)
  const neighbouringAreas = (candidate.areas || []).filter(
    a => ownerNeighbours.has(a) && !ownerAreaSet.has(a)
  );

  // ── Step 3: distance (for scoring only) ─────────────────────────────────
  let distanceKm = null;
  if (owner.lat && owner.lng && candidate.lat && candidate.lng) {
    distanceKm = haversineKm(owner.lat, owner.lng, candidate.lat, candidate.lng);
  }

  // ── Step 4: assign tier based ONLY on area relationship ─────────────────

  // TIER 1 — candidate serves at least one of the SAME areas as the owner
  // Example: owner is in Ilford → any other restaurant also serving Ilford = Tier 1
  if (sharedAreas.length >= 1) {
    return {
      tier: TIER.DIRECT,
      sharedAreas,
      neighbouringAreas,
      distanceKm,
      reason: `Both serve ${sharedAreas.join(', ')}`,
    };
  }

  // TIER 2 — candidate serves a BORDERING area (no same-area overlap)
  // Example: owner is in Ilford → restaurant in Barking/Seven Kings/Dagenham = Tier 2
  if (neighbouringAreas.length >= 1) {
    return {
      tier: TIER.ADJACENT,
      sharedAreas: [],
      neighbouringAreas,
      distanceKm,
      reason: `Serves bordering area: ${neighbouringAreas.join(', ')}`,
    };
  }

  // TIER 3 — no area connection at all
  // Example: owner is in Ilford → restaurant only serving Whitechapel/Stratford = Tier 3
  return {
    tier: TIER.DISTANT,
    sharedAreas: [],
    neighbouringAreas: [],
    distanceKm,
    reason: 'No area connection — different customer pool entirely',
  };
}


// ─── 6. RELEVANCE SCORE ───────────────────────────────────────────────────────
/**
 * Compute a 0–100 relevance score for a competitor vs the owner.
 * Higher = more dangerous / more relevant to the owner.
 *
 * This score is used to RANK competitors within their tier —
 * it does NOT change which tier they belong to.
 *
 * Scoring weights:
 *   35 pts  — Tier base score   (Tier 1 starts higher than Tier 2)
 *   25 pts  — Area overlap depth (how many areas do they share?)
 *   25 pts  — Physical proximity (closer = higher competitive pressure)
 *   15 pts  — Activity level    (promo count + recent price changes)
 *
 * @param {object} owner
 * @param {object} candidate
 * @param {{ tier, sharedAreas, distanceKm }} classification
 * @returns {number} 0–100
 */
export function relevanceScore(owner, candidate, classification) {
  if (!classification || classification.tier === TIER.NONE || classification.tier === TIER.DISTANT) return 0;

  let score = 0;

  // ── Tier base (35 pts) ────────────────────────────────────────────────
  // Tier 1 (same area) always starts with more points than Tier 2 (bordering)
  score += classification.tier === TIER.DIRECT ? 35 : 15;

  // ── Area overlap depth (25 pts) ───────────────────────────────────────
  // More shared areas = more of the owner's customer base is contested
  const sharedCount     = classification.sharedAreas.length;
  const totalOwnerAreas = Math.max(1, (owner.areas || []).length);
  const areaScore       = Math.min(25, (sharedCount / totalOwnerAreas) * 25);
  score += areaScore;

  // ── Physical proximity (25 pts) ────────────────────────────────────────
  // Closer restaurants = higher competitive pressure within the same area
  if (classification.distanceKm !== null) {
    // Linear decay: 0 km = 25 pts, 8 km = 0 pts
    const proximityScore = Math.max(0, 25 - (classification.distanceKm / 8) * 25);
    score += proximityScore;
  } else {
    // No lat/lng data — give flat partial credit
    score += classification.tier === TIER.DIRECT ? 15 : 8;
  }

  // ── Activity level (15 pts) ────────────────────────────────────────────
  // Restaurants actively changing prices or running promos are a bigger threat
  // These fields come from the scraper delta pipeline:
  //   candidate.promo_count         — active promotions detected
  //   candidate.price_change_count  — price changes in last 30 days
  const promoBonus  = Math.min(8, (candidate.promo_count        || 0) * 3);
  const changeBonus = Math.min(7, (candidate.price_change_count || 0) * 2);
  score += promoBonus + changeBonus;

  return Math.min(100, Math.round(score));
}


// ─── 7. THREAT LABEL ─────────────────────────────────────────────────────────
/**
 * Human-readable threat label + colour from a relevance score.
 * @param {number} score  0–100
 * @returns {{ label: string, color: string, bg: string }}
 */
export function threatFromScore(score) {
  if (score >= 70) return { label: 'High Threat',   color: '#B91C1C', bg: '#FEF2F2' };
  if (score >= 40) return { label: 'Watch',         color: '#B45309', bg: '#FFFBEB' };
  return              { label: 'Low Threat',   color: '#065F46', bg: '#ECFDF5' };
}


// ─── 8. SORT BY RELEVANCE ─────────────────────────────────────────────────────
/**
 * Given the owner and an array of candidate restaurants (already fetched from
 * Supabase), classify and score each one, filter out DISTANT/NONE, and return
 * them sorted by relevance score descending.
 *
 * @param {object}   owner       — owner restaurant object
 * @param {object[]} candidates  — array of other restaurants from DB
 * @param {{ includeTier3?: boolean }} options
 * @returns {Array<{ restaurant: object, tier: number, score: number, classification: object, threat: object }>}
 */
export function sortByRelevance(owner, candidates, options = {}) {
  const { includeTier3 = false } = options;

  return candidates
    .map(candidate => {
      const classification = classifyCompetitor(owner, candidate);
      if (!classification) return null;
      if (!includeTier3 && (classification.tier === TIER.DISTANT || classification.tier === TIER.NONE)) return null;

      const score = relevanceScore(owner, candidate, classification);
      const threat = threatFromScore(score);

      return { restaurant: candidate, tier: classification.tier, score, classification, threat };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score);
}


// ─── 9. SUPABASE QUERY BUILDER ────────────────────────────────────────────────
/**
 * Build and execute a Supabase query that returns Tier-1 and Tier-2 competitors
 * for the given owner restaurant.
 *
 * The query uses Postgres array overlap operator (&&) to find restaurants
 * that share at least one delivery area with the owner OR with their neighbours.
 *
 * @param {object} supabase      — Supabase client instance
 * @param {object} owner         — { id, areas: string[], cuisines: string[] }
 * @returns {Promise<object[]>}  — raw rows from the `restaurants` table
 *
 * EXAMPLE:
 *   const competitors = await fetchCompetitors(supabase, ownerRestaurant);
 */
export async function fetchCompetitors(supabase, owner) {
  const neighbourAreas = getNeighbouringAreas(owner.areas || []);

  // Combine owner's own areas + neighbouring areas for the query
  const allRelevantAreas = [...new Set([...(owner.areas || []), ...neighbourAreas])];

  // Normalised cuisine list for filtering
  const normCuisines = (owner.cuisines || []).map(normaliseCuisine);

  const { data, error } = await supabase
    .from('restaurants')
    .select(`
      id,
      name,
      hero_image_url,
      address,
      areas,
      cuisines,
      rating,
      rating_count,
      delivery_fee,
      ubereats_url
    `)
    .neq('id', owner.id)                       // exclude self
    .overlaps('areas', allRelevantAreas)        // must serve at least one relevant area
    .order('rating_count', { ascending: false })
    .limit(100);                                // fetch up to 100, score+filter in JS

  if (error) {
    console.error('[competitorEngine] fetchCompetitors error:', error.message);
    return [];
  }

  // Filter by cuisine overlap in JS (Supabase doesn't do normalised text matching)
  const cuisineFiltered = (data || []).filter(r =>
    cuisinesOverlap(owner.cuisines, r.cuisines || [])
  );

  return cuisineFiltered;
}

/**
 * Convenience: fetch + classify + sort in one call.
 *
 * @param {object} supabase
 * @param {object} owner
 * @returns {Promise<Array<{ restaurant, tier, score, classification, threat }>>}
 *
 * EXAMPLE:
 *   const ranked = await getRankedCompetitors(supabase, ownerRestaurant);
 *   const directCompetitors = ranked.filter(c => c.tier === TIER.DIRECT);
 */
export const MOCK_DATASET = [
  {
    id: 1,
    name: "Yummie Pizza and Peri Peri",
    tier: 1,
    lat: 51.5272, // Bethnal Green coordinate baseline
    lng: -0.0556,
    areaName: "Barking, Bethnal Green",
    cuisine: "Pizza, Turkish",
    hasActivePromos: true,
    isWatchlisted: false,
    threatScore: 75,
    platforms: ["Uber Eats"],
    avatarUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=80&auto=format&fit=crop&q=60",
    promotions: [
      { platform: "Uber Eats", type: "Free Delivery", desc: "Free delivery over £15", productImageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=40&auto=format&fit=crop&q=60" }
    ]
  },
  {
    id: 2,
    name: "Simply Pizza",
    tier: 1,
    lat: 51.5276, // Bromley by Bow baseline
    lng: -0.0108,
    areaName: "Barking, Bromley by Bow",
    cuisine: "Pizza, American",
    hasActivePromos: true,
    isWatchlisted: true, // Sample item added to watchlist
    threatScore: 75,
    platforms: ["Uber Eats"],
    avatarUrl: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=80&auto=format&fit=crop&q=60",
    promotions: [
      { platform: "Uber Eats", type: "Tiered Discount", desc: "Spend £25, Save £5", productImageUrl: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=40&auto=format&fit=crop&q=60" }
    ]
  },
  {
    id: 3,
    name: "The White Haus",
    tier: 2,
    lat: 51.5305, // Adjacent border zone coordinate
    lng: -0.0384,
    areaName: "Bethnal Green, Bromley by Bow",
    cuisine: "Burgers, Indian",
    hasActivePromos: false,
    isWatchlisted: false,
    threatScore: 23,
    platforms: ["Uber Eats"],
    avatarUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=80&auto=format&fit=crop&q=60",
    promotions: []
  },
  {
    id: 4,
    name: "King Pizza & Grill",
    tier: 1,
    lat: 51.5585, // Core Ilford area grid
    lng: 0.0555,
    areaName: "Ilford Central",
    cuisine: "Pizza, Halal",
    hasActivePromos: true,
    isWatchlisted: true, // Watchlisted item
    threatScore: 88,
    platforms: ["Deliveroo", "Uber Eats"],
    avatarUrl: "https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=80&auto=format&fit=crop&q=60",
    promotions: [
      { platform: "Deliveroo", type: "BOGO", desc: "Buy 1 Get 1 Free on Sides", productImageUrl: "https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=40&auto=format&fit=crop&q=60" }
    ]
  },
  {
    id: 5,
    name: "Mamma Mia Pizzeria",
    tier: 1,
    lat: 51.5542,
    lng: 0.0610,
    areaName: "Ilford South",
    cuisine: "Italian, Pizza",
    hasActivePromos: false,
    isWatchlisted: false,
    threatScore: 45,
    platforms: ["Just Eat"],
    avatarUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=80&auto=format&fit=crop&q=60",
    promotions: []
  },
  {
    id: 6,
    name: "Waltham Grill",
    tier: 2,
    lat: 51.5682, // Waltham Forest adjacent border zone
    lng: 0.0124,
    areaName: "Waltham Forest Corridor",
    cuisine: "Gourmet Kebabs",
    hasActivePromos: true,
    isWatchlisted: false,
    threatScore: 61,
    platforms: ["Deliveroo"],
    avatarUrl: "https://images.unsplash.com/photo-1561651823-34fed022540d?w=80&auto=format&fit=crop&q=60",
    promotions: [
      { platform: "Deliveroo", type: "10% Off", desc: "10% off entire menu basket", productImageUrl: "https://images.unsplash.com/photo-1561651823-34fed022540d?w=40&auto=format&fit=crop&q=60" }
    ]
  }
];

export async function getRankedCompetitors(supabase, owner) {
  // Return the mock dataset formatted exactly like the components expect
  return MOCK_DATASET.map(mock => {
    return {
      restaurant: {
        id: mock.id.toString(),
        name: mock.name,
        lat: mock.lat,
        lng: mock.lng,
        areas: mock.areaName.split(', '),
        cuisines: mock.cuisine.split(', '),
        promo_count: mock.hasActivePromos ? mock.promotions.length : 0,
        delivery_fee: "0.00",
        hero_image_url: mock.avatarUrl,
        ubereats_url: mock.platforms.includes("Uber Eats") ? "https://ubereats.com" : null,
        deliveroo_url: mock.platforms.includes("Deliveroo") ? "https://deliveroo.co.uk" : null,
        justeat_url: mock.platforms.includes("Just Eat") ? "https://just-eat.co.uk" : null,
        isWatchlisted: mock.isWatchlisted
      },
      tier: mock.tier,
      score: mock.threatScore,
      threat: threatFromScore(mock.threatScore),
      classification: {
        sharedAreas: mock.tier === 1 ? mock.areaName.split(', ') : [],
        neighbouringAreas: mock.tier === 2 ? mock.areaName.split(', ') : []
      }
    };
  });
}


// ─── 10. PRICE BENCHMARK ENGINE ───────────────────────────────────────────────
/**
 * Given the owner's own menu items and competitor menu items from the DB,
 * compute price benchmarks grouped by normalised category/section.
 *
 * @param {object[]} ownerItems       — rows from menu_items where restaurant_id = owner.id
 * @param {object[]} competitorItems  — rows from menu_items for Tier-1 competitors
 * @param {{ includeAdjacent?: boolean }} options
 * @returns {object} benchmark map keyed by section_name
 *
 * Shape of each benchmark entry:
 * {
 *   category: string,
 *   min: number,
 *   max: number,
 *   avg: number,
 *   median: number,
 *   restaurantCount: number,
 *   itemCount: number,
 *   yourItems: [{ name, price, position: 'below_avg'|'at_avg'|'above_avg', pctDiff: number }]
 * }
 */
export function calcPriceBenchmark(ownerItems, competitorItems) {
  // Group competitor items by normalised section name
  const grouped = {};

  for (const item of competitorItems) {
    const cat = (item.section_name || item.category || 'Other').trim();
    if (!grouped[cat]) grouped[cat] = { prices: [], restaurantIds: new Set() };
    if (item.price && !isNaN(parseFloat(item.price))) {
      grouped[cat].prices.push(parseFloat(item.price));
      if (item.restaurant_id) grouped[cat].restaurantIds.add(item.restaurant_id);
    }
  }

  // Group owner items by same section
  const ownerByCategory = {};
  for (const item of ownerItems) {
    const cat = (item.section_name || item.category || 'Other').trim();
    if (!ownerByCategory[cat]) ownerByCategory[cat] = [];
    ownerByCategory[cat].push(item);
  }

  // Compute stats for each category
  const benchmark = {};

  for (const [cat, { prices, restaurantIds }] of Object.entries(grouped)) {
    if (prices.length === 0) continue;

    const sorted = [...prices].sort((a, b) => a - b);
    const min    = sorted[0];
    const max    = sorted[sorted.length - 1];
    const avg    = prices.reduce((s, p) => s + p, 0) / prices.length;
    const mid    = Math.floor(sorted.length / 2);
    const median = sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];

    // Map owner's items in this category with their position
    const yourItems = (ownerByCategory[cat] || []).map(item => {
      const price = parseFloat(item.price || item.priceNum || 0);
      const pctDiff = avg > 0 ? ((price - avg) / avg) * 100 : 0;
      let position;
      if (pctDiff > 10)       position = 'above_avg';
      else if (pctDiff < -10) position = 'below_avg';
      else                    position = 'at_avg';

      return { name: item.name, price, pctDiff: Math.round(pctDiff), position };
    });

    benchmark[cat] = {
      category:        cat,
      min:             Math.round(min * 100) / 100,
      max:             Math.round(max * 100) / 100,
      avg:             Math.round(avg * 100) / 100,
      median:          Math.round(median * 100) / 100,
      restaurantCount: restaurantIds.size,
      itemCount:       prices.length,
      yourItems,
    };
  }

  return benchmark;
}

/**
 * Fetch competitor menu items from Supabase for the given competitor restaurant IDs.
 *
 * @param {object}   supabase
 * @param {string[]} competitorIds  — array of restaurant IDs (Tier-1 or Tier-1+2)
 * @returns {Promise<object[]>}
 */
export async function fetchCompetitorMenuItems(supabase, competitorIds) {
  if (!competitorIds.length) return [];

  const { data, error } = await supabase
    .from('menu_items')
    .select('id, name, price, section_name, restaurant_id')
    .in('restaurant_id', competitorIds)
    .not('price', 'is', null)
    .gt('price', 0);

  if (error) {
    console.error('[competitorEngine] fetchCompetitorMenuItems error:', error.message);
    return [];
  }

  return data || [];
}

/**
 * Full pipeline: fetch ranked competitors → fetch their menu items → compute
 * price benchmark.  Returns both the ranked competitor list and the benchmark.
 *
 * @param {object}   supabase
 * @param {object}   owner         — full restaurant row including menu_items
 * @param {object[]} ownerItems    — owner's own menu_items rows
 * @param {{ tier1Only?: boolean }} options
 * @returns {Promise<{ rankedCompetitors, benchmark }>}
 *
 * EXAMPLE:
 *   const { rankedCompetitors, benchmark } = await buildBenchmark(
 *     supabase, ownerRestaurant, ownerMenuItems
 *   );
 */
export async function buildBenchmark(supabase, owner, ownerItems, options = {}) {
  const { tier1Only = false } = options;

  // Step 1 — get ranked competitors
  const rankedCompetitors = await getRankedCompetitors(supabase, owner);

  // Step 2 — filter to Tier-1 (or Tier-1+2)
  const targetTiers = tier1Only ? [TIER.DIRECT] : [TIER.DIRECT, TIER.ADJACENT];
  const filteredCompetitors = rankedCompetitors.filter(c => targetTiers.includes(c.tier));
  const competitorIds = filteredCompetitors.map(c => c.restaurant.id);

  // Step 3 — fetch their menu items
  const competitorItems = await fetchCompetitorMenuItems(supabase, competitorIds);

  // Step 4 — compute benchmark
  const benchmark = calcPriceBenchmark(ownerItems, competitorItems);

  return { rankedCompetitors, filteredCompetitors, competitorIds, benchmark };
}
