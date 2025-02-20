import { Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import type { Tower } from '@shared/schema';

interface TowerMarkerProps {
  tower: Tower;
  isSelected: boolean;
  onClick: () => void;
  score?: number;
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

export default function TowerMarker({ tower, isSelected, onClick, score }: TowerMarkerProps) {
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
          <div className="mt-2 text-xs text-gray-500">
            <p>Based on:</p>
            <ul className="list-disc list-inside">
              <li>Terrain favorability</li>
              <li>Environmental factors</li>
              <li>Accessibility</li>
              <li>Distance from center</li>
            </ul>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}