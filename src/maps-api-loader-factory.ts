import {LazyMapsApiLoader} from './loaders/lazy-maps-api-loader';

/**
 * Factory function which builds handler for application initialization
 * @param {LazyMapsApiLoader} loader
 * @returns {Promise<any>}
 */
export function mapsLoaderFactory(loader: LazyMapsApiLoader): Promise<any> {
    return new Promise<any>((resolve, reject) => {
        loader
            .load()
            .then(r => {
                resolve(r);
            })
            .catch((e) => {
                reject(e);
            })
    });
}
