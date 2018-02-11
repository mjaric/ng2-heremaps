import {GeoPoint, LatLng} from '../interface/lat-lng';


export function toLatLng(geoPoint: GeoPoint): LatLng {
    return {
        lat: 'lat' in geoPoint ? geoPoint.lat : geoPoint.latitude,
        lng: 'lng' in geoPoint ? geoPoint.lng : geoPoint.longitude
    }
}

