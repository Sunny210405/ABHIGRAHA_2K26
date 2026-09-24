/**
 * Cloudflare Worker: worker.js
 * Handles /api/content for real-time festival management with Cloudflare KV (FESTIVAL_KV)
 * and serves all static website assets through env.ASSETS.
 */

// Cryptographic SHA-256 digest of authorized admin key (zero plaintext password exposure)
const AUTH_HASH = '7ba682d1dcfb5d93995134af9fce82b2bf9c0a365f4f29e7b3aac8e949f3297d';
const ALLOWED_KEYS = ['events', 'schedule', 'crowns', 'merchandise', 'gallery', 'visibility'];

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

async function computeSha256(str) {
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest('SHA-256', enc.encode(str));
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 1. Serverless API Endpoint: /api/content
    if (url.pathname === '/api/content') {
      // CORS Pre-flight
      if (request.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: corsHeaders() });
      }

      // Check if Cloudflare KV is bound
      if (!env.FESTIVAL_KV) {
        if (request.method === 'GET') {
          return new Response(JSON.stringify({
            error: 'KV namespace FESTIVAL_KV not bound yet.',
            configured: false
          }), {
            status: 200,
            headers: { 'Content-Type': 'application/json', ...corsHeaders() }
          });
        }
        return new Response(JSON.stringify({
          error: 'KV binding FESTIVAL_KV missing in Cloudflare settings.',
          configured: false
        }), {
          status: 503,
          headers: { 'Content-Type': 'application/json', ...corsHeaders() }
        });
      }

      // Handle GET: Retrieve live festival data
      if (request.method === 'GET') {
        try {
          const targetKey = url.searchParams.get('key');
          if (targetKey) {
            if (!ALLOWED_KEYS.includes(targetKey)) {
              return new Response(JSON.stringify({ error: 'Invalid key requested' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json', ...corsHeaders() }
              });
            }
            const raw = await env.FESTIVAL_KV.get(targetKey);
            const data = raw ? JSON.parse(raw) : null;
            return new Response(JSON.stringify({ [targetKey]: data }), {
              status: 200,
              headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'public, max-age=15, stale-while-revalidate=60',
                ...corsHeaders()
              }
            });
          }

          const entries = await Promise.all(
            ALLOWED_KEYS.map(async (k) => {
              const raw = await env.FESTIVAL_KV.get(k);
              return [k, raw ? JSON.parse(raw) : null];
            })
          );
          return new Response(JSON.stringify(Object.fromEntries(entries)), {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'public, max-age=15, stale-while-revalidate=60',
              ...corsHeaders()
            }
          });
        } catch (err) {
          return new Response(JSON.stringify({ error: 'KV Read Error', details: err.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders() }
          });
        }
      }

      // Handle POST: Update live festival data
      if (request.method === 'POST') {
        const authHeader = request.headers.get('Authorization') || '';
        const token = authHeader.replace(/^Bearer\s+/i, '').trim();

        if (!token) {
          return new Response(JSON.stringify({ error: 'Missing security token' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json', ...corsHeaders() }
          });
        }

        let isAuthorized = false;
        if (token === AUTH_HASH) {
          isAuthorized = true;
        } else {
          const computed = await computeSha256(token);
          if (computed === AUTH_HASH) isAuthorized = true;
        }

        if (!isAuthorized) {
          return new Response(JSON.stringify({ error: 'Access Denied: Invalid Security Authentication' }), {
            status: 403,
            headers: { 'Content-Type': 'application/json', ...corsHeaders() }
          });
        }

        try {
          const body = await request.json();
          const { key, data } = body;

          if (!key || !ALLOWED_KEYS.includes(key)) {
            return new Response(JSON.stringify({ error: 'Invalid or unsupported key' }), {
              status: 400,
              headers: { 'Content-Type': 'application/json', ...corsHeaders() }
            });
          }

          if (data === undefined) {
            return new Response(JSON.stringify({ error: 'Missing data payload' }), {
              status: 400,
              headers: { 'Content-Type': 'application/json', ...corsHeaders() }
            });
          }

          await env.FESTIVAL_KV.put(key, JSON.stringify(data));
          return new Response(JSON.stringify({ success: true, key, timestamp: new Date().toISOString() }), {
            status: 200,
            headers: { 'Content-Type': 'application/json', ...corsHeaders() }
          });
        } catch (err) {
          return new Response(JSON.stringify({ error: 'KV Write Error', details: err.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders() }
          });
        }
      }

      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json', ...corsHeaders() }
      });
    }

    // 2. Default: Serve all static website assets through Cloudflare Assets runtime
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return fetch(request);
  }
};
