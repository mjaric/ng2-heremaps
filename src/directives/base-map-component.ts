import {IOptionalSetMapMethod} from './optional-set-map-method.interface';
import {MapComponent} from './map';
/**
 * Created by mjaric on 10/3/16.
 */



export abstract class BaseMapComponent<T extends H.map.Object> {

    protected proxy: Promise<T>;
    protected proxyResolver: (mapObject: T) => void;

    protected mapComponent: MapComponent;
    protected delay: number;

    constructor() {
        this.proxy = new Promise(resolve => this.proxyResolver = resolve);
    }

    public hasMapComponent(): boolean {
        return !!this.mapComponent;
    }

    public setMapComponent(component: MapComponent, map: H.Map): void {
        this.mapComponent = component;
        this.proxy
            .then((mapObject: T) =>
                setTimeout(() => map.addObject(mapObject), this.delay || 0));
    }
}
