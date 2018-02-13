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
import {MapsApiLoaderFactory} from './src/maps-api-loader-factory';

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

@NgModule({
    declarations: [
        MapComponent,
        MapDirectionsDirective,
        MapMakerDirective,
        MapPolylineDirective
    ],
    exports: [
        MapComponent,
        MapDirectionsDirective,
        MapMakerDirective,
        MapPolylineDirective
    ]
})
export class HereMapsModule {
    /**
     * Used to register in top level or shared module in your application. Loader Options are mandatory.
     * {@expample
     *  import {NgModule} from '@angular/core';
     *
     *  @NgModule({
     *      declarations: [...],
     *      imports: [
     *          ...
     *          HereMapsModule.forRoot(<LoaderOptions>{
     *              apiKey: "your heremaps API key
     *              libraries: ["places", "geometry"]
     *          }),
     *          ...
     *     ],
     *     // optional, you can import module like below if your module depends only on component and directives
     *     exports: [
     *      HereMapsModule
     *     ]
     *  })
     *  export class MySharedModule { }
     * }
     *
     * @param loaderOptions
     * @returns {ModuleWithProviders}
     */
    static forRoot(loaderOptions: LoaderOptions): ModuleWithProviders {
        return {
            ngModule: HereMapsModule,
            providers: [
                {
                    provide: LAZY_LOADER_OPTIONS,
                    useValue: loaderOptions
                },
                LazyMapsApiLoader,
                {
                    provide: APP_INITIALIZER,
                    useFactory: MapsApiLoaderFactory,
                    deps: [LazyMapsApiLoader],
                    multi: true
                },
                {provide: MapsManager, useClass: MapsManager}
            ]
        };
    }
}
