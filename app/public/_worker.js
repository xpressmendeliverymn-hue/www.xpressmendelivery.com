export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Proxy API requests to the backend
    if (url.pathname.startsWith('/api/')) {
      const backendUrl = env.BACKEND_URL || 'https://xpressmen-api-production.up.railway.app';
      const target = backendUrl + url.pathname + url.search;
      
      // Clone request and strip CORS preflight complexity
      const headers = new Headers(request.headers);
      headers.delete('origin');
      headers.delete('referer');
      
      const response = await fetch(target, {
        method: request.method,
        headers,
        body: request.body,
      });
      
      // Add CORS headers so the browser accepts the response
      const corsHeaders = new Headers(response.headers);
      corsHeaders.set('access-control-allow-origin', '*');
      corsHeaders.set('access-control-allow-credentials', 'true');
      corsHeaders.set('access-control-allow-methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
      corsHeaders.set('access-control-allow-headers', 'Content-Type, Authorization');
      
      // Handle preflight OPTIONS
      if (request.method === 'OPTIONS') {
        return new Response(null, {
          status: 204,
          headers: corsHeaders,
        });
      }
      
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: corsHeaders,
      });
    }
    
    // Serve static assets (SPA)
    return env.ASSETS.fetch(request);
  }
};
