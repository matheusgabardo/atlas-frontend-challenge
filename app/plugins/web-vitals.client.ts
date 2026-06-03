// RUM (Real User Monitoring): coleta os Core Web Vitals no cliente e envia ao
// endpoint /api/vitals. Client-only (.client.ts) — não roda no SSR. Ver README › Performance.
import { onCLS, onINP, onLCP, onFCP, onTTFB, type Metric } from 'web-vitals'

export default defineNuxtPlugin(() => {
  function report(metric: Metric) {
    const body = JSON.stringify({
      name: metric.name,
      value: Math.round(metric.value),
      rating: metric.rating, // 'good' | 'needs-improvement' | 'poor'
      path: location.pathname,
    })
    // sendBeacon sobrevive ao unload/navegação; fallback para fetch keepalive.
    if (navigator.sendBeacon) navigator.sendBeacon('/api/vitals', body)
    else fetch('/api/vitals', { method: 'POST', body, keepalive: true }).catch(() => {})
  }

  onLCP(report)
  onCLS(report)
  onINP(report)
  onFCP(report)
  onTTFB(report)
})
