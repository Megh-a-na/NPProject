import { useRef, useCallback, useEffect } from 'react';
import { MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import { LatLng } from 'leaflet';
import type { Tower } from '@shared/schema';
import TowerMarker from '@/components/TowerMarker';
import { calculateSignalStrength } from '@/lib/rf-calculations';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet-heatmap';

interface MapViewProps {
  towers: Tower[];
  onTowerDrop: (lat: number, lon: number) => void;
  selectedTower?: Tower;
  onSelectTower: (tower: Tower) => void;
}

function DragOverlay() {
  const map = useMap();
  const overlayRef = useRef<L.DivIcon | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'copy';
      }

      if (!overlayRef.current) {
        overlayRef.current = L.divIcon({
          html: `<div class="w-6 h-6 bg-primary/50 rounded-full border-2 border-primary animate-pulse"></div>`,
          className: '',
        });
      }

      const point = map.mouseEventToLatLng(e as any);

      if (!markerRef.current) {
        markerRef.current = L.marker(point, { icon: overlayRef.current }).addTo(map);
      } else {
        markerRef.current.setLatLng(point);
      }
    };

    const handleDragLeave = () => {
      if (markerRef.current) {
        map.removeLayer(markerRef.current);
        markerRef.current = null;
      }
    };

    map.getContainer().addEventListener('dragover', handleDragOver);
    map.getContainer().addEventListener('dragleave', handleDragLeave);

    return () => {
      map.getContainer().removeEventListener('dragover', handleDragOver);
      map.getContainer().removeEventListener('dragleave', handleDragLeave);
      if (markerRef.current) {
        map.removeLayer(markerRef.current);
      }
    };
  }, [map]);

  return null;
}

function MapEvents({ onTowerDrop }: { onTowerDrop: (lat: number, lon: number) => void }) {
  const map = useMapEvents({
    drop: (e: any) => {
      e.preventDefault();
      const { lat, lng } = e.latlng;
      try {
        const data = JSON.parse(e.originalEvent?.dataTransfer?.getData('application/json'));
        if (data?.type === 'new-tower') {
          onTowerDrop(lat, lng);
        }
      } catch (error) {
        console.error('Invalid drop data');
      }
    }
  });

  return null;
}

function CoverageLayer({ tower }: { tower: Tower }) {
  const map = useMap();

  useEffect(() => {
    if (!tower) return;

    const points = [];
    const bounds = map.getBounds();
    const step = 0.001;

    for (let lat = bounds.getSouth(); lat <= bounds.getNorth(); lat += step) {
      for (let lng = bounds.getWest(); lng <= bounds.getEast(); lng += step) {
        const signal = calculateSignalStrength(tower, lat, lng);
        points.push({
          lat,
          lng,
          value: (signal + 120) / 60
        });
      }
    }

    // @ts-ignore - leaflet-heatmap types are not available
    const heatmapLayer = new L.HeatLayer(points, {
      radius: 25,
      blur: 15,
      maxZoom: 10,
      gradient: {
        0.4: '#ffffb2',
        0.6: '#fd8d3c',
        0.8: '#fd8d3c',
        1.0: '#bd0026'
      }
    });

    heatmapLayer.addTo(map);
    return () => {
      map.removeLayer(heatmapLayer);
    };
  }, [tower, map]);

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
      <MapEvents onTowerDrop={onTowerDrop} />
      <DragOverlay />
      {towers.map((tower) => (
        <TowerMarker
          key={tower.id}
          tower={tower}
          isSelected={selectedTower?.id === tower.id}
          onClick={() => onSelectTower(tower)}
        />
      ))}
      {selectedTower && <CoverageLayer tower={selectedTower} />}
    </MapContainer>
  );
}