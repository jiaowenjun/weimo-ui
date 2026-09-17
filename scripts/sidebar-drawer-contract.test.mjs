import assert from 'node:assert/strict'
import React from 'react'
import { readFileSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'

const sidebarSource = readFileSync(
  new URL('../src/components/sidebar/sidebar-shell.tsx', import.meta.url),
  'utf8',
)
const sidebarIndexSource = readFileSync(
  new URL('../src/components/sidebar/index.tsx', import.meta.url),
  'utf8',
)
const sidebarCss = readFileSync(
  new URL('../src/components/sidebar/sidebar-shell.css', import.meta.url),
  'utf8',
)
const sidebarRegistry = readFileSync(
  new URL('../registry/sidebar.json', import.meta.url),
  'utf8',
)
const registry = readFileSync(new URL('../registry.json', import.meta.url), 'utf8')
const packageJson = readFileSync(new URL('../package.json', import.meta.url), 'utf8')

function cssBlockFor(source, selector) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = source.match(new RegExp(`(?:^|\\n)\\s*${escapedSelector}\\s*\\{([^}]*)\\}`))

  assert.ok(match, `${selector} block must exist.`)

  return match[1]
}

const sidebarBaseBlock = cssBlockFor(sidebarCss, '.weimo-sidebar')
const sidebarNormalBlock = cssBlockFor(sidebarCss, '.weimo-sidebar--normal')
const sidebarDrawerBlock = cssBlockFor(sidebarCss, '.weimo-sidebar--drawer')
const sidebarDrawerViewportBlock = cssBlockFor(
  sidebarCss,
  '.weimo-sidebar-drawer__viewport',
)
const sidebarDrawerStageBlock = cssBlockFor(sidebarCss, '.weimo-sidebar-drawer__stage')

