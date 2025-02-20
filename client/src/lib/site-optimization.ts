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
  details?: {
    terrain: number;
    environment: number;
    accessibility: number;
    distance: number;
  };
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

// Calculate terrain favorability based on position and infrastructure density
function calculateTerrainFavorability(lat: number, lng: number, localityInfo: typeof INDIAN_LOCALITIES[0]): number {
  const distanceFromCenter = Math.sqrt(
    Math.pow(lat - localityInfo.center.lat, 2) + 
    Math.pow(lng - localityInfo.center.lng, 2)
  ) * 111;

  // Deterministic calculation based on distance from center
  const baseFavorability = 100 - (distanceFromCenter * 8);

  // Add variation based on position relative to center
  const angleFromCenter = Math.atan2(
    lat - localityInfo.center.lat,
    lng - localityInfo.center.lng
  );
  const positionVariation = Math.cos(angleFromCenter * 4) * 5;

  return Math.max(50, Math.min(100, baseFavorability + positionVariation));
}

// Calculate environmental interference based on position
function calculateEnvironmentalInterference(lat: number, lng: number, localityInfo: typeof INDIAN_LOCALITIES[0]): number {
  const distanceFromBoundary = distanceToPolygonBoundary([lng, lat], localityInfo.bounds.polygon as [number, number][]);
  const distanceFromCenter = Math.sqrt(
    Math.pow(lat - localityInfo.center.lat, 2) + 
    Math.pow(lng - localityInfo.center.lng, 2)
  ) * 111;

  // Higher interference in very urban (center) or very rural (boundary) areas
  const boundaryEffect = Math.max(0, 15 - distanceFromBoundary * 4);
  const centerEffect = Math.max(0, 25 - distanceFromCenter * 3);

  // Deterministic interference based on position
  const interference = Math.max(boundaryEffect, centerEffect);

  return Math.min(50, interference);
}

// Calculate accessibility score based on distance from center and boundaries
function calculateAccessibility(lat: number, lng: number, localityInfo: typeof INDIAN_LOCALITIES[0]): number {
  const distanceFromBoundary = distanceToPolygonBoundary([lng, lat], localityInfo.bounds.polygon as [number, number][]);
  const distanceFromCenter = Math.sqrt(
    Math.pow(lat - localityInfo.center.lat, 2) + 
    Math.pow(lng - localityInfo.center.lng, 2)
  ) * 111;

  // Deterministic accessibility calculation
  const baseAccessibility = 95 - (distanceFromCenter * 6);
  const boundaryPenalty = Math.max(0, 12 - distanceFromBoundary * 2);

  return Math.max(50, Math.min(100, baseAccessibility - boundaryPenalty));
}

// Generate a grid of candidate sites within the locality
function generateCandidateSites(locality: string, numSites = 20): CandidateSite[] {
  const localityInfo = INDIAN_LOCALITIES.find(l => l.id === locality)!;
  const sites: CandidateSite[] = [];
  const MINIMUM_BOUNDARY_DISTANCE = 1; // Minimum 1km from boundary

  // Calculate grid dimensions based on locality size
  const latSpan = localityInfo.bounds.north - localityInfo.bounds.south;
  const lngSpan = localityInfo.bounds.east - localityInfo.bounds.west;
  const gridSize = Math.ceil(Math.sqrt(numSites * 4)); // 4x more points than needed
  const latStep = latSpan / gridSize;
  const lngStep = lngSpan / gridSize;

  // Generate points in a grid pattern
  for (let i = 0; i < gridSize && sites.length < numSites * 4; i++) {
    for (let j = 0; j < gridSize && sites.length < numSites * 4; j++) {
      const lat = localityInfo.bounds.south + (i + 0.5) * latStep;
      const lng = localityInfo.bounds.west + (j + 0.5) * lngStep;

      const point: [number, number] = [lng, lat];
      if (!isPointInPolygon(point, localityInfo.bounds.polygon as [number, number][])) {
        continue;
      }

      const boundaryDistance = distanceToPolygonBoundary(point, localityInfo.bounds.polygon as [number, number][]);
      if (boundaryDistance < MINIMUM_BOUNDARY_DISTANCE) {
        continue;
      }

      const distance = Math.sqrt(
        Math.pow(lat - localityInfo.center.lat, 2) + 
        Math.pow(lng - localityInfo.center.lng, 2)
      ) * 111;

      const terrain = calculateTerrainFavorability(lat, lng, localityInfo);
      const environment = calculateEnvironmentalInterference(lat, lng, localityInfo);
      const accessibility = calculateAccessibility(lat, lng, localityInfo);

      sites.push({
        id: sites.length + 1,
        latitude: lat,
        longitude: lng,
        terrain,
        environment,
        accessibility,
        distance,
        details: {
          terrain,
          environment,
          accessibility,
          distance
        }
      });
    }
  }

  return sites;
}

function computePerformanceScore(site: CandidateSite): number {
  // Deterministic score calculation without random noise
  const score = (
    SITE_SCORE_WEIGHTS.terrain * site.terrain +
    SITE_SCORE_WEIGHTS.accessibility * site.accessibility -
    SITE_SCORE_WEIGHTS.distance * (site.distance * 5) -
    SITE_SCORE_WEIGHTS.environment * site.environment
  );

  return score;
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
  score: number;
  details: {
    terrain: number;
    environment: number;
    accessibility: number;
    distance: number;
  };
}[] {
  const candidateSites = generateCandidateSites(locality, numTowers * 4);
  const rankedSites = rankSites(candidateSites);

  return rankedSites.slice(0, numTowers).map(site => ({
    latitude: site.latitude,
    longitude: site.longitude,
    score: site.score ?? 0,
    details: site.details!
  }));
}