import { useEffect, useRef } from 'react';
import type { Tower } from '@shared/schema';
import { TOWER_COVERAGE_RADIUS_KM } from '@shared/schema';

interface LocalityInfo {
  id: string;
  name: string;
  areaKm2: number;
}

interface CoverageVisualizationProps {
  locality: LocalityInfo;
  towers: Tower[];
}

export default function CoverageVisualization({ locality, towers }: CoverageVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw locality boundary
    ctx.strokeStyle = '#666';
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    // Calculate the scale factor (pixels per kilometer)
    const scaleFactor = Math.min(
      canvas.width / Math.sqrt(locality.areaKm2),
      canvas.height / Math.sqrt(locality.areaKm2)
    );

    // Draw coverage areas for each tower
    towers.forEach(tower => {
      const x = Number(tower.positionX) * canvas.width;
      const y = Number(tower.positionY) * canvas.height;
      const radius = TOWER_COVERAGE_RADIUS_KM * scaleFactor;

      // Create radial gradient for coverage area
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, 'rgba(0, 255, 0, 0.3)');
      gradient.addColorStop(1, 'rgba(0, 255, 0, 0)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();

      // Draw tower position
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();

      // Draw tower label
      ctx.fillStyle = '#000';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(tower.name, x, y - 10);
    });

  }, [locality, towers]);

  return (
    <div className="w-full aspect-square relative bg-white rounded-lg overflow-hidden">
      <canvas
        ref={canvasRef}
        width={500}
        height={500}
        className="w-full h-full"
      />
    </div>
  );
}