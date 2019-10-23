/**
 * Created by mjaric on 9/28/16.
 */
import {
  Directive,
  EventEmitter,
  forwardRef,
  Input,
  OnDestroy,
  Output
} from '@angular/core';
import { GeoPoint } from '../interface/lat-lng';
import { HereMapsManager } from '../services/maps-manager';
import { toLatLng } from '../utils/position';
import { BaseMapComponent } from './base-map-component';
import { MapComponent } from './map';

/**
 * Holds instance of the heremap marker. Please note that directive must be placed inside
 * map component, otherwise it will never be rendered.
 */
@Directive({
  selector: 'map-marker',
  providers: [
    {
      provide: BaseMapComponent,
      useExisting: forwardRef(() => MapMakerDirective)
    }
  ]
})
export class MapMakerDirective extends BaseMapComponent<H.map.Marker>
  implements OnDestroy {
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
   * This event is fired when the marker is dragged.
   */
  @Output()
  drag: EventEmitter<any> = new EventEmitter<any>();

  /**
   * This event is fired when the marker is done being dragged.
   */
  @Output()
  dragEnd: EventEmitter<any> = new EventEmitter<any>();

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
   * If true, the marker receives mouse and touch events.
   * Default value is true.
   */
  @Input()
  set draggable(mode: boolean) {
    this._draggable = mode;
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
  private marker: H.map.Marker;

  private _clickable = true;
  private _draggable = false;

  constructor(private _mapsManager: HereMapsManager) {
    super();
  }

  ngOnDestroy() {
    this.proxy.then(marker => {
      marker.dispose();
      this.mapComponent.getMap().then(map => {
        if (map.getObjects().indexOf(marker) >= 0) {
          map.removeObject(marker);
        }
      });
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
    this.proxy.then((marker: H.map.Marker) => {
      this.marker = marker;
      this.marker.draggable = true;

      setTimeout(() => {
        if (marker instanceof H.map.Object) {
          map.addObject(marker);
          if (this._draggable) {
            this.addDraggable(marker);
          } else {
            this.removeDraggable(marker);
          }
        }
      }, this.delay || 0);
    });
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

  private async addDraggable(marker: H.map.Marker) {
    const map = await this.getMap();

    // disable the default draggability of the underlying map
    // when starting to drag a marker object:
    map.addEventListener(
      'dragstart',
      this.dragstartAddDraggable.bind(this),
      false
    );

    // re-enable the default draggability of the underlying map
    // when dragging has completed
    map.addEventListener('dragend', this.dragendAddDraggable.bind(this), false);

    // Listen to the drag event and move the position of the marker
    // as necessary
    map.addEventListener('drag', this.dragAddDraggable.bind(this), false);
  }

  private async removeDraggable(marker: H.map.Marker) {
    const map = await this.getMap();
  }

  private getMap(): Promise<any> {
    return this.mapComponent.getMap();
  }

  // Event handlers

  // disable the default draggability of the underlying map
  // when starting to drag a marker object:
  private dragstartAddDraggable(ev: H.mapevents.Event) {
    const target = ev.target;
    if (target instanceof H.map.Marker) {
      this.mapComponent.behavior.then(behavior => behavior.disable());
    }
  }

  // re-enable the default draggability of the underlying map
  // when dragging has completed
  private dragendAddDraggable(ev: H.mapevents.Event) {
    const target = ev.target;
    if (target instanceof H.map.Marker) {
      this.mapComponent.behavior.then(behavior => behavior.enable());
      if (this.dragEnd && target === this.marker) {
        this.dragEnd.emit(ev);
      }
    }
  }

  // Listen to the drag event and move the position of the marker
  // as necessary
  private dragAddDraggable(ev: H.mapevents.Event) {
    const target = ev.target,
      pointer = ev.currentPointer;
    if (target instanceof H.map.Marker && target === this.marker) {
      this.getMap().then(map => {
        target.setPosition(
          map.screenToGeo(
            (pointer as any).viewportX,
            (pointer as any).viewportY
          )
        );

        if (this.drag) {
          this.drag.emit(ev);
        }
      });
    }
  }
}
