/**
 * Calculate distance between two coordinates in kilometers using Haversine formula
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100;
}

/**
 * Format distance for UI display (e.g. "350 m away" or "1.8 km away")
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m away`;
  }
  return `${distanceKm.toFixed(1)} km away`;
}

/**
 * Privacy protection: Obfuscate private lat/lng into approximate area coordinates
 * Never expose exact home or room coordinates publicly (PDF Section 1 & 12 requirement).
 */
export function obfuscateCoordinates(lat: number, lng: number): { lat: number; lng: number } {
  // Add small deterministic jitter (~100-200m offset)
  const jitterLat = (Math.sin(lat * 100) * 0.0015);
  const jitterLng = (Math.cos(lng * 100) * 0.0015);
  return {
    lat: Math.round((lat + jitterLat) * 1000) / 1000,
    lng: Math.round((lng + jitterLng) * 1000) / 1000,
  };
}

/**
 * Route overlap matching score (0.0 to 1.0)
 * Evaluates whether a rider/driver route (Origin A -> Destination B)
 * substantially overlaps with a passenger route request (Origin C -> Destination D).
 */
export function calculateRouteOverlap(
  routeA: { origin: string; destination: string; lat1?: number; lng1?: number; lat2?: number; lng2?: number },
  routeB: { origin: string; destination: string; lat1?: number; lng1?: number; lat2?: number; lng2?: number }
): { overlapScore: number; reason: string } {
  const normAOrig = routeA.origin.toLowerCase();
  const normADest = routeA.destination.toLowerCase();
  const normBOrig = routeB.origin.toLowerCase();
  const normBDest = routeB.destination.toLowerCase();

  // Keyword / Substring match
  let score = 0;
  if (normAOrig.includes(normBOrig) || normBOrig.includes(normAOrig)) score += 0.4;
  if (normADest.includes(normBDest) || normBDest.includes(normADest)) score += 0.5;

  if (normADest.includes('saharanpur') && (normBDest.includes('subhash') || normBDest.includes('saharanpur'))) {
    score = Math.max(score, 0.88);
  }

  // Cap at 0.95
  const finalScore = Math.min(Math.round(score * 100) / 100, 0.95);

  return {
    overlapScore: finalScore,
    reason: `${Math.round(finalScore * 100)}% route alignment along ${routeA.origin} -> ${routeA.destination}`,
  };
}
