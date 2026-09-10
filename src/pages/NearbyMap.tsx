import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { loadMap, MapSetupRequired, normalizePlaces, type MapSDK, type Place } from '../services/amap'

const CATEGORIES = [
  { label: '全部餐饮', type: '餐饮服务', icon: 'food' },
  { label: '咖啡茶饮', type: '咖啡厅|茶艺馆|冷饮店', icon: 'cup' },
  { label: '公园散步', type: '公园', icon: 'tree' },
  { label: '运动场馆', type: '体育休闲服务', icon: 'sport' },
] as const
function MapIcon({ name }: { name: string }) {
  const paths: Record<string, string> = {
    pin: 'M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z M15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0',
    search: 'M21 21l-5-5 M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0',
    map: 'm3 5 6-3 6 3 6-3v17l-6 3-6-3-6 3Z M9 2v17 M15 5v17',
    user: 'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0 M4 22v-3a8 8 0 0 1 16 0v3',
    food: 'M4 2v7h6V2 M7 2v20 M18 2c-4 4-4 10 0 10h2V2 M20 12v10',
    cup: 'M3 5h14v10a6 6 0 0 1-12 0V5 M17 7h2a3 3 0 1 1 0 6h-2 M3 22h16',
    tree: 'm12 2-6 8h3l-5 7h16l-5-7h3Z M12 17v5',
    sport: 'm5 3-2 2 16 16 2-2 M3 9l6-6 M15 21l6-6 M8 16l8-8',
    locate: 'M12 1v4 M12 19v4 M1 12h4 M19 12h4 M20 12a8 8 0 1 1-16 0 8 8 0 0 1 16 0 M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0',
  }
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name] || paths.pin} /></svg>
}

