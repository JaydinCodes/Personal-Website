/*
 * Express middleware server for Jaydin Morrison's portfolio.
 *
 * This server performs three primary functions:
 *  1. Applies security hardening via Helmet and prevents basic XSS attacks via xss-clean.
 *  2. Enforces HTTP Basic authentication on all routes using credentials defined in environment variables.
 *  3. Proxies API requests to the underlying Django service, rewriting the `/api` prefix.  A dedicated
 *     `/api/contact` handler is provided to illustrate how to intercept and customise proxied requests.
 *
 * In production the middleware proxies all non-API routes to a local Next.js server.
 */

const express = require('express')
const helmet = require('helmet')
const xss = require('xss-clean')
const basicAuth = require('express-basic-auth')
const { createProxyMiddleware } = require('http-proxy-middleware')
const cors = require('cors')
require('dotenv').config()

const app = express()

// Apply security middlewares with CSP allowances for Next.js, Google Fonts, and Unsplash images
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
        imgSrc: ["'self'", 'data:', 'blob:', 'https://images.unsplash.com'],
        connectSrc: ["'self'", 'ws:', 'wss:'],
      },
    },
  }),
)
app.use(cors())

// Configure basic authentication
let users = {}

if (process.env.BASIC_AUTH_USER && process.env.BASIC_AUTH_PASS) {
  users[process.env.BASIC_AUTH_USER] = process.env.BASIC_AUTH_PASS
  app.use(
    basicAuth({
      users,
      challenge: true,
      unauthorizedResponse: () => ({ error: 'Authentication required.' }),
    }),
  )
} else {
  console.warn(
    '[DEV WARNING] BASIC_AUTH_USER or BASIC_AUTH_PASS not set. Basic auth disabled for local development.'
  )
}

// Normalize the Django API base URL so it consistently ends with `/api`
const rawDjangoUrl = (process.env.DJANGO_API_URL || 'http://localhost:8000/api').replace(/\/+$/, '')
const djangoApiUrl = rawDjangoUrl.endsWith('/api') ? rawDjangoUrl : `${rawDjangoUrl}/api`

// Intercept specific endpoint (contact form) BEFORE the catch-all /api proxy
app.post('/api/contact', express.json(), xss(), async (req, res) => {
  const { name, email, message } = req.body || {}
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Missing required fields.' })
  }
  try {
    const response = await fetch(`${djangoApiUrl}/contact/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, message }),
    })
    const data = await response.json()
    return res.status(response.status).json(data)
  } catch (err) {
    console.error('Error forwarding contact form', err)
    return res.status(500).json({ error: 'Internal server error.' })
  }
})

// Proxy all remaining /api requests to Django
app.use(
  '/api',
  createProxyMiddleware({
    target: djangoApiUrl,
    changeOrigin: true,
    pathRewrite: {
      '^/api': '',
    },
  }),
)

// In production, forward all non-API requests to Next.js.
if (process.env.NODE_ENV === 'production') {
  const nextFrontendUrl = process.env.NEXT_FRONTEND_URL || 'http://127.0.0.1:3001'
  const nextProxy = createProxyMiddleware({
    target: nextFrontendUrl,
    changeOrigin: true,
    ws: true,
    onError: (err, req, res) => {
      console.error('[middleware] Next.js upstream error:', err.message)
      if (!res.headersSent) {
        res.status(503).send('Frontend temporarily unavailable. Please retry in a moment.')
      }
    },
  })

  // Compatibility: some proxies/browser caches may request /next/* instead of /_next/*.
  app.use(
    '/next',
    createProxyMiddleware({
      target: nextFrontendUrl,
      changeOrigin: true,
      ws: true,
      pathRewrite: {
        '^/next': '/_next',
      },
      onError: (err, req, res) => {
        console.error('[middleware] Next.js asset upstream error:', err.message)
        if (!res.headersSent) {
          res.status(503).send('Frontend assets temporarily unavailable.')
        }
      },
    }),
  )

  app.use('/_next', nextProxy)

  app.use('/', nextProxy)
}

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Middleware server listening on port ${PORT}`)
})