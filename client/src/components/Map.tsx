import { useRef, useCallback } from 'react';
import Map, { Marker, Layer, Source, LayerProps } from 'react-map-gl';
import type { Tower } from '@shared/schema';
import TowerMarker from '@/components/TowerMarker';
import { calculateSignalStrength } from '@/lib/rf-calculations';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

interface MapViewProps {
  towers: Tower[];
  onTowerDrop: (lat: number, lon: number) => void;
  selectedTower?: Tower;
}

export default function MapView({ towers, onTowerDrop, selectedTower }: MapViewProps) {
  const mapRef = useRef<any>(null);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const map = mapRef.current?.getMap();
    if (!map) return;

    const coords = map.unproject([event.clientX, event.clientY]);
    onTowerDrop(coords.lat, coords.lng);
  }, [onTowerDrop]);

  const coverageLayer: LayerProps = {
    id: 'coverage',
    type: 'heatmap',
    paint: {
      'heatmap-weight': [
        'interpolate',
        ['linear'],
        ['get', 'signal'],
        -120,
        0,
        -60,
        1
      ],
      'heatmap-intensity': 1,
      'heatmap-color': [
        'interpolate',
        ['linear'],
        ['heatmap-density'],
        0,
        'rgba(33,102,172,0)',
        0.2,
        'rgb(103,169,207)',
        0.4,
        'rgb(209,229,240)',
        0.6,
        'rgb(253,219,199)',
        0.8,
        'rgb(239,138,98)',
        1,
        'rgb(178,24,43)'
      ],
      'heatmap-radius': 30
    }
  };

  const coverageData = selectedTower ? {
    type: 'FeatureCollection',
    features: Array.from({ length: 1000 }).map(() => {
      const lat = Number(selectedTower.latitude) + (Math.random() - 0.5) * 0.1;
      const lon = Number(selectedTower.longitude) + (Math.random() - 0.5) * 0.1;
      const signal = calculateSignalStrength(selectedTower, lat, lon);
      return {
        type: 'Feature',
        properties: { signal },
        geometry: {
          type: 'Point',
          coordinates: [lon, lat]
        }
      };
    })
  } : null;

  return (
    <Map
      ref={mapRef}
      initialViewState={{
        latitude: 40,
        longitude: -100,
        zoom: 3.5
      }}
      style={{ width: '100%', height: '100%' }}
      mapStyle="mapbox://styles/mapbox/dark-v11"
      mapboxAccessToken={MAPBOX_TOKEN}
      onDragOver={(e: React.DragEvent<HTMLDivElement>) => e.preventDefault()}
      onDrop={handleDrop}
    >
      {towers.map((tower) => (
        <TowerMarker
          key={tower.id}
          tower={tower}
          isSelected={selectedTower?.id === tower.id}
        />
      ))}
      {coverageData && (
        <Source type="geojson" data={coverageData}>
          <Layer {...coverageLayer} />
        </Source>
      )}
    </Map>
  );
}