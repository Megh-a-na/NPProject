import { Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import type { Tower } from '@shared/schema';

interface TowerMarkerProps {
  tower: Tower;
  isSelected: boolean;
  onClick: () => void;
}

const towerIcon = new Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="48" viewBox="0 0 32 48" fill="none" stroke="currentColor">
      <!-- Tower base -->
      <path d="M8 44h16L16 4z" fill="#1e293b" stroke="#475569" stroke-width="2"/>
      <!-- Antennas -->
      <path d="M12 14l-4-2M20 14l4-2M12 24l-4-2M20 24l4-2" stroke="#94a3b8" stroke-width="2"/>
      <!-- Signal waves -->
      <path d="M6 8c4-3 16-3 20 0M8 12c3-2 13-2 16 0" stroke="#60a5fa" stroke-width="1.5" opacity="0.6"/>
      <!-- Shadow -->
      <ellipse cx="16" cy="44" rx="6" ry="2" fill="#0f172a" opacity="0.2"/>
    </svg>
  `),
  iconSize: [32, 48],
  iconAnchor: [16, 44],
  popupAnchor: [0, -40],
});

const selectedTowerIcon = new Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="48" viewBox="0 0 32 48" fill="none" stroke="currentColor">
      <!-- Tower base -->
      <path d="M8 44h16L16 4z" fill="#0f766e" stroke="#0d9488" stroke-width="2"/>
      <!-- Antennas -->
      <path d="M12 14l-4-2M20 14l4-2M12 24l-4-2M20 24l4-2" stroke="#5eead4" stroke-width="2"/>
      <!-- Signal waves -->
      <path d="M6 8c4-3 16-3 20 0M8 12c3-2 13-2 16 0" stroke="#2dd4bf" stroke-width="1.5" opacity="0.8"/>
      <!-- Selection glow -->
      <path d="M8 44h16L16 4z" stroke="#14b8a6" stroke-width="4" opacity="0.3"/>
      <!-- Shadow -->
      <ellipse cx="16" cy="44" rx="6" ry="2" fill="#0f172a" opacity="0.2"/>
    </svg>
  `),
  iconSize: [32, 48],
  iconAnchor: [16, 44],
  popupAnchor: [0, -40],
});

export default function TowerMarker({ tower, isSelected, onClick }: TowerMarkerProps) {
  return (
    <Marker
      position={[Number(tower.latitude), Number(tower.longitude)]}
      icon={isSelected ? selectedTowerIcon : towerIcon}
      eventHandlers={{
        click: onClick,
      }}
    >
      <Popup>
        <div className="p-2">
          <h3 className="font-bold">{tower.name}</h3>
          <p>Height: {tower.height}m</p>
          <p>Power: {tower.transmissionPower} dBm</p>
          <p>Frequency: {tower.frequency} MHz</p>
        </div>
      </Popup>
    </Marker>
  );
}