assert.doesNotMatch(
  sidebarIndexSource,
  /SideBarNav|SideBarPreviewNav|SideBarGroup|SideBarItem|groups/,
  'SideBar must be a blank glass panel; navigation structure belongs to the caller.',
)
assert.match(
  sidebarIndexSource,
  /children/,
  'SideBar must accept caller-owned children.',
)
assert.match(
  sidebarSource,
  /showCloseButton\?: boolean/,
  'SideBarShell should let callers opt into the built-in drawer close button.',
)
assert.match(
  sidebarSource,
  /closeButtonLabel\?: string/,
  'SideBarShell should let callers label the built-in drawer close button.',
)
assert.match(
  sidebarSource,
  /showCloseButton = false/,
  'SideBarShell built-in close button should be hidden by default.',
)
assert.match(
  sidebarSource,
  /drawerAction \?\s*\([\s\S]*\) : showCloseButton \?\s*\(/,
  'Custom drawerAction should take precedence over the built-in close button.',
)
assert.match(
  sidebarSource,
  /aria-label=\{closeButtonLabel\}[\s\S]*onClick=\{onClose\}/,
  'Built-in drawer close button should be accessible and close the controlled drawer.',
)
assert.match(
  sidebarCss,
  /\.weimo-sidebar__close-button\s*\{/,
  'SideBar drawer close button should have component-owned styles.',
)

assert.match(
  sidebarSource,
  /@base-ui\/react\/drawer/,
  'SideBar drawer should use Base UI Drawer primitives.',
)
assert.doesNotMatch(
  sidebarSource,
  /@base-ui-components\/react\/dialog/,
  'SideBar drawer should not depend on legacy Dialog primitives.',
)
for (const primitive of [
  'Drawer.Root',
  'Drawer.Portal',
  'Drawer.Backdrop',
  'Drawer.Viewport',
  'Drawer.Popup',
  'Drawer.Title',
]) {
  assert.match(sidebarSource, new RegExp(primitive.replace('.', '\\.')), `${primitive} is required.`)
}
assert.match(
  sidebarSource,
  /function useWideViewport\(/,
  'SideBarShell should use a private media query hook to choose one mounted shape.',
)
assert.match(
  sidebarSource,
  /function getWideViewportSnapshot\(\)/,
  'SideBarShell should centralize the initial media query snapshot.',
)
assert.match(
  sidebarSource,
  /useState\(getWideViewportSnapshot\)/,
  'SideBarShell media query hook should initialize from the current viewport when available.',
)
assert.match(
  sidebarSource,
  /window\.matchMedia\(wideMediaQuery\)/,
  'SideBarShell must use the shared wideMediaQuery constant.',
)
assert.match(
  sidebarSource,
  /media\.addEventListener\('change', updateViewport\)/,
  'SideBarShell should subscribe to media query changes.',
)
assert.match(
  sidebarSource,
  /media\.removeEventListener\('change', updateViewport\)/,
  'SideBarShell should clean up the media query listener.',
)
assert.match(
  sidebarSource,
  /if \(isWideViewport\) \{[\s\S]*?<SideBarNormal[\s\S]*?return \([\s\S]*?<SideBarDrawer/,
  'SideBarShell should render either SideBarNormal or SideBarDrawer from an explicit viewport branch.',
)
assert.doesNotMatch(
  sidebarSource,
  /<>\s*<SideBarNormal[\s\S]*<SideBarDrawer[\s\S]*<\/>/,
  'SideBarShell must not render normal and drawer sidebars in the same fragment.',
)
assert.match(
  sidebarSource,
  /if \(isWideViewport\) \{\s*onClose\(\)\s*\}/,
  'SideBarShell should still close the controlled drawer state when the viewport is desktop width.',
)
assert.doesNotMatch(
  sidebarSource,
  /requestAnimationFrame/,
  'Drawer should own mount/open animation; SideBar should not use RAF state toggles.',
)

assert.match(
  sidebarCss,
  /\.weimo-sidebar-drawer__stage\s*\{[\s\S]*?transition:\s*transform 300ms ease-out;/,
  'Drawer stage should only animate transform.',
)
assert.doesNotMatch(
  sidebarBaseBlock,
  /backdrop-filter:|background:\s*var\(--glass-gradient\);/,
  'Base sidebar shape must not own material-specific glass styles.',
)
assert.doesNotMatch(
  sidebarNormalBlock,
  /backdrop-filter:/,
  'Desktop sidebar must not use a glass backdrop because it is not floating.',
)
assert.doesNotMatch(
  sidebarNormalBlock,
  /background:\s*var\(--glass-gradient\);/,
  'Desktop sidebar must use a solid card background instead of glass gradient.',
)
assert.ok(
  sidebarSource.includes("import { getCardSurfaceClassName } from '../card-surface'") &&
    sidebarSource.includes("getCardSurfaceClassName('weimo-sidebar--normal', className)") &&
    !/background:\s*var\(--color-bg-card\);/.test(sidebarNormalBlock) &&
    !/box-shadow:\s*var\(--shadow-card\);/.test(sidebarNormalBlock),
  'Desktop sidebar must compose CardSurface instead of repeating static card material CSS.',
)
for (const block of [sidebarNormalBlock, sidebarDrawerBlock]) {
  assert.match(
    block,
    /overflow-y:\s*auto;/,
    'Sidebar panels must allow vertical scrolling when content exceeds the viewport.',
  )
}
assert.match(
  sidebarBaseBlock,
  /scrollbar-width:\s*none;/,
  'Sidebar panels must hide Firefox scrollbars while preserving scrolling.',
)
assert.match(
  sidebarCss,
  /\.weimo-sidebar::-webkit-scrollbar\s*\{[\s\S]*?display:\s*none;/,
  'Sidebar panels must hide WebKit scrollbars while preserving scrolling.',
)
for (const block of [sidebarDrawerViewportBlock, sidebarDrawerStageBlock, sidebarDrawerBlock]) {
  assert.match(
    block,
    /touch-action:\s*pan-y;/,
    'Drawer sidebar must allow vertical touch scrolling while preserving horizontal swipe gestures.',
  )
}
assert.match(
  sidebarDrawerBlock,
  /border-color:\s*var\(--color-border\);/,
  'Drawer sidebar must keep the default border so the floating panel edge remains visible.',
)
assert.match(
  sidebarDrawerBlock,
  /background:\s*var\(--color-bg-card\);/,
  'Drawer sidebar must use an opaque Card surface so the backdrop cannot gray the panel.',
)
assert.doesNotMatch(
  sidebarDrawerBlock,
  /box-shadow:|--glass-shadow/,
  'Drawer sidebar must not use glass shadow effects.',
)
assert.doesNotMatch(
  sidebarCss,
  /--glass-shadow|--glass-shadow-bleed|box-shadow:\s*var\(--glass-shadow/,
  'Sidebar shell must not reserve space for or render glass shadows.',
)
assert.doesNotMatch(
  sidebarDrawerBlock,
  /backdrop-filter:|-webkit-backdrop-filter:|background:[\s\S]*var\(--glass-gradient\);/,
  'Drawer sidebar panel must not use translucent glass material; only its edge and close button stay glassy.',
)
assert.doesNotMatch(
  sidebarCss,
  /\.weimo-sidebar-drawer__stage\s*\{[\s\S]*?transition:[^;]*opacity/,
  'Drawer stage opacity must not participate in transitions.',
)
assert.doesNotMatch(
  sidebarCss,
  /\.weimo-sidebar--drawer\s*\{[\s\S]*?transition:[^;]*(?:opacity|backdrop-filter|-webkit-backdrop-filter)/,
  'Drawer panel blur and opacity must stay fixed, not animated.',
)

assert.doesNotMatch(packageJson, /@base-ui-components\/react/)
assert.match(packageJson, /@base-ui\/react/)
assert.doesNotMatch(sidebarRegistry, /@base-ui-components\/react/)
assert.match(sidebarRegistry, /@base-ui\/react/)
assert.doesNotMatch(registry, /@base-ui-components\/react/)
assert.match(registry, /@base-ui\/react/)
assert.doesNotMatch(sidebarRegistry, /sidebar-nav/)
assert.doesNotMatch(registry, /sidebar-nav/)

function countOccurrences(source, value) {
  return source.split(value).length - 1
}

const originalWindow = globalThis.window
globalThis.window = {
  matchMedia(query) {
    return {
      media: query,
      matches: true,
      addEventListener() {},
      removeEventListener() {},
    }
  },
}

const viteServer = await createServer({
  root: new URL('..', import.meta.url).pathname,
  logLevel: 'silent',
  server: { middlewareMode: true },
  appType: 'custom',
})

try {
  const { SideBarShell } = await viteServer.ssrLoadModule(
    '/src/components/sidebar/sidebar-shell.tsx',
  )
  const html = renderToStaticMarkup(
    React.createElement(
      SideBarShell,
      { open: false, onClose() {} },
      React.createElement('div', { id: 'caller-owned-id' }, 'Caller child'),
    ),
  )

  assert.equal(
    countOccurrences(html, 'caller-owned-id'),
    1,
    'SideBarShell server render should include caller children exactly once.',
  )
  assert.ok(
    html.includes('data-sidebar-variant="normal"'),
    'SideBarShell should render the normal sidebar when the viewport snapshot is wide.',
  )
} finally {
  await viteServer.close()
  if (typeof originalWindow === 'undefined') {
    delete globalThis.window
  } else {
    globalThis.window = originalWindow
  }
}
