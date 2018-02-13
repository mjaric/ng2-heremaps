/**
 * Created by mjaric on 9/28/16.
 */
import {Injectable} from '@angular/core';
import {LazyMapsApiLoader} from '../loaders/lazy-maps-api-loader';
import {MarkerOptions} from '../interface/marker-options';
import {LatLng} from '../interface/lat-lng';

const DefaultCoords: { latitude: number, longitude: number } = {
    latitude: 40.730610,
    longitude: -73.935242
};

function noop() {
}

/**
 * Service responsible to execute arbitrary functions in specific google map context
 */
@Injectable()
export class HereMapsManager {

    private _maps: Map<string, H.Map> = new Map<string, H.Map>();
    private _browserLocationPromise: Promise<{ latitude: number, longitude: number }>;

    constructor(private loader: LazyMapsApiLoader) {
        // check browser location
        this.getBrowserLocation()
            .then(noop);
        // preload map immediately
        this.loader
            .load()
            .then(noop);
    }

    public onApiLoad(): Promise<void> {
        return this
            .loader
            .load();
    }

    public createMarker(options: MarkerOptions): Promise<H.map.Marker> {
        return this
            .loader
            .platformReady
            .then(() => {
                return new H.map.Marker(<LatLng>(options).position);
            });
    }

    // createDirections(options?: google.maps.DirectionsRendererOptions): Promise<google.maps.DirectionsRenderer> {
    //     return this.loader
    //         .load()
    //         .then(() => {
    //             return new google.maps.DirectionsRenderer(options);
    //         });
    // }
    //
    // getDirections(origin: LongLat,
    //     destination: LongLat): Promise<google.maps.DirectionsResult> {
    //     return this
    //         .loader
    //         .load()
    //         .then(() => {
    //             let svc = new google.maps.DirectionsService();
    //             return new Promise<google.maps.DirectionsResult>((resolve, reject) => {
    //                 let request = {
    //                     origin: new google.maps.LatLng(
    //                         (<google.maps.LatLngLiteral>origin).lat || (<Coordinates>origin).latitude,
    //                         (<google.maps.LatLngLiteral>origin).lng || (<Coordinates>origin).longitude
    //                     ),
    //                     destination: new google.maps.LatLng(
    //                         (<google.maps.LatLngLiteral>destination).lat || (<Coordinates>destination).latitude,
    //                         (<google.maps.LatLngLiteral>destination).lng || (<Coordinates>destination).longitude
    //                     ),
    //                     travelMode: google.maps.TravelMode.DRIVING
    //                 };
    //                 svc.route(request, (result: google.maps.DirectionsResult, status: google.maps.DirectionsStatus) => {
    //                     if (status === google.maps.DirectionsStatus.OK) {
    //                         resolve(result);
    //                     } else {
    //                         console.error({ message: 'fail to get directions', status, result });
    //                         reject({ status, result });
    //                     }
    //                 });
    //             });
    //         });
    // }

    public createMap(el: HTMLElement, options?: H.Map.Options): Promise<{map: H.Map, ui: H.ui.UI, platform: H.service.Platform}> {
        return this.loader
            .platformReady
            .then(platform => {
                let defaultLayers = platform.createDefaultLayers();
                let map = new H.Map(el, defaultLayers.normal.map, options);
                let ui = H.ui.UI.createDefault(map, defaultLayers, 'en-US');
                ui.setUnitSystem(H.ui.UnitSystem.IMPERIAL);
                ui.removeControl('mapsettings');
                let mapEvents = new H.mapevents.MapEvents(map);
                let behaviour = new H.mapevents.Behavior(mapEvents);
                return {map, ui, platform};
            });
    }

    public getMap(name: string): Promise<H.Map> {
        return this.loader
            .load()
            .then(() => <H.Map>this._maps.get(name));
    }

    public addMap(name: string, map: H.Map): void {
        this._maps.set(name, map);
    }

    public removeMap(name: string): boolean {
        return this._maps.delete(name);
    }

    // createAutocomplete(input: ElementRef,
    //     options: google.maps.places.AutocompleteOptions): Promise<google.maps.places.Autocomplete> {
    //     return this.loader.load().then(() => {
    //         return new google.maps.places.Autocomplete(input.nativeElement, options);
    //     });
    // }

    public getBrowserLocation(): Promise<Coordinates | { longitude: number, latitude: number }> {
        if (this._browserLocationPromise) {
            return (this._browserLocationPromise);
        }

        return this._browserLocationPromise = new Promise<{ latitude: number, longitude: number }>((resolve) => {
            if (location.protocol === 'https' && navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (success: { coords: Coordinates, timestamp: number }) => {
                        resolve(success.coords);
                    }, (error) => {
                        console.error(error);
                        if (error.code !== PositionError.PERMISSION_DENIED) {
                            console.warn(`Permission is accepted but error encounter with message: ${error.message}`);
                        }
                        // if user didn't answer return default
                        resolve(DefaultCoords);
                    });
            } else {
                // if browser do not support location API return default (NYC)
                resolve(DefaultCoords);
            }
        });

    }

    public calculateMapBounds(points: Array<LatLng | Coordinates | H.map.AbstractMarker> = []): Promise<H.geo.Rect> {
        return this
            .loader
            .platformReady
            .then((_) => {
                let bounds = (new H.map.Group()).getBounds();
                if (points && points.length > 1) {
                    points.forEach(m => {
                        if (m instanceof H.map.AbstractMarker) {
                            bounds.mergePoint(m.getPosition());
                        } else {
                            bounds.mergePoint({
                                lat: m['latitude'] !== void(0) ? (<Coordinates>m).latitude : (<LatLng>m).lat,
                                lng: m['longitude'] !== void(0) ? (<Coordinates>m).longitude : (<LatLng>m).lng
                            });
                        }
                    });
                    return Promise.resolve(bounds);
                }
                return Promise.resolve(bounds);
            });
    }
}
