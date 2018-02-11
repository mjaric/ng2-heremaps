export interface LoaderOptions {
    /**
     * JavaScript Api key token
     */
    apiKey: string;
    /**
     * JavaScript App ID token
     */
    appId: string;

    /**
     * Maps API version.
     */
    apiVersion?: string | number;

    /**
     * Protocol used for the `<script>` tag.
     */
    protocol?: string;

    /**
     * Defines which Maps libraries should get loaded.
     */
    libraries: string[];

    /**
     * The default bias for the map behavior is US.
     * If you wish to alter your application to serve different map tiles or bias the
     * application, you can overwrite the default behavior (US) by defining a `region`.
     * See https://developers.google.com/maps/documentation/javascript/basics#Region
     */
    region?: string;

    /**
     * The Google Maps API uses the browser's preferred language when displaying
     * textual information. If you wish to overwrite this behavior and force the API
     * to use a given language, you can use this setting.
     * See https://developers.google.com/maps/documentation/javascript/basics#Language
     */
    language?: string;
}
