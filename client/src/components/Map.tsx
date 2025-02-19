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
}

function MapEvents({ onTowerDrop }: { onTowerDrop: (lat: number, lon: number) => void }) {
  const map = useMapEvents({
    dragenter: (e: any) => {
      e.preventDefault();
    },
    dragover: (e: any) => {
      e.preventDefault();
      const dataTransfer = e.originalEvent?.dataTransfer;
      if (dataTransfer) {
        dataTransfer.dropEffect = 'copy';
      }
    },
    drop: (e: any) => {
      e.preventDefault();
      const { lat, lng } = e.latlng;
      const dataTransfer = e.originalEvent?.dataTransfer;
      if (dataTransfer?.getData('text/plain') === 'new-tower') {
        onTowerDrop(lat, lng);
      }
    },
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

export default function MapView({ towers, onTowerDrop, selectedTower }: MapViewProps) {
  return (
    <MapContainer
      center={[40, -100]}
      zoom={4}
      style={{ width: '100%', height: '100%' }}
      scrollWheelZoom={true}
      droppable={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapEvents onTowerDrop={onTowerDrop} />
      {towers.map((tower) => (
        <TowerMarker
          key={tower.id}
          tower={tower}
          isSelected={selectedTower?.id === tower.id}
        />
      ))}
      {selectedTower && <CoverageLayer tower={selectedTower} />}
    </MapContainer>
  );
}