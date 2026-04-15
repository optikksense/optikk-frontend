import type { NavigateOptions } from "@tanstack/react-router";

/**
 * Build a NavigateOptions object for dynamic paths that are not in the
 * static TanStack Router route tree.
 *
 * TanStack Router's `to` property is a branded string literal union
 * derived from the registered route tree. When navigating to runtime-
 * computed paths (e.g. paths with interpolated params, or paths built
 * from feature registry), the strict type check fails. Rather than
 * scattering `as any` throughout the codebase, this single helper
 * centralises the one necessary cast.
 */
export function dynamicNavigateOptions(
  to: string,
  search?: Record<string, unknown>,
): NavigateOptions {
  return { to, search } as NavigateOptions;
}

/**
 * Build a `to` value suitable for TanStack Router's Navigate component
 * or navigate() call when the path is a dynamic string.
 */
export function dynamicTo(path: string): string & {} {
  return path as string & {};
}
