'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, useMapEvents, Marker, Polygon } from 'react-leaflet';
import { LatLng } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
import L from 'leaflet';
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface FarmMapProps {
  onLocationUpdate: (coordinates: [number, number], boundaryData: any) => void;
}

function MapClickHandler({ onLocationUpdate }: FarmMapProps) {
  const [center, setCenter] = useState<[number, number] | null>(null);
  const [boundary, setBoundary] = useState<[number, number][]>([]);
  const [isDrawing, setIsDrawing] = useState(false);

  const map = useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      
      if (!center) {
        // First click sets the farm center
        setCenter([lat, lng]);
        onLocationUpdate([lat, lng], null);
      } else if (isDrawing) {
        // Subsequent clicks add to boundary
        const newBoundary = [...boundary, [lat, lng] as [number, number]];
        setBoundary(newBoundary);
        
        if (newBoundary.length >= 3) {
          onLocationUpdate(center, newBoundary);
        }
      }
    },
  });

  const startDrawing = () => {
    setIsDrawing(true);
    setBoundary([]);
  };

  const finishDrawing = () => {
    setIsDrawing(false);
    if (boundary.length >= 3 && center) {
      onLocationUpdate(center, boundary);
    }
  };

  const clearAll = () => {
    setCenter(null);
    setBoundary([]);
    setIsDrawing(false);
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {!center && (
          <p className="text-sm text-gray-600 w-full mb-2">
            Click on the map to mark your farm's center location
          </p>
        )}
        
        {center && !isDrawing && boundary.length === 0 && (
          <>
            <p className="text-sm text-gray-600 w-full mb-2">
              Farm center marked! Now draw your farm boundaries (optional)
            </p>
            <button
              onClick={startDrawing}
              className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
            >
              Draw Boundaries
            </button>
          </>
        )}
        
        {isDrawing && (
          <>
            <p className="text-sm text-gray-600 w-full mb-2">
              Click to add boundary points (minimum 3 points)
            </p>
            <button
              onClick={finishDrawing}
              disabled={boundary.length < 3}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              Finish ({boundary.length} points)
            </button>
          </>
        )}
        
        {(center || boundary.length > 0) && (
          <button
            onClick={clearAll}
            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
          >
            Clear All
          </button>
        )}
      </div>
      
      {center && <Marker position={center} />}
      {boundary.length >= 3 && (
        <Polygon 
          positions={boundary} 
          pathOptions={{ 
            color: 'green', 
            fillColor: 'lightgreen', 
            fillOpacity: 0.3 
          }} 
        />
      )}
    </div>
  );
}

export default function FarmMap({ onLocationUpdate }: FarmMapProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-600">Loading map...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-96 rounded-lg overflow-hidden border border-gray-300">
      <MapContainer
        center={[0.0236, 37.9062]} // Kenya coordinates as default
        zoom={6}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler onLocationUpdate={onLocationUpdate} />
      </MapContainer>
    </div>
  );
}
