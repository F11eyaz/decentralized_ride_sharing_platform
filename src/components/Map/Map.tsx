// GPSApp.tsx
import React from 'react';
import { GPSProvider, useGPS } from '../../context/GPSContext';

const Map: React.FC = () => {
  const { location, otherLocations } = useGPS();

  return (
    <div>
      <h1>GPS Sharing</h1>
      <div>
        <h2>My Location</h2>
        <p>Latitude: {location.latitude}</p>
        <p>Longitude: {location.longitude}</p>
      </div>
      <h2>Other Users' Locations</h2>
      {otherLocations.map((loc) => (
        <div key={loc.userId}>
          <p>User: {loc.userId}</p>
          <p>Latitude: {loc.latitude}</p>
          <p>Longitude: {loc.longitude}</p>
        </div>
      ))}
    </div>
  );
};

export default Map;
