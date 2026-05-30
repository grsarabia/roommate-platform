"use client";

import { useEffect, useRef, useState } from "react";
import { useGoogleMaps } from "../context/GoogleMapsContext";

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onPlaceSelect: (place: {
    address: string;
    lat: number;
    lng: number;
    comuna?: string;
  }) => void;
}

export default function AddressAutocomplete({
  value,
  onChange,
  onPlaceSelect,
}: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const isLoaded = useGoogleMaps();

  useEffect(() => {
    if (!inputRef.current || !window.google || !isLoaded || autocomplete) return;

    const autocompleteInstance = new google.maps.places.Autocomplete(inputRef.current, {
      componentRestrictions: { country: "cl" }, // Restringir a Chile
      fields: ["address_components", "formatted_address", "geometry", "name"],
    });

    autocompleteInstance.addListener("place_changed", () => {
      const place = autocompleteInstance.getPlace();

      if (!place.geometry || !place.geometry.location) {
        return;
      }

      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      const address = place.formatted_address || place.name || "";

      // Extraer la comuna de los componentes de dirección
      let comuna = "";
      place.address_components?.forEach((component) => {
        if (component.types.includes("locality") || component.types.includes("administrative_area_level_3")) {
          comuna = component.long_name;
        }
      });

      onChange(address);
      onPlaceSelect({ address, lat, lng, comuna });
    });

    setAutocomplete(autocompleteInstance);
  }, [isLoaded, autocomplete, onChange, onPlaceSelect]);

  if (!isLoaded) {
    return (
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 transition-all outline-none"
        placeholder="Calle y número"
      />
    );
  }

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 transition-all outline-none"
        placeholder="Empieza a escribir una dirección..."
      />
      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
        🔍
      </div>
    </div>
  );
}
