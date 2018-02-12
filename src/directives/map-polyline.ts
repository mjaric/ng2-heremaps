/**
 * Created by Bosko-Vibe on 7.11.2016.
 */
import {Directive, Input, OnDestroy, forwardRef} from '@angular/core';
import {BaseMapComponent} from './base-map-component';
import {MapsManager} from '../services/maps-manager';
import {PolylineOptions} from '../interface/polyline-options';


@Directive({
    selector: 'map-polyline',
    providers: [{provide: BaseMapComponent, useExisting: forwardRef(() => MapPolylineDirective)}]
})
export class MapPolylineDirective extends BaseMapComponent<H.map.Polyline> implements OnDestroy {

    private polyline: H.map.Polyline;
    private _fillColor: string;
    private _strokeColor: string;
    private _lineWidth = 4;

    get fillColor(): string {
        return this._fillColor;
    }

    @Input()
    set fillColor(color: string) {
        if (this._fillColor !== color) {
            this._fillColor = color;
            this.proxy.then(p => {
                let style = Object.assign({}, p.getStyle());
                style.fillColor = color;
                p.setStyle(style);
            });
        }
    }

    get strokeColor(): string {
        return this._strokeColor;
    }

    @Input()
    set strokeColor(color: string) {
        if (this._strokeColor !== color) {
            this._strokeColor = color;
            this.proxy.then(p => {
                let style = Object.assign({}, p.getStyle());
                style.strokeColor = color;
                p.setStyle(style);
            });
        }
    }

    get lineWidth(): number {
        return this._lineWidth;
    }

    @Input()
    set lineWidth(lineWidth: number) {
        if (this._lineWidth !== lineWidth) {
            this._lineWidth = lineWidth;
            this.proxy.then(p => {
                let style = Object.assign({}, p.getStyle());
                style.lineWidth = lineWidth;
                p.setStyle(style);
            });
        }
    }

    @Input()
    set options(opts: PolylineOptions) {
        this.proxy.then((polyline: H.map.Polyline) => {
            let style = {
                    strokeColor: opts.strokeColor || this.strokeColor,
                    fillColor: opts.fillColor || this.fillColor,
                    lineWidth: opts.lineWidth || this.lineWidth
                },
                strip = new H.geo.Strip();

            (opts.path || [])
                .forEach(point => {
                    strip.pushPoint({
                        lat: point.lat,
                        lng: point.lng
                    });
                });
            polyline.setStrip(strip);
            polyline.setStyle(style);
        });
    }

    constructor(mapsManager: MapsManager) {
        super();
        mapsManager
            .onApiLoad()
            .then(() => {
                let strip = new H.geo.Strip();
                this.polyline = new H.map.Polyline(strip);
                this.proxyResolver(this.polyline);
            });
    }

    public ngOnDestroy(): void {
        this.proxy
            .then(p => {
                this.mapComponent
                    .getMap()
                    .then((map) => {
                        map.removeObject(this.polyline);
                        this.polyline.dispose();
                        delete this.polyline;
                    });
            });
    }

    private createFrom<T>(source: any, keys: string[]): T {
        return Object
            .keys(source)
            .reduce((acc: T, next: string) => {
                if (source[next] !== undefined) {
                    acc[next] = source[next];
                }
                return acc;
            }, <T>{});
    }
}
