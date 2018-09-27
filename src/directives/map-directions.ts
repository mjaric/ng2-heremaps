/**
 * Created by mjaric on 9/30/16.
 */
import {
  Directive,
  Input,
  Output,
  OnDestroy,
  EventEmitter,
  forwardRef
} from '@angular/core';
import { HereMapsManager } from '../services/maps-manager';
import { BaseMapComponent } from './base-map-component';
import { GeoPoint, LatLng } from '../interface/lat-lng';
import { toLatLng } from '../utils/position';
import { MapComponent } from './map';

export type DirectionsResolver = (
  origin: LatLng,
  destination: LatLng
) => Promise<LatLng[]>;

@Directive({
  selector: 'map-directions',
  providers: [
    {
      provide: BaseMapComponent,
      useExisting: forwardRef(() => MapDirectionsDirective)
    }
  ]
})
export class MapDirectionsDirective extends BaseMapComponent<H.map.Polyline>
  implements OnDestroy {
  // private _originMarker: H.map.Marker;
  // private _destinationMarker: H.map.Marker;

  protected mapComponent: MapComponent;

  @Input()
  set route(value: Array<LatLng> | DirectionsResolver) {
    if (this._route !== value) {
      this._route = value;
      this.tryShowRoute();
    }
  }
  get route(): Array<LatLng> | DirectionsResolver {
    return this._route;
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
  get origin(): GeoPoint {
    return this._origin;
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
  get destination(): GeoPoint {
    return this._destination;
  }

  /**
   * Destination of directions
   * @param value can be google.maps.LatLngLiteral or Coordinates  or {latitude: number, longitude: number}
   */
  @Input()
  set intermediatePoints(value: GeoPoint[]) {
    if (this._intermediatePoints !== value) {
      this._intermediatePoints = value;
      this.tryShowRoute();
    }
  }
  get intermediatePoints(): GeoPoint[] {
    return this._intermediatePoints;
  }

  set lineWidth(value: number) {
    if (this._lineWidth !== value) {
      this._lineWidth = value;
      this.proxy.then(route => {
        let style = route.getStyle();
        style = new H.map.SpatialStyle();
        style.lineWidth = this._lineWidth;
        route.setStyle(style);
      });
    }
  }
  get lineWidth(): number {
    return this._lineWidth;
  }

  set strokeColor(value: string) {
    if (this._strokeColor !== value) {
      this._strokeColor = value;
      this.proxy.then(route => {
        let style = route.getStyle();
        style = new H.map.SpatialStyle();
        style.strokeColor = value;
        route.setStyle(style);
      });
    }
  }
  get strokeColor(): string {
    return this._strokeColor;
  }

  set fillColor(value: string) {
    if (this._fillColor !== value) {
      this._fillColor = value;
      this.proxy.then(route => {
        let style = route.getStyle();
        style = new H.map.SpatialStyle();
        style.fillColor = value;
        route.setStyle(style);
      });
    }
  }
  get fillColor(): string {
    return this._fillColor;
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

  private _origin: GeoPoint;
  private _destination: GeoPoint;
  private _intermediatePoints: GeoPoint[] = [];
  private _lineWidth: number;
  private _strokeColor: string;
  private _fillColor: string;

  private _route: Array<LatLng> | DirectionsResolver;

  constructor(private _mapsManager: HereMapsManager) {
    super();

    this._mapsManager.onApiLoad().then(() => {
      const lineString = new H.geo.LineString([
        44.09,
        -116.9,
        3000,
        44.082305,
        -116.776059,
        2000
      ]);
      const route = new H.map.Polyline(lineString);
      this.proxyResolver(route);
    });
  }

  public hasMapComponent(): boolean {
    return !!this.mapComponent;
  }

  public setMapComponent(
    component: MapComponent,
    map: H.Map,
    ui: H.ui.UI
  ): void {
    this.mapComponent = component;
    this.proxy.then((mapObject: H.map.Polyline) =>
      setTimeout(() => {
        if (mapObject instanceof H.map.Object) {
          map.addObject(mapObject);
        }
      }, this.delay || 0)
    );
  }
  /*
     * Internal logic
     * **********************************************************
     */

  public ngOnDestroy(): void {
    this.mapComponent.getMap().then(map => {
      this.proxy.then(polyline => {
        polyline.dispose();
      });
    });
  }

  private tryShowRoute() {
    const route = this._route || [];
    if (route instanceof Array && route.length > 0) {
      this.renderRoute(route);
    } else if (this.origin && this.destination) {
      this.renderRoute([]);
      this._mapsManager
        .getDirections(
          toLatLng(this.origin),
          toLatLng(this.destination),
          this.intermediatePoints || []
        )
        .then(r => {
          const newRoute = r.response.route[0].shape.map(str => {
            const parts = str.split(',');
            return { lat: parseFloat(parts[0]), lng: parseFloat(parts[1]) };
          });
          this.renderRoute(newRoute || []);
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
      if (route instanceof Array && route.length > 0) {
        const lineString = new H.geo.LineString([]);
        route.forEach(point => {
          lineString.pushPoint(toLatLng(point));
        });
        polyline.setGeometry(lineString);
        polyline.setVisibility(route.length > 0);
      } else {
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
