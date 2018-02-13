/**
 * Created by mjaric on 9/30/16.
 */
import {Directive, Input, Output, OnInit, OnDestroy, EventEmitter, forwardRef} from '@angular/core';
import {HereMapsManager} from '../services/maps-manager';
import {BaseMapComponent} from './base-map-component';
import {GeoPoint, LatLng} from '../interface/lat-lng';
import {toLatLng} from '../utils/position';

export type DirectionsResolver = (origin: LatLng, destination: LatLng) => Promise<LatLng[]>;

@Directive({
    selector: 'map-directions',
    providers: [{provide: BaseMapComponent, useExisting: forwardRef(() => MapDirectionsDirective)}]
})
export class MapDirectionsDirective extends BaseMapComponent<H.map.Polyline> implements OnInit, OnDestroy {
    // private _originMarker: H.map.Marker;
    // private _destinationMarker: H.map.Marker;

    private _origin: GeoPoint;
    private _destination: GeoPoint;
    private _lineWidth: number;
    private _strokeColor: string;
    private _fillColor: string;

    private _route: Array<LatLng> | DirectionsResolver;


    get route(): Array<LatLng> | DirectionsResolver {
        return this._route;
    }

    @Input()
    set route(value: Array<LatLng> | DirectionsResolver) {
        if (this._route !== value) {
            this._route = value;
            this.tryShowRoute();
        }
    }

    get origin(): GeoPoint {
        return this._origin;
    }

    /**
     * Origin of directions
     * @param value can be google.maps.LatLngLiteral or Coordinates  or {latitude: number, longitude: number}
     */
    @Input()
    set origin(value: GeoPoint) {
        if (this._origin !== value) {
            this._origin = value;
            this.tryShowRoute();
        }
    }

    get destination(): GeoPoint {
        return this._destination;
    }

    /**
     * Destination of directions
     * @param value can be google.maps.LatLngLiteral or Coordinates  or {latitude: number, longitude: number}
     */
    @Input()
    set destination(value: GeoPoint) {
        if (this._destination !== value) {
            this._destination = value;
            this.tryShowRoute();
        }
    }


    get lineWidth(): number {
        return this._lineWidth;
    }

    set lineWidth(value: number) {
        if (this._lineWidth !== value) {
            this._lineWidth = value;
            this.proxy.then(route => {
                let style = route.getStyle();
                style = new H.map.SpatialStyle();
                style.lineWidth = this._lineWidth;
                route.setStyle(style);
            })
        }
    }

    get strokeColor(): string {
        return this._strokeColor;
    }

    set strokeColor(value: string) {
        if (this._strokeColor !== value) {
            this._strokeColor = value;
            this.proxy.then(route => {
                let style = route.getStyle();
                style = new H.map.SpatialStyle();
                style.strokeColor = value;
                route.setStyle(style);
            })
        }
    }

    get fillColor(): string {
        return this._fillColor;
    }

    set fillColor(value: string) {
        if (this._fillColor !== value) {
            this._fillColor = value;
            this.proxy.then(route => {
                let style = route.getStyle();
                style = new H.map.SpatialStyle();
                style.fillColor = value;
                route.setStyle(style);
            })
        }
    }

    /**
     * This event is fired when the directions route changes.
     */
    @Output()
    directions_changed: EventEmitter<void> = new EventEmitter<void>();
    /**
     * By default, the input map is centered and zoomed to the bounding box of this set of directions.
     * If this option is set to true, the viewport is left unchanged, unless the map's center and zoom were never set.
     * @type {boolean}
     */
    @Input()
    public preserveViewport = true;

    constructor(private _mapsManager: HereMapsManager) {
        super();

        this._mapsManager
            .onApiLoad()
            .then(() => {
                let route = new H.map.Polyline(new H.geo.Strip());
                this.proxyResolver(route);
            });
    }

    /*
     * Internal logic
     * **********************************************************
     */


    public ngOnInit(): void {

    }

    public ngOnDestroy(): void {
        this.mapComponent
            .getMap()
            .then(map => {
                this.proxy.then(polyline => {
                    polyline.dispose();
                    map.removeObject(polyline);
                });
            });
    }

    private tryShowRoute() {
        let route = this._route || [];
        if (route instanceof Array) {
            this.renderRoute(route);
        } else if (typeof(route) === 'function') {
            this.renderRoute([]);
            let resolver = <DirectionsResolver>this._route;
            resolver(toLatLng(this.origin), toLatLng(this.destination))
                .then(r => {
                    this.renderRoute(r || []);
                })
                .catch(e => {
                    this.renderRoute([]);
                });
        } else {
            this.renderRoute([]);
        }
    }

    private renderRoute(route: GeoPoint[]) {
        this.proxy.then(polyline => {
            if (route instanceof Array) {
                let strip = new H.geo.Strip([]);
                route.forEach(point => {
                    strip.pushPoint(toLatLng(point));
                });
                polyline.setStrip(strip);
                polyline.setVisibility(this._route.length > 0);
            } else {
                polyline.setStrip(new H.geo.Strip([]));
                polyline.setVisibility(false);
                return;
            }
        });
    }

    private bindEvents() {
        // this.proxy.then()
        // directions.addListener('directions_changed', (e) => this.directions_changed.emit(e));
    }
}
