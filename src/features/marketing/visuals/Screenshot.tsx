import type { ReactNode } from "react";

type ScreenshotName =
  | "overview"
  | "database"
  | "kafka"
  | "logs"
  | "trace"
  | "services"
  | "service-detail";

const TITLES: Record<ScreenshotName, string> = {
  overview: "optikk.dev / saturation",
  database: "optikk.dev / saturation / database",
  kafka: "optikk.dev / saturation / kafka",
  logs: "optikk.dev / logs",
  trace: "optikk.dev / traces / 7b3f8a2e",
  services: "optikk.dev / services",
  "service-detail": "optikk.dev / services / payment-svc",
};

interface ScreenshotProps {
  readonly name: ScreenshotName;
  readonly alt: string;
  readonly title?: string;
  readonly eager?: boolean;
  readonly fallback?: ReactNode;
  readonly bare?: boolean;
}

/**
 * Renders a marketing screenshot served from /marketing/screenshots/*.svg.
 * Vite copies public/* into the build verbatim, so these are first-class CDN
 * assets under both Firebase Hosting and Cloud Run (long-cache headers wired
 * in firebase.json + nginx.cloudrun.conf).
 *
 * Wrapped in a browser-chrome frame to match the rest of the hero visuals.
 * If `bare` is true, the chrome is skipped (use when embedding inside a
 * Split's m-split-visual frame, which already provides the border).
 */
export function Screenshot({ name, alt, title, eager, fallback, bare }: ScreenshotProps) {
  const src = `/marketing/screenshots/${name}.svg`;
  const img = (
    <img
      src={src}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={eager ? "high" : "auto"}
      onError={
        fallback
          ? (e) => {
              const target = e.currentTarget as HTMLImageElement;
              target.style.display = "none";
              const next = target.nextElementSibling as HTMLElement | null;
              if (next) next.style.display = "block";
            }
          : undefined
      }
      style={{ display: "block", width: "100%", height: "auto" }}
    />
  );

  if (bare) {
    return (
      <>
        {img}
        {fallback ? (
          <div style={{ display: "none" }} aria-hidden="true">
            {fallback}
          </div>
        ) : null}
      </>
    );
  }

  return (
    <div className="m-hero-art-window" style={{ aspectRatio: "auto", height: "auto" }}>
      <div className="m-hero-art-bar">
        <i />
        <i />
        <i />
        <span>{title ?? TITLES[name]}</span>
      </div>
      <div style={{ background: "#fbfbf7" }}>
        {img}
        {fallback ? (
          <div style={{ display: "none" }} aria-hidden="true">
            {fallback}
          </div>
        ) : null}
      </div>
    </div>
  );
}
