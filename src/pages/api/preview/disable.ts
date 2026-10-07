import type { APIRoute } from "astro";
import { PREVIEW_COOKIE } from "../../../lib/sanity/visual-editing";

export const GET: APIRoute = async ({ cookies, redirect }) => {
  cookies.delete(PREVIEW_COOKIE, { path: "/" });
  return redirect("/", 307);
};
