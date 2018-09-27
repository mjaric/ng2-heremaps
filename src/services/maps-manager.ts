/**
 * Created by mjaric on 9/28/16.
 */
import { Injectable } from '@angular/core';
import { LazyMapsApiLoader } from '../loaders/lazy-maps-api-loader';
import { MarkerOptions } from '../interface/marker-options';
import { LatLng, LatLon, GeoPoint } from '../interface/lat-lng';
import { IControlOptions } from '../interface/control-options.interface';
import { BubbleOptions } from '../interface/bubble-options';

const DefaultCoords: { latitude: number; longitude: number } = {
  latitude: 40.73061,
  longitude: -73.935242
};

function noop() {
  // noop
}

/**
 * Service responsible to execute arbitrary functions in specific google map context
 */
@Injectable()
export class HereMapsManager {
  private _maps: Map<string, H.Map> = new Map<string, H.Map>();
  private _browserLocationPromise: Promise<{
    latitude: number;
    longitude: number;
  }>;

  private _defaultLayers: any;

  constructor(private loader: LazyMapsApiLoader) {
    // check browser location
    this.getBrowserLocation().then(noop);
    // preload map immediately
    this.loader.load().then(noop);
  }

  public onApiLoad(): Promise<H.service.Platform> {
    return this.loader.platformReady;
  }

  public createMarker(options: MarkerOptions): Promise<H.map.Marker> {
    return this.loader.platformReady.then(() => {
      return new H.map.Marker(options.position);
    });
  }

  public createBubble(options: BubbleOptions): Promise<H.ui.InfoBubble> {
    return this.loader.platformReady.then(() => {
      return new H.ui.InfoBubble(options.position);
    });
  }

  getDirections(
    origin: GeoPoint,
    destination: GeoPoint,
    intermediatePoints: GeoPoint[] = []
  ): Promise<H.service.ServiceResult> {
    return this.loader.platformReady.then(platform => {
      const router = platform.getRoutingService();
      return new Promise<H.service.ServiceResult>((resolve, reject) => {
        const params: H.service.ServiceParameters = {
          mode: 'balanced;truck',
          representation: 'navigation'
        };

        const waypoints = [origin, ...intermediatePoints, destination];
        waypoints.forEach(
          (waypoint, index) =>
            (params[`waypoint${index}`] = this.generateWaypointParam(
              waypoint,
              index === 0 || index === waypoints.length - 1
            ))
        );

        router.calculateRoute(
          params,
          (result: H.service.ServiceResult) => resolve(result),
          (error: Error) => {
            console.error({
              message: 'fail to get directions',
              error
            });
            reject(error);
          }
        );
      });
    });
  }

  public createMap(
    el: HTMLElement,
    options?: H.Map.Options,
    controls?: IControlOptions
  ): Promise<{ map: H.Map; ui: H.ui.UI; platform: H.service.Platform }> {
    return this.loader.platformReady.then(platform => {
      const defaultLayers =
        this._defaultLayers || platform.createDefaultLayers();
      this._defaultLayers = defaultLayers;
      const map = new H.Map(el, defaultLayers.normal.map, options);
      const ui = H.ui.UI.createDefault(map, defaultLayers, 'en-US');
      ui.setUnitSystem(H.ui.UnitSystem.IMPERIAL);

      const mapEvents = new H.mapevents.MapEvents(map);
      const behavior = new H.mapevents.Behavior(mapEvents);

      if (controls) {
        if (!controls.mapTypeControl) {
          ui.removeControl('mapsettings');
        }
        if (!controls.zoomControl) {
          ui.removeControl('zoom');
        }
        if (!controls.scaleControl) {
          ui.removeControl('scalebar');
        }
        if (!controls.streetViewControl && (H as any).PanoramaView) {
          ui.removeControl('panorama');
        }
        if (!controls.scrollwheel) {
          behavior.disable(H.mapevents.Behavior.WHEELZOOM);
        }
        if (!controls.enableDoubleClickZoom) {
          behavior.disable(H.mapevents.Behavior.DBLTAPZOOM);
        }
        if (!controls.draggable) {
          behavior.disable(H.mapevents.Behavior.DRAGGING);
        }
      }

      return { map, ui, platform };
    });
  }

  public getMap(name: string): Promise<H.Map> {
    return this.loader.load().then(() => this._maps.get(name));
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

  public getBrowserLocation(): Promise<
    Coordinates | { longitude: number; latitude: number }
  > {
    if (this._browserLocationPromise) {
      return this._browserLocationPromise;
    }

    return (this._browserLocationPromise = new Promise<{
      latitude: number;
      longitude: number;
    }>(resolve => {
      if (location.protocol === 'https' && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (success: { coords: Coordinates; timestamp: number }) => {
            resolve(success.coords);
          },
          error => {
            console.error(error);
            if (error.code !== 1) {
              console.warn(
                `Permission is accepted but error encounter with message: ${
                  error.message
                }`
              );
            }
            // if user didn't answer return default
            resolve(DefaultCoords);
          }
        );
      } else {
        // if browser do not support location API return default (NYC)
        resolve(DefaultCoords);
      }
    }));
  }

  public calculateMapBounds(
    points: Array<LatLng | Coordinates | H.map.AbstractMarker> = []
  ): Promise<H.geo.Rect> {
    return this.loader.platformReady.then(_ => {
      const bounds = new H.map.Group().getBounds();
      if (points && points.length > 1) {
        points.forEach(m => {
          if (m instanceof H.map.AbstractMarker) {
            bounds.mergePoint(m.getPosition());
          } else {
            bounds.mergePoint({
              lat:
                (m as Coordinates).latitude !== void 0
                  ? (m as Coordinates).latitude
                  : (m as LatLng).lat,
              lng:
                (m as Coordinates).longitude !== void 0
                  ? (m as Coordinates).longitude
                  : (m as LatLng).lng
            });
          }
        });
        return Promise.resolve(bounds);
      }
      return Promise.resolve(bounds);
    });
  }

  private generateWaypointParam(coordinates: GeoPoint, end = false): string {
    const lat =
      (coordinates as LatLng).lat || (coordinates as Coordinates).latitude || 0;
    const lng =
      (coordinates as LatLng).lng ||
      (coordinates as Coordinates).longitude ||
      (coordinates as LatLon).lon ||
      0;
    return `geo!${end ? 'stopOver' : 'passThrough'}!${lat},${lng}`;
  }
}
