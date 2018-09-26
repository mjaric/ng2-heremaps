import { LatLng } from './lat-lng';

export interface PolylineOptions {
  strokeColor?: string;
  fillColor?: string;
  lineWidth?: number;
  path: LatLng[];
}
