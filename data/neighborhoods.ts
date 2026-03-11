/** Popular Seattle neighborhoods with their bounds for quick navigation. */
export interface Neighborhood {
  name: string;
  /** [west, south, east, north] */
  bounds: [number, number, number, number];
}

export const NEIGHBORHOODS: Neighborhood[] = [
  { name: 'Capitol Hill', bounds: [-122.328, 47.613, -122.305, 47.632] },
  { name: 'Ballard', bounds: [-122.408, 47.66, -122.37, 47.694] },
  { name: 'Fremont', bounds: [-122.365, 47.643, -122.34, 47.663] },
  { name: 'Queen Anne', bounds: [-122.373, 47.62, -122.34, 47.65] },
  { name: 'Wallingford', bounds: [-122.345, 47.648, -122.32, 47.665] },
  { name: 'University District', bounds: [-122.324, 47.65, -122.29, 47.67] },
  { name: 'South Lake Union', bounds: [-122.348, 47.618, -122.328, 47.635] },
  { name: 'Downtown', bounds: [-122.35, 47.595, -122.325, 47.618] },
  { name: 'West Seattle', bounds: [-122.41, 47.53, -122.35, 47.58] },
  { name: 'Beacon Hill', bounds: [-122.32, 47.555, -122.295, 47.585] },
  { name: 'Columbia City', bounds: [-122.295, 47.555, -122.275, 47.575] },
  { name: 'Greenwood', bounds: [-122.365, 47.69, -122.345, 47.71] },
];
