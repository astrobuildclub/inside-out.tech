import type { APIRoute } from "astro";
import { sanityClient } from "sanity:client";
import { validatePreviewUrl } from "@sanity/preview-url-secret";
import { PREVIEW_COOKIE } from "../../lib/sanity/visual-editing";

export const GET: APIRoute = async ({ request, cookies, redirect }) => {
  const token = import.meta.env.SANITY_API_READ_TOKEN;
  if (!token) {
    return new Response("SANITY_API_READ_TOKEN ontbreekt", { status: 500 });
  }

  const { isValid, redirectTo = "/" } = await validatePreviewUrl(sanityClient.withConfig({ token }), request.url);

  if (!isValid) {
    return new Response("Ongeldig preview-secret", { status: 401 });
  }

  cookies.set(PREVIEW_COOKIE, "true", {
    path: "/",
    httpOnly: true,
    secure: import.meta.env.PROD,
    // In productie 'none', zodat het ook werkt als de Studio op een ander domein draait.
    sameSite: import.meta.env.PROD ? "none" : "lax",
  });

  return redirect(redirectTo, 307);
};
