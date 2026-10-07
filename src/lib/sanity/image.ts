// Sanity-beelden via @sanity/image-url + srcset. Zie ~/Code/_standards/IMAGES.md.
// Profiel: Website (q75, max 2560).
import { createImageUrlBuilder, type SanityImageSource } from "@sanity/image-url";
import { sanityClient } from "sanity:client";

const builder = createImageUrlBuilder(sanityClient);

const WIDTHS = [480, 768, 1080, 1440, 1920, 2400];
const MAX_WIDTH = 2560;
const QUALITY = 75;

export type SanityImage = {
  _type?: string;
  asset?: { _ref?: string; _id?: string };
  alt?: string;
  caption?: string;
  hotspot?: { x: number; y: number };
  crop?: unknown;
};

export const urlFor = (source: SanityImageSource) => builder.image(source);

/** Bronafmetingen uit de asset-id (image-<hash>-<b>x<h>-<ext>), zonder extra query. */
export function dimensions(image?: SanityImage) {
  const id = image?.asset?._ref ?? image?.asset?._id ?? "";
  const match = id.match(/-(\d+)x(\d+)-/);
  return match ? { width: Number(match[1]), height: Number(match[2]) } : { width: 1600, height: 1200 };
}

/**
 * src/srcset/sizes/width/height voor een <img>.
 * `aspect` (breedte/hoogte) snijdt bij met de hotspot van de redacteur.
 */
export function imageProps(image: SanityImage, { sizes = "100vw", aspect }: { sizes?: string; aspect?: number } = {}) {
  const source = dimensions(image);
  const max = Math.min(source.width, MAX_WIDTH);
  const widths = [...WIDTHS.filter((w) => w < max), max];
  const heightFor = (w: number) => (aspect ? Math.round(w / aspect) : undefined);
  const build = (w: number) => {
    let b = urlFor(image).width(w).auto("format").quality(QUALITY);
    const h = heightFor(w);
    b = h ? b.height(h).fit("crop") : b.fit("max");
    return b.url();
  };
  const width = max;
  const height = heightFor(max) ?? Math.round((source.height / source.width) * max);

  return {
    src: build(Math.min(1280, max)),
    srcset: widths.map((w) => `${build(w)} ${w}w`).join(", "),
    sizes,
    width,
    height,
  };
}

export const focalPoint = (image?: SanityImage) =>
  image?.hotspot ? `${image.hotspot.x * 100}% ${image.hotspot.y * 100}%` : "50% 50%";

/** URL van een Sanity-bestand (PDF, video) uit de asset-ref. */
export function fileUrl(file?: { asset?: { _ref?: string; url?: string } }) {
  if (file?.asset?.url) return file.asset.url;
  const ref = file?.asset?._ref;
  if (!ref) return undefined;
  const [, id, ext] = ref.split("-");
  const { projectId, dataset } = sanityClient.config();
  return `https://cdn.sanity.io/files/${projectId}/${dataset}/${id}.${ext}`;
}
