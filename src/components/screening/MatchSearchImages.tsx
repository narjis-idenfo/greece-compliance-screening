"use client";

import { useState } from "react";
import type { MatchSearchImage } from "@/types/screening";
import { proxyImageUrl } from "@/lib/images/proxy-image-url";
import { ExternalLink, ImageIcon } from "lucide-react";

interface MatchSearchImagesProps {
  imageUrl?: string;
  searchImages?: MatchSearchImage[];
}

function ImageTile({ image, featured }: { image: MatchSearchImage; featured?: boolean }) {
  const [failed, setFailed] = useState(false);

  if (failed) return null;

  return (
    <figure
      className={
        featured
          ? "overflow-hidden rounded-xl border border-border/60 bg-muted/20"
          : "overflow-hidden rounded-lg border border-border/50 bg-muted/20"
      }
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={proxyImageUrl(image.url)}
        alt={image.caption ?? "Source image from screening"}
        className={featured ? "h-48 w-full object-cover sm:h-56" : "h-28 w-full object-cover"}
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
      />
      <figcaption className="space-y-1 p-2 text-xs text-muted-foreground">
        {image.caption && <p className="font-medium text-foreground/90">{image.caption}</p>}
        {image.sourceName && <p>{image.sourceName}</p>}
        {image.sourcePageUrl && (
          <a
            href={image.sourcePageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-cyan-500 hover:underline"
          >
            View source page <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </figcaption>
    </figure>
  );
}

export function MatchSearchImages({ imageUrl, searchImages }: MatchSearchImagesProps) {
  const gallery: MatchSearchImage[] = [];
  const seen = new Set<string>();

  for (const img of searchImages ?? []) {
    if (!seen.has(img.url)) {
      seen.add(img.url);
      gallery.push(img);
    }
  }
  if (imageUrl && !seen.has(imageUrl)) {
    gallery.unshift({ url: imageUrl, caption: "Primary match image" });
  }

  if (gallery.length === 0) return null;

  const [primary, ...rest] = gallery;

  return (
    <div className="space-y-3">
      <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        <ImageIcon className="h-3.5 w-3.5" />
        Images from sources
      </p>
      <ImageTile image={primary} featured />
      {rest.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {rest.map((img) => (
            <ImageTile key={img.url} image={img} />
          ))}
        </div>
      )}
    </div>
  );
}
