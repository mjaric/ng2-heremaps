import { GeoPoint, LatLng, LatLon } from '../interface/lat-lng';

export function toLatLng(geoPoint: GeoPoint): LatLng {
  if (geoPoint) {
    return {
      lat:
        'lat' in geoPoint
          ? (geoPoint as LatLng).lat
          : (geoPoint as Coordinates).latitude,
      lng:
        'lng' in geoPoint
          ? (geoPoint as LatLng).lng
          : 'lon' in geoPoint
            ? (geoPoint as LatLon).lon
            : (geoPoint as Coordinates).longitude
    };
  }

  return {lat: 0, lng: 0};
}
