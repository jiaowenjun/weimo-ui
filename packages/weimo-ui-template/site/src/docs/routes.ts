export const siteTemplatePreviewPath = '/previews/site-template'
export const miniSiteTemplatePreviewPath = '/previews/mini-site-template'

export const routerBasename = import.meta.env.BASE_URL.replace(/\/$/, '')

function withBasename(path: string) {
  return routerBasename ? `${routerBasename}${path}` : path
}

export function siteTemplatePreviewHref() {
  return withBasename(siteTemplatePreviewPath)
}

export function miniSiteTemplatePreviewHref() {
  return withBasename(miniSiteTemplatePreviewPath)
}
