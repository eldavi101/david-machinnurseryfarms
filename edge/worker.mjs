// Optional configurable edge host. This is not executed by GitHub Pages.
import headers from './policy.mjs';

export function secure(response) {
  const result = new Response(response.body, response);
  for (const [name, value] of Object.entries(headers)) result.headers.set(name, value);
  result.headers.delete('Access-Control-Allow-Origin');
  result.headers.delete('Access-Control-Allow-Credentials');
  result.headers.delete('X-Powered-By');
  return result;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const canonical = new URL(env.CANONICAL_ORIGIN || 'https://www.machinnurseryfarms.com');
    if (!['GET', 'HEAD'].includes(request.method)) {
      return secure(new Response('Method not allowed', { status: 405, headers: { Allow: 'GET, HEAD', 'Content-Type': 'text/plain; charset=utf-8' } }));
    }
    const pathname = url.pathname.replace(/\/index\.html$/, '/');
    if (url.origin !== canonical.origin || pathname !== url.pathname) {
      const destination = new URL(canonical);
      destination.pathname = pathname;
      destination.search = url.search;
      return secure(new Response(null, { status: 308, headers: { Location: destination.href } }));
    }
    try {
      const response = await env.ASSETS.fetch(request);
      // Missing URLs keep the asset binding's genuine 404 status.
      return secure(response);
    } catch {
      return secure(new Response('Temporarily unavailable', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Retry-After': '60' } }));
    }
  },
};
