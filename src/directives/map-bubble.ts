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

/**
 * Renders buble on map. Please note that directive must be placed inside
 * map component, otherwise it will never be rendered.
 */
@Directive({
  selector: 'map-bubble',
  providers: [
    {
      provide: BaseMapComponent,
      useExisting: forwardRef(() => MapBubbleDirective)
    }
  ]
})
export class MapBubbleDirective extends BaseMapComponent<H.ui.InfoBubble> {
  protected mapComponent: MapComponent;
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
   * This event is fired when the state of the bubble changes.
   */
  @Output()
  stateChange: EventEmitter<any> = new EventEmitter<any>();

  /*
     * Inputs options
     * **********************************************************
     */
  /**
   * Bubble position
   */
  @Input()
  set position(point: GeoPoint) {
    const position = toLatLng(point);
    this._mapsManager
      .createBubble({ position })
      .then((bubble: H.ui.InfoBubble) => {
        this.bindEvents(bubble);
        this.proxyResolver(bubble);
      });

    this.proxy.then(bubble => {
      bubble.setPosition(toLatLng(point));
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
   * If true, the bubble is closed.
   * Default value is false and nothing is done if not true.
   */
  @Input()
  set closed(mode: boolean) {
    if (mode) {
      this.proxy.then(bubble => bubble.close());
    }
  }

  /**
   * Rollover text
   */
  @Input()
  set contentElement(value: HTMLElement) {
    this.proxy.then(bubble => bubble.setContent(value));
  }

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
    this.proxy.then((mapObject: H.ui.InfoBubble) =>
      setTimeout(() => {
        if (mapObject instanceof H.ui.InfoBubble) {
          ui.addBubble(mapObject);

          mapObject.addEventListener('statechange', ev => this.stateChange.emit(ev));
        }
      }, this.delay || 0)
    );
  }

  /*
     * Internal logic
     * **********************************************************
     */

  private bindEvents(marker: H.ui.InfoBubble) {
    marker.addEventListener('tap', e => {
      if (this._clickable) {
        this.click.emit(e);
      }
    });
  }
}
