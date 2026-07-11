import { useEffect, useRef } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        el: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback": () => void;
        }
      ) => void;
    };
  }
}

const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined;

export function Turnstile({ onToken }: { readonly onToken: (token: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!siteKey || !ref.current) return;
    const render = () =>
      window.turnstile?.render(ref.current!, {
        sitekey: siteKey,
        callback: onToken,
        "expired-callback": () => onToken(""),
      });
    if (window.turnstile) {
      render();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.onload = render;
    document.head.append(script);
  }, [onToken]);
  if (!siteKey)
    return <p className="text-[12px] text-error">Signup verification is not configured.</p>;
  return (
    <div className="mt-3">
      <div ref={ref} />
    </div>
  );
}
