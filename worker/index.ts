import app from "vinext/server/fetch-handler";
import { routeRequest } from "../lib/routing";

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const routed = routeRequest(request);
    if (routed) return routed;

    // run_worker_first also covers CSS/JS/fonts on alias hosts. Serve assets only
    // AFTER host policy; vinext otherwise expects Cloudflare's assets-first path.
    let response: Response;
    if (request.method === "GET" || request.method === "HEAD") {
      const asset = await env.ASSETS.fetch(request);
      if (asset.status !== 404) response = asset;
      else {
        await asset.body?.cancel();
        response = await app.fetch(request, env, ctx);
      }
    } else response = await app.fetch(request, env, ctx);
    const secured = new Response(response.body, response);
    secured.headers.set("X-Content-Type-Options", "nosniff");
    secured.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    secured.headers.set("X-Frame-Options", "DENY");
    secured.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    return secured;
  },
};
