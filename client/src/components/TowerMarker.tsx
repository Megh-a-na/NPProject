import { Marker } from 'react-map-gl';
import { Radio } from 'lucide-react';
import type { Tower } from '@shared/schema';

interface TowerMarkerProps {
  tower: Tower;
  isSelected: boolean;
}

export default function TowerMarker({ tower, isSelected }: TowerMarkerProps) {
  return (
    <Marker
      latitude={Number(tower.latitude)}
      longitude={Number(tower.longitude)}
      anchor="bottom"
    >
      <div className={`transform transition-transform ${isSelected ? 'scale-125' : ''}`}>
        <Radio className={`w-6 h-6 ${isSelected ? 'text-primary' : 'text-white'}`} />
      </div>
    </Marker>
  );
}
