import {HereMapsManager} from './maps-manager';


export class MapUIService {
    public readonly ui: Promise<H.ui.UI>;
    public setUi: (ui: H.ui.UI) => void;

    constructor(private mapManager: HereMapsManager) {
        this.ui = new Promise<H.ui.UI>((resolve) => {
            this.setUi = resolve;
        });
    }


}
