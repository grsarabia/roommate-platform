"use client";

import { LoadScript } from "@react-google-maps/api";
import { createContext, useContext } from "react";

const libraries: ("places" | "geometry" | "drawing" | "visualization")[] = ["places"];

const GoogleMapsContext = createContext<boolean>(false);

export function useGoogleMaps() {
  return useContext(GoogleMapsContext);
}

export function GoogleMapsProvider({ children }: { children: React.ReactNode }) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

  if (!apiKey) {
    return <GoogleMapsContext.Provider value={false}>{children}</GoogleMapsContext.Provider>;
  }

  return (
    <LoadScript googleMapsApiKey={apiKey} libraries={libraries}>
      <GoogleMapsContext.Provider value={true}>{children}</GoogleMapsContext.Provider>
    </LoadScript>
  );
}
