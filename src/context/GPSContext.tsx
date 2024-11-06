// GPSContext.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import io, { Socket } from 'socket.io-client';

interface Location {
  latitude: number | null;
  longitude: number | null;
}

interface OtherLocation extends Location {
  userId: string;
}

interface GPSContextType {
  location: Location;
  otherLocations: OtherLocation[];
}

const GPSContext = createContext<GPSContextType | undefined>(undefined);

const socket: Socket = io('http://localhost:3000');

export const GPSProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [location, setLocation] = useState<Location>({ latitude: null, longitude: null });
  const [otherLocations, setOtherLocations] = useState<OtherLocation[]>([]);

  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });
        
        socket.emit('updateLocation', { userId: socket.id, latitude, longitude });
      },
      (error) => {
        console.error("Error watching position:", error);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );

    socket.on('locationUpdate', (data: OtherLocation) => {
      setOtherLocations((prevLocations) => {
        const newLocations = prevLocations.filter((loc) => loc.userId !== data.userId);
        return [...newLocations, data];
      });
    });

    return () => {
      navigator.geolocation.clearWatch(watchId);
      socket.off('locationUpdate');
    };
  }, []);

  return (
    <GPSContext.Provider value={{ location, otherLocations }}>
      {children}
    </GPSContext.Provider>
  );
};

export const useGPS = (): GPSContextType => {
  const context = useContext(GPSContext);
  if (!context) {
    throw new Error("useGPS must be used within a GPSProvider");
  }
  return context;
};

