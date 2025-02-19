import { useRef, useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import type { Tower } from '@shared/schema';
import TowerMarker from '@/components/TowerMarker';
import { calculateCombinedSignalStrength } from '@/lib/rf-calculations';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet-heatmap';

interface MapViewProps {
  towers: Tower[];
  onTowerDrop: (lat: number, lon: number) => void;
  selectedTower?: Tower;
  onSelectTower: (tower: Tower) => void;
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
      const step = 0.002; // Increased step size for better performance

      for (let lat = bounds.getSouth(); lat <= bounds.getNorth(); lat += step) {
        for (let lng = bounds.getWest(); lng <= bounds.getEast(); lng += step) {
          const signal = calculateCombinedSignalStrength(towers, lat, lng);
          points.push({
            lat,
            lng,
            value: (signal + 120) / 60
          });
        }
      }

      if (heatmapLayerRef.current) {
        map.removeLayer(heatmapLayerRef.current);
      }

      // @ts-ignore
      heatmapLayerRef.current = new L.HeatLayer(points, {
        radius: 20,
        blur: 15,
        maxZoom: 10,
        gradient: {
          0.4: '#ffffb2',
          0.6: '#fd8d3c',
          0.8: '#f03b20',
          1.0: '#bd0026'
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

export default function MapView({ towers, onTowerDrop, selectedTower, onSelectTower }: MapViewProps) {
  return (
    <MapContainer
      center={[40, -100]}
      zoom={4}
      style={{ width: '100%', height: '100%' }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
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