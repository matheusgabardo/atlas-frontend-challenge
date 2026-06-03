// POST /api/vitals — recebe os Core Web Vitals enviados pelo cliente (RUM) e registra.
// Aqui só logamos (visível em `docker logs`); em produção real plugaria num coletor/APM.
export default defineEventHandler(async (event) => {
  const m = await readBody<{ name?: string; value?: number; rating?: string; path?: string }>(event)
  if (m?.name) {
    console.info(`[web-vitals] ${m.name}=${m.value} (${m.rating}) ${m.path ?? ''}`)
  }
  setResponseStatus(event, 204) // o cliente usa sendBeacon e ignora o corpo
  return null
})
