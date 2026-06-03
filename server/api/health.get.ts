// GET /api/health — liveness probe usado pelo healthcheck do Docker, pelo Nginx e pelo smoke-test do CI.
export default defineEventHandler(() => ({
  status: 'ok',
  uptime: Math.round(process.uptime()),
}))
