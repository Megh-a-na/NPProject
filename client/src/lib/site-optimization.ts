import { INDIAN_LOCALITIES, type Tower, SITE_SCORE_WEIGHTS } from "@shared/schema";

interface CandidateSite {
  id: number;
  latitude: number;
  longitude: number;
  terrain: number;      // Scale 50-100
  environment: number;  // Scale 0-50 (lower is better)
  accessibility: number; // Scale 50-100
  distance: number;    // In kilometers
  score?: number;
}

// Check if a point is inside the locality polygon
function isPointInPolygon(point: [number, number], polygon: [number, number][]): boolean {
  const x = point[0], y = point[1];
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0], yi = polygon[i][1];
    const xj = polygon[j][0], yj = polygon[j][1];

    const intersect = ((yi > y) !== (yj > y))
        && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }

  return inside;
}

// Calculate minimum distance from a point to polygon boundary
function distanceToPolygonBoundary(point: [number, number], polygon: [number, number][]): number {
  let minDistance = Infinity;

  for (let i = 0; i < polygon.length; i++) {
    const j = (i + 1) % polygon.length;
    const start = polygon[i];
    const end = polygon[j];

    // Calculate distance from point to line segment
    const x = point[0], y = point[1];
    const x1 = start[0], y1 = start[1];
    const x2 = end[0], y2 = end[1];

    const A = x - x1;
    const B = y - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const len_sq = C * C + D * D;
    let param = -1;

    if (len_sq !== 0) param = dot / len_sq;

    let xx, yy;

    if (param < 0) {
      xx = x1;
      yy = y1;
    } else if (param > 1) {
      xx = x2;
      yy = y2;
    } else {
      xx = x1 + param * C;
      yy = y1 + param * D;
    }

    const dx = x - xx;
    const dy = y - yy;
    const distance = Math.sqrt(dx * dx + dy * dy) * 111; // Convert to km
    minDistance = Math.min(minDistance, distance);
  }

  return minDistance;
}

function generateCandidateSites(locality: string, numSites = 20): CandidateSite[] {
  const localityInfo = INDIAN_LOCALITIES.find(l => l.id === locality)!;
  const sites: CandidateSite[] = [];
  const MINIMUM_BOUNDARY_DISTANCE = 1; // Minimum 1km from boundary
  let attempts = 0;

  while (sites.length < numSites && attempts < numSites * 10) {
    attempts++;

    // Generate random coordinates within locality bounds
    const lat = localityInfo.bounds.south + 
      Math.random() * (localityInfo.bounds.north - localityInfo.bounds.south);
    const lng = localityInfo.bounds.west + 
      Math.random() * (localityInfo.bounds.east - localityInfo.bounds.west);

    // Check if point is inside polygon and far enough from boundary
    const point: [number, number] = [lng, lat];
    if (!isPointInPolygon(point, localityInfo.bounds.polygon)) {
      continue;
    }

    const boundaryDistance = distanceToPolygonBoundary(point, localityInfo.bounds.polygon);
    if (boundaryDistance < MINIMUM_BOUNDARY_DISTANCE) {
      continue;
    }

    // Calculate distance from center (in kilometers)
    const distance = Math.sqrt(
      Math.pow(lat - localityInfo.center.lat, 2) + 
      Math.pow(lng - localityInfo.center.lng, 2)
    ) * 111;

    // Generate site characteristics based on the Python algorithm
    sites.push({
      id: sites.length + 1,
      latitude: lat,
      longitude: lng,
      terrain: 50 + Math.random() * 50,
      environment: Math.random() * 50,
      accessibility: 50 + Math.random() * 50,
      distance: distance
    });
  }

  return sites;
}

function computePerformanceScore(site: CandidateSite): number {
  const noise = (Math.random() - 0.5) * 2;
  return (
    SITE_SCORE_WEIGHTS.terrain * site.terrain +
    SITE_SCORE_WEIGHTS.accessibility * site.accessibility -
    SITE_SCORE_WEIGHTS.distance * site.distance -
    SITE_SCORE_WEIGHTS.environment * site.environment +
    noise
  );
}

function rankSites(sites: CandidateSite[]): CandidateSite[] {
  return sites
    .map(site => ({
      ...site,
      score: computePerformanceScore(site)
    }))
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
}

export function optimizeTowerPlacements(locality: string, numTowers: number): {
  latitude: number;
  longitude: number;
}[] {
  // Generate more candidate sites than needed to ensure good coverage
  const candidateSites = generateCandidateSites(locality, numTowers * 4);
  const rankedSites = rankSites(candidateSites);

  // Select the top N sites based on their scores
  return rankedSites.slice(0, numTowers).map(site => ({
    latitude: site.latitude,
    longitude: site.longitude
  }));
}