export function NearbyMap() {
  const container = useRef<HTMLDivElement>(null)
  const map = useRef<AMap.Map | null>(null)
  const sdk = useRef<MapSDK | null>(null)
  const markers = useRef<AMap.Marker[]>([])
  const request = useRef(0)
  const searchTimer = useRef<number | undefined>(undefined)
  const [category, setCategory] = useState(0)
  const [resultLabel, setResultLabel] = useState('等待搜索')
  const [selected, setSelected] = useState('')
  const [attempt, setAttempt] = useState(0)
  const [state, setState] = useState<'loading' | 'ready' | 'setup' | 'error'>('loading')
  const [message, setMessage] = useState('正在连接高德地图…')
  const [keyword, setKeyword] = useState('')
  const [busy, setBusy] = useState(false)
  const [places, setPlaces] = useState<Place[]>([])
  const [updated, setUpdated] = useState('')
  const [area, setArea] = useState('初始视野为全国地图，可搜索城市、地址或点击定位。')

  useEffect(() => {
    let cancelled = false
    let instance: AMap.Map | null = null
    const timeout = window.setTimeout(() => {
      if (!cancelled) { setState('error'); setMessage('地图加载超时，请检查网络与高德配置后重试。') }
    }, 20000)
    loadMap().then(AMap => {
      if (cancelled || !container.current) return
      sdk.current = AMap
      instance = new AMap.Map(container.current, { zoom: 4, center: [104.1, 35.8], viewMode: '2D' })
      map.current = instance
      instance.addControl(new AMap.Scale())
      instance.on('complete', () => {
        if (!cancelled) { window.clearTimeout(timeout); setState('ready'); setMessage('地图已连接高德，拖动或缩放可查看其他区域。') }
      })
    }).catch(error => {
      if (cancelled) return
      window.clearTimeout(timeout)
      setState(error instanceof MapSetupRequired ? 'setup' : 'error')
      setMessage(error instanceof MapSetupRequired ? '高德地图尚未配置，暂时无法加载真实地图与地点。' : '高德地图连接失败，请检查网络、Key 和域名配置后重试。')
    })
    return () => { cancelled = true; request.current++; window.clearTimeout(timeout); window.clearTimeout(searchTimer.current); instance?.destroy(); map.current = null; sdk.current = null; markers.current = [] }
  }, [attempt])

  const locate = () => {
    if (!sdk.current || !map.current) return
    const id = ++request.current
    setBusy(true)
    setMessage('正在获取位置，请在浏览器中选择是否允许定位…')
    const geolocation = new sdk.current.Geolocation({ enableHighAccuracy: true, timeout: 10000, maximumAge: 0, convert: true, showMarker: false, showCircle: false, panToLocation: false })
    geolocation.getCurrentPosition((status, result) => {
      if (request.current !== id || !map.current) return
      setBusy(false)
      if (status !== 'complete' || !result.position) { setMessage('未能获取位置。可检查定位权限，或输入城市、地址搜索。'); return }
      map.current.setZoomAndCenter(15, result.position)
      setArea(`定位获取时间 ${new Date().toLocaleTimeString()}${result.accuracy ? `，精度约 ${Math.round(result.accuracy)} 米` : '，精度未知'}`)
      setMessage('已移到定位区域。点击“搜索此区域”查询周边；定位不代表持续跟踪。')
    })
  }

  const search = (nearby: boolean, nextCategory = category) => {
    if (!sdk.current || !map.current) return
    if (!nearby && !keyword.trim()) { setMessage('请输入城市、地址或地点名称。'); return }
    if (nearby && map.current.getZoom() < 12) { setMessage('请先定位、搜索具体地址，或放大地图到街区后搜索此区域。'); return }
    const id = ++request.current
    setBusy(true)
    setPlaces([])
    setSelected('')
    setUpdated('')
    map.current.remove(markers.current)
    markers.current = []
    setMessage('正在查询高德地点数据…')
    const service = new sdk.current.PlaceSearch({ pageSize: 10, ...(nearby ? { type: CATEGORIES[nextCategory].type } : {}) })
    const timeout = window.setTimeout(() => {
      if (request.current === id) { request.current++; setBusy(false); setMessage('地点查询超时，请重试。') }
    }, 15000)
    searchTimer.current = timeout
    const callback = (status: string, result: Parameters<typeof normalizePlaces>[0]) => {
      window.clearTimeout(timeout)
      if (request.current !== id || !sdk.current || !map.current) return
      setBusy(false)
      if (status !== 'complete' && status !== 'no_data') { setMessage('高德地点查询失败。请检查服务权限、调用额度与网络后重试。'); return }
      const found = normalizePlaces(result)
      setPlaces(found)
      setResultLabel(nearby ? CATEGORIES[nextCategory].label : '地点搜索')
      setUpdated(new Date().toLocaleTimeString())
      setMessage(found.length ? `查询到 ${found.length} 个${nearby ? CATEGORIES[nextCategory].label + '地点' : '地点'}，点击列表可在地图中查看。` : '当前范围未查到匹配地点，可移动地图或修改关键词后重试。')
      markers.current = found.map((place, index) => {
        const marker = new sdk.current!.Marker({ position: place.location, title: place.name, content: `<span class="explore-marker">${index + 1}</span>`, offset: new sdk.current!.Pixel(-18, -18) })
        marker.on('click', () => { setSelected(place.id); map.current?.setZoomAndCenter(16, place.location) })
        return marker
      })
      map.current.add(markers.current)
      if (found.length) map.current.setFitView(markers.current)
      setArea(nearby ? '本次结果：查询时地图中心周边 1.5 公里。移动地图后请重新查询。' : `本次搜索：${keyword.trim()}`)
    }
    if (nearby) service.searchNearBy('', map.current.getCenter(), 1500, callback)
    else service.search(keyword.trim(), callback)
  }

  return <div className="explore-page">
    <header className="explore-header">
      <Link to="/" className="explore-brand"><span className="explore-logo"><MapIcon name="pin" /></span><strong>工位地图<span>·</span></strong></Link>
      <span className="explore-tagline">好好吃饭，也出去走走</span>
      <span className="explore-online"><i />{state === 'ready' ? '高德在线' : '连接地图'}</span>
      <Link to="/me" className="explore-profile"><MapIcon name="user" /><span>我的档案</span></Link>
    </header>
    <nav className="explore-rail" aria-label="地图导航">
      <Link to="/map" className="active"><MapIcon name="map" /><span>地图</span></Link>
      <Link to="/meals"><MapIcon name="food" /><span>出餐</span></Link>
      <Link to="/exercise"><MapIcon name="sport" /><span>运动</span></Link>
      <Link to="/me"><MapIcon name="user" /><span>我的</span></Link>
      <span className="explore-rail-note">GOOD<br />AROUND<br />YOU</span>
    </nav>
    <main className="explore-canvas">
      <div ref={container} className="explore-map" aria-label="高德地图" />
      <div className="explore-search-stack">
        <form className="explore-search" onSubmit={event => { event.preventDefault(); search(false) }}>
          <span className="explore-search-label"><MapIcon name="pin" />探索</span>
          <MapIcon name="search" /><input aria-label="搜索地点" value={keyword} onChange={event => setKeyword(event.target.value)} placeholder="搜索城市、店名或地点" />
          <button disabled={state !== 'ready' || busy} aria-label="搜索地点">搜索</button>
        </form>
        <div className="explore-filters" aria-label="地点分类">{CATEGORIES.map((item, index) => <button key={item.label} className={category === index ? 'active' : ''} aria-pressed={category === index} disabled={state !== 'ready' || busy} onClick={() => { setCategory(index); search(true, index) }}><MapIcon name={item.icon} />{item.label}</button>)}</div>
      </div>
      <button className="explore-search-area" disabled={state !== 'ready' || busy} onClick={() => search(true)}><MapIcon name="search" />{busy ? '正在搜索…' : '搜索此区域'}</button>
      <aside className="explore-results" aria-label="附近地点列表">
        <div className="explore-panel-head"><p className="explore-kicker">就在你附近</p><div className="explore-title"><h1>附近有好去处<span>·</span></h1><span>1.5 km</span></div>
          <div className="explore-position"><span><i />以地图中心为范围</span><button onClick={locate} disabled={state !== 'ready' || busy}>定位我的位置</button></div>
          <p className="explore-message" role="status">{message}</p>
          {(state === 'setup' || state === 'error') && <button className="btn ghost sm" onClick={() => { setState('loading'); setMessage('正在重新连接…'); setAttempt(a => a + 1) }}>重新连接地图</button>}
        </div>
        <div className="explore-result-count"><span>{places.length} 处发现</span><span>{resultLabel}</span></div>
        <div className="explore-result-list">
          {!places.length && <div className="explore-empty"><MapIcon name="map" /><h2>{busy ? '寻找附近的好去处' : '从一个地点开始'}</h2><p>搜索城市、街道或店名，将地图移到想探索的位置，再搜索此区域。</p><span>餐厅 · 咖啡 · 公园 · 运动</span></div>}
          {places.map((place, index) => <button className={`explore-place ${selected === place.id ? 'selected' : ''}`} key={place.id} onClick={() => { setSelected(place.id); map.current?.setZoomAndCenter(16, place.location) }}><div className="explore-place-meta"><span>地点 {String(index + 1).padStart(2, '0')}</span><span>高德地图</span></div><h2>{place.name}</h2><p><MapIcon name="pin" />{place.address || '暂无详细地址'}</p><div className="explore-place-bottom"><span>{selected === place.id ? '正在地图中查看' : '在地图中查看'}</span><span>↗</span></div></button>)}
        </div>
        <footer className="explore-panel-footer"><span>✓ 高德地点数据</span><span>{updated ? `${updated} 更新` : '在线查询'}</span></footer>
      </aside>
      <div className="explore-map-actions"><div><button aria-label="放大地图" disabled={state !== 'ready'} onClick={() => map.current?.zoomIn()}>+</button><button aria-label="缩小地图" disabled={state !== 'ready'} onClick={() => map.current?.zoomOut()}>−</button></div><button aria-label="定位我的位置" disabled={state !== 'ready' || busy} onClick={locate}><MapIcon name="locate" /></button></div>
      <p className="explore-map-note">发现身边，不必走远</p>
      <details className="explore-data-note"><summary>地图与数据说明</summary><p>{area}</p><p>点击定位后由浏览器和高德处理位置，不保存到个人档案。地点资料以高德更新为准，不代表实时营业或价格，也未验证饮食忌口。</p></details>
    </main>
  </div>
}
