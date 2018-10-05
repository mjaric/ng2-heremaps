import { GeoPoint, LatLng, LatLon } from '../interface/lat-lng';

/**
 * Converts supported type of geo point to LatLong object. 
 * If geoPoint parameter is null or undefined then function will return geo center
 * {lat: 0, lng: 0}
 * @param geoPoint Any supported type of geo point
 */
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
