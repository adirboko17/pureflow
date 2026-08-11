/** Optimized public image paths (AVIF/WebP) under /images. */

export const heroImage = {
  avif: "/images/hero-768.avif 768w, /images/hero-1280.avif 1280w, /images/hero-1536.avif 1536w",
  webp: "/images/hero-768.webp 768w, /images/hero-1280.webp 1280w, /images/hero-1536.webp 1536w",
  src: "/images/hero-1280.webp",
  width: 1280,
  height: 853,
  /** Preload the mobile LCP candidate. */
  preload: "/images/hero-768.avif",
  preloadType: "image/avif" as const,
};

export type GalleryKey = "duct1" | "duct2" | "duct3" | "duct4" | "chi1" | "chi2";

export function gallerySrcSet(name: GalleryKey, ext: "avif" | "webp") {
  return `/images/${name}-240.${ext} 240w, /images/${name}-480.${ext} 480w`;
}

export function gallerySrc(name: GalleryKey) {
  return `/images/${name}-480.webp`;
}
