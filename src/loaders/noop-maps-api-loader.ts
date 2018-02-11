/**
 * Created by mjaric on 9/28/16.
 */
import {BaseMapsApiLoader} from './base-maps-api-loader';

export class NoopMapsApiLoader implements BaseMapsApiLoader {
    public platformReady: Promise<H.service.Platform> =
        new Promise<H.service.Platform>((resolve, reject) => {
            this._rejectPlatform = reject;
            this._resolvePlatform = resolve;
        });

    private _resolvePlatform: (platform: H.service.Platform) => void;
    private _rejectPlatform: (error: any) => void;

    public load(): Promise<void> {
        if (!(H && H.service && H.service.Platform)) {
            return Promise.reject(new Error('Here Maps API not loaded on page. Make sure window.H.service.Platform is available!'));
        } else {
            return Promise.resolve();
        }
    }
}
