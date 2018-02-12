import {GeoPoint, LatLng} from '../interface/lat-lng';


export function toLatLng(geoPoint: GeoPoint): LatLng {
    return {
        lat: 'lat' in geoPoint ? (<LatLng>geoPoint).lat : (<Coordinates>geoPoint).latitude,
        lng: 'lng' in geoPoint ? (<LatLng>geoPoint).lng : (<Coordinates>geoPoint).longitude
    }
}

