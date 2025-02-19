import { useRef, useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import type { Tower } from '@shared/schema';
import { DISTRICTS } from '@shared/schema';
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
  district?: string;
}

function MapController({ district }: { district?: string }) {
  const map = useMap();

  useEffect(() => {
    if (!district) return;

    const districtInfo = DISTRICTS.find(d => d.id === district);
    if (!districtInfo) return;

    // Calculate district bounds from all localities
    const bounds = districtInfo.localities.reduce<L.LatLngBounds | null>((acc, locality) => {
      const localBounds = L.latLngBounds(
        [locality.bounds.south, locality.bounds.west],
        [locality.bounds.north, locality.bounds.east]
      );
      return acc ? acc.extend(localBounds) : localBounds;
    }, null);

    if (bounds) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [district, map]);

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
  const heatmapLayerRef = useRef<L.HeatLayer | null>(null);

  useEffect(() => {
    if (!towers.length) return;

    const updateHeatmap = () => {
      const bounds = map.getBounds();
      const points: [number, number, number][] = [];
      const step = 0.003;

      for (let lat = bounds.getSouth(); lat <= bounds.getNorth(); lat += step) {
        for (let lng = bounds.getWest(); lng <= bounds.getEast(); lng += step) {
          const signalStrengths = towers.map(tower => calculateSignalStrength(tower, lat, lng));
          const maxSignal = Math.max(...signalStrengths);
          const normalizedIntensity = (maxSignal + 120) / 70;

          if (normalizedIntensity > 0.1) {
            points.push([lat, lng, normalizedIntensity]);
          }
        }
      }

      if (heatmapLayerRef.current) {
        map.removeLayer(heatmapLayerRef.current);
      }

      heatmapLayerRef.current = L.heatLayer(points as L.HeatLatLngTuple[], {
        radius: 25,
        blur: 15,
        maxZoom: 10,
        max: 1.0,
        minOpacity: 0.2,
        gradient: {
          0.0: 'rgba(34, 197, 94, 0.4)',
          0.5: 'rgba(234, 179, 8, 0.3)',
          1.0: 'rgba(239, 68, 68, 0.1)'
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

export default function MapView({ towers, onTowerDrop, selectedTower, onSelectTower, district }: MapViewProps) {
  const districtInfo = district ? DISTRICTS.find(d => d.id === district) : undefined;
  const center = districtInfo?.localities[0]?.center || { lat: 20.5937, lng: 78.9629 };

  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={districtInfo ? 12 : 4}
      style={{ width: '100%', height: '100%' }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapController district={district} />
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