import { useEffect, useState } from 'react';
import { RSS_FEEDS, FALLBACK_NEWS } from '../constants';
import { useAppStore } from '../store';

export default function NewsTicker() {
  const [loading, setLoading] = useState(true);
  const { isOffline, liveNews, setLiveNews } = useAppStore();

  const fetchNews = async () => {
    if (isOffline) {
      setLiveNews([...FALLBACK_NEWS]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const results = await Promise.allSettled(
        RSS_FEEDS.map((f) => {
          const feedUrl = f.url.includes('?') ? `${f.url}&cb=${Date.now()}` : `${f.url}?cb=${Date.now()}`;
          return fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}&count=4&api_key=`).then(r => r.json()).then(d => {
            if (d.status === 'ok' && d.items?.length) {
              return d.items.map((item: any) => ({
                src: f.src, cat: f.cat, cls: f.cls,
                text: item.title?.replace(/[<>&"]/g, (c: string) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c] || c)) || 'No title'
              }));
            }
            return [];
          });
        })
      );
      
      let fetched: any[] = [];
      results.forEach((r) => { if (r.status === 'fulfilled') fetched.push(...r.value); });
      
      if (!fetched.length) {
        fetched = [...FALLBACK_NEWS];
      }
      
      // Shuffle
      for (let i = fetched.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [fetched[i], fetched[j]] = [fetched[j], fetched[i]];
      }
      
      setLiveNews(fetched);
    } catch (e) {
      setLiveNews([...FALLBACK_NEWS]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNews();
    const interval = setInterval(fetchNews, 60000); // 1 min for realtime
    return () => clearInterval(interval);
  }, [isOffline]);

  const doubled = [...liveNews, ...liveNews];

  return (
    <div className="news-ticker">
      <div className="ticker-brand">⬡ LIVE</div>
      <div className="ticker-label" style={{ color: isOffline ? '#888' : 'var(--gold)' }}>
        {isOffline ? '● OFFLINE' : loading ? '● LOADING' : '● LIVE'}
      </div>
      <div className="ticker-scroll">
        <div className="ticker-inner">
          {loading && !isOffline ? (
            <span className="news-loading">⟳ Fetching live world news — sports · politics · science · geopolitics · entertainment · health · finance...</span>
          ) : (
            doubled.map((n, idx) => (
              <span key={idx} className="ticker-item">
                <span className="tsrc">{n.src}:</span>
                <span className={`tcat ${n.cls}`}>{n.cat}</span>
                <span dangerouslySetInnerHTML={{ __html: n.text }}></span>
                <span className="ticker-sep" style={{ marginLeft: '28px' }}>◆</span>
              </span>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
