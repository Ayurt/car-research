/** Resize CarDekho CDN images — full 930px photos are slow to load */
export function carImageUrl(url: string, width = 400): string {
  if (url.includes("stimg.cardekho.com")) {
    return `${url.split("?")[0]}?tr=w-${width}`;
  }
  return url;
}
