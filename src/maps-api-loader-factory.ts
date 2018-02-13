import {LazyMapsApiLoader} from './loaders/lazy-maps-api-loader';

/**
 * Factory function which builds handler for application initialization
 * @param {LazyMapsApiLoader} loader
 * @returns {Promise<any>}
 */
export function mapsLoaderFactory(loader: LazyMapsApiLoader) {
    return function (): Promise<any> {
        return loader.load();
    };
}
