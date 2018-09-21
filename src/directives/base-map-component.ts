/**
 * Created by mjaric on 10/3/16.
 */


export abstract class BaseMapComponent<T extends H.map.Object | H.ui.base.Element> {

    protected proxy: Promise<T>;
    protected proxyResolver: (mapObject: T) => void;

    protected delay: number;

    constructor() {
        this.proxy = new Promise(resolve => this.proxyResolver = resolve);
    }

    public hasMapComponent(): boolean {
        return false;
    }

    public setMapComponent(component: any, map: H.Map): void { }

}
