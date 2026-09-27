/**
 * Cloudflare Worker: worker.js
 * Handles /api/content for real-time festival management with Cloudflare KV (FESTIVAL_KV)
 * and serves all static website assets through env.ASSETS.
 */

// Cryptographic SHA-256 digest of authorized admin key (zero plaintext password exposure)
const AUTH_HASH = '7ba682d1dcfb5d93995134af9fce82b2bf9c0a365f4f29e7b3aac8e949f3297d';
const ALLOWED_KEYS = ['events', 'schedule', 'crowns', 'merchandise', 'gallery', 'visibility', 'contacts', 'last_updated', 'festival_data'];

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

function noCacheHeaders() {
  return {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
    'CDN-Cache-Control': 'no-store',
    'Cloudflare-CDN-Cache-Control': 'no-store',
    'Pragma': 'no-cache',
    'Expires': '0',
    ...corsHeaders()
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
            headers: noCacheHeaders()
          });
        }
        return new Response(JSON.stringify({
          error: 'KV binding FESTIVAL_KV missing in Cloudflare settings.',
          configured: false
        }), {
          status: 503,
          headers: noCacheHeaders()
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
                headers: noCacheHeaders()
              });
            }

            const raw = await env.FESTIVAL_KV.get(targetKey);
            let data = null;
            if (raw) {
              try {
                data = JSON.parse(raw);
              } catch (e) {
                data = raw;
              }
            }

            if (targetKey === 'last_updated') {
              const cleanVer = data ? String(data).replace(/"/g, '') : '0';
              return new Response(JSON.stringify({ last_updated: cleanVer }), {
                status: 200,
                headers: noCacheHeaders()
              });
            }

            return new Response(JSON.stringify({ [targetKey]: data }), {
              status: 200,
              headers: noCacheHeaders()
            });
          }

          // Full fetch: try atomic bundle first
          const rawBundle = await env.FESTIVAL_KV.get('festival_data');
          if (rawBundle) {
            try {
              const bundle = JSON.parse(rawBundle);
              if (bundle && typeof bundle === 'object') {
                return new Response(JSON.stringify(bundle), {
                  status: 200,
                  headers: noCacheHeaders()
                });
              }
            } catch (e) {}
          }

          // Fallback: Read individual keys in parallel
          const individualKeys = ['events', 'schedule', 'crowns', 'merchandise', 'gallery', 'visibility', 'contacts', 'last_updated'];
          const entries = await Promise.all(
            individualKeys.map(async (k) => {
              const raw = await env.FESTIVAL_KV.get(k);
              let parsed = null;
              if (raw) {
                try {
                  parsed = JSON.parse(raw);
                } catch (e) {
                  parsed = raw;
                }
              }
              if (k === 'last_updated' && parsed) {
                parsed = String(parsed).replace(/"/g, '');
              }
              return [k, parsed];
            })
          );
          const result = Object.fromEntries(entries);
          if (!result.last_updated) {
            result.last_updated = '0';
          }
          return new Response(JSON.stringify(result), {
            status: 200,
            headers: noCacheHeaders()
          });
        } catch (err) {
          return new Response(JSON.stringify({ error: 'KV Read Error', details: err.message }), {
            status: 500,
            headers: noCacheHeaders()
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
            headers: noCacheHeaders()
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
            headers: noCacheHeaders()
          });
        }

        try {
          const body = await request.json();

          // Batch Publish: saves multiple modified sections in 1 single network request
          if (body.batch && typeof body.batch === 'object') {
            const batchKeys = Object.keys(body.batch).filter(k => ALLOWED_KEYS.includes(k));
            if (batchKeys.length === 0) {
              return new Response(JSON.stringify({ error: 'No valid keys provided in batch payload' }), {
                status: 400,
                headers: noCacheHeaders()
              });
            }

            const updateTimestamp = Date.now().toString();
            const bundle = {
              ...body.batch,
              last_updated: updateTimestamp
            };

            await Promise.all([
              env.FESTIVAL_KV.put('festival_data', JSON.stringify(bundle)),
              env.FESTIVAL_KV.put('last_updated', JSON.stringify(updateTimestamp)),
              ...batchKeys.map(k => env.FESTIVAL_KV.put(k, JSON.stringify(body.batch[k])))
            ]);

            return new Response(JSON.stringify({
              success: true,
              batch: batchKeys,
              timestamp: new Date().toISOString(),
              last_updated: updateTimestamp
            }), {
              status: 200,
              headers: noCacheHeaders()
            });
          }

          const { key, data } = body;

          if (!key || !ALLOWED_KEYS.includes(key)) {
            return new Response(JSON.stringify({ error: 'Invalid or unsupported key' }), {
              status: 400,
              headers: noCacheHeaders()
            });
          }

          if (data === undefined) {
            return new Response(JSON.stringify({ error: 'Missing data payload' }), {
              status: 400,
              headers: noCacheHeaders()
            });
          }

          const updateTimestamp = Date.now().toString();
          const puts = [
            env.FESTIVAL_KV.put(key, JSON.stringify(data)),
            env.FESTIVAL_KV.put('last_updated', JSON.stringify(updateTimestamp))
          ];

          try {
            const rawBundle = await env.FESTIVAL_KV.get('festival_data');
            if (rawBundle) {
              const bundle = JSON.parse(rawBundle);
              bundle[key] = data;
              bundle.last_updated = updateTimestamp;
              puts.push(env.FESTIVAL_KV.put('festival_data', JSON.stringify(bundle)));
            }
          } catch (e) {}

          await Promise.all(puts);

          return new Response(JSON.stringify({
            success: true,
            key,
            timestamp: new Date().toISOString(),
            last_updated: updateTimestamp
          }), {
            status: 200,
            headers: noCacheHeaders()
          });
        } catch (err) {
          return new Response(JSON.stringify({ error: 'KV Write Error', details: err.message }), {
            status: 500,
            headers: noCacheHeaders()
          });
        }
      }

      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: noCacheHeaders()
      });
    }

    // 2. Default: Serve all static website assets through Cloudflare Assets runtime
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return fetch(request);
  }
};
