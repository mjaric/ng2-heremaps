/**
 * Structure describes Geo Location with latitude and longitude
 */
export type LatLng = {
    lat: number;
    lng: number;
}


export type GeoPoint = LatLng | Coordinates | { latitude: number, longitude: number };