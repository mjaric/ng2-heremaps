/**
 * Created by mjaric on 9/28/16.
 */
import {Injectable, Inject, InjectionToken} from '@angular/core';
import {BaseMapsApiLoader, LAZY_LOADER_OPTIONS} from './base-maps-api-loader';
import {LoaderOptions} from './loader-options.interface';
import {ScriptLoaderProtocol} from './script-loader-protocol';


@Injectable()
export class LazyMapsApiLoader extends BaseMapsApiLoader {

    public readonly platformReady =
        new Promise<H.service.Platform>((resolve, reject) => {
            this._rejectPlatform = reject;
            this._resolvePlatform = resolve;
        });

    private _initialized = false;
    private _options: LoaderOptions;
    private _resolvePlatform: (platform: H.service.Platform) => void;
    private _rejectPlatform: (error: any) => void;

    private readonly _modules = new Map([
        ['core', ['js']],
        ['service', ['js']],
        ['mapevents', ['js']],
        ['ui', ['js', 'css']],
        ['clustering', ['js']],
        ['data', ['js']],
        ['places', ['js']],
        ['pano', ['js']]
    ]);

    constructor(@Inject(LAZY_LOADER_OPTIONS) options: LoaderOptions) {
        super();
        this._options = Object.assign(
            {},
            {
                apiKey: '',
                appId: '',
                apiVersion: '3.0',
                protocol: ScriptLoaderProtocol.AUTO,
                libraries: []
            },
            options
        );
        let libs = this
            ._options
            .libraries
            .filter(l => l !== 'core');
        this._options.libraries = ['core', ...libs];
    }

    load(): Promise<any> {
        if (this._initialized === false) {
            this
                .loadModules()
                .then((_) => {
                    let platform = new H
                        .service
                        .Platform({
                            app_id: this._options.appId,
                            app_code: this._options.apiKey,
                            useHTTPS: document.location.protocol === 'https:'
                        });
                    this._resolvePlatform(platform);
                })
                .catch((error) => {
                    this._rejectPlatform(error);
                });
        }
        return this.platformReady;
    }

    private loadModules(): Promise<any> {
        let promises = this
            ._options
            .libraries
            .reduce(this.distinct, [])
            .map(this.loadModule.bind(this));
        return Promise.all(promises);
    }

    private loadModule(moduleName: string): Promise<any> {
        let mod = this._modules.get(moduleName);
        if (mod === void(0)) {
            let error = new Error(`Unknown module ${moduleName}`);
            return Promise.reject(error)
        }
        if (mod.indexOf('css') > -1) {
            document.body.appendChild(this.createStylesheet(moduleName));
        }
        return new Promise<any>((resolve, reject) => {
            let el = this.createScript(moduleName, resolve, reject);
            document.body.appendChild(el);
        })
    }

    private createStylesheet(moduleName: string): HTMLLinkElement {
        let element = document.createElement('link');

        element.rel = 'stylesheet';
        element.href = this.createModuleUrl(moduleName, 'css');
        if (console !== void(0)) {
            element.onerror = console.error.bind(console);
        }

        return element;
    }

    private createScript(moduleName: string, onLoad: (event: Event) => void, onError: (error: Event) => void): HTMLScriptElement {
        let script = document.createElement('script');

        script.type = 'text/javascript';
        script.src = this.createModuleUrl(moduleName, 'js');
        script.async = true;
        script.defer = true;
        script.onerror = onError;
        script.onload = onLoad;

        return script;
    }

    private createModuleUrl(module: string, ext = 'js'): string {
        let protocol = document.location.protocol,
            version = this._options.apiVersion;
        return `${protocol}//js.cit.api.here.com/v3/${version}/mapsjs-{module}.${ext}`;
    }

    private distinct(acc: string[], next: string) {
        if (acc.indexOf(next) > -1) {
            return acc;
        }
        return [...acc, next];
    }

}
