import {LoaderOptions} from './src/loaders/loader-options.interface';
import {
    LazyMapsApiLoader
} from './src/loaders/lazy-maps-api-loader';
import {APP_INITIALIZER, NgModule, ModuleWithProviders} from '@angular/core';
import {MapsManager} from './src/services/maps-manager';
import {BaseMapsApiLoader, LAZY_LOADER_OPTIONS} from './src/loaders/base-maps-api-loader';
import {NoopMapsApiLoader} from './src/loaders/noop-maps-api-loader';
import {MapComponent} from './src/directives/map';
import {MapDirectionsDirective} from './src/directives/map-directions';
import {MapMakerDirective} from './src/directives/map-marker';
import {MapPolylineDirective} from './src/directives/map-polyline';
import {mapsLoaderFactory} from './src/maps-api-loader-factory';

export {LoaderOptions} from './src/loaders/loader-options.interface';

export {
    BaseMapComponent,
    MapComponent,
    MapDirectionsDirective,
    MapMakerDirective,
    MapPolylineDirective,
    IOptionalSetMapMethod
} from './src/directives';
export {
    BaseMapsApiLoader,
    LAZY_LOADER_OPTIONS,
    LazyMapsApiLoader,
    MapsManager,
    NoopMapsApiLoader,
    Animation,
    IAnimation,
    ZoomLevel,
    IZoomLevel,
    LatLng,
    GeoPoint,
    MarkerOptions,
    PolylineOptions,
    MapUIService
} from './src/services';

export {HereMapsModule} from './src/here-maps.module';
