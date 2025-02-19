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

    // Draw locality background
    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw locality grid
    ctx.strokeStyle = '#e5e7eb';
    const gridSize = 20;
    for (let i = 0; i <= canvas.width; i += gridSize) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }
    for (let i = 0; i <= canvas.height; i += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvas.width, i);
      ctx.stroke();
    }

    // Draw locality boundary
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 1;

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

      // Draw coverage area with gradient
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, 'rgba(34, 197, 94, 0.4)'); // Green core
      gradient.addColorStop(0.5, 'rgba(234, 179, 8, 0.3)'); // Yellow mid
      gradient.addColorStop(1, 'rgba(239, 68, 68, 0.1)'); // Red edge

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();

      // Draw tower icon
      ctx.fillStyle = '#000';
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;

      // Draw tower base
      ctx.beginPath();
      ctx.moveTo(x - 6, y + 6);
      ctx.lineTo(x + 6, y + 6);
      ctx.lineTo(x, y - 10);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Draw tower label
      ctx.fillStyle = '#000';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(tower.name, x, y + 20);
    });

    // Draw legend
    if (towers.length > 0) {
      const legendX = 10;
      const legendY = canvas.height - 60;

      ctx.font = '12px Arial';
      ctx.textAlign = 'left';
      ctx.fillStyle = '#000';
      ctx.fillText('Signal Strength:', legendX, legendY);

      const gradientWidth = 150;
      const gradientHeight = 20;
      const gradient = ctx.createLinearGradient(legendX, legendY + 10, legendX + gradientWidth, legendY + 10);
      gradient.addColorStop(0, 'rgba(34, 197, 94, 0.4)');
      gradient.addColorStop(0.5, 'rgba(234, 179, 8, 0.3)');
      gradient.addColorStop(1, 'rgba(239, 68, 68, 0.1)');

      ctx.fillStyle = gradient;
      ctx.fillRect(legendX, legendY + 5, gradientWidth, gradientHeight);
      ctx.strokeStyle = '#374151';
      ctx.strokeRect(legendX, legendY + 5, gradientWidth, gradientHeight);

      ctx.fillStyle = '#000';
      ctx.textAlign = 'left';
      ctx.fillText('Strong', legendX, legendY + 40);
      ctx.textAlign = 'right';
      ctx.fillText('Weak', legendX + gradientWidth, legendY + 40);
    }

  }, [locality, towers]);

  return (
    <div className="w-full aspect-square relative bg-white rounded-lg overflow-hidden shadow-inner">
      <canvas
        ref={canvasRef}
        width={500}
        height={500}
        className="w-full h-full"
      />
    </div>
  );
}