import {
    Component,
    Input,
    OnInit,
    OnDestroy,
    AfterContentInit,
    forwardRef,
    ElementRef,
    QueryList,
    Attribute, ContentChildren
} from '@angular/core';
import {Subscription} from 'rxjs/Subscription';

import {MapsManager} from '../services/maps-manager';
import {BaseMapComponent} from './base-map-component';
import {LatLng} from '../interface/lat-lng';
import {MapUIService} from '../services/map-ui.service';


@Component({
    selector: 'heremap',
    template: `
        <div class="heremap-container" style="width: inherit; height: inherit"></div>
        <ng-content></ng-content>
    `,
    providers: [{provide: MapUIService, useClass: MapUIService}]
})
export class MapComponent implements OnDestroy, OnInit, AfterContentInit {
    static counters = 0;

    private _id: number;
    private _map: Promise<H.Map>;
    private _mapResolver: (map: H.Map) => void;
    private _mapBackgroundColor: string;
    protected _uiResolver: (ui: H.ui.UI) => void;

    private _mapComponentsSubscriptions: Subscription;

    @ContentChildren(forwardRef(() => BaseMapComponent), {})
    public mapComponents: QueryList<BaseMapComponent<H.map.Object>>;

    public readonly ui = new Promise<H.ui.UI>(resolve => this._uiResolver = resolve);

    /**
     * Should map auto resize bounds to current set of markers
     * @type {boolean} default is true
     */
    @Input()
    public autoFitMarkers = true;

    /**
     * Color used for the background of the Map div.
     * This color will be visible when tiles have not yet loaded as the user pans.
     * Note: This option can only be set when the map is initialized.
     */
    @Input()
    set backgroundColor(value: string) {
        if (this._mapBackgroundColor) {
            console.warn('Option "backgroundColor" can only be set when the map is initialized');
            return;
        }

        this._mapBackgroundColor = value;
    }

    /**
     * The initial Map center. Required.
     */
    @Input()
    set center(value: LatLng | { latitude: number, longitude: number }) {
        this._map.then(map => {
            if (value) {
                map.setCenter({
                    lat: (<LatLng>value).lat || (<Coordinates>value).latitude,
                    lng: (<LatLng>value).lng || (<Coordinates>value).longitude
                });
            }

        });
    }


    /**
     * Enables/disables zoom and center on double click. Enabled by default.
     */
    @Input()
    public disableDoubleClickZoom = true;

    /**
     * If false, prevents the map from being dragged.
     * Dragging is enabled by default.
     */
    @Input()
    public draggable = true;

    /**
     * If false, prevents the map from being controlled by the keyboard.
     * Keyboard shortcuts are enabled by default.
     */
    @Input()
    public keyboardShortcuts = true;

    /**
     * If false, disables scrollwheel zooming on the map.
     * The scrollwheel is enabled by default.
     */
    @Input()
    public scrollwheel = true;

    /*
     * Zoom options
     * **********************************************************
     */

    /**
     * Map zoom level.
     */
    @Input()
    public zoom = 5;

    /**
     * The maximum zoom level which will be displayed on the map.
     */
    @Input()
    public minZoom: number;

    /**
     * The minimum zoom level which will be displayed on the map.
     */
    @Input()
    public maxZoom: number;

    /*
     * Control options
     * **********************************************************
     */

    /**
     * Enables/disables all default UI.
     */
    @Input()
    public disableDefaultUI = false;

    /**
     * Enabled/Disabled state of the Map type control.
     */
    @Input()
    public mapTypeControl = false;

    /**
     * Enabled/Disabled state of the Rotate control.
     */
    @Input()
    public rotateControl = false;

    /**
     * Enabled/Disabled state of the Scale control.
     */
    @Input()
    public scaleControl = true;

    /**
     * Enabled/Disabled state of the Street View Pegman control.
     */
    @Input()
    public streetViewControl = false;

    @Input()
    public animateZoom = true;

    /**
     * Enabled/Disabled state of the Zoom control
     */
    @Input()
    public zoomControl = true;

    constructor(@Attribute('name')
                private _name: string,
                private _elem: ElementRef,
                private _mapsManager: MapsManager) {

        this._id = MapComponent.counters++;
        this._map = new Promise(resolve => this._mapResolver = resolve);
    }

    getMap(): Promise<H.Map> {
        return this._map;
    }

    /*
     * Internal logic
     * **********************************************************
     */

    ngOnInit(): void {
        this._mapsManager
            .createMap(
                this._elem.nativeElement.querySelector('.map-container'),
                this.getOptions())
            .then(({map: map, ui: ui, platform: platform}) => {
                this._mapsManager.addMap(this.toString(), map);
                this._uiResolver(ui);
                this._mapResolver(map);
            });
    }

    ngOnDestroy(): void {
        this._mapsManager.removeMap(this._name);
        this._mapComponentsSubscriptions.unsubscribe();
    }

    ngAfterContentInit(): void {
        this._mapComponentsSubscriptions = this.mapComponents.changes.subscribe(() => {
            this.attachComponentsToMap();
        });

        this.attachComponentsToMap();

    }

    toString(): string {
        return this._name ? this._name : `fh.google-maps-${this._id}`;
    }

    public fitBounds(bounds: H.geo.Rect) {
        this.resetMapBounds(bounds);
    }

    private attachComponentsToMap(): void {
        this._map.then(map => {
            this.mapComponents
                .filter(v => !v.hasMapComponent())
                .forEach(v => {
                    v.setMapComponent(this, map);
                });
        });
    }

    private getOptions(): H.Map.Options {
        return {
            center: {lat: 0, lng: 0},
            zoom: this.zoom || 5
        };
    }

    private resetMapBounds(bounds: H.geo.Rect) {
        this._map.then(map => {
            map.setViewBounds(bounds, this.animateZoom);
        });
    }
}


