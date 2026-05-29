import type { RouteLocationNormalizedLoaded } from 'vue-router'

export const updateBreadcrumb = (route: RouteLocationNormalizedLoaded, pages: string[]) => {
  route.meta.pages = pages
  // Force breadcrumb re-render
  if ((window as any).updateBreadcrumb) {
    (window as any).updateBreadcrumb()
  }
}
