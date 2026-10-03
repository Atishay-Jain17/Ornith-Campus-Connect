import { calculateDistanceKm, calculateRouteOverlap } from './geo';

export interface ExtractedIntent {
  type: 'NEED' | 'OFFER' | 'BORROW' | 'LEND' | 'BUY' | 'SELL' | 'GIVE' | 'SERVICE' | 'PLAN' | 'RIDE' | 'GROUP_BUY' | 'COMMUNITY' | 'OPPORTUNITY' | 'LOST_FOUND';
  title: string;
  category: string;
  radiusKm: number;
  tags: string[];
  suggestedExpiryHours?: number;
  price?: number;
  contributionMode?: 'FREE' | 'EQUAL_SPLIT' | 'FIXED' | 'CUSTOM';
  routeOrigin?: string;
  routeDestination?: string;
  capacity?: number;
  riskIndicators?: string[];
}

/**
 * Natural language intent extraction engine
 * Extracts structured fields from freeform user prompt.
 */
export function extractIntentFromText(rawText: string): ExtractedIntent {
  const text = rawText.toLowerCase();

  let type: ExtractedIntent['type'] = 'NEED';
  let category = 'General';
  let radiusKm = 2.0;
  let price: number | undefined = undefined;
  let contributionMode: ExtractedIntent['contributionMode'] = 'FREE';
  let routeOrigin: string | undefined = undefined;
  let routeDestination: string | undefined = undefined;
  let capacity: number | undefined = undefined;
  const tags: string[] = [];
  const riskIndicators: string[] = [];

  // Determine Post Type
  if (text.includes('ride') || text.includes('going to') || text.includes('carpool') || text.includes('driving to') || text.includes('->') || text.includes('to')) {
    if (text.includes('seats') || text.includes('going') || text.includes('leaving') || text.includes('driving')) {
      type = 'RIDE';
      category = 'Travel / Ride';
      radiusKm = 10.0;
      contributionMode = 'FIXED';
    }
  }

  if (text.includes('borrow') || text.includes('for 2 hours') || text.includes('for tonight') || text.includes('for 3 hours')) {
    type = 'BORROW';
    category = 'Electronics / Lend';
  } else if (text.includes('can lend') || text.includes('spare') || text.includes('have extra') || text.includes('available to lend')) {
    type = 'LEND';
    category = 'Electronics / Lend';
  } else if (text.includes('give away') || text.includes('free') || text.includes('giving away')) {
    type = 'GIVE';
    category = 'Giveaway';
  } else if (text.includes('sell') || text.includes('selling') || text.includes('price')) {
    type = 'SELL';
    category = 'Marketplace';
    contributionMode = 'FIXED';
  } else if (text.includes('cafe') || text.includes('hangout') || text.includes('pizza') || text.includes('party') || text.includes('meetup') || text.includes('movie')) {
    type = 'PLAN';
    category = 'Social / Hangout';
  } else if (text.includes('ordering') || text.includes('group buy') || text.includes('anyone wants one')) {
    type = 'GROUP_BUY';
    category = 'Food / Group Buy';
    contributionMode = 'EQUAL_SPLIT';
  } else if (text.includes('design') || text.includes('ppt') || text.includes('tutoring') || text.includes('debug') || text.includes('printing')) {
    type = 'SERVICE';
    category = 'Services';
  } else if (text.includes('internship') || text.includes('hiring') || text.includes('stipend') || text.includes('freelance work')) {
    type = 'OPPORTUNITY';
    category = 'Opportunities';
  } else if (text.includes('need') || text.includes('looking for') || text.includes('require')) {
    type = 'NEED';
    category = 'Help / Need';
  } else if (text.includes('have') || text.includes('offer')) {
    type = 'OFFER';
    category = 'Offer';
  }

  // Extract Route Origin / Destination if present
  if (text.includes('->')) {
    const parts = text.split('->');
    routeOrigin = parts[0].trim().replace(/^.*?(leaving|from)/i, '').trim();
    routeDestination = parts[1].trim().split(' at ')[0].split(' for ')[0].trim();
  } else if (text.includes(' to ') && (type === 'RIDE' || text.includes('going'))) {
    const parts = text.split(' to ');
    routeOrigin = parts[0].replace(/^.*?(from|leaving)/i, '').trim() || 'Graphic Era';
    routeDestination = parts[1].split(' at ')[0].split(' for ')[0].trim();
  }

  // Price extraction
  const priceMatch = text.match(/(₹|rs\.?|inr)\s*(\d+)/i) || text.match(/(\d+)\s*(rs|inr|rupees)/i);
  if (priceMatch) {
    price = parseInt(priceMatch[2] || priceMatch[1], 10);
  }

  // Extract Tags
  if (text.includes('lenovo')) tags.push('lenovo');
  if (text.includes('charger')) tags.push('charger');
  if (text.includes('laptop')) tags.push('laptop');
  if (text.includes('carpool') || text.includes('ride')) tags.push('ride');
  if (text.includes('geu') || text.includes('graphic era')) tags.push('geu');
  if (text.includes('urgent') || text.includes('tonight')) tags.push('urgent');
  if (tags.length === 0) tags.push(category.toLowerCase().replace(/[^a-z]/g, ''));

  // Risk Detection (PDF Section 8 & 18)
  if (text.includes('assignment') && (text.includes('exam') || text.includes('proxy') || text.includes('cheating'))) {
    riskIndicators.push('Academic Integrity Warning: Academic cheating / exam proxy requests are prohibited');
  }
  if (text.includes('telegram') || text.includes('whatsapp only') || text.includes('advance deposit') || text.includes('pay first')) {
    riskIndicators.push('Unusual Communication / Upfront Deposit Request detected');
  }
  if (text.includes('earn 5000 per day') || text.includes('guaranteed income') || text.includes('no work needed')) {
    riskIndicators.push('Suspicious Guaranteed Income Claim detected');
  }

  // Capitalize Title nicely
  const title = rawText.length > 60 ? rawText.substring(0, 57) + '...' : rawText;

  return {
    type,
    title,
    category,
    radiusKm,
    tags,
    suggestedExpiryHours: text.includes('tonight') ? 12 : text.includes('urgent') ? 6 : 48,
    price,
    contributionMode,
    routeOrigin,
    routeDestination,
    capacity,
    riskIndicators,
  };
}

