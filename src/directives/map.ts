import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  AfterContentInit,
  forwardRef,
  ElementRef,
  QueryList,
  Attribute,
  ContentChildren,
  Output,
  EventEmitter
} from '@angular/core';

import { HereMapsManager } from '../services/maps-manager';
import { BaseMapComponent } from './base-map-component';
import { LatLng, GeoPoint } from '../interface/lat-lng';
import { MapUIService } from '../services/map-ui.service';
import { IControlOptions } from '../interface/control-options.interface';
import { toLatLng } from '../utils/position';
import { Subscription } from 'rxjs';

/**
 * Component that should render and initialize map instance.
 * Use it to define point in html document where map should be rendered
 */
@Component({
  selector: 'heremap',
  template: `
        <div class="heremap-container" style="width: inherit; height: inherit"></div>
        <ng-content></ng-content>
    `,
  styles: [':host {width: 100%; height: 100%}'],
  providers: [{ provide: MapUIService, useClass: MapUIService }]
})
export class MapComponent implements OnDestroy, OnInit, AfterContentInit {
  static counters = 0;

  @ContentChildren(forwardRef(() => BaseMapComponent), {})
  public mapComponents: QueryList<BaseMapComponent<H.map.Object>>;

  public readonly ui = new Promise<H.ui.UI>(
    resolve => (this._uiResolver = resolve)
  );
  public readonly mapEvents = new Promise<H.mapevents.MapEvents>(
    resolve => (this._mapEventsResolver = resolve)
  );
  public readonly behavior = new Promise<H.mapevents.Behavior>(
    resolve => (this._behaviorResolver = resolve)
  );

  /**
   * Should map auto resize bounds to current set of markers
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
      console.warn(
        'Option "backgroundColor" can only be set when the map is initialized'
      );
      return;
    }

    this._mapBackgroundColor = value;
  }

  /**
   * The initial Map center. Required.
   */
  @Input()
  set center(value: GeoPoint) {
    if (!value) {
      return;
    }
    
    const mapCenter = toLatLng(value);

    this._map.then(map => {
        if (mapCenter.lat && mapCenter.lng) {
          map.setCenter(toLatLng(value));
      }
    });
    
    if (mapCenter.lat && mapCenter.lng)
      this._center = toLatLng(value);
  }
  get center() {
    return this._center;
  }

  /**
   * Enables/disables zoom and center on double click. Enabled by default.
   */
  @Input()
  public enableDoubleClickZoom = true;

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
   * The minimum zoom level which will be displayed on the map.
   */
  @Input()
  public minZoom: number;

  /**
   * The maximum zoom level which will be displayed on the map.
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

  /**
   * Notifies subscribers that map is updated
   */
  @Output()
  update = new EventEmitter<H.Map>();

  /**
   * Fires when user interacts with map by clicking on it
   */
  @Output()
  clickMap = new EventEmitter<H.mapevents.Event>();

  protected _uiResolver: (ui: H.ui.UI) => void;
  protected _mapEventsResolver: (mapEvents: H.mapevents.MapEvents) => void;
  protected _behaviorResolver: (behavior: H.mapevents.Behavior) => void;

  private _id: number;
  private _map: Promise<H.Map>;
  private _mapResolver: (map: H.Map) => void;
  private _mapBackgroundColor: string;

  private _mapComponentsSubscriptions: Subscription;

  private _center: LatLng | { latitude: number; longitude: number };

  constructor(
    @Attribute('name') private _name: string,
    private _elem: ElementRef,
    private _mapsManager: HereMapsManager
  ) {
    this._id = MapComponent.counters++;
    this._map = new Promise(resolve => (this._mapResolver = resolve));
  }

  /**
   * When resolved, returns Heremap instance
   */
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
        this._elem.nativeElement.querySelector('.heremap-container'),
        this.getOptions(),
        this.getControlOptions()
      )
      .then(({ map: map, ui: ui, platform: platform, mapEvents: mapEvents, behavior: behavior }) => {
        this._mapsManager.addMap(this.toString(), map);
        this._uiResolver(ui);
        this._mapResolver(map);
        this._mapEventsResolver(mapEvents);
        this._behaviorResolver(behavior);
        this.attachEvents(map);
      });
  }

  ngOnDestroy(): void {
    this._mapsManager.removeMap(this.toString());
    this._mapComponentsSubscriptions.unsubscribe();
  }

  ngAfterContentInit(): void {
    this._mapComponentsSubscriptions = this.mapComponents.changes.subscribe(
      () => {
        this.attachComponentsToMap();
      }
    );

    this.attachComponentsToMap();
  }

  toString(): string {
    return this._name ? this._name : `fh.here-maps-${this._id}`;
  }

  /**
   * Fits map to given bounds
   * @param bounds
   */
  public fitBounds(bounds: H.geo.Rect) {
    this.resetMapBounds(bounds);
  }

  private attachComponentsToMap(): void {
    this._map.then(map => {
      this.ui.then(ui => {
        this.mapComponents.filter(v => !v.hasMapComponent()).forEach(v => {
          v.setMapComponent(this, map, ui);
        });
      });
    });
  }

  private getOptions(): H.Map.Options {
    return {
      center: this.center ? this.latLngCenter() : { lat: 0, lng: 0 },
      zoom: this.zoom || 5
    };
  }

  private getControlOptions(): IControlOptions {
    return {
      mapTypeControl: this.mapTypeControl,
      rotateControl: this.rotateControl,
      scaleControl: this.scaleControl,
      streetViewControl: this.streetViewControl,
      zoomControl: this.zoomControl,
      enableDoubleClickZoom: this.enableDoubleClickZoom,
      draggable: this.draggable,
      keyboardShortcuts: this.keyboardShortcuts,
      scrollwheel: this.scrollwheel
    };
  }

  private resetMapBounds(bounds: H.geo.Rect) {
    this._map.then(map => {
      map.setViewBounds(bounds, this.animateZoom);
    });
  }

  private attachEvents(map: H.Map) {
    map.addEventListener('mapviewchangeend', () => {
      this.update.emit(map);
    });

    map.addEventListener('tap', (e: any) => {
      const pointer = e.currentPointer;
      const coordinates = map.screenToGeo(pointer.viewportX, pointer.viewportY);

      this.clickMap.emit({ ...e, coordinates });
    });
  }

  private latLngCenter(): LatLng {
    const lat = (this.center as any).lat
      ? (this.center as any).lat
      : (this.center as any).latitude;
    const lng = (this.center as any).lng
      ? (this.center as any).lng
      : (this.center as any).longitude;

    return { lat, lng };
  }
}
