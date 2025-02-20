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

function generateCandidateSites(locality: string, numSites = 20): CandidateSite[] {
  const localityInfo = INDIAN_LOCALITIES.find(l => l.id === locality)!;
  const sites: CandidateSite[] = [];

  for (let i = 0; i < numSites; i++) {
    // Generate random coordinates within locality bounds
    const lat = localityInfo.bounds.south + 
      Math.random() * (localityInfo.bounds.north - localityInfo.bounds.south);
    const lng = localityInfo.bounds.west + 
      Math.random() * (localityInfo.bounds.east - localityInfo.bounds.west);

    // Calculate distance from center (in kilometers)
    const distance = Math.sqrt(
      Math.pow(lat - localityInfo.center.lat, 2) + 
      Math.pow(lng - localityInfo.center.lng, 2)
    ) * 111; // Approximate conversion to kilometers

    // Generate site characteristics based on the Python algorithm
    sites.push({
      id: i + 1,
      latitude: lat,
      longitude: lng,
      terrain: 50 + Math.random() * 50,        // Scale 50-100 (higher is better)
      environment: Math.random() * 50,         // Scale 0-50 (lower is better)
      accessibility: 50 + Math.random() * 50,  // Scale 50-100 (higher is better)
      distance: distance                       // In kilometers (lower is better)
    });
  }

  return sites;
}

function computePerformanceScore(site: CandidateSite): number {
  // Add random noise to mimic real-world variability
  const noise = (Math.random() - 0.5) * 2; // Random noise between -1 and 1

  // Using the weights from schema.ts
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