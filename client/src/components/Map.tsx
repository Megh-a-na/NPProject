import { useRef, useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import type { Tower } from '@shared/schema';
import { INDIAN_LOCALITIES } from '@shared/schema';
import TowerMarker from '@/components/TowerMarker';
import { calculateSignalStrength } from '@/lib/rf-calculations';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet.heat';

interface MapViewProps {
  towers: Tower[];
  onTowerDrop: (lat: number, lon: number) => void;
  selectedTower?: Tower;
  onSelectTower: (tower: Tower) => void;
  locality?: string;
}

function MapController({ locality }: { locality?: string }) {
  const map = useMap();

  useEffect(() => {
    if (!locality) return;

    const localityInfo = INDIAN_LOCALITIES.find(l => l.id === locality);
    if (!localityInfo) return;

    const bounds = L.latLngBounds([
      [localityInfo.bounds.south, localityInfo.bounds.west],
      [localityInfo.bounds.north, localityInfo.bounds.east]
    ]);

    map.fitBounds(bounds, { padding: [50, 50] });
  }, [locality, map]);

  return null;
}

function DragHandler({ onTowerDrop }: { onTowerDrop: (lat: number, lon: number) => void }) {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();
    const handleDragOver = (e: DragEvent) => e.preventDefault();
    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      const point = map.containerPointToLatLng([
        e.clientX - container.getBoundingClientRect().left,
        e.clientY - container.getBoundingClientRect().top
      ]);
      try {
        if (e.dataTransfer?.getData('application/json')?.includes('new-tower')) {
          onTowerDrop(point.lat, point.lng);
        }
      } catch (error) {
        console.error('Drop error:', error);
      }
    };

    container.addEventListener('dragover', handleDragOver);
    container.addEventListener('drop', handleDrop);
    return () => {
      container.removeEventListener('dragover', handleDragOver);
      container.removeEventListener('drop', handleDrop);
    };
  }, [map, onTowerDrop]);

  return null;
}

function CoverageLayer({ towers }: { towers: Tower[] }) {
  const map = useMap();
  const heatmapLayerRef = useRef<any>(null);

  useEffect(() => {
    if (!towers.length) return;

    const updateHeatmap = () => {
      const bounds = map.getBounds();
      const points = [];
      // Increase step size to reduce point density
      const step = 0.005;

      for (let lat = bounds.getSouth(); lat <= bounds.getNorth(); lat += step) {
        for (let lng = bounds.getWest(); lng <= bounds.getEast(); lng += step) {
          const signalStrengths = towers.map(tower => calculateSignalStrength(tower, lat, lng));
          const maxSignal = Math.max(...signalStrengths);
          // Reduce intensity by normalizing over a larger range
          const normalizedIntensity = Math.min((maxSignal + 120) / 140, 0.6);

          if (normalizedIntensity > 0.05) {
            points.push([lat, lng, normalizedIntensity * 0.5]); // Further reduce intensity
          }
        }
      }

      if (heatmapLayerRef.current) {
        map.removeLayer(heatmapLayerRef.current);
      }

      heatmapLayerRef.current = L.heatLayer(points, {
        radius: 30,            // Increased radius
        blur: 25,             // Increased blur
        maxZoom: 10,
        max: 0.6,             // Reduced maximum intensity
        minOpacity: 0.01,     // Very low minimum opacity
        gradient: {
          0.0: 'rgba(34, 197, 94, 0.02)',   // Very transparent green
          0.3: 'rgba(234, 179, 8, 0.015)',  // Almost invisible yellow
          0.6: 'rgba(255, 128, 128, 0.008)'    // Even lighter and more transparent red
        }
      }).addTo(map);
    };

    const debouncedUpdate = setTimeout(updateHeatmap, 100);
    return () => {
      clearTimeout(debouncedUpdate);
      if (heatmapLayerRef.current) {
        map.removeLayer(heatmapLayerRef.current);
      }
    };
  }, [towers, map]);

  return null;
}

export default function MapView({ towers, onTowerDrop, selectedTower, onSelectTower, locality }: MapViewProps) {
  const localityInfo = locality ? INDIAN_LOCALITIES.find(l => l.id === locality) : undefined;

  return (
    <MapContainer
      center={localityInfo ? [localityInfo.center.lat, localityInfo.center.lng] : [20.5937, 78.9629]}
      zoom={localityInfo ? 14 : 4}
      style={{ width: '100%', height: '100%' }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapController locality={locality} />
      <DragHandler onTowerDrop={onTowerDrop} />
      {towers.map((tower) => (
        <TowerMarker
          key={tower.id}
          tower={tower}
          isSelected={selectedTower?.id === tower.id}
          onClick={() => onSelectTower(tower)}
        />
      ))}
      <CoverageLayer towers={towers} />
    </MapContainer>
  );
}