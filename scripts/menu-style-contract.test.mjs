import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const menuCss = readFileSync(new URL('../src/components/menu.css', import.meta.url), 'utf8')
const menuSource = readFileSync(new URL('../src/components/menu.tsx', import.meta.url), 'utf8')
const menuDefinitionSource = readFileSync(
  new URL('../src/docs/component-definitions/menu.tsx', import.meta.url),
  'utf8',
)
const appCss = readFileSync(new URL('../src/App.css', import.meta.url), 'utf8')
const glassSurfaceCss = readFileSync(new URL('../src/components/glass-surface.css', import.meta.url), 'utf8')
const glassSurfaceModelSource = readFileSync(
  new URL('../src/components/glass-surface-model.ts', import.meta.url),
  'utf8',
)
const tokensCss = readFileSync(new URL('../src/styles/tokens.css', import.meta.url), 'utf8')
const registry = JSON.parse(readFileSync(new URL('../registry.json', import.meta.url), 'utf8'))
const styleItem = registry.items.find((item) => item.name === 'style')

function cssBlockFor(source, selector) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = source.match(new RegExp(`(?:^|\\n)\\s*${escapedSelector}\\s*\\{([^}]*)\\}`))

  assert.ok(match, `${selector} block must exist.`)

  return match[1]
}

const popupBlock = cssBlockFor(menuCss, '.weimo-menu__popup')
const positionerBlock = cssBlockFor(menuCss, '.weimo-menu__positioner')
const rootTokenBlock = cssBlockFor(tokensCss, ':root')
const darkTokenBlock = cssBlockFor(tokensCss, '.dark')
const transitionBlock = cssBlockFor(
  menuCss,
  '.weimo-menu__popup[data-starting-style],\n  .weimo-menu__popup[data-ending-style]',
)
const menuPreviewBlock = cssBlockFor(appCss, '.menu-preview')
const menuPreviewScenarioBlock = cssBlockFor(appCss, '.menu-preview__scenario')
const menuPreviewMenuAnchorBlock = cssBlockFor(appCss, '.menu-preview__menu-anchor')
const menuPreviewLightBlock = cssBlockFor(
  appCss,
  '.menu-preview__scenario[data-tone="light"]',
)
const menuPreviewDarkBlock = cssBlockFor(
  appCss,
  '.menu-preview__scenario[data-tone="dark"]',
)
const menuPreviewStageBlock = cssBlockFor(appCss, ".preview-stage[data-component-id='menu']")
const itemBlock = cssBlockFor(menuCss, '.weimo-menu__item')
const menuPopupLightToneBlock = cssBlockFor(menuCss, '.weimo-menu__popup[data-background-tone="light"]')
const menuPopupDarkToneBlock = cssBlockFor(menuCss, '.weimo-menu__popup[data-background-tone="dark"]')
const itemHoverBlock = cssBlockFor(
  menuCss,
  '.weimo-menu__item[data-highlighted],\n  .weimo-menu__item:hover',
)
const itemIconBlock = cssBlockFor(menuCss, '.weimo-menu__item > svg,\n  .weimo-menu__item-content > svg')
const insetItemBlock = cssBlockFor(menuCss, '.weimo-menu__item--inset')
const separatorBlock = cssBlockFor(menuCss, '.weimo-menu__separator')
const glassSurfaceBlock = cssBlockFor(glassSurfaceCss, '.glass-surface')

