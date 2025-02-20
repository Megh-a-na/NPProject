import { Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import type { Tower } from '@shared/schema';

interface TowerMarkerProps {
  tower: Tower;
  isSelected: boolean;
  onClick: () => void;
  score?: number;
  details?: {
    terrain: number;
    environment: number;
    accessibility: number;
    distance: number;
  };
}

const towerIcon = new Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M12 2v20M4 4l16 16m0-16L4 20"/>
    </svg>
  `),
  iconSize: [24, 24],
  iconAnchor: [12, 24],
});

export default function TowerMarker({ tower, isSelected, onClick, score, details }: TowerMarkerProps) {
  return (
    <Marker
      position={[Number(tower.latitude), Number(tower.longitude)]}
      icon={towerIcon}
      opacity={isSelected ? 1 : 0.7}
      eventHandlers={{
        click: onClick,
      }}
    >
      <Popup>
        <div className="p-2">
          <h3 className="font-bold">{tower.name}</h3>
          <p>Power: {tower.transmissionPower} dBm</p>
          <p>Frequency: {tower.frequency} MHz</p>
          {score !== undefined && (
            <p className="mt-2 text-sm text-green-600">
              Performance Score: {score.toFixed(2)}
            </p>
          )}
          {details && (
            <div className="mt-2 text-xs">
              <p className="font-medium mb-1">Site Characteristics:</p>
              <ul className="space-y-1 text-gray-600">
                <li>Terrain Favorability: {details.terrain.toFixed(1)}/100</li>
                <li>Environmental Impact: {details.environment.toFixed(1)}/50</li>
                <li>Accessibility: {details.accessibility.toFixed(1)}/100</li>
                <li>Distance from Center: {details.distance.toFixed(1)} km</li>
              </ul>
            </div>
          )}
        </div>
      </Popup>
    </Marker>
  );
}