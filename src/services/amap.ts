import AMapLoader from '@amap/amap-jsapi-loader'
import type {} from '@amap/amap-jsapi-types'

type LocationResult = { position?: AMap.LngLat; accuracy?: number; location_type?: string }
export interface Place {
  id: string
  name: string
  address: string
  location: AMap.LngLat
}
interface SearchResult { poiList?: { pois?: Place[] } }
interface PlaceSearch {
  search: (keyword: string, callback: (status: string, result: SearchResult) => void) => void
  searchNearBy: (keyword: string, center: AMap.LngLat, radius: number, callback: (status: string, result: SearchResult) => void) => void
}
export type MapSDK = typeof AMap & {
  Scale: new () => AMap.Control
  ToolBar: new () => AMap.Control
  PlaceSearch: new (options: { pageSize: number; type?: string; extensions?: string }) => PlaceSearch
  Geolocation: new (options: Record<string, unknown>) => {
    getCurrentPosition: (callback: (status: string, result: LocationResult) => void) => void
  }
}

declare global {
  interface Window { _AMapSecurityConfig?: { serviceHost: string } }
}

export class MapSetupRequired extends Error {}
let loading: Promise<MapSDK> | undefined
export function loadMap(): Promise<MapSDK> {
  if (!loading) loading = (async () => {
    const response = await fetch('/api/maps/config', { cache: 'no-store', signal: AbortSignal.timeout(10000) })
    if (!response.ok) throw new Error('地图配置服务暂不可用，请稍后重试。')
    const config = await response.json() as { configured?: boolean; key?: string }
    if (!config.configured || !config.key) throw new MapSetupRequired('地图尚未完成配置')
    window._AMapSecurityConfig = { serviceHost: `${window.location.origin}/_AMapService` }
    return await AMapLoader.load({ key: config.key, version: '2.0', plugins: ['AMap.Scale', 'AMap.ToolBar', 'AMap.PlaceSearch', 'AMap.Geolocation'] }) as MapSDK
  })().catch(error => { loading = undefined; throw error })
  return loading
}

export function normalizePlaces(result: SearchResult): Place[] {
  return (result.poiList?.pois ?? []).filter(place => place && typeof place.id === 'string' && typeof place.name === 'string' && place.location)
    .map(place => ({ ...place, address: typeof place.address === 'string' ? place.address : '' }))
}
