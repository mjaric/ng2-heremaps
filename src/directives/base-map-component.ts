 /**
  * Base class used to implement map extensions, e.g. markers, directions ...
  */
export abstract class BaseMapComponent<
  T extends H.map.Object | H.ui.base.Element
> {
  /**
   * promise to your internal heremap object
   */
  protected proxy: Promise<T>;
  /**
   * resolve callback that will be fired when heremap object become available
   */
  protected proxyResolver: (mapObject: T) => void;

  protected delay: number;

  constructor() {
    this.proxy = new Promise(resolve => (this.proxyResolver = resolve));
  }

  /**
   * Override this method to notify when map become available to component/directive.
   */
  public hasMapComponent(): boolean {
    return false;
  }

  /**
   * Override this method to resolve your internal heremap objects
   * @param component instance of map component
   * @param map instance of heremap
   * @param ui instance of ui overlay that is instanciated during map initialization
   */
  public setMapComponent(component: any, map: H.Map, ui: H.ui.UI): void {
    // Placeholder for fixing circular dependency, if not extended is noop.
  }
}
