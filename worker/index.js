// Cloudflare Worker entry: serves the static site from ./public and handles POST /api/subscribe and POST /api/enquiry.
import { onRequestPost as subscribe } from '../functions/api/subscribe.js';
import { onRequestPost as enquiry } from '../functions/api/enquiry.js';

const routes = { '/api/subscribe': subscribe, '/api/enquiry': enquiry };

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const handler = routes[url.pathname];
    if (handler) {
      if (request.method === 'POST') return handler({ request, env, ctx });
      return new Response(JSON.stringify({ error: 'method_not_allowed' }), { status: 405, headers: { 'Content-Type': 'application/json', Allow: 'POST' } });
    }
    return env.ASSETS.fetch(request);
  },
};
