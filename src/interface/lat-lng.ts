/**
 * Structure describes Geo Location with latitude and longitude
 */
export interface LatLon {
  lat: number;
  lon: number;
}

export interface LatLng {
  lat: number;
  lng: number;
}

export type GeoPoint =
  | LatLng
  | LatLon
  | Coordinates
  | { latitude: number; longitude: number };
