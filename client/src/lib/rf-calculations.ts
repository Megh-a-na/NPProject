import type { Tower } from "@shared/schema";

const SPEED_OF_LIGHT = 299792458; // meters per second

export function calculateWavelength(frequency: number): number {
  return SPEED_OF_LIGHT / (frequency * 1e6); // frequency in MHz
}

export function calculatePathLoss(tower: Tower, distance: number): number {
  const wavelength = calculateWavelength(Number(tower.frequency));
  // Free space path loss formula
  const pathLoss = 20 * Math.log10(distance) + 20 * Math.log10(wavelength) - 147.55;
  return pathLoss;
}

export function calculateSignalStrength(tower: Tower, lat: number, lon: number): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (Number(tower.latitude) * Math.PI) / 180;
  const φ2 = (lat * Math.PI) / 180;
  const Δφ = ((lat - Number(tower.latitude)) * Math.PI) / 180;
  const Δλ = ((lon - Number(tower.longitude)) * Math.PI) / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;

  const pathLoss = calculatePathLoss(tower, distance);
  const signalStrength = Number(tower.transmissionPower) + Number(tower.antennaGain) - pathLoss;
  
  return signalStrength;
}
