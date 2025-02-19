import { DISTRICTS, type Tower } from "@shared/schema";

interface CandidateSite {
  id: number;
  latitude: number;
  longitude: number;
  terrain: number;
  environment: number;
  accessibility: number;
  distance: number;
}

function generateCandidateSites(districtId: string, numSites = 20): CandidateSite[] {
  const districtInfo = DISTRICTS.find(d => d.id === districtId)!;
  const sites: CandidateSite[] = [];

  for (let i = 0; i < numSites; i++) {
    // Generate random coordinates within district bounds
    const lat = districtInfo.bounds.south + 
      Math.random() * (districtInfo.bounds.north - districtInfo.bounds.south);
    const lng = districtInfo.bounds.west + 
      Math.random() * (districtInfo.bounds.east - districtInfo.bounds.west);

    // Calculate distance from center
    const distance = Math.sqrt(
      Math.pow(lat - districtInfo.center.lat, 2) + 
      Math.pow(lng - districtInfo.center.lng, 2)
    ) * 111; // Convert to approximate kilometers

    sites.push({
      id: i + 1,
      latitude: lat,
      longitude: lng,
      terrain: 50 + Math.random() * 50,        // Scale 50-100
      environment: Math.random() * 50,          // Scale 0-50 (lower is better)
      accessibility: 50 + Math.random() * 50,   // Scale 50-100
      distance: distance                        // In kilometers
    });
  }

  return sites;
}

function computePerformanceScore(site: CandidateSite): number {
  const noise = (Math.random() - 0.5) * 2; // Random noise between -1 and 1
  return (
    0.4 * site.terrain +
    0.3 * site.accessibility -
    0.2 * site.distance -
    0.1 * site.environment +
    noise
  );
}

function rankSites(sites: CandidateSite[]): CandidateSite[] {
  return sites
    .map(site => ({
      ...site,
      score: computePerformanceScore(site)
    }))
    .sort((a, b) => (b as any).score - (a as any).score);
}

export function optimizeTowerPlacements(districtId: string, numTowers: number): {
  latitude: number;
  longitude: number;
}[] {
  // Generate and rank candidate sites
  const candidateSites = generateCandidateSites(districtId);
  const rankedSites = rankSites(candidateSites);

  // Select the top N sites based on their scores
  return rankedSites.slice(0, numTowers).map(site => ({
    latitude: site.latitude,
    longitude: site.longitude
  }));
}