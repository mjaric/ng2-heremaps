import { InjectionToken } from '@angular/core';
import { LoaderOptions } from './loader-options.interface';


export const LAZY_LOADER_OPTIONS = new InjectionToken<LoaderOptions>('_heremaps.LazyMapLoaderApiOptions');

/**
 * Created by mjaric on 9/28/16.
 */

export abstract class BaseMapsApiLoader {
    abstract platformReady: Promise<H.service.Platform>;
    abstract load(): Promise<void>;
}
