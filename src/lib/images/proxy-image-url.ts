/** Client-safe URL for loading external images through our proxy */
export function proxyImageUrl(imageUrl: string): string {
  return `/api/images/proxy?url=${encodeURIComponent(imageUrl)}`;
}
