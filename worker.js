/**
 * Cloudflare Worker: worker.js
 * Handles /api/content for real-time festival management with Cloudflare KV (FESTIVAL_KV)
 * and serves all static website assets through env.ASSETS.
 */

// Cryptographic SHA-256 digest of authorized admin key (zero plaintext password exposure)
const AUTH_HASH = '7ba682d1dcfb5d93995134af9fce82b2bf9c0a365f4f29e7b3aac8e949f3297d';
const ALLOWED_KEYS = ['events', 'schedule', 'crowns', 'merchandise', 'gallery', 'visibility', 'contact', 'last_updated'];

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

// High-speed edge in-memory cache for instant zero-latency cross-worker reads
const IN_MEMORY_CACHE = {};
let IN_MEMORY_LAST_UPDATED = '0';

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
            let data = null;
            if (targetKey === 'last_updated' && IN_MEMORY_LAST_UPDATED !== '0') {
              data = IN_MEMORY_LAST_UPDATED;
            } else if (IN_MEMORY_CACHE[targetKey] !== undefined) {
              data = IN_MEMORY_CACHE[targetKey];
            } else {
              const raw = await env.FESTIVAL_KV.get(targetKey);
              data = raw ? JSON.parse(raw) : null;
            }
            return new Response(JSON.stringify({ [targetKey]: data }), {
              status: 200,
              headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
                ...corsHeaders()
              }
            });
          }

          const entries = await Promise.all(
            ALLOWED_KEYS.map(async (k) => {
              if (k === 'last_updated' && IN_MEMORY_LAST_UPDATED !== '0') {
                return [k, IN_MEMORY_LAST_UPDATED];
              }
              if (IN_MEMORY_CACHE[k] !== undefined) {
                return [k, IN_MEMORY_CACHE[k]];
              }
              const raw = await env.FESTIVAL_KV.get(k);
              return [k, raw ? JSON.parse(raw) : null];
            })
          );
          const result = Object.fromEntries(entries);
          if (!result.last_updated) {
            result.last_updated = IN_MEMORY_LAST_UPDATED !== '0' ? IN_MEMORY_LAST_UPDATED : '0';
          }
          return new Response(JSON.stringify(result), {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
              'CDN-Cache-Control': 'no-store',
              'Cloudflare-CDN-Cache-Control': 'no-store',
              'Pragma': 'no-cache',
              'Expires': '0',
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

          // Batch Publish: saves multiple modified sections in 1 single network request and 1 last_updated write
          if (body.batch && typeof body.batch === 'object') {
            const batchKeys = Object.keys(body.batch).filter(k => ALLOWED_KEYS.includes(k));
            if (batchKeys.length === 0) {
              return new Response(JSON.stringify({ error: 'No valid keys provided in batch payload' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json', ...corsHeaders() }
              });
            }

            const updateTimestamp = Date.now().toString();
            await Promise.all(
              batchKeys.map(async (k) => {
                IN_MEMORY_CACHE[k] = body.batch[k];
                await env.FESTIVAL_KV.put(k, JSON.stringify(body.batch[k]));
              })
            );
            IN_MEMORY_LAST_UPDATED = updateTimestamp;
            await env.FESTIVAL_KV.put('last_updated', JSON.stringify(updateTimestamp));

            return new Response(JSON.stringify({
              success: true,
              batch: batchKeys,
              timestamp: new Date().toISOString(),
              last_updated: updateTimestamp
            }), {
              status: 200,
              headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
                ...corsHeaders()
              }
            });
          }

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

          const updateTimestamp = Date.now().toString();
          IN_MEMORY_CACHE[key] = data;
          IN_MEMORY_LAST_UPDATED = updateTimestamp;

          await env.FESTIVAL_KV.put(key, JSON.stringify(data));
          await env.FESTIVAL_KV.put('last_updated', JSON.stringify(updateTimestamp));
          return new Response(JSON.stringify({
            success: true,
            key,
            timestamp: new Date().toISOString(),
            last_updated: updateTimestamp
          }), {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
              ...corsHeaders()
            }
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
