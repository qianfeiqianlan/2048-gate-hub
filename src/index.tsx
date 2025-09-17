import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { renderer } from './renderer'
import { userRouter, scoreRouter } from './routes'
import { authMiddleware } from './middleware'
import type { Env, RequestContext } from './types'

const app = new Hono<{ Bindings: Env; Variables: RequestContext }>()

app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))

app.use(renderer)

app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: Date.now() })
})

app.route('/user', userRouter)

app.use('/score/*', authMiddleware)
app.route('/score', scoreRouter)

app.get('/', (c) => {
  return c.render(
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🎮 Tinca Game API</h1>
      <p>Welcome to Tinca Game API Service!</p>
      <div style={{ marginTop: '20px' }}>
        <h3>Available API Endpoints:</h3>
        <ul>
          <li><strong>POST /user/login</strong> - User login/auto registration</li>
          <li><strong>GET /score</strong> - Get user scores (authentication required)</li>
          <li><strong>POST /score</strong> - Upload single score (authentication required)</li>
          <li><strong>POST /score/multiple</strong> - Upload multiple scores (authentication required)</li>
          <li><strong>GET /score/leaderboard</strong> - Get leaderboard (public)</li>
          <li><strong>GET /health</strong> - Health check</li>
        </ul>
      </div>
    </div>
  )
})

export default app
