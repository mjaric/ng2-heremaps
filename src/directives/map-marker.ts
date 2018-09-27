/**
 * Created by mjaric on 9/28/16.
 */
import {
  Directive,
  Input,
  Output,
  EventEmitter,
  forwardRef
} from '@angular/core';
import { HereMapsManager } from '../services/maps-manager';
import { BaseMapComponent } from './base-map-component';
import { GeoPoint } from '../interface/lat-lng';
import { toLatLng } from '../utils/position';
import { MapComponent } from './map';

@Directive({
  selector: 'map-marker',
  providers: [
    {
      provide: BaseMapComponent,
      useExisting: forwardRef(() => MapMakerDirective)
    }
  ]
})
export class MapMakerDirective extends BaseMapComponent<H.map.Marker> {
  /*
   * Outputs events
   * **********************************************************
   */

  /**
   * This event is fired when the marker icon was clicked.
   */
  @Output()
  click: EventEmitter<any> = new EventEmitter<any>();

  /**
   * This event is fired when the marker icon was double clicked.
   */
  @Output()
  dblclick: EventEmitter<any> = new EventEmitter<any>();

  /**
   * This event is fired for a rightclick on the marker.
   */
  @Output()
  rightclick: EventEmitter<any> = new EventEmitter<any>();

  /**
   * This event is fired when the marker position property changes.
   */
  @Output()
  position_changed: EventEmitter<any> = new EventEmitter<any>();

  /**
   * This event is fired when the marker icon property changes.
   */
  @Output()
  icon_changed: EventEmitter<any> = new EventEmitter<any>();

  /**
   * This event is fired when the marker title property changes.
   */
  @Output()
  title_changed: EventEmitter<any> = new EventEmitter<any>();

  /**
   * This event is fired when the marker visible property changes.
   */
  @Output()
  visible_changed: EventEmitter<any> = new EventEmitter<any>();

  /*
   * Inputs options
   * **********************************************************
   */

  /**
   * Marker position
   */
  @Input()
  set position(point: GeoPoint) {
    const position = toLatLng(point);
    this._mapsManager
      .createMarker({ position })
      .then((marker: H.map.Marker) => {
        this.bindEvents(marker);
        this.proxyResolver(marker);
      });

    this.proxy.then(marker => {
      marker.setPosition(toLatLng(point));
    });
  }

  /**
   * If true, the marker receives mouse and touch events.
   * Default value is true.
   */
  @Input()
  set clickable(mode: boolean) {
    // this.proxy.then(marker => marker.setClickable(mode));
    this._clickable = mode;
  }

  /**
   * Icon for the foreground. If a string is provided,
   * it is treated as though it were an Icon with the string as url.
   */
  @Input()
  set icon(value: string | H.map.Icon) {
    this.proxy.then(marker => {
      if (typeof value === 'string') {
        value = new H.map.Icon(value, {
          size: { w: 20, h: 20 },
          crossOrigin: false
        });
      }
      marker.setIcon(value);
    });
  }

  /**
   * The marker's opacity between 0.0 and 1.0.
   */
  @Input()
  set opacity(value: number) {
    // this.proxy.then(marker => marker.setOpacity(value));
  }

  /**
   * Rollover text
   */
  @Input()
  set title(value: string) {
    // this.proxy.then(marker => marker.setTitle(value));
  }

  /**
   * If true, the marker is visible
   */
  @Input()
  set visible(mode: boolean) {
    this.proxy.then(marker => marker.setVisibility(mode));
  }

  /**
   * Set marker zIndex for displayed on the map
   */
  @Input()
  set zIndex(value: number) {
    this.proxy.then(marker => marker.setZIndex(value));
  }

  // @Input()
  // set animation(value: google.maps.Animation) {
  //     //this.proxy.then(marker => marker.setAnimation(<google.maps.Animation>value));
  // }

  @Input('delay')
  set setDelay(value: number) {
    this.delay = value;
  }

  protected mapComponent: MapComponent;

  private _clickable = true;

  constructor(private _mapsManager: HereMapsManager) {
    super();
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
    this.proxy.then((mapObject: H.map.Marker) =>
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

  private bindEvents(marker: H.map.Marker) {
    marker.addEventListener('tap', e => {
      if (this._clickable) {
        this.click.emit(e);
      }
    });
    marker.addEventListener('dbltap', e => {
      if (this._clickable) {
        this.dblclick.emit(e);
      }
    });
    // marker.addEventListener('position_changed', e => this.position_changed.emit(e));
    // marker.addEventListener('title_changed', e => this.title_changed.emit(e));
    // marker.addEventListener('icon_changed', e => this.icon_changed.emit(e));
    marker.addEventListener('visibilitychange', e =>
      this.visible_changed.emit(e)
    );
  }
}
