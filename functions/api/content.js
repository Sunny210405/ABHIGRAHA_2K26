/**
 * Cloudflare Pages Serverless Function: /api/content
 * Handles real-time global retrieval and persistence for Abhigraha 2K26
 * Powered by Cloudflare KV (Namespace binding: FESTIVAL_KV)
 */

// SHA-256 digest of the authorized admin access key
const AUTH_HASH = '7ba682d1dcfb5d93995134af9fce82b2bf9c0a365f4f29e7b3aac8e949f3297d';

const ALLOWED_KEYS = ['events', 'schedule', 'crowns', 'merchandise', 'gallery', 'visibility', 'last_updated'];

// Helper to compute SHA-256 in Cloudflare Workers environment
async function computeSha256(str) {
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest('SHA-256', enc.encode(str));
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// CORS Headers helper
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

// Handle CORS Pre-flight requests
export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders()
  });
}

/**
 * GET /api/content
 * Returns live festival data from Cloudflare KV
 * Query params optional: ?key=events
 */
export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const targetKey = url.searchParams.get('key');

  // Verify KV binding exists
  if (!env.FESTIVAL_KV) {
    return new Response(JSON.stringify({
      error: 'KV namespace FESTIVAL_KV not bound yet.',
      configured: false
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders()
      }
    });
  }

  try {
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
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
          ...corsHeaders()
        }
      });
    }

    // Fetch all keys in parallel
    const entries = await Promise.all(
      ALLOWED_KEYS.map(async (k) => {
        const raw = await env.FESTIVAL_KV.get(k);
        return [k, raw ? JSON.parse(raw) : null];
      })
    );

    const result = Object.fromEntries(entries);
    if (!result.last_updated) {
      result.last_updated = '0';
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        ...corsHeaders()
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to read from Cloudflare KV', details: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders() }
    });
  }
}

/**
 * POST /api/content
 * Authenticates admin and updates Cloudflare KV in real-time
 * Body: { key: 'events'|'schedule'|'crowns'|'merchandise'|'gallery', data: [...] }
 */
export async function onRequestPost(context) {
  const { request, env } = context;

  // Verify KV binding
  if (!env.FESTIVAL_KV) {
    return new Response(JSON.stringify({
      error: 'KV binding FESTIVAL_KV missing in Cloudflare Pages settings.',
      configured: false
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json', ...corsHeaders() }
    });
  }

  // Security Check: Verify Bearer authorization token / security key
  const authHeader = request.headers.get('Authorization') || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();

  if (!token) {
    return new Response(JSON.stringify({ error: 'Missing security token' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json', ...corsHeaders() }
    });
  }

  // Token can be the already-hashed key or raw string that hashes to AUTH_HASH
  let isAuthorized = false;
  if (token === AUTH_HASH) {
    isAuthorized = true;
  } else {
    const computed = await computeSha256(token);
    if (computed === AUTH_HASH) {
      isAuthorized = true;
    }
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
      return new Response(JSON.stringify({ error: 'Invalid or unsupported key for storage' }), {
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

    // Save to Cloudflare KV
    const updateTimestamp = Date.now().toString();
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
    return new Response(JSON.stringify({ error: 'Failed to write to Cloudflare KV', details: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders() }
    });
  }
}
