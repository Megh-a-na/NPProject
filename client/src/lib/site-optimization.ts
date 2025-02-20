import type { Tower } from "@shared/schema";
import { apiRequest } from "./queryClient";

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

// Simulate terrain favorability based on distance from major infrastructures
function calculateTerrainFavorability(lat: number, lng: number, localityInfo: any): number {
  // Distance from center indicates infrastructure density
  const distanceFromCenter = Math.sqrt(
    Math.pow(lat - localityInfo.center.lat, 2) + 
    Math.pow(lng - localityInfo.center.lng, 2)
  ) * 111;

  // Terrain favorability decreases with distance from center, but with some randomness
  const baseFavorability = 100 - (distanceFromCenter * 10);
  const randomVariation = (Math.random() - 0.5) * 20; // ±10 points variation

  return Math.max(50, Math.min(100, baseFavorability + randomVariation));
}

// Calculate environmental interference based on position
function calculateEnvironmentalInterference(lat: number, lng: number, localityInfo: any): number {
  // More interference near boundaries and center (urban density)
  const distanceFromBoundary = distanceToPolygonBoundary([lng, lat], localityInfo.bounds.polygon as [number, number][]);
  const distanceFromCenter = Math.sqrt(
    Math.pow(lat - localityInfo.center.lat, 2) + 
    Math.pow(lng - localityInfo.center.lng, 2)
  ) * 111;

  // Higher interference in very urban (center) or very rural (boundary) areas
  const boundaryEffect = Math.max(0, 15 - distanceFromBoundary * 5);
  const centerEffect = Math.max(0, 20 - distanceFromCenter * 3);
  const baseInterference = Math.max(boundaryEffect, centerEffect);

  // Add random variation
  const randomVariation = (Math.random() * 15);
  return Math.min(50, baseInterference + randomVariation);
}

// Calculate accessibility score based on distance from center and boundaries
function calculateAccessibility(lat: number, lng: number, localityInfo: any): number {
  const distanceFromBoundary = distanceToPolygonBoundary([lng, lat], localityInfo.bounds.polygon as [number, number][]);
  const distanceFromCenter = Math.sqrt(
    Math.pow(lat - localityInfo.center.lat, 2) + 
    Math.pow(lng - localityInfo.center.lng, 2)
  ) * 111;

  // Better accessibility closer to center but not too close to boundaries
  const baseAccessibility = 90 - (distanceFromCenter * 5);
  const boundaryPenalty = Math.max(0, 10 - distanceFromBoundary * 2);

  // Add random variation for real-world factors
  const randomVariation = (Math.random() - 0.5) * 20;

  return Math.max(50, Math.min(100, baseAccessibility - boundaryPenalty + randomVariation));
}

function generateCandidateSites(locality: string, numSites = 20): CandidateSite[] {
  const localityInfo = INDIAN_LOCALITIES.find(l => l.id === locality)!;
  const sites: CandidateSite[] = [];
  const MINIMUM_BOUNDARY_DISTANCE = 1; // Minimum 1km from boundary
  let attempts = 0;

  while (sites.length < numSites && attempts < numSites * 10) {
    attempts++;

    const lat = localityInfo.bounds.south + 
      Math.random() * (localityInfo.bounds.north - localityInfo.bounds.south);
    const lng = localityInfo.bounds.west + 
      Math.random() * (localityInfo.bounds.east - localityInfo.bounds.west);

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

    // Calculate site characteristics using more sophisticated methods
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

  return sites;
}

function computePerformanceScore(site: CandidateSite): number {
  // Random variation to simulate real-world uncertainties
  const noise = (Math.random() - 0.5) * 2;

  // Calculate weighted score using the weights from schema
  const score = (
    SITE_SCORE_WEIGHTS.terrain * site.terrain +
    SITE_SCORE_WEIGHTS.accessibility * site.accessibility -
    SITE_SCORE_WEIGHTS.distance * (site.distance * 5) - // Increased distance penalty
    SITE_SCORE_WEIGHTS.environment * site.environment +
    noise
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

export async function optimizeTowerPlacements(locality: string, numTowers: number): Promise<{
  latitude: number;
  longitude: number;
  score: number;
  details: {
    terrain: number;
    environment: number;
    accessibility: number;
    distance: number;
  };
}[]> {
  const res = await apiRequest("POST", "/api/optimize", {
    locality,
    numTowers
  });
  return await res.json();
}

import { INDIAN_LOCALITIES, type Tower, SITE_SCORE_WEIGHTS } from "@shared/schema";