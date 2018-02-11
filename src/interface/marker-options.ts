import {LatLng} from './lat-lng';

export type MarkerOptions = {
    position?: LatLng;
    title?: string;
    visible?: boolean;
    zIndex?: number;
    icon?: any;
    label?: any
}
