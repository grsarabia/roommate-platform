"use client";

import { useCallback, useState, useEffect, useRef } from "react";
import { GoogleMap, Marker } from "@react-google-maps/api";
import { useGoogleMaps } from "../context/GoogleMapsContext";

interface MapPickerProps {
  lat?: number;
  lng?: number;
  onLocationSelect?: (lat: number, lng: number) => void;
  readOnly?: boolean;
}

const containerStyle = {
  width: "100%",
  height: "300px", // Reducido de 400px a 300px
};

// Centro de Santiago, Chile por defecto
const defaultCenter = {
  lat: -33.4489,
  lng: -70.6693,
};

export default function MapPicker({ lat, lng, onLocationSelect, readOnly = false }: MapPickerProps) {
  const isLoaded = useGoogleMaps();
  const mapRef = useRef<google.maps.Map | null>(null);
  const [markerPosition, setMarkerPosition] = useState<{ lat: number; lng: number } | null>(
    lat && lng ? { lat, lng } : null
  );

  // Actualizar el marcador cuando cambien las props lat/lng
  useEffect(() => {
    if (lat && lng) {
      setMarkerPosition({ lat, lng });
      // Si el mapa ya está cargado, centrarlo suavemente
      if (mapRef.current) {
        mapRef.current.panTo({ lat, lng });
      }
    }
  }, [lat, lng]);

  const center = markerPosition || defaultCenter;

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  if (!isLoaded) {
    return (
      <div className="w-full h-[300px] bg-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300">
        <div className="text-center p-6">
          <span className="text-4xl block mb-3">🗺️</span>
          <p className="text-gray-600 font-medium">
            Configura NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Agrega tu API key de Google Maps en .env.local
          </p>
        </div>
      </div>
    );
  }

  // Si es solo lectura y tenemos coordenadas, mostrar imagen estática (más liviana)
  if (readOnly && markerPosition) {
    // Resolución reducida para carga más rápida: 600x300 (antes 800x400)
    // scale=1 para resolución estándar (no @2x)
    const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${markerPosition.lat},${markerPosition.lng}&zoom=15&size=600x300&scale=1&markers=color:red%7C${markerPosition.lat},${markerPosition.lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`;
    
    return (
      <div className="w-full rounded-xl overflow-hidden border-2 border-gray-200 shadow-md">
        <img 
          src={staticMapUrl} 
          alt="Mapa de ubicación" 
          className="w-full h-[300px] object-cover"
          loading="lazy"
        />
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 px-4 py-3 border-t border-amber-200">
          <p className="text-sm text-gray-700 flex items-center space-x-2">
            <span className="text-lg">📍</span>
            <span>
              Ubicación aproximada de la propiedad
            </span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full rounded-xl overflow-hidden border-2 border-gray-200 shadow-md">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={markerPosition ? 15 : 12}
        onLoad={onLoad}
        options={{
          // Deshabilitar toda interacción con el mapa
          disableDefaultUI: true,
          gestureHandling: 'none',
          zoomControl: false,
          scrollwheel: false,
          disableDoubleClickZoom: true,
          draggable: false,
          // Optimizaciones de rendimiento y resolución
          clickableIcons: false,
          keyboardShortcuts: false,
          mapTypeId: 'roadmap', // Tipo más simple y rápido
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }]
            },
            {
              featureType: "transit",
              elementType: "labels",
              stylers: [{ visibility: "off" }]
            }
          ]
        }}
      >
        {markerPosition && <Marker position={markerPosition} />}
      </GoogleMap>
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-4 py-3 border-t border-indigo-200">
        <p className="text-sm text-gray-700 flex items-center space-x-2">
          <span className="text-lg">💡</span>
          <span>
            {markerPosition 
              ? "La ubicación se actualiza al seleccionar una dirección arriba"
              : "Usa el buscador de direcciones para marcar la ubicación"}
          </span>
        </p>
      </div>
    </div>
  );
}
