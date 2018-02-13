import {LazyMapsApiLoader} from './loaders/lazy-maps-api-loader';

/**
 * Factory function which builds handler for application initialization
 * @param loader instance of loader, should be passed as dependency
 * @returns {()=>Promise<any>} function is executed by angular application initializer
 * @constructor
 */
export function MapsApiLoaderFactory(loader: LazyMapsApiLoader) {
    return goLoad;

    function goLoad(): Promise<any> {
        return loader.load();
    }
}