assert.ok(
  menuSource.includes("from './glass-surface'") &&
    menuSource.includes("getGlassSurfaceClassName('weimo-menu__popup', className)") &&
    menuSource.includes('useGlassSurfaceBackgroundToneRef<HTMLDivElement>(true)') &&
    menuSource.includes('data-background-tone={backgroundTone ?? undefined}') &&
    menuSource.includes('ref={setElementRef}') &&
    !menuSource.includes('elevation') &&
    !glassSurfaceModelSource.includes('GlassSurfaceElevation') &&
    !glassSurfaceModelSource.includes('getGlassSurfaceAttributes'),
  'Menu popup must compose and sample the shared GlassSurface material with a callback ref that observes delayed Base UI popup mounts.',
)
assert.ok(
  !popupBlock.includes('color: var(--color-text-primary);') &&
    !itemBlock.includes('color: var(--color-text-primary);') &&
    itemBlock.includes('color: inherit;'),
  'Menu popup and regular items must inherit GlassSurface foreground instead of overriding it with theme text tokens.',
)
assert.ok(!glassSurfaceBlock.includes('background: var(--glass-gradient);'), 'GlassSurface must not use the Weimo glass gradient.')
assert.ok(!glassSurfaceBlock.includes('linear-gradient'), 'GlassSurface must not use a gradient background.')
assert.ok(
  glassSurfaceBlock.includes('border: 1px solid var(--glass-surface-border);'),
  'GlassSurface must use its background-aware border token.',
)
assert.ok(!glassSurfaceCss.includes('box-shadow:'), 'GlassSurface must not use inner or outer shadow effects.')
assert.ok(!glassSurfaceCss.includes('--glass-shadow'), 'GlassSurface must not depend on glass shadow tokens.')
assert.ok(menuSource.includes('className="weimo-menu__positioner"'), 'Menu positioner must expose a stable class for layer styling.')
assert.ok(menuSource.includes('data-slot="menu-positioner"'), 'Menu positioner must expose a stable data-slot for diagnostics.')
assert.ok(positionerBlock.includes('z-index: 90;'), 'Menu positioner must render above dialogs, fixed sidebars, and drawers.')
assert.ok(glassSurfaceBlock.includes('backdrop-filter: blur(var(--glass-blur));'), 'GlassSurface must use backdrop blur.')
assert.ok(glassSurfaceBlock.includes('-webkit-backdrop-filter: blur(var(--glass-blur));'), 'GlassSurface must include the WebKit backdrop filter.')
assert.ok(popupBlock.includes('transform-origin: var(--transform-origin, top right);'), 'Menu popup must use Base UI transform origin with a skyline fallback.')
assert.ok(popupBlock.includes('cubic-bezier(0.34, 1.56, 0.64, 1)'), 'Menu popup must use the skyline spring enter curve.')
assert.ok(transitionBlock.includes('transform: scale(0.7);'), 'Menu popup must start and end from skyline scale(0.7).')
assert.ok(menuCss.includes('cubic-bezier(0.4, 0, 1, 1)'), 'Menu popup must use the skyline exit curve.')
assert.ok(
  menuDefinitionSource.includes("import { useRef } from 'react'") &&
    menuDefinitionSource.includes('const MENU_PREVIEW_SCENARIOS = [') &&
    menuDefinitionSource.includes("tone: 'light'") &&
    menuDefinitionSource.includes("tone: 'dark'") &&
    !menuDefinitionSource.includes("tone: 'mixed'") &&
    !menuDefinitionSource.includes("label: '混合背景'") &&
    menuDefinitionSource.includes('MENU_PREVIEW_SCENARIOS.map') &&
    menuDefinitionSource.includes('className="menu-preview__menu-anchor"') &&
    menuDefinitionSource.includes('rootProps={{ defaultOpen: true, modal: false }}') &&
    menuDefinitionSource.includes('render: <GhostIconButton aria-label="更多操作" size="sm" />'),
  'Menu detail preview must render open ActionMenu diagnostics with a locally offset trigger in each background scenario.',
)
assert.ok(
  menuPreviewBlock.includes('grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));') &&
    menuPreviewScenarioBlock.includes('min-height: 340px;') &&
    menuPreviewScenarioBlock.includes('position: relative;') &&
    menuPreviewScenarioBlock.includes('padding: 54px 18px 22px;') &&
    menuPreviewMenuAnchorBlock.includes('transform: translate(60px, -45px);') &&
    !menuPreviewMenuAnchorBlock.includes('position: absolute;') &&
    !menuPreviewMenuAnchorBlock.includes('inset-block-start') &&
    !menuPreviewMenuAnchorBlock.includes('inset-inline-end') &&
    menuPreviewLightBlock.includes('background: #f8fafc;') &&
    menuPreviewDarkBlock.includes('background: #111827;') &&
    !appCss.includes('.menu-preview__scenario[data-tone="mixed"]') &&
    menuPreviewStageBlock.includes('min-height: 520px;'),
  'Menu detail preview stage must keep only the light and dark background examples while offsetting only the trigger by 60px horizontally and 45px upward.',
)
assert.ok(itemBlock.includes('min-height: 38px;'), 'Menu items must keep skyline-like dense row height.')
assert.ok(itemIconBlock.includes('width: 16px;'), 'Menu item and submenu trigger icons must share the same 16px width.')
assert.ok(itemIconBlock.includes('height: 16px;'), 'Menu item and submenu trigger icons must share the same 16px height.')
assert.ok(
  insetItemBlock.includes('padding-left: 38px;'),
  'Inset menu items must align text with icon-bearing sibling item labels.',
)
assert.ok(
  popupBlock.includes(
    '--weimo-menu-item-hover-bg: color-mix(in srgb, var(--glass-surface-fg) 12%, transparent);',
  ) &&
    itemHoverBlock.includes('background: var(--weimo-menu-item-hover-bg);') &&
    !itemHoverBlock.includes('background: var(--color-bg-hover);'),
  'Menu item hover/focus must derive its background from the sampled GlassSurface foreground instead of the global theme hover token.',
)
assert.ok(
  popupBlock.includes('--weimo-menu-separator-bg: var(--color-border-divider-menu);') &&
    menuPopupLightToneBlock.includes('--weimo-menu-separator-bg: var(--color-border-divider-menu-on-light);') &&
    menuPopupDarkToneBlock.includes('--weimo-menu-separator-bg: var(--color-border-divider-menu-on-dark);') &&
    separatorBlock.includes('background: var(--weimo-menu-separator-bg);') &&
    !separatorBlock.includes('var(--glass-surface-border)') &&
    !separatorBlock.includes('var(--color-border-divider)'),
  'Menu separator must use its own background-aware divider token family instead of GlassSurface border or the global divider token.',
)
assert.ok(menuCss.includes('var(--color-text-danger)'), 'Menu destructive state must use the shared danger token.')
assert.ok(tokensCss.includes('--color-text-danger: hsl(4.2 76.5% 40%);'), 'Light theme must define --color-text-danger.')
assert.ok(tokensCss.includes('--color-text-danger: hsl(7.2 100% 73.9%);'), 'Dark theme must define --color-text-danger.')
assert.ok(tokensCss.includes('--size-sidebar-width: 290px;'), 'Shared tokens must define a 290px sidebar width.')
assert.ok(
  rootTokenBlock.includes('--border: 0 0% 80%;') &&
    rootTokenBlock.includes('--color-border-divider: hsl(0 0% 88%);') &&
    rootTokenBlock.includes('--color-border: hsl(0 0% 90%);') &&
    rootTokenBlock.includes('--color-border-emphasis: hsl(0 0% 68%);') &&
    rootTokenBlock.includes('--color-border-accent: hsl(0 0% 35%);'),
  'Light theme must use distinct concrete border values for divider, normal, emphasis, and accent levels.',
)
assert.ok(
  darkTokenBlock.includes('--border: 0 0% 38%;') &&
    darkTokenBlock.includes('--color-border-divider: hsl(0 0% 28%);') &&
    darkTokenBlock.includes('--color-border: hsl(0 0% 20%);') &&
    darkTokenBlock.includes('--color-border-emphasis: hsl(0 0% 50%);') &&
    darkTokenBlock.includes('--color-border-accent: hsl(0 0% 75%);'),
  'Dark theme must use distinct concrete border values for divider, normal, emphasis, and accent levels.',
)
assert.equal(styleItem.cssVars.light['color-text-danger'], 'hsl(4.2 76.5% 40%)', 'Registry light style must include --color-text-danger.')
assert.equal(styleItem.cssVars.dark['color-text-danger'], 'hsl(7.2 100% 73.9%)', 'Registry dark style must include --color-text-danger.')
assert.equal(styleItem.cssVars.light.border, '0 0% 80%', 'Registry light style must export the default border step.')
assert.equal(styleItem.cssVars.light['color-border-divider'], 'hsl(0 0% 88%)', 'Registry light style must export the divider border lightness step.')
assert.equal(styleItem.cssVars.light['color-border-divider-menu'], 'hsl(0 0% 88%)', 'Registry light style must export the menu divider token.')
assert.equal(styleItem.cssVars.light['color-border-divider-menu-on-light'], 'hsl(0 0% 88%)', 'Registry light style must export the menu divider light-background token.')
assert.equal(styleItem.cssVars.light['color-border-divider-menu-on-dark'], 'hsl(0 0% 28%)', 'Registry light style must export the menu divider dark-background token.')
assert.equal(styleItem.cssVars.theme['color-border'], 'hsl(0 0% 90%)', 'Registry theme style must export a concrete default border token value.')
assert.equal(styleItem.cssVars.light['color-border'], 'hsl(0 0% 90%)', 'Registry light style must export the default border token value.')
assert.equal(styleItem.cssVars.light['color-border-emphasis'], 'hsl(0 0% 68%)', 'Registry light style must export the emphasis border lightness step.')
assert.equal(styleItem.cssVars.light['color-border-accent'], 'hsl(0 0% 35%)', 'Registry light style must export the accent border token value.')
assert.equal(styleItem.cssVars.dark.border, '0 0% 38%', 'Registry dark style must export the default border step.')
assert.equal(styleItem.cssVars.dark['color-border-divider'], 'hsl(0 0% 28%)', 'Registry dark style must export the divider border lightness step.')
assert.equal(styleItem.cssVars.dark['color-border-divider-menu'], 'hsl(0 0% 28%)', 'Registry dark style must export the menu divider token.')
assert.equal(styleItem.cssVars.dark['color-border-divider-menu-on-light'], 'hsl(0 0% 88%)', 'Registry dark style must export the menu divider light-background token.')
assert.equal(styleItem.cssVars.dark['color-border-divider-menu-on-dark'], 'hsl(0 0% 28%)', 'Registry dark style must export the menu divider dark-background token.')
assert.equal(styleItem.cssVars.dark['color-border'], 'hsl(0 0% 20%)', 'Registry dark style must export the default border token value.')
assert.equal(styleItem.cssVars.dark['color-border-emphasis'], 'hsl(0 0% 50%)', 'Registry dark style must export the emphasis border lightness step.')
assert.equal(styleItem.cssVars.dark['color-border-accent'], 'hsl(0 0% 75%)', 'Registry dark style must export the accent border token value.')
