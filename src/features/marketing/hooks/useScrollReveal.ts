import { useEffect, useRef } from "react"

/**
 * Lightweight scroll-reveal hook using IntersectionObserver.
 * Adds `.revealed` class when elements with `.reveal` enter the viewport.
 * Supports stagger delays via `data-reveal-delay` attribute.
 * Respects `prefers-reduced-motion`.
 */
export function useScrollReveal() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = containerRef.current
    if (!root) return

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches

    if (prefersReducedMotion) {
      root.querySelectorAll(".reveal").forEach((el) => {
        el.classList.add("revealed")
      })
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement
            const delay = el.dataset.revealDelay
            if (delay) {
              el.style.transitionDelay = `${delay}ms`
            }
            el.classList.add("revealed")
            observer.unobserve(el)
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    )

    root.querySelectorAll(".reveal").forEach((el) => {
      observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])

  return containerRef
}