/**
 * Match Engine
 * Computes match score between a source post and a list of target posts.
 */
export function calculateMatchScore(
  sourcePost: {
    id: string;
    type: string;
    title: string;
    description: string;
    latitude: number;
    longitude: number;
    routeOrigin?: string | null;
    routeDestination?: string | null;
    tags?: string | null;
  },
  targetPost: {
    id: string;
    type: string;
    title: string;
    description: string;
    latitude: number;
    longitude: number;
    routeOrigin?: string | null;
    routeDestination?: string | null;
    tags?: string | null;
  }
): { score: number; reason: string } {
  // 1. Post Type Compatibility Matrix
  let typeCompat = false;

  if (
    (sourcePost.type === 'NEED' && (targetPost.type === 'OFFER' || targetPost.type === 'LEND' || targetPost.type === 'GIVE')) ||
    (sourcePost.type === 'OFFER' && (targetPost.type === 'NEED' || targetPost.type === 'BUY')) ||
    (sourcePost.type === 'BORROW' && targetPost.type === 'LEND') ||
    (sourcePost.type === 'BUY' && targetPost.type === 'SELL') ||
    (sourcePost.type === 'RIDE' && targetPost.type === 'NEED') ||
    (sourcePost.type === 'NEED' && targetPost.type === 'RIDE')
  ) {
    typeCompat = true;
  }

  if (!typeCompat) {
    return { score: 0, reason: 'Incompatible post types' };
  }

  // 2. Proximity Distance
  const distKm = calculateDistanceKm(
    sourcePost.latitude,
    sourcePost.longitude,
    targetPost.latitude,
    targetPost.longitude
  );

  let proximityScore = 1.0;
  if (distKm > 10) proximityScore = 0.2;
  else if (distKm > 5) proximityScore = 0.5;
  else if (distKm > 2) proximityScore = 0.8;
  else if (distKm > 0.5) proximityScore = 0.95;

  // 3. Route Overlap (For Rides)
  let routeScore = 0.5;
  let routeReason = '';

  if (sourcePost.type === 'RIDE' || targetPost.type === 'RIDE') {
    const routeRes = calculateRouteOverlap(
      { origin: sourcePost.routeOrigin || sourcePost.title, destination: sourcePost.routeDestination || '' },
      { origin: targetPost.routeOrigin || targetPost.title, destination: targetPost.routeDestination || '' }
    );
    routeScore = routeRes.overlapScore;
    routeReason = routeRes.reason;
  }

  // 4. Semantic / Tag Compatibility
  const srcText = (sourcePost.title + ' ' + sourcePost.description).toLowerCase();
  const tgtText = (targetPost.title + ' ' + targetPost.description).toLowerCase();

  const keywords = ['lenovo', 'charger', 'laptop', 'pizza', 'saharanpur', 'subhash', 'keyboard', 'design', 'c++'];
  let semanticMatches = 0;

  for (const kw of keywords) {
    if (srcText.includes(kw) && tgtText.includes(kw)) {
      semanticMatches += 1;
    }
  }

  const semanticScore = Math.min(0.4 + semanticMatches * 0.25, 0.98);

  // Combine Scores
  let finalScore = 0;

  if (sourcePost.type === 'RIDE' || targetPost.type === 'RIDE') {
    finalScore = routeScore * 0.6 + proximityScore * 0.2 + semanticScore * 0.2;
  } else {
    finalScore = semanticScore * 0.6 + proximityScore * 0.4;
  }

  finalScore = Math.min(Math.round(finalScore * 100) / 100, 0.98);

  const reason = routeReason
    ? routeReason
    : `Semantic Intent Match (${Math.round(finalScore * 100)}% relevance) - Approx ${distKm.toFixed(1)} km away`;

  return { score: finalScore, reason };